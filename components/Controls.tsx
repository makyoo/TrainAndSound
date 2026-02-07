
import React from 'react';
import { SimulationConfig } from '../types';

interface ControlsProps {
  config: SimulationConfig;
  onChange: (newConfig: Partial<SimulationConfig>) => void;
}

const Controls: React.FC<ControlsProps> = ({ config, onChange }) => {
  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">火车 A 速度</label>
          <span className="text-sm font-mono text-slate-100">{config.speedA} <span className="text-[10px] text-slate-500">m/s</span></span>
        </div>
        <input 
          type="range" min="0" max="150" step="1" value={config.speedA} 
          onChange={(e) => onChange({ speedA: parseInt(e.target.value) })}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <label className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">火车 B 速度</label>
          <span className="text-sm font-mono text-slate-100">{config.speedB} <span className="text-[10px] text-slate-500">m/s</span></span>
        </div>
        <input 
          type="range" min="0" max="150" step="1" value={config.speedB} 
          onChange={(e) => onChange({ speedB: parseInt(e.target.value) })}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <label className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">初始间距</label>
          <span className="text-sm font-mono text-slate-100">{config.initialDistance} <span className="text-[10px] text-slate-500">m</span></span>
        </div>
        <input 
          type="range" min="100" max="1000" step="50" value={config.initialDistance} 
          onChange={(e) => onChange({ initialDistance: parseInt(e.target.value) })}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <label className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">鸣笛间隔 (Δt)</label>
          <span className="text-sm font-mono text-slate-100">{config.soundInterval.toFixed(1)} <span className="text-[10px] text-slate-500">s</span></span>
        </div>
        <input 
          type="range" min="0.1" max="3.0" step="0.1" value={config.soundInterval} 
          onChange={(e) => onChange({ soundInterval: parseFloat(e.target.value) })}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
        />
      </div>
    </div>
  );
};

export default Controls;
