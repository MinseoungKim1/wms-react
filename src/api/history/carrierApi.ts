// src/api/carrierApi.ts

// 1. 가짜 데이터 (DB 대용)
const MOCK_DB_DATA = [
  {
    id: 1,
    date: "2024-05-01",
    code: "C-001",
    location: "MX5",
    transport: "AGV",
    status: "Doing",
  },
  {
    id: 2,
    date: "2024-05-02",
    code: "C-002",
    location: "MX4",
    transport: "SHUTTLE",
    status: "Completed",
  },
  {
    id: 3,
    date: "2024-05-03",
    code: "C-003",
    location: "RT",
    transport: "OHT",
    status: "Stop",
  },
  {
    id: 4,
    date: "2024-05-04",
    code: "C-004",
    location: "WT2",
    transport: "AMR",
    status: "Pending",
  },
  {
    id: 5,
    date: "2024-05-05",
    code: "C-005",
    location: "MX5",
    transport: "AGV",
    status: "Doing",
  },
  {
    id: 6,
    date: "2024-05-06",
    code: "C-006",
    location: "RT",
    transport: "OHT",
    status: "Completed",
  },
];

// 2. 검색 조건 타입 정의
export interface CarrierSearchParams {
  searchDate_start?: string;
  searchDate_end?: string;
  code?: string;
  status?: string;
  location?: string;
  transport?: string;
}

// 3. API 호출 시뮬레이션 함수 (Axios 대신 사용)
export const fetchCarrierList = async (params: CarrierSearchParams) => {
  console.log("Mock API 호출됨 (검색조건):", params);

  // 실제 네트워크 지연 효과 (0.5초)
  await new Promise((resolve) => setTimeout(resolve, 500));

  // 필터링 로직 (백엔드가 해줄 일을 여기서 임시로 수행)
  const filteredData = MOCK_DB_DATA.filter((item) => {
    // 1) Code 검색
    if (
      params.code &&
      !item.code.toLowerCase().includes(params.code.toLowerCase())
    ) {
      return false;
    }
    // 2) Status 검색
    if (params.status && item.status !== params.status) {
      return false;
    }
    // 3) Location 검색
    if (params.location && item.location !== params.location) {
      return false;
    }
    // 4) 날짜 검색
    if (params.searchDate_start && item.date < params.searchDate_start)
      return false;
    if (params.searchDate_end && item.date > params.searchDate_end)
      return false;

    return true;
  });

  return filteredData;
};
