import { modelLoader } from './modelLoader';

export interface SensorData {
  rpm?: number;
  load_percent?: number;
  load_kw?: number;
  current?: number;
  torque?: number;
  vibration?: number;
  temperature?: number;
  acoustic_db?: number;
}

export interface PredictionResult {
  vibration: number;
  temperature: number;
}

export interface AnomalyResult {
  isAnomaly: boolean;
  reconstructionError: number;
  threshold: number;
}

export interface LoadForecast {
  predictedLoad: number;
  timestamp: Date;
}

export interface OptimizationAction {
  action: 'decrease_load' | 'hold_load' | 'increase_load';
  qValues: number[];
  confidence: number;
}

// Min-Max scaling helpers
function minMaxScale(value: number, min: number, max: number): number {
  return (value - min) / (max - min);
}

function minMaxInverse(scaledValue: number, min: number, max: number): number {
  return scaledValue * (max - min) + min;
}

// Scaling Constants (aligned with Physics Engine)
const SCALERS = {
  rpm: { min: 0, max: 3000 },
  load_percent: { min: 0, max: 100 },
  load_kw: { min: 0, max: 15 }, // Ensure physics engine respects this max
  current: { min: 0, max: 50 },
  torque: { min: 0, max: 50 },
  vibration: { min: 0, max: 10 },
  temperature: { min: 20, max: 120 },
};

// LSTM Digital Twin - Predict next machine state
export async function predictNextState(
  sensorSequence: SensorData[]
): Promise<PredictionResult> {
  try {
    await modelLoader.loadModel('lstm_digital_twin');
    
    // Prepare input: shape [1, 10, 5] for [rpm, load_percent, load_kw, current, torque]
    // We need exactly 10 steps. If less, pad with the first value.
    const sequence = [...sensorSequence];
    while (sequence.length < 10) {
      sequence.unshift(sequence[0] || {});
    }
    const last10 = sequence.slice(-10);

    const features = last10.map(s => [
      minMaxScale(s.rpm || 0, SCALERS.rpm.min, SCALERS.rpm.max),
      minMaxScale(s.load_percent || 0, SCALERS.load_percent.min, SCALERS.load_percent.max),
      minMaxScale(s.load_kw || 0, SCALERS.load_kw.min, SCALERS.load_kw.max),
      minMaxScale(s.current || 0, SCALERS.current.min, SCALERS.current.max),
      minMaxScale(s.torque || 0, SCALERS.torque.min, SCALERS.torque.max),
    ]).flat();

    const inputData = new Float32Array(features);
    const output = await modelLoader.predict('lstm_digital_twin', inputData, [1, 10, 5]);

    // Output: [vibration, temperature] (scaled 0-1)
    return {
      vibration: minMaxInverse(output[0], SCALERS.vibration.min, SCALERS.vibration.max),
      temperature: minMaxInverse(output[1], SCALERS.temperature.min, SCALERS.temperature.max),
    };
  } catch (error) {
    console.error("Digital Twin prediction failed:", error);
    return { vibration: 0, temperature: 0 };
  }
}

// Autoencoder - Detect anomalies
export async function detectAnomaly(
  sensorData: SensorData
): Promise<AnomalyResult> {
  try {
    await modelLoader.loadModel('autoencoder_anomaly');
    
    const metadata = modelLoader.getMetadata('autoencoder_anomaly');
    const threshold = metadata?.anomalyThreshold || 0.0814;

    // Input: [vibration, current, temperature]
    // Ensure inputs are valid numbers and clamped to scaler ranges
    const vib = Math.min(SCALERS.vibration.max, Math.max(SCALERS.vibration.min, isNaN(sensorData.vibration || 0) ? 0 : sensorData.vibration || 0));
    const curr = Math.min(SCALERS.current.max, Math.max(SCALERS.current.min, isNaN(sensorData.current || 0) ? 0 : sensorData.current || 0));
    const temp = Math.min(SCALERS.temperature.max, Math.max(SCALERS.temperature.min, isNaN(sensorData.temperature || 0) ? 0 : sensorData.temperature || 0));

    const inputData = new Float32Array([
      minMaxScale(vib, SCALERS.vibration.min, SCALERS.vibration.max),
      minMaxScale(curr, SCALERS.current.min, SCALERS.current.max),
      minMaxScale(temp, SCALERS.temperature.min, SCALERS.temperature.max),
    ]);

    const reconstruction = await modelLoader.predict('autoencoder_anomaly', inputData, [1, 3]);

    // Calculate MSE
    let mse = 0;
    for (let i = 0; i < 3; i++) {
      mse += Math.pow(inputData[i] - reconstruction[i], 2);
    }
    mse /= 3;

    return {
      isAnomaly: mse > threshold,
      reconstructionError: mse,
      threshold,
    };
  } catch (error) {
    console.error("Anomaly detection failed:", error);
    return { isAnomaly: false, reconstructionError: 0, threshold: 0.0814 };
  }
}

// DQN Agent - Optimize Load
export async function optimizeLoad(
  sensorData: SensorData
): Promise<OptimizationAction> {
  await modelLoader.loadModel('dqn_agent');

  // Input: [vibration, temperature, load_percent]
  // Note: Training used 'load' (0-1) which corresponds to load_percent in our system
  const inputData = new Float32Array([
    minMaxScale(sensorData.vibration || 0, SCALERS.vibration.min, SCALERS.vibration.max),
    minMaxScale(sensorData.temperature || 0, SCALERS.temperature.min, SCALERS.temperature.max),
    minMaxScale(sensorData.load_percent || 0, SCALERS.load_percent.min, SCALERS.load_percent.max),
  ]);

  const output = await modelLoader.predict('dqn_agent', inputData, [1, 3]);
  
  // Output: Q-values for [decrease, hold, increase]
  // Find max Q-value index
  let maxQ = -Infinity;
  let actionIndex = 1; // Default to hold
  for (let i = 0; i < 3; i++) {
    if (output[i] > maxQ) {
      maxQ = output[i];
      actionIndex = i;
    }
  }

  const actions: ('decrease_load' | 'hold_load' | 'increase_load')[] = ['decrease_load', 'hold_load', 'increase_load'];

  return {
    action: actions[actionIndex],
    qValues: Array.from(output),
    confidence: Math.abs(maxQ) / (Array.from(output).reduce((a, b) => Math.abs(a) + Math.abs(b), 0) || 1),
  };
}

// GRU - Forecast Load
export async function forecastLoad(
  loadHistory: number[]
): Promise<LoadForecast> {
  try {
    await modelLoader.loadModel('gru_load_forecast');

    // Input: Sequence of 24 load_kw values
    // Pad if necessary
    const sequence = [...loadHistory];
    while (sequence.length < 24) {
      sequence.unshift(sequence[0] || 0);
    }
    const last24 = sequence.slice(-24);

    const features = last24.map(l => minMaxScale(l, SCALERS.load_kw.min, SCALERS.load_kw.max));
    const inputData = new Float32Array(features);
    
    // Input shape: [1, 24, 1]
    const output = await modelLoader.predict('gru_load_forecast', inputData, [1, 24, 1]);

    return {
      predictedLoad: minMaxInverse(output[0], SCALERS.load_kw.min, SCALERS.load_kw.max),
      timestamp: new Date(Date.now() + 60 * 60 * 1000), // Forecast for next hour (example)
    };
  } catch (error) {
    console.error("Load forecast failed:", error);
    return { predictedLoad: 0, timestamp: new Date() };
  }
}
