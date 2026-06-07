import { useState, useEffect, useCallback } from "react";
import {
  Layout,
  Card,
  Typography,
  Button,
  Tag,
  Space,
  Descriptions,
  message,
  Spin,
  Result,
  Alert,
  Divider,
} from "antd";
import { Statistic } from "antd";
const { Countdown } = Statistic;
import {
  QrcodeOutlined,
  CheckCircleOutlined,
  PlayCircleOutlined,
  StopOutlined,
  ClockCircleOutlined,
  ArrowLeftOutlined,
  EnvironmentOutlined,
  UserOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import { useSearchParams, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { fetchReservationByQr, checkin, checkout } from "../api/client";
import type { Reservation, ReservationStatus as ReservationStatusEnum } from "../types";
import { APP_THEME } from "../constants/app";

const { Title, Text, Paragraph } = Typography;
const { Content } = Layout;

const statusColors: Record<ReservationStatusEnum, string> = {
  pending: "gold",
  checked_in: "processing",
  completed: "success",
  cancelled: "default",
  violated: "error",
};

const statusText: Record<ReservationStatusEnum, string> = {
  pending: "待签到",
  checked_in: "使用中",
  completed: "已完成",
  cancelled: "已取消",
  violated: "已违约",
};

export default function CheckinPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [now, setNow] = useState(dayjs());

  useEffect(() => {
    const timer = setInterval(() => setNow(dayjs()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadReservation = useCallback(async () => {
    if (!token) {
      setError("缺少签到码参数");
      setLoading(false);
      return;
    }

    try {
      const data = await fetchReservationByQr(token);
      setReservation(data);
    } catch (err: any) {
      setError(err.message || "获取预约信息失败");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadReservation();
  }, [loadReservation]);

  async function handleCheckin() {
    if (!reservation) return;

    setActionLoading(true);
    try {
      const result = await checkin({ qrCodeToken: reservation.qrCodeToken });
      message.success("签到成功！开始计时使用");
      setReservation(result);
    } catch (err: any) {
      message.error(err.message || "签到失败");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCheckout() {
    if (!reservation) return;

    setActionLoading(true);
    try {
      const result = await checkout({ qrCodeToken: reservation.qrCodeToken });
      message.success(`签退成功！实际使用 ${result.actualDurationMinutes} 分钟`);
      setReservation(result);
    } catch (err: any) {
      message.error(err.message || "签退失败");
    } finally {
      setActionLoading(false);
    }
  }

  function getDeadlineInfo() {
    if (!reservation) return null;

    const startTime = dayjs(reservation.startTime);
    const fifteenMinutesAfter = startTime.add(15, "minute");

    if (reservation.status === "pending" && now.isAfter(fifteenMinutesAfter)) {
      return {
        type: "error" as const,
        message: "已超过预约开始时间15分钟，预约已自动取消",
      };
    }

    if (reservation.status === "pending" && now.isBefore(startTime.subtract(15, "minute"))) {
      return {
        type: "warning" as const,
        message: "距离签到开始还有一段时间，请在预约开始前15分钟内签到",
      };
    }

    if (reservation.status === "pending") {
      return {
        type: "info" as const,
        message: "请在预约开始后15分钟内完成签到，超时将自动取消并记违约",
        deadline: fifteenMinutesAfter.valueOf(),
      };
    }

    return null;
  }

  const deadlineInfo = getDeadlineInfo();

  if (loading) {
    return (
      <Layout style={{ minHeight: "100vh", background: APP_THEME.paper }}>
        <Content style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Spin size="large" />
        </Content>
      </Layout>
    );
  }

  if (error || !reservation) {
    return (
      <Layout style={{ minHeight: "100vh", background: APP_THEME.paper }}>
        <Content style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Result
            status="error"
            title="获取预约信息失败"
            subTitle={error || "请检查签到码是否正确"}
            extra={
              <Button type="primary" onClick={() => navigate("/board")}>
                返回预约看板
              </Button>
            }
          />
        </Content>
      </Layout>
    );
  }

  const startTime = dayjs(reservation.startTime);
  const endTime = dayjs(reservation.endTime);
  const fifteenMinutesAfter = startTime.add(15, "minute");

  const canCheckin =
    reservation.status === "pending" &&
    now.isAfter(startTime.subtract(15, "minute")) &&
    now.isBefore(fifteenMinutesAfter);

  const canCheckout = reservation.status === "checked_in";

  const currentDuration =
    reservation.status === "checked_in" && reservation.checkinTime
      ? Math.round(now.diff(dayjs(reservation.checkinTime), "minute"))
      : 0;

  return (
    <Layout style={{ minHeight: "100vh", background: APP_THEME.paper }}>
      <Content style={{ padding: "40px 24px", maxWidth: "800px", margin: "0 auto", width: "100%" }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/board")}
          style={{ marginBottom: "24px" }}
        >
          返回预约看板
        </Button>

        <Card
          style={{
            borderRadius: "16px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          }}
          bodyStyle={{ padding: "40px" }}
        >
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: APP_THEME.accent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <QrcodeOutlined style={{ fontSize: "40px", color: "white" }} />
            </div>
            <Title level={2} style={{ margin: "0 0 8px" }}>
              {reservation.equipment?.name}
            </Title>
            <Space size="middle">
              <Tag color={statusColors[reservation.status]} style={{ fontSize: "14px", padding: "4px 12px" }}>
                {statusText[reservation.status]}
              </Tag>
              {reservation.equipment?.requiresCertification && (
                <Tag icon={<SafetyOutlined />} color="warning">
                  需认证
                </Tag>
              )}
            </Space>
          </div>

          {deadlineInfo && (
            <Alert
              type={deadlineInfo.type}
              message={
                <Space>
                  <ClockCircleOutlined />
                  {deadlineInfo.message}
                  {deadlineInfo.deadline && (
                    <Countdown
                      value={deadlineInfo.deadline}
                      format="mm:ss"
                      style={{ fontSize: "14px", fontWeight: "bold" }}
                    />
                  )}
                </Space>
              }
              showIcon
              style={{ marginBottom: "24px" }}
            />
          )}

          <Descriptions column={1} bordered size="middle" style={{ marginBottom: "32px" }}>
            <Descriptions.Item label="预约人">
              <UserOutlined style={{ marginRight: "4px" }} />
              {reservation.user?.name || "-"}
              {reservation.user?.department && ` (${reservation.user.department})`}
            </Descriptions.Item>
            <Descriptions.Item label="存放位置">
              <EnvironmentOutlined style={{ marginRight: "4px" }} />
              {reservation.equipment?.location || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="设备型号">
              {reservation.equipment?.model || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="预约时段">
              <Space direction="vertical" size={0}>
                <Text>
                  {startTime.format("YYYY-MM-DD HH:mm")} - {endTime.format("HH:mm")}
                </Text>
                <Text type="secondary">
                  时长 {Math.round((endTime.valueOf() - startTime.valueOf()) / 60000)} 分钟
                </Text>
              </Space>
            </Descriptions.Item>
            {reservation.checkinTime && (
              <Descriptions.Item label="签到时间">
                <CheckCircleOutlined style={{ color: "#52c41a", marginRight: "4px" }} />
                {dayjs(reservation.checkinTime).format("YYYY-MM-DD HH:mm:ss")}
              </Descriptions.Item>
            )}
            {reservation.checkoutTime && (
              <Descriptions.Item label="签退时间">
                <CheckCircleOutlined style={{ color: "#52c41a", marginRight: "4px" }} />
                {dayjs(reservation.checkoutTime).format("YYYY-MM-DD HH:mm:ss")}
              </Descriptions.Item>
            )}
            {reservation.actualDurationMinutes !== undefined && (
              <Descriptions.Item label="实际使用时长">
                <Tag color="success">{reservation.actualDurationMinutes} 分钟</Tag>
              </Descriptions.Item>
            )}
            {reservation.status === "checked_in" && (
              <Descriptions.Item label="已使用时长">
                <Tag color="processing" style={{ fontSize: "16px", padding: "8px 16px" }}>
                  <PlayCircleOutlined />
                  {Math.floor(currentDuration / 60) > 0 && `${Math.floor(currentDuration / 60)}小时`}
                  {currentDuration % 60}分钟
                </Tag>
              </Descriptions.Item>
            )}
            {reservation.purpose && (
              <Descriptions.Item label="使用用途">{reservation.purpose}</Descriptions.Item>
            )}
          </Descriptions>

          <Divider />

          <div style={{ textAlign: "center" }}>
            <Space size="large" direction="vertical" style={{ width: "100%" }}>
              {reservation.status === "pending" && (
                <>
                  <Paragraph type="secondary">
                    到现场后，请点击下方按钮完成签到，系统将开始计时
                  </Paragraph>
                  <Button
                    type="primary"
                    size="large"
                    icon={<PlayCircleOutlined />}
                    onClick={handleCheckin}
                    loading={actionLoading}
                    disabled={!canCheckin}
                    style={{ minWidth: "200px", height: "48px", fontSize: "16px" }}
                  >
                    {canCheckin ? "签到开始使用" : "未到签到时间"}
                  </Button>
                  {!canCheckin && now.isBefore(startTime.subtract(15, "minute")) && (
                    <Text type="secondary">
                      可签到时间：{startTime.subtract(15, "minute").format("YYYY-MM-DD HH:mm")} 起
                    </Text>
                  )}
                </>
              )}

              {reservation.status === "checked_in" && (
                <>
                  <Paragraph type="secondary">
                    使用完成后，请点击下方按钮完成签退，系统将记录实际使用时长
                  </Paragraph>
                  <Button
                    type="primary"
                    danger
                    size="large"
                    icon={<StopOutlined />}
                    onClick={handleCheckout}
                    loading={actionLoading}
                    style={{ minWidth: "200px", height: "48px", fontSize: "16px" }}
                  >
                    签退结束使用
                  </Button>
                </>
              )}

              {reservation.status === "completed" && (
                <Result
                  status="success"
                  title="使用已完成"
                  subTitle={`感谢您的使用，实际用时 ${reservation.actualDurationMinutes} 分钟`}
                />
              )}

              {reservation.status === "violated" && (
                <Result
                  status="warning"
                  title="预约已违约"
                  subTitle="超过预约开始时间15分钟未签到，预约已自动取消并记违约"
                />
              )}

              {reservation.status === "cancelled" && (
                <Result
                  status="info"
                  title="预约已取消"
                  subTitle="该预约已被取消，如需使用请重新预约"
                />
              )}
            </Space>
          </div>
        </Card>

        <Card
          title="签到/签退说明"
          size="small"
          style={{ marginTop: "24px", borderRadius: "12px" }}
        >
          <ul style={{ margin: 0, paddingLeft: "20px", color: "#666", lineHeight: "2" }}>
            <li>请在预约开始前15分钟内到设备所在位置扫码签到</li>
            <li>超过预约开始时间15分钟未签到，预约将自动取消并记违约</li>
            <li>签到成功后系统开始计时，请合理安排使用时间</li>
            <li>使用完成后请及时签退，以便其他用户预约使用</li>
            <li>违约次数过多可能影响您的预约权限</li>
          </ul>
        </Card>
      </Content>
    </Layout>
  );
}
