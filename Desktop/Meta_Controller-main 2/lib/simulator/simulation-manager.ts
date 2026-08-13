import { PhysicsEngine, MachineSpecs, MachineState, SimulationScenario } from './physics-engine';
import { 
  detectAnomaly, 
  optimizeLoad, 
  predictNextState, 
  forecastLoad,
  SensorData,
  AnomalyResult,
  OptimizationAction,
  PredictionResult
} from '../onnx/inference';

export interface SimulationResult {
  state: MachineState;
  anomaly: AnomalyResult | null;
  optimization: OptimizationAction | null;
  prediction: PredictionResult | null;
  targetLoad: number;
}

export class SimulationManager {
  private engines: Map<string, PhysicsEngine> = new Map();
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private callbacks: Map<string, (result: SimulationResult) => void> = new Map();
  
  // State history for models
  private history: Map<string, SensorData[]> = new Map();
  private loadHistory: Map<string, number[]> = new Map();
  
  // Control targets
  private targetLoads: Map<string, number> = new Map();
  private lastRlRun: Map<string, number> = new Map();

  public registerMachine(machineId: string, specs: MachineSpecs) {
    console.log(`Registering machine: ${machineId}`);
    if (!this.engines.has(machineId)) {
      this.engines.set(machineId, new PhysicsEngine(specs));
      this.history.set(machineId, []);
      this.loadHistory.set(machineId, []);
      this.targetLoads.set(machineId, 75); // Default 75% load
      console.log(`Machine ${machineId} registered successfully.`);
    } else {
      console.log(`Machine ${machineId} already registered.`);
    }
  }

  public startSimulation(machineId: string, onUpdate: (result: SimulationResult) => void) {
    console.log(`Starting simulation for machine: ${machineId}`);
    console.log(`Available engines: ${Array.from(this.engines.keys()).join(', ')}`);
    if (this.intervals.has(machineId)) return; // Already running

    const engine = this.engines.get(machineId);
    if (!engine) {
      console.error(`Machine ${machineId} not found in registry!`);
      throw new Error(`Machine ${machineId} not registered`);
    }

    this.callbacks.set(machineId, onUpdate);

    // Run simulation loop at 10Hz (every 100ms)
    const interval = setInterval(async () => {
      const currentTargetLoad = this.targetLoads.get(machineId) || 75;
      const targetRpm = 2800; // Fixed RPM target for now
      
      // 1. Update Physics
      const newState = engine.update(0.1, targetRpm, currentTargetLoad);
      
      // 2. Prepare Sensor Data
      // Estimate current from power (P = V*I, assume 220V) -> I = P/220 * 1000
      // CLAMP: Ensure current doesn't exceed scaler max (50A)
      const estimatedCurrent = Math.min(50, (newState.power * 1000) / 220);
      
      // Estimate torque (P = T*w) -> T = P/w
      const angularVelocity = (newState.rpm * 2 * Math.PI) / 60;
      // CLAMP: Ensure torque doesn't exceed scaler max (50Nm)
      const estimatedTorque = angularVelocity > 0 ? Math.min(50, (newState.power * 1000) / angularVelocity) : 0;

      const sensorData: SensorData = {
        rpm: newState.rpm,
        load_percent: newState.load,
        load_kw: newState.power,
        current: estimatedCurrent,
        torque: estimatedTorque,
        vibration: newState.vibration,
        temperature: newState.temperature,
      };

      // Update History
      const machineHistory = this.history.get(machineId) || [];
      machineHistory.push(sensorData);
      if (machineHistory.length > 24) machineHistory.shift();
      this.history.set(machineId, machineHistory);

      const machineLoadHistory = this.loadHistory.get(machineId) || [];
      machineLoadHistory.push(newState.power);
      if (machineLoadHistory.length > 24) machineLoadHistory.shift();
      this.loadHistory.set(machineId, machineLoadHistory);

      // 3. Run ML Models (Async but we don't await to block physics loop too much, 
      // actually we should await or run in parallel, but for simplicity we await here)
      
      let anomaly: AnomalyResult | null = null;
      let optimization: OptimizationAction | null = null;
      let prediction: PredictionResult | null = null;

      try {
        // Anomaly Detection
        anomaly = await detectAnomaly(sensorData);

        // RL Optimization (DQN)
        // Run every 2 seconds to allow physics to settle
        const now = Date.now();
        const lastRun = this.lastRlRun.get(machineId) || 0;
        
        if (now - lastRun > 2000) {
          optimization = await optimizeLoad(sensorData);
          this.lastRlRun.set(machineId, now);
          
          // Apply RL Decision
          if (optimization) {
            let newTarget = currentTargetLoad;
            if (optimization.action === 'decrease_load') {
                newTarget -= 5;
                console.log(`[RL-Agent] Decreasing load for ${machineId} to ${newTarget}%`);
            }
            if (optimization.action === 'increase_load') {
                newTarget += 5;
                console.log(`[RL-Agent] Increasing load for ${machineId} to ${newTarget}%`);
            }
            
            // Clamp target
            newTarget = Math.max(10, Math.min(95, newTarget));
            this.targetLoads.set(machineId, newTarget);
          }
        }

        // Digital Twin Prediction
        if (machineHistory.length >= 10) {
          prediction = await predictNextState(machineHistory);
        }

      } catch (e) {
        console.error('ML Inference Error:', e);
      }

      const callback = this.callbacks.get(machineId);
      if (callback) {
        callback({
          state: newState,
          anomaly,
          optimization,
          prediction,
          targetLoad: this.targetLoads.get(machineId) || 75
        });
      }
    }, 250);

    this.intervals.set(machineId, interval);
  }

  public stopSimulation(machineId: string) {
    const interval = this.intervals.get(machineId);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(machineId);
    }
  }

  public setScenario(machineId: string, scenario: SimulationScenario) {
    const engine = this.engines.get(machineId);
    if (engine) {
      engine.setScenario(scenario);
    }
  }

  public getEngine(machineId: string): PhysicsEngine | undefined {
    return this.engines.get(machineId);
  }
}

// Global singleton pattern to prevent multiple instances during HMR
const globalForSim = global as unknown as { simulationManager: SimulationManager };

export const simulationManager = globalForSim.simulationManager || new SimulationManager();

if (process.env.NODE_ENV !== 'production') {
  globalForSim.simulationManager = simulationManager;
}
