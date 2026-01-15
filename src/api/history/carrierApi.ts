// 1. 서버에 저장된 전체 데이터라고 가정 (DB 역할)
// const MOCK_DB_DATA = [
//   {
//     id: 1,
//     date: "2024-05-01",
//     code: "C-001",
//     location: "MX5",
//     transport: "AGV",
//     status: "Doing",
//   },
//   {
//     id: 2,
//     date: "2024-05-02",
//     code: "C-002",
//     location: "MX4",
//     transport: "SHUTTLE",
//     status: "Completed",
//   },
//   {
//     id: 3,
//     date: "2024-05-03",
//     code: "C-003",
//     location: "RT",
//     transport: "OHT",
//     status: "Stop",
//   },
//   {
//     id: 4,
//     date: "2024-05-04",
//     code: "C-004",
//     location: "WT2",
//     transport: "AMR",
//     status: "Pending",
//   },
//   {
//     id: 5,
//     date: "2024-05-05",
//     code: "C-005",
//     location: "MX5",
//     transport: "AGV",
//     status: "Doing",
//   },
//   {
//     id: 6,
//     date: "2024-05-06",
//     code: "C-006",
//     location: "RT",
//     transport: "OHT",
//     status: "Completed",
//   },
// ];

// // 2. 검색 조건 타입 정의 (SearchForm에서 넘어오는 값들)
// export interface CarrierSearchParams {
//   searchDate_start?: string;
//   searchDate_end?: string;
//   code?: string;
//   status?: string;
//   location?: string;
//   transport?: string;
// }

// // 3. API 호출 시뮬레이션 함수 (나중에 이 부분만 axios로 교체하면 됨)
// export const fetchCarrierList = async (params: CarrierSearchParams) => {
//   // 실제 API처럼 네트워크 딜레이 0.5초 줌
//   await new Promise((resolve) => setTimeout(resolve, 500));

//   console.log("서버로 전송된 검색 조건:", params);

//   // 서버에서 필터링하는 로직 시뮬레이션
//   //   let filteredData = MOCK_DB_DATA.filter((item) => {
//   const filteredData = MOCK_DB_DATA.filter((item) => {
//     // 1) Code 검색 (포함 여부)
//     if (
//       params.code &&
//       !item.code.toLowerCase().includes(params.code.toLowerCase())
//     ) {
//       return false;
//     }
//     // 2) Status 검색 (일치 여부) - 값이 있을 때만 체크
//     if (params.status && item.status !== params.status) {
//       return false;
//     }
//     // 3) Location 검색
//     if (params.location && item.location !== params.location) {
//       return false;
//     }
//     // 4) 날짜 범위 검색 (문자열 비교)
//     if (params.searchDate_start && item.date < params.searchDate_start)
//       return false;
//     if (params.searchDate_end && item.date > params.searchDate_end)
//       return false;

//     return true;
//     // 조건에 안 걸리면 통과
//   });

//   return filteredData;
// };
// src/api/carrierApi.ts
import apiClient from "../axiosConfig";

// 검색 조건 타입 (그대로 유지)
export interface CarrierSearchParams {
  searchDate_start?: string;
  searchDate_end?: string;
  code?: string;
  status?: string;
  location?: string;
  transport?: string;
}

// 응답 데이터 타입 정의 (서버가 주는 데이터 모양에 맞춰야 함)
// 예: 서버가 { code: 200, message: "OK", data: [...] } 형태로 준다면 그에 맞게 수정 필요
export interface CarrierData {
  id: number;
  date: string;
  code: string;
  location: string;
  transport: string;
  status: string;
}

// 실제 API 호출 함수
export const fetchCarrierList = async (
  params: CarrierSearchParams
): Promise<CarrierData[]> => {
  try {
    // GET 요청: /api/carrier?status=Doing&code=C-001 처럼 쿼리 스트링 자동 생성됨
    const response = await apiClient.get<CarrierData[]>("/history/carrier", {
      params: params,
    });

    // axios는 결과 데이터를 response.data 에 담아줍니다.
    return response.data;
  } catch (error) {
    // 에러는 호출하는 페이지(CarrierHistory)에서 잡아서 처리하도록 던짐
    throw error;
  }
};
