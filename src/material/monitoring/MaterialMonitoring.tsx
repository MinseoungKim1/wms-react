import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';

// 모델 Import
import { STATUS_COLORS, ZONE_COLORS } from './model/monitoring-model';
import type { StoredItem, ViewModeType, MachineData, ZoneType } from './model/monitoring-model';

import MonitoringFilterPanel from './sub-page/MonitoringFilterPannel';
import MonitoringDetailPanel from './sub-page/MonitoringDetailPannel';

const MaterialMonitoring: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  
  const [rawData, setRawData] = useState<MachineData[]>([]);
  const [filteredData, setFilteredData] = useState<MachineData[]>([]);
  const [selectedZone, setSelectedZone] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<ViewModeType>('STATUS');
  const [selectedTarget, setSelectedTarget] = useState<MachineData | null>(null);

  const zoneList = useMemo(() => {
    const zones = new Set(rawData.map(d => d.zoneType));
    return ['ALL', ...Array.from(zones).sort()];
  }, [rawData]);

  // ----------------------------------------------------------------
  // [핵심] 사진 속 좌표를 그대로 옮긴 레이아웃 생성 로직
  // ----------------------------------------------------------------
  useEffect(() => {
    const generateLayout = () => {
      const data: MachineData[] = [];
      
      const CELL_W = 28;  
      const CELL_H = 18;  
      const GAP = 4;
      const BIG_W = 40;
      const BIG_H = 60;

      // (1) 블록 정의
      const layoutConfig = [
        // === [상단 구역] Vertical Red Lines ===
        { id: 'A-01', type: 'STORAGE_A', x: 60,  y: 50, rows: 16, cols: 1 },
        { id: 'A-02', type: 'STORAGE_A', x: 100, y: 50, rows: 16, cols: 1 },
        { id: 'A-03', type: 'STORAGE_A', x: 140, y: 50, rows: 16, cols: 1 },
        { id: 'A-04', type: 'STORAGE_A', x: 230, y: 50, rows: 16, cols: 1 },
        { id: 'A-05', type: 'STORAGE_A', x: 270, y: 50, rows: 16, cols: 1 },
        { id: 'A-06', type: 'STORAGE_A', x: 310, y: 50, rows: 16, cols: 1 },
        { id: 'A-07', type: 'STORAGE_A', x: 410, y: 50, rows: 16, cols: 1 },
        { id: 'A-08', type: 'STORAGE_A', x: 450, y: 50, rows: 16, cols: 1 },
        { id: 'A-09', type: 'STORAGE_A', x: 490, y: 50, rows: 16, cols: 1 },
        { id: 'A-10', type: 'STORAGE_A', x: 580, y: 50, rows: 16, cols: 1 },
        { id: 'A-11', type: 'STORAGE_A', x: 620, y: 50, rows: 16, cols: 1 },
        { id: 'A-12', type: 'STORAGE_A', x: 660, y: 50, rows: 16, cols: 1 },
        { id: 'A-13', type: 'STORAGE_A', x: 760, y: 50, rows: 16, cols: 1 },
        { id: 'A-14', type: 'STORAGE_A', x: 800, y: 50, rows: 16, cols: 1 },
        { id: 'A-15', type: 'STORAGE_A', x: 840, y: 50, rows: 10, cols: 1 },

        // === [대기 구역] Orange Lines ===
        { id: 'STG-L1', type: 'STAGING', x: 20, y: 50, rows: 16, cols: 1, w: 20 }, 
        { id: 'STG-M1', type: 'STAGING', x: 190, y: 50, rows: 16, cols: 1, w: 20 },
        { id: 'STG-M2', type: 'STAGING', x: 360, y: 50, rows: 16, cols: 1, w: 20 },
        { id: 'STG-M3', type: 'STAGING', x: 540, y: 50, rows: 16, cols: 1, w: 20 },
        { id: 'STG-M4', type: 'STAGING', x: 720, y: 50, rows: 16, cols: 1, w: 20 },
        
        // === [하단 중앙] 가로 긴 대기 구역 ===
        { id: 'STG-HZ', type: 'STAGING', x: 60, y: 430, rows: 1, cols: 20, w: 30, h: 20 },

        // === [하단 좌측] Blue Area ===
        { id: 'B-TOP', type: 'STORAGE_B', x: 250, y: 480, rows: 1, cols: 7, w: BIG_W, h: BIG_H },
        { id: 'B-BOT', type: 'STORAGE_B', x: 250, y: 610, rows: 1, cols: 6, w: BIG_W, h: BIG_H },

        // === [하단 우측] Green Area ===
        { id: 'C-BOT', type: 'STORAGE_C', x: 530, y: 610, rows: 1, cols: 7, w: BIG_W, h: BIG_H },

        // === [하단 대기 구역] Orange ===
        { id: 'STG-B', type: 'STAGING', x: 250, y: 570, rows: 1, cols: 7, w: BIG_W, h: 15 },
        { id: 'STG-C', type: 'STAGING', x: 570, y: 570, rows: 1, cols: 7, w: BIG_W, h: 15 },
      ] as const;

      // (2) 데이터 생성 루프
      layoutConfig.forEach(cfg => {
        const _w = cfg.w || CELL_W;
        const _h = cfg.h || CELL_H;
        
        for (let r = 0; r < cfg.rows; r++) {
          for (let c = 0; c < cfg.cols; c++) {
            const x = cfg.x + (c * (_w + GAP));
            const y = cfg.y + (r * (_h + GAP));
            
            const curLoad = Math.floor(Math.random() * 101);
            const items: StoredItem[] = Array.from({ length: Math.floor(curLoad / 20) }).map((_, idx) => ({
              itemId: `ITM-${idx}`, itemName: 'Part', lotId: 'L-1', quantity: 10, inDate: '2025-01-20'
            }));

            // 셀 ID 생성 (화면 표시용 간소화)
            // Staging 구역은 'S-1', 'S-2' 등으로 보이게 하거나 그대로 사용
            data.push({
              id: `${cfg.id}-${r}-${c}`, 
              zone: cfg.id,          
              zoneType: cfg.type as ZoneType,
              x, y,
              width: _w,
              height: _h,
              status: ['RUN', 'IDLE', 'DOWN', 'PM'][Math.floor(Math.random() * 4)] as any,
              maxCapacity: 100,
              currentLoad: curLoad,
              items: items
            });
          }
        }
      });

      setRawData(data);
    };

    generateLayout();
  }, []);

  // 2. 필터링 로직
  useEffect(() => {
    if (selectedZone === 'ALL') {
      setFilteredData(rawData);
    } else {
      setFilteredData(rawData.filter(d => d.zoneType === selectedZone));
    }
    setSelectedTarget(null);
  }, [selectedZone, rawData]);

  // 3. D3 렌더링 로직
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

    // ------------------------------------------------------------
    // (A) Zone Boundary Calculation (구역 테두리 계산)
    // ------------------------------------------------------------
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
      .attr('stroke-dasharray', d => d.type === 'STAGING' ? '3 2' : 'none'); // 대기존 점선 처리

    // ------------------------------------------------------------
    // (B) Zone Labels (구역 이름 표시 - 핵심 추가 사항)
    // ------------------------------------------------------------
    g.selectAll<SVGTextElement, any>('.zone-group-label')
      .data(zoneBounds, d => d.id)
      .join('text')
      .attr('class', 'zone-group-label')
      .attr('x', d => d.x + d.width / 2) // 박스 중앙 정렬
      .attr('y', d => d.y - 5)           // 박스 바로 위
      .text(d => {
        // ID를 좀 더 읽기 쉽게 변환 (선택 사항)
        // ex: "STG-L1" -> "Staging L1"
        if (d.type === 'STAGING') return `Staging ${d.id.split('-')[1] || ''}`;
        return d.id; // "A-01", "B-TOP" 등
      })
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .attr('fill', d => ZONE_COLORS[d.type]) // 구역 색상과 깔맞춤
      .style('pointer-events', 'none');


    // ------------------------------------------------------------
    // (C) Cells (설비 박스)
    // ------------------------------------------------------------
    g.selectAll<SVGRectElement, MachineData>('.cell-rect')
      .data(filteredData, d => d.id)
      .join(
        enter => enter.append('rect')
          .attr('class', 'cell-rect')
          .attr('rx', 1)
          .attr('stroke', '#333').attr('stroke-width', 0.5)
          .style('cursor', 'pointer')
          .on('click', (e, d) => {
            setSelectedTarget(d);
            g.selectAll('.cell-rect').attr('stroke', '#333').attr('stroke-width', 0.5);
            d3.select(e.currentTarget).attr('stroke', '#000').attr('stroke-width', 2);
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
        if (d.zoneType === 'STAGING') return '#fff3e0'; 
        return STATUS_COLORS[d.status];
      });

    // ------------------------------------------------------------
    // (D) Text Labels (Individual Cell ID & Capacity)
    // ------------------------------------------------------------
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
        
        // 셀 ID 간소화 (예: "A-01-0-1" -> "0-1")
        const idParts = d.id.split('-');
        const shortID = idParts.length >= 3 
          ? `${idParts[idParts.length-2]}-${idParts[idParts.length-1]}` // 뒤에 두자리만
          : d.id;

        if (viewMode === 'STATUS') {
          // [Status 모드] ID 표시
          textEl.append('tspan')
            .attr('dy', '0.35em')
            .attr('x', d.x + d.width / 2)
            .text(shortID);
        } else {
          // [Capacity 모드] ID + % 표시
          textEl.append('tspan')
            .attr('dy', '-0.2em')
            .attr('x', d.x + d.width / 2)
            .text(shortID);
          
          textEl.append('tspan')
            .attr('dy', '1.0em')
            .attr('x', d.x + d.width / 2)
            .style('font-size', '5px')
            .text(`${d.currentLoad}%`);
        }
        
        // 글씨 색상 (가독성)
        const isDarkBack = (viewMode === 'CAPACITY') || (viewMode === 'STATUS' && d.zoneType !== 'STAGING');
        textEl.style('fill', isDarkBack ? 'white' : 'black');
        if (isDarkBack) textEl.style('text-shadow', '1px 1px 1px rgba(0,0,0,0.5)');
        else textEl.style('text-shadow', 'none');
      });

  }, [filteredData, viewMode]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'sans-serif' }}>
      
      <MonitoringFilterPanel 
        zones={zoneList}
        selectedZone={selectedZone}
        onZoneChange={setSelectedZone}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      
      <div style={{ flex: '1 1 60%', position: 'relative', backgroundColor: '#fff', overflow: 'hidden' }}>
        <svg ref={svgRef} width="100%" height="100%" style={{ display: 'block' }} />
        
        {/* Legend */}
        <div style={{
          position: 'absolute', bottom: 20, right: 20,
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '15px', borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          border: '1px solid #ddd',
          fontSize: '12px'
        }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
            {viewMode === 'STATUS' ? 'Status Legend' : 'Capacity Legend'}
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
                <span>Staging Area</span>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '10px' }}>
                <span>0%</span>
                <span>100%</span>
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

      <MonitoringDetailPanel data={selectedTarget} />
    </div>
  );
};

export default MaterialMonitoring;