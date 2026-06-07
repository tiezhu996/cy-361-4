import { localFeatures, localKpis, operationRecords } from "../data/workbench";
import type { OverviewResponse, ReservationStatus, ViolationType } from "../types";
import { APP_CODE, APP_NAME } from "../constants/app";

export function createFallbackOverview(): OverviewResponse {
  return {
    appName: APP_NAME,
    appCode: APP_CODE,
    description: "面向高校和科研院所，提供实验设备的在线预约、使用记录追踪、维护计划管理和权限分级控制，解决设备闲置与争抢并存的矛盾。",
    features: localFeatures,
    kpis: localKpis,
    records: operationRecords,
    stats: {
      equipmentCount: 10,
      userCount: 4,
      todayReservations: 0,
      todayCompleted: 0,
      todayPending: 0,
      todayCheckedIn: 0,
      totalViolations: 0,
    },
    upcomingReservations: [],
    recentViolations: [],
  };
}
