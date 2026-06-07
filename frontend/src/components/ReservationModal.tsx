import { useState } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Tag,
  Descriptions,
  message,
  Space,
  Alert,
} from "antd";
import { SafetyOutlined, ClockCircleOutlined, EnvironmentOutlined } from "@ant-design/icons";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { createReservation } from "../api/client";
import type { Equipment, Reservation } from "../types";

interface ReservationModalProps {
  visible: boolean;
  equipment: Equipment;
  timeRange: [Dayjs, Dayjs];
  userId: number;
  onCancel: () => void;
  onSuccess: (reservation: Reservation) => void;
}

export function ReservationModal({
  visible,
  equipment,
  timeRange,
  userId,
  onCancel,
  onSuccess,
}: ReservationModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const [startTime, endTime] = timeRange;
  const durationMinutes = endTime.diff(startTime, "minute");
  const durationHours = (durationMinutes / 60).toFixed(1);

  async function handleOk() {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const result = await createReservation({
        equipmentId: equipment.id,
        userId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        purpose: values.purpose,
      });

      message.success("预约成功！请在预约开始前15分钟内扫码签到");
      onSuccess(result);
      form.resetFields();
    } catch (error: any) {
      message.error(error.message || "预约失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      title="确认预约"
      open={visible}
      onCancel={onCancel}
      width={600}
      footer={
        <Space>
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" loading={loading} onClick={handleOk}>
            确认预约
          </Button>
        </Space>
      }
    >
      <Alert
        message="预约须知"
        description={
          <ul style={{ margin: 0, paddingLeft: "20px" }}>
            <li>请在预约开始时间前15分钟内到现场扫码签到</li>
            <li>超过预约开始时间15分钟未签到，预约将自动取消并记违约</li>
            <li>使用完成后请及时扫码签退，系统将自动记录实际使用时长</li>
            <li>如需取消预约，请提前操作，避免影响他人使用</li>
          </ul>
        }
        type="info"
        showIcon
        style={{ marginBottom: "24px" }}
      />

      <Descriptions column={1} bordered size="small" style={{ marginBottom: "24px" }}>
        <Descriptions.Item label="设备名称">
          <Space>
            <span>{equipment.name}</span>
            {equipment.requiresCertification && (
              <Tag icon={<SafetyOutlined />} color="warning">
                需认证
              </Tag>
            )}
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label="设备型号">{equipment.model || "-"}</Descriptions.Item>
        <Descriptions.Item label="存放位置">
          <EnvironmentOutlined style={{ marginRight: "4px" }} />
          {equipment.location || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="预约时段">
          <ClockCircleOutlined style={{ marginRight: "4px" }} />
          {startTime.format("YYYY-MM-DD HH:mm")} - {endTime.format("HH:mm")}
        </Descriptions.Item>
        <Descriptions.Item label="预约时长">
          {durationMinutes} 分钟 ({durationHours} 小时)
        </Descriptions.Item>
        <Descriptions.Item label="时段限制">
          最小 {equipment.minReserveMinutes} 分钟 / 最大 {equipment.maxReserveHours} 小时
        </Descriptions.Item>
      </Descriptions>

      <Form form={form} layout="vertical">
        <Form.Item
          name="purpose"
          label="使用用途"
          rules={[{ required: true, message: "请输入使用用途" }]}
        >
          <Input.TextArea
            rows={4}
            placeholder="请简要描述实验用途，如：样品检测、材料表征等"
            maxLength={500}
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
