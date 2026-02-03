import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { SimulationConfig, ImpactRecord, SOUND_SPEED } from './types';
import Controls from './components/Controls';
import Visualizer from './components/Visualizer';
import Results from './components/Results';

const App: React.FC = () => {
  // Configuration State
  const [config, setConfig] = useState<SimulationConfig>({
    speedA: 50,
    speedB: 30,
    initialDistance: 500,
    soundInterval: 1.0,
  });

  // Playback State
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  
  // Ref for animation frame
  const requestRef = useRef<number>();
  const lastTimeRef = useRef<number>();

  // Derived Values: Impact Calculations
  const impacts = useMemo(() => {
    const { speedA, speedB, initialDistance, soundInterval } = config;
    
    // Impact 1: Sound 1 emitted at t=0, xA=0.
    // xS1(t) = 340 * t
    // xB(t) = D - vB * t
    // 340*t = D - vB*t => t1 = D / (340 + vB)
    const t1 = initialDistance / (SOUND_SPEED + speedB);
    const pos1 = initialDistance - speedB * t1;

    // Impact 2: Sound 2 emitted at t=interval, xA = vA * interval
    // xS2(t) = vA * interval + 340 * (t - interval)  (for t >= interval)
    // xB(t) = D - vB * t
    // vA * dt + 340*t - 340*dt = D - vB*t
    // t(340 + vB) = D + 340*dt - vA*dt
    // t2 = (D + dt * (340 - vA)) / (340 + vB)
    const t2 = (initialDistance + soundInterval * (SOUND_SPEED - speedA)) / (SOUND_SPEED + speedB);
    const pos2 = initialDistance - speedB * t2;

    return [
      { time: t1, position: pos1, label: '声音 1' },
      { time: t2, position: pos2, label: '声音 2' }
    ].sort((a, b) => a.time - b.time);
  }, [config]);

  // Max duration for the simulation (slightly after both impacts or train collision)
  const maxDuration = useMemo(() => {
    const { speedA, speedB, initialDistance } = config;
    const trainCollisionTime = initialDistance / (speedA + speedB);
    return Math.max(impacts[1].time, trainCollisionTime) + 1.5;
  }, [config, impacts]);

  // Reset function
  const reset = useCallback(() => {
    setCurrentTime(0);
    setIsPlaying(false);
    lastTimeRef.current = undefined;
  }, []);

  // Update config and reset
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
    <div className="flex flex-col h-screen p-4 md:p-8 space-y-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-700 pb-4">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-blue-400">
            多普勒效应模拟: 火车与声波
          </h1>
          <p className="text-slate-400 text-sm">模拟相向运动列车的鸣笛传播过程</p>
        </div>
        <div className="mt-4 md:mt-0">
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-6 py-2 rounded-full font-bold transition-all ${isPlaying ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-500 hover:bg-green-600 shadow-lg shadow-green-500/20'}`}
          >
            {isPlaying ? '暂停 (PAUSE)' : '播放 (PLAY)'}
          </button>
          <button 
            onClick={reset}
            className="ml-3 px-6 py-2 rounded-full bg-slate-700 hover:bg-slate-600 transition-colors"
          >
            重置
          </button>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
        <div className="lg:col-span-1 flex flex-col space-y-6 overflow-y-auto pr-2">
          <Controls config={config} onChange={updateConfig} />
          <Results impacts={impacts} currentTime={currentTime} />
        </div>

        <div className="lg:col-span-3 bg-slate-800/50 rounded-2xl border border-slate-700 p-6 flex flex-col relative overflow-hidden">
          <Visualizer 
            config={config} 
            currentTime={currentTime} 
            impacts={impacts} 
          />
          
          {/* Time Scrubber */}
          <div className="mt-auto pt-6 border-t border-slate-700 flex flex-col gap-2">
             <div className="flex justify-between text-xs text-slate-400 font-mono">
                <span>0.0s</span>
                <span>当前: {currentTime.toFixed(3)}s</span>
                <span>{maxDuration.toFixed(1)}s</span>
             </div>
             <input 
              type="range"
              min="0"
              max={maxDuration}
              step="0.001"
              value={currentTime}
              onChange={(e) => {
                setCurrentTime(parseFloat(e.target.value));
                setIsPlaying(false);
              }}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-500"
             />
             <div className="relative w-full h-1 mt-1">
                {impacts.map((imp, idx) => (
                  <div 
                    key={idx}
                    className="absolute h-3 w-1 bg-red-400 top-[-8px] transition-opacity"
                    style={{ left: `${(imp.time / maxDuration) * 100}%`, opacity: currentTime >= imp.time ? 1 : 0.4 }}
                    title={imp.label}
                  />
                ))}
             </div>
          </div>
        </div>
      </main>
      
      <footer className="text-center text-slate-500 text-xs font-mono">
        {`* 计算基于 vs = ${SOUND_SPEED} m/s | A车发射频率间隔 Δt = ${config.soundInterval.toFixed(2)} s`}
      </footer>
    </div>
  );
};

export default App;