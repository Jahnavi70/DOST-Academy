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
        "C:\tools\php85\php.exe",
        "C:\tools\php84\php.exe",
        "C:\tools\php83\php.exe",
        "C:\tools\php82\php.exe",
        "C:\tools\php81\php.exe",
        "C:\xampp\php\php.exe",
        "C:\php\php.exe",
        "C:\ProgramData\chocolatey\bin\php.exe"
    )
    foreach ($candidate in $candidates) {
        if (Test-Path $candidate) {
            $dir = Split-Path $candidate
            $env:Path = "$dir;$env:Path"
            return $candidate
        }
    }
    # Attempt winget if available
    $winget = Get-Command winget -ErrorAction SilentlyContinue
    if ($winget) {
        Write-Step "PHP not found. Attempting automated installation via winget..." "Yellow"
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
        Write-Step "Node.js not found. Attempting automated installation via winget..." "Yellow"
        try {
            Start-Process winget -ArgumentList "install OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements --silent" -Wait -NoNewWindow
            $cmd = Get-Command node -ErrorAction SilentlyContinue
            if ($cmd) { return $cmd.Source }
        } catch {}
    }
    return $null
}

function Enable-PhpExtensions($PhpPath) {
    try {
        $loadedModules = & $PhpPath -m 2>$null
        $needed = @()
        foreach ($ext in @("curl", "fileinfo", "mbstring", "openssl", "pdo_mysql", "mysqli")) {
            if ($loadedModules -notcontains $ext) {
                $needed += $ext
            }
        }
        if ($needed.Count -eq 0) {
            Write-Step "All required PHP extensions are already loaded." "Green"
            return
        }

        $ini = & $PhpPath -r "echo php_ini_loaded_file();" 2>$null
        if (-not $ini -or -not (Test-Path $ini)) {
            $phpDir = Split-Path $PhpPath
            if (Test-Path "$phpDir\php.ini") { $ini = "$phpDir\php.ini" }
            elseif (Test-Path "$phpDir\php.ini-development") {
                Copy-Item "$phpDir\php.ini-development" "$phpDir\php.ini" -Force
                $ini = "$phpDir\php.ini"
            }
        }
        if ($ini -and (Test-Path $ini)) {
            $content = Get-Content $ini
            $changed = $false
            for ($i = 0; $i -lt $content.Count; $i++) {
                foreach ($ext in $needed) {
                    if ($content[$i] -match "^\s*;\s*extension\s*=\s*(php_)?$([regex]::Escape($ext))(\.dll)?\s*$") {
                        $content[$i] = "extension=$ext"
                        $changed = $true
                    }
                }
            }
            if ($changed) {
                Set-Content -Path $ini -Value $content
                Write-Step "Enabled extensions ($($needed -join ', ')) in $ini" "Green"
            }
        }
    } catch {
        # Non-fatal if extensions are already present
    }
}

function Ensure-MySQL($PhpPath) {
    Write-Step "Configuring MySQL Database Connection..." "Cyan"

    # If local MySQL service is stopped, try starting common Windows MySQL services
    $services = @("MySQL", "MySQL80", "MySQL84", "MariaDB")
    foreach ($s in $services) {
        $svc = Get-Service -Name $s -ErrorAction SilentlyContinue
        if ($svc -and $svc.Status -ne 'Running') {
            Write-Step "Starting Windows service '$s'..." "Yellow"
            try { Start-Service -Name $s -ErrorAction SilentlyContinue } catch {}
        }
    }

    # If XAMPP MySQL exists, try starting it
    if (Test-Path "C:\xampp\mysql_start.bat") {
        Start-Process "cmd.exe" -ArgumentList "/c C:\xampp\mysql_start.bat" -WindowStyle Hidden
        Start-Sleep -Seconds 2
    }

    # Execute standalone init_mysql.php (handles probing credentials and creating dost_academy database)
    $initScript = Join-Path $Root "init_mysql.php"
    $initProcess = Start-Process -FilePath $PhpPath -ArgumentList @($initScript) -WorkingDirectory $Root -Wait -PassThru -NoNewWindow
    if ($initProcess.ExitCode -ne 0) {
        throw "MySQL connection failed. Please ensure MySQL Server or MySQL Workbench service is running on port 3306."
    }
    Write-Step "MySQL database 'dost_academy' verified and configured in .env." "Green"
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
Write-Step " DOST ACADEMY LMS - AUTOMATED HANDS-FREE SETUP" "Cyan"
Write-Step "============================================================" "Cyan"

$php = Find-Php
if (-not $php) {
    throw "PHP 8.1+ not found. Please install PHP (or XAMPP) and run setup again."
}
Write-Step "PHP detected: $php" "Green"
Enable-PhpExtensions $php

$node = Find-Node
if (-not $node) {
    throw "Node.js not found. Please install Node.js LTS (https://nodejs.org) and run setup again."
}
Write-Step "Node detected: $node" "Green"

# 1. Enforce MySQL (no SQLite fallback)
Ensure-MySQL $php

# 2. Composer packages with PHP 8.5 compatibility
$composer = Ensure-Composer $php
if (-not (Test-Path (Join-Path $Root "vendor\autoload.php"))) {
    Write-Step "Installing backend Composer packages (with --ignore-platform-reqs)..." "Cyan"
    $cArgs = @("install", "--no-interaction", "--no-dev", "--ignore-platform-reqs")
    if ($composer.Count -eq 1) {
        $p = Start-Process -FilePath $composer[0] -ArgumentList $cArgs -WorkingDirectory $Root -Wait -PassThru -NoNewWindow
    } else {
        $p = Start-Process -FilePath $composer[0] -ArgumentList (@($composer[1]) + $cArgs) -WorkingDirectory $Root -Wait -PassThru -NoNewWindow
    }
    if ($p.ExitCode -ne 0) {
        Write-Step "composer install encountered lock mismatch, running composer update with --ignore-platform-reqs..." "Yellow"
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
if (-not (Test-Path (Join-Path $Root "node_modules"))) {
    Write-Step "Installing frontend npm packages..." "Cyan"
    Run-Command "npm.cmd" @("install") "Installing React dependencies"
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

# 5. Migrate and Seed Single Administrator on MySQL
Write-Step "Migrating MySQL schema and seeding Administrator..." "Cyan"
Run-Command $php @("artisan", "migrate:fresh", "--seed", "--force") "Migrating database tables on MySQL"

# 6. Verify Health
$dbCheck = Start-Process -FilePath $php -ArgumentList @("dbcheck.php") -WorkingDirectory $Root -Wait -PassThru -NoNewWindow
if ($dbCheck.ExitCode -eq 0) {
    Write-Step "MySQL database verified! Administrator pre-registered." "Green"
}

Write-Step "============================================================" "Green"
Write-Step " SETUP COMPLETED SUCCESSFULLY!" "Green"
Write-Step "============================================================" "Green"
Write-Host ""
Write-Host "PORTAL ACCESS & PRE-REGISTERED ACCOUNT:" -ForegroundColor Yellow
Write-Host "  URL:      http://localhost:3000" -ForegroundColor Cyan
Write-Host "  Database: MySQL (dost_academy on 127.0.0.1:3306)" -ForegroundColor Cyan
Write-Host "  Role:     System Administrator"
Write-Host "  Email:    admin@dost.gov.ph"
Write-Host "  Password: password"
Write-Host ""

if (-not $NoStart) {
    Write-Step "Launching DOST Academy backend and frontend servers..." "Green"
    Start-Process -FilePath "cmd.exe" -ArgumentList "/k", "title DOST Backend (:8000) && cd /d `"$Root`" && `"$php`" artisan serve --host=127.0.0.1 --port=8000"
    Start-Sleep -Seconds 3
    Start-Process -FilePath "cmd.exe" -ArgumentList "/k", "title DOST Frontend (:3000) && cd /d `"$Root`" && npm.cmd start"
    Start-Sleep -Seconds 3
    Start-Process "http://localhost:3000"
}
