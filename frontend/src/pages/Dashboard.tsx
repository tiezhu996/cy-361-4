import { useEffect, useState } from "react";
import {
  Typography,
  Tag,
  Space,
  Card,
  Row,
  Col,
  List,
  Avatar,
  Empty,
  Tooltip,
} from "antd";
import {
  DashboardOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  UserOutlined,
  ExclamationCircleOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { fetchOverview } from "../api/client";
import { REQUEST_MESSAGES } from "../constants/messages";
import { createFallbackOverview } from "../state/dashboard";
import type { OverviewResponse, ReservationStatus, ViolationType } from "../types";
import { FeatureStrip } from "../components/FeatureStrip";
import { MetricGrid } from "../components/MetricGrid";
import { OperationsTable } from "../components/OperationsTable";
import { APP_THEME } from "../constants/app";

const { Title, Text } = Typography;

const reservationStatusColors: Record<ReservationStatus, string> = {
  pending: "gold",
  checked_in: "processing",
  completed: "success",
  cancelled: "default",
  violated: "error",
};

const reservationStatusText: Record<ReservationStatus, string> = {
  pending: "待签到",
  checked_in: "使用中",
  completed: "已完成",
  cancelled: "已取消",
  violated: "已违约",
};

const violationTypeText: Record<ViolationType, string> = {
  late_checkin: "签到超时",
  no_show: "未签到",
  overtime: "使用超时",
};

const violationTypeColors: Record<ViolationType, string> = {
  late_checkin: "gold",
  no_show: "red",
  overtime: "orange",
};

export default function Dashboard() {
  const [overview, setOverview] = useState<OverviewResponse>(createFallbackOverview());
  const [notice, setNotice] = useState(REQUEST_MESSAGES.overviewFallback);

  useEffect(() => {
    fetchOverview()
      .then((payload) => {
        setOverview(payload);
        setNotice("后端服务已联通，当前展示实时接口数据。");
      })
      .catch(() => setNotice(REQUEST_MESSAGES.overviewFallback));
  }, []);

  return (
    <>
      <section className="lead-grid">
        <article className="hero-panel">
          <span className="pill">{notice}</span>
          <Title level={2} style={{ margin: "16px 0 8px" }}>
            {overview.appName}
          </Title>
          <p style={{ color: "#666", marginBottom: "16px" }}>{overview.description}</p>
          <Space wrap size="middle">
            <Tag icon={<DashboardOutlined />} color="blue">
              设备总数：{overview.stats?.equipmentCount || 0}
            </Tag>
            <Tag icon={<UserOutlined />} color="green">
              注册用户：{overview.stats?.userCount || 0}
            </Tag>
            <Tag icon={<ClockCircleOutlined />} color="cyan">
              今日预约：{overview.stats?.todayReservations || 0}
            </Tag>
            <Tag icon={<SafetyCertificateOutlined />} color="purple">
              已完成：{overview.stats?.todayCompleted || 0}
            </Tag>
            <Tag icon={<WarningOutlined />} color="red">
              累计违约：{overview.stats?.totalViolations || 0}
            </Tag>
          </Space>
        </article>
        <MetricGrid items={overview.kpis} />
      </section>

      <FeatureStrip items={overview.features} />

      <Row gutter={[24, 24]} style={{ marginBottom: "24px" }}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <ClockCircleOutlined style={{ color: APP_THEME.accent }} />
                <span>即将开始的预约</span>
              </Space>
            }
            size="small"
          >
            {overview.upcomingReservations?.length === 0 ? (
              <Empty description="暂无待开始的预约" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              <List
                dataSource={overview.upcomingReservations}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar style={{ backgroundColor: APP_THEME.accent }}>
                          {item.equipmentName?.charAt(0)}
                        </Avatar>
                      }
                      title={
                        <Space>
                          <span>{item.equipmentName}</span>
                          <Tag color={reservationStatusColors[item.status]}>
                            {reservationStatusText[item.status]}
                          </Tag>
                        </Space>
                      }
                      description={
                        <Space direction="vertical" size={0} style={{ width: "100%" }}>
                          <Text type="secondary">
                            预约人：{item.userName}
                          </Text>
                          <Text>
                            {dayjs(item.startTime).format("YYYY-MM-DD HH:mm")} -{" "}
                            {dayjs(item.endTime).format("HH:mm")}
                          </Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />
                <span>最近违约记录</span>
              </Space>
            }
            size="small"
            extra={
              <Tooltip title="超过预约开始时间15分钟未签到将自动记违约">
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  <WarningOutlined /> 违约规则
                </Text>
              </Tooltip>
            }
          >
            {overview.recentViolations?.length === 0 ? (
              <Empty description="暂无违约记录" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              <List
                dataSource={overview.recentViolations}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar style={{ backgroundColor: "#fff1f0", color: "#ff4d4f" }}>
                          <WarningOutlined />
                        </Avatar>
                      }
                      title={
                        <Space>
                          <span>{item.userName}</span>
                          <Tag color={violationTypeColors[item.type]}>
                            {violationTypeText[item.type]}
                          </Tag>
                        </Space>
                      }
                      description={
                        <Space direction="vertical" size={0} style={{ width: "100%" }}>
                          <Text type="secondary">{item.description}</Text>
                          <Text type="secondary" style={{ fontSize: "12px" }}>
                            {dayjs(item.createdAt).format("YYYY-MM-DD HH:mm")}
                          </Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
      </Row>

      <section className="work-panel">
        <Title level={3}>运营任务流</Title>
        <OperationsTable records={overview.records} />
      </section>
    </>
  );
}
