import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ClientConfigService } from "src/bot/config/client-config.service";
import { Daily } from "src/bot/models/daily.entity";
import { User } from "src/bot/models/user.entity";
import { Repository } from "typeorm";
import { UtilsService } from "../utils.service";

@Injectable()
export class UserNotDailyService {
  constructor(
    private readonly utilsService: UtilsService,
    @InjectRepository(User)
    private userReposistory: Repository<User>,
    @InjectRepository(Daily)
    private dailyReposistory: Repository<Daily>,
    private clientConfigService: ClientConfigService
  ) {}

  async getUserNotDaily(date, message, args, client) {
    try {
      let wfhGetApi;
      try {
        const url = date
          ? `${
              this.clientConfigService.wfh.api_url
            }?date=${date.toDateString()}`
          : this.clientConfigService.wfh.api_url;
        wfhGetApi = await axios.get(url, {
          headers: {
            securitycode: process.env.WFH_API_KEY_SECRET,
          },
        });
      } catch (error) {
        console.log(error);
      }

      if (!wfhGetApi || wfhGetApi.data == undefined) {
        return;
      }

      const wfhUserEmail = wfhGetApi.data.result.map((item) =>
        this.utilsService.getUserNameByEmail(item.emailAddress)
      );

      // if no wfh
      if (
        (Array.isArray(wfhUserEmail) && wfhUserEmail.length === 0) ||
        !wfhUserEmail
      ) {
        return;
      }

      const { userOffFullday } = await getUserOffWork(date);
      const userOff = [...wfhUserEmail, ...userOffFullday];
      const userNotWFH = await this.userReposistory
        .createQueryBuilder()
        .where("roles_discord = :roles_discord", {
          roles_discord: ["INTERN"],
        })
        .orWhere("roles_discord = :roles_discord", {
          roles_discord: ["INTERN"],
        })
        .andWhere('"email" IN (:...userOff)', {
          userOff: userOff,
        })
        .andWhere(`"deactive" IS NOT TRUE`)
        .select(".*")
        .execute();

      const userEmail = userNotWFH.map((item) => item.email);

      const dailyMorning = await this.dailyReposistory
        .createQueryBuilder()
        .where(`"createdAt" >= :gtecreatedAt`, {
          gtecreatedAt: this.utilsService.getDateDay(date).morning.lastime,
        })
        .andWhere(`"createdAt" >= :ltecreatedAt`, {
          ltecreatedAt: this.utilsService.getDateDay(date).morning.fisttime,
        })
        .select(".*")
        .execute();

      const dailyAfternoon = await this.dailyReposistory
        .createQueryBuilder()
        .where(`"createdAt" >= :gtecreatedAt`, {
          gtecreatedAt: this.utilsService.getDateDay(date).afternoon.lastime,
        })
        .andWhere(`"createdAt" >= :ltecreatedAt`, {
          ltecreatedAt: this.utilsService.getDateDay(date).afternoon.fisttime,
        })
        .select("*")
        .execute();

      const dailyFullday = await this.dailyReposistory
        .createQueryBuilder()
        .where(`"createdAt" >= :gtecreatedAt`, {
          gtecreatedAt: this.utilsService.getDateDay(date).fullday.lastime,
        })
        .andWhere(`"createdAt" >= :ltecreatedAt`, {
          ltecreatedAt: this.utilsService.getDateDay(date).fullday.fisttime,
        })
        .select(".*")
        .execute();

      const dailyEmailMorning = dailyMorning.map((item) => item.email);
      const dailyEmailAfternoon = dailyAfternoon.map((item) => item.email);
      const dailyEmailFullday = dailyFullday.map((item) => item.email);

      const notDailyMorning = [];
      for (const wfhData of wfhUserEmail) {
        if (!dailyEmailMorning.includes(wfhData) && wfhData !== undefined) {
          notDailyMorning.push(wfhData);
        }
      }
      const notDailyAfternoon = [];
      for (const wfhData of wfhUserEmail) {
        if (!dailyEmailAfternoon.includes(wfhData) && wfhData !== undefined) {
          notDailyAfternoon.push(wfhData);
        }
      }
      const notDailyFullday = [];
      for (const userNotWFHData of userEmail) {
        if (
          !dailyEmailFullday.includes(userNotWFHData) &&
          userNotWFHData !== undefined
        ) {
          notDailyFullday.push(userNotWFHData);
        }
      }

      const spreadNotDaily = [
        ...notDailyMorning,
        ...notDailyAfternoon,
        ...notDailyFullday,
      ];
      // => notDaily : {email : "", countnotdaily : }
      const notDaily = spreadNotDaily.reduce((acc, cur) => {
        if (Array.isArray(acc) && acc.length === 0) {
          acc.push({ email: cur, countnotdaily: 1 });
        } else {
          const indexExist = acc.findIndex((item) => item.email === cur);
          if (indexExist !== -1) {
            acc[indexExist] = {
              email: acc[indexExist].email,
              countnotdaily: acc[indexExist].countnotdaily + 1,
            };
          } else {
            acc.push({ email: cur, countnotdaily: 1 });
          }
        }
        return acc;
      }, []);

      let userNotDaily;
      try {
        userNotDaily = await Promise.all(
          notDaily.map((user) =>
            this.userReposistory
              .createQueryBuilder()
              .where("email = :email", {
                email: user.email,
              })
              .orWhere("email = :email", {
                email: user.email,
              })
              .andWhere(`"deactive" IS NOT TRUE`)
              .select(".*")
              .execute()
          )
        );
      } catch (error) {
        console.log(error);
      }

      for (let i = 0; i < userNotDaily.length; i++) {
        if (userNotDaily[i] === null) {
          userNotDaily[i] = notDaily[i];
        }
      }
      return { notDaily, userNotDaily, notDailyMorning, notDailyFullday, notDailyAfternoon };
    } catch (error) {
      console.log(error);
    }
  }
}
