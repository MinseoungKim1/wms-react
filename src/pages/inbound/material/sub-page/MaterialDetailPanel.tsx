import React from 'react';
import { STATUS_COLORS } from '../model/Material-model';
import type { MachineData, StoredItem } from '../model/Material-model';

// ----------------------------------------------------------------------
// [Sub Component 1] 적재율 게이지 바 (Capacity Gauge)
// ----------------------------------------------------------------------
interface GaugeProps {
  current: number;
  max: number;
}

const CapacityGauge: React.FC<GaugeProps> = ({ current, max }) => {
  const ratio = (current / max) * 100;
  // 90% 이상이면 빨간색(경고), 아니면 초록색
  const isOverloaded = ratio > 90; 
  const barColor = isOverloaded ? '#dc3545' : '#28a745';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px' }}>
      {/* 배경 바 */}
      <div style={{ flex: 1, height: '20px', background: '#e0e0e0', borderRadius: '10px', overflow: 'hidden' }}>
        {/* 실제 게이지 */}
        <div style={{ 
          width: `${ratio}%`, 
          height: '100%', 
          background: barColor,
          transition: 'width 0.3s ease'
        }}></div>
      </div>
      {/* 텍스트 정보 */}
      <span style={{ fontWeight: 'bold', fontSize: '13px', minWidth: '80px', textAlign: 'right' }}>
        {current} / {max} ({Math.round(ratio)}%)
      </span>
    </div>
  );
};

// ----------------------------------------------------------------------
// [Sub Component 2] 아이템 리스트 테이블 (Item List Table)
// ----------------------------------------------------------------------
interface TableProps {
  items: StoredItem[];
}

const ItemTable: React.FC<TableProps> = ({ items }) => {
  if (items.length === 0) {
    return (
      <div style={{ padding: '40px 0', textAlign: 'center', color: '#999', fontStyle: 'italic' }}>
        보관된 아이템이 없습니다. (Empty)
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
        <thead>
          <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6', color: '#495057' }}>
            <th style={{ padding: '10px', textAlign: 'left' }}>Item ID</th>
            <th style={{ padding: '10px', textAlign: 'left' }}>Name</th>
            <th style={{ padding: '10px', textAlign: 'left' }}>Lot ID</th>
            <th style={{ padding: '10px', textAlign: 'right' }}>Qty</th>
            <th style={{ padding: '10px', textAlign: 'center' }}>In Date</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={`${item.itemId}-${idx}`} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '8px 10px' }}>{item.itemId}</td>
              <td style={{ padding: '8px 10px', fontWeight: 'bold', color: '#333' }}>{item.itemName}</td>
              <td style={{ padding: '8px 10px', color: '#666' }}>{item.lotId}</td>
              <td style={{ padding: '8px 10px', textAlign: 'right', color: '#007bff' }}>{item.quantity}</td>
              <td style={{ padding: '8px 10px', textAlign: 'center', color: '#888' }}>{item.inDate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ----------------------------------------------------------------------
// [Main Component] 상세 패널 (Detail Panel)
// ----------------------------------------------------------------------
interface Props {
  data: MachineData | null;
}

const MaterialDetailPanel: React.FC<Props> = ({ data }) => {
  // 1. 데이터가 없을 때 (선택 안함)
  if (!data) {
    return (
      <div style={{ 
        flex: '0 0 35%', 
        height: '35vh',
        borderTop: '1px solid #ddd', 
        backgroundColor: '#fdfdfd', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        color: '#aaa', 
        flexDirection: 'column',
        gap: '10px'
      }}>
        <div style={{ fontSize: '24px' }}>👆</div>
        <div>상세 정보를 확인하려면 모니터링 화면에서 <b>셀(Cell)</b>을 클릭하세요.</div>
      </div>
    );
  }

  // 2. 데이터가 있을 때 렌더링
  return (
    <div style={{ 
      flex: '0 0 35%', 
      height: '35vh',
      borderTop: '2px solid #333', 
      backgroundColor: '#fff', 
      padding: '20px',
      display: 'flex',
      gap: '40px', // 좌우 간격 넓힘
      overflowY: 'auto',
      boxSizing: 'border-box' 
    }}>
      
      {/* [Left Section] 기본 정보 (Basic Info) */}
      <div style={{ flex: '0 0 320px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        {/* 타이틀 */}
        <div style={{ borderBottom: '2px solid #007bff', paddingBottom: '10px' }}>
          <h3 style={{ margin: 0, color: '#333' }}>
            Cell Information
          </h3>
          <span style={{ fontSize: '14px', color: '#666' }}>ID: </span>
          <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#007bff' }}>{data.id}</span>
        </div>

        {/* 속성 리스트 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#666', fontWeight: 'bold' }}>Zone:</span>
            <span>{data.zone} ({data.zoneType})</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#666', fontWeight: 'bold' }}>Current Status:</span>
            <span style={{ 
              padding: '4px 10px', 
              borderRadius: '15px', 
              color: '#fff',
              backgroundColor: STATUS_COLORS[data.status], 
              fontSize: '12px',
              fontWeight: 'bold',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              {data.status}
            </span>
          </div>

          <div>
            <span style={{ color: '#666', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
              Capacity Utilization:
            </span>
            <CapacityGauge current={data.currentLoad} max={data.maxCapacity} />
          </div>
        
        </div>
      </div>

      {/* [Right Section] 아이템 목록 (Stacked Items) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h4 style={{ margin: '0 0 15px 0', borderBottom: '1px solid #ddd', paddingBottom: '10px', color: '#333' }}>
          📦 Stacked Items List
        </h4>
        
        {/* 테이블 컴포넌트 사용 */}
        <ItemTable items={data.items} />
      </div>

    </div>
  );
};

export default MaterialDetailPanel;