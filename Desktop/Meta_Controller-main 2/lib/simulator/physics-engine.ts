
export type SimulationScenario = 
  | 'NORMAL' 
  | 'HIGH_LOAD' 
  | 'OVERHEATING' 
  | 'UNBALANCED' 
  | 'RUNNING_BEHIND'; // High resistance/friction, lower RPM than target

export interface MachineSpecs {
  maxRpm: number;
  maxTemp: number;
  maxPower: number; // kW
  baseVibration: number;
  coolingRate: number; // degrees per second per degree diff
  heatingFactor: number; // degrees per second at max load
}

export interface MachineState {
  rpm: number;
  temperature: number;
  vibration: number;
  power: number; // kW
  load: number; // %
  efficiency: number; // %
  noise: number; // dB
  timestamp: number;
}

export class PhysicsEngine {
  private state: MachineState;
  private specs: MachineSpecs;
  private scenario: SimulationScenario = 'NORMAL';
  
  // Internal physics variables
  private ambientTemp = 25;

  constructor(specs: MachineSpecs, initialState?: Partial<MachineState>) {
    this.specs = specs;
    this.state = {
      rpm: 0,
      temperature: this.ambientTemp,
      vibration: 0,
      power: 0,
      load: 0,
      efficiency: 100,
      noise: 40,
      timestamp: Date.now(),
      ...initialState
    };
  }

  public setScenario(scenario: SimulationScenario) {
    this.scenario = scenario;
  }

  public getScenario(): SimulationScenario {
    return this.scenario;
  }

  public getState(): MachineState {
    return { ...this.state };
  }

  public update(dtSeconds: number, targetRpm: number, targetLoad: number): MachineState {
    // Apply scenario modifiers
    let effectiveTargetRpm = targetRpm;
    let effectiveLoad = targetLoad;
    let vibrationMultiplier = 1.0;
    let heatingMultiplier = 1.0;
    let efficiencyMultiplier = 1.0;

    switch (this.scenario) {
      case 'HIGH_LOAD':
        effectiveLoad = Math.min(100, targetLoad * 1.5);
        heatingMultiplier = 1.2;
        break;
      case 'OVERHEATING':
        heatingMultiplier = 3.0; // Cooling failure or friction
        break;
      case 'UNBALANCED':
        vibrationMultiplier = 4.0;
        // Unbalanced load causes slight RPM fluctuation
        effectiveTargetRpm = targetRpm + (Math.sin(Date.now() / 100) * 50);
        break;
      case 'RUNNING_BEHIND':
        // Machine is struggling, can't reach RPM, efficiency drops
        // Simulates a "lag" or "slip" condition
        effectiveTargetRpm = targetRpm * 0.85; 
        effectiveLoad = Math.min(100, targetLoad * 1.2); // Working harder to do less
        efficiencyMultiplier = 0.75;
        heatingMultiplier = 1.4;
        vibrationMultiplier = 1.5;
        break;
    }

    // 1. RPM Physics (Inertia)
    // Calculate how much we can change RPM in this time step
    const rpmDiff = effectiveTargetRpm - this.state.rpm;
    const rpmChangeRate = 200; // Max RPM change per second (inertia)
    
    // If running behind, acceleration is slower
    const accelerationModifier = this.scenario === 'RUNNING_BEHIND' ? 0.5 : 1.0;
    
    const maxChange = rpmChangeRate * dtSeconds * accelerationModifier;
    const rpmChange = Math.sign(rpmDiff) * Math.min(Math.abs(rpmDiff), maxChange);
    
    this.state.rpm += rpmChange;
    
    // Add some random fluctuation to RPM (natural variance)
    this.state.rpm += (Math.random() - 0.5) * 5; 
    if (this.state.rpm < 0) this.state.rpm = 0;

    // 2. Load Physics
    // Load fluctuates slightly
    this.state.load = effectiveLoad + (Math.random() - 0.5) * 2; 
    if (this.state.load < 0) this.state.load = 0;
    if (this.state.load > 100) this.state.load = 100;

    // 3. Temperature Physics
    // Heat generation depends on Load and RPM
    // Formula: HeatGen = Factor * Load% * (RPM/MaxRPM)^2
    const loadFactor = this.state.load / 100;
    const rpmFactor = this.state.rpm / this.specs.maxRpm;
    
    // Heat generation
    // Adjusted formula to be more realistic:
    // HeatGen = BaseHeating + (LoadFactor * RPMFactor * HeatingFactor)
    // We want steady state at 100% load to be around 80-90C
    // If ambient is 25C, tempDiff is 60C.
    // HeatDiss = 60 * coolingRate.
    // So HeatGen must equal HeatDiss at steady state.
    
    // Let's say coolingRate is 0.1 (10% of diff per second).
    // At 85C, Dissipation = (85-25) * 0.1 = 6 degrees/sec.
    // So Generation must be 6 degrees/sec at max load.
    
    const targetSteadyStateTemp = 85 * heatingMultiplier; // 85C normal, higher if overheating
    // Reduce heating rate slightly to prevent overshoot
    const maxHeatDissipation = (targetSteadyStateTemp - this.ambientTemp) * this.specs.coolingRate * 0.8;
    
    const heatGen = maxHeatDissipation * loadFactor * (rpmFactor * rpmFactor + 0.2) * dtSeconds;
    
    // Heat dissipation (Newton's Law of Cooling)
    // Rate proportional to difference between object temp and ambient temp
    const tempDiff = this.state.temperature - this.ambientTemp;
    const heatDiss = tempDiff * this.specs.coolingRate * dtSeconds;
    
    this.state.temperature += (heatGen - heatDiss);
    
    // Clamp temp to ambient minimum and max safety limit
    // CLAMP: Max temp should be 120C for normal operation to match scalers.
    // Only allow higher if scenario is explicitly OVERHEATING
    const maxAllowedTemp = this.scenario === 'OVERHEATING' ? 200 : 120;
    
    if (this.state.temperature < this.ambientTemp) this.state.temperature = this.ambientTemp;
    if (this.state.temperature > maxAllowedTemp) this.state.temperature = maxAllowedTemp;

    // 4. Vibration Physics
    // Training Data Logic: vib = 0.2 + (load * 0.7) (scaled 0-1)
    // Scaled 0-1 maps to 0-10 mm/s in our system.
    // So: Base (0.2) -> 2.0 mm/s. Load Factor (0.7) -> 7.0 mm/s.
    
    const baseVib = 2.0; // Matches the 0.2 scaled intercept
    const loadVib = (this.state.load / 100) * 7.0; // Matches the 0.7 scaled slope
    
    // We add a small RPM component for realism, but keep it minor to not break the ML model's expectations
    const rpmVib = (this.state.rpm / this.specs.maxRpm) * 0.5; 

    this.state.vibration = (baseVib + loadVib + rpmVib) * vibrationMultiplier;
    
    // Add noise to vibration
    this.state.vibration += (Math.random() - 0.5) * 0.1;
    if (this.state.vibration < 0) this.state.vibration = 0;

    // 5. Power Physics
    // Power = Torque * AngularVelocity
    // Simplified: Power proportional to Load * RPM
    // We assume MaxPower is reached at MaxRPM and MaxLoad
    const idealPower = this.specs.maxPower * (this.state.load / 100) * (this.state.rpm / this.specs.maxRpm);
    
    // Efficiency affects power consumption (Lower efficiency = Higher power draw for same work)
    // CLAMP: Ensure we don't exceed maxPower * 1.5 even with low efficiency
    this.state.power = Math.min(this.specs.maxPower * 1.5, idealPower / efficiencyMultiplier); 
    
    // Add some electrical noise
    this.state.power += (Math.random() - 0.5) * 0.2;
    if (this.state.power < 0) this.state.power = 0;

    // 6. Efficiency Calculation
    // Base efficiency drops with heat and wear
    let currentEfficiency = 95 * efficiencyMultiplier; // Base 95%
    
    // Heat penalty: Efficiency drops if temp > 80C
    if (this.state.temperature > 80) {
        currentEfficiency -= (this.state.temperature - 80) * 0.5;
    }
    
    this.state.efficiency = Math.max(0, Math.min(100, currentEfficiency));

    // 7. Noise Level (dB)
    // Base 60dB + RPM contribution + Vibration contribution
    this.state.noise = 60 + (this.state.rpm / this.specs.maxRpm) * 30 + (this.state.vibration * 10);

    this.state.timestamp = Date.now();

    return { ...this.state };
  }
}
