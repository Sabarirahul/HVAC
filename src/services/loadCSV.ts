import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';
import Papa from 'papaparse';

import { SensorRow } from '../types';

export async function loadCSV(): Promise<SensorRow[]> {
  try {
    const asset = Asset.fromModule(
      require('../../assets/hvac_sensor_data.csv')
    );

    await asset.downloadAsync();

    const fileUri = asset.localUri || asset.uri;

    const csvString =
      await FileSystem.readAsStringAsync(fileUri);

    const parsed = Papa.parse<SensorRow>(csvString, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
    });

    return parsed.data;
  } catch (error) {
    console.log('Error loading CSV:', error);
    return [];
  }
}