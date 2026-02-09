
import React, { useLayoutEffect, useRef, useState } from 'react';
import { SimulationConfig, ImpactRecord, SOUND_SPEED } from '../types';

interface VisualizerProps {
  config: SimulationConfig;
  currentTime: number;
  impacts: ImpactRecord[];
}

const Visualizer: React.FC<VisualizerProps> = ({ config, currentTime, impacts }) => {
  const { speedA, speedB, initialDistance, soundInterval } = config;
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1000, height: 400 });

  // 监听容器大小变化以实现动态调节
  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // 计算响应式缩放因子
  // 当实际宽度较小时，我们需要增加 SVG 内部元素的相对尺寸（粗细、半径等）
  // 1000 是我们的 viewBox 设计宽度
  const isPortrait = dimensions.height > dimensions.width;
  const responsiveScale = Math.max(1, 1000 / (dimensions.width || 1000));
  
  // 针对竖屏优化：减小边距以利用更多空间，同时增加重要元素的粗细
  const PADDING = isPortrait ? 60 : 100;
  const viewBoxWidth = 1000;
  const scale = (viewBoxWidth - 2 * PADDING) / initialDistance;

  const getX = (meters: number) => PADDING + meters * scale;

  // 动态尺寸设置
  const trackHeight = 4 * (isPortrait ? 1.5 : 1);
  const pulseRadius = 4 * responsiveScale * 0.8;
  const pulseRingRadius = 12 * responsiveScale * 0.8;
  const emissionRadius = 3 * responsiveScale;
  const lineWidth = 2 * responsiveScale;
  const impactRadius = 30 * responsiveScale * 0.5;

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
    <div ref={containerRef} className="flex-1 flex items-center justify-center p-4 min-h-0">
      <svg 
        viewBox={`0 0 ${viewBoxWidth} 400`} 
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Main Track */}
        <rect x="0" y={200 - trackHeight/2} width={viewBoxWidth} height={trackHeight} fill="#334155" rx={trackHeight/2} />
        <line 
          x1="0" y1="200" x2={viewBoxWidth} y2="200" 
          stroke="#1e293b" 
          strokeWidth={responsiveScale} 
          strokeDasharray={`${10 * responsiveScale},${10 * responsiveScale}`} 
        />

        {/* Emission Points */}
        {hasEmitted1 && (
          <g transform={`translate(${getX(0)}, 200)`} opacity="0.6">
            <circle r={emissionRadius} fill={COLOR_1} />
            <text 
              y={25 * responsiveScale} 
              textAnchor="middle" 
              style={{ fontSize: `${10 * responsiveScale}px` }}
              className="font-bold fill-slate-500"
            >
              发射点 1
            </text>
          </g>
        )}
        {hasEmitted2 && (
          <g transform={`translate(${getX(emit2Position)}, 200)`} opacity="0.6">
            <circle r={emissionRadius} fill={COLOR_2} />
            <text 
              y={25 * responsiveScale} 
              textAnchor="middle" 
              style={{ fontSize: `${10 * responsiveScale}px` }}
              className="font-bold fill-slate-500"
            >
              发射点 2
            </text>
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
            strokeWidth={lineWidth} 
            strokeDasharray={`${4 * responsiveScale},${2 * responsiveScale}`}
            className="animate-pulse"
          />
        )}

        {/* Sound 1 Pulse */}
        {currentTime > 0 && !hasImpacted1 && (
          <g transform={`translate(${getX(sound1X)}, 200)`}>
             <circle r={pulseRadius} fill={COLOR_1} />
             <circle r={pulseRingRadius} fill="none" stroke={COLOR_1} strokeWidth={responsiveScale} opacity="0.5" className="animate-pulse" />
             <text 
               y={-15 * responsiveScale} 
               textAnchor="middle" 
               style={{ fontSize: `${11 * responsiveScale}px` }}
               className="font-bold fill-orange-400"
             >
               声音 1
             </text>
          </g>
        )}

        {/* Sound 2 Pulse */}
        {currentTime > soundInterval && !hasImpacted2 && (
          <g transform={`translate(${getX(sound2X)}, 200)`}>
             <circle r={pulseRadius} fill={COLOR_2} />
             <circle r={pulseRingRadius} fill="none" stroke={COLOR_2} strokeWidth={responsiveScale} opacity="0.5" className="animate-pulse" />
             <text 
               y={-15 * responsiveScale} 
               textAnchor="middle" 
               style={{ fontSize: `${11 * responsiveScale}px` }}
               className="font-bold fill-teal-400"
             >
               声音 2
             </text>
          </g>
        )}

        {/* Train A (Left) */}
        {!hasCollided && (
          <g transform={`translate(${getX(trainAX)}, 200)`}>
            <rect x="-45" y="-32" width="90" height="32" fill="#3b82f6" rx="6" />
            <path d="M45 -32 L65 -12 L65 0 L45 0 Z" fill="#3b82f6" />
            <text 
              y={-50 * responsiveScale} 
              textAnchor="middle" 
              style={{ fontSize: `${13 * responsiveScale}px` }}
              className="font-bold fill-blue-300"
            >
              火车 A
            </text>
            <text 
              y={-38 * responsiveScale} 
              textAnchor="middle" 
              style={{ fontSize: `${10 * responsiveScale}px` }}
              className="font-mono fill-blue-500"
            >
              {speedA}m/s
            </text>
            
            {/* Whistle markers */}
            {(Math.abs(currentTime - 0) < 0.1) && <circle r={20 * responsiveScale} fill="none" stroke={COLOR_1} strokeWidth={2 * responsiveScale} className="impact-ring" />}
            {(Math.abs(currentTime - soundInterval) < 0.1) && <circle r={20 * responsiveScale} fill="none" stroke={COLOR_2} strokeWidth={2 * responsiveScale} className="impact-ring" />}
          </g>
        )}

        {/* Train B (Right) */}
        {!hasCollided && (
          <g transform={`translate(${getX(trainBX)}, 200)`}>
            <rect x="-45" y="-32" width="90" height="32" fill="#10b981" rx="6" />
            <path d="M-45 -32 L-65 -12 L-65 0 L-45 0 Z" fill="#10b981" />
            <text 
              y={-50 * responsiveScale} 
              textAnchor="middle" 
              style={{ fontSize: `${13 * responsiveScale}px` }}
              className="font-bold fill-emerald-300"
            >
              火车 B
            </text>
            <text 
              y={-38 * responsiveScale} 
              textAnchor="middle" 
              style={{ fontSize: `${10 * responsiveScale}px` }}
              className="font-mono fill-emerald-500"
            >
              {speedB}m/s
            </text>
            
            {/* Reception Visuals */}
            {hasImpacted1 && Math.abs(currentTime - imp1!.time) < 0.6 && (
              <circle r={impactRadius} fill="none" stroke={COLOR_1} strokeWidth={4 * responsiveScale} className="impact-ring" />
            )}
            {hasImpacted2 && Math.abs(currentTime - imp2!.time) < 0.6 && (
              <circle r={impactRadius} fill="none" stroke={COLOR_2} strokeWidth={4 * responsiveScale} className="impact-ring" />
            )}
          </g>
        )}

        {/* Collision Marker */}
        {hasCollided && (
          <g transform={`translate(${getX(initialDistance * speedA / (speedA + speedB))}, 200)`}>
             <circle r={50 * responsiveScale} fill="url(#collisionGradient)" opacity="0.9" />
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
            <g key={idx} transform={`translate(${getX(imp.position)}, ${200 - 20 * responsiveScale})`}>
               <circle r={2 * responsiveScale} fill={imp.label === '声音 1' ? COLOR_1 : COLOR_2} />
               <text 
                y={-10 * responsiveScale} 
                textAnchor="middle" 
                style={{ fontSize: `${9 * responsiveScale}px` }}
                className="font-mono fill-slate-500"
               >
                {imp.time.toFixed(3)}s
               </text>
            </g>
          )
        ))}
      </svg>
    </div>
  );
};

export default Visualizer;
