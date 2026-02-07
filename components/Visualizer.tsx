
import React from 'react';
import { SimulationConfig, ImpactRecord, SOUND_SPEED } from '../types';

interface VisualizerProps {
  config: SimulationConfig;
  currentTime: number;
  impacts: ImpactRecord[];
}

const Visualizer: React.FC<VisualizerProps> = ({ config, currentTime, impacts }) => {
  const { speedA, speedB, initialDistance, soundInterval } = config;

  const PADDING = 100;
  const viewBoxWidth = 1000;
  const scale = (viewBoxWidth - 2 * PADDING) / initialDistance;

  const getX = (meters: number) => PADDING + meters * scale;

  const COLOR_1 = "#fb923c"; // Orange 400
  const COLOR_2 = "#2dd4bf"; // Teal 400

  // Collision Calculation
  const collisionTime = initialDistance / (speedA + speedB);
  const hasCollided = currentTime >= collisionTime;

  // Calculations
  const trainAX = speedA * currentTime;
  const trainBX = initialDistance - speedB * currentTime;

  // Sound 1: Started at t=0 from x=0
  const sound1X = SOUND_SPEED * currentTime;
  const hasEmitted1 = currentTime >= 0;
  const imp1 = impacts.find(i => i.label === '声音 1');
  const hasImpacted1 = currentTime >= (imp1?.time ?? Infinity);

  // Sound 2: Started at t=interval from x=vA * interval
  const emit2Position = speedA * soundInterval;
  const sound2X = (currentTime >= soundInterval) 
    ? (emit2Position + SOUND_SPEED * (currentTime - soundInterval)) 
    : -100;
  const hasEmitted2 = currentTime >= soundInterval;
  const imp2 = impacts.find(i => i.label === '声音 2');
  const hasImpacted2 = currentTime >= (imp2?.time ?? Infinity);

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <svg 
        viewBox={`0 0 ${viewBoxWidth} 400`} 
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Decorative background lines */}
        <g opacity="0.1">
          {Array.from({length: 11}).map((_, i) => (
            <line key={i} x1={getX(initialDistance * i / 10)} y1="0" x2={getX(initialDistance * i / 10)} y2="400" stroke="white" strokeWidth="1" />
          ))}
        </g>

        {/* Main Track */}
        <rect x="0" y="198" width={viewBoxWidth} height="4" fill="#334155" rx="2" />
        <line x1="0" y1="200" x2={viewBoxWidth} y2="200" stroke="#1e293b" strokeWidth="1" strokeDasharray="10,10" />

        {/* Emission Points */}
        {hasEmitted1 && (
          <g transform={`translate(${getX(0)}, 200)`} opacity="0.6">
            <circle r="3" fill={COLOR_1} />
            <text y="40" textAnchor="middle" className="text-[10px] font-bold fill-slate-500">发射点 1</text>
          </g>
        )}
        {hasEmitted2 && (
          <g transform={`translate(${getX(emit2Position)}, 200)`} opacity="0.6">
            <circle r="3" fill={COLOR_2} />
            <text y="40" textAnchor="middle" className="text-[10px] font-bold fill-slate-500">发射点 2</text>
          </g>
        )}

        {/* Interval Line (Red line connecting sound 1 and sound 2) */}
        {hasEmitted2 && !hasImpacted1 && (
          <line 
            x1={getX(sound1X)} 
            y1="200" 
            x2={getX(sound2X)} 
            y2="200" 
            stroke="#ef4444" 
            strokeWidth="2" 
            strokeDasharray="4,2"
            className="animate-pulse"
          />
        )}

        {/* Sound 1 Pulse */}
        {currentTime > 0 && !hasImpacted1 && (
          <g transform={`translate(${getX(sound1X)}, 200)`}>
             <circle r="4" fill={COLOR_1} />
             <circle r="12" fill="none" stroke={COLOR_1} strokeWidth="1" opacity="0.5" className="animate-pulse" />
             <text y="-15" textAnchor="middle" className="text-[11px] font-bold fill-orange-400">声音 1</text>
          </g>
        )}

        {/* Sound 2 Pulse */}
        {currentTime > soundInterval && !hasImpacted2 && (
          <g transform={`translate(${getX(sound2X)}, 200)`}>
             <circle r="4" fill={COLOR_2} />
             <circle r="12" fill="none" stroke={COLOR_2} strokeWidth="1" opacity="0.5" className="animate-pulse" />
             <text y="-15" textAnchor="middle" className="text-[11px] font-bold fill-teal-400">声音 2</text>
          </g>
        )}

        {/* Train A (Left) */}
        {!hasCollided && (
          <g transform={`translate(${getX(trainAX)}, 200)`}>
            <rect x="-45" y="-32" width="90" height="32" fill="#3b82f6" rx="6" />
            <path d="M45 -32 L65 -12 L65 0 L45 0 Z" fill="#3b82f6" />
            <text y="-50" textAnchor="middle" className="text-[13px] font-bold fill-blue-300">火车 A</text>
            <text y="-40" textAnchor="middle" className="text-[10px] font-mono fill-blue-500">{speedA}m/s</text>
            
            {/* Whistle markers */}
            {(Math.abs(currentTime - 0) < 0.1) && <circle r="20" fill="none" stroke={COLOR_1} strokeWidth="2" className="impact-ring" />}
            {(Math.abs(currentTime - soundInterval) < 0.1) && <circle r="20" fill="none" stroke={COLOR_2} strokeWidth="2" className="impact-ring" />}
          </g>
        )}

        {/* Train B (Right) */}
        {!hasCollided && (
          <g transform={`translate(${getX(trainBX)}, 200)`}>
            <rect x="-45" y="-32" width="90" height="32" fill="#10b981" rx="6" />
            <path d="M-45 -32 L-65 -12 L-65 0 L-45 0 Z" fill="#10b981" />
            <text y="-50" textAnchor="middle" className="text-[13px] font-bold fill-emerald-300">火车 B</text>
            <text y="-40" textAnchor="middle" className="text-[10px] font-mono fill-emerald-500">{speedB}m/s</text>
            
            {/* Reception Visuals */}
            {hasImpacted1 && Math.abs(currentTime - imp1!.time) < 0.6 && (
              <circle r="30" fill="none" stroke={COLOR_1} strokeWidth="4" className="impact-ring" />
            )}
            {hasImpacted2 && Math.abs(currentTime - imp2!.time) < 0.6 && (
              <circle r="30" fill="none" stroke={COLOR_2} strokeWidth="4" className="impact-ring" />
            )}
          </g>
        )}

        {/* Collision Marker */}
        {hasCollided && (
          <g transform={`translate(${getX(initialDistance * speedA / (speedA + speedB))}, 200)`}>
             <circle r="50" fill="url(#collisionGradient)" opacity="0.9" />
             <defs>
               <radialGradient id="collisionGradient">
                 <stop offset="0%" stopColor="#ef4444" />
                 <stop offset="100%" stopColor="transparent" />
               </radialGradient>
             </defs>
          </g>
        )}

        {/* Simplified labels for received pulses */}
        {impacts.map((imp, idx) => (
          currentTime >= imp.time && (
            <g key={idx} transform={`translate(${getX(imp.position)}, 180)`}>
               <circle r="2" fill={imp.label === '声音 1' ? COLOR_1 : COLOR_2} />
               <text y="-10" textAnchor="middle" className="text-[9px] font-mono fill-slate-500">{imp.time.toFixed(3)}s</text>
            </g>
          )
        ))}
      </svg>
    </div>
  );
};

export default Visualizer;
