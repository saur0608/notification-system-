'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Machine, ApiResponse } from '@/lib/types';
import { DecisionEngineResult } from '@/lib/decision-engine';
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  Brain,
  CheckCircle,
  Download,
  RefreshCw,
  TrendingUp,
  Zap
} from 'lucide-react';

export default function AnalyticsPage() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [analysis, setAnalysis] = useState<DecisionEngineResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMachines();
  }, []);

  const fetchMachines = async () => {
    try {
      const response = await fetch('/api/machines');
      const data: ApiResponse<Machine[]> = await response.json();
      if (data.success && data.data) {
        setMachines(data.data);
        if (data.data.length > 0 && !selectedMachine) {
          setSelectedMachine(data.data[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch machines:', error);
    }
  };

  const runAnalysis = async () => {
    if (!selectedMachine) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/analysis/${selectedMachine.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      const data: ApiResponse<DecisionEngineResult> = await response.json();
      if (data.success && data.data) {
        setAnalysis(data.data);
      }
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async () => {
    if (!selectedMachine) return;

    try {
      const response = await fetch(`/api/analysis/${selectedMachine.id}/report`);
      const report = await response.text();
      
      const blob = new Blob([report], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `machine-${selectedMachine.id}-report.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const getAlertColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-green-100 text-green-800 border-green-300';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'emergency_stop': return 'text-red-600 bg-red-50';
      case 'schedule_maintenance': return 'text-orange-600 bg-orange-50';
      case 'monitor': return 'text-yellow-600 bg-yellow-50';
      case 'optimize_load': return 'text-blue-600 bg-blue-50';
      default: return 'text-green-600 bg-green-50';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="p-2 hover:bg-white rounded-lg transition-colors">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </Link>
          <div className="flex-1">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ML Analytics Dashboard
            </h1>
            <p className="text-gray-600 mt-1">Comprehensive machine health analysis powered by AI</p>
          </div>
          {analysis && (
            <button
              onClick={downloadReport}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:shadow-lg transition-all"
            >
              <Download className="w-5 h-5" />
              Download Report
            </button>
          )}
        </div>

        {/* Machine Selection & Run Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Machine</h3>
            <div className="grid grid-cols-2 gap-3">
              {machines.map(machine => (
                <button
                  key={machine.id}
                  onClick={() => setSelectedMachine(machine)}
                  className={`px-4 py-3 rounded-lg text-left transition-all ${
                    selectedMachine?.id === machine.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <p className="font-medium">{machine.name}</p>
                  <p className="text-sm opacity-80">Health: {machine.health}%</p>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 flex flex-col justify-center">
            <button
              onClick={runAnalysis}
              disabled={!selectedMachine || loading}
              className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="w-5 h-5" />
                  Run Complete Analysis
                </>
              )}
            </button>
            <p className="text-sm text-gray-500 text-center mt-3">
              Runs all 4 ML models + decision engine
            </p>
          </div>
        </div>

        {/* Analysis Results */}
        {analysis ? (
          <>
            {/* Overall Status */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Health Score</span>
                  <Activity className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-4xl font-bold text-blue-600">{analysis.healthScore}</p>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      analysis.healthScore >= 80 ? 'bg-green-500' :
                      analysis.healthScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${analysis.healthScore}%` }}
                  />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Risk Score</span>
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <p className="text-4xl font-bold text-red-600">{analysis.riskScore}</p>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full"
                    style={{ width: `${analysis.riskScore}%` }}
                  />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Performance</span>
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-4xl font-bold text-green-600">{analysis.performanceScore}</p>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${analysis.performanceScore}%` }}
                  />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Efficiency</span>
                  <Zap className="w-5 h-5 text-yellow-600" />
                </div>
                <p className="text-4xl font-bold text-yellow-600">{analysis.efficiencyScore}</p>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{ width: `${analysis.efficiencyScore}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Alert & Primary Issue */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className={`rounded-xl shadow-md p-6 border-2 ${getAlertColor(analysis.alertLevel)}`}>
                <div className="flex items-center gap-3 mb-3">
                  {analysis.alertLevel === 'critical' && <AlertTriangle className="w-8 h-8" />}
                  {analysis.alertLevel === 'warning' && <AlertTriangle className="w-8 h-8" />}
                  {analysis.alertLevel === 'normal' && <CheckCircle className="w-8 h-8" />}
                  <h3 className="text-xl font-bold capitalize">{analysis.alertLevel} Status</h3>
                </div>
                {analysis.primaryIssue && (
                  <p className="text-sm">{analysis.primaryIssue}</p>
                )}
              </div>

              {analysis.estimatedTimeToFailure !== null && (
                <div className="bg-white rounded-xl shadow-md p-6 border-2 border-orange-300">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Predictive Maintenance</h3>
                  <p className="text-3xl font-bold text-orange-600 mb-2">
                    {analysis.estimatedTimeToFailure.toFixed(1)} hours
                  </p>
                  <p className="text-sm text-gray-600">
                    Estimated time to failure
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Confidence: {(analysis.maintenanceConfidence * 100).toFixed(1)}%
                  </p>
                </div>
              )}
            </div>

            {/* Recommended Action */}
            <div className={`rounded-xl shadow-md p-6 mb-8 ${getActionColor(analysis.recommendedAction)}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Recommended Action</h3>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`text-2xl ${i < analysis.actionPriority ? '' : 'opacity-30'}`}>
                      ★
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-2xl font-bold uppercase mb-2">
                {analysis.recommendedAction.replace(/_/g, ' ')}
              </p>
              <p className="text-sm mb-4">{analysis.actionReason}</p>
              <div className="space-y-2">
                {analysis.actionDetails.map((detail, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-lg">•</span>
                    <span className="text-sm">{detail}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ML Model Results */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Anomaly Detection */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  Anomaly Detection
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-bold ${analysis.anomalyDetection.isAnomaly ? 'text-red-600' : 'text-green-600'}`}>
                      {analysis.anomalyDetection.isAnomaly ? 'ANOMALY' : 'NORMAL'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Error:</span>
                    <span className="font-semibold">{analysis.anomalyDetection.reconstructionError.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Threshold:</span>
                    <span className="font-semibold">0.0814</span>
                  </div>
                </div>
              </div>

              {/* Load Forecast */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Load Forecast
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Predicted Load:</span>
                    <span className="font-bold text-blue-600 text-xl">
                      {analysis.loadForecast.predictedLoad.toFixed(2)} kW
                    </span>
                  </div>
                </div>
              </div>

              {/* State Prediction */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-600" />
                  Next State Prediction
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vibration:</span>
                    <span className="font-semibold">{analysis.statePrediction.vibration.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Temperature:</span>
                    <span className="font-semibold">{analysis.statePrediction.temperature.toFixed(1)}°C</span>
                  </div>

                </div>
              </div>

              {/* Load Optimization */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-600" />
                  Load Optimization
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Action:</span>
                    <span className="font-bold text-yellow-600 uppercase text-xl">
                      {analysis.loadOptimization.action}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Confidence:</span>
                    <span className="font-semibold">
                      {(analysis.loadOptimization.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Analysis Yet</h3>
            <p className="text-gray-500">
              Select a machine and click "Run Complete Analysis" to see AI-powered insights
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
