// src/pages/history/CarrierHistory.tsx
import { useState, useMemo } from 'react';

// 공용 컴포넌트 import
import SearchForm from '../../../components/common/searchform';
import CommonTable from '../../../components/common/commontable';

// 설정 데이터 import (Mock Data & Column Definitions)
import { Carrier_Search_Fileds } from '../../../components/common/SearchMockData';
import { CARRIER_TABLE_COLUMNS } from '../../../components/common/TableMockData';

//API 사용시 사용할것
import { fetchCarrierList, CarrierSearchParams } from '../../../api/history/carrierApi';

// 1. 테이블에 보여줄 임시 데이터 (나중에 API로 대체될 부분)
const mockTableData = [
  { id: 1, date: '2024-05-01', code: 'C-001', location: 'MX5', transport: 'AGV', status: 'Doing' },
  { id: 2, date: '2024-05-02', code: 'C-002', location: 'MX4', transport: 'SHUTTLE', status: 'Completed' },
  { id: 3, date: '2024-05-03', code: 'C-003', location: 'RT', transport: 'OHT', status: 'Stop' },
  { id: 4, date: '2024-05-04', code: 'C-004', location: 'WT2', transport: 'AMR', status: 'Pending' },
  { id: 5, date: '2024-05-05', code: 'C-005', location: 'MX5', transport: 'AGV', status: 'Doing' },
];

export default function CarrierHistory() {
  // 2. 체크박스 선택된 ID들을 관리하는 상태
  const [selectedIds, setSelectedIds] = useState<any[]>([]);
  // 2. 로딩 상태 (API 호출 중일 때 true)
  const [isLoading, setTableData] = useState<boolean>(false);
  // 2. 테이블 데이터 상태 (초기 값은 빈 배열)
  const [tableData, setTableData] = useState<any[]>([]);

  // 3. ★ 핵심: 기본 컬럼(CARRIER_TABLE_COLUMNS)에 'status' 색상 로직(render)을 주입
  const tableColumns = useMemo(() => {
    return CARRIER_TABLE_COLUMNS.map((col) => {
      // 'status' 컬럼을 찾아서 커스텀 렌더링 함수를 추가합니다.
      if (col.key === 'status') {
        return {
          ...col,
          render: (value: string) => {
            // 이 화면만의 색상 규칙
            let colorClass = 'bg-gray-100 text-gray-600'; // 기본 (Pending 등)
            
            if (value === 'Doing' || value === '운송중') colorClass = 'bg-blue-100 text-blue-700';
            else if (value === 'Completed' || value === '완료') colorClass = 'bg-green-100 text-green-700';
            else if (value === 'Stop' || value === '정지') colorClass = 'bg-red-100 text-red-700';

            return (
              <span className={`px-2 py-1 rounded text-xs font-bold ${colorClass}`}>
                {value}
              </span>
            );
          },
        };
      }
      // 다른 컬럼은 건드리지 않고 그대로 반환
      return col;
    });
  }, []);

  // 검색 핸들러
  const handleSearch = (criteria: Record<string, any>) => {
    console.log('API 호출:', criteria);
    // 여기서 API를 호출하여 mockTableData 대신 실제 데이터를 받아오면 됩니다.
  };

  return (
    <div className="p-6">
      {/* 타이틀 스타일을 조금 더 일반적인 색상으로 변경했습니다 (text-red-500 -> text-gray-800) */}
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Carrier History</h2>

      {/* 4. 검색 폼 */}
      <SearchForm 
        fields={Carrier_Search_Fileds} 
        onSearch={handleSearch} 
      />

      {/* 5. 테이블 영역 */}
      {/* 기존의 border-dashed placeholder는 제거하고 깔끔한 마진(mt-6)만 줍니다 */}
      <div className="mt-6">
         <CommonTable 
           columns={tableColumns}     // 위에서 만든(render가 주입된) 컬럼 사용
           data={mockTableData}       // 데이터 연결
           selectedIds={selectedIds}  // 선택 상태 연결
           onSelectionChange={setSelectedIds} // 선택 핸들러 연결
           onRowClick={(row) => console.log('클릭된 행:', row)} // (선택사항) 행 클릭 시 동작
         />
      </div>
    </div>
  );
}