'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Machine, ApiResponse, SensorReading } from '@/lib/types';
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Brain,
  ChevronDown,
  ChevronUp,
  Gauge,
  Settings,
  TrendingUp,
  Zap
} from 'lucide-react';

export default function MachineDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [machine, setMachine] = useState<Machine | null>(null);
  const [loading, setLoading] = useState(true);
  const [runningInference, setRunningInference] = useState(false);
  const [showSpecs, setShowSpecs] = useState(false);

  useEffect(() => {
    if (params?.id) {
      fetchMachine();
    }
  }, [params?.id]);

  const fetchMachine = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/machines/${params?.id}`);
      const data: ApiResponse<Machine> = await response.json();

      if (data.success && data.data) {
        setMachine(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch machine:', error);
    } finally {
      setLoading(false);
    }
  };

  const runMLInference = async () => {
    if (!machine?.sensorData) return;

    try {
      setRunningInference(true);

      // Run all ML models
      const [anomalyRes, predictRes, optimizeRes] = await Promise.all([
        fetch('/api/inference/anomaly', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            vibration: machine.sensorData.vibration,
            current: machine.sensorData.current,
            temperature: machine.sensorData.temperature
          })
        }),
        fetch('/api/inference/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rpm: machine.sensorData.rpm,
            vibration: machine.sensorData.vibration,
            temperature: machine.sensorData.temperature,
            current: machine.sensorData.current
          })
        }),
        fetch('/api/inference/optimize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            currentLoad: machine.sensorData.load,
            targetLoad: machine.specifications.maxLoad * 0.8
          })
        })
      ]);

      const anomalyData: ApiResponse<any> = await anomalyRes.json();
      const predictData: ApiResponse<any> = await predictRes.json();
      const optimizeData: ApiResponse<any> = await optimizeRes.json();

      if (anomalyData.success && predictData.success && optimizeData.success) {
        setMachine(prev => prev ? {
          ...prev,
          predictions: {
            anomalyScore: anomalyData.data.reconstructionError,
            isAnomaly: anomalyData.data.isAnomaly,
            nextState: predictData.data.predictedState,
            loadForecast: [],
            recommendedAction: optimizeData.data.action,
            confidence: optimizeData.data.confidence
          }
        } : null);
      }
    } catch (error) {
      console.error('ML inference failed:', error);
    } finally {
      setRunningInference(false);
    }
  };

  const updateMachineStatus = async (status: Machine['status']) => {
    try {
      const response = await fetch(`/api/machines/${params?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      const data: ApiResponse<Machine> = await response.json();
      if (data.success && data.data) {
        setMachine(data.data);
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading machine...</p>
        </div>
      </div>
    );
  }

  if (!machine) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Machine Not Found</h2>
          <Link href="/machines" className="text-blue-600 hover:underline">
            Back to Machines
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/machines"
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </Link>
          <div className="flex-1">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {machine.name}
            </h1>
            <p className="text-gray-600 mt-1">{machine.type} • {machine.location}</p>
          </div>
          <button
            onClick={runMLInference}
            disabled={runningInference}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
          >
            <Brain className="w-5 h-5" />
            {runningInference ? 'Running AI...' : 'Run ML Analysis'}
          </button>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Status & Controls */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Status Control</h3>
              <div className="space-y-3">
                {(['running', 'idle', 'maintenance', 'fault'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => updateMachineStatus(status)}
                    className={`w-full px-4 py-3 rounded-lg font-medium transition-all ${
                      machine.status === status
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Health Metrics */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Health Metrics</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Health</span>
                    <span className="text-sm font-bold text-gray-800">{machine.health}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        machine.health >= 80 ? 'bg-green-500' : machine.health >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${machine.health}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Efficiency</span>
                    <span className="text-sm font-bold text-gray-800">{machine.efficiency}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${machine.efficiency}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Specifications */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <button
                onClick={() => setShowSpecs(!showSpecs)}
                className="flex items-center justify-between w-full"
              >
                <h3 className="text-lg font-semibold text-gray-800">Specifications</h3>
                {showSpecs ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              {showSpecs && (
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Max RPM:</span>
                    <span className="font-semibold">{machine.specifications.maxRPM}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Max Load:</span>
                    <span className="font-semibold">{machine.specifications.maxLoad} kW</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Max Temp:</span>
                    <span className="font-semibold">{machine.specifications.maxTemp}°C</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Power Rating:</span>
                    <span className="font-semibold">{machine.specifications.powerRating} kW</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Middle Column - Sensor Data */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                Live Sensor Data
              </h3>
              {machine.sensorData ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Gauge className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-600">RPM</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">{machine.sensorData.rpm}</p>
                  </div>
                  <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-red-600" />
                      <span className="text-sm text-gray-600">Temperature</span>
                    </div>
                    <p className="text-2xl font-bold text-red-600">{machine.sensorData.temperature}°C</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-4 h-4 text-purple-600" />
                      <span className="text-sm text-gray-600">Vibration</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-600">{machine.sensorData.vibration.toFixed(3)}</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-600">Current</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600">{machine.sensorData.current.toFixed(1)} A</p>
                  </div>
                  <div className="col-span-2 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm text-gray-600">Load</span>
                    </div>
                    <p className="text-2xl font-bold text-yellow-600">{machine.sensorData.load} kW</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No sensor data available</p>
              )}
            </div>
          </div>

          {/* Right Column - ML Predictions */}
          <div className="space-y-6">
            {machine.predictions ? (
              <>
                {/* Anomaly Detection */}
                <div className={`rounded-xl shadow-md p-6 ${
                  machine.predictions.isAnomaly
                    ? 'bg-gradient-to-br from-red-500 to-red-600 text-white'
                    : 'bg-gradient-to-br from-green-500 to-green-600 text-white'
                }`}>
                  <div className="flex items-center gap-3 mb-4">
                    {machine.predictions.isAnomaly ? (
                      <AlertTriangle className="w-8 h-8" />
                    ) : (
                      <Activity className="w-8 h-8" />
                    )}
                    <h3 className="text-xl font-bold">
                      {machine.predictions.isAnomaly ? 'Anomaly Detected' : 'Normal Operation'}
                    </h3>
                  </div>
                  <p className="text-sm opacity-90">
                    Anomaly Score: {machine.predictions.anomalyScore.toFixed(4)}
                  </p>
                </div>

                {/* Next State Prediction */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-600" />
                    Predicted Next State
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">RPM:</span>
                      <span className="font-semibold">{machine.predictions.nextState.rpm.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Vibration:</span>
                      <span className="font-semibold">{machine.predictions.nextState.vibration.toFixed(3)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Temperature:</span>
                      <span className="font-semibold">{machine.predictions.nextState.temperature.toFixed(1)}°C</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Current:</span>
                      <span className="font-semibold">{machine.predictions.nextState.current.toFixed(1)} A</span>
                    </div>
                  </div>
                </div>

                {/* Optimization Recommendation */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-blue-600" />
                    Optimization
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Recommended Action:</p>
                      <p className="text-xl font-bold text-blue-600 uppercase">
                        {machine.predictions.recommendedAction}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Confidence:</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${machine.predictions.confidence * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold">
                          {(machine.predictions.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-xl shadow-md p-6 text-center">
                <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No ML Predictions</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Click "Run ML Analysis" to get AI-powered insights
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
