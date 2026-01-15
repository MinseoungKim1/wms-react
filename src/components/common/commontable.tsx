import type { ReactNode } from 'react';

// 1. 컬럼 설정 타입 정의
export interface ColumnDef<T = any> {
  key: string;              // 데이터 키값 (예: 'id', 'status')
  label: string;            // 헤더 이름
  width?: string;           // 너비 (예: '100px')
  align?: 'left' | 'center' | 'right'; // 정렬
  
  // ★ 핵심: 페이지에서 커스텀 UI(배지, 버튼 등)를 넘겨줄 수 있는 함수
  render?: (value: any, row: T) => ReactNode; 
}

interface CommonTableProps<T> {
  columns: ColumnDef<T>[];  // 컬럼 정의
  data: T[];                // 데이터
  isLoading?: boolean;      // 로딩 상태
  onRowClick?: (row: T) => void; // 행 클릭 이벤트
  
  // 체크박스 관련 (선택 사항)
  selectedIds?: (string | number)[];
  onSelectionChange?: (selectedIds: any[]) => void;
}

// T는 반드시 id 속성을 가져야 함 (key 설정을 위해)
export default function CommonTable<T extends { id: string | number }>({
  columns,
  data,
  isLoading = false,
  onRowClick,
  selectedIds = [],
  onSelectionChange,
}: CommonTableProps<T>) {

  // 전체 선택
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onSelectionChange) return;
    if (e.target.checked) {
      onSelectionChange(data.map((row) => row.id));
    } else {
      onSelectionChange([]);
    }
  };

  // 개별 선택
  const handleSelectRow = (id: string | number) => {
    if (!onSelectionChange) return;
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((sid) => sid !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          {/* === 헤더 === */}
          <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
            <tr>
              {/* 체크박스 헤더 */}
              {onSelectionChange && (
                <th className="py-4 px-6 w-10">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    checked={data.length > 0 && selectedIds.length === data.length}
                    onChange={handleSelectAll}
                  />
                </th>
              )}

              {/* 컬럼 헤더 */}
              {columns.map((col) => (
                <th 
                  key={col.key} 
                  className={`py-4 px-6 font-semibold ${
                    col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
                  }`}
                  style={{ width: col.width }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          {/* === 바디 === */}
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length + (onSelectionChange ? 1 : 0)} className="py-20 text-center text-gray-400">
                  데이터를 불러오는 중입니다...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (onSelectionChange ? 1 : 0)} className="py-20 text-center text-gray-400">
                  데이터가 존재하지 않습니다.
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr 
                  key={row.id} 
                  className={`hover:bg-gray-50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={() => onRowClick?.(row)}
                >
                  {/* 체크박스 셀 */}
                  {onSelectionChange && (
                    <td className="py-4 px-6" onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        checked={selectedIds.includes(row.id)}
                        onChange={() => handleSelectRow(row.id)}
                      />
                    </td>
                  )}

                  {/* 데이터 셀 렌더링 */}
                  {columns.map((col) => {
                    const cellValue = (row as any)[col.key];
                    return (
                      <td 
                        key={`${row.id}-${col.key}`} 
                        className={`py-4 px-6 text-gray-700 ${
                          col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
                        }`}
                      >
                        {/* ★ render 함수가 있으면 실행(JSX 반환), 없으면 그냥 텍스트 출력 */}
                        {col.render ? col.render(cellValue, row) : cellValue}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* 페이지네이션 (디자인용) */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
         <span className="text-sm text-gray-500">
           총 <span className="font-bold text-gray-900">{data.length}</span> 건
         </span>
         {/* 버튼들 생략 */}
      </div>
    </div>
  );
}