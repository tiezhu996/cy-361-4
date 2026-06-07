export const overviewData = {
  "appName": "实验室设备预约管理系统",
  "appCode": "ldequipreserve",
  "description": "面向高校和科研院所，提供实验设备的在线预约、使用记录追踪、维护计划管理和权限分级控制，解决设备闲置与争抢并存的矛盾。",
  "features": [
    {
      "id": 1,
      "title": "设备档案与分类管理",
      "description": "支持录入设备名称、型号、编号、存放位置、购置日期、使用说明文档，可上传设备图片，支持按分类（如光学仪器、电子仪器、生化设备）筛选和检索。",
      "status": "已上线",
      "metric": "88%"
    },
    {
      "id": 2,
      "title": "时段预约与资质校验",
      "description": "设备开放预约的最小单位为30分钟，用户选择日期后查看该设备当日可约时段，预约时自动校验用户资质（如是否需要培训认证），冲突时段禁止预约。",
      "status": "排期中",
      "metric": "31 单"
    },
    {
      "id": 3,
      "title": "扫码签到与违约释放",
      "description": "预约成功后生成使用二维码，使用人需在使用开始和结束时扫码签到，系统自动记录实际使用时长，超时未签到自动释放设备并标记违约。",
      "status": "巡检中",
      "metric": "10 项"
    },
    {
      "id": 4,
      "title": "设备维护计划管理",
      "description": "管理员可为设备设定定期维护周期（如每周/每月），维护时段自动从可预约池中剔除，维护完成后记录维护内容、耗材更换情况和维护人。",
      "status": "优化中",
      "metric": "4 级"
    },
    {
      "id": 5,
      "title": "利用率统计报表",
      "description": "管理员可查看设备利用率报表（按周/月/年）、高频使用人排行、设备故障率统计，支持导出Excel格式的月度使用报告。",
      "status": "可导出",
      "metric": "28 条"
    }
  ],
  "kpis": [
    {
      "label": "今日处理",
      "value": "96",
      "trend": "+12%",
      "tone": "primary"
    },
    {
      "label": "预约/订单",
      "value": "28",
      "trend": "+8%",
      "tone": "warm"
    },
    {
      "label": "履约率",
      "value": "92%",
      "trend": "+3%",
      "tone": "cool"
    },
    {
      "label": "待处理",
      "value": "5",
      "trend": "需跟进",
      "tone": "neutral"
    }
  ],
  "records": [
    {
      "key": "ldequipreserve-1",
      "name": "设备档案与分类管理",
      "owner": "运营组",
      "status": "已上线",
      "metric": "88%",
      "priority": "高"
    },
    {
      "key": "ldequipreserve-2",
      "name": "时段预约与资质校验",
      "owner": "管理员",
      "status": "排期中",
      "metric": "31 单",
      "priority": "中"
    },
    {
      "key": "ldequipreserve-3",
      "name": "扫码签到与违约释放",
      "owner": "服务台",
      "status": "巡检中",
      "metric": "10 项",
      "priority": "低"
    },
    {
      "key": "ldequipreserve-4",
      "name": "设备维护计划管理",
      "owner": "财务组",
      "status": "优化中",
      "metric": "4 级",
      "priority": "高"
    },
    {
      "key": "ldequipreserve-5",
      "name": "利用率统计报表",
      "owner": "审核组",
      "status": "可导出",
      "metric": "28 条",
      "priority": "中"
    }
  ]
};
