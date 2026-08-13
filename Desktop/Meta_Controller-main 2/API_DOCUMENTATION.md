# MetaController API Documentation

## Base URL
- Development: `http://localhost:3000/api`
- Production: `https://your-domain.vercel.app/api`

---

## Health Check

### GET /api/health
Check API health status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-12-06T10:30:00.000Z",
  "services": {
    "api": "operational",
    "onnx": "ready",
    "database": "in-memory"
  }
}
```

---

## Machine Management

### GET /api/machines
Get all machines with optional filters.

**Query Parameters:**
- `status` (optional): Filter by status (`running`, `idle`, `maintenance`, `fault`)
- `type` (optional): Filter by type (`CNC`, `Pump`, `Compressor`, `Motor`, `Conveyor`)

**Example:**
```bash
GET /api/machines?status=running&type=CNC
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "CNC Machine #1",
      "type": "CNC",
      "location": "Production Floor A",
      "status": "running",
      "health": 92,
      "efficiency": 88,
      "specifications": {
        "maxRPM": 3000,
        "maxLoad": 50,
        "maxTemp": 80,
        "powerRating": 15
      },
      "sensorData": {
        "timestamp": "2024-12-06T10:30:00.000Z",
        "rpm": 2800,
        "vibration": 0.45,
        "temperature": 65,
        "current": 12.5,
        "load": 42
      },
      "createdAt": "2024-01-15T00:00:00.000Z",
      "updatedAt": "2024-12-06T10:30:00.000Z"
    }
  ]
}
```

---

### POST /api/machines
Create a new machine.

**Request Body:**
```json
{
  "name": "New CNC Machine",
  "type": "CNC",
  "location": "Production Floor B",
  "status": "idle",
  "health": 100,
  "efficiency": 100,
  "specifications": {
    "maxRPM": 3000,
    "maxLoad": 50,
    "maxTemp": 80,
    "powerRating": 15
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": { /* machine object */ },
  "message": "Machine created successfully"
}
```

**Status Codes:**
- `201`: Created successfully
- `400`: Missing required fields
- `500`: Server error

---

### GET /api/machines/[id]
Get a specific machine by ID.

**Response:**
```json
{
  "success": true,
  "data": { /* machine object */ }
}
```

**Status Codes:**
- `200`: Success
- `404`: Machine not found
- `500`: Server error

---

### PUT /api/machines/[id]
Update a machine.

**Request Body:**
```json
{
  "status": "maintenance",
  "health": 85,
  "sensorData": {
    "timestamp": "2024-12-06T10:30:00.000Z",
    "rpm": 2500,
    "vibration": 0.52,
    "temperature": 68,
    "current": 11.8,
    "load": 38
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": { /* updated machine object */ },
  "message": "Machine updated successfully"
}
```

---

### DELETE /api/machines/[id]
Delete a machine.

**Response:**
```json
{
  "success": true,
  "message": "Machine deleted successfully"
}
```

**Status Codes:**
- `200`: Deleted successfully
- `404`: Machine not found
- `500`: Server error

---

## ML Inference Endpoints

### POST /api/inference/predict
Predict next machine state using LSTM Digital Twin.

**Request Body:**
```json
{
  "rpm": 2800,
  "vibration": 0.45,
  "temperature": 65,
  "current": 12.5
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "predictedState": {
      "rpm": 2820,
      "vibration": 0.46,
      "temperature": 66,
      "current": 12.6
    }
  }
}
```

**Model:** `lstm_digital_twin.onnx` (64→32 LSTM units)

---

### POST /api/inference/anomaly
Detect anomalies using Autoencoder.

**Request Body:**
```json
{
  "vibration": 1.85,
  "current": 15.2,
  "temperature": 78
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isAnomaly": true,
    "reconstructionError": 0.0985,
    "threshold": 0.0814,
    "reconstructed": {
      "vibration": 0.52,
      "current": 12.1,
      "temperature": 65
    }
  }
}
```

**Model:** `autoencoder_anomaly.onnx` (3→8→4→2→4→8→3 architecture)

---

### POST /api/inference/forecast
Forecast future load using GRU.

**Request Body:**
```json
{
  "loadHistory": [42, 43, 41, 44, 45, 43, 42, 40, 39, 41, 43, 44, 45, 46, 44, 43, 42, 41, 40, 39, 38, 40, 41, 42]
}
```

**Note:** `loadHistory` must contain exactly 24 values (sequence length).

**Response:**
```json
{
  "success": true,
  "data": {
    "forecastedLoad": 43.5,
    "confidence": 0.92
  }
}
```

**Model:** `gru_load_forecast.onnx` (GRU 64→32 with dropout)

---

### POST /api/inference/optimize
Get optimal load action using DQN Agent.

**Request Body:**
```json
{
  "currentLoad": 42,
  "targetLoad": 40
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "action": "decrease",
    "actionIndex": 0,
    "qValues": [0.85, 0.12, 0.03],
    "confidence": 0.85
  }
}
```

**Actions:**
- `0`: Decrease load
- `1`: Hold current load
- `2`: Increase load

**Model:** `dqn_agent.onnx` (Dense 64→64→32→3)

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

---

## TypeScript Types

```typescript
interface Machine {
  id: string;
  name: string;
  type: 'CNC' | 'Pump' | 'Compressor' | 'Motor' | 'Conveyor';
  location: string;
  status: 'running' | 'idle' | 'maintenance' | 'fault';
  health: number; // 0-100
  efficiency: number; // 0-100
  specifications: {
    maxRPM: number;
    maxLoad: number;
    maxTemp: number;
    powerRating: number;
  };
  sensorData?: SensorReading;
  predictions?: MachinePredictions;
  createdAt: string;
  updatedAt: string;
}

interface SensorReading {
  timestamp: string;
  rpm: number;
  vibration: number;
  temperature: number;
  current: number;
  load: number;
}

interface MachinePredictions {
  anomalyScore: number;
  isAnomaly: boolean;
  nextState: {
    rpm: number;
    vibration: number;
    temperature: number;
    current: number;
  };
  loadForecast: number[];
  recommendedAction: 'decrease' | 'hold' | 'increase';
  confidence: number;
}
```

---

## Usage Examples

### Fetch All Running Machines
```typescript
const response = await fetch('/api/machines?status=running');
const data = await response.json();

if (data.success) {
  console.log('Running machines:', data.data);
}
```

### Run Complete ML Analysis
```typescript
async function analyzeMachine(machineId: string) {
  const machine = await fetch(`/api/machines/${machineId}`).then(r => r.json());
  const sensorData = machine.data.sensorData;

  const [anomaly, prediction, optimization] = await Promise.all([
    fetch('/api/inference/anomaly', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vibration: sensorData.vibration,
        current: sensorData.current,
        temperature: sensorData.temperature
      })
    }).then(r => r.json()),
    
    fetch('/api/inference/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rpm: sensorData.rpm,
        vibration: sensorData.vibration,
        temperature: sensorData.temperature,
        current: sensorData.current
      })
    }).then(r => r.json()),
    
    fetch('/api/inference/optimize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentLoad: sensorData.load,
        targetLoad: machine.data.specifications.maxLoad * 0.8
      })
    }).then(r => r.json())
  ]);

  return {
    anomaly: anomaly.data,
    prediction: prediction.data,
    optimization: optimization.data
  };
}
```

---

## Testing with cURL

```bash
# Health check
curl http://localhost:3000/api/health

# Get all machines
curl http://localhost:3000/api/machines

# Create machine
curl -X POST http://localhost:3000/api/machines \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Machine","type":"CNC","location":"Floor A"}'

# Detect anomaly
curl -X POST http://localhost:3000/api/inference/anomaly \
  -H "Content-Type: application/json" \
  -d '{"vibration":1.85,"current":15.2,"temperature":78}'

# Predict next state
curl -X POST http://localhost:3000/api/inference/predict \
  -H "Content-Type: application/json" \
  -d '{"rpm":2800,"vibration":0.45,"temperature":65,"current":12.5}'
```

---

## Rate Limiting

Currently no rate limiting is implemented. For production deployment on Vercel:

1. Use Vercel's built-in rate limiting
2. Implement Redis-based rate limiting
3. Use API Gateway (e.g., Kong, Tyk)

---

## Authentication

Currently no authentication is implemented. See TODO #8 for NextAuth.js integration.

**Planned roles:**
- **Admin**: Full access to all endpoints
- **Engineer**: Read/write access, can modify machines
- **Operator**: Read/write access, cannot delete
- **Viewer**: Read-only access

---

## Database Migration

The current implementation uses in-memory storage (`lib/db.ts`). To migrate to production:

### Option 1: MongoDB
```typescript
// lib/mongodb.ts
import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI!);
export const db = client.db('metacontroller');
```

### Option 2: Vercel KV (Redis)
```typescript
// lib/kv.ts
import { kv } from '@vercel/kv';

export const getMachines = () => kv.get('machines');
export const setMachines = (machines) => kv.set('machines', machines);
```

### Option 3: Prisma ORM
```prisma
// prisma/schema.prisma
model Machine {
  id            String   @id @default(cuid())
  name          String
  type          String
  location      String
  status        String
  health        Int
  efficiency    Int
  specifications Json
  sensorData    Json?
  predictions   Json?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

---

## Next Steps

- [ ] Add WebSocket for real-time sensor streaming
- [ ] Implement pagination for large machine lists
- [ ] Add filtering, sorting, and search
- [ ] Create batch operations endpoint
- [ ] Add export functionality (CSV, PDF reports)
- [ ] Implement caching layer (Redis)
- [ ] Add request validation middleware
- [ ] Create API versioning strategy
- [ ] Add OpenAPI/Swagger documentation
- [ ] Implement audit logging
