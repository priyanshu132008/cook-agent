#!/usr/bin/env bash
set -e

echo -e "\033[38;5;202m🔥 BOOTING COOK AGENT INSTALLER...\033[0m"

# 1. Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v22+."
    exit 1
fi

# 2. Check for pnpm
if ! command -v pnpm &> /dev/null; then
    echo "⚠️ pnpm not found. Installing globally via npm..."
    npm install -g pnpm
fi

# 3. Install dependencies
echo -e "\033[32m✅ System dependencies verified. Installing packages...\033[0m"
pnpm install

# 4. Create blank .env if it doesn't exist
if [ ! -f .env ]; then
    touch .env
fi

# 4b. Bootstrap the user-scoped Telegram auth store at ~/.cook/memory/.
#     Pre-creating the directory + default tg_auth.json means a brand-new
#     install hits a working file the moment `cook daemon:start` boots the
#     polling loop, with no read-on-empty-file race.
COOK_AUTH_DIR="$HOME/.cook/memory"
mkdir -p "$COOK_AUTH_DIR"
if [ ! -f "$COOK_AUTH_DIR/tg_auth.json" ]; then
    printf '{"allowedIds":[],"pending":{}}\n' > "$COOK_AUTH_DIR/tg_auth.json"
fi

# 5. Launch the Onboarding Configurator
echo -e "\033[32m✅ Packages installed. Launching System Calibration...\033[0m\n"
node --env-file=.env --experimental-strip-types packages/core/src/cli/onboarding.ts
