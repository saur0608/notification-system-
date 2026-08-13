// ML Decision Engine - Orchestrates all 4 ONNX models for comprehensive machine analysis

import { 
  predictNextState, 
  detectAnomaly, 
  forecastLoad, 
  optimizeLoad,
  PredictionResult,
  AnomalyResult,
  LoadForecast as ForecastResult,
  OptimizationAction as OptimizationResult
} from './onnx/inference';

export type AlertLevel = 'normal' | 'warning' | 'critical';
export type ActionType = 'none' | 'monitor' | 'schedule_maintenance' | 'emergency_stop' | 'optimize_load';

export interface SensorSnapshot {
  rpm: number;
  vibration: number;
  temperature: number;
  current: number;
  load: number;
  timestamp: string;
}

export interface DecisionEngineResult {
  timestamp: string;
  machineId: string;
  
  // Model Results
  anomalyDetection: AnomalyResult;
  statePrediction: PredictionResult;
  loadForecast: ForecastResult;
  loadOptimization: OptimizationResult;
  
  // Overall Assessment
  healthScore: number; // 0-100
  alertLevel: AlertLevel;
  primaryIssue: string | null;
  
  // Recommended Actions
  recommendedAction: ActionType;
  actionPriority: number; // 1-5, 5 = urgent
  actionReason: string;
  actionDetails: string[];
  
  // Predictions
  estimatedTimeToFailure: number | null; // hours, null if healthy
  maintenanceConfidence: number; // 0-1
  
  // Metrics
  riskScore: number; // 0-100
  performanceScore: number; // 0-100
  efficiencyScore: number; // 0-100
}

export interface LoadHistory {
  values: number[];
  sequenceLength: number;
}

export class DecisionEngine {
  private static readonly ANOMALY_THRESHOLD = 0.0814;
  private static readonly HIGH_VIBRATION_THRESHOLD = 1.0;
  private static readonly HIGH_TEMP_THRESHOLD = 75;
  private static readonly CRITICAL_TEMP_THRESHOLD = 85;
  
  /**
   * Run complete ML analysis pipeline on machine sensor data
   */
  static async analyze(
    machineId: string,
    currentSensor: SensorSnapshot,
    loadHistory: LoadHistory,
    targetLoad: number
  ): Promise<DecisionEngineResult> {
    
    // Run all 4 ONNX models in parallel
    const [anomalyResult, predictionResult, forecastResult, optimizationResult] = await Promise.all([
      detectAnomaly({
        vibration: currentSensor.vibration,
        current: currentSensor.current,
        temperature: currentSensor.temperature
      }),
      predictNextState([{
        rpm: currentSensor.rpm,
        vibration: currentSensor.vibration,
        temperature: currentSensor.temperature,
        current: currentSensor.current,
        load_percent: currentSensor.load
      }]),
      forecastLoad(loadHistory.values),
      optimizeLoad({
        vibration: currentSensor.vibration,
        temperature: currentSensor.temperature,
        load_percent: currentSensor.load
      })
    ]);

    // Calculate health score
    const healthScore = this.calculateHealthScore(
      currentSensor,
      anomalyResult,
      predictionResult
    );

    // Determine alert level
    const alertLevel = this.determineAlertLevel(
      currentSensor,
      anomalyResult,
      healthScore
    );

    // Identify primary issue
    const primaryIssue = this.identifyPrimaryIssue(
      currentSensor,
      anomalyResult,
      predictionResult
    );

    // Calculate risk score
    const riskScore = this.calculateRiskScore(
      anomalyResult,
      currentSensor,
      predictionResult
    );

    // Calculate performance score
    const performanceScore = this.calculatePerformanceScore(
      currentSensor,
      predictionResult,
      targetLoad
    );

    // Calculate efficiency score
    const efficiencyScore = this.calculateEfficiencyScore(
      currentSensor,
      optimizationResult
    );

    // Determine recommended action
    const { action, priority, reason, details } = this.determineAction(
      alertLevel,
      anomalyResult,
      currentSensor,
      optimizationResult,
      riskScore
    );

    // Estimate time to failure
    const { timeToFailure, confidence } = this.estimateTimeToFailure(
      anomalyResult,
      currentSensor,
      predictionResult
    );

    return {
      timestamp: new Date().toISOString(),
      machineId,
      
      anomalyDetection: anomalyResult,
      statePrediction: predictionResult,
      loadForecast: forecastResult,
      loadOptimization: optimizationResult,
      
      healthScore,
      alertLevel,
      primaryIssue,
      
      recommendedAction: action,
      actionPriority: priority,
      actionReason: reason,
      actionDetails: details,
      
      estimatedTimeToFailure: timeToFailure,
      maintenanceConfidence: confidence,
      
      riskScore,
      performanceScore,
      efficiencyScore
    };
  }

  /**
   * Calculate overall machine health score (0-100)
   */
  private static calculateHealthScore(
    sensor: SensorSnapshot,
    anomaly: AnomalyResult,
    prediction: PredictionResult
  ): number {
    let score = 100;

    // Anomaly penalty
    if (anomaly.isAnomaly) {
      const anomalyRatio = anomaly.reconstructionError / this.ANOMALY_THRESHOLD;
      score -= Math.min(anomalyRatio * 30, 40);
    }

    // Vibration penalty
    if (sensor.vibration > this.HIGH_VIBRATION_THRESHOLD) {
      score -= (sensor.vibration - this.HIGH_VIBRATION_THRESHOLD) * 20;
    }

    // Temperature penalty
    if (sensor.temperature > this.HIGH_TEMP_THRESHOLD) {
      const tempExcess = sensor.temperature - this.HIGH_TEMP_THRESHOLD;
      score -= tempExcess * 2;
    }

    // Predict worsening condition
    if (prediction.vibration > sensor.vibration * 1.1) {
      score -= 10; // Vibration trending up
    }

    if (prediction.temperature > sensor.temperature * 1.05) {
      score -= 5; // Temperature trending up
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Determine alert level based on sensor data and ML results
   */
  private static determineAlertLevel(
    sensor: SensorSnapshot,
    anomaly: AnomalyResult,
    healthScore: number
  ): AlertLevel {
    // Critical conditions
    if (
      anomaly.isAnomaly && anomaly.reconstructionError > this.ANOMALY_THRESHOLD * 2 ||
      sensor.vibration > this.HIGH_VIBRATION_THRESHOLD * 1.5 ||
      sensor.temperature > this.CRITICAL_TEMP_THRESHOLD ||
      healthScore < 50
    ) {
      return 'critical';
    }

    // Warning conditions
    if (
      anomaly.isAnomaly ||
      sensor.vibration > this.HIGH_VIBRATION_THRESHOLD ||
      sensor.temperature > this.HIGH_TEMP_THRESHOLD ||
      healthScore < 75
    ) {
      return 'warning';
    }

    return 'normal';
  }

  /**
   * Identify the primary issue affecting the machine
   */
  private static identifyPrimaryIssue(
    sensor: SensorSnapshot,
    anomaly: AnomalyResult,
    prediction: PredictionResult
  ): string | null {
    const issues: { priority: number; message: string }[] = [];

    if (anomaly.isAnomaly) {
      const severity = anomaly.reconstructionError / this.ANOMALY_THRESHOLD;
      issues.push({
        priority: severity * 10,
        message: `Anomaly detected (error: ${anomaly.reconstructionError.toFixed(4)})`
      });
    }

    if (sensor.vibration > this.HIGH_VIBRATION_THRESHOLD * 1.5) {
      issues.push({
        priority: 9,
        message: `Critical vibration (${sensor.vibration.toFixed(3)} mm/s)`
      });
    } else if (sensor.vibration > this.HIGH_VIBRATION_THRESHOLD) {
      issues.push({
        priority: 7,
        message: `High vibration (${sensor.vibration.toFixed(3)} mm/s)`
      });
    }

    if (sensor.temperature > this.CRITICAL_TEMP_THRESHOLD) {
      issues.push({
        priority: 9,
        message: `Critical temperature (${sensor.temperature.toFixed(1)}°C)`
      });
    } else if (sensor.temperature > this.HIGH_TEMP_THRESHOLD) {
      issues.push({
        priority: 6,
        message: `High temperature (${sensor.temperature.toFixed(1)}°C)`
      });
    }

    if (prediction.vibration > sensor.vibration * 1.2) {
      issues.push({
        priority: 5,
        message: 'Vibration trending upward - possible bearing wear'
      });
    }

    if (issues.length === 0) return null;

    // Return highest priority issue
    issues.sort((a, b) => b.priority - a.priority);
    return issues[0].message;
  }

  /**
   * Calculate risk score (0-100, higher = more risk)
   */
  private static calculateRiskScore(
    anomaly: AnomalyResult,
    sensor: SensorSnapshot,
    prediction: PredictionResult
  ): number {
    let risk = 0;

    // Anomaly risk
    if (anomaly.isAnomaly) {
      risk += (anomaly.reconstructionError / this.ANOMALY_THRESHOLD) * 40;
    }

    // Vibration risk
    const vibrationRisk = Math.min((sensor.vibration / 2.0) * 30, 30);
    risk += vibrationRisk;

    // Temperature risk
    const tempRisk = Math.max(0, (sensor.temperature - 60) / 40 * 20);
    risk += tempRisk;

    // Trending risk (if conditions worsening)
    if (prediction.vibration > sensor.vibration * 1.1) {
      risk += 10;
    }

    return Math.min(100, Math.round(risk));
  }

  /**
   * Calculate performance score (0-100)
   */
  private static calculatePerformanceScore(
    sensor: SensorSnapshot,
    prediction: PredictionResult,
    targetLoad: number
  ): number {
    let score = 100;

    // Load efficiency
    const loadEfficiency = Math.abs(sensor.load - targetLoad) / targetLoad;
    score -= loadEfficiency * 30;

    // Stability penalty (predicted instability)
    // RPM prediction not available in current model
    /*
    const rpmDeviation = Math.abs(prediction.predictedState.rpm - sensor.rpm);
    if (rpmDeviation > sensor.rpm * 0.1) {
      score -= 15;
    }
    */

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Calculate efficiency score (0-100)
   */
  private static calculateEfficiencyScore(
    sensor: SensorSnapshot,
    optimization: OptimizationResult
  ): number {
    let score = 100;

    // Check if optimization suggests improvement
    if (optimization.action === 'decrease_load') {
      score -= 15; // Running above optimal
    } else if (optimization.action === 'increase_load') {
      score -= 10; // Running below optimal
    }

    // Current efficiency (lower current for same load = better)
    const expectedCurrent = sensor.load * 0.3; // Rough approximation
    if (sensor.current > expectedCurrent * 1.2) {
      score -= 20; // Inefficient power consumption
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Determine recommended action and priority
   */
  private static determineAction(
    alertLevel: AlertLevel,
    anomaly: AnomalyResult,
    sensor: SensorSnapshot,
    optimization: OptimizationResult,
    riskScore: number
  ): { action: ActionType; priority: number; reason: string; details: string[] } {
    
    const details: string[] = [];

    // Critical - Emergency Stop
    if (
      alertLevel === 'critical' &&
      (sensor.vibration > this.HIGH_VIBRATION_THRESHOLD * 2 ||
       sensor.temperature > this.CRITICAL_TEMP_THRESHOLD + 5)
    ) {
      return {
        action: 'emergency_stop',
        priority: 5,
        reason: 'Critical safety threshold exceeded',
        details: [
          'Immediate shutdown required',
          'Contact maintenance team',
          'Inspect for mechanical damage',
          'Do not restart until cleared'
        ]
      };
    }

    // Critical - Schedule Maintenance
    if (alertLevel === 'critical' || riskScore > 80) {
      details.push('Schedule immediate maintenance inspection');
      
      if (anomaly.isAnomaly) {
        details.push('Anomaly detected - check bearings and alignment');
      }
      if (sensor.vibration > this.HIGH_VIBRATION_THRESHOLD) {
        details.push(`High vibration (${sensor.vibration.toFixed(3)}) - inspect mechanical components`);
      }
      if (sensor.temperature > this.HIGH_TEMP_THRESHOLD) {
        details.push(`High temperature (${sensor.temperature.toFixed(1)}°C) - check cooling system`);
      }

      return {
        action: 'schedule_maintenance',
        priority: 4,
        reason: 'Multiple fault indicators detected',
        details
      };
    }

    // Warning - Monitor Closely
    if (alertLevel === 'warning' || riskScore > 50) {
      details.push('Increase monitoring frequency');
      details.push('Review maintenance schedule');
      
      if (anomaly.isAnomaly) {
        details.push('Anomaly detected - trend analysis recommended');
      }

      return {
        action: 'monitor',
        priority: 3,
        reason: 'Early warning indicators present',
        details
      };
    }

    // Normal - Optimize Load
    if (optimization.action !== 'hold_load' && optimization.confidence > 0.7) {
      details.push(`${optimization.action === 'increase_load' ? 'Increase' : 'Decrease'} load for optimal efficiency`);
      details.push(`Current load: ${sensor.load.toFixed(1)} kW`);
      details.push(`Confidence: ${(optimization.confidence * 100).toFixed(1)}%`);

      return {
        action: 'optimize_load',
        priority: 2,
        reason: 'Load optimization opportunity detected',
        details
      };
    }

    // Normal - No Action
    return {
      action: 'none',
      priority: 1,
      reason: 'All systems operating normally',
      details: ['Continue normal operations', 'Maintain regular monitoring schedule']
    };
  }

  /**
   * Estimate time to failure based on current trends
   */
  private static estimateTimeToFailure(
    anomaly: AnomalyResult,
    sensor: SensorSnapshot,
    prediction: PredictionResult
  ): { timeToFailure: number | null; confidence: number } {
    
    if (!anomaly.isAnomaly && sensor.vibration < this.HIGH_VIBRATION_THRESHOLD) {
      return { timeToFailure: null, confidence: 0 };
    }

    // Simple linear extrapolation based on vibration trend
    const vibrationIncrease = prediction.vibration - sensor.vibration;
    
    if (vibrationIncrease <= 0) {
      // Stable or improving
      return { timeToFailure: null, confidence: 0.3 };
    }

    // Estimate cycles until critical vibration (2.0 mm/s)
    const criticalVibration = 2.0;
    const vibrationMargin = criticalVibration - sensor.vibration;
    const cyclesUntilFailure = vibrationMargin / vibrationIncrease;

    // Assuming 1 cycle per second, convert to hours
    const hoursUntilFailure = cyclesUntilFailure / 3600;

    // Confidence based on anomaly severity and trend consistency
    let confidence = 0.5;
    if (anomaly.isAnomaly) confidence += 0.2;
    if (vibrationIncrease > 0.01) confidence += 0.2;
    confidence = Math.min(0.95, confidence);

    return {
      timeToFailure: Math.max(0, hoursUntilFailure),
      confidence
    };
  }

  /**
   * Quick health check without full analysis
   */
  static quickCheck(sensor: SensorSnapshot): {
    isHealthy: boolean;
    criticalIssues: string[];
  } {
    const issues: string[] = [];

    if (sensor.vibration > this.HIGH_VIBRATION_THRESHOLD * 1.5) {
      issues.push('CRITICAL: Excessive vibration');
    }

    if (sensor.temperature > this.CRITICAL_TEMP_THRESHOLD) {
      issues.push('CRITICAL: Temperature too high');
    }

    return {
      isHealthy: issues.length === 0,
      criticalIssues: issues
    };
  }

  /**
   * Generate maintenance report
   */
  static generateReport(result: DecisionEngineResult): string {
    const lines: string[] = [];
    
    lines.push('═══════════════════════════════════════════════');
    lines.push('     MACHINE HEALTH & MAINTENANCE REPORT      ');
    lines.push('═══════════════════════════════════════════════');
    lines.push('');
    lines.push(`Machine ID: ${result.machineId}`);
    lines.push(`Timestamp: ${new Date(result.timestamp).toLocaleString()}`);
    lines.push(`Alert Level: ${result.alertLevel.toUpperCase()}`);
    lines.push('');
    
    lines.push('─── HEALTH METRICS ───');
    lines.push(`Overall Health: ${result.healthScore}/100`);
    lines.push(`Risk Score: ${result.riskScore}/100`);
    lines.push(`Performance: ${result.performanceScore}/100`);
    lines.push(`Efficiency: ${result.efficiencyScore}/100`);
    lines.push('');
    
    if (result.primaryIssue) {
      lines.push('─── PRIMARY ISSUE ───');
      lines.push(`⚠ ${result.primaryIssue}`);
      lines.push('');
    }
    
    lines.push('─── ML ANALYSIS RESULTS ───');
    lines.push(`Anomaly: ${result.anomalyDetection.isAnomaly ? 'DETECTED' : 'None'}`);
    lines.push(`  Error: ${result.anomalyDetection.reconstructionError.toFixed(4)}`);
    lines.push(`  Threshold: ${this.ANOMALY_THRESHOLD}`);
    lines.push('');
    
    lines.push(`Load Forecast: ${result.loadForecast.predictedLoad.toFixed(2)} kW`);
    lines.push(`Optimization: ${result.loadOptimization.action.toUpperCase()}`);
    lines.push(`  Confidence: ${(result.loadOptimization.confidence * 100).toFixed(1)}%`);
    lines.push('');
    
    if (result.estimatedTimeToFailure !== null) {
      lines.push('─── PREDICTIVE MAINTENANCE ───');
      lines.push(`Estimated Time to Failure: ${result.estimatedTimeToFailure.toFixed(1)} hours`);
      lines.push(`Confidence: ${(result.maintenanceConfidence * 100).toFixed(1)}%`);
      lines.push('');
    }
    
    lines.push('─── RECOMMENDED ACTION ───');
    lines.push(`Action: ${result.recommendedAction.toUpperCase().replace(/_/g, ' ')}`);
    lines.push(`Priority: ${'★'.repeat(result.actionPriority)}${'☆'.repeat(5 - result.actionPriority)}`);
    lines.push(`Reason: ${result.actionReason}`);
    lines.push('');
    lines.push('Details:');
    result.actionDetails.forEach(detail => {
      lines.push(`  • ${detail}`);
    });
    
    lines.push('');
    lines.push('═══════════════════════════════════════════════');
    
    return lines.join('\n');
  }
}
