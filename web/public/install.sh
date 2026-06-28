#!/usr/bin/env bash
set -e

COLOR_ORANGE='\033[0;33m'
COLOR_RED='\033[0;31m'
COLOR_GREEN='\033[0;32m'
COLOR_RESET='\033[0m'

echo -e "${COLOR_ORANGE}█████████████████████████████████████████${COLOR_RESET}"
echo -e "${COLOR_ORANGE}🔥 FORGING FERAL ARCHITECTURE...        ${COLOR_RESET}"
echo -e "${COLOR_ORANGE}█████████████████████████████████████████${COLOR_RESET}"

# 1. OS Compatibility Check
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
  echo -e "${COLOR_RED}✗ Windows native is not supported. Please run this in WSL (Ubuntu).${COLOR_RESET}"
  exit 1
fi

# 2. Clone the Engine
INSTALL_DIR="$HOME/.cook"
if [ -d "$INSTALL_DIR" ]; then
    echo -e "${COLOR_ORANGE}Updating existing Cook installation...${COLOR_RESET}"
    cd "$INSTALL_DIR" && git pull origin main --quiet
else
    echo -e "${COLOR_ORANGE}Cloning The Cook repository...${COLOR_RESET}"
    git clone https://github.com/priyanshu132008/cook-agent.git "$INSTALL_DIR" --quiet
fi

# 3. Install Dependencies via pnpm
echo -e "${COLOR_ORANGE}Installing dependencies...${COLOR_RESET}"
cd "$INSTALL_DIR"
touch .env # Prevents Node from crashing on initial boot
if ! command -v pnpm &> /dev/null; then
    npm install -g pnpm
fi
pnpm install --silent

# 4. Forge Global Command
echo -e "${COLOR_ORANGE}Forging global 'cook' binary...${COLOR_RESET}"
BIN_DIR="$HOME/.local/bin"
mkdir -p "$BIN_DIR"

cat << 'EOF' > "$BIN_DIR/cook"
#!/usr/bin/env bash
cd "$HOME/.cook" && node --env-file=.env --experimental-strip-types packages/cli/src/index.ts "$@"
EOF

chmod +x "$BIN_DIR/cook"

echo -e "${COLOR_GREEN}✓ Installation complete.${COLOR_RESET}"
echo -e "Add this to your ~/.zshrc or ~/.bashrc to use the command anywhere:"
echo -e "${COLOR_ORANGE}export PATH=\"\$HOME/.local/bin:\$PATH\"${COLOR_RESET}"
echo ""
echo -e "Run 'cook onboard' to initialize."