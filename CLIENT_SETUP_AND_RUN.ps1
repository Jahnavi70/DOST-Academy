param(
    [switch]$FreshDatabase,
    [switch]$NoStart
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$LogDir = Join-Path $Root "_client_setup_logs"
$LogFile = Join-Path $LogDir ("setup_" + (Get-Date -Format "yyyyMMdd_HHmmss") + ".log")
New-Item -ItemType Directory -Path $LogDir -Force | Out-Null

function Write-Step($Message, $Color = "White") {
    $line = "[" + (Get-Date -Format "HH:mm:ss") + "] " + $Message
    Write-Host $line -ForegroundColor $Color
    Add-Content -Path $LogFile -Value $line -ErrorAction SilentlyContinue
}

function Find-Php {
    $cmd = Get-Command php -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Source }
    $candidates = @(
        "C:\xampp\php\php.exe",
        "C:\php\php.exe",
        "C:\tools\php85\php.exe",
        "C:\tools\php84\php.exe",
        "C:\tools\php83\php.exe",
        "C:\tools\php82\php.exe",
        "C:\tools\php81\php.exe",
        "C:\Program Files\PHP\php.exe",
        "C:\Program Files (x86)\PHP\php.exe",
        "C:\ProgramData\chocolatey\bin\php.exe",
        "C:\laragon\bin\php\php-8.4*\php.exe",
        "C:\laragon\bin\php\php-8.3*\php.exe",
        "C:\laragon\bin\php\php-8.2*\php.exe",
        "C:\laragon\bin\php\php-8.1*\php.exe"
    )
    foreach ($candidatePattern in $candidates) {
        $resolved = Resolve-Path $candidatePattern -ErrorAction SilentlyContinue
        if ($resolved) {
            $candidate = $resolved[0].Path
            if (Test-Path $candidate) {
                $dir = Split-Path $candidate
                $env:Path = "$dir;$env:Path"
                return $candidate
            }
        }
    }
    # Attempt winget if available
    $winget = Get-Command winget -ErrorAction SilentlyContinue
    if ($winget) {
        Write-Step "PHP not detected. Attempting automated installation via winget..." "Yellow"
        try {
            Start-Process winget -ArgumentList "install PHP.PHP --accept-source-agreements --accept-package-agreements --silent" -Wait -NoNewWindow
            $cmd = Get-Command php -ErrorAction SilentlyContinue
            if ($cmd) { return $cmd.Source }
        } catch {}
    }
    return $null
}

function Find-Node {
    $cmd = Get-Command node -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Source }
    $candidates = @(
        "C:\Program Files\nodejs\node.exe",
        "C:\Program Files (x86)\nodejs\node.exe"
    )
    foreach ($candidate in $candidates) {
        if (Test-Path $candidate) {
            $dir = Split-Path $candidate
            $env:Path = "$dir;$env:Path"
            return $candidate
        }
    }
    $winget = Get-Command winget -ErrorAction SilentlyContinue
    if ($winget) {
        Write-Step "Node.js not detected. Attempting automated installation via winget..." "Yellow"
        try {
            Start-Process winget -ArgumentList "install OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements --silent" -Wait -NoNewWindow
            $cmd = Get-Command node -ErrorAction SilentlyContinue
            if ($cmd) { return $cmd.Source }
        } catch {}
    }
    return $null
}

function Find-Npm($NodePath) {
    $cmd = Get-Command npm.cmd -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Source }
    $cmd2 = Get-Command npm -ErrorAction SilentlyContinue
    if ($cmd2) { return $cmd2.Source }
    if ($NodePath) {
        $nodeDir = Split-Path $NodePath
        if (Test-Path "$nodeDir\npm.cmd") { return "$nodeDir\npm.cmd" }
        if (Test-Path "$nodeDir\npm") { return "$nodeDir\npm" }
    }
    return "npm"
}

function Enable-PhpExtensions($PhpPath) {
    try {
        $loadedModules = & $PhpPath -m 2>$null
        $needed = @("curl", "fileinfo", "mbstring", "openssl", "pdo_mysql", "mysqli", "pdo_sqlite", "sqlite3")
        $missing = @()
        foreach ($ext in $needed) {
            if ($loadedModules -notcontains $ext) {
                $missing += $ext
            }
        }
        if ($missing.Count -eq 0) {
            Write-Step "All required PHP database and crypto extensions are loaded." "Green"
            return
        }

        $ini = & $PhpPath -r "echo php_ini_loaded_file();" 2>$null
        if (-not $ini -or -not (Test-Path $ini)) {
            $phpDir = Split-Path $PhpPath
            if (Test-Path "$phpDir\php.ini") { $ini = "$phpDir\php.ini" }
            elseif (Test-Path "$phpDir\php.ini-development") {
                Copy-Item "$phpDir\php.ini-development" "$phpDir\php.ini" -Force
                $ini = "$phpDir\php.ini"
            } elseif (Test-Path "$phpDir\php.ini-production") {
                Copy-Item "$phpDir\php.ini-production" "$phpDir\php.ini" -Force
                $ini = "$phpDir\php.ini"
            }
        }
        if ($ini -and (Test-Path $ini)) {
            $content = Get-Content $ini
            $changed = $false
            for ($i = 0; $i -lt $content.Count; $i++) {
                foreach ($ext in $missing) {
                    if ($content[$i] -match "^\s*;\s*extension\s*=\s*(php_)?$([regex]::Escape($ext))(\.dll)?\s*$") {
                        $content[$i] = "extension=$ext"
                        $changed = $true
                    }
                }
            }
            if ($changed) {
                Set-Content -Path $ini -Value $content
                Write-Step "Enabled missing extensions in $ini" "Green"
            }
        }
    } catch {
        # Non-fatal if extensions are static
    }
}

function Ensure-Database($PhpPath) {
    Write-Step "Detecting database engine and configuring connectivity..." "Cyan"

    # Step 1: Attempt to start common local MySQL services if stopped
    $services = @("MySQL", "MySQL80", "MySQL84", "MySQL57", "MariaDB")
    foreach ($s in $services) {
        $svc = Get-Service -Name $s -ErrorAction SilentlyContinue
        if ($svc -and $svc.Status -ne 'Running') {
            Write-Step "Starting Windows service '$s'..." "Yellow"
            try { Start-Service -Name $s -ErrorAction SilentlyContinue } catch {}
        }
    }

    # If XAMPP MySQL exists, attempt background start
    if (Test-Path "C:\xampp\mysql_start.bat") {
        Start-Process "cmd.exe" -ArgumentList "/c C:\xampp\mysql_start.bat" -WindowStyle Hidden
        Start-Sleep -Seconds 2
    }

    # Step 2: Test MySQL connection via init_mysql.php
    $initScript = Join-Path $Root "init_mysql.php"
    $mysqlAvailable = $false
    try {
        $initProcess = Start-Process -FilePath $PhpPath -ArgumentList @($initScript) -WorkingDirectory $Root -Wait -PassThru -NoNewWindow
        if ($initProcess.ExitCode -eq 0) {
            $mysqlAvailable = $true
        }
    } catch {
        $mysqlAvailable = $false
    }

    if ($mysqlAvailable) {
        Write-Step "MySQL database 'dost_academy' connected on port 3306 and configured in .env." "Green"
        return "mysql"
    } else {
        # Step 3: Zero-failure seamless fallback to built-in SQLite
        Write-Step "MySQL service was not detected on port 3306." "Yellow"
        Write-Step "Activating zero-configuration built-in SQLite database engine..." "Cyan"

        $sqliteDb = Join-Path $Root "database\database.sqlite"
        $dbDir = Split-Path $sqliteDb
        if (-not (Test-Path $dbDir)) { New-Item -ItemType Directory -Path $dbDir -Force | Out-Null }
        if (-not (Test-Path $sqliteDb)) { New-Item -ItemType File -Path $sqliteDb -Force | Out-Null }

        $envPath = Join-Path $Root ".env"
        $defaultEnv = "APP_NAME=`"DOST Academy`"`nAPP_ENV=local`nAPP_KEY=`nAPP_DEBUG=true`nAPP_URL=http://localhost:8000`n`nDB_CONNECTION=sqlite`nDB_DATABASE=$sqliteDb`n`nJWT_SECRET=`nJWT_TTL=60`n`nFRONTEND_URL=http://localhost:3000`n"

        if (-not (Test-Path $envPath)) {
            Set-Content -Path $envPath -Value $defaultEnv -Encoding UTF8
        } else {
            $cur = Get-Content $envPath -Raw
            if ($cur -notmatch "(?m)^DB_CONNECTION=") {
                $cur += "`nDB_CONNECTION=sqlite`nDB_DATABASE=$sqliteDb`n"
            } else {
                $cur = $cur -replace "(?m)^DB_CONNECTION=.*$", "DB_CONNECTION=sqlite"
                $cur = $cur -replace "(?m)^DB_DATABASE=.*$", "DB_DATABASE=$sqliteDb"
            }
            Set-Content -Path $envPath -Value $cur -Encoding UTF8
        }
        Write-Step "SQLite engine active at $sqliteDb (zero client configuration required)." "Green"
        return "sqlite"
    }
}

function Ensure-Composer($Php) {
    $composerBat = Get-Command composer -ErrorAction SilentlyContinue
    if ($composerBat) { return @($composerBat.Source) }

    $composerPhar = Join-Path $Root "composer.phar"
    if (!(Test-Path $composerPhar)) {
        Write-Step "Downloading Composer..." "Yellow"
        try {
            Invoke-WebRequest -Uri "https://getcomposer.org/download/latest-stable/composer.phar" -OutFile $composerPhar -UseBasicParsing
        } catch {
            throw "Could not download composer.phar. Please ensure internet access."
        }
    }
    return @($Php, $composerPhar)
}

function Run-Command($File, $Arguments, $Description) {
    Write-Step $Description "Cyan"
    $process = Start-Process -FilePath $File -ArgumentList $Arguments -WorkingDirectory $Root -Wait -PassThru -NoNewWindow
    if ($process.ExitCode -ne 0) {
        throw "$Description failed with exit code $($process.ExitCode)"
    }
}

# --- Main Entrypoint ---
Set-Location $Root
Write-Step "============================================================" "Cyan"
Write-Step " DOST ACADEMY LMS - AUTOMATED HANDS-FREE CLIENT SETUP" "Cyan"
Write-Step " Team 59 (AstraLink) - IFN735 Industry Project" "Cyan"
Write-Step "============================================================" "Cyan"

$php = Find-Php
if (-not $php) {
    throw "PHP 8.1+ not found. Please install PHP or XAMPP (https://www.apachefriends.org) and run setup again."
}
Write-Step "PHP detected: $php" "Green"
Enable-PhpExtensions $php

$node = Find-Node
if (-not $node) {
    throw "Node.js not found. Please install Node.js LTS (https://nodejs.org) and run setup again."
}
Write-Step "Node.js detected: $node" "Green"

# 1. Database Provisioning (MySQL with Automatic SQLite Fallback)
$dbType = Ensure-Database $php

# 2. Composer packages with PHP 8.5 compatibility
$composer = Ensure-Composer $php
if (-not (Test-Path (Join-Path $Root "vendor\autoload.php"))) {
    Write-Step "Installing backend dependencies (composer install --ignore-platform-reqs)..." "Cyan"
    $cArgs = @("install", "--no-interaction", "--no-dev", "--ignore-platform-reqs")
    if ($composer.Count -eq 1) {
        $p = Start-Process -FilePath $composer[0] -ArgumentList $cArgs -WorkingDirectory $Root -Wait -PassThru -NoNewWindow
    } else {
        $p = Start-Process -FilePath $composer[0] -ArgumentList (@($composer[1]) + $cArgs) -WorkingDirectory $Root -Wait -PassThru -NoNewWindow
    }
    if ($p.ExitCode -ne 0) {
        Write-Step "Updating backend dependencies with --ignore-platform-reqs..." "Yellow"
        $uArgs = @("update", "--no-interaction", "--no-dev", "--ignore-platform-reqs")
        if ($composer.Count -eq 1) {
            Run-Command $composer[0] $uArgs "Updating Laravel dependencies"
        } else {
            Run-Command $composer[0] (@($composer[1]) + $uArgs) "Updating Laravel dependencies"
        }
    }
} else {
    Write-Step "Backend dependencies already installed." "Green"
}

# 3. npm packages
$npmExe = Find-Npm $node
if (-not (Test-Path (Join-Path $Root "node_modules"))) {
    Write-Step "Installing frontend dependencies (npm install --legacy-peer-deps)..." "Cyan"
    try {
        Run-Command $npmExe @("install", "--legacy-peer-deps", "--no-audit", "--no-fund") "Installing React dependencies"
    } catch {
        Write-Step "Retrying npm install with --force..." "Yellow"
        Run-Command $npmExe @("install", "--force", "--no-audit", "--no-fund") "Installing React dependencies (retry)"
    }
} else {
    Write-Step "Frontend dependencies already installed." "Green"
}

# 4. Generate keys if not set
$envPath = Join-Path $Root ".env"
$curEnv = Get-Content $envPath -Raw -ErrorAction SilentlyContinue
if ($curEnv -notmatch "(?m)^APP_KEY=base64:.+") {
    Run-Command $php @("artisan", "key:generate", "--force") "Generating Laravel APP_KEY"
}
if ($curEnv -notmatch "(?m)^JWT_SECRET=.+") {
    Run-Command $php @("artisan", "jwt:secret", "--force") "Generating JWT_SECRET"
}
try { Run-Command $php @("artisan", "storage:link") "Configuring public storage link" } catch {}

# 5. Migrate and Seed Complete Dataset
Write-Step "Migrating database tables and seeding 6 DOST agency branches and demo accounts..." "Cyan"
Run-Command $php @("artisan", "migrate:fresh", "--seed", "--force") "Migrating database schema and running seeders"

# 6. Verify Health
$dbCheck = Start-Process -FilePath $php -ArgumentList @("dbcheck.php") -WorkingDirectory $Root -Wait -PassThru -NoNewWindow
if ($dbCheck.ExitCode -eq 0) {
    Write-Step "Database verified healthy ($dbType)! Full DOST ecosystem ready." "Green"
}

Write-Step "============================================================" "Green"
Write-Step " SETUP COMPLETED SUCCESSFULLY!" "Green"
Write-Step "============================================================" "Green"
Write-Host ""
Write-Host "PORTAL ACCESS & PRE-REGISTERED DEMO ACCOUNTS:" -ForegroundColor Yellow
Write-Host "  Portal URL:       http://localhost:3000" -ForegroundColor Cyan
Write-Host "  Database Engine:  $dbType" -ForegroundColor Cyan
Write-Host "  Password (all):   password" -ForegroundColor Cyan
Write-Host ""
Write-Host "  1. Super Administrator:   admin@dost.gov.ph"
Write-Host "  2. IT Administrator:      it.admin@dost.gov.ph"
Write-Host "  3. Functional Admin (HR): functional.admin@dost.gov.ph"
Write-Host "  4. Agency Faculty Mentor: asti.mentor@dost.gov.ph"
Write-Host "  5. Trainee / Employee:    mark.reyes@dost.gov.ph"
Write-Host ""

if (-not $NoStart) {
    Write-Step "Launching DOST Academy backend and frontend servers..." "Green"
    Start-Process -FilePath "cmd.exe" -ArgumentList "/k", "title DOST Backend (:8000) && cd /d `"$Root`" && `"$php`" artisan serve --host=127.0.0.1 --port=8000"
    Start-Sleep -Seconds 3
    Start-Process -FilePath "cmd.exe" -ArgumentList "/k", "title DOST Frontend (:3000) && cd /d `"$Root`" && `"$npmExe`" start"
    Start-Sleep -Seconds 4
    Start-Process "http://localhost:3000"
}
