# Bootstrap local data files (PowerShell)
# Copies example JSON into backend/data/ when the real files are missing.

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$dataDir = Join-Path $root "backend\data"

New-Item -ItemType Directory -Force -Path $dataDir | Out-Null

$pairs = @(
  @("offers.example.json", "offers.json"),
  @("qr_destinations.example.json", "qr_destinations.json")
)

foreach ($pair in $pairs) {
  $src = Join-Path $dataDir $pair[0]
  $dst = Join-Path $dataDir $pair[1]
  if (-not (Test-Path $dst)) {
    Copy-Item $src $dst
    Write-Host "Created $dst from $($pair[0])"
  } else {
    Write-Host "Skipped $dst (already exists)"
  }
}

Write-Host "Data bootstrap complete."
