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

# Bootstrap the user-scoped Telegram auth store at ~/.cook/memory/ so a
# brand-new install hits a working tg_auth.json the moment the daemon
# starts polling, with no read-on-empty-file race.
$cookAuthDir = Join-Path $env:USERPROFILE ".cook\memory"
if (-not (Test-Path $cookAuthDir)) {
    New-Item -ItemType Directory -Path $cookAuthDir -Force | Out-Null
}
$cookAuthFile = Join-Path $cookAuthDir "tg_auth.json"
if (-not (Test-Path $cookAuthFile)) {
    '{"allowedIds":[],"pending":{}}' | Set-Content -Path $cookAuthFile -Encoding UTF8
}

Write-Host "✅ Packages installed. Launching System Calibration...`n" -ForegroundColor Green
node --env-file=.env --experimental-strip-types packages/core/src/cli/onboarding.ts
