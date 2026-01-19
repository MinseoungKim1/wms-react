// src/views/monitoring/NewMonitoring.tsx
import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';

// 모델 Import
import { STATUS_COLORS, ZONE_COLORS } from './model/monitoring-model';
import type { ViewModeType, MachineData } from './model/monitoring-model';

// 컴포넌트 Import
import MonitoringFilterPanel from './sub-page/MonitoringFilterPannel';
import MonitoringDetailPanel from './sub-page/MonitoringDetailPannel';

// ★ 서비스(API) Import
import { fetchMonitoringData } from './model/api-model';

const NewMonitoring: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  
  // --- 상태 관리 ---
  const [loading, setLoading] = useState<boolean>(true); // 로딩 상태 추가
  const [rawData, setRawData] = useState<MachineData[]>([]);
  const [filteredData, setFilteredData] = useState<MachineData[]>([]);
  
  // UI 컨트롤 상태
  const [selectedZone, setSelectedZone] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<ViewModeType>('STATUS');
  const [selectedTarget, setSelectedTarget] = useState<MachineData | null>(null);

  // Zone 목록 생성
  const zoneList = useMemo(() => {
    const zones = new Set(rawData.map(d => d.zoneType));
    return ['ALL', ...Array.from(zones).sort()];
  }, [rawData]);

  // ----------------------------------------------------------------
  // 1. 데이터 가져오기 (API 호출 시뮬레이션)
  // ----------------------------------------------------------------
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true); // 로딩 시작
        
        // ★ 나중에 실제 API 연결 시 여기만 바꾸면 됩니다!
        // 예: const res = await axios.get('/api/layout/status');
        //     setRawData(res.data);
        
        const data = await fetchMonitoringData(); // 가상 API 호출
        setRawData(data);
      } catch (error) {
        console.error("데이터 로드 실패:", error);
      } finally {
        setLoading(false); // 로딩 종료
      }
    };

    loadData();
    
    // (선택) 30초마다 자동 새로고침 하려면 아래 주석 해제
    // const interval = setInterval(loadData, 30000);
    // return () => clearInterval(interval);
  }, []);

  // ----------------------------------------------------------------
  // 2. 필터링 로직
  // ----------------------------------------------------------------
  useEffect(() => {
    if (selectedZone === 'ALL') {
      setFilteredData(rawData);
    } else {
      setFilteredData(rawData.filter(d => d.zoneType === selectedZone));
    }
  }, [selectedZone, rawData]);

  // ----------------------------------------------------------------
  // 3. D3 렌더링 로직 (시각화)
  // ----------------------------------------------------------------
  useEffect(() => {
    if (!svgRef.current || filteredData.length === 0) return;
    
    // --- SVG 초기화 ---
    const svg = d3.select(svgRef.current);
    
    // 줌(Zoom) 레이어 설정
    let g = svg.select<SVGGElement>('g.content-layer');
    if (g.empty()) {
      g = svg.append('g').attr('class', 'content-layer');
      
      const zoom = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.5, 5])
        .on('zoom', (event) => g.attr('transform', event.transform));
        
      svg.call(zoom);
    }

    // --- (A) 구역 테두리 및 라벨 (Zone Boundaries & Labels) ---
    const zoneGroups = d3.group(filteredData, d => d.zone);
    const zoneBounds = Array.from(zoneGroups).map(([key, values]) => {
      const minX = d3.min(values, d => d.x) || 0;
      const minY = d3.min(values, d => d.y) || 0;
      const maxX = d3.max(values, d => d.x + d.width) || 0;
      const maxY = d3.max(values, d => d.y + d.height) || 0;
      const type = values[0].zoneType;
      
      return { 
        id: key, 
        type,
        x: minX - 3, 
        y: minY - 3, 
        width: (maxX - minX) + 6, 
        height: (maxY - minY) + 6 
      };
    });

    // 테두리 그리기
    g.selectAll<SVGRectElement, any>('.zone-boundary')
      .data(zoneBounds, d => d.id)
      .join(
        enter => enter.insert('rect', '.cell-rect')
          .attr('class', 'zone-boundary')
          .attr('rx', 2),
        update => update,
        exit => exit.remove()
      )
      .attr('x', d => d.x)
      .attr('y', d => d.y)
      .attr('width', d => d.width)
      .attr('height', d => d.height)
      .attr('fill', 'none')
      .attr('stroke', d => ZONE_COLORS[d.type])
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', d => d.type === 'STAGING' ? '3 2' : 'none');

    // 구역 이름(라벨) 표시
    g.selectAll<SVGTextElement, any>('.zone-group-label')
      .data(zoneBounds, d => d.id)
      .join('text')
      .attr('class', 'zone-group-label')
      .attr('x', d => d.x + d.width / 2)
      .attr('y', d => d.y - 5)
      .text(d => d.type === 'STAGING' ? `Staging ${d.id.split('-')[1] || ''}` : d.id)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .attr('fill', d => ZONE_COLORS[d.type])
      .style('pointer-events', 'none');

    // --- (B) 셀(장비) 그리기 ---
    g.selectAll<SVGRectElement, MachineData>('.cell-rect')
      .data(filteredData, d => d.id)
      .join(
        enter => enter.append('rect')
          .attr('class', 'cell-rect')
          .attr('rx', 1)
          .attr('stroke', '#333').attr('stroke-width', 0.5)
          .style('cursor', 'pointer')
          .on('click', (event, d) => {
            // 클릭 시 선택된 데이터를 상태에 저장 -> 하단 패널로 전달됨
            setSelectedTarget(d); 
            
            // 선택 효과 (테두리 진하게)
            g.selectAll('.cell-rect').attr('stroke', '#333').attr('stroke-width', 0.5);
            d3.select(event.currentTarget).attr('stroke', '#000').attr('stroke-width', 2);
          }),
        update => update,
        exit => exit.transition().duration(200).style('opacity', 0).remove()
      )
      .attr('x', d => d.x).attr('y', d => d.y)
      .attr('width', d => d.width).attr('height', d => d.height)
      .transition().duration(500)
      .attr('fill', d => {
        if (viewMode === 'CAPACITY') {
          return d3.interpolateCool(d.currentLoad / d.maxCapacity);
        }
        // Status 모드일 때
        if (d.zoneType === 'STAGING') return '#fff3e0'; 
        return STATUS_COLORS[d.status];
      });

    // --- (C) 셀 내부 텍스트 (ID & %) ---
    g.selectAll<SVGTextElement, MachineData>('.cell-label')
      .data(filteredData, d => d.id)
      .join(
        enter => enter.append('text')
          .attr('class', 'cell-label')
          .attr('text-anchor', 'middle')
          .style('pointer-events', 'none')
          .style('font-size', '6px')
          .style('font-weight', 'bold'),
        update => update,
        exit => exit.remove()
      )
      .attr('x', d => d.x + d.width / 2)
      .attr('y', d => d.y + d.height / 2)
      .each(function(d) {
        const textEl = d3.select(this);
        textEl.text(null);
        
        // ID 축약 로직 (A-01-0-1 -> 0-1)
        const idParts = d.id.split('-');
        const shortID = idParts.length >= 3 
          ? `${idParts[idParts.length-2]}-${idParts[idParts.length-1]}` 
          : d.id;

        if (viewMode === 'STATUS') {
          textEl.append('tspan')
            .attr('dy', '0.35em').attr('x', d.x + d.width / 2)
            .text(shortID);
        } else {
          textEl.append('tspan')
            .attr('dy', '-0.2em').attr('x', d.x + d.width / 2)
            .text(shortID);
          textEl.append('tspan')
            .attr('dy', '1.0em').attr('x', d.x + d.width / 2)
            .style('font-size', '5px')
            .text(`${d.currentLoad}%`);
        }
        
        // 텍스트 색상 결정 (배경이 어두우면 흰색, 밝으면 검은색)
        const isDarkBack = (viewMode === 'CAPACITY') || (viewMode === 'STATUS' && d.zoneType !== 'STAGING');
        textEl.style('fill', isDarkBack ? 'white' : 'black');
        if (isDarkBack) textEl.style('text-shadow', '1px 1px 1px rgba(0,0,0,0.5)');
        else textEl.style('text-shadow', 'none');
      });

  }, [filteredData, viewMode]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'sans-serif' }}>
      
      {/* 1. 상단: 필터 패널 */}
      <MonitoringFilterPanel 
        zones={zoneList}
        selectedZone={selectedZone}
        onZoneChange={setSelectedZone}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      
      {/* 2. 중단: D3 모니터링 영역 */}
      <div style={{ flex: '1 1 60%', position: 'relative', backgroundColor: '#fff', overflow: 'hidden' }}>
        
        {/* 로딩 표시 (데이터 가져오는 중일 때) */}
        {loading && (
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            zIndex: 10, backgroundColor: 'rgba(255,255,255,0.8)', padding: '20px', borderRadius: '8px',
            boxShadow: '0 0 10px rgba(0,0,0,0.1)', fontWeight: 'bold'
          }}>
            데이터 불러오는 중...
          </div>
        )}
        
        <svg ref={svgRef} width="100%" height="100%" style={{ display: 'block' }} />
        
        {/* 범례 (Legend) */}
        <div style={{
          position: 'absolute', bottom: 20, right: 20,
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '15px', borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          border: '1px solid #ddd',
          fontSize: '12px'
        }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
            {viewMode === 'STATUS' ? '상태 범례 (Status)' : '적재율 범례 (Capacity)'}
          </h4>

          {viewMode === 'STATUS' ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {Object.entries(STATUS_COLORS).map(([key, color]) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: 14, height: 14, backgroundColor: color, borderRadius: '2px' }}></div>
                  <span>{key}</span>
                </div>
              ))}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: 14, height: 14, backgroundColor: '#fff3e0', border: '1px solid #fd7e14', borderStyle: 'dashed', borderRadius: '2px' }}></div>
                <span>대기 구역</span>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '10px' }}>
                <span>0% (비어있음)</span>
                <span>100% (가득참)</span>
              </div>
              <div style={{ 
                width: '180px', height: '12px', 
                background: 'linear-gradient(to right, #ffffff, #00ffff, #ff00ff)',
                borderRadius: '6px', marginBottom: '10px'
              }}></div>
            </div>
          )}
        </div>
      </div>

      {/* 3. 하단: 상세 정보 패널 (선택된 데이터 전달) */}
      <MonitoringDetailPanel data={selectedTarget} />
    </div>
  );
};

export default NewMonitoring;