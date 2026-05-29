import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { HVACUnit } from '../types';

interface HVACCardProps {
  unit: HVACUnit;
  onPress?: () => void;
}

export function HVACCard({ unit, onPress }: HVACCardProps) {
  const statusColor = {
    Healthy: '#10b981',
    Warning: '#f59e0b',
    Critical: '#ef4444'
  }[unit.status];

  const CardWrapper = onPress ? TouchableOpacity : View;

  return (
    <CardWrapper style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={styles.unitId}>{unit.unit_id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Text style={styles.statusText}>{unit.status}</Text>
        </View>
      </View>
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreLabel}>Health Score</Text>
        <Text style={[styles.scoreValue, { color: statusColor }]}>{unit.healthScore}</Text>
      </View>
      <View style={styles.metrics}>
        <MetricItem label="Temp" value={`${unit.latestReading.temp.toFixed(1)}°F`} />
        <MetricItem label="Pressure" value={`${unit.latestReading.pressure.toFixed(1)} PSI`} />
        <MetricItem label="Airflow" value={`${unit.latestReading.airflow.toFixed(0)} CFM`} />
      </View>
      {onPress && <Text style={styles.tapHint}>Tap for AI insights →</Text>}
    </CardWrapper>
  );
}

function MetricItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  unitId: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937'
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600'
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  scoreLabel: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500'
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: '700'
  },
  metrics: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  metric: {
    flex: 1,
    alignItems: 'center'
  },
  metricLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937'
  },
  tapHint: {
    marginTop: 12,
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '600',
    textAlign: 'center'
  }
});
