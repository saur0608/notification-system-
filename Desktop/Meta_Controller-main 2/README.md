# MetaController - Industrial Machine Management Platform

AI-powered digital twin platform for industrial machine monitoring, fault detection, and workload optimization using ONNX machine learning models.

## 🎯 Features

- **Machine CRUD Management**: Add, edit, delete machines with full sensor configuration
- **Digital Twin Simulator**: Real-time physics-based machine behavior simulation
- **ML Decision Engine**: 4 ONNX models for fault detection, load forecasting, and optimization
- **Control Center**: Start/stop machines, manage workloads, real-time monitoring
- **Analytics Dashboard**: Efficiency trends, fault history, optimization savings
- **Role-Based Access**: Admin, Engineer, Operator, Viewer permissions

## 🧠 ML Models (ONNX Runtime Web)

| Model | Purpose | Input | Output |
|-------|---------|-------|--------|
| **LSTM Digital Twin** | Predict next machine state | 10×5 sensor sequence | Vibration, Temperature |
| **Autoencoder** | Anomaly detection | Vibration, Current, Temp | Reconstruction error |
| **GRU Load Forecast** | Future load prediction | 24 historical load values | Next load value |
| **DQN Agent** | Workload optimization | State (vib, temp, load) | Action (↓/hold/↑) |

## 📦 Setup

### 1. Install Dependencies

```bash
cd MetaController
npm install
```

### 2. Copy ONNX Models

Copy the 4 `.onnx` files to `public/models/`:

```bash
# From parent directory
cp ../lstm_digital_twin.onnx public/models/
cp ../dqn_agent.onnx public/models/
cp ../autoencoder_anomaly.onnx public/models/
cp ../gru_load_forecast.onnx public/models/
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🚀 Deploy to Vercel

### Option 1: Vercel CLI

```bash
npm install -g vercel
vercel
```

### Option 2: GitHub Integration

1. Push code to GitHub
2. Import repository in Vercel dashboard
3. Set environment variables (if needed)
4. Deploy

### Environment Variables

Create `.env.local`:

```env
# Optional: MongoDB for production
MONGODB_URI=mongodb+srv://...

# Optional: Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Optional: Vercel KV for caching
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
```

## 📁 Project Structure

```
MetaController/
├── app/
│   ├── page.tsx              # Home/Dashboard
│   ├── layout.tsx            # Root layout
│   ├── machines/             # Machine management
│   ├── simulator/            # Digital twin
│   ├── analytics/            # Reports & insights
│   └── api/                  # API routes
├── lib/
│   ├── onnx/
│   │   ├── modelLoader.ts    # ONNX session management
│   │   └── inference.ts      # ML prediction wrappers
│   ├── simulator.ts          # Physics engine
│   └── decision-engine.ts    # ML orchestration
├── components/
│   ├── ui/                   # Reusable UI components
│   ├── charts/               # Data visualization
│   └── control/              # Machine controls
└── public/
    └── models/               # ONNX model files
        ├── lstm_digital_twin.onnx
        ├── dqn_agent.onnx
        ├── autoencoder_anomaly.onnx
        ├── gru_load_forecast.onnx
        └── model_metadata.json
```

## 🔌 API Routes

### Machines
- `GET /api/machines` - List all machines
- `POST /api/machines` - Create machine
- `GET /api/machines/[id]` - Get machine details
- `PUT /api/machines/[id]` - Update machine
- `DELETE /api/machines/[id]` - Delete machine

### Simulation
- `GET /api/simulator/start` - Start digital twin
- `GET /api/simulator/stop` - Stop simulation
- `WS /api/simulator/stream` - WebSocket sensor stream

### ML Inference
- `POST /api/ml/predict-state` - LSTM prediction
- `POST /api/ml/detect-anomaly` - Autoencoder check
- `POST /api/ml/forecast-load` - GRU forecast
- `POST /api/ml/optimize-load` - DQN action

## 🎨 Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **ML Runtime**: ONNX Runtime Web
- **Charts**: Recharts / Chart.js
- **Real-time**: Socket.IO
- **Auth**: NextAuth.js
- **Database**: MongoDB Atlas (optional)
- **Deployment**: Vercel

## 📊 Usage Examples

### Predict Next Machine State

```typescript
import { predictNextState } from '@/lib/onnx/inference';

const sensorHistory = [
  { rpm: 1000, load_percent: 50, load_kw: 25, current: 0.5, torque: 20 },
  // ... last 10 readings
];

const prediction = await predictNextState(sensorHistory);
console.log(prediction); // { vibration: 10.2, temperature: 42.5 }
```

### Detect Anomaly

```typescript
import { detectAnomaly } from '@/lib/onnx/inference';

const result = await detectAnomaly({
  vibration: 12.5,
  current: 0.8,
  temperature: 45
});

if (result.isAnomaly) {
  console.log('⚠️ Fault detected!');
}
```

### Optimize Workload

```typescript
import { optimizeLoad } from '@/lib/onnx/inference';

const action = await optimizeLoad({
  vibration: 10,
  temperature: 40,
  load_kw: 30
});

console.log(`Recommended: ${action.action}`); // "hold_load"
```

## 🧪 Testing

Run ONNX inference tests:

```bash
npm run test:ml
```

## 📝 Model Preprocessing

All inputs are Min-Max scaled (0-1). Ensure consistency:

- **Vibration**: 5-15 range
- **Temperature**: 30-50°C range
- **Load**: 0-50 kW range
- **Current**: 0-1 A range
- **RPM**: 500-1500 range

## 🛠️ Troubleshooting

### ONNX Model Load Error
- Verify `.onnx` files are in `public/models/`
- Check browser console for CORS issues
- Ensure WASM is enabled in browser

### WebSocket Connection Failed
- Check firewall/proxy settings
- Verify Socket.IO client version matches server

### Build Errors
- Clear `.next` folder: `rm -rf .next`
- Reinstall: `rm -rf node_modules && npm install`

## 📄 License

MIT

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open Pull Request

---

Built with ❤️ using Next.js, ONNX Runtime, and TensorFlow
