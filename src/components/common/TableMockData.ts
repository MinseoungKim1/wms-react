// src/components/common/TableMockData.ts
import type { ColumnDef } from "./commontable";

// render 함수 제거! 순수 데이터만 남김
export const CARRIER_TABLE_COLUMNS: ColumnDef[] = [
  { key: "date", label: "일자", width: "120px" },
  { key: "code", label: "Code", width: "150px" },
  { key: "location", label: "현 위치", width: "100px", align: "center" },
  { key: "transport", label: "운송 수단", width: "120px" },
  { key: "status", label: "진행 상태", width: "120px", align: "center" }, // render 제거
];
export const INBOUND_TABLE_COLUMNS: ColumnDef[] = [
  { key: "date", label: "일자", width: "120px" },
  { key: "inboundCode", label: "Inbound Code", width: "150px" },
  { key: "POCode", label: "구매 주문 번호", width: "100px", align: "center" },
  { key: "status", label: "입고 상태", width: "120px" },
  { key: "supplier", label: "공급처/고객처", width: "120px", align: "center" }, // render 제거
];
export const OUTBOUND_TABLE_COLUMNS: ColumnDef[] = [
  { key: "date", label: "일자", width: "120px" },
  { key: "outboundCode", label: "Outbound Code", width: "150px" },
  { key: "ONCode", label: "주문 번호", width: "100px", align: "center" },
  { key: "status", label: "출고 상태", width: "120px" },
  { key: "supplier", label: "공급처/고객처", width: "120px", align: "center" },
  { key: "priority", label: "긴급 여부", width: "120px", align: "center" },
];
