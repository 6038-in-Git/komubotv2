import { InjectRepository } from "@nestjs/typeorm";
import { TABLE } from "src/bot/constants/table";

import { Brackets, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { ElsaDaily } from "src/bot/models/elsaDaily.entity";

@Injectable()
export class ElsaService {
  constructor(
    @InjectRepository(ElsaDaily)
    private elsaRepository: Repository<ElsaDaily>
  ) {}
  async createElsaDailyData(
    _userid,
    _email,
    _daily,
    _createdAt,
    _attachment,
    _channelid
  ) {
    return await this.elsaRepository
      .createQueryBuilder()
      .insert()
      .into(TABLE.ELSADAILY)
      .values([
        {
          userid: _userid,
          email: _email,
          daily: _daily,
          createdAt: _createdAt,
          attachment: _attachment,
          channelid: _channelid,
        },
      ])
      .returning("*");
  }
  async addElsaDailyData(
    _userid,
    _email,
    _daily,
    _createAt,
    _attachment,
    _channelid
  ) {
    return await this.elsaRepository
      .createQueryBuilder()
      .insert()
      .into(TABLE.ELSADAILY)
      .values([
        {
          userid: _userid,
          email: _email,
          daily: _daily,
          createAt: _createAt,
          attachment: _attachment,
          channelid: _channelid,
        },
      ])
      .execute();
  }
  async findReport(_attachment, _yesterday, _tomorrow,) {
    return await this.elsaRepository
      .createQueryBuilder(TABLE.ELSADAILY)
      .where(`${TABLE.ELSADAILY}.attachment = :attachment`, {
        attachment: _attachment,
      })
      .andWhere(new Brackets((qb)=>{
        qb.where(`${TABLE.ELSADAILY}.createdAt >= :yesterday`, {yesterday : _yesterday})
        .andWhere(`${TABLE.ELSADAILY}.createdAt < :tomorrow`, {tomorrow : _tomorrow})
      }))
      .getMany();
  }
  async updateOneDaily(_userid, _createdAt, _attachment) {
    return await this.elsaRepository
      .createQueryBuilder()
      .update(TABLE.ELSADAILY)
      .set({ attachment: _attachment })
      .where("userid = :userid", { userid: _userid })
      .andWhere("createdAt =:createdAt", { createdAt: _createdAt })
      .execute();
  }
}