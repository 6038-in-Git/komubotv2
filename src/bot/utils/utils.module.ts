import { DiscordModule } from "@discord-nestjs/core";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DiscoveryModule } from "@nestjs/core";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ReportCommand } from "../commands/report/report.command";
import { ClientConfigService } from "../config/client-config.service";
import { Daily } from "../models/daily.entity";
import { Holiday } from "../models/holiday.entity";
import { Opentalk } from "../models/opentalk.entity";
import { Order } from "../models/order.entity";
import { User } from "../models/user.entity";
import { WorkFromHome } from "../models/wfh.entity";
import { WomenDay } from "../models/womenDay.entity";
import { KomubotrestController } from "./komubotrest/komubotrest.controller";
import { ReportCheckoutService } from "./reportCheckout/reportCheckout.service";
import { ReportDailyModule } from "./reportDaily/report-daily.module";
import { ReportDailyService } from "./reportDaily/report-daily.service";
import { ReportHolidayModule } from "./reportHoliday/reportHoliday.module";
import { ReportHolidayService } from "./reportHoliday/reportHoliday.service";
import { ReportMentionModule } from "./reportMention/reportMention.module";
import { ReportMentionService } from "./reportMention/reportMention.service";
import { ReportOpenTalkModule } from "./reportOpentalk/reportOpentalk.module";
import { ReportOpenTalkService } from "./reportOpentalk/reportOpentalk.service";
import { ReportOrderModule } from "./reportOrder/reportOrder.module";
import { ReportOrderService } from "./reportOrder/reportOrder.service";
import { ReportWFHModule } from "./reportWFH/report-wfh.module";
import { ReportWomenDayModule } from "./reportWomenDay/reportWomenDay.module";
import { ReportWomenDayService } from "./reportWomenDay/reportWomenDay.service";
import { UtilsService } from "./utils.service";

@Module({
  imports: [
    DiscordModule.forFeature(),
    DiscoveryModule,
    TypeOrmModule.forFeature([
      Holiday,
      Opentalk,
      Order,
      Holiday,
      WorkFromHome,
      Daily,
      User,
      WomenDay,
    ]),
    ReportOrderModule,
    ReportHolidayModule,
    ReportOpenTalkModule,
    ReportWFHModule,
    ReportDailyModule,
    UtilsModule,
    ReportMentionModule,
    ReportWomenDayModule,
    HttpModule,
  ],
  providers: [
    ReportCommand,
    ReportHolidayService,
    ReportOpenTalkService,
    ReportOrderService,
    ReportDailyService,
    ReportMentionService,
    UtilsService,
    KomubotrestController,
    ReportWomenDayService,
    ReportCheckoutService,
    ClientConfigService,
    ConfigService,
  ],
})
export class UtilsModule {}
