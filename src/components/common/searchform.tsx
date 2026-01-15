import { useState } from 'react';

export type SearchFieldType = 'text' | 'select' | 'date' | 'date-range';

export interface SearchFieldConfig {
  key: string;
  label: string;
  type: SearchFieldType;
  options?: { label: string; value: string }[];
  placeholder?: string;
}

interface SearchFormProps {
  fields: SearchFieldConfig[];
  onSearch: (values: Record<string, any>) => void;
}

export default function SearchForm({ fields, onSearch }: SearchFormProps) {
  const [values, setValues] = useState<Record<string, any>>({});

  const handleChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(values);
  };

  const handleReset = () => {
    setValues({});
    onSearch({});
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6"
    >
      {/* ★ 핵심 레이아웃 변경 ★
         전체를 4등분(lg:grid-cols-4)으로 나눕니다.
      */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* 1. 검색 조건 영역 (3/4 차지) 
           lg:col-span-3 -> 4칸 중 3칸을 사용
           내부에서 다시 grid-cols-3으로 쪼개서 입력창들을 3개씩 배열
        */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {fields.map((field) => (
            <div key={field.key} className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">{field.label}</label>
              
              {/* text type */}
              {field.type === 'text' && (
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder={field.placeholder || '입력하세요'}
                  value={values[field.key] || ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                />
              )}

              {/* date type */}
              {field.type === 'date' && (
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  value={values[field.key] || ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                />
              )}

              {/* select type */}
              {field.type === 'select' && (
                <select
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors bg-white"
                  value={values[field.key] || ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                >
                  {field.placeholder && <option value="">{field.placeholder}</option>}
                  {!field.placeholder && <option value="">ALL</option>}
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}

              {/* date-range type */}
              {field.type === 'date-range' && (
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded px-2 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    value={values[`${field.key}_start`] || ''}
                    onChange={(e) => handleChange(`${field.key}_start`, e.target.value)}
                  />
                  <span className="text-gray-400">~</span>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded px-2 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    value={values[`${field.key}_end`] || ''}
                    onChange={(e) => handleChange(`${field.key}_end`, e.target.value)}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 2. 버튼 영역 (1/4 차지)
           lg:col-span-1 -> 4칸 중 1칸을 사용
           items-end -> 버튼들을 영역의 '바닥'에 붙임 (입력창 마지막 줄과 높이 맞춤)
        */}
        <div className="lg:col-span-1 flex items-end justify-end gap-2 h-full">
          <button
            type="button"
            onClick={handleReset}
            className="whitespace-nowrap px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors h-[38px]"
          >
            초기화
          </button>
          <button
            type="submit"
            className="whitespace-nowrap px-6 py-2 text-sm font-bold text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors shadow-sm h-[38px]"
          >
            검색 조회
          </button>
        </div>
      </div>
    </form>
  );
}