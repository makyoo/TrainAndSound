
import React from 'react';
import { SimulationConfig } from '../types';

interface ControlsProps {
  config: SimulationConfig;
  onChange: (newConfig: Partial<SimulationConfig>) => void;
}

const Controls: React.FC<ControlsProps> = ({ config, onChange }) => {
  return (
    <section className="bg-slate-800 rounded-xl p-5 border border-slate-700 shadow-xl">
      <h2 className="text-lg font-semibold mb-4 text-slate-200 flex items-center gap-2">
        <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
        参数设置
      </h2>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">A车速度 (左 → 右)</label>
          <div className="flex items-center gap-3">
            <input 
              type="range" min="0" max="150" step="1" value={config.speedA} 
              onChange={(e) => onChange({ speedA: parseInt(e.target.value) })}
              className="flex-1 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <span className="w-16 text-right font-mono text-blue-400">{config.speedA} m/s</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">B车速度 (右 → 左)</label>
          <div className="flex items-center gap-3">
            <input 
              type="range" min="0" max="150" step="1" value={config.speedB} 
              onChange={(e) => onChange({ speedB: parseInt(e.target.value) })}
              className="flex-1 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-500"
            />
            <span className="w-16 text-right font-mono text-green-400">{config.speedB} m/s</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">初始距离</label>
          <div className="flex items-center gap-3">
            <input 
              type="range" min="100" max="1000" step="50" value={config.initialDistance} 
              onChange={(e) => onChange({ initialDistance: parseInt(e.target.value) })}
              className="flex-1 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <span className="w-16 text-right font-mono text-purple-400">{config.initialDistance} m</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">鸣笛间隔</label>
          <div className="flex items-center gap-3">
            <input 
              type="range" min="0.1" max="3.0" step="0.1" value={config.soundInterval} 
              onChange={(e) => onChange({ soundInterval: parseFloat(e.target.value) })}
              className="flex-1 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-500"
            />
            <span className="w-16 text-right font-mono text-red-400">{config.soundInterval} s</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Controls;
