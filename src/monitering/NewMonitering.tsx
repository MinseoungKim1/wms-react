import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';

// ----------------------------------------------------------------
// 1. 데이터 모델 정의
// ----------------------------------------------------------------

// 셀 내부에 적재된 아이템 정보
interface StoredItem {
  itemId: string;
  itemName: string;
  lotId: string;
  quantity: number;
  inDate: string;
}

// 장비/셀 데이터 (Zone, Capacity 정보 추가)
interface MachineData {
  id: string;
  zone: string;      // 구역 (A, B, C...)
  x: number;
  y: number;
  width: number;
  height: number;
  status: 'RUN' | 'IDLE' | 'DOWN' | 'PM';
  maxCapacity: number; // 최대 적재량
  currentLoad: number; // 현재 적재량
  items: StoredItem[]; // 적재된 아이템 리스트
}

// ----------------------------------------------------------------
// 2. 상수 및 스타일 정의
// ----------------------------------------------------------------

const STATUS_COLORS = {
  RUN: '#28a745',   // 녹색
  IDLE: '#ffc107',  // 노란색
  DOWN: '#dc3545',  // 빨간색
  PM: '#6c757d'     // 회색
};

// 적재율(Capacity)에 따른 색상 스케일 (0% 연한파랑 -> 100% 진한파랑 or 경고색)
// D3의 interpolate 기능을 사용하여 0~100% 사이 색상을 자동 계산
const getCapacityColor = (current: number, max: number) => {
  const ratio = current / max;
  // 0.0(흰색) ~ 1.0(보라색) 보간
  return d3.interpolateCool(ratio); 
};

// ----------------------------------------------------------------
// 3. 컴포넌트 시작
// ----------------------------------------------------------------

const NewMonitoring: React.FC = () => {
  // --- Refs ---
  const svgRef = useRef<SVGSVGElement | null>(null);
  
  // --- State ---
  const [rawData, setRawData] = useState<MachineData[]>([]); // 전체 데이터
  const [filteredData, setFilteredData] = useState<MachineData[]>([]); // 필터링된 데이터
  
  // 검색 조건 State
  const [selectedZone, setSelectedZone] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'STATUS' | 'CAPACITY'>('STATUS'); // 보기 모드
  
  // 선택된 장비(하단 디테일용)
  const [selectedTarget, setSelectedTarget] = useState<MachineData | null>(null);

  // --- Zone 목록 추출 (데이터 기반) ---
  const zoneList = useMemo(() => {
    const zones = new Set(rawData.map(d => d.zone));
    return ['ALL', ...Array.from(zones).sort()];
  }, [rawData]);

  // ----------------------------------------------------------------
  // 4. 데이터 생성 및 로드 (Mock)
  // ----------------------------------------------------------------
  useEffect(() => {
    const initData = () => {
      const dummyData: MachineData[] = [];
      const zones = ['A', 'B', 'C'];
      
      // 구역별로 위치를 다르게 배치하여 시뮬레이션
      zones.forEach((zone, zIdx) => {
        const startX = 50 + (zIdx * 350); // Zone별 가로 간격
        
        for (let i = 0; i < 5; i++) { // 행
          for (let j = 0; j < 6; j++) { // 열
            const maxCapa = 100;
            const curLoad = Math.floor(Math.random() * 101); // 0~100 랜덤
            
            // 더미 아이템 생성
            const items: StoredItem[] = Array.from({ length: Math.floor(curLoad / 20) }).map((_, idx) => ({
              itemId: `ITM-${zone}-${i}-${j}-${idx}`,
              itemName: `Module-${String.fromCharCode(65 + idx)}`,
              lotId: `LOT-${Date.now().toString().slice(-4)}-${idx}`,
              quantity: 10,
              inDate: '2025-10-20'
            }));

            dummyData.push({
              id: `${zone}-${i}-${j}`,
              zone: zone,
              x: startX + j * 50,
              y: 100 + i * 80,
              width: 40,
              height: 60,
              status: ['RUN', 'IDLE', 'DOWN', 'PM'][Math.floor(Math.random() * 4)] as any,
              maxCapacity: maxCapa,
              currentLoad: curLoad,
              items: items
            });
          }
        }
      });
      setRawData(dummyData);
    };

    initData();
  }, []);

  // ----------------------------------------------------------------
  // 5. 필터링 로직 (Zone 선택 시)
  // ----------------------------------------------------------------
  useEffect(() => {
    if (selectedZone === 'ALL') {
      setFilteredData(rawData);
    } else {
      setFilteredData(rawData.filter(d => d.zone === selectedZone));
    }
    // 필터 변경 시 선택된 타겟 초기화 (선택된게 사라질 수 있으므로)
    setSelectedTarget(null);
  }, [selectedZone, rawData]);

  // ----------------------------------------------------------------
  // 6. D3 렌더링 로직
  // ----------------------------------------------------------------
  useEffect(() => {
    if (!svgRef.current || filteredData.length === 0) return;

    const svg = d3.select(svgRef.current);
    
    // Zoom Layer
    let g = svg.select<SVGGElement>('g.content-layer');
    if (g.empty()) {
      g = svg.append('g').attr('class', 'content-layer');
      const zoom = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.5, 5])
        .on('zoom', (e) => g.attr('transform', e.transform));
      svg.call(zoom);
    }

    // --- (A) Rect 그리기 (Cell) ---
    g.selectAll<SVGRectElement, MachineData>('.cell-rect')
      .data(filteredData, d => d.id)
      .join(
        enter => enter.append('rect')
          .attr('class', 'cell-rect')
          .attr('x', d => d.x)
          .attr('y', d => d.y)
          .attr('width', d => d.width)
          .attr('height', d => d.height)
          .attr('rx', 4)
          .attr('stroke', '#555')
          .attr('stroke-width', 1)
          .attr('fill', '#fff')
          .style('cursor', 'pointer')
          .on('click', (e, d) => {
            setSelectedTarget(d);
            // 전체 초기화 후 선택된 것만 강조
            g.selectAll('.cell-rect').attr('stroke', '#555').attr('stroke-width', 1);
            d3.select(e.currentTarget).attr('stroke', '#000').attr('stroke-width', 3);
          }),
        update => update,
        exit => exit
          .transition().duration(300)
          .style('opacity', 0)
          .remove()
      )
      // 색상 애니메이션
      .transition().duration(500)
      .attr('fill', d => {
        if (viewMode === 'STATUS') return STATUS_COLORS[d.status];
        return getCapacityColor(d.currentLoad, d.maxCapacity);
      });

    // --- (B) 텍스트 그리기 (ID + %) ---
    // 기존 .text() 방식은 줄바꿈이 안되므로 .each()와 tspan을 사용해 정교하게 제어합니다.
    g.selectAll<SVGTextElement, MachineData>('.cell-label')
      .data(filteredData, d => d.id)
      .join(
        enter => enter.append('text')
          .attr('class', 'cell-label')
          .attr('text-anchor', 'middle')
          .style('pointer-events', 'none')
          .style('fill', 'white')
          .style('text-shadow', '1px 1px 2px black') // 가독성을 위한 그림자
          .style('font-size', '11px'),
        update => update,
        exit => exit.remove()
      )
      // 위치 업데이트
      .attr('x', d => d.x + d.width / 2)
      .attr('y', d => d.y + d.height / 2)
      // ★ 핵심 수정: 모드에 따라 텍스트 내용 구성 (ID 필수 포함)
      .each(function(d) {
        const textEl = d3.select(this);
        textEl.text(null); // 기존 텍스트 초기화

        if (viewMode === 'STATUS') {
          // [상태 모드] ID만 중앙에 크게 표시
          textEl.append('tspan')
            .attr('dy', '0.35em') // 수직 중앙 정렬
            .attr('x', d.x + d.width / 2) // tspan은 x를 다시 지정해줘야 함
            .style('font-weight', 'bold')
            .text(d.id);
        } else {
          // [적재율 모드] ID(위) + %(아래) 표시
          // 1. ID 표시
          textEl.append('tspan')
            .attr('dy', '-0.4em') // 약간 위로 올림
            .attr('x', d.x + d.width / 2)
            .style('font-weight', 'bold')
            .text(d.id);

          // 2. 적재율(%) 표시
          textEl.append('tspan')
            .attr('dy', '1.2em') // 다음 줄로 내림
            .attr('x', d.x + d.width / 2)
            .style('font-size', '9px') // 글씨 약간 작게
            .text(`${d.currentLoad}%`);
        }
      });

  }, [filteredData, viewMode]); // 의존성 배열: 데이터나 모드가 바뀌면 리렌더링

  // ----------------------------------------------------------------
  // 7. UI 렌더링
  // ----------------------------------------------------------------
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'sans-serif' }}>
      
      {/* (1) 상단 검색/조건 테이블 */}
      <header style={{ 
        padding: '15px', 
        backgroundColor: '#f8f9fa', 
        borderBottom: '1px solid #ddd',
        display: 'flex', 
        alignItems: 'center', 
        gap: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
      }}>
        <h3 style={{ margin: 0, color: '#333' }}>FAB Monitoring</h3>
        
        {/* Zone 선택 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontWeight: 'bold' }}>Target Zone:</label>
          <select 
            value={selectedZone} 
            onChange={(e) => setSelectedZone(e.target.value)}
            style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            {zoneList.map(z => <option key={z} value={z}>{z}</option>)}
          </select>
        </div>

        {/* View Mode 선택 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontWeight: 'bold' }}>View Mode:</label>
          <div style={{ display: 'flex', border: '1px solid #ccc', borderRadius: '4px', overflow: 'hidden' }}>
            <button 
              onClick={() => setViewMode('STATUS')}
              style={{ 
                padding: '6px 12px', border: 'none', cursor: 'pointer',
                background: viewMode === 'STATUS' ? '#007bff' : '#fff',
                color: viewMode === 'STATUS' ? '#fff' : '#333'
              }}
            >
              Status (상태)
            </button>
            <button 
              onClick={() => setViewMode('CAPACITY')}
              style={{ 
                padding: '6px 12px', border: 'none', cursor: 'pointer',
                background: viewMode === 'CAPACITY' ? '#6610f2' : '#fff',
                color: viewMode === 'CAPACITY' ? '#fff' : '#333'
              }}
            >
              Capacity (적재율)
            </button>
          </div>
        </div>
      </header>

      {/* (2) 메인 모니터링 영역 (D3) */}
      <div style={{ flex: '1 1 60%', position: 'relative', backgroundColor: '#e9ecef', overflow: 'hidden' }}>
        <svg ref={svgRef} width="100%" height="100%" style={{ display: 'block' }} />
        
        {/* 범례 (Legend) */}
        <div style={{ position: 'absolute', bottom: 10, right: 10, background: 'rgba(255,255,255,0.9)', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}>
          <small style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
            {viewMode === 'STATUS' ? 'Machine Status' : 'Capacity Level'}
          </small>
          {viewMode === 'STATUS' ? (
             Object.entries(STATUS_COLORS).map(([k, v]) => (
               <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                 <div style={{ width: 12, height: 12, background: v }}></div>
                 <span style={{ fontSize: '11px' }}>{k}</span>
               </div>
             ))
          ) : (
            <div style={{ width: '100px', height: '10px', background: 'linear-gradient(to right, #ffffff, #6610f2)' }}></div>
          )}
        </div>
      </div>

      {/* (3) 하단 상세 정보 영역 (Capacity & Item List) */}
      <div style={{ 
        flex: '0 0 35%', // 화면 하단 35% 차지
        borderTop: '2px solid #333', 
        backgroundColor: '#fff', 
        padding: '20px',
        display: 'flex',
        gap: '30px',
        overflowY: 'auto'
      }}>
        {selectedTarget ? (
          <>
            {/* 왼쪽: Capacity 게이지 & 기본 정보 */}
            <div style={{ flex: '0 0 300px' }}>
              <h4 style={{ marginTop: 0, borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>
                Cell Detail: <span style={{ color: '#007bff' }}>{selectedTarget.id}</span>
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, lineHeight: '1.8' }}>
                <li><strong>Zone:</strong> {selectedTarget.zone}</li>
                <li><strong>Status:</strong> {selectedTarget.status}</li>
                <li style={{ marginTop: '10px' }}>
                  <strong>Capacity Utilization:</strong>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px' }}>
                    <div style={{ flex: 1, height: '20px', background: '#e0e0e0', borderRadius: '10px', overflow: 'hidden' }}>
                      <div style={{ 
                        width: `${(selectedTarget.currentLoad / selectedTarget.maxCapacity) * 100}%`, 
                        height: '100%', 
                        background: selectedTarget.currentLoad > 90 ? '#dc3545' : '#28a745',
                        transition: 'width 0.3s ease'
                      }}></div>
                    </div>
                    <span style={{ fontWeight: 'bold' }}>
                      {selectedTarget.currentLoad} / {selectedTarget.maxCapacity} ({Math.round((selectedTarget.currentLoad / selectedTarget.maxCapacity) * 100)}%)
                    </span>
                  </div>
                </li>
              </ul>
            </div>

            {/* 오른쪽: Item List 테이블 */}
            <div style={{ flex: 1 }}>
              <h4 style={{ marginTop: 0, borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>
                Stacked Items
              </h4>
              {selectedTarget.items.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ background: '#f1f3f5', borderBottom: '2px solid #dee2e6' }}>
                      <th style={{ padding: '8px', textAlign: 'left' }}>Item ID</th>
                      <th style={{ padding: '8px', textAlign: 'left' }}>Name</th>
                      <th style={{ padding: '8px', textAlign: 'left' }}>Lot ID</th>
                      <th style={{ padding: '8px', textAlign: 'right' }}>Qty</th>
                      <th style={{ padding: '8px', textAlign: 'center' }}>In Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedTarget.items.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '8px' }}>{item.itemId}</td>
                        <td style={{ padding: '8px' }}>{item.itemName}</td>
                        <td style={{ padding: '8px' }}>{item.lotId}</td>
                        <td style={{ padding: '8px', textAlign: 'right' }}>{item.quantity}</td>
                        <td style={{ padding: '8px', textAlign: 'center' }}>{item.inDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                  No items stored in this cell.
                </div>
              )}
            </div>
          </>
        ) : (
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#aaa', fontStyle: 'italic' }}>
            Select a cell from the monitoring map to view details.
          </div>
        )}
      </div>

    </div>
  );
};

export default NewMonitoring;