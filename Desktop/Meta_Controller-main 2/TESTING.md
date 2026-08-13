# Testing Guide for MetaController

## Quick Start Testing

### 1. Start the Development Server
```powershell
cd MetaController
npm run dev
```

Server should start at: `http://localhost:3000`

---

## Testing UI Pages

### Homepage
- Navigate to: `http://localhost:3000`
- **Expected:** Dashboard with 4 feature cards and stats
- **Verify:** All cards are clickable and styled correctly

### Machines List Page
- Navigate to: `http://localhost:3000/machines`
- **Expected:** Grid of 5 sample machines with health/efficiency metrics
- **Verify:** 
  - Status filters (All, Running, Idle, Maintenance, Fault) work
  - Each machine card shows current sensor data
  - Anomaly alerts show for faulty machines
  - Stats summary shows correct counts

### Machine Detail Page
- Click any machine from the list OR navigate to: `http://localhost:3000/machines/1`
- **Expected:** Detailed view with 3 columns
  - Left: Status controls, health bars, specifications
  - Center: Live sensor data in colored cards
  - Right: ML predictions panel (empty initially)
- **Verify:**
  - Status buttons update machine status
  - Sensor data displays correctly
  - "Run ML Analysis" button is visible

### Run ML Analysis
- On machine detail page, click **"Run ML Analysis"**
- **Expected:** 
  - Button shows "Running AI..." while processing
  - After 2-3 seconds, right column populates with:
    - Anomaly detection result (green=normal, red=anomaly)
    - Predicted next state values
    - Recommended action (decrease/hold/increase)
- **Verify:**
  - Machine #4 (Conveyor Motor) should show anomaly (high vibration: 1.85)
  - Other machines should show normal operation

---

## Testing API Endpoints

### Using PowerShell (Built-in)

#### Test Health Check
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/health"
```
**Expected Output:**
```
status    : healthy
timestamp : 2024-12-06T10:30:00.000Z
services  : @{api=operational; onnx=ready; database=in-memory}
```

#### Get All Machines
```powershell
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/machines"
$response.data | Format-Table id, name, type, status, health
```

#### Get Running Machines Only
```powershell
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/machines?status=running"
$response.data.Count
```

#### Get Specific Machine
```powershell
$machine = Invoke-RestMethod -Uri "http://localhost:3000/api/machines/1"
$machine.data | ConvertTo-Json -Depth 5
```

#### Create New Machine
```powershell
$body = @{
    name = "Test CNC #99"
    type = "CNC"
    location = "Test Floor"
    status = "idle"
    health = 100
    efficiency = 100
    specifications = @{
        maxRPM = 3000
        maxLoad = 50
        maxTemp = 80
        powerRating = 15
    }
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/machines" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

#### Update Machine Status
```powershell
$body = @{ status = "maintenance" } | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/machines/1" `
    -Method PUT `
    -Body $body `
    -ContentType "application/json"
```

#### Delete Machine
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/machines/6" -Method DELETE
```

---

## Testing ML Inference Endpoints

### Test Anomaly Detection

#### Normal Operation (Should Pass)
```powershell
$body = @{
    vibration = 0.45
    current = 12.5
    temperature = 65
} | ConvertTo-Json

$result = Invoke-RestMethod -Uri "http://localhost:3000/api/inference/anomaly" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"

Write-Host "Anomaly Detected: $($result.data.isAnomaly)" -ForegroundColor $(if($result.data.isAnomaly){"Red"}else{"Green"})
Write-Host "Reconstruction Error: $($result.data.reconstructionError)"
Write-Host "Threshold: $($result.data.threshold)"
```

#### Faulty Operation (Should Fail)
```powershell
$body = @{
    vibration = 1.85
    current = 15.2
    temperature = 78
} | ConvertTo-Json

$result = Invoke-RestMethod -Uri "http://localhost:3000/api/inference/anomaly" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"

Write-Host "Anomaly Detected: $($result.data.isAnomaly)" -ForegroundColor $(if($result.data.isAnomaly){"Red"}else{"Green"})
```

---

### Test State Prediction (LSTM Digital Twin)
```powershell
$body = @{
    rpm = 2800
    vibration = 0.45
    temperature = 65
    current = 12.5
} | ConvertTo-Json

$result = Invoke-RestMethod -Uri "http://localhost:3000/api/inference/predict" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"

Write-Host "Current State:"
Write-Host "  RPM: 2800, Vibration: 0.45, Temp: 65, Current: 12.5"
Write-Host "`nPredicted Next State:"
Write-Host "  RPM: $($result.data.predictedState.rpm)"
Write-Host "  Vibration: $($result.data.predictedState.vibration)"
Write-Host "  Temp: $($result.data.predictedState.temperature)"
Write-Host "  Current: $($result.data.predictedState.current)"
```

---

### Test Load Forecasting (GRU)
```powershell
$body = @{
    loadHistory = @(42, 43, 41, 44, 45, 43, 42, 40, 39, 41, 43, 44, 45, 46, 44, 43, 42, 41, 40, 39, 38, 40, 41, 42)
} | ConvertTo-Json

$result = Invoke-RestMethod -Uri "http://localhost:3000/api/inference/forecast" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"

Write-Host "Forecasted Load: $($result.data.forecastedLoad) kW"
Write-Host "Confidence: $([math]::Round($result.data.confidence * 100, 1))%"
```

---

### Test Load Optimization (DQN Agent)
```powershell
$body = @{
    currentLoad = 42
    targetLoad = 40
} | ConvertTo-Json

$result = Invoke-RestMethod -Uri "http://localhost:3000/api/inference/optimize" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"

Write-Host "Current Load: 42 kW"
Write-Host "Target Load: 40 kW"
Write-Host "Recommended Action: $($result.data.action.ToUpper())" -ForegroundColor Yellow
Write-Host "Confidence: $([math]::Round($result.data.confidence * 100, 1))%"
```

---

## Integration Test: Complete ML Pipeline

Run all 4 models on Machine #1:

```powershell
# Get machine data
$machine = Invoke-RestMethod -Uri "http://localhost:3000/api/machines/1"
$sensor = $machine.data.sensorData

Write-Host "=== ML Analysis for $($machine.data.name) ===" -ForegroundColor Cyan
Write-Host ""

# 1. Anomaly Detection
Write-Host "1. ANOMALY DETECTION" -ForegroundColor Yellow
$anomalyBody = @{
    vibration = $sensor.vibration
    current = $sensor.current
    temperature = $sensor.temperature
} | ConvertTo-Json

$anomaly = Invoke-RestMethod -Uri "http://localhost:3000/api/inference/anomaly" `
    -Method POST -Body $anomalyBody -ContentType "application/json"

Write-Host "   Status: $(if($anomaly.data.isAnomaly){'FAULT DETECTED'}else{'NORMAL'})" `
    -ForegroundColor $(if($anomaly.data.isAnomaly){"Red"}else{"Green"})
Write-Host "   Error: $($anomaly.data.reconstructionError)"
Write-Host ""

# 2. State Prediction
Write-Host "2. NEXT STATE PREDICTION" -ForegroundColor Yellow
$predictBody = @{
    rpm = $sensor.rpm
    vibration = $sensor.vibration
    temperature = $sensor.temperature
    current = $sensor.current
} | ConvertTo-Json

$predict = Invoke-RestMethod -Uri "http://localhost:3000/api/inference/predict" `
    -Method POST -Body $predictBody -ContentType "application/json"

Write-Host "   Next RPM: $([math]::Round($predict.data.predictedState.rpm, 0))"
Write-Host "   Next Temp: $([math]::Round($predict.data.predictedState.temperature, 1))°C"
Write-Host ""

# 3. Load Forecast
Write-Host "3. LOAD FORECASTING" -ForegroundColor Yellow
$forecastBody = @{
    loadHistory = @(42, 43, 41, 44, 45, 43, 42, 40, 39, 41, 43, 44, 45, 46, 44, 43, 42, 41, 40, 39, 38, 40, 41, 42)
} | ConvertTo-Json

$forecast = Invoke-RestMethod -Uri "http://localhost:3000/api/inference/forecast" `
    -Method POST -Body $forecastBody -ContentType "application/json"

Write-Host "   Forecasted: $([math]::Round($forecast.data.forecastedLoad, 1)) kW"
Write-Host ""

# 4. Load Optimization
Write-Host "4. LOAD OPTIMIZATION" -ForegroundColor Yellow
$optimizeBody = @{
    currentLoad = $sensor.load
    targetLoad = $machine.data.specifications.maxLoad * 0.8
} | ConvertTo-Json

$optimize = Invoke-RestMethod -Uri "http://localhost:3000/api/inference/optimize" `
    -Method POST -Body $optimizeBody -ContentType "application/json"

Write-Host "   Action: $($optimize.data.action.ToUpper())" -ForegroundColor Cyan
Write-Host "   Confidence: $([math]::Round($optimize.data.confidence * 100, 1))%"
Write-Host ""
Write-Host "=== Analysis Complete ===" -ForegroundColor Cyan
```

---

## Validation Checklist

### UI Functionality
- [ ] Homepage loads without errors
- [ ] All navigation links work
- [ ] Machine list page shows 5 machines
- [ ] Status filters work correctly
- [ ] Machine detail page displays all data
- [ ] Status buttons update machine status
- [ ] ML Analysis button triggers all 4 models
- [ ] Anomaly alerts show for faulty machines

### API Endpoints
- [ ] `/api/health` returns healthy status
- [ ] `/api/machines` returns all machines
- [ ] `/api/machines?status=running` filters correctly
- [ ] `/api/machines/1` returns specific machine
- [ ] POST `/api/machines` creates new machine
- [ ] PUT `/api/machines/[id]` updates machine
- [ ] DELETE `/api/machines/[id]` deletes machine

### ML Inference
- [ ] Anomaly detection works (normal case)
- [ ] Anomaly detection works (fault case)
- [ ] LSTM prediction returns valid state
- [ ] GRU forecast returns valid load
- [ ] DQN optimization returns valid action
- [ ] All models return confidence scores

### ONNX Models
- [ ] `lstm_digital_twin.onnx` loads successfully
- [ ] `dqn_agent.onnx` loads successfully
- [ ] `autoencoder_anomaly.onnx` loads successfully
- [ ] `gru_load_forecast.onnx` loads successfully
- [ ] Model metadata JSON is valid

### Performance
- [ ] Pages load within 3 seconds
- [ ] ML inference completes within 5 seconds
- [ ] No console errors in browser
- [ ] No build errors in terminal

---

## Troubleshooting

### ONNX Models Not Found
```powershell
# Verify models are in correct location
Get-ChildItem "public\models\*.onnx"

# Should show:
# autoencoder_anomaly.onnx
# dqn_agent.onnx
# gru_load_forecast.onnx
# lstm_digital_twin.onnx
```

### API Returns 500 Error
- Check terminal for error messages
- Verify request body matches expected format
- Check browser console for network errors

### Slow ML Inference
- First inference is always slower (model loading)
- Subsequent inferences should be faster (cached)
- Check if running in production mode

### Page Not Found (404)
```powershell
# Restart dev server
npm run dev
```

---

## Browser Testing

### Chrome DevTools
1. Open DevTools (F12)
2. Go to Network tab
3. Navigate to `/machines`
4. Verify API call to `/api/machines` returns 200
5. Click "Run ML Analysis"
6. Verify 4 API calls to inference endpoints

### Console Output
Should see:
```
Loaded model: lstm_digital_twin
Loaded model: dqn_agent
Loaded model: autoencoder_anomaly
Loaded model: gru_load_forecast
```

---

## Next Testing Phase

After Priority 1 is validated:
1. **Priority 2:** Test digital twin simulator with real-time charts
2. **Priority 3:** Test analytics dashboard with historical data
3. **Priority 4:** Test authentication and role-based access
4. **Priority 5:** Load testing and performance optimization
5. **Priority 6:** Production deployment to Vercel

---

## Automated Testing (Future)

### Jest/Vitest Unit Tests
```typescript
// __tests__/api/machines.test.ts
describe('GET /api/machines', () => {
  it('should return all machines', async () => {
    const res = await fetch('/api/machines');
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(5);
  });
});
```

### Playwright E2E Tests
```typescript
// tests/machines.spec.ts
test('should display machine list', async ({ page }) => {
  await page.goto('/machines');
  await expect(page.locator('h1')).toContainText('Machine Fleet');
  await expect(page.locator('[data-testid="machine-card"]')).toHaveCount(5);
});
```

---

## Success Criteria

✅ **Priority 1 Complete When:**
- All 5 sample machines display correctly
- CRUD operations work (Create, Read, Update, Delete)
- All 4 ML inference endpoints return valid results
- Machine detail page shows live sensor data
- ML Analysis button triggers all 4 models
- No console errors in browser or terminal
- API documentation is complete and accurate
