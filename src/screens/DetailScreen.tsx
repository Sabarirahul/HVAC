import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { HVACUnit } from '../types';
import { generateMaintenanceInsight, MaintenanceInsight } from '../services/ai';

interface DetailScreenProps {
  unit: HVACUnit;
  onBack: () => void;
}

export function DetailScreen({ unit, onBack }: DetailScreenProps) {
  const [insight, setInsight] = useState<MaintenanceInsight | null>(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    loadInsight();
  }, [unit.unit_id]);

  async function loadInsight() {
    setLoading(true);
    const result = await generateMaintenanceInsight(unit);
    setInsight(result);
    setLoading(false);
    setRetrying(false);
  }

  async function handleRetry() {
    setRetrying(true);
    await loadInsight();
  }

  const statusColor = {
    Healthy: '#10b981',
    Warning: '#f59e0b',
    Critical: '#ef4444'
  }[unit.status];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.unitId}>{unit.unit_id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Text style={styles.statusText}>{unit.status}</Text>
        </View>
      </View>

      <View style={styles.scoreCard}>
        <Text style={styles.scoreLabel}>Health Score</Text>
        <Text style={[styles.scoreValue, { color: statusColor }]}>{unit.healthScore}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sensor Readings</Text>
        <View style={styles.metricsGrid}>
          <MetricCard label="Temperature" value={`${unit.latestReading.temp.toFixed(1)}°F`} normal="60-80°F" />
          <MetricCard label="Pressure" value={`${unit.latestReading.pressure.toFixed(1)} PSI`} normal="28-32 PSI" />
          <MetricCard label="Airflow" value={`${unit.latestReading.airflow.toFixed(0)} CFM`} normal="450-550 CFM" />
          <MetricCard label="Vibration" value={unit.latestReading.vibration.toFixed(2)} normal="<0.5" />
          <MetricCard label="Power" value={`${unit.latestReading.power.toFixed(1)} kW`} normal="3-5 kW" />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🤖 AI Maintenance Insight</Text>
        {loading ? (
          <View style={styles.insightLoading}>
            <ActivityIndicator size="small" color="#3b82f6" />
            <Text style={styles.insightLoadingText}>Analyzing sensor data...</Text>
          </View>
        ) : insight ? (
          <View style={[styles.insightCard, { borderLeftColor: statusColor }]}>
            <View style={styles.insightHeader}>
              <Text style={styles.insightIssue}>{insight.issue}</Text>
              <View style={[styles.confidenceBadge, { backgroundColor: getConfidenceColor(insight.confidence) }]}>
                <Text style={styles.confidenceText}>{insight.confidence}</Text>
              </View>
            </View>
            <Text style={styles.insightRecommendation}>{insight.recommendation}</Text>
            {retrying ? (
              <ActivityIndicator size="small" color="#3b82f6" style={styles.retryLoader} />
            ) : (
              <TouchableOpacity onPress={handleRetry} style={styles.retryButton}>
                <Text style={styles.retryText}>↻ Refresh Insight</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}

function MetricCard({ label, value, normal }: { label: string; value: string; normal: string }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricNormal}>Normal: {normal}</Text>
    </View>
  );
}

function getConfidenceColor(confidence: string): string {
  return {
    high: '#10b981',
    medium: '#f59e0b',
    low: '#6b7280'
  }[confidence] || '#6b7280';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6'
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  backButton: {
    marginBottom: 12
  },
  backText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '600'
  },
  unitId: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600'
  },
  scoreCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  scoreLabel: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 8
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: '700'
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  metricCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    width: '47%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  metricLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4
  },
  metricNormal: {
    fontSize: 10,
    color: '#9ca3af'
  },
  insightCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  insightIssue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
    marginRight: 8
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  confidenceText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  insightRecommendation: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 12
  },
  insightLoading: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  insightLoadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280'
  },
  retryButton: {
    alignSelf: 'flex-start',
    paddingVertical: 6
  },
  retryText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600'
  },
  retryLoader: {
    alignSelf: 'flex-start',
    marginTop: 4
  }
});
