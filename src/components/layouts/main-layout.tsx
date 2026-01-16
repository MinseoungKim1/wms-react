// src/components/layouts/MainLayout.tsx
import { Outlet } from 'react-router-dom'; // ★중요: 자식 페이지가 들어올 구멍
import Header from './sub-page/header';
// import Sidebar from './sub-page/sidebar';

export default function MainLayout() {
  return (
    // h-screen: 화면 전체 높이 사용 (필수!)
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      
      {/* 1. 사이드바 (왼쪽 고정) */}
      {/* w-64: 너비 고정, hidden md:flex: 모바일엔 숨기고 중간화면 이상 보임 */}
      {/* <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <Sidebar />
      </aside> */}

      {/* 2. 메인 영역 (오른쪽 나머지) */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 헤더 */}
        <header className="flex-none bg-white border-b border-gray-200 z-10 relative">
          <Header />
        </header>

        {/* 컨텐츠 (스크롤은 여기서만 생김) */}
        <main className="flex-1 overflow-auto p-4">
          {/* ★ 여기가 Dashboard가 들어오는 자리입니다 ★ */}
          <Outlet /> 
        </main>
      </div>
      
    </div>
  );
}