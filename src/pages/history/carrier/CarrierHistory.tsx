// src/pages/history/CarrierHistory.tsx
import { useState, useMemo, useEffect, useCallback } from 'react';

// 공용 컴포넌트 import
import SearchForm from '../../../components/common/searchform';
import CommonTable from '../../../components/common/commontable';

// 설정 데이터 import
import { Carrier_Search_Fileds } from '../../../components/common/SearchMockData';
import { CARRIER_TABLE_COLUMNS } from '../../../components/common/TableMockData';

// API 함수 import
import { fetchCarrierList,type CarrierSearchParams } from '../../../api/history/carrierApi';

export default function CarrierHistory() {
  // === State 관리 ===
  // 1. 체크박스 선택된 ID들을 관리하는 상태
  const [selectedIds, setSelectedIds] = useState<any[]>([]);
  
  // 2. 로딩 상태 (API 호출 중일 때 true) 
  // ★ 수정: 변수명 오타 수정 (setTableData -> setIsLoading)
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // 3. 테이블 데이터 상태 (초기 값은 빈 배열)
  const [tableData, setTableData] = useState<any[]>([]);

  // === API 호출 함수 (데이터 불러오기) ===
  const loadData = useCallback(async (searchParams: CarrierSearchParams = {}) => {
    setIsLoading(true); // 로딩 시작
    try {
      // API 호출 (현재는 Mock API가 0.5초 뒤에 결과 반환)
      const result = await fetchCarrierList(searchParams);
      setTableData(result); // 받아온 데이터로 State 업데이트
    } catch (error) {
      console.error("데이터 로딩 실패:", error);
      alert("데이터를 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false); // 로딩 종료
    }
  }, []);

  // === 초기화 (Mount 시점) ===
  // 페이지 처음 들어왔을 때 전체 데이터 한 번 조회
  useEffect(() => {
    loadData(); 
  }, [loadData]);

  // === 검색 핸들러 ===
  const handleSearch = (criteria: Record<string, any>) => {
    // SearchForm에서 입력받은 조건으로 API 재호출
    loadData(criteria);
  };

  // === 컬럼 정의 (Render 주입) ===
  const tableColumns = useMemo(() => {
    return CARRIER_TABLE_COLUMNS.map((col) => {
      if (col.key === 'status') {
        return {
          ...col,
          render: (value: string) => {
            let colorClass = 'bg-gray-100 text-gray-600';
            
            // 대소문자 처리 및 다양한 상태값 대응
            const v = value || '';
            if (v === 'Doing' || v === '운송중') colorClass = 'bg-blue-100 text-blue-700';
            else if (v === 'Completed' || v === '완료') colorClass = 'bg-green-100 text-green-700';
            else if (v === 'Stop' || v === '정지') colorClass = 'bg-red-100 text-red-700';
            else if (v === 'Pending' || v === '입고 대기') colorClass = 'bg-yellow-100 text-yellow-700';

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

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Carrier History</h2>

      {/* 4. 검색 폼 */}
      <SearchForm 
        fields={Carrier_Search_Fileds} 
        onSearch={handleSearch} 
      />

      {/* 5. 테이블 영역 */}
      <div className="mt-6">
         <CommonTable 
           columns={tableColumns}     
           data={tableData}           // ★ 수정: mockTableData 대신 API로 받은 tableData 연결
           isLoading={isLoading}      // ★ 추가: 로딩 상태 연결
           selectedIds={selectedIds}  
           onSelectionChange={setSelectedIds} 
           onRowClick={(row) => console.log('클릭된 행:', row)}
         />
      </div>
    </div>
  );
}