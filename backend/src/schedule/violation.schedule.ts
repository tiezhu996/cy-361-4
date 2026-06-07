import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { ReservationService } from "../reservation/reservation.service";
import { AppLogger } from "../common/app.logger";

@Injectable()
export class ViolationSchedule {
  private readonly logger = new Logger(ViolationSchedule.name);

  constructor(
    private reservationService: ReservationService,
    private appLogger: AppLogger,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleViolationCheck() {
    try {
      const processedCount = await this.reservationService.processViolations();
      if (processedCount > 0) {
        this.appLogger.log(`自动违约检测完成，处理 ${processedCount} 条超时未签到预约`);
        this.logger.log(`Processed ${processedCount} overdue reservations`);
      }
    } catch (error) {
      const err = error as Error;
      this.appLogger.error(`自动违约检测失败: ${err.message}`, err.stack);
      this.logger.error(`Violation check failed: ${err.message}`, err.stack);
    }
  }
}
