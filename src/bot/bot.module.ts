import { DiscordModule } from "@discord-nestjs/core";
import { Module } from "@nestjs/common";
import { DiscoveryModule } from "@nestjs/core";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BotController } from "./bot.controller";
import { BotService } from "./bot.service";
import { ChecklistCommand } from "./commands/checklist.command";
import { CompantripCommand } from "./commands/companytrip/companytrip.command";


import { DailyCommand } from "./commands/daily.command";
import holidayCommand from "./commands/holiday.command";
import { MeetingCommand } from "./commands/meeting/meeting.command";
import { MeetingService } from "./commands/meeting/meeting.service";
import { RemindCommand } from "./commands/remind/remind.command";
import { UserStatusCommand } from "./commands/user_status/user_status.command";
import { UserStatusService } from "./commands/user_status/user_status.service";
import { WFHCommand } from "./commands/wfh/wfh.command";
// import { TestCommand } from "./commands/test";
// import LeaveCommand from "./commands/leave.command";
// import OrderCommand from "./commands/order.command";
import { HttpModule } from "@nestjs/axios";
import { ScheduleModule as NestjsScheduleModule } from "@nestjs/schedule";
import NotificationCommand from "./commands/ncc8/ncc8.command";
import { NotifiService } from "./commands/notification/noti.service";
import { TimeSheetCommand } from "./commands/timesheet/timesheet.command";
import { ToggleActiveCommand } from "./commands/toggleActive/toggleActive.command";
import { ToggleActiveService } from "./commands/toggleActive/toggleActive.service";
import { BotGateway } from "./events/bot.gateway";
import { Daily } from "./models/daily.entity";
import { Holiday } from "./models/holiday.entity";
import { Leave } from "./models/leave.entity";
import { Meeting } from "./models/meeting.entity";
import { Msg } from "./models/msg.entity";
import { Order } from "./models/order.entity";
import { Remind } from "./models/remind.entity";
import { User } from "./models/user.entity";
import { VoiceChannels } from "./models/voiceChannel.entity";
import { WorkFromHome } from "./models/wfh.entity";
import { MeetingSchedulerService } from "./scheduler/meeting-scheduler/meeting-scheduler.service";
import { ReminderSchedulerService } from "./scheduler/reminder-scheduler/reminder-scheduler.service";
import { SendMessageSchedulerService } from "./scheduler/send-message-scheduler/send-message-scheduler.service";
import { PlaySlashCommand } from "./slash-commands/play.slashcommand";
import { PlaylistSlashCommand } from "./slash-commands/playlist.slashcommand";
import { CheckListModule } from "./utils/checklist/checklist.module";
import { ReportTracker } from "./utils/report-tracker";
import { UtilsService } from "./utils/utils.service";
import { MulterModule } from "@nestjs/platform-express";
import { OpenTalkCommand } from "./commands/open-talk/open-talk.command";
import { OpenTalkService } from "./commands/open-talk/open-talk.service";
import { OrderCommand } from "./commands/order/order.command";
import { Opentalk } from "./models/opentalk.entity";
import { Uploadfile } from "./models/uploadFile.entity";
import { OrderService } from "./service/order.service";
import { UtilsModule } from "./utils/utils.module";
import { GemrankCommand } from "./commands/gemrank.command";
import { MoveChannelCommand } from "./commands/move_channel/move_channel.command";
import { AddEmojiCommand } from "./commands/addemoji.command";
import { HasvotedCommand } from "./commands/hasvoted.command";
import { ServerInfoCommand } from "./commands/serverinfo.command";


@Module({
  imports: [
    DiscordModule.forFeature(),
    MulterModule.register({
      dest: "./files",
    }),
    DiscoveryModule,
    TypeOrmModule.forFeature([
      Daily,
      Order,
      Leave,
      Holiday,
      User,
      Meeting,
      VoiceChannels,
      WorkFromHome,
      Msg,
      Remind,
      Opentalk,
      Uploadfile,
      Opentalk,
    ]),
    CheckListModule, 
    NestjsScheduleModule.forRoot(),
    HttpModule,
    UtilsModule,
  ],
  providers: [
    PlaySlashCommand,
    PlaylistSlashCommand,
    ChecklistCommand,
    CompantripCommand,
    BotGateway,
    DailyCommand,
    MeetingCommand,
    holidayCommand,
    
    AddEmojiCommand,
    HasvotedCommand,
    WFHCommand,
    RemindCommand,
    UserStatusCommand,
    UserStatusService,
    BotService,
    UtilsService,
    ReportTracker,
    ServerInfoCommand,
    TimeSheetCommand,
    OpenTalkCommand,
    OpenTalkService,
    MeetingSchedulerService,
    ReminderSchedulerService,
    SendMessageSchedulerService,
    MeetingService,
    ToggleActiveCommand,
    ToggleActiveService,
    NotifiService,
    NotificationCommand,
    OrderCommand,
    OrderService,
  ],
  controllers: [BotController],
})
export class BotModule {}
