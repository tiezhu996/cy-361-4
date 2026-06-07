import { API_BASE_URL } from "../constants/app";
import type {
  OverviewResponse,
  Equipment,
  Reservation,
  TimeSlot,
  Violation,
  CreateReservationRequest,
  CheckinRequest,
} from "../types";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function fetchOverview(): Promise<OverviewResponse> {
  return request<OverviewResponse>("/overview");
}

export async function fetchEquipments(category?: string): Promise<Equipment[]> {
  const url = category ? `/equipments?category=${encodeURIComponent(category)}` : "/equipments";
  return request<Equipment[]>(url);
}

export async function fetchEquipmentCategories(): Promise<string[]> {
  return request<string[]>("/equipments/categories");
}

export async function fetchEquipment(id: number): Promise<Equipment> {
  return request<Equipment>(`/equipments/${id}`);
}

export async function fetchAvailableSlots(equipmentId: number, date: string): Promise<TimeSlot[]> {
  return request<TimeSlot[]>(`/equipments/${equipmentId}/slots?date=${date}`);
}

export async function fetchReservations(params?: {
  userId?: number;
  status?: string;
  equipmentId?: number;
}): Promise<Reservation[]> {
  let url = "/reservations";
  if (params) {
    const query = new URLSearchParams();
    if (params.userId) query.append("userId", params.userId.toString());
    if (params.status) query.append("status", params.status);
    if (params.equipmentId) query.append("equipmentId", params.equipmentId.toString());
    const queryString = query.toString();
    if (queryString) url += `?${queryString}`;
  }
  return request<Reservation[]>(url);
}

export async function fetchTodayReservations(): Promise<Reservation[]> {
  return request<Reservation[]>("/reservations/today");
}

export async function fetchReservation(id: number): Promise<Reservation> {
  return request<Reservation>(`/reservations/${id}`);
}

export async function fetchReservationByQr(token: string): Promise<Reservation> {
  return request<Reservation>(`/reservations/qr/${token}`);
}

export async function createReservation(data: CreateReservationRequest): Promise<Reservation> {
  return request<Reservation>("/reservations", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function checkin(data: CheckinRequest): Promise<Reservation> {
  return request<Reservation>("/reservations/checkin", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function checkout(data: CheckinRequest): Promise<Reservation> {
  return request<Reservation>("/reservations/checkout", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function cancelReservation(id: number): Promise<Reservation> {
  return request<Reservation>(`/reservations/${id}/cancel`, {
    method: "PATCH",
  });
}

export async function fetchViolations(userId?: number): Promise<Violation[]> {
  const url = userId ? `/reservations/violations?userId=${userId}` : "/reservations/violations";
  return request<Violation[]>(url);
}

export async function fetchViolationCount(userId?: number): Promise<{ count: number }> {
  const url = userId
    ? `/reservations/violations/count?userId=${userId}`
    : "/reservations/violations/count";
  return request<{ count: number }>(url);
}

export async function processViolations(): Promise<{ processed: number }> {
  return request<{ processed: number }>("/reservations/process-violations", {
    method: "POST",
  });
}
