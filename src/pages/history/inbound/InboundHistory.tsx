import { useState, useMemo } from 'react';
// import axios from 'axios'; // 실제 API 사용 시 주석 해제

// 공용 컴포넌트 import
import SearchForm from '../../../components/common/searchform';
import CommonTable from '../../../components/common/commontable';

// 설정 데이터 import
import { Inbound_Search_Fileds } from '../../../components/common/SearchMockData';
import { INBOUND_TABLE_COLUMNS } from '../../../components/common/TableMockData';

// 1. 초기 임시 데이터
const initialMockData = [
  { id: 1, date: '2025-05-01', inboundCode: 'A-001', POCode: 'X012302', supplier: 'supplier', status: '예정' },
  { id: 2, date: '2025-05-02', inboundCode: 'B-002', POCode: 'X012301', supplier: 'client', status: '부분입고' },
  { id: 3, date: '2025-05-03', inboundCode: 'C-003', POCode: 'X012311', supplier: 'client', status: '완료' },
  { id: 4, date: '2025-05-04', inboundCode: 'F-004', POCode: 'X012342', supplier: 'supplier', status: '취소' },
  { id: 5, date: '2025-05-05', inboundCode: 'Z-005', POCode: 'X012312', supplier: 'client', status: '완료' },
];

export default function InboundHistory() {
  const [tableData, setTableData] = useState<any[]>(initialMockData);
  const [selectedIds, setSelectedIds] = useState<any[]>([]);

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

  const handleSearch = (criteria: Record<string, any>) => {
    console.log('API 호출:', criteria);
  };

  // ★ [핵심 변경] API 호출을 포함한 행 추가 핸들러
  // CommonTable에서 async 함수를 기다려주지 않는 구조라면, 
  // API 요청은 여기서 처리하고 UI 갱신은 .then() 내부에서 수행합니다.
  const handleAddRow = async (newRow: any) => {
    
    // 1. 서버로 보낼 데이터 포맷팅 (필요한 경우)
    const payload = {
      ...newRow,
      date: newRow.date || new Date().toISOString().split('T')[0], // 날짜 없으면 오늘 날짜
      status: newRow.status || '예정', // 기본값
      // id는 보통 DB에서 생성되므로 payload에서 제외하거나 null로 보냄
    };

    try {
      console.log('생성 요청 데이터:', payload);

      // =========================================================
      // [실제 API 호출 예시]
      // const response = await axios.post('/api/inbound/create', payload);
      // const createdData = response.data; // 서버가 생성된 전체 객체(ID 포함)를 반환한다고 가정
      // =========================================================

      // [테스트용 가상 API 호출] (0.5초 딜레이 후 성공 응답)
      const mockApiResponse = await new Promise<any>((resolve, reject) => {
        setTimeout(() => {
          // 성공 시: 서버에서 생성된 ID를 포함하여 응답
          const serverGeneratedData = { 
            ...payload, 
            id: Math.floor(Math.random() * 10000) + 100 // 가상 ID 생성
          };
          resolve(serverGeneratedData);
          
          // 실패 테스트를 하려면 아래 주석 해제
          // reject(new Error("서버 에러 발생"));
        }, 500);
      });

      // 2. API 성공 시: 서버에서 받은 데이터로 테이블 갱신
      // (내가 입력한 'newRow'가 아니라 서버가 확정한 'mockApiResponse'를 씁니다)
      setTableData((prev) => [mockApiResponse, ...prev]); 
      
      console.log('생성 완료:', mockApiResponse);
      alert('성공적으로 추가되었습니다.'); // (선택 사항)

    } catch (error) {
      // 3. API 실패 시: 에러 처리 및 테이블 갱신 안 함
      console.error('데이터 생성 실패:', error);
      alert('데이터 추가 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Inbound History</h2>

      <SearchForm 
        fields={Inbound_Search_Fileds} 
        onSearch={handleSearch} 
      />

      <div className="mt-6">
         <CommonTable 
           columns={tableColumns}
           data={tableData}
           selectedIds={selectedIds}
           onSelectionChange={setSelectedIds}
           onRowClick={(row) => console.log('클릭된 행:', row)}
           
           enableAdd={true}
           onAddRow={handleAddRow} // 변경된 핸들러 연결
           enableExport={true}
           exportFileName="입고내역_2025"
         />
      </div>
    </div>
  );
}