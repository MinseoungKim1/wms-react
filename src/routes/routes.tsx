// src/routes/AppRoutes.tsx
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../components/layouts/main-layout'; // 파일명이 실제와 맞는지 확인 필요
import Dashboard from '../pages/dashboard/index';
import CarrierHistory from '../pages/history/carrier/CarrierHistory';
import InboundHistory from '../pages/history/inbound/InboundHistory';
import OutboundHistory from '../pages/history/outbound/OutboundHistory';
// 페이지가 아직 안 만들어졌을 때 보여줄 임시 컴포넌트 (테스트용)
const Page = ({ title }: { title: string }) => (
  <div className="p-6">
    <h2 className="text-2xl font-bold mb-4 text-gray-800">{title}</h2>
    <div className="p-10 border-2 border-dashed border-gray-300 rounded-xl bg-white text-gray-500 flex justify-center items-center h-64">
      🚧 {title} 화면 개발 중입니다.
    </div>
  </div>
);

export default function AppRoutes() {
  return (
    <Routes>
      {/* 레이아웃 (헤더 + 사이드바) 적용 구간 */}
      <Route element={<MainLayout />}>
        
        {/* 1. SmartWES (대시보드) */}
        <Route path="/" element={<Dashboard />} />

        {/* 2. History */}
        <Route path="/history">
            {/* /history 접속 시 보여줄 메인 화면 */}
            <Route index element={<Page title="History 메인" />} />
            
            {/* 하위 메뉴들 (부모 경로 + 자식 경로 = 전체 경로) */}
            <Route path="inbound" element={<InboundHistory/>} />
            <Route path="outbound" element={<OutboundHistory/>} />
            <Route path="carrier" element={<CarrierHistory/>} />
        </Route>

        {/* 3. Inbound */}
        <Route path="/inbound">
            <Route index element={<Page title="Inbound 메인" />} />
            
            <Route path="material" element={<Page title="Material Inbound" />} />
            <Route path="ETC" element={<Page title="ETC Inbound" />} /> {/* 대문자 ETC 유지 */}
            <Route path="inbound" element={<Page title="General Inbound" />} />
        </Route>

        {/* 4. Outbound */}
        <Route path="/outbound">
            <Route index element={<Page title="Outbound 메인" />} />
            
            <Route path="material" element={<Page title="Material Outbound" />} />
            <Route path="ETC" element={<Page title="ETC Outbound" />} />
            <Route path="outbound" element={<Page title="General Outbound" />} />
        </Route>

        {/* 5. Material */}
        <Route path="/material">
            <Route index element={<Page title="Material 메인" />} />
            
            <Route path="inbound" element={<Page title="Inbound Material" />} />
            <Route path="outbound" element={<Page title="Outbound Material" />} />
            <Route path="ETC" element={<Page title="ETC Material" />} />
        </Route>

      </Route>
    </Routes>
  );
}