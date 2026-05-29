import axios from 'axios';
import { HVACUnit, StatusType } from '../types';

export interface MaintenanceInsight {
  issue: string;
  severity: StatusType;
  recommendation: string;
  confidence: 'high' | 'medium' | 'low';
}

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * Generates AI-powered maintenance insights for HVAC units.
 * 
 * Why Fallback Matters:
 * - Industrial environments often have unreliable network connectivity
 * - API rate limits and quotas can be exceeded during peak usage
 * - Technicians need insights even when external services fail
 * - Fallback ensures the app remains useful in offline/degraded scenarios
 * 
 * Alert Fatigue Reduction:
 * - Rule-based fallback focuses on actionable anomalies only
 * - Avoids generating alerts for minor deviations
 * - Prioritizes critical issues that require immediate attention
 * - Provides context-aware recommendations based on sensor patterns
 */
export async function generateMaintenanceInsight(
  unit: HVACUnit
): Promise<MaintenanceInsight> {
  // Always have a fallback ready based on sensor analysis
  const fallbackInsight = generateLocalInsight(unit);

  // If no API key configured, use local analysis immediately
  if (!OPENAI_API_KEY) {
    console.warn('OpenAI API key not configured - using local analysis');
    return fallbackInsight;
  }

  try {
    const prompt = buildPrompt(unit);
    
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an HVAC maintenance expert helping factory technicians. Provide concise, actionable insights. Respond ONLY with valid JSON in this exact format: {"issue": "brief issue description", "severity": "Critical|Warning|Healthy", "recommendation": "specific action for technician", "confidence": "high|medium|low"}'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 200
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        timeout: 10000
      }
    );

    const content = response.data.choices[0].message.content.trim();
    const insight = parseAIResponse(content);
    
    // If AI response is valid, return it with high confidence
    if (insight) {
      return { ...insight, confidence: 'high' };
    }
    
    // If parsing failed, use fallback
    console.warn('AI response parsing failed - using local analysis');
    return fallbackInsight;
    
  } catch (error) {
    // Handle specific API errors with appropriate logging
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      
      if (status === 429) {
        console.warn('OpenAI rate limit exceeded - using local analysis');
      } else if (status === 401) {
        console.error('Invalid OpenAI API key - using local analysis');
      } else if (status === 403) {
        console.error('OpenAI quota exceeded - using local analysis');
      } else if (error.code === 'ECONNABORTED') {
        console.warn('OpenAI request timeout - using local analysis');
      } else if (error.code === 'ERR_NETWORK') {
        console.warn('Network error - using local analysis');
      } else {
        console.error('OpenAI API error:', error.message);
      }
    } else {
      console.error('Unexpected error generating insight:', error);
    }
    
    // Always return fallback - never leave technician without guidance
    return fallbackInsight;
  }
}

/**
 * Generates local rule-based maintenance insights.
 * 
 * This provides resilient, offline-capable diagnostics based on:
 * - Sensor threshold violations
 * - Common HVAC failure patterns
 * - Industry best practices
 * 
 * Resilience in Industrial Environments:
 * - Works without internet connectivity
 * - No dependency on external services
 * - Instant response time
 * - Predictable, deterministic behavior
 * - No API costs or rate limits
 */
function generateLocalInsight(unit: HVACUnit): MaintenanceInsight {
  const { latestReading, healthScore, status } = unit;
  
  // Define normal operating ranges
  const TEMP_MIN = 60, TEMP_MAX = 80;
  const PRESSURE_MIN = 28, PRESSURE_MAX = 32;
  const AIRFLOW_MIN = 450, AIRFLOW_MAX = 550;
  const VIBRATION_MAX = 0.5;
  const POWER_MIN = 3, POWER_MAX = 5;
  
  // Calculate deviations from normal ranges
  const tempDeviation = Math.max(
    0,
    latestReading.temp < TEMP_MIN ? TEMP_MIN - latestReading.temp : latestReading.temp - TEMP_MAX
  );
  const pressureDeviation = Math.max(
    0,
    latestReading.pressure < PRESSURE_MIN ? PRESSURE_MIN - latestReading.pressure : latestReading.pressure - PRESSURE_MAX
  );
  const airflowDeviation = Math.max(
    0,
    latestReading.airflow < AIRFLOW_MIN ? AIRFLOW_MIN - latestReading.airflow : latestReading.airflow - AIRFLOW_MAX
  );
  const vibrationExcess = Math.max(0, latestReading.vibration - VIBRATION_MAX);
  const powerDeviation = Math.max(
    0,
    latestReading.power < POWER_MIN ? POWER_MIN - latestReading.power : latestReading.power - POWER_MAX
  );
  
  // Priority 1: Critical vibration (bearing failure risk)
  if (vibrationExcess > 0.5) {
    return {
      issue: 'Excessive vibration detected',
      severity: 'Critical',
      recommendation: 'Immediate inspection required. Check bearings, motor mounts, and fan balance. Risk of mechanical failure.',
      confidence: 'high'
    };
  }
  
  // Priority 2: High vibration (early warning)
  if (vibrationExcess > 0.2) {
    return {
      issue: 'Elevated vibration levels',
      severity: 'Warning',
      recommendation: 'Schedule maintenance. Inspect bearings and motor alignment. Monitor closely for progression.',
      confidence: 'high'
    };
  }
  
  // Priority 3: Low airflow (common issue)
  if (airflowDeviation > 100) {
    return {
      issue: 'Significantly reduced airflow',
      severity: 'Critical',
      recommendation: 'Check filters immediately. Inspect ductwork for blockages. Verify fan operation.',
      confidence: 'high'
    };
  }
  
  if (airflowDeviation > 50) {
    return {
      issue: 'Below normal airflow',
      severity: 'Warning',
      recommendation: 'Replace or clean air filters. Check for partial duct obstructions.',
      confidence: 'medium'
    };
  }
  
  // Priority 4: Temperature anomalies
  if (tempDeviation > 15) {
    return {
      issue: latestReading.temp > TEMP_MAX ? 'System overheating' : 'Temperature too low',
      severity: 'Critical',
      recommendation: latestReading.temp > TEMP_MAX 
        ? 'Check refrigerant levels, condenser coils, and airflow. Possible compressor issue.'
        : 'Verify thermostat settings. Check heating elements and refrigerant charge.',
      confidence: 'high'
    };
  }
  
  if (tempDeviation > 5) {
    return {
      issue: 'Temperature deviation from normal range',
      severity: 'Warning',
      recommendation: 'Monitor temperature trends. Clean coils and check refrigerant if issue persists.',
      confidence: 'medium'
    };
  }
  
  // Priority 5: Pressure anomalies (compressor/duct issues)
  if (pressureDeviation > 5) {
    return {
      issue: latestReading.pressure > PRESSURE_MAX ? 'High system pressure' : 'Low system pressure',
      severity: 'Critical',
      recommendation: latestReading.pressure > PRESSURE_MAX
        ? 'Inspect compressor and pressure relief valves. Check for duct restrictions.'
        : 'Check for leaks in ductwork. Inspect compressor operation and seals.',
      confidence: 'high'
    };
  }
  
  if (pressureDeviation > 2) {
    return {
      issue: 'Pressure outside optimal range',
      severity: 'Warning',
      recommendation: 'Monitor pressure trends. Inspect ductwork and compressor if deviation increases.',
      confidence: 'medium'
    };
  }
  
  // Priority 6: Power consumption anomalies
  if (powerDeviation > 2) {
    return {
      issue: latestReading.power > POWER_MAX ? 'High power consumption' : 'Low power draw',
      severity: 'Warning',
      recommendation: latestReading.power > POWER_MAX
        ? 'Check for mechanical resistance, dirty coils, or compressor strain.'
        : 'Verify motor operation. Check for electrical issues or reduced load.',
      confidence: 'medium'
    };
  }
  
  // All sensors within acceptable ranges
  if (healthScore >= 80) {
    return {
      issue: 'All systems operating normally',
      severity: 'Healthy',
      recommendation: 'Continue routine monitoring. Next scheduled maintenance as planned.',
      confidence: 'high'
    };
  }
  
  // Minor deviations - general guidance
  return {
    issue: 'Minor sensor deviations detected',
    severity: status,
    recommendation: 'Monitor trends closely. Schedule inspection if readings worsen.',
    confidence: 'medium'
  };
}

function buildPrompt(unit: HVACUnit): string {
  const { latestReading, healthScore, status } = unit;
  
  return `Analyze HVAC unit ${unit.unit_id}:
- Temperature: ${latestReading.temp.toFixed(1)}°F (normal: 60-80°F)
- Pressure: ${latestReading.pressure.toFixed(1)} PSI (normal: 28-32 PSI)
- Airflow: ${latestReading.airflow.toFixed(0)} CFM (normal: 450-550 CFM)
- Vibration: ${latestReading.vibration.toFixed(2)} (normal: <0.5)
- Power: ${latestReading.power.toFixed(1)} kW (normal: 3-5 kW)
- Health Score: ${healthScore}/100
- Current Status: ${status}

Provide maintenance insight focusing on the most critical issue. Avoid false alarms for minor deviations.`;
}

function parseAIResponse(content: string): MaintenanceInsight | null {
  try {
    // Remove markdown code blocks if present
    const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);
    
    if (parsed.issue && parsed.severity && parsed.recommendation && parsed.confidence) {
      return {
        issue: parsed.issue,
        severity: parsed.severity as StatusType,
        recommendation: parsed.recommendation,
        confidence: parsed.confidence
      };
    }
    return null;
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    return null;
  }
}
