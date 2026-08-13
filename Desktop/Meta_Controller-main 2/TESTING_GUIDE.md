# Testing Your ML-Integrated Control Room

## ✅ Pre-flight Checklist

1. **Models in Place**
   - [ ] Check `/public/models/` has all 4 .onnx files
   - [ ] Check `/public/models/model_metadata.json` exists
   - [ ] Verify file sizes (models should be >100KB each)

2. **Dependencies Installed**
   ```powershell
   npm list onnxruntime-web socket.io socket.io-client
   ```
   All three should show installed versions.

3. **No Compilation Errors**
   ```powershell
   npm run build
   ```
   Should complete without errors in control room file.

## 🧪 Test Procedure

### Test 1: Model Loading
**Goal**: Verify ONNX models load successfully

1. Start dev server: `npm run dev`
2. Open browser console (F12)
3. Navigate to: `http://localhost:3000/simulator/control-room`
4. Look for console logs:
   ```
   🔄 Loading ONNX models...
   ✅ Model lstm_digital_twin loaded successfully
   ✅ Model dqn_agent loaded successfully  
   ✅ Model autoencoder_anomaly loaded successfully
   ✅ Model gru_load_forecast loaded successfully
   ✅ All models loaded
   ```
5. Check header shows: **"Models Ready"** with green indicator

**Expected Result**: ✅ All 4 models load within 5 seconds

**If Failed**:
- Check browser console for ONNX errors
- Verify model files exist and are valid ONNX format
- Try clearing cache and reloading

---

### Test 2: WebSocket Connection
**Goal**: Verify WebSocket connects

1. Check header shows: **"Connected"** with green pulse
2. Console should show:
   ```
   ✅ WebSocket connected
   Client [id] joined machine-monitoring room
   ```

**Expected Result**: ✅ WebSocket connects within 2 seconds

**If Failed**:
- Check `/api/socket` endpoint is accessible
- Restart dev server
- Check for port conflicts

---

### Test 3: Simulation with ML Predictions
**Goal**: Run simulation and verify ML predictions

1. Click **"Start Simulation"** button
2. Wait 2-3 seconds for first update
3. Open console and look for:
   ```javascript
   // No errors should appear
   // You might see prediction logs if you added them
   ```
4. Click on any machine card to see details
5. Check "AI Prediction & Analysis" panel shows:
   - Status (Normal/Moderate/High Anomaly)
   - Reconstruction Error (number like 0.0234)
   - Anomaly Score (0-100%)
   - RL Agent Action (DECREASE_LOAD / HOLD_LOAD / INCREASE_LOAD)
   - Q-Values (3 numbers)
   - AI Recommendations (list of suggestions)

**Expected Result**: ✅ Predictions update every 2 seconds

**If Failed**:
- Check "Models Ready" is showing
- Look for errors in console
- Verify simulation is actually running (check sensor values changing)

---

### Test 4: Anomaly Detection
**Goal**: Verify autoencoder detects anomalies

1. Start simulation
2. Select a machine and enter detail view
3. Manually increase temperature slider to maximum
4. Watch anomaly score increase
5. Anomaly badge should appear when score > 50%
6. Color should change: Green → Yellow → Red

**Expected Result**: ✅ Anomaly score responds to sensor changes

---

### Test 5: RL Agent Auto-Optimization
**Goal**: Verify RL agent controls loads

1. Start simulation with 2-3 machines
2. Enable **"AI Auto-Optimize"** checkbox
3. For each machine, click "Auto" button to enable auto mode
4. Watch load values change based on RL agent actions
5. Console log (if you add it):
   ```javascript
   RL Agent Action: decrease_load
   New load: 65 (was 75)
   ```

**Expected Result**: ✅ Loads adjust based on RL recommendations

---

### Test 6: WebSocket Broadcasting
**Goal**: Verify WebSocket sends updates

1. Start simulation
2. Open browser console
3. Look for WebSocket traffic in Network tab (WS filter)
4. Should see messages every 2 seconds during simulation

**Expected Result**: ✅ WebSocket messages flow continuously

---

## 📊 Expected Behavior

### Normal Operation
- ✅ Anomaly Score: 0-50% (Green)
- ✅ RL Action: Usually "HOLD_LOAD" or "INCREASE_LOAD"
- ✅ Recommendations: "All systems operating normally"
- ✅ Reconstruction Error: < 0.08

### Moderate Issues
- ⚠️ Anomaly Score: 50-70% (Yellow)
- ⚠️ RL Action: May suggest "DECREASE_LOAD"
- ⚠️ Recommendations: "Monitor closely", "Reduce load"
- ⚠️ Reconstruction Error: 0.08-0.15

### Critical Issues
- 🚨 Anomaly Score: 70-100% (Red)
- 🚨 RL Action: Likely "DECREASE_LOAD"
- 🚨 Recommendations: "Schedule inspection", "Check cooling"
- 🚨 Reconstruction Error: > 0.15
- 🚨 Status: May change to "Fault"

## 🔍 Debugging Tips

### Model Not Loading
```javascript
// In browser console:
fetch('/models/model_metadata.json')
  .then(r => r.json())
  .then(console.log)

// Should show model metadata
```

### Predictions Not Working
```javascript
// Add to simulateStep() function:
console.log('ML Prediction:', mlPrediction);

// Should log prediction object every 2 seconds
```

### WebSocket Issues
```javascript
// In useWebSocket hook, add:
console.log('Socket state:', socket.connected);
console.log('Received update:', update);
```

## 📈 Performance Benchmarks

Expected performance on modern hardware:

| Metric | Target | Acceptable | Poor |
|--------|--------|------------|------|
| Model Load Time | <3s | 3-5s | >5s |
| First Prediction | <1s | 1-2s | >2s |
| Inference Time | <10ms | 10-20ms | >20ms |
| UI Update Rate | 2s | 2-3s | >3s |
| WebSocket Latency | <100ms | 100-200ms | >200ms |

## 🎯 Success Criteria

Your ML integration is working correctly if:

- [ ] All 4 models load successfully
- [ ] "Models Ready" indicator shows green
- [ ] WebSocket connects ("Connected" shows)
- [ ] Simulation runs without errors
- [ ] Anomaly scores display (0-100%)
- [ ] RL agent actions show (DECREASE/HOLD/INCREASE_LOAD)
- [ ] Q-values display (3 numbers)
- [ ] Recommendations list appears
- [ ] Auto-optimization changes loads
- [ ] Anomaly detection responds to sensor changes
- [ ] No errors in browser console
- [ ] UI updates every 2 seconds

## 🐛 Common Issues & Solutions

### Issue: "Models not loaded"
**Solution**: 
1. Check files exist in `/public/models/`
2. Verify ONNX files are valid (not corrupted)
3. Check browser supports WebAssembly
4. Clear cache and reload

### Issue: Predictions are "undefined"
**Solution**:
1. Wait for "Models Ready" indicator
2. Ensure simulation is running
3. Check machine has valid sensor data
4. Look for ONNX inference errors in console

### Issue: WebSocket shows "Disconnected"
**Solution**:
1. Restart dev server
2. Check `/api/socket` is accessible
3. Look for Socket.IO errors
4. Check firewall isn't blocking WebSocket

### Issue: RL Agent always shows same action
**Solution**:
- This may be normal if conditions don't change
- Try manually adjusting sensors to see different actions
- Check Q-values are different (not all the same)

### Issue: Anomaly score stuck at 0%
**Solution**:
1. Check autoencoder is loaded
2. Verify sensor data has values
3. Try increasing temperature/vibration to trigger anomaly
4. Check reconstruction error is calculated

## 🚀 Advanced Testing

### Test Digital Twin Predictions
```javascript
// In simulateStep(), add after 10+ readings:
if (control.history.length >= 10) {
  console.log('Next State Prediction:', mlPrediction?.nextState);
  // Should show predicted vibration and temperature
}
```

### Test Load Forecasting
```javascript
// When you have 24+ load readings:
const loads = controlStates.get(machineId)?.history.map(h => h[2]) || [];
if (loads.length >= 24) {
  const forecast = await modelLoader.forecastLoad(loads.slice(-24));
  console.log('Load Forecast:', forecast.predictedLoad);
}
```

### Benchmark Inference Speed
```javascript
// Add to getMLPredictions():
const startTime = performance.now();
const predictions = await getMLPredictions(machineData);
const endTime = performance.now();
console.log(`Inference time: ${endTime - startTime}ms`);
// Should be <20ms
```

## 📝 Test Results Template

```
Date: _________________
Tester: _______________

✅ Model Loading: PASS / FAIL
   - Load time: _____ seconds
   
✅ WebSocket: PASS / FAIL
   - Connection time: _____ seconds
   
✅ ML Predictions: PASS / FAIL
   - First prediction: _____ seconds
   - Update rate: _____ seconds
   
✅ Anomaly Detection: PASS / FAIL
   - Responds to changes: YES / NO
   
✅ RL Agent: PASS / FAIL
   - Auto-optimization works: YES / NO
   
✅ UI Updates: PASS / FAIL
   - No lag: YES / NO
   - No errors: YES / NO

Notes:
_________________________________
_________________________________
_________________________________

Overall: PASS / FAIL
```

## ✨ Next Steps After Testing

Once everything passes:
1. Test with real machine data (if available)
2. Monitor prediction accuracy over time
3. Fine-tune anomaly thresholds if needed
4. Add MongoDB auto-save for predictions
5. Implement alert notifications
6. Add historical prediction charts

## 🎉 Congratulations!

If all tests pass, your ML-integrated control room is fully functional and ready for production use!

**You now have**:
- ✅ Real-time ML inference
- ✅ 4 trained models working together
- ✅ AI-powered optimization
- ✅ Live anomaly detection
- ✅ WebSocket communication
- ✅ Professional monitoring interface

**Enjoy your AI-powered industrial control system!** 🚀🤖✨
