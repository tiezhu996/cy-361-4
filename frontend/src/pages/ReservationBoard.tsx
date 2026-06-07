import { useState, useEffect } from "react";
import {
  Layout,
  Typography,
  Card,
  Row,
  Col,
  Select,
  DatePicker,
  Button,
  Tag,
  Space,
  List,
  Avatar,
  Empty,
  Spin,
  message,
  Tooltip,
} from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  SafetyOutlined,
  PlusOutlined,
  QrcodeOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { fetchEquipments, fetchEquipmentCategories, fetchAvailableSlots, fetchReservations } from "../api/client";
import type { Equipment, TimeSlot, Reservation, ReservationStatus as ReservationStatusEnum } from "../types";
import { APP_THEME } from "../constants/app";
import { ReservationModal } from "../components/ReservationModal";

const { Title, Text } = Typography;
const { Content } = Layout;
const { Option } = Select;
const { RangePicker } = DatePicker;

const statusColors: Record<string, string> = {
  available: "success",
  maintenance: "warning",
  unavailable: "error",
};

const statusText: Record<string, string> = {
  available: "可用",
  maintenance: "维护中",
  unavailable: "不可用",
};

const reservationStatusColors: Record<ReservationStatusEnum, string> = {
  pending: "gold",
  checked_in: "processing",
  completed: "success",
  cancelled: "default",
  violated: "error",
};

const reservationStatusText: Record<ReservationStatusEnum, string> = {
  pending: "待签到",
  checked_in: "使用中",
  completed: "已完成",
  cancelled: "已取消",
  violated: "已违约",
};

interface CurrentUser {
  id: number;
  name: string;
  isCertified: boolean;
}

const MOCK_CURRENT_USER: CurrentUser = {
  id: 1,
  name: "张三",
  isCertified: true,
};

export default function ReservationBoard() {
  const navigate = useNavigate();
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [myReservations, setMyReservations] = useState<Reservation[]>([]);
  const [currentUser] = useState<CurrentUser>(MOCK_CURRENT_USER);

  useEffect(() => {
    loadCategories();
    loadEquipments();
    loadMyReservations();
  }, []);

  useEffect(() => {
    loadEquipments(selectedCategory);
  }, [selectedCategory]);

  useEffect(() => {
    if (selectedEquipment) {
      loadSlots(selectedEquipment.id, selectedDate.format("YYYY-MM-DD"));
    }
  }, [selectedEquipment, selectedDate]);

  async function loadCategories() {
    try {
      const data = await fetchEquipmentCategories();
      setCategories(data);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  }

  async function loadEquipments(category?: string) {
    setLoading(true);
    try {
      const data = await fetchEquipments(category);
      setEquipments(data);
      if (data.length > 0 && !selectedEquipment) {
        setSelectedEquipment(data[0]);
      }
    } catch (error) {
      message.error("加载设备列表失败");
    } finally {
      setLoading(false);
    }
  }

  async function loadSlots(equipmentId: number, date: string) {
    try {
      const data = await fetchAvailableSlots(equipmentId, date);
      setSlots(data);
    } catch (error) {
      console.error("Failed to load slots:", error);
      setSlots([]);
    }
  }

  async function loadMyReservations() {
    try {
      const data = await fetchReservations({ userId: currentUser.id });
      setMyReservations(data);
    } catch (error) {
      console.error("Failed to load my reservations:", error);
    }
  }

  function handleEquipmentClick(equipment: Equipment) {
    setSelectedEquipment(equipment);
    setSelectedSlot(null);
    setSelectedTimeRange(null);
  }

  function handleSlotClick(slot: TimeSlot) {
    if (!slot.available) {
      message.warning("该时段已被预约");
      return;
    }
    setSelectedSlot(slot);
    const start = dayjs(`${selectedDate.format("YYYY-MM-DD")} ${slot.start}`);
    const end = dayjs(`${selectedDate.format("YYYY-MM-DD")} ${slot.end}`);
    setSelectedTimeRange([start, end]);
  }

  function handleTimeRangeChange(dates: [Dayjs | null, Dayjs | null] | null) {
    if (dates && dates[0] && dates[1]) {
      setSelectedTimeRange([dates[0], dates[1]]);
      setSelectedSlot(null);
    } else {
      setSelectedTimeRange(null);
    }
  }

  function handleReserve() {
    if (!selectedEquipment) {
      message.warning("请先选择设备");
      return;
    }
    if (!selectedTimeRange) {
      message.warning("请选择预约时段");
      return;
    }
    if (selectedEquipment.requiresCertification && !currentUser.isCertified) {
      message.error("您尚未取得该设备的使用资质，请先完成培训认证");
      return;
    }
    setModalVisible(true);
  }

  function handleReservationSuccess() {
    setModalVisible(false);
    setSelectedSlot(null);
    setSelectedTimeRange(null);
    loadMyReservations();
    if (selectedEquipment) {
      loadSlots(selectedEquipment.id, selectedDate.format("YYYY-MM-DD"));
    }
  }

  function handleViewQrCode(reservation: Reservation) {
    navigate(`/checkin?token=${reservation.qrCodeToken}`);
  }

  const disabledHours = () => {
    const hours: number[] = [];
    for (let i = 0; i < 8; i++) hours.push(i);
    for (let i = 22; i < 24; i++) hours.push(i);
    return hours;
  };

  return (
    <Layout className="app-shell" style={{ minHeight: "100vh" }}>
      <Content className="workspace" style={{ padding: "24px" }}>
        <div style={{ marginBottom: "24px" }}>
          <Space>
            <Title level={2} style={{ margin: 0 }}>
              预约看板
            </Title>
            <Tag color="blue">当前用户：{currentUser.name}</Tag>
            {currentUser.isCertified ? (
              <Tag color="success">已认证</Tag>
            ) : (
              <Tag color="warning">未认证</Tag>
            )}
          </Space>
          <Text type="secondary" style={{ marginTop: "8px", display: "block" }}>
            选择设备和时段进行预约，预约成功后请在开始时间前15分钟内扫码签到
          </Text>
        </div>

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Card
              title={
                <Space>
                  <span>设备列表</span>
                  <Select
                    placeholder="筛选分类"
                    allowClear
                    style={{ width: 160 }}
                    value={selectedCategory}
                    onChange={setSelectedCategory}
                  >
                    {categories.map((cat) => (
                      <Option key={cat} value={cat}>
                        {cat}
                      </Option>
                    ))}
                  </Select>
                </Space>
              }
              loading={loading}
              style={{ marginBottom: "24px" }}
            >
              <Row gutter={[16, 16]}>
                {equipments.length === 0 ? (
                  <Col span={24}>
                    <Empty description="暂无设备" />
                  </Col>
                ) : (
                  equipments.map((equipment) => (
                    <Col xs={24} sm={12} xl={8} key={equipment.id}>
                      <Card
                        hoverable
                        onClick={() => handleEquipmentClick(equipment)}
                        style={{
                          borderColor:
                            selectedEquipment?.id === equipment.id
                              ? APP_THEME.accent
                              : undefined,
                          borderWidth: selectedEquipment?.id === equipment.id ? 2 : 1,
                        }}
                        bodyStyle={{ padding: "16px" }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                          <div>
                            <Text strong style={{ fontSize: "16px" }}>
                              {equipment.name}
                            </Text>
                            <div style={{ marginTop: "4px" }}>
                              <Tag color={statusColors[equipment.status]}>
                                {statusText[equipment.status]}
                              </Tag>
                              {equipment.requiresCertification && (
                                <Tooltip title="需要使用资质">
                                  <Tag icon={<SafetyOutlined />} color="warning">
                                    需认证
                                  </Tag>
                                </Tooltip>
                              )}
                            </div>
                          </div>
                          <Avatar
                            size="large"
                            style={{ backgroundColor: APP_THEME.accent }}
                          >
                            {equipment.name.charAt(0)}
                          </Avatar>
                        </div>
                        <div style={{ fontSize: "13px", color: "#666" }}>
                          <div style={{ marginBottom: "4px" }}>
                            <EnvironmentOutlined style={{ marginRight: "4px" }} />
                            {equipment.location || "位置未设置"}
                          </div>
                          <div style={{ marginBottom: "4px" }}>
                            <ClockCircleOutlined style={{ marginRight: "4px" }} />
                            最小 {equipment.minReserveMinutes} 分钟 / 最大 {equipment.maxReserveHours} 小时
                          </div>
                          {equipment.model && (
                            <div>
                              <CalendarOutlined style={{ marginRight: "4px" }} />
                              {equipment.model}
                            </div>
                          )}
                        </div>
                      </Card>
                    </Col>
                  ))
                )}
              </Row>
            </Card>

            {selectedEquipment && (
              <Card
                title={
                  <Space>
                    <span>{selectedEquipment.name} - 可预约时段</span>
                    <DatePicker
                      value={selectedDate}
                      onChange={setSelectedDate}
                      disabledDate={(current) => current && current < dayjs().startOf("day")}
                    />
                  </Space>
                }
                extra={
                  <Space>
                    <RangePicker
                      showTime={{
                        hideDisabledOptions: true,
                        defaultValue: [dayjs("08:00", "HH:mm"), dayjs("09:00", "HH:mm")],
                        minuteStep: (selectedEquipment.minReserveMinutes as 1 | 5 | 10 | 15 | 20 | 30),
                      }}
                      value={selectedTimeRange}
                      onChange={handleTimeRangeChange as any}
                      disabledDate={(current) => current && current < dayjs().startOf("day")}
                      disabledHours={disabledHours}
                      format="YYYY-MM-DD HH:mm"
                    />
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleReserve}>
                      预约
                    </Button>
                  </Space>
                }
              >
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {slots.length === 0 ? (
                    <Empty description="暂无可用时段" />
                  ) : (
                    slots.map((slot, index) => (
                      <Button
                        key={index}
                        type={selectedSlot?.start === slot.start ? "primary" : "default"}
                        disabled={!slot.available}
                        onClick={() => handleSlotClick(slot)}
                        style={{ minWidth: "100px" }}
                      >
                        {slot.start} - {slot.end}
                      </Button>
                    ))
                  )}
                </div>
              </Card>
            )}
          </Col>

          <Col xs={24} lg={8}>
            <Card
              title="我的预约"
              extra={
                <Button type="link" onClick={loadMyReservations}>
                  刷新
                </Button>
              }
            >
              <List
                dataSource={myReservations}
                locale={{ emptyText: "暂无预约记录" }}
                renderItem={(item) => (
                  <List.Item
                    actions={[
                      item.status === "pending" && (
                        <Button
                          type="link"
                          icon={<QrcodeOutlined />}
                          onClick={() => handleViewQrCode(item)}
                        >
                          签到码
                        </Button>
                      ),
                    ].filter(Boolean)}
                  >
                    <List.Item.Meta
                      title={
                        <Space>
                          <span>{item.equipment?.name}</span>
                          <Tag color={reservationStatusColors[item.status]}>
                            {reservationStatusText[item.status]}
                          </Tag>
                        </Space>
                      }
                      description={
                        <div>
                          <div>
                            {dayjs(item.startTime).format("YYYY-MM-DD HH:mm")} -{" "}
                            {dayjs(item.endTime).format("HH:mm")}
                          </div>
                          {item.actualDurationMinutes && (
                            <div style={{ color: "#666", fontSize: "12px" }}>
                              实际使用：{item.actualDurationMinutes} 分钟
                            </div>
                          )}
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      </Content>

      {selectedEquipment && selectedTimeRange && (
        <ReservationModal
          visible={modalVisible}
          equipment={selectedEquipment}
          timeRange={selectedTimeRange}
          userId={currentUser.id}
          onCancel={() => setModalVisible(false)}
          onSuccess={handleReservationSuccess}
        />
      )}
    </Layout>
  );
}
