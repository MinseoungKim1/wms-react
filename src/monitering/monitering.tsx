import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { Play, Pause, RotateCcw, Search, User, X, Filter } from 'lucide-react';

// --- Constants & Configuration ---
const ZONES = {
  'A': { rows: 12, cols: 8, type: 'vertical-cluster', startX: 50, startY: 50 },
  'B': { rows: 12, cols: 8, type: 'vertical-cluster', startX: 450, startY: 50 },
  'C': { rows: 6, cols: 20, type: 'horizontal', startX: 50, startY: 600 }
};

interface Carrier {
  id: string;
  zone: string;
  col: number;
  row: number;
  x: number;
  y: number;
  width: number;
  height: number;
  maxLoad: number;
  currentLoad: number;
  percent: number;
}

// Color scales mapping (Tailwind CSS matches)
const COLORS = {
  empty: '#334155',    // slate-700
  low: '#06b6d4',      // cyan-500
  normal: '#10b981',   // emerald-500
  high: '#facc15',     // yellow-400
  critical: '#f97316', // orange-500
  full: '#dc2626',     // red-600
  error: '#9333ea'     // purple-600
};

const getStatusColor = (percent) => {
  if (percent === 0) return COLORS.empty;
  if (percent <= 25) return COLORS.low;
  if (percent <= 50) return COLORS.normal;
  if (percent <= 75) return COLORS.high;
  if (percent <= 90) return COLORS.critical;
  return COLORS.full;
};

const getStatusKey = (percent) => {
  if (percent === 0) return 'empty';
  if (percent <= 25) return 'low';
  if (percent <= 50) return 'normal';
  if (percent <= 75) return 'high';
  if (percent <= 90) return 'critical';
  return 'full';
};

// --- Helper Functions ---
const generateInitialData = () => {
  const data = [];
  
  Object.entries(ZONES).forEach(([zoneId, config]) => {
    for (let r = 0; r < config.rows; r++) {
      for (let c = 0; c < config.cols; c++) {
        const id = `${zoneId}-${c}-${r}`;
        const maxLoad = 1000;
        const currentLoad = Math.floor(Math.random() * 1001);
        
        // Calculate Position Logic based on Zone Type
        let x = config.startX;
        let y = config.startY;
        let width = 24;
        let height = 32;

        if (config.type === 'vertical-cluster') {
          // Add gap every 2 columns for aisles
          const aisleGap = Math.floor(c / 2) * 16;
          x += (c * (width + 4)) + aisleGap;
          y += r * (height + 4);
        } else {
          // Horizontal layout
          width = 32;
          height = 16;
          x += c * (width + 4);
          y += r * (height + 4);
        }

        data.push({
          id,
          zone: zoneId,
          col: c,
          row: r,
          x,
          y,
          width,
          height,
          maxLoad,
          currentLoad,
          percent: (currentLoad / maxLoad) * 100
        });
      }
    }
  });
  return data;
};

// --- Main Component ---
const WarehouseDashboard = () => {
  // const [carriers, setCarriers] = useState([]);
  // const [carriers, setCarriers] = useState<Carrier[]>([]); // <Carrier[]> 추가
  const [carriers, setCarriers] = useState<Carrier[]>(() => generateInitialData());
  const [isSimulating, setIsSimulating] = useState(false);
  // const [selectedId, setSelectedId] = useState(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterZone, setFilterZone] = useState('all');
  const [zoomTransform, setZoomTransform] = useState({ k: 1, x: 0, y: 0 });
  const [time, setTime] = useState(new Date());

  const svgRef = useRef(null);
  const simulationRef = useRef<number | null>(null);

  // Initialize Data
  useEffect(() => {
    
    // Clock Timer
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // D3 Zoom Setup
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        setZoomTransform(event.transform);
      });

    svg.call(zoom);
  }, []);

  // Simulation Logic
  useEffect(() => {
    if (isSimulating) {
      simulationRef.current = setInterval(() => {
        setCarriers(prev => {
          // Clone array for immutability
          const next = [...prev];
          // Update 10 random items
          for (let i = 0; i < 15; i++) {
            const idx = Math.floor(Math.random() * next.length);
            const item = { ...next[idx] };
            const change = (Math.random() * 0.4) - 0.2; // +/- 20%
            let newLoad = item.currentLoad + (item.maxLoad * change);
            newLoad = Math.max(0, Math.min(newLoad, item.maxLoad));
            
            item.currentLoad = Math.floor(newLoad);
            item.percent = (item.currentLoad / item.maxLoad) * 100;
            next[idx] = item;
          }
          return next;
        });
      }, 1000);
  } else {
    if (simulationRef.current) {
      clearInterval(simulationRef.current);
    }
  }

  return () => {
    if (simulationRef.current) {
      clearInterval(simulationRef.current);
    }
  };
}, [isSimulating]);

  const handleReset = () => {
    setIsSimulating(false);
    setCarriers(prev => prev.map(c => ({ ...c, currentLoad: 0, percent: 0 })));
  };

  const selectedCarrier = useMemo(() => 
    carriers.find(c => c.id === selectedId), 
  [carriers, selectedId]);

  // Stats Calculation
  const stats = useMemo(() => {
    const total = carriers.length;
    const totalLoad = carriers.reduce((a, b) => a + b.currentLoad, 0);
    const totalMax = carriers.reduce((a, b) => a + b.maxLoad, 0);
    const utilization = totalMax ? ((totalLoad / totalMax) * 100).toFixed(1) : 0;
    const critical = carriers.filter(c => c.percent > 90).length;
    return { total, utilization, critical };
  }, [carriers]);

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-900 text-slate-200 font-sans overflow-hidden">
      
      {/* --- Header --- */}
      <header className="h-16 bg-slate-900 border-b border-slate-700 flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-2 rounded-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">WMS Carrier Monitor</h1>
            <p className="text-xs text-slate-400">React + D3 Real-time System</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input type="text" placeholder="Find Carrier ID..." className="bg-slate-800 border border-slate-700 rounded-full py-1.5 pl-9 pr-4 text-sm focus:outline-none focus:border-blue-500 text-slate-200 w-64" />
          </div>

          <div className="flex gap-4 text-sm text-right">
            <div>
              <div className="text-slate-400 text-xs">System Status</div>
              <div className="text-emerald-400 font-medium flex items-center justify-end gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Online
              </div>
            </div>
            <div>
              <div className="text-slate-400 text-xs">Time</div>
              <div className="text-white font-mono">{time.toLocaleTimeString('en-US', { hour12: false })}</div>
            </div>
          </div>
          
          <button className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center hover:bg-slate-600">
            <User className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        
        {/* --- Sidebar --- */}
        <aside className="w-72 bg-slate-900 border-r border-slate-700 flex flex-col shrink-0 z-10">
          <div className="p-6 border-b border-slate-800">
            <h2 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-wider">Dashboard Metrics</h2>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                <div className="text-slate-400 text-xs mb-1">Total Slots</div>
                <div className="text-2xl font-bold text-white">{stats.total}</div>
              </div>
              <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                <div className="text-slate-400 text-xs mb-1">Utilization</div>
                <div className="text-2xl font-bold text-blue-400">{stats.utilization}%</div>
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg p-3 border border-slate-700 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-slate-400">Alerts</span>
                <span className="bg-red-500/20 text-red-400 text-xs px-2 py-0.5 rounded-full">{stats.critical} Critical</span>
              </div>
              <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-500 transition-all duration-500" 
                  style={{ width: `${Math.min((stats.critical / stats.total) * 500, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="p-6 flex-1 overflow-y-auto">
            <h2 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-wider">Capacity Legend</h2>
            <div className="space-y-3 text-sm">
              {[
                { label: 'Empty (0%)', color: COLORS.empty },
                { label: 'Low (1-25%)', color: COLORS.low },
                { label: 'Normal (26-50%)', color: COLORS.normal },
                { label: 'High (51-75%)', color: COLORS.high },
                { label: 'Critical (76-90%)', color: COLORS.critical },
                { label: 'Full (91-100%)', color: COLORS.full },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color, boxShadow: `0 0 8px ${item.color}66` }}></div>
                  <span className="text-slate-300">{item.label}</span>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <h2 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">Simulation</h2>
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsSimulating(!isSimulating)}
                  className={`flex-1 text-white text-sm py-2 px-3 rounded-md transition-colors flex items-center justify-center gap-2 ${isSimulating ? 'bg-red-600 hover:bg-red-500' : 'bg-blue-600 hover:bg-blue-500'}`}
                >
                  {isSimulating ? <><Pause size={16} /> Stop</> : <><Play size={16} /> Run</>}
                </button>
                <button 
                  onClick={handleReset}
                  className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm py-2 px-3 rounded-md transition-colors"
                >
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* --- Main Map Area (D3 + SVG) --- */}
        <main className="flex-1 bg-slate-950 relative overflow-hidden flex flex-col">
          
          {/* Filters */}
          <div className="absolute top-4 left-4 z-10 flex gap-2">
            {['all', 'A', 'B', 'C'].map(zone => (
              <button
                key={zone}
                onClick={() => setFilterZone(zone)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors backdrop-blur-md border ${
                  filterZone === zone 
                    ? 'bg-blue-600 text-white border-blue-500' 
                    : 'bg-slate-800/70 text-slate-300 border-white/5 hover:bg-slate-700'
                }`}
              >
                {zone === 'all' ? 'All Zones' : `Zone ${zone}`}
              </button>
            ))}
          </div>

          {/* D3 Canvas */}
          <div className="w-full h-full cursor-grab active:cursor-grabbing overflow-hidden">
            <svg ref={svgRef} className="w-full h-full">
              <g transform={`translate(${zoomTransform.x}, ${zoomTransform.y}) scale(${zoomTransform.k})`}>
                
                {/* Background Map Container */}
                <rect x="0" y="0" width="1200" height="900" rx="20" fill="#0f172a" stroke="#1e293b" strokeWidth="2" />
                
                {/* Zone Labels */}
                <text x="50" y="40" fill="#64748b" fontSize="14" fontWeight="bold" letterSpacing="2">ZONE A</text>
                <text x="450" y="40" fill="#64748b" fontSize="14" fontWeight="bold" letterSpacing="2">ZONE B</text>
                <text x="50" y="580" fill="#64748b" fontSize="14" fontWeight="bold" letterSpacing="2">ZONE C (Bulk)</text>

                {/* Carriers Render */}
                {carriers.map((carrier) => {
                  const isFiltered = filterZone === 'all' || carrier.zone === filterZone;
                  const isSelected = selectedId === carrier.id;
                  
                  return (
                    <g 
                      key={carrier.id} 
                      transform={`translate(${carrier.x}, ${carrier.y})`}
                      onClick={(e) => { e.stopPropagation(); setSelectedId(carrier.id); }}
                      style={{ 
                        opacity: isFiltered ? 1 : 0.1, 
                        pointerEvents: isFiltered ? 'all' : 'none',
                        transition: 'opacity 0.3s'
                      }}
                      className="cursor-pointer hover:brightness-125"
                    >
                      <rect
                        width={carrier.width}
                        height={carrier.height}
                        rx="2"
                        fill={getStatusColor(carrier.percent)}
                        stroke={isSelected ? '#fff' : 'rgba(0,0,0,0.2)'}
                        strokeWidth={isSelected ? 2 : 1}
                        style={{
                          filter: `drop-shadow(0 0 4px ${getStatusColor(carrier.percent)}40)`
                        }}
                      />
                    </g>
                  );
                })}
              </g>
            </svg>
          </div>

          {/* Floating Detail Panel */}
          {selectedCarrier && (
            <div className="absolute top-4 right-4 w-80 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-30 animate-in slide-in-from-right duration-300">
              <div className="p-4 border-b border-white/10 flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-6 bg-blue-500 rounded-sm"></span>
                    Carrier {selectedCarrier.id}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Status: Active</p>
                </div>
                <button onClick={() => setSelectedId(null)} className="text-slate-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm text-slate-300">Load Capacity</span>
                  <span className="text-2xl font-bold" style={{ color: getStatusColor(selectedCarrier.percent) }}>
                    {Math.round(selectedCarrier.percent)}%
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2 mb-6">
                  <div 
                    className="h-full rounded-full transition-all duration-300" 
                    style={{ 
                      width: `${selectedCarrier.percent}%`,
                      backgroundColor: getStatusColor(selectedCarrier.percent)
                    }}
                  ></div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-slate-800/50 p-2 rounded border border-white/5">
                    <div className="text-[10px] text-slate-500 uppercase">Current Load</div>
                    <div className="text-sm font-semibold text-slate-200">{selectedCarrier.currentLoad} kg</div>
                  </div>
                  <div className="bg-slate-800/50 p-2 rounded border border-white/5">
                    <div className="text-[10px] text-slate-500 uppercase">Max Load</div>
                    <div className="text-sm font-semibold text-slate-200">{selectedCarrier.maxLoad} kg</div>
                  </div>
                </div>

                <h4 className="text-xs font-semibold text-slate-400 uppercase mb-2">Details</h4>
                <div className="text-xs text-slate-300 space-y-2">
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span>Zone Location</span>
                    <span className="text-slate-500">Zone {selectedCarrier.zone}</span>
                  </div>
                   <div className="flex justify-between border-b border-white/5 pb-1">
                    <span>Coordinates</span>
                    <span className="text-slate-500">X: {selectedCarrier.col}, Y: {selectedCarrier.row}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Toast / Notification Area */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none">
             {filterZone !== 'all' && (
               <div className="bg-slate-800 border border-slate-600 text-white px-4 py-2 rounded-lg shadow-xl flex items-center gap-3 animate-bounce">
                  <Filter size={16} className="text-emerald-400" />
                  <span className="text-sm font-bold">Filtered: Zone {filterZone}</span>
               </div>
             )}
          </div>

        </main>
      </div>
    </div>
  );
};

export default WarehouseDashboard;