
import React from 'react';
import { SimulationConfig, ImpactRecord, SOUND_SPEED } from '../types';

interface VisualizerProps {
  config: SimulationConfig;
  currentTime: number;
  impacts: ImpactRecord[];
}

const Visualizer: React.FC<VisualizerProps> = ({ config, currentTime, impacts }) => {
  const { speedA, speedB, initialDistance, soundInterval } = config;

  // Scale: we map initialDistance to 80% of the SVG width
  const PADDING = 100;
  const viewBoxWidth = 1000;
  const scale = (viewBoxWidth - 2 * PADDING) / initialDistance;

  const getX = (meters: number) => PADDING + meters * scale;

  // Colors for Sound 1 and Sound 2
  const COLOR_1 = "#fb923c"; // Orange 400
  const COLOR_2 = "#2dd4bf"; // Teal 400

  // Collision Calculation
  const collisionTime = initialDistance / (speedA + speedB);
  const collisionX = speedA * collisionTime;
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
    <div className="flex-1 flex items-center justify-center">
      <svg 
        viewBox={`0 0 ${viewBoxWidth} 400`} 
        className="w-full h-full drop-shadow-2xl"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Track */}
        <line x1="0" y1="200" x2={viewBoxWidth} y2="200" stroke="#475569" strokeWidth="4" />
        <line x1="0" y1="205" x2={viewBoxWidth} y2="205" stroke="#1e293b" strokeWidth="2" strokeDasharray="10,10" />

        {/* Emission Point Markers */}
        {hasEmitted1 && (
          <g transform={`translate(${getX(0)}, 200)`}>
            <circle r="4" fill={COLOR_1} />
            <line y1="-15" y2="15" stroke={COLOR_1} strokeWidth="2" />
            <text y="30" textAnchor="middle" className="text-[10px] font-bold" fill={COLOR_1}>发射点 1 (0m)</text>
          </g>
        )}
        {hasEmitted2 && (
          <g transform={`translate(${getX(emit2Position)}, 200)`}>
            <circle r="4" fill={COLOR_2} />
            <line y1="-15" y2="15" stroke={COLOR_2} strokeWidth="2" />
            <text y="30" textAnchor="middle" className="text-[10px] font-bold" fill={COLOR_2}>发射点 2 ({emit2Position.toFixed(1)}m)</text>
          </g>
        )}

        {/* Train A (Left) - Hidden after collision */}
        {!hasCollided && (
          <g transform={`translate(${getX(trainAX)}, 200)`}>
            <rect x="-40" y="-30" width="80" height="30" fill="#3b82f6" rx="4" />
            <path d="M40 -30 L60 -10 L60 0 L40 0 Z" fill="#3b82f6" />
            <text y="-45" textAnchor="middle" className="text-[14px] fill-blue-300 font-bold">火车 A</text>
            <text y="-35" textAnchor="middle" className="text-[10px] fill-blue-500 font-mono">v={speedA}m/s</text>
            {/* Whistle effect if emitting */}
            {(Math.abs(currentTime - 0) < 0.1) && (
              <circle r="15" fill="none" stroke={COLOR_1} strokeWidth="2" className="impact-ring" />
            )}
            {(Math.abs(currentTime - soundInterval) < 0.1) && (
              <circle r="15" fill="none" stroke={COLOR_2} strokeWidth="2" className="impact-ring" />
            )}
          </g>
        )}

        {/* Train B (Right) - Hidden after collision */}
        {!hasCollided && (
          <g transform={`translate(${getX(trainBX)}, 200)`}>
            <rect x="-40" y="-30" width="80" height="30" fill="#22c55e" rx="4" />
            <path d="M-40 -30 L-60 -10 L-60 0 L-40 0 Z" fill="#22c55e" />
            <text y="-45" textAnchor="middle" className="text-[14px] fill-green-300 font-bold">火车 B</text>
            <text y="-35" textAnchor="middle" className="text-[10px] fill-green-500 font-mono">v={speedB}m/s</text>
            
            {/* Impact Effects */}
            {hasImpacted1 && Math.abs(currentTime - imp1!.time) < 0.8 && (
              <circle r="30" fill="none" stroke={COLOR_1} strokeWidth="4" className="impact-ring" />
            )}
            {hasImpacted2 && Math.abs(currentTime - imp2!.time) < 0.8 && (
              <circle r="40" fill="none" stroke={COLOR_2} strokeWidth="4" className="impact-ring" />
            )}
          </g>
        )}

        {/* Collision Effect */}
        {hasCollided && (
          <g transform={`translate(${getX(collisionX)}, 200)`}>
            <path 
              d="M-20,-20 L20,20 M-20,20 L20,-20 M-28,0 L28,0 M0,-28 L0,28" 
              stroke="#f43f5e" 
              strokeWidth="4" 
              strokeLinecap="round" 
              className="animate-pulse"
            />
            <text y="-40" textAnchor="middle" className="text-sm font-bold fill-rose-500 uppercase tracking-widest italic animate-bounce">Collision!</text>
            <text y="40" textAnchor="middle" className="text-[10px] fill-rose-400 font-mono">@{collisionTime.toFixed(3)}s</text>
          </g>
        )}

        {/* Sound 1 Dot */}
        {currentTime > 0 && !hasImpacted1 && (
          <g transform={`translate(${getX(sound1X)}, 200)`}>
             <circle r="5" fill={COLOR_1} />
             <circle r="12" fill="none" stroke={COLOR_1} strokeWidth="1" opacity="0.5" className="animate-pulse" />
             <text y="-10" textAnchor="middle" className="text-[10px] font-bold uppercase tracking-tighter" fill={COLOR_1}>S1</text>
          </g>
        )}

        {/* Sound 2 Dot */}
        {currentTime > soundInterval && !hasImpacted2 && (
          <g transform={`translate(${getX(sound2X)}, 200)`}>
             <circle r="5" fill={COLOR_2} />
             <circle r="12" fill="none" stroke={COLOR_2} strokeWidth="1" opacity="0.5" className="animate-pulse" />
             <text y="-10" textAnchor="middle" className="text-[10px] font-bold uppercase tracking-tighter" fill={COLOR_2}>S2</text>
          </g>
        )}

        {/* Impact Markers */}
        {impacts.map((imp, idx) => {
            const isOccurred = currentTime >= imp.time;
            const color = imp.label === '声音 1' ? COLOR_1 : COLOR_2;
            const yOffset = imp.label === '声音 1' ? -110 : -70;

            return isOccurred && (
                <g key={idx} transform={`translate(${getX(imp.position)}, 200)`}>
                   <line y1={yOffset + 10} y2="0" stroke={color} strokeWidth="1" strokeDasharray="4,2" />
                   <rect x="-35" y={yOffset - 10} width="70" height="20" rx="4" fill="#1e293b" stroke={color} strokeWidth="1" />
                   <text y={yOffset + 4} textAnchor="middle" className="text-[10px] font-mono font-bold" fill={color}>{imp.time.toFixed(4)}s</text>
                   <text y={yOffset - 15} textAnchor="middle" className="text-[9px] font-bold uppercase" fill={color}>{imp.label} 接收</text>
                </g>
            );
        })}
      </svg>
    </div>
  );
};

export default Visualizer;
