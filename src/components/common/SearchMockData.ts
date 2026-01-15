import type { SearchFieldConfig } from "./searchform";

export const Carrier_Search_Fileds: SearchFieldConfig[] = [
  {
    key: "searchDate",
    label: "검색 일자",
    type: "date-range",
  },
  {
    key: "code",
    label: "Code",
    type: "text",
    placeholder: "Code명을 입력하세요.",
  },
  {
    key: "static",
    label: "운송 상태",
    type: "select",
    // placeholder: "All",
    options: [
      // { label: "ALL", value: "" },
      { label: "Doing", value: "doing" },
      { label: "Stop", value: "stop" },
      { label: "Stanby", value: "stanby" },
      { label: "Inbound", value: "inbound" },
      { label: "Outbound", value: "outbound" },
    ],
  },
  {
    key: "location",
    label: "현 위치",
    type: "select",
    options: [
      // { label: "ALL", value: "" },
      { label: "MX5", value: "mx5" },
      { label: "MX4", value: "mx4" },
      { label: "WT2", value: "wt2" },
      { label: "RT", value: "rt" },
    ],
  },
  {
    key: "transfort",
    label: "운송 수단",
    type: "select",
    options: [
      // { label: "All", value: "" },
      { label: "AGV", value: "agv" },
      { label: "STK", value: "stk" },
      { label: "AMR", value: "anr" },
      { label: "AR", value: "ar" },
      { label: "RS", value: "rs" },
      { label: "SHUTTLE", value: "shuttle" },
      { label: "OHT", value: "oht" },
    ],
  },
  {
    key: "status",
    label: "진행 상태",
    type: "select",
    options: [
      // { label: "전체", value: "" },
      { label: "입고 대기", value: "PENDING" },
      { label: "검수 중", value: "INSPECTING" },
      { label: "입고 완료", value: "COMPLETED" },
      { label: "출고 완료", value: "SHIPPED" },
    ],
  },
];
export const Inbound_Search_Fileds: SearchFieldConfig[] = [
  {
    key: "searchDate",
    label: "검색 일자",
    type: "date-range",
  },
  {
    key: "inboundCode",
    label: "Inbound Code",
    type: "text",
    placeholder: "입고 번호를 입력하세요.",
  },
  {
    key: "POCode",
    label: "구매 주문 번호",
    type: "text",
    placeholder: "구매 주문 번호를 입력하세요.",
  },
  {
    key: "status",
    label: "입고 상태",
    type: "select",
    // placeholder: "All",
    options: [
      // { label: "ALL", value: "" },
      { label: "예정", value: "예정" },
      { label: "부분 입고", value: "부분입고" },
      { label: "완료", value: "완료" },
      { label: "취소", value: "취소" },
    ],
  },
  {
    key: "supplier",
    label: "공급처/고객처",
    type: "select",
    options: [
      // { label: "ALL", value: "" },
      { label: "supplier", value: "supplier" },
      { label: "client", value: "client" },
    ],
  },
];
export const Outbound_Search_Fileds: SearchFieldConfig[] = [
  {
    key: "searchDate",
    label: "검색 일자",
    type: "date-range",
  },
  {
    key: "outboundCode",
    label: "Outbound Code",
    type: "text",
    placeholder: "출고 번호를 입력하세요.",
  },
  {
    key: "ONCode",
    label: "주문 번호",
    type: "text",
    placeholder: "주문 번호를 입력하세요.",
  },
  {
    key: "status",
    label: "츨고 상태",
    type: "select",
    // placeholder: "All",
    options: [
      // { label: "ALL", value: "" },
      { label: "대기", value: "대기" },
      { label: "할당 완료", value: "할당완료" },
      { label: "피킹 중", value: "피킹중" },
      { label: "검수 중", value: "검수중" },
      { label: "출고 완료", value: "출고완료" },
    ],
  },
  {
    key: "supplier",
    label: "공급처/고객처",
    type: "select",
    options: [
      // { label: "ALL", value: "" },
      { label: "supplier", value: "supplier" },
      { label: "client", value: "client" },
    ],
  },
  {
    key: "priority",
    label: "긴급 여부",
    type: "select",
    options: [
      // { label: "ALL", value: "" },
      { label: "긴급", value: "emergensi" },
      { label: "일반", value: "normal" },
    ],
  },
];
