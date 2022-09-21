import { Injectable, Logger } from "@nestjs/common";
import { InjectDiscordClient } from "@discord-nestjs/core";
import { CronExpression, SchedulerRegistry } from "@nestjs/schedule";
import { Client } from "discord.js";
import { CronJob } from "cron";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { TimeVoiceAlone } from "src/bot/models/timeVoiceAlone.entity";
import { VoiceChannels } from "src/bot/models/voiceChannel.entity";
import { UtilsService } from "src/bot/utils/utils.service";

@Injectable()
export class VoiceChannelSchedulerService {
  constructor(
    private utilsService: UtilsService,
    @InjectRepository(TimeVoiceAlone)
    private timeVoiceAloneReposistory: Repository<TimeVoiceAlone>,
    @InjectRepository(VoiceChannels)
    private voiceChannelReposistory: Repository<VoiceChannels>,
    private schedulerRegistry: SchedulerRegistry,
    @InjectDiscordClient()
    private client: Client
  ) {}

  private readonly logger = new Logger(VoiceChannelSchedulerService.name);

  addCronJob(name: string, time: string, callback: () => void): void {
    const job = new CronJob(time, () => {
      this.logger.warn(`time (${time}) for job ${name} to run!`);
      callback();
    });

    this.schedulerRegistry.addCronJob(name, job);
    job.start();

    this.logger.warn(`job ${name} added for each minute at ${time} seconds!`);
  }

  // Start cron job
  startCronJobs(): void {
    this.addCronJob("kickMemberVoiceChannel", CronExpression.EVERY_MINUTE, () =>
      this.kickMemberVoiceChannel(this.client)
    );
    this.addCronJob("renameVoiceChannel", CronExpression.EVERY_MINUTE, () =>
      this.renameVoiceChannel(this.client)
    );
  }

  async kickMemberVoiceChannel(client) {
    if (await this.utilsService.checkHoliday()) return;
    let guild = client.guilds.fetch("921239248991055882");
    const getAllVoice = client.channels.cache.filter(
      (guild) =>
        guild.type === "GUILD_VOICE" && guild.parentId === "921239248991055884"
    );
    const voiceChannel = getAllVoice.map((item) => item.id);

    const timeNow = Date.now();
    let roomMap = [];
    let voiceNow = [];

    const timeVoiceAlone = await this.timeVoiceAloneReposistory
      .createQueryBuilder("timeVoicelone")
      .where('"status" IS NOT True')
      .select("timeVoicelone.*")
      .execute();

    timeVoiceAlone.map(async (item) => {
      voiceNow.push(item.channelId);
      if (timeNow - item.start_time >= 600000) {
        const fetchVoiceNcc8 = await client.channels.fetch(item.channelId);
        if (fetchVoiceNcc8.members.first) {
          const target = fetchVoiceNcc8.members.first();
          if (target && target.voice)
            target.voice.disconnect().catch(console.error);
        }

        await this.timeVoiceAloneReposistory.update(
          { channelId: item.channelId },
          { status: true }
        );
      }
    });

    const newList = voiceChannel.map(async (voice, index) => {
      const userDiscord = await client.channels.fetch(voice);
      if (userDiscord.members.size === 0 || userDiscord.members.size > 1) {
        await this.timeVoiceAloneReposistory.update(
          { channelId: voice },
          { status: true }
        );
      }

      if (userDiscord.members.size === 1) {
        roomMap.push(userDiscord.id);
      }

      let roomVoice = roomMap.filter((room) => !voiceNow.includes(room));

      if (index === voiceChannel.length - 1) {
        roomVoice.map(async (item) => {
          await this.timeVoiceAloneReposistory
            .insert({
              channelId: item,
              status: false,
              start_time: timeNow,
            })
            .catch((err) => console.log(err));
        });
      }
    });
  }

  async renameVoiceChannel(client) {
    try {
      const findVoice = await this.voiceChannelReposistory
        .createQueryBuilder("voiceChannel")
        .where("status >= :status", {
          status: "start",
        })
        .andWhere("createdTimestamp >= :gtecreatedTimestamp", {
          gtecreatedTimestamp: this.utilsService.getYesterdayDate(),
        })
        .andWhere("createdTimestamp >= :ltecreatedTimestamp", {
          ltecreatedTimestamp: this.utilsService.getTomorrowDate(),
        })
        .select("voiceChannel.*")
        .execute();

      findVoice.map(async (item) => {
        const channelName = await client.channels.fetch(item.id);
        await channelName.setName(`${item.originalName}`);
        await this.voiceChannelReposistory.update(
          { id: item.id },
          { status: "finished" }
        );
      });
    } catch (error) {
      console.log(error);
    }
  }
}
