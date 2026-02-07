
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { SimulationConfig, ImpactRecord, SOUND_SPEED } from './types';
import Controls from './components/Controls';
import Visualizer from './components/Visualizer';
import Results from './components/Results';

const App: React.FC = () => {
  // Configuration State
  const [config, setConfig] = useState<SimulationConfig>({
    speedA: 40,
    speedB: 60,
    initialDistance: 800,
    soundInterval: 1.0,
  });

  // Playback State
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  
  // UI State for Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isResultsOpen, setIsResultsOpen] = useState(false);
  const [isProblemOpen, setIsProblemOpen] = useState(false);
  
  // Ref for animation frame
  const requestRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number | undefined>(undefined);

  // Derived Values: Impact Calculations
  const impacts = useMemo(() => {
    const { speedA, speedB, initialDistance, soundInterval } = config;
    
    const t1 = initialDistance / (SOUND_SPEED + speedB);
    const pos1 = initialDistance - speedB * t1;

    const t2 = (initialDistance + soundInterval * (SOUND_SPEED - speedA)) / (SOUND_SPEED + speedB);
    const pos2 = initialDistance - speedB * t2;

    return [
      { time: t1, position: pos1, label: '声音 1' },
      { time: t2, position: pos2, label: '声音 2' }
    ].sort((a, b) => a.time - b.time);
  }, [config]);

  // Max duration for the simulation
  const maxDuration = useMemo(() => {
    const { speedA, speedB, initialDistance } = config;
    const trainCollisionTime = initialDistance / (speedA + speedB);
    return Math.max(impacts[1].time, trainCollisionTime) + 0.5;
  }, [config, impacts]);

  // Play/Pause/Restart logic
  const handlePlayToggle = useCallback(() => {
    if (currentTime >= maxDuration) {
      setCurrentTime(0);
      setIsPlaying(true);
      setIsResultsOpen(false);
      lastTimeRef.current = undefined;
    } else {
      setIsPlaying(prev => !prev);
      if (!isPlaying) {
        lastTimeRef.current = undefined;
      }
    }
  }, [currentTime, maxDuration, isPlaying]);

  const reset = useCallback(() => {
    setCurrentTime(0);
    setIsPlaying(false);
    setIsResultsOpen(false);
    lastTimeRef.current = undefined;
  }, []);

  const updateConfig = (newConfig: Partial<SimulationConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
    reset();
  };

  // Animation Loop
  const animate = useCallback((time: number) => {
    if (lastTimeRef.current !== undefined && isPlaying) {
      const deltaTime = (time - lastTimeRef.current) / 1000;
      setCurrentTime(prev => {
        const next = prev + deltaTime;
        if (next >= maxDuration) {
          setIsPlaying(false);
          // Auto-trigger results popup when collision/simulation ends
          setTimeout(() => setIsResultsOpen(true), 500);
          return maxDuration;
        }
        return next;
      });
    }
    lastTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  }, [isPlaying, maxDuration]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [animate]);

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md z-10">
        <div>
          <h1 className="text-xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
            多普勒效应模拟
          </h1>
          <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">声波间隔与相向运动物理仿真</p>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => setIsProblemOpen(true)}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700 shadow-lg text-xs font-bold text-slate-300"
          >
            题目
          </button>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700 shadow-lg text-xs font-bold text-slate-300"
          >
            参数
          </button>
          <button 
            onClick={handlePlayToggle}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${currentTime >= maxDuration ? 'bg-indigo-600' : isPlaying ? 'bg-orange-600' : 'bg-emerald-600'}`}
          >
            {currentTime >= maxDuration ? '重播' : isPlaying ? '暂停' : '播放'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative p-4 flex flex-col overflow-hidden">
        <div className="flex-1 bg-slate-900/30 rounded-3xl border border-slate-800/50 relative overflow-hidden flex flex-col shadow-inner">
          {/* Timeline Bar (Moved to top) */}
          <div className="p-6 bg-gradient-to-b from-slate-900/80 to-transparent z-20">
             <div className="flex justify-between items-center mb-2 px-1">
                <span className="text-[10px] font-mono text-slate-500">0.000s</span>
                <span className="text-sm font-mono font-bold text-indigo-400 bg-indigo-500/10 px-3 py-0.5 rounded-full border border-indigo-500/20">
                  {currentTime.toFixed(3)}s
                </span>
                <span className="text-[10px] font-mono text-slate-500">{maxDuration.toFixed(1)}s</span>
             </div>
             <div className="relative h-6 flex items-center">
               <input 
                type="range"
                min="0"
                max={maxDuration}
                step="0.001"
                value={currentTime}
                onChange={(e) => {
                  setCurrentTime(parseFloat(e.target.value));
                  setIsPlaying(false);
                  setIsResultsOpen(false);
                }}
                className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-indigo-500 z-10"
               />
               {/* Markers for impacts on the slider track */}
               {impacts.map((imp, idx) => (
                 <div 
                   key={idx}
                   className={`absolute top-1/2 -translate-y-1/2 w-1 h-3 rounded-full ${imp.label === '声音 1' ? 'bg-orange-500' : 'bg-teal-500'}`}
                   style={{ left: `${(imp.time / maxDuration) * 100}%` }}
                 />
               ))}
             </div>
          </div>

          <Visualizer 
            config={config} 
            currentTime={currentTime} 
            impacts={impacts} 
          />
        </div>
      </main>

      {/* Problem Modal */}
      {isProblemOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-slate-800">
              <h3 className="font-bold text-slate-200">物理题目</h3>
              <button onClick={() => setIsProblemOpen(false)} className="p-1 hover:bg-slate-800 rounded-lg">
                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6">
              <p className="text-slate-300 leading-relaxed text-sm md:text-base">
                一条轨道，两列火车，A车从左边向右40米/秒，B车从右向左60米/秒，相向运动。A车发射汽笛声音，发出第一声，声速将以恒定340米/秒速度向B车方向移动，间隔1秒发出第二声，问B车听到两声汽笛的时间间隔多少秒。
              </p>
              <button 
                onClick={() => setIsProblemOpen(false)}
                className="w-full mt-8 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all"
              >
                开始思考
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-slate-800">
              <h3 className="font-bold text-slate-200">参数设置</h3>
              <button onClick={() => setIsSettingsOpen(false)} className="p-1 hover:bg-slate-800 rounded-lg">
                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-5">
              <Controls config={config} onChange={updateConfig} />
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="w-full mt-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20"
              >
                完成
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results Modal */}
      {isResultsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
             <div className="flex justify-between items-center p-5 border-b border-slate-800">
              <h3 className="font-bold text-slate-200">模拟总结</h3>
              <button onClick={() => setIsResultsOpen(false)} className="p-1 hover:bg-slate-800 rounded-lg">
                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-5">
              <Results impacts={impacts} currentTime={currentTime} />
              <div className="grid grid-cols-2 gap-3 mt-6">
                <button 
                  onClick={() => setIsResultsOpen(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-xl transition-all"
                >
                  关闭
                </button>
                <button 
                  onClick={() => {
                    setIsResultsOpen(false);
                    handlePlayToggle();
                  }}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20"
                >
                  重新开始
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <footer className="text-center text-slate-700 text-[10px] font-mono pb-2 select-none">
        {`v_sound = ${SOUND_SPEED}m/s | interval = ${config.soundInterval.toFixed(1)}s`}
      </footer>
    </div>
  );
};

export default App;
