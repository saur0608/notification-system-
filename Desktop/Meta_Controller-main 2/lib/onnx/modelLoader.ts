export interface ModelMetadata {
  path: string;
  inputShape: number[];
  outputShape: number[];
  scaler?: {
    type: string;
    features?: string[];
    targets?: string[];
    feature?: string;
  };
  anomalyThreshold?: number;
  actions?: string[];
  sequenceLength?: number;
  description: string;
}

export class ONNXModelLoader {
  private sessions: Map<string, any> = new Map();
  private metadata: Map<string, ModelMetadata> = new Map();

  async loadModel(modelName: string): Promise<void> {
    if (this.sessions.has(modelName)) {
      return; // Already loaded
    }

    try {
      let session;
      let modelMeta;

      if (typeof window === 'undefined') {
        // Server Side
        const fs = (await import('fs')).promises;
        const path = (await import('path')).default;
        // Use onnxruntime-web with WASM backend on server to reduce bundle size
        const ort = (await import('onnxruntime-web'));

        const metadataPath = path.join(process.cwd(), 'public', 'models', 'model_metadata.json');
        const metadataContent = await fs.readFile(metadataPath, 'utf-8');
        const allMetadata = JSON.parse(metadataContent);
        modelMeta = allMetadata.models[modelName];
        
        if (!modelMeta) throw new Error(`Model ${modelName} not found in metadata`);
        this.metadata.set(modelName, modelMeta);

        // FIX: Use fetch for large model files to avoid bundling them in the serverless function
        // This prevents the "Serverless Function has exceeded 250MB" error
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        const modelUrl = `${baseUrl}${modelMeta.path}`;
        
        console.log(`Fetching model from: ${modelUrl}`);
        const response = await fetch(modelUrl);
        if (!response.ok) throw new Error(`Failed to fetch model from ${modelUrl}: ${response.statusText}`);
        const modelBuffer = await response.arrayBuffer();
        
        // Create session from buffer
        session = await ort.InferenceSession.create(modelBuffer);
      } else {
        // Client Side
        const ort = (await import('onnxruntime-web'));
        ort.env.wasm.wasmPaths = '/';

        const metadataRes = await fetch('/models/model_metadata.json');
        const allMetadata = await metadataRes.json();
        modelMeta = allMetadata.models[modelName];
        
        if (!modelMeta) throw new Error(`Model ${modelName} not found in metadata`);
        this.metadata.set(modelName, modelMeta);

        session = await ort.InferenceSession.create(modelMeta.path, {
          executionProviders: ['wasm'],
        });
      }

      this.sessions.set(modelName, session);
      console.log(`✓ Model ${modelName} loaded successfully`);
    } catch (error) {
      console.error(`Error loading model ${modelName}:`, error);
      throw error;
    }
  }

  async predict(modelName: string, inputData: Float32Array, inputShape: number[]): Promise<Float32Array> {
    const session = this.sessions.get(modelName);
    if (!session) {
      throw new Error(`Model ${modelName} not loaded`);
    }

    try {
      let inputTensor;
      let feeds;
      let results;

      if (typeof window === 'undefined') {
        const ort = (await import('onnxruntime-web'));
        inputTensor = new ort.Tensor('float32', inputData, inputShape);
        feeds = { [session.inputNames[0]]: inputTensor };
        results = await session.run(feeds);
      } else {
        const ort = (await import('onnxruntime-web'));
        inputTensor = new ort.Tensor('float32', inputData, inputShape);
        feeds = { [session.inputNames[0]]: inputTensor };
        results = await session.run(feeds);
      }

      const outputTensor = results[session.outputNames[0]];
      return outputTensor.data as Float32Array;
    } catch (error) {
      console.error(`Prediction error for ${modelName}:`, error);
      throw error;
    }
  }

  getMetadata(modelName: string): ModelMetadata | undefined {
    return this.metadata.get(modelName);
  }
}

// Singleton instance
export const modelLoader = new ONNXModelLoader();
