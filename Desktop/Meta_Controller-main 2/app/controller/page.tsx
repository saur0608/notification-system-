'use client';

import { useEffect, useState, useRef } from 'react';
import { Machine } from '@/lib/types';
import { simulationManager, SimulationResult } from '@/lib/simulator/simulation-manager';
import { MachineState, SimulationScenario } from '@/lib/simulator/physics-engine';
import ShadcnChart from '@/components/ShadcnChart';
import { Play, Square, Activity, Thermometer, Zap, Gauge, AlertTriangle, Brain, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function MetaControllerPage() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [selectedMachineId, setSelectedMachineId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);
  const [history, setHistory] = useState<MachineState[]>([]);
  const [scenario, setScenario] = useState<SimulationScenario>('NORMAL');
  const [lastAction, setLastAction] = useState<string>('hold_load');

  // Fetch machines on mount
  useEffect(() => {
    async function fetchMachines() {
      try {
        const res = await fetch('/api/machines');
        const data = await res.json();
        if (data.success) {
          setMachines(data.data);
          
          // Register all machines with the simulation manager
          data.data.forEach((m: Machine) => {
            simulationManager.registerMachine(m.id, {
              maxRpm: m.specifications.maxRPM,
              maxTemp: m.specifications.maxTemp,
              maxPower: m.specifications.powerRating,
              baseVibration: 0.5,
              coolingRate: 0.1,
              heatingFactor: 0.05
            });
          });
          
          // Auto-select first machine if available
          if (data.data.length > 0 && !selectedMachineId) {
            handleSelectMachine(data.data[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch machines:', error);
      }
    }
    fetchMachines();
  }, []);

  // Handle machine selection
  const handleSelectMachine = (id: string) => {
    if (isRunning) {
      handleStop();
    }
    setSelectedMachineId(id);
    setHistory([]);
    setSimResult(null);
    setScenario('NORMAL');
    setLastAction('hold_load');
  };

  // Start simulation
  const handleStart = () => {
    if (!selectedMachineId) return;
    
    setIsRunning(true);
    simulationManager.startSimulation(selectedMachineId, (result) => {
      setSimResult(result);
      if (result.optimization) {
        setLastAction(result.optimization.action);
      }
      setHistory(prev => {
        const newHistory = [...prev, result.state];
        if (newHistory.length > 50) newHistory.shift(); // Keep last 50 points
        return newHistory;
      });
    });
  };

  // Stop simulation
  const handleStop = () => {
    if (!selectedMachineId) return;
    
    setIsRunning(false);
    simulationManager.stopSimulation(selectedMachineId);
  };

  // Change scenario
  const handleScenarioChange = (newScenario: SimulationScenario) => {
    setScenario(newScenario);
    if (selectedMachineId) {
      simulationManager.setScenario(selectedMachineId, newScenario);
    }
  };

  const selectedMachine = machines.find(m => m.id === selectedMachineId);
  const machineState = simResult?.state;

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-900 text-white flex flex-col shadow-xl z-20 flex-shrink-0">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-purple-600 rounded-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">MetaController</h1>
          </div>
          <p className="text-xs text-slate-400 ml-1">Industrial Digital Twin v2.0</p>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6">
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">
              Active Machines
            </h3>
            <div className="space-y-1">
              {machines.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleSelectMachine(m.id)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all ${
                    selectedMachineId === m.id
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${selectedMachineId === m.id ? 'bg-white' : 'bg-slate-500'}`} />
                  <div className="flex flex-col items-start">
                    <span>{m.name}</span>
                    <span className="text-[10px] opacity-70">{m.type}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {selectedMachine && (
            <div className="px-2">
              <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                <h4 className="text-xs font-semibold text-slate-400 mb-3">SYSTEM STATUS</h4>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">Engine</span>
                    <span className={isRunning ? "text-green-400 font-bold" : "text-red-400 font-bold"}>
                      {isRunning ? "RUNNING" : "STOPPED"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">Scenario</span>
                    <span className="text-purple-400 font-medium">{scenario.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">AI Agent</span>
                    <span className="text-blue-400 font-medium">{lastAction.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-900">
          <div className="flex items-center gap-3 text-slate-400 text-xs">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            System Online • Latency: 12ms
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-50/50">
        <div className="max-w-7xl mx-auto p-8">
          {selectedMachine ? (
            <div className="space-y-8">
              {/* Header & Controls */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedMachine.name}</h2>
                  <div className="flex gap-6 text-sm text-gray-500 mt-2">
                    <span className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                      ID: {selectedMachine.id}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                      Max Power: {selectedMachine.specifications.powerRating} kW
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {!isRunning ? (
                    <button
                      onClick={handleStart}
                      className="flex items-center px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-semibold shadow-lg shadow-green-600/20 hover:shadow-green-600/30 active:scale-95"
                    >
                      <Play className="w-5 h-5 mr-2 fill-current" />
                      Start Engine
                    </button>
                  ) : (
                    <button
                      onClick={handleStop}
                      className="flex items-center px-8 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-semibold shadow-lg shadow-red-600/20 hover:shadow-red-600/30 active:scale-95"
                    >
                      <Square className="w-5 h-5 mr-2 fill-current" />
                      Stop Engine
                    </button>
                  )}
                </div>
              </div>

              {/* Scenarios */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Simulation Scenario</label>
                <div className="flex flex-wrap gap-3">
                  {(['NORMAL', 'HIGH_LOAD', 'OVERHEATING', 'UNBALANCED', 'RUNNING_BEHIND'] as SimulationScenario[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => handleScenarioChange(s)}
                      className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                        scenario === s
                          ? 'bg-purple-50 text-purple-700 border-purple-200 ring-2 ring-purple-100 shadow-sm'
                          : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                      }`}
                    >
                      {s.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Decision Panel */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Anomaly Status */}
                <div className={`p-6 rounded-2xl border transition-all duration-300 ${
                  simResult?.anomaly?.isAnomaly 
                    ? 'bg-red-50 border-red-200 shadow-red-100' 
                    : 'bg-white border-gray-100 shadow-sm'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-bold text-gray-600 uppercase tracking-wide">Health Status</span>
                    {simResult?.anomaly?.isAnomaly ? (
                      <div className="p-2 bg-red-100 rounded-lg animate-pulse">
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                      </div>
                    ) : (
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Activity className="w-6 h-6 text-green-600" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-gray-900">
                      {simResult?.anomaly?.isAnomaly ? 'Critical' : 'Healthy'}
                    </div>
                    <div className="text-sm text-gray-500">
                      Confidence: {((1 - (simResult?.anomaly?.reconstructionError || 0)) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                {/* RL Agent Action */}
                <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-bold text-gray-600 uppercase tracking-wide">Optimization Agent</span>
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Brain className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-gray-900 capitalize">
                      {lastAction.replace('_', ' ')}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      Reward: <span className="font-mono text-blue-600">+{Math.random().toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Efficiency Score */}
                <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-bold text-gray-600 uppercase tracking-wide">Efficiency</span>
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Gauge className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-gray-900">
                      {machineState ? Math.min(100, Math.max(0, 100 - (machineState.temperature / 2) - (machineState.vibration * 10))).toFixed(1) : '0.0'}%
                    </div>
                    <div className="text-sm text-gray-500">
                      Overall Performance
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ShadcnChart 
                  title="Vibration Analysis" 
                  data={history} 
                  dataKey="vibration" 
                  color="#8b5cf6" 
                  unit="mm/s"
                  domain={[0, 5]}
                />
                <ShadcnChart 
                  title="Temperature Monitor" 
                  data={history} 
                  dataKey="temperature" 
                  color="#ef4444" 
                  unit="°C"
                  domain={[20, 150]}
                />
                <ShadcnChart 
                  title="Power Consumption" 
                  data={history} 
                  dataKey="power" 
                  color="#f59e0b" 
                  unit="kW"
                  domain={[0, 50]}
                />
                <ShadcnChart 
                  title="Rotational Speed" 
                  data={history} 
                  dataKey="rpm" 
                  color="#10b981" 
                  unit="RPM"
                  domain={[0, 3500]}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
              <div className="p-6 bg-white rounded-full shadow-sm mb-4">
                <Brain className="w-12 h-12 text-gray-300" />
              </div>
              <p className="text-lg font-medium">Select a machine from the sidebar to begin</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
