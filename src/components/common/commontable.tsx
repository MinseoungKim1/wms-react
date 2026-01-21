import React, { ReactNode, useState, useMemo } from 'react';
import * as XLSX from 'xlsx'; // npm install xlsx 필요

// 1. 컬럼 설정 타입 정의
export interface ColumnDef<T = any> {
  key: string;            
  label: string;          
  width?: string;         
  align?: 'left' | 'center' | 'right'; 
  render?: (value: any, row: T) => ReactNode; 
}

interface CommonTableProps<T> {
  columns: ColumnDef<T>[];  
  data: T[];                
  isLoading?: boolean;      
  onRowClick?: (row: T) => void; 
  
  // 체크박스 관련
  selectedIds?: (string | number)[];
  onSelectionChange?: (selectedIds: any[]) => void;

  // 검색 필터 관련
  useSearch?: boolean;         
  searchPlaceholder?: string;  

  // 행 추가/삭제 및 엑셀 관련 Props
  onAddRow?: (newRow: T) => void;
  enableAdd?: boolean;
  
  // ★ [추가] 삭제 관련 Props
  onDeleteRows?: (ids: (string | number)[]) => void; // 삭제 핸들러 (선택된 ID 배열 전달)
  enableDelete?: boolean;                            // 삭제 버튼 활성화 여부

  enableExport?: boolean;
  exportFileName?: string;
}

// T는 반드시 id 속성을 가져야 함
export default function CommonTable<T extends { id: string | number }>({
  columns,
  data,
  isLoading = false,
  onRowClick,
  selectedIds = [],
  onSelectionChange,
  useSearch = true,
  searchPlaceholder = "검색어를 입력하세요...",
  
  onAddRow,
  enableAdd = true,
  
  // ★ [추가] 삭제 관련 기본값
  onDeleteRows,
  enableDelete = true,

  enableExport = true,
  exportFileName = "table_export",
}: CommonTableProps<T>) {

  // --- 상태 관리 ---
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 표시 여부
  
  // 모달 입력값 관리 (키: 컬럼 key, 값: 입력값)
  const [newRowData, setNewRowData] = useState<Record<string, any>>({});

  // --- 필터링 로직 ---
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    const lowerTerm = searchTerm.toLowerCase();
    return data.filter((row) => {
      return columns.some((col) => {
        const value = (row as any)[col.key];
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(lowerTerm);
      });
    });
  }, [data, searchTerm, columns]);

  // --- 체크박스 로직 ---
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onSelectionChange) return;
    if (e.target.checked) {
      onSelectionChange(filteredData.map((row) => row.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectRow = (id: string | number) => {
    if (!onSelectionChange) return;
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((sid) => sid !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  // --- 엑셀 내보내기 로직 ---
  const handleExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, `${exportFileName}.xlsx`);
  };

  // --- 행 추가 모달 로직 ---
  const handleOpenModal = () => {
    setNewRowData({}); // 초기화
    setIsModalOpen(true);
  };

  const handleInputChange = (key: string, value: string) => {
    setNewRowData(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveRow = () => {
    if (!onAddRow) return;
    const newId = newRowData['id'] || Date.now().toString();
    const rowToSave = { id: newId, ...newRowData } as T;
    onAddRow(rowToSave); // 부모 컴포넌트에 데이터 전달
    setIsModalOpen(false); // 모달 닫기
  };

  // ★ [추가] 삭제 핸들러
  const handleDelete = () => {
    if (!onDeleteRows || selectedIds.length === 0) return;
    
    // 삭제 전 확인 (선택 사항 - UX 향상)
    if (window.confirm(`${selectedIds.length}건을 삭제하시겠습니까?`)) {
      onDeleteRows(selectedIds);
      // 삭제 후 선택 초기화 (중요: 삭제된 ID가 selectedIds에 남지 않도록)
      if (onSelectionChange) onSelectionChange([]);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden relative">
      
      {/* 1. 상단 툴바 (검색창 + 액션 버튼) */}
      {(useSearch || enableAdd || enableExport || enableDelete) && (
        <div className="p-4 border-b border-gray-100 bg-white flex flex-col sm:flex-row justify-between items-center gap-4">
          
          {/* 좌측: 검색창 */}
          {useSearch ? (
            <div className="relative w-full max-w-sm">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 20 20" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                </svg>
              </div>
              <input 
                type="text" 
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5" 
                placeholder={searchPlaceholder} 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          ) : <div />} {/* 검색창 안 쓸때 flex 공간 차지용 */}

          {/* 우측: 버튼 그룹 */}
          <div className="flex items-center gap-2">
            {enableExport && (
              <button 
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export
              </button>
            )}
            
            {/* ★ [추가] 삭제 버튼 (Add Row 옆에 배치) */}
            {enableDelete && (
              <button 
                onClick={handleDelete}
                // 선택된 항목이 없으면 비활성화 (disabled 스타일 적용)
                disabled={selectedIds.length === 0}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg focus:ring-4 transition-all
                  ${selectedIds.length > 0 
                    ? 'bg-red-600 hover:bg-red-700 focus:ring-red-300' 
                    : 'bg-red-300 cursor-not-allowed'
                  }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete ({selectedIds.length})
              </button>
            )}

            {enableAdd && (
              <button 
                onClick={handleOpenModal}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Add Row
              </button>
            )}
          </div>
        </div>
      )}

      {/* 2. 테이블 영역 */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
            <tr>
              {onSelectionChange && (
                <th className="py-4 px-6 w-10">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    checked={filteredData.length > 0 && filteredData.every(d => selectedIds.includes(d.id))}
                    onChange={handleSelectAll}
                  />
                </th>
              )}
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

          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length + (onSelectionChange ? 1 : 0)} className="py-20 text-center text-gray-400">
                  데이터를 불러오는 중입니다...
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (onSelectionChange ? 1 : 0)} className="py-20 text-center text-gray-400">
                  {searchTerm ? '검색 결과가 없습니다.' : '데이터가 존재하지 않습니다.'}
                </td>
              </tr>
            ) : (
              filteredData.map((row) => (
                <tr 
                  key={row.id} 
                  className={`hover:bg-gray-50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={() => onRowClick?.(row)}
                >
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
                  {columns.map((col) => {
                    const cellValue = (row as any)[col.key];
                    return (
                      <td 
                        key={`${row.id}-${col.key}`} 
                        className={`py-4 px-6 text-gray-700 ${
                          col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
                        }`}
                      >
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
      
      {/* 3. 하단 정보 */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
         <span className="text-sm text-gray-500">
           총 <span className="font-bold text-gray-900">{filteredData.length}</span> 건
         </span>
      </div>

      {/* 행 추가 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 m-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Add New Row</h3>
            
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {columns.map((col) => (
                <div key={col.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {col.label}
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder={`Enter ${col.label}`}
                    value={newRowData[col.key] || ''}
                    onChange={(e) => handleInputChange(col.key, e.target.value)}
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRow}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}