import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ScheduleModule } from "@nestjs/schedule";
import { ConfigModule } from "@nestjs/config";
import { OverviewController } from "./overview/overview.controller";
import { OverviewService } from "./overview/overview.service";
import { EquipmentController } from "./equipment/equipment.controller";
import { EquipmentService } from "./equipment/equipment.service";
import { ReservationController } from "./reservation/reservation.controller";
import { ReservationService } from "./reservation/reservation.service";
import { ViolationSchedule } from "./schedule/violation.schedule";
import { AppLogger } from "./common/app.logger";
import { envConfig } from "./config/env.config";

import { User } from "./entities/user.entity";
import { Equipment } from "./entities/equipment.entity";
import { Reservation } from "./entities/reservation.entity";
import { Violation } from "./entities/violation.entity";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: "mysql",
      host: envConfig.database.host,
      port: envConfig.database.port,
      username: envConfig.database.username,
      password: envConfig.database.password,
      database: envConfig.database.database,
      entities: [User, Equipment, Reservation, Violation],
      synchronize: false,
      logging: false,
      extra: {
        charset: "utf8mb4_unicode_ci",
      },
    }),
    TypeOrmModule.forFeature([User, Equipment, Reservation, Violation]),
    ScheduleModule.forRoot(),
  ],
  controllers: [
    OverviewController,
    EquipmentController,
    ReservationController,
  ],
  providers: [
    OverviewService,
    EquipmentService,
    ReservationService,
    ViolationSchedule,
    AppLogger,
  ],
})
export class AppModule {}
