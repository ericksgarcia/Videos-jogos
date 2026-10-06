#!/bin/bash
# Instala as dependências do canal no começo de cada sessão na nuvem.
set -euo pipefail
[ "${CLAUDE_CODE_REMOTE:-}" = "true" ] || exit 0
cd "$CLAUDE_PROJECT_DIR"
[ -x node_modules/.bin/hyperframes ] || npm ci --no-audit --no-fund
python3 -c "import numpy, scipy, requests" 2>/dev/null || pip install -q -r requirements.txt
command -v ffmpeg >/dev/null || (apt-get update -qq && apt-get install -y -qq ffmpeg) || echo "aviso: ffmpeg não instalado"
