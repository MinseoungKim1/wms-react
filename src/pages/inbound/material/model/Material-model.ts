export type ViewModeType = "STATUS" | "CAPACITY";
export type ZoneType = "STORAGE_A" | "STORAGE_B" | "STORAGE_C" | "STAGING";

// Zone별 테두리 색상 매핑
export const ZONE_COLORS: Record<ZoneType, string> = {
  STORAGE_A: "#dc3545", // Red (Zone A)
  STORAGE_B: "#0d6efd", // Blue (Zone B)
  STORAGE_C: "#198754", // Green (Zone C)
  STAGING: "#fd7e14", // Orange (대기 Zone)
};

export const STATUS_COLORS = {
  RUN: "#28a745",
  IDLE: "#ffc107",
  DOWN: "#dc3545",
  PM: "#6c757d",
};

export interface StoredItem {
  itemId: string;
  itemName: string;
  lotId: string;
  quantity: number;
  inDate: string;
}

export interface MachineData {
  id: string;
  zone: string;
  zoneType: ZoneType; // 구역 타입 추가
  x: number;
  y: number;
  width: number;
  height: number;
  status: keyof typeof STATUS_COLORS;
  maxCapacity: number;
  currentLoad: number;
  items: StoredItem[];
}
