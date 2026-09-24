# Rebuild client deliverable zip (excludes deps, build, local DB, logs)
$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Parent = Split-Path $Root -Parent
$Stamp = Get-Date -Format "yyyyMMdd_HHmmss"
$StageName = "DOST_Academy_LMS_Client_Deliverable_$Stamp"
$Stage = Join-Path $Parent $StageName
$Zip = "$Stage.zip"

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
    ".git",
    "__pycache__"
)

$excludeFiles = @(
    "database.sqlite",
    "*.log"
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

# Ensure deliverable entry points exist in stage
$required = @(
    "DELIVERABLE_README.md",
    "CLIENT_DELIVERY_README.txt",
    "setup.bat",
    "RUN_ALL.bat",
    "RUN_BACKEND.bat",
    "RUN_FRONTEND.bat",
    "RESET_DB.bat",
    "CLIENT_SETUP_AND_RUN.ps1",
    "package.json",
    "composer.json",
    "artisan",
    "src",
    "app",
    "routes",
    "database\migrations",
    "database\seeders",
    "database\dost_academy.sql",
    "init_mysql.php"
)
$missing = @()
foreach ($item in $required) {
    if (-not (Test-Path (Join-Path $Stage $item))) { $missing += $item }
}
if ($missing.Count -gt 0) {
    throw "Stage missing required items: $($missing -join ', ')"
}

Compress-Archive -Path (Join-Path $Stage "*") -DestinationPath $Zip -Force -CompressionLevel Optimal
if (-not (Test-Path $Zip) -or (Get-Item $Zip).Length -lt 10KB) {
    throw "ZIP creation failed or is empty: $Zip"
}
$sizeMb = [math]::Round((Get-Item $Zip).Length / 1MB, 2)

Write-Host "ZIP=$Zip"
Write-Host "SIZE_MB=$sizeMb"
Write-Host "STAGE=$Stage"
Write-Host "ENTRY=setup.bat then RUN_ALL.bat"
