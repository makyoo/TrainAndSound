
export interface SimulationConfig {
  speedA: number; // m/s
  speedB: number; // m/s
  initialDistance: number; // m
  soundInterval: number; // s
}

export interface ImpactRecord {
  time: number;
  position: number;
  label: string;
}

export const SOUND_SPEED = 340; // m/s
