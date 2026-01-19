
import React from 'react';
import {  STATUS_COLORS } from '../model/monitoring-model';
import type { MachineData} from '../model/monitoring-model';
interface Props {
  data: MachineData | null;
}

const MonitoringDetailPanel: React.FC<Props> = ({ data }) => {
  if (!data) {
    return (
      <div style={{ 
        flex: '0 0 35%', borderTop: '2px solid #333', backgroundColor: '#fff', 
        display: 'flex', justifyContent: 'center', alignItems: 'center', 
        color: '#aaa', fontStyle: 'italic', height: '35vh'
      }}>
        셀을 선택시 해당 값이 표기 됩니다.
      </div>
    );
  }

  const capacityRatio = (data.currentLoad / data.maxCapacity) * 100;
  const isOverloaded = capacityRatio > 90;

  return (
    <div style={{ 
      flex: '0 0 35%', 
      height: '35vh',
      borderTop: '2px solid #333', 
      backgroundColor: '#fff', 
      padding: '20px',
      display: 'flex',
      gap: '30px',
      overflowY: 'auto',
      boxSizing: 'border-box' 
    }}>
      {/* 왼쪽: 기본 정보 및 게이지 */}
      <div style={{ flex: '0 0 300px' }}>
        <h4 style={{ marginTop: 0, borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>
          Cell Detail: <span style={{ color: '#007bff' }}>{data.id}</span>
        </h4>
        <ul style={{ listStyle: 'none', padding: 0, lineHeight: '1.8' }}>
          <li><strong>Zone:</strong> {data.zone}</li>
          <li>
            <strong>Status:</strong> 
            <span style={{ 
              marginLeft: '8px', padding: '2px 6px', borderRadius: '4px', color: '#fff',
              backgroundColor: STATUS_COLORS[data.status], fontSize: '12px'
            }}>
              {data.status}
            </span>
          </li>
          <li style={{ marginTop: '10px' }}>
            <strong>Capacity Utilization:</strong>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px' }}>
              <div style={{ flex: 1, height: '20px', background: '#e0e0e0', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ 
                  width: `${capacityRatio}%`, 
                  height: '100%', 
                  background: isOverloaded ? '#dc3545' : '#28a745',
                  transition: 'width 0.3s ease'
                }}></div>
              </div>
              <span style={{ fontWeight: 'bold' }}>
                {data.currentLoad} / {data.maxCapacity} ({Math.round(capacityRatio)}%)
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
        {data.items.length > 0 ? (
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
              {data.items.map((item, idx) => (
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
    </div>
  );
};

export default MonitoringDetailPanel;