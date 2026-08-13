# Quick Start: ML-Integrated Control Room

## ✅ What's Been Integrated

### 1. **4 ONNX Models** (Already in `/public/models/`)
- `lstm_digital_twin.onnx` - Predicts vibration & temperature
- `dqn_agent.onnx` - RL agent for load optimization
- `autoencoder_anomaly.onnx` - Anomaly detection via reconstruction
- `gru_load_forecast.onnx` - Load demand forecasting

### 2. **ONNX Inference** (`lib/onnx-loader.ts`)
- Browser-based ML inference (no Python server needed!)
- Automatic model loading
- Helper function `getMLPredictions()` for easy use

### 3. **WebSocket Real-Time Updates** 
- Socket.IO server at `/api/socket`
- Client hook `useWebSocket()` 
- Live machine data streaming
- Alert broadcasting

### 4. **MongoDB Data Streaming**
- API at `/api/machines/stream`
- Save sensor data with predictions
- Fetch historical data

### 5. **Updated Control Room** (`app/simulator/control-room/page.tsx`)
- Real ONNX model predictions
- WebSocket connection status
- Model loading status
- AI recommendations based on predictions
- RL agent action display
- Anomaly score visualization

## 🚀 How to Use

### Step 1: Start the Development Server
```powershell
cd "c:\Users\shakti singh\Desktop\Industrial Machine Optimization Dataset\MetaController"
npm run dev
```

### Step 2: Navigate to Control Room
Open browser to: `http://localhost:3000/simulator/control-room`

### Step 3: Watch Models Load
- You'll see "Loading Models..." in the header
- Wait for "Models Ready" (green indicator)
- WebSocket will connect automatically

### Step 4: Start Simulation
1. Click **"Start Simulation"** button
2. All machines will begin simulating
3. ML predictions run every 2 seconds

### Step 5: Enable AI Auto-Optimization
- Check the **"AI Auto-Optimize"** checkbox
- RL agent will automatically adjust loads
- Based on anomaly scores and health metrics

### Step 6: View Predictions
**Grid View** (default):
- Shows all machines in cards
- Anomaly badges appear when detected
- Click any machine to select

**Detail View**:
- Click the maximize icon (📊) in top right
- Full-screen view of selected machine
- Shows:
  * AI Prediction status
  * Reconstruction error
  * Anomaly score with color coding
  * RL Agent recommended action
  * Q-values for all actions
  * AI recommendations list

## 📊 Understanding the UI

### Status Indicators (Top Right)
| Indicator | Meaning |
|-----------|---------|
| 🟢 Connected | WebSocket is active |
| 🔴 Offline | WebSocket disconnected |
| 🟢 Models Ready | All ONNX models loaded |
| 🟡 Loading... | Models are loading |

### Anomaly Colors
| Color | Score | Action |
|-------|-------|--------|
| 🟢 Green | 0-50% | Normal operation |
| 🟡 Yellow | 50-70% | Monitor closely |
| 🔴 Red | 70-100% | Immediate attention |

### RL Agent Actions
| Action | Meaning |
|--------|---------|
| `DECREASE_LOAD` | Reduce load to protect machine |
| `HOLD_LOAD` | Current load is optimal |
| `INCREASE_LOAD` | Safe to increase efficiency |

## 🔍 Viewing Real-Time Predictions

### In Grid View
Each machine card shows:
- RPM, Temperature, Vibration, Current
- Health and Efficiency bars
- Status badge (Running/Idle/Fault)
- Anomaly badge (if score > 50%)
- Auto mode indicator (🤖 AUTO / 👤 MANUAL)

### In Detail View
AI Prediction Panel shows:
1. **Status**: Normal / Moderate / High Anomaly
2. **Reconstruction Error**: From autoencoder
3. **Anomaly Score**: 0-100% with color bar
4. **RL Agent Action**: Current recommendation
5. **Q-Values**: Quality values for each action
6. **Recommendations**: List of AI-generated suggestions

## 🎮 Controls

### Per-Machine Controls
- **Start** (▶️): Start machine operation
- **Stop** (⏹️): Stop machine
- **Auto** (🤖): Toggle AI auto-control
- **RPM Slider**: Manual RPM adjustment
- **Load Slider**: Manual load adjustment

### Global Controls
- **AI Auto-Optimize**: Enable AI control for all machines in auto mode
- **Start/Stop Simulation**: Control simulation engine
- **View Modes**: Grid / List / Detail

## 📡 WebSocket Features

### Real-Time Updates
- Machine sensor data every 2 seconds
- Predictions updated with each reading
- Alerts broadcast instantly
- Connection status monitoring

### Commands (for future use)
```javascript
// Subscribe to specific machine
subscribeMachine('machine-123');

// Send control command
sendCommand('machine-123', 'start');

// Unsubscribe
unsubscribeMachine('machine-123');
```

## 🗄️ MongoDB Integration

### Auto-Save (Future Feature)
Predictions are calculated but not yet auto-saved to MongoDB.

### Manual Save via API
```javascript
await fetch('/api/machines/stream', {
  method: 'POST',
  body: JSON.stringify({
    machineId: 'machine-123',
    rpm: 1500,
    load: 75,
    temperature: 65,
    vibration: 5.2,
    health: 95,
    efficiency: 88,
    predictions: mlPredictionObject
  })
});
```

### Fetch Historical Data
```javascript
const response = await fetch('/api/machines/stream?machineId=machine-123&limit=100');
const data = await response.json();
```

## 🐛 Troubleshooting

### Models Not Loading
1. Check browser console for errors
2. Verify files exist: `/public/models/*.onnx`
3. Clear cache and reload
4. Check `onnxruntime-web` is installed: `npm list onnxruntime-web`

### No Predictions Showing
1. Wait for "Models Ready" indicator
2. Ensure simulation is running
3. Check browser console for errors
4. Verify machine has been running for at least one cycle

### WebSocket Not Connecting
1. Check `/api/socket` is accessible
2. Restart development server
3. Check for port conflicts
4. Look for Socket.IO errors in console

### Anomaly Detection Too Sensitive
Models use normalized values. You can adjust thresholds in `public/models/model_metadata.json`:
```json
{
  "autoencoder_anomaly": {
    "anomalyThreshold": 0.0814  // Lower = more sensitive
  }
}
```

## 🎯 Next Steps

### Immediate:
1. ✅ Test control room with real machines
2. ✅ Monitor prediction accuracy
3. ✅ Fine-tune anomaly thresholds

### Short-term:
- Enable MongoDB auto-save for predictions
- Add historical prediction charts
- Implement alert notifications
- Add prediction confidence tracking

### Long-term:
- Python backend for larger models
- Model retraining pipeline
- A/B testing framework
- Multi-model ensemble predictions

## 📚 Documentation

- Full docs: `SIMULATION_ML_INTEGRATION.md`
- ONNX Loader API: `lib/onnx-loader.ts`
- WebSocket Hook: `hooks/useWebSocket.ts`
- Control Room Component: `app/simulator/control-room/page.tsx`

## 💡 Tips

1. **Start Small**: Test with 2-3 machines first
2. **Monitor Performance**: Check FPS and prediction latency
3. **Use Auto Mode**: Let RL agent optimize loads automatically
4. **Watch Trends**: Look for patterns in anomaly scores
5. **Act on Recommendations**: AI suggestions are based on trained models

## 🎉 Success!

You now have a fully ML-integrated control room with:
- ✅ Real-time ONNX model inference
- ✅ WebSocket live updates
- ✅ RL agent optimization
- ✅ Anomaly detection
- ✅ Digital twin predictions
- ✅ MongoDB data streaming

**Enjoy your AI-powered industrial machine control system!** 🚀🤖
