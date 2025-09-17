param(
  [switch]$Build
)

if ($Build) {
  Write-Host "Building TypeScript..."
  npm run build
}

Write-Host "Starting mock_mcp server (built)..."
node --enable-source-maps "$PSScriptRoot/../dist/src/server.js"
