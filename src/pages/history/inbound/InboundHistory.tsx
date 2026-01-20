// src/pages/history/CarrierHistory.tsx
import { useState, useMemo } from 'react';

// 공용 컴포넌트 import
import SearchForm from '../../../components/common/searchform';
import CommonTable from '../../../components/common/commontable';

// 설정 데이터 import
import { Inbound_Search_Fileds } from '../../../components/common/SearchMockData';
import { INBOUND_TABLE_COLUMNS } from '../../../components/common/TableMockData';

// 1. 초기 임시 데이터 (나중에 API로 대체될 부분)
const initialMockData = [
  { id: 1, date: '2025-05-01', inboundCode: 'A-001', POCode: 'X012302', supplier: 'supplier', status: '예정' },
  { id: 2, date: '2025-05-02', inboundCode: 'B-002', POCode: 'X012301', supplier: 'client', status: '부분입고' },
  { id: 3, date: '2025-05-03', inboundCode: 'C-003', POCode: 'X012311', supplier: 'client', status: '완료' },
  { id: 4, date: '2025-05-04', inboundCode: 'F-004', POCode: 'X012342', supplier: 'supplier', status: '취소' },
  { id: 5, date: '2025-05-05', inboundCode: 'Z-005', POCode: 'X012312', supplier: 'client', status: '완료' },
];

export default function CarrierHistory() {
  // 2. 테이블 데이터 상태 관리 (행 추가를 위해 state로 변경)
  const [tableData, setTableData] = useState<any[]>(initialMockData);
  
  // 3. 체크박스 선택된 ID들을 관리하는 상태
  const [selectedIds, setSelectedIds] = useState<any[]>([]);

  // 4. 컬럼 정의 + 커스텀 렌더링
  const tableColumns = useMemo(() => {
    return INBOUND_TABLE_COLUMNS.map((col) => {
      if (col.key === 'status') {
        return {
          ...col,
          render: (value: string) => {
            let colorClass = 'bg-gray-100 text-gray-600'; 
            
            if (value === '예정') colorClass = 'bg-blue-100 text-blue-700';
            else if (value === '부분 입고' || value === '부분입고') colorClass = 'bg-green-100 text-green-700';
            else if (value === '취소') colorClass = 'bg-red-100 text-red-700';

            return (
              <span className={`px-2 py-1 rounded text-xs font-bold ${colorClass}`}>
                {value}
              </span>
            );
          },
        };
      }
      return col;
    });
  }, []);

  // 검색 핸들러
  const handleSearch = (criteria: Record<string, any>) => {
    console.log('API 호출:', criteria);
    // 실제로는 여기서 setTableData(apiResponse) 등으로 데이터를 교체합니다.
  };

  // ★ [추가] 행 추가 핸들러
  const handleAddRow = (newRow: any) => {
    console.log('새로운 행 추가:', newRow);
    
    // 필수 데이터가 비어있을 경우 기본값 채우기 등의 로직을 넣을 수 있습니다.
    // 예: 날짜가 없으면 오늘 날짜로 설정
    const rowToAdd = {
      ...newRow,
      date: newRow.date || new Date().toISOString().split('T')[0],
      status: newRow.status || '예정' // 기본 상태값
    };

    setTableData((prev) => [rowToAdd, ...prev]); // 맨 앞에 추가
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Inbound History</h2>

      {/* 검색 폼 */}
      <SearchForm 
        fields={Inbound_Search_Fileds} 
        onSearch={handleSearch} 
      />

      {/* 테이블 영역 */}
      <div className="mt-6">
         <CommonTable 
           columns={tableColumns}
           data={tableData}             // state로 관리되는 데이터 전달
           selectedIds={selectedIds}
           onSelectionChange={setSelectedIds}
           onRowClick={(row) => console.log('클릭된 행:', row)}
           
           // ★ [추가] 기능 활성화
           enableAdd={true}             // 추가 버튼 보이기
           onAddRow={handleAddRow}      // 추가 로직 연결
           enableExport={true}          // 엑셀 버튼 보이기
           exportFileName="입고내역_2025" // 엑셀 파일명 설정
         />
      </div>
    </div>
  );
}