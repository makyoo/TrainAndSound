
import React from 'react';
import { ImpactRecord } from '../types';

interface ResultsProps {
  impacts: ImpactRecord[];
  currentTime: number;
}

const Results: React.FC<ResultsProps> = ({ impacts, currentTime }) => {
  const t1 = impacts[0].time;
  const t2 = impacts[1].time;
  const diff = Math.abs(t2 - t1);
  const bothImpacted = impacts.every(i => currentTime >= i.time);

  return (
    <div className="flex flex-col items-center py-2">
      {!bothImpacted ? (
        <div className="text-center py-8 space-y-4">
          <div className="flex justify-center gap-2">
            <div className={`h-1.5 w-12 rounded-full transition-colors duration-500 ${currentTime >= t1 ? 'bg-orange-500' : 'bg-slate-800'}`}></div>
            <div className={`h-1.5 w-12 rounded-full transition-colors duration-500 ${currentTime >= t2 ? 'bg-teal-500' : 'bg-slate-800'}`}></div>
          </div>
          <p className="text-slate-500 text-xs animate-pulse">模拟运行中，等待鸣笛传播...</p>
        </div>
      ) : (
        <div className="w-full text-center space-y-6">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">观测接收间隔 (Δt')</span>
            <div className="flex items-center justify-center gap-3 py-4">
               <div className="flex flex-col items-center">
                  <span className="text-[10px] text-slate-600 mb-1">t₂</span>
                  <span className="text-xl font-mono text-teal-400">{t2.toFixed(3)}s</span>
               </div>
               <span className="text-2xl text-slate-700 self-end pb-1">−</span>
               <div className="flex flex-col items-center">
                  <span className="text-[10px] text-slate-600 mb-1">t₁</span>
                  <span className="text-xl font-mono text-orange-400">{t1.toFixed(3)}s</span>
               </div>
            </div>
          </div>

          <div className="bg-slate-950/50 p-6 rounded-2xl border border-indigo-500/20 shadow-inner">
            <div className="flex items-baseline justify-center gap-1.5">
              <span className="text-5xl font-black text-white font-mono leading-none tracking-tighter">
                {diff.toFixed(4)}
              </span>
              <span className="text-lg font-bold text-slate-500 font-mono">s</span>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 leading-relaxed italic max-w-[240px] mx-auto">
            观测结果显示，由于 B 车迎向声波运动，接收到的脉冲间隔显著缩短。
          </div>
        </div>
      )}
    </div>
  );
};

export default Results;
