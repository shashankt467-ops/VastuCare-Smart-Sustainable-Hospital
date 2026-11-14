Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  Starting VastuCare Smart Sustainable Hospital" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Cyan

$root = $PSScriptRoot

Write-Host "`n[1/3] Starting Python ML Microservice (Port 5001)..." -ForegroundColor Yellow
Start-Process python -ArgumentList "ml_service.py" -WorkingDirectory "$root\ml"

Start-Sleep -Seconds 2

Write-Host "[2/3] Starting Backend API Server (Port 5000)..." -ForegroundColor Yellow
Start-Process npm -ArgumentList "run dev" -WorkingDirectory "$root\backend"

Start-Sleep -Seconds 2

Write-Host "[3/3] Starting Frontend React UI (Port 3000)..." -ForegroundColor Yellow
Start-Process npm -ArgumentList "run dev" -WorkingDirectory "$root\frontend"

Write-Host "`nAll 3 services launched successfully!" -ForegroundColor Green
Write-Host "Opening http://localhost:3000 in your browser..." -ForegroundColor Cyan

Start-Sleep -Seconds 5
Start-Process "http://localhost:3000"
