export interface SensorReading {
  timestamp: string;
  unit_id: string;
  temp: number;
  pressure: number;
  airflow: number;
  vibration: number;
  power: number;
}

export interface HVACUnit {
  unit_id: string;
  latestReading: SensorReading;
  healthScore: number;
  status: 'Healthy' | 'Warning' | 'Critical';
}

export type StatusType = 'Healthy' | 'Warning' | 'Critical';

export interface MaintenanceInsight {
  issue: string;
  severity: StatusType;
  recommendation: string;
  confidence: 'high' | 'medium' | 'low';
}
