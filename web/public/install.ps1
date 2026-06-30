# Cook Agent — Native Windows Installer
# "Let Him Cook" — lethimcook.in
# Generates native .cmd / .ps1 wrappers via npm so `cook` works in any PowerShell.

$ErrorActionPreference = 'Stop'

function Write-Banner {
    param([string]$Message, [string]$Color = 'DarkYellow')
    Write-Host ""
    Write-Host $Message -ForegroundColor $Color
    Write-Host ""
}

Write-Banner "🔥 BOOTING COOK AGENT INSTALLER (NATIVE WINDOWS)..." 'DarkYellow'

# 1. Check for Node.js v22+
$nodeCmd = Get-Command "node" -ErrorAction SilentlyContinue
if (-not $nodeCmd) {
    Write-Host "❌ Node.js is not installed. Please install Node.js v22+ from https://nodejs.org" -ForegroundColor Red
    exit 1
}

$nodeVersion = (& node --version) -replace '^v', ''
$nodeMajor = [int]($nodeVersion.Split('.')[0])
if ($nodeMajor -lt 22) {
    Write-Host "❌ Node.js v22+ is required. Detected: v$nodeVersion" -ForegroundColor Red
    exit 1
}

# 2. Check for npm (bundled with Node, but verify)
if (-not (Get-Command "npm" -ErrorAction SilentlyContinue)) {
    Write-Host "❌ npm is not available. Reinstall Node.js v22+ to get npm." -ForegroundColor Red
    exit 1
}

# 3. Install pnpm if missing (npm CLI fallback)
if (-not (Get-Command "pnpm" -ErrorAction SilentlyContinue)) {
    Write-Banner "⚠️  pnpm not found. Installing globally via npm..." 'Yellow'
    npm install -g pnpm | Out-Null
}

# 4. Clone or update the cook-agent repo into %USERPROFILE%\.cook-agent
$installDir = Join-Path $env:USERPROFILE ".cook-agent"
$repoUrl = "https://github.com/priyanshu132008/cook-agent.git"

if (Test-Path $installDir) {
    Write-Banner "📦 Existing install found. Pulling latest..." 'Cyan'
    Push-Location $installDir
    try {
        git pull --ff-only 2>$null | Out-Null
    } catch {
        Write-Host "⚠️  git pull failed — continuing with existing copy." -ForegroundColor Yellow
    }
    Pop-Location
} else {
    Write-Banner "📦 Cloning cook-agent to $installDir ..." 'Cyan'
    git clone $repoUrl $installDir
}

# 5. Install dependencies
Write-Banner "✅ System dependencies verified. Installing packages..." 'Green'
Push-Location $installDir
try {
    if (Test-Path "pnpm-lock.yaml") {
        pnpm install
    } else {
        npm ci
    }
} finally {
    Pop-Location
}

# 6. Globally link the CLI package.
# npm/pnpm linking is what creates the native `cook.cmd` + `cook.ps1` wrappers
# in %AppData%\npm — which is what makes `cook` resolve from any PowerShell session.
$cliDir = Join-Path $installDir "packages\cli"
if (Test-Path $cliDir) {
    Write-Banner "🔗 Linking global `cook` command (generating .cmd / .ps1 wrappers)..." 'Cyan'
    Push-Location $cliDir
    try {
        if (Test-Path "package.json") {
            $pkg = Get-Content "package.json" -Raw | ConvertFrom-Json
            if ($pkg.bin) {
                npm link
            } else {
                npm install -g .
            }
        } else {
            npm install -g .
        }
    } finally {
        Pop-Location
    }
} else {
    Write-Host "⚠️  packages\cli not found in $installDir — skipping global link." -ForegroundColor Yellow
}

# 7. Blank .env if missing
if (-not (Test-Path (Join-Path $installDir ".env"))) {
    New-Item -ItemType File -Path (Join-Path $installDir ".env") -Force | Out-Null
}

# 8. FERAL ORANGE SUCCESS BANNER
Write-Host ""
Write-Host "  ██████╗ ██████╗  ██████╗ ██╗  ██╗" -ForegroundColor DarkYellow -NoNewline
Write-Host ""
Write-Host " ██╔════╝ ██╔══██╗██╔═══██╗██║ ██╔╝" -ForegroundColor DarkYellow -NoNewline
Write-Host ""
Write-Host " ██║      ██████╔╝██║   ██║█████╔╝ " -ForegroundColor DarkYellow -NoNewline
Write-Host ""
Write-Host " ██║      ██╔══██╗██║   ██║██╔═██╗ " -ForegroundColor DarkYellow -NoNewline
Write-Host ""
Write-Host " ╚██████╗ ██║  ██║╚██████╔╝██║  ██╗" -ForegroundColor DarkYellow -NoNewline
Write-Host ""
Write-Host "  ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝" -ForegroundColor DarkYellow -NoNewline
Write-Host ""
Write-Host ""
Write-Host "🔥 LET HIM COOK — Cook Agent v1 installed natively on Windows." -ForegroundColor DarkYellow
Write-Host ""
Write-Host "  ➜  Open a new PowerShell window and type:" -ForegroundColor White
Write-Host ""
Write-Host "       cook" -ForegroundColor Magenta
Write-Host ""
Write-Host "  The native `cook` command is now in your PATH." -ForegroundColor Gray
Write-Host "  If Windows complains, restart PowerShell so the PATH refreshes." -ForegroundColor Gray
Write-Host ""
Write-Host "🦊 lethimcook.in" -ForegroundColor DarkYellow
Write-Host ""
