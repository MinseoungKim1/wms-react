import { useState } from "react";
import Menu from "./menu"; // Menu 컴포넌트가 있다고 가정 (없으면 아래 임시 코드 참고)

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleCloseMenu = () => {
    setIsMenuOpen(false);
  }
  return (
    <div className="bg-white shadow-sm w-full transition-all duration-300 ease-in-out">
      {/* === 1. 상단 고정 헤더 영역 === */}
      <div className="grid grid-cols-12 items-center p-4 h-16">
        
        {/* 왼쪽: 로고 버튼 */}
        <div className="col-span-3">
          <button 
            onClick={handleMenuToggle}
            className="flex items-center gap-2 text-xl font-bold text-blue-600 hover:text-blue-800 transition-colors"
          >
            Smart WMS 
            {/* 화살표 아이콘 회전 애니메이션 */}
            <span className={`text-sm transition-transform duration-300 ${isMenuOpen ? "rotate-180" : ""}`}>
              ▼
            </span>
          </button>
        </div>

        {/* 중앙: 여백 */}
        <div className="col-span-6"></div>

        {/* 오른쪽: 사용자 정보 */}
        <div className="col-span-3 flex justify-end items-center gap-4">
          <button className="p-2 hover:bg-gray-100 rounded-full relative">
            🔔
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <div className="flex items-center gap-2 border-l pl-4 border-gray-300">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">👤</div>
            <span className="text-sm font-medium text-gray-700">김민성</span>
          </div>
        </div>
      </div>

      {/* === 2. 슬라이드 메뉴 영역 (Accordion 효과) === */}
      {/* 조건부 렌더링(&&) 대신 max-height를 조절하여 애니메이션 구현 */}
      <div 
        className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out border-t border-gray-100
          ${isMenuOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="p-6 bg-gray-50">
          {/* 메뉴 컴포넌트 배치 */}
           <Menu onClose={handleCloseMenu} />
           
          {/* 닫기 핸들러 (옵션) */}
          <div 
            onClick={handleMenuToggle}
            className="mt-4 flex justify-center cursor-pointer hover:bg-gray-200 py-1 rounded transition-colors"
          >
            <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}