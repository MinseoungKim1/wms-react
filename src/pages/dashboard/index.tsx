import { dashboardStats } from '../../mocks/dashboard';
// 아직 StatCard 컴포넌트를 안 만들었다면, 아래 div로 직접 구현한 부분을 참고하세요.

const Dashboard = () => {
  return (
    <div className="w-full h-full p-5 bg-gray-100">
      
      {/* === 1 Row: 상단 통계 (4등분) === */}
      {/* gap-5: 카드 사이 간격, mb-5: 아래 줄과 간격 */}
      <div className="grid grid-cols-12 gap-5 mb-5">
        
        {/* 반복되는 4개의 카드 */}
        {dashboardStats.map((stat, index) => (
          <div key={index} className="col-span-12 md:col-span-3 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-gray-500 text-sm font-medium mb-2">{stat.title}</h3>
            <div className="flex justify-between items-end">
              <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
              <span className="text-2xl">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* === 2 Row: 차트 및 순위 (9:3 분할) === */}
      <div className="grid grid-cols-12 gap-5 min-h-[400px]">
        
        {/* 1. 왼쪽: 공간 점유율 (9칸 차지) */}
        <div className="col-span-12 lg:col-span-9 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          
          {/* 내부를 다시 그리드로 나눔 (cols-2 vs cols-10 구조 구현) */}
          <div className="grid grid-cols-12 gap-6 h-full">
            
            {/* cols-2 영역: 텍스트 정보 */}
            {/* lg:col-span-2: 전체 12칸 중 2칸 차지 */}
            <div className="col-span-12 lg:col-span-2 flex flex-col border-r border-gray-100 pr-4">
              <h2 className="text-lg font-bold text-gray-800 mb-2">공간 점유율</h2>
              <div className="mt-auto mb-auto">
                <p className="text-4xl font-extrabold text-blue-600">78%</p>
                <p className="text-sm text-gray-500 mt-1">
                  총 1,000 셀 중<br />
                  <span className="font-semibold text-gray-700">780 셀</span> 사용 중
                </p>
              </div>
            </div>

            {/* cols-10 영역: 차트 표시 영역 */}
            {/* lg:col-span-10: 전체 12칸 중 10칸 차지 */}
            <div className="col-span-12 lg:col-span-10 bg-gray-50 rounded-lg flex items-center justify-center border border-dashed border-gray-300">
              <span className="text-gray-400 font-medium">
                공간 점유율 차트 영역 (Chart.js 연동 예정)
              </span>
            </div>
          </div>
        </div>

        {/* 2. 오른쪽: 카테고리 TOP 5 (3칸 차지) */}
        <div className="col-span-12 lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
            🏆 제품 TOP 5
          </h2>
          <ul className="space-y-4">
            {/* 임시 데이터 목록 */}
            {[
              { name: '전자부품 A', pct: '35%' },
              { name: '자동차 부품 B', pct: '20%' },
              { name: '생활용품 C', pct: '15%' },
              { name: '의류 D', pct: '10%' },
              { name: '기타', pct: '20%' },
            ].map((item, idx) => (
              <li key={idx} className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">
                  {idx + 1}. {item.name}
                </span>
                <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  {item.pct}
                </span>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;