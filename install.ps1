Write-Host "🔥 BOOTING COOK AGENT INSTALLER..." -ForegroundColor DarkYellow

if (-not (Get-Command "node" -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js is not installed. Please install Node.js v22+." -ForegroundColor Red
    Exit 1
}

if (-not (Get-Command "pnpm" -ErrorAction SilentlyContinue)) {
    Write-Host "⚠️ pnpm not found. Installing globally via npm..." -ForegroundColor Yellow
    npm install -g pnpm
}

Write-Host "✅ System dependencies verified. Installing packages..." -ForegroundColor Green
pnpm install

if (-not (Test-Path ".env")) {
    New-Item -ItemType File -Name ".env" -Force | Out-Null
}

Write-Host "✅ Packages installed. Launching System Calibration...`n" -ForegroundColor Green
node --env-file=.env --experimental-strip-types packages/core/src/cli/onboarding.ts
