# Copy ONNX models to public folder
Write-Host "📦 Copying ONNX models to public/models/..."

$models = @(
    "lstm_digital_twin.onnx",
    "dqn_agent.onnx",
    "autoencoder_anomaly.onnx",
    "gru_load_forecast.onnx"
)

$source = ".."
$dest = "public\models"

# Create destination if it doesn't exist
if (!(Test-Path $dest)) {
    New-Item -ItemType Directory -Path $dest -Force
}

foreach ($model in $models) {
    $sourcePath = Join-Path $source $model
    $destPath = Join-Path $dest $model
    
    if (Test-Path $sourcePath) {
        Copy-Item $sourcePath $destPath -Force
        Write-Host "✓ Copied $model"
    } else {
        Write-Host "✗ $model not found in parent directory" -ForegroundColor Yellow
    }
}

Write-Host "`n✨ Setup complete! Run 'npm install' then 'npm run dev'" -ForegroundColor Green
