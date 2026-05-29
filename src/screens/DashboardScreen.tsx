import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, SafeAreaView } from 'react-native';
import { HVACUnit } from '../types';
import { loadCSV } from '../services/loadCSV';
import { calculateHealthScore, getStatus } from '../utils/healthScore';
import { HVACCard } from '../components/HVACCard';
import { DetailScreen } from './DetailScreen';

export function DashboardScreen() {
  const [units, setUnits] = useState<HVACUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUnit, setSelectedUnit] = useState<HVACUnit | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const readings = await loadCSV();
    
    const unitMap = new Map<string, HVACUnit>();
    
    readings.forEach(reading => {
      const existing = unitMap.get(reading.unit_id);
      if (!existing || reading.timestamp > existing.latestReading.timestamp) {
        const healthScore = calculateHealthScore(reading);
        unitMap.set(reading.unit_id, {
          unit_id: reading.unit_id,
          latestReading: reading,
          healthScore,
          status: getStatus(healthScore)
        });
      }
    });
    
    const sortedUnits = Array.from(unitMap.values()).sort((a, b) => {
      const statusOrder = { Critical: 0, Warning: 1, Healthy: 2 };
      return statusOrder[a.status] - statusOrder[b.status];
    });
    
    setUnits(sortedUnits);
    setLoading(false);
  }

  if (selectedUnit) {
    return <DetailScreen unit={selectedUnit} onBack={() => setSelectedUnit(null)} />;
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Loading HVAC Data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>HVAC Monitor</Text>
        <Text style={styles.subtitle}>{units.length} Units</Text>
      </View>
      <FlatList
        data={units}
        keyExtractor={item => item.unit_id}
        renderItem={({ item }) => (
          <HVACCard unit={item} onPress={() => setSelectedUnit(item)} />
        )}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280'
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937'
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4
  },
  list: {
    paddingVertical: 8
  }
});
