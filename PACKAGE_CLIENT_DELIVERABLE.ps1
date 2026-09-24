# DOST Academy LMS - Packaging Script for Client Submission
# Packages full source code, scripts, assets, and verified Git history while excluding temporary artifacts
param(
    [switch]$IncludeGit = $true
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Parent = Split-Path $Root -Parent
$Stamp = Get-Date -Format "yyyyMMdd_HHmmss"
$StageName = "DOST_Academy_LMS_Client_Deliverable_$Stamp"
$Stage = Join-Path $Parent $StageName
$Zip = "$Stage.zip"

Write-Host "Creating clean staging directory: $Stage" -ForegroundColor Cyan
if (Test-Path $Stage) { Remove-Item -Recurse -Force $Stage }
if (Test-Path $Zip) { Remove-Item -Force $Zip }

New-Item -ItemType Directory -Path $Stage -Force | Out-Null

$excludeDirs = @(
    "node_modules",
    "vendor",
    "build",
    "_client_setup_logs",
    "_setup_logs",
    "_logs",
    "test_artifacts",
    "test-results",
    "playwright-report",
    "__pycache__",
    ".cache"
)
if (-not $IncludeGit) {
    $excludeDirs += ".git"
}

$excludeFiles = @(
    "database.sqlite",
    "*.log",
    "Thumbs.db",
    ".DS_Store"
)

$robocopyArgs = @(
    $Root,
    $Stage,
    "/E",
    "/XD"
) + $excludeDirs + @(
    "/XF"
) + $excludeFiles + @(
    "/NFL",
    "/NDL",
    "/NJH",
    "/NJS",
    "/NP"
)

& robocopy @robocopyArgs | Out-Null
$exit = $LASTEXITCODE
if ($exit -gt 7) {
    throw "robocopy failed with exit code $exit"
}

# Ensure all essential submission entry points exist in the stage
$required = @(
    "DELIVERABLE_README.md",
    "CLIENT_DELIVERY_README.txt",
    "README.md",
    "MANUAL_DEMONSTRATION_FLOW_SCRIPT.md",
    "setup.bat",
    "RUN_ALL.bat",
    "RUN_BACKEND.bat",
    "RUN_FRONTEND.bat",
    "RESET_DB.bat",
    "CLIENT_SETUP_AND_RUN.bat",
    "CLIENT_SETUP_AND_RUN.ps1",
    "package.json",
    "composer.json",
    "composer.phar",
    "artisan",
    "init_mysql.php",
    "dbcheck.php",
    "src",
    "app",
    "public\assets",
    "routes",
    "database\migrations",
    "database\seeders",
    "database\dost_academy.sql"
)
$missing = @()
foreach ($item in $required) {
    if (-not (Test-Path (Join-Path $Stage $item))) { $missing += $item }
}
if ($missing.Count -gt 0) {
    throw "Stage missing required items: $($missing -join ', ')"
}

Write-Host "Compressing stage into client deliverable ZIP..." -ForegroundColor Cyan
Compress-Archive -Path (Join-Path $Stage "*") -DestinationPath $Zip -Force -CompressionLevel Optimal
if (-not (Test-Path $Zip) -or (Get-Item $Zip).Length -lt 10KB) {
    throw "ZIP creation failed or is empty: $Zip"
}

# Also create the standardized latest submission zip
$StandardZip = Join-Path $Parent "DOST_Academy_LMS_Complete_Client_Deliverable_Final_20261018.zip"
Copy-Item $Zip $StandardZip -Force

$sizeMb = [math]::Round((Get-Item $Zip).Length / 1MB, 2)

Write-Host "============================================================" -ForegroundColor Green
Write-Host " CLIENT DELIVERABLE PACKAGE CREATED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host "  Timestamped ZIP:  $Zip" -ForegroundColor Yellow
Write-Host "  Standardized ZIP: $StandardZip" -ForegroundColor Yellow
Write-Host "  Archive Size:     $sizeMb MB" -ForegroundColor Yellow
Write-Host "  Staged Folder:    $Stage" -ForegroundColor Yellow
Write-Host "  Entry Point:      setup.bat -> RUN_ALL.bat" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Green
