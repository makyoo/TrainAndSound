
import React from 'react';
import { ImpactRecord } from '../types';

interface ResultsProps {
  impacts: ImpactRecord[];
  currentTime: number;
}

const Results: React.FC<ResultsProps> = ({ impacts, currentTime }) => {
  const diff = Math.abs(impacts[1].time - impacts[0].time);
  const bothImpacted = impacts.every(i => currentTime >= i.time);

  return (
    <section className="bg-slate-800 rounded-xl p-5 border border-slate-700 shadow-xl flex-1 flex flex-col min-h-0">
      <h2 className="text-lg font-semibold mb-4 text-slate-200 flex items-center gap-2">
        <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
        模拟结果
      </h2>
      
      <div className="space-y-4 overflow-y-auto">
        {impacts.map((imp, idx) => {
          const hasOccurred = currentTime >= imp.time;
          return (
            <div key={idx} className={`p-3 rounded-lg border transition-all ${hasOccurred ? 'bg-slate-700/50 border-yellow-500/50' : 'bg-slate-900/20 border-slate-700 opacity-40'}`}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold uppercase text-slate-400">{imp.label} 相遇</span>
                {hasOccurred && <span className="text-[10px] px-2 py-0.5 bg-yellow-500/20 text-yellow-500 rounded-full">已记录</span>}
              </div>
              <div className="text-xl font-mono text-white">
                {hasOccurred ? imp.time.toFixed(4) : '--.----'} <span className="text-sm text-slate-500">秒</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                位置: {hasOccurred ? imp.position.toFixed(2) : '---.--'} 米
              </div>
            </div>
          );
        })}

        {bothImpacted && (
          <div className="mt-4 p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/30 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <h3 className="text-indigo-400 text-xs font-bold mb-2 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              接收时间间隔 (B车视角)
            </h3>
            <div className="text-2xl font-bold text-white font-mono">
              {diff.toFixed(4)} <span className="text-sm font-normal text-slate-400">s</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
              由于多普勒效应，B车观察到的声音间隔缩短了。
              发射间隔为原本设置的秒数，但由于相对运动，到达时间差发生了改变。
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Results;
