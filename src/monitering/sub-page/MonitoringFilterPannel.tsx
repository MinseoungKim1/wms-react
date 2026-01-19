// src/views/monitoring/components/MonitoringFilterPanel.tsx
import React from 'react';
import type { ViewModeType } from '../model/monitoring-model';

interface Props {
  zones: string[];
  selectedZone: string;
  onZoneChange: (zone: string) => void;
  viewMode: ViewModeType;
  onViewModeChange: (mode: ViewModeType) => void;
}

const MonitoringFilterPanel: React.FC<Props> = ({
  zones,
  selectedZone,
  onZoneChange,
  viewMode,
  onViewModeChange
}) => {
  return (
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
          onChange={(e) => onZoneChange(e.target.value)}
          style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          {zones.map(z => <option key={z} value={z}>{z}</option>)}
        </select>
      </div>

      {/* View Mode 선택 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <label style={{ fontWeight: 'bold' }}>View Mode:</label>
        <div style={{ display: 'flex', border: '1px solid #ccc', borderRadius: '4px', overflow: 'hidden' }}>
          <button 
            onClick={() => onViewModeChange('STATUS')}
            style={{ 
              padding: '6px 12px', border: 'none', cursor: 'pointer',
              background: viewMode === 'STATUS' ? '#007bff' : '#fff',
              color: viewMode === 'STATUS' ? '#fff' : '#333'
            }}
          >
            Status
          </button>
          <button 
            onClick={() => onViewModeChange('CAPACITY')}
            style={{ 
              padding: '6px 12px', border: 'none', cursor: 'pointer',
              background: viewMode === 'CAPACITY' ? '#6610f2' : '#fff',
              color: viewMode === 'CAPACITY' ? '#fff' : '#333'
            }}
          >
            Capacity
          </button>
        </div>
      </div>
    </header>
  );
};

export default MonitoringFilterPanel;