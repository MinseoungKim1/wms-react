// src/api/axiosConfig.ts
import axios from "axios";

// 1. Axios 인스턴스 생성
const apiClient = axios.create({
  // 실제 백엔드 API 주소 (환경변수로 관리하는 것이 좋음)
  baseURL: "http://localhost:8080/api",
  timeout: 5000, // 요청이 5초 넘으면 실패 처리
  headers: {
    "Content-Type": "application/json",
  },
});

// 2. 요청 인터셉터 (Request Interceptor)
// API 요청을 보내기 전에 가로채서 로직 수행 (예: 토큰 싣기)
apiClient.interceptors.request.use(
  (config) => {
    // 로컬 스토리지에서 토큰 가져오기 (로그인 기능 구현 시 사용)
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. 응답 인터셉터 (Response Interceptor)
// 서버 응답을 받은 직후 처리 (예: 401 에러 시 로그아웃 처리)
apiClient.interceptors.response.use(
  (response) => {
    // 정상 응답은 그대로 반환
    return response;
  },
  (error) => {
    // 에러 공통 처리
    if (error.response && error.response.status === 401) {
      console.error("인증 실패: 로그인이 필요합니다.");
      // window.location.href = '/login'; // 강제 로그아웃 로직 등
    }
    return Promise.reject(error);
  }
);

export default apiClient;
