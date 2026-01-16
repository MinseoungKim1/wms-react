import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';

// --- 1. 타입 및 데이터 생성 로직 (이전과 동일) ---
interface CellData {
    id: string;
    zone: string;
    row: number;
    col: number;
    fillRate: number;
    status: 'active' | 'error' | 'empty';
}

const generateData = (): CellData[] => {
    const data: CellData[] = [];
    for (let r = 0; r < 10; r++) {
        for (let c = 0; c < 20; c++) {
            if (c === 5 || c === 12) continue; // 통로
            data.push({
                id: `R-${r}-${c}`,
                zone: c < 10 ? 'A' : 'B', // 10열 기준 구역 나눔
                row: r,
                col: c,
                fillRate: Math.floor(Math.random() * 101),
                status: Math.random() > 0.9 ? 'error' : 'active'
            });
        }
    }
    return data;
};

// --- 2. 메인 컴포넌트 ---
export default function FABMonitering() {
    // State 관리 (전체 데이터, 필터, 선택된 아이템)
    const [data] = useState<CellData[]>(() => generateData());
    const [filterZone, setFilterZone] = useState<string>('ALL');
    const [selectedId, setSelectedId] = useState<string | null>(null);
    
    // D3 Zoom을 위한 Ref
    const svgRef = useRef<SVGSVGElement>(null);
    const gRef = useRef<SVGGElement>(null);

    // 필터링된 데이터 계산
    const filteredData = useMemo(() => {
        if (filterZone === 'ALL') return data;
        return data.filter(d => d.zone === filterZone);
    }, [data, filterZone]);

    // D3 Zoom 초기화
    useEffect(() => {
        if (!svgRef.current || !gRef.current) return;
        const zoom = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.5, 5])
            .on('zoom', (event) => {
                d3.select(gRef.current).attr('transform', event.transform);
            });
        d3.select(svgRef.current).call(zoom);
    }, []);

    // 색상 스케일
    const colorScale = d3.scaleLinear<string>()
        .domain([0, 100])
        .range(['#e2e8f0', '#3b82f6']);

    return (
        <div className="flex flex-col h-screen w-full bg-slate-100 p-4 gap-4">
            
            {/* 상단 레이아웃: 맵(왼쪽) + 컨트롤/리스트(오른쪽) */}
            <div className="flex flex-1 gap-4 overflow-hidden">
                
                {/* 1. FABMonitering Section (메인 맵 시각화) */}
                <div className="FABMonitering Section flex-grow bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden relative">
                    <div className="absolute top-4 left-4 z-10 bg-slate-800/80 text-white px-3 py-1 rounded text-sm font-bold">
                        Main Monitoring Map
                    </div>
                    
                    <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing bg-slate-900">
                        <g ref={gRef}>
                            {/* 필터링된 데이터 렌더링 */}
                            {data.map((cell) => {
                                // 필터링 조건에 맞지 않으면 흐리게 처리
                                const isDimmed = filterZone !== 'ALL' && cell.zone !== filterZone;
                                const isSelected = selectedId === cell.id;

                                return (
                                    <g 
                                        key={cell.id}
                                        transform={`translate(${cell.col * 45 + 50}, ${cell.row * 45 + 50})`}
                                        onClick={() => setSelectedId(cell.id)}
                                        style={{ opacity: isDimmed ? 0.1 : 1, transition: 'opacity 0.3s' }}
                                    >
                                        <rect
                                            width={40}
                                            height={40}
                                            rx={4}
                                            fill={cell.status === 'error' ? '#ef4444' : colorScale(cell.fillRate)}
                                            stroke={isSelected ? '#fff' : 'none'}
                                            strokeWidth={3}
                                            className="hover:brightness-110 transition-all cursor-pointer"
                                        />
                                        <text
                                            x={20} y={20} dy=".35em" textAnchor="middle"
                                            className="text-[10px] pointer-events-none fill-slate-800 font-bold"
                                            style={{ fill: cell.fillRate > 50 || cell.status === 'error' ? 'white' : 'black' }}
                                        >
                                            {cell.fillRate}%
                                        </text>
                                    </g>
                                );
                            })}
                        </g>
                    </svg>
                </div>

                {/* 오른쪽 사이드 패널 */}
                <div className="flex flex-col w-96 gap-4">
                    
                    {/* 2. FABMonitering Conditional Section (필터 및 통계) */}
                    <div className="FABMonitering Conditional Section bg-white p-4 rounded-xl shadow-md border border-slate-200 h-1/3">
                        <h3 className="text-lg font-bold text-slate-700 mb-4 border-b pb-2">Control Panel</h3>
                        
                        {/* Zone Filter */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-500 mb-1">Select Zone</label>
                            <div className="flex gap-2">
                                {['ALL', 'A', 'B'].map(z => (
                                    <button
                                        key={z}
                                        onClick={() => setFilterZone(z)}
                                        className={`px-3 py-1 rounded text-sm font-bold transition-colors ${
                                            filterZone === z 
                                            ? 'bg-blue-600 text-white' 
                                            : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                                        }`}
                                    >
                                        {z} Zone
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Summary Stats */}
                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-slate-50 p-3 rounded border">
                                <div className="text-xs text-slate-400">Total Units</div>
                                <div className="text-xl font-bold text-slate-800">{filteredData.length}</div>
                            </div>
                            <div className="bg-red-50 p-3 rounded border border-red-100">
                                <div className="text-xs text-red-400">Errors</div>
                                <div className="text-xl font-bold text-red-600">
                                    {filteredData.filter(d => d.status === 'error').length}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. FABMonitering Conditional Result List Section (결과 목록) */}
                    <div className="FABMonitering Conditional Result List Section bg-white p-4 rounded-xl shadow-md border border-slate-200 flex-1 overflow-hidden flex flex-col">
                        <h3 className="text-lg font-bold text-slate-700 mb-2 border-b pb-2">Result List</h3>
                        
                        <div className="overflow-y-auto flex-1 pr-2 space-y-2">
                            {filteredData.map(cell => (
                                <div 
                                    key={cell.id}
                                    onClick={() => setSelectedId(cell.id)}
                                    className={`p-3 rounded border cursor-pointer transition-all flex justify-between items-center ${
                                        selectedId === cell.id 
                                        ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' 
                                        : 'bg-white border-slate-200 hover:bg-slate-50'
                                    }`}
                                >
                                    <div>
                                        <div className="font-bold text-sm text-slate-700">{cell.id}</div>
                                        <div className="text-xs text-slate-400">Zone {cell.zone} • Row {cell.row}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-xs font-bold px-2 py-0.5 rounded ${
                                            cell.status === 'error' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                                        }`}>
                                            {cell.status.toUpperCase()}
                                        </div>
                                        <div className="text-xs font-mono mt-1">{cell.fillRate}% Load</div>
                                    </div>
                                </div>
                            ))}
                            {filteredData.length === 0 && (
                                <div className="text-center text-slate-400 py-10">No Data Found</div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}