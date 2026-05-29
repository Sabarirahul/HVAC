import { SensorReading, StatusType } from '../types';

export function calculateHealthScore(reading: SensorReading): number {
  const tempScore = reading.temp >= 60 && reading.temp <= 80 ? 100 : Math.max(0, 100 - Math.abs(70 - reading.temp) * 5);
  const pressureScore = reading.pressure >= 28 && reading.pressure <= 32 ? 100 : Math.max(0, 100 - Math.abs(30 - reading.pressure) * 10);
  const airflowScore = reading.airflow >= 450 && reading.airflow <= 550 ? 100 : Math.max(0, 100 - Math.abs(500 - reading.airflow) * 0.5);
  const vibrationScore = reading.vibration <= 0.5 ? 100 : Math.max(0, 100 - (reading.vibration - 0.5) * 100);
  const powerScore = reading.power >= 3 && reading.power <= 5 ? 100 : Math.max(0, 100 - Math.abs(4 - reading.power) * 25);
  
  return Math.round((tempScore + pressureScore + airflowScore + vibrationScore + powerScore) / 5);
}

export function getStatus(healthScore: number): StatusType {
  if (healthScore >= 80) return 'Healthy';
  if (healthScore >= 60) return 'Warning';
  return 'Critical';
}
