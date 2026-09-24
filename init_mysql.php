<?php
/**
 * DOST Academy LMS - MySQL Initializer
 * Connects to local MySQL on port 3306, creates database `dost_academy`, and updates .env.
 */
error_reporting(E_ALL & ~E_WARNING & ~E_NOTICE);

$hostCandidates = ['127.0.0.1', 'localhost'];
$port = 3306;
$dbName = 'dost_academy';

// Common local MySQL passwords (root empty is default for XAMPP; workbench often uses root/password)
$passwords = ['', 'root', 'password', '123456', 'admin'];

// Read existing .env if present
$envPath = __DIR__ . '/.env';
if (file_exists($envPath)) {
    $env = @parse_ini_file($envPath);
    if (!empty($env['DB_PASSWORD']) && !in_array($env['DB_PASSWORD'], $passwords)) {
        array_unshift($passwords, $env['DB_PASSWORD']);
    }
}

$connected = false;
$foundHost = '127.0.0.1';
$foundPass = '';
$lastError = '';

foreach ($hostCandidates as $h) {
    foreach ($passwords as $pwd) {
        try {
            $pdo = new PDO("mysql:host={$h};port={$port};charset=utf8mb4", 'root', $pwd, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_TIMEOUT => 4
            ]);
            $connected = true;
            $foundHost = $h;
            $foundPass = $pwd;
            break 2;
        } catch (Throwable $e) {
            $lastError = $e->getMessage();
        }
    }
}

if (!$connected) {
    fwrite(STDERR, "\n[FATAL] Unable to connect to MySQL on port 3306 with user 'root'.\n");
    fwrite(STDERR, "Error details: {$lastError}\n");
    fwrite(STDERR, "Please ensure MySQL Server or MySQL Workbench service is running on port 3306.\n\n");
    exit(1);
}

echo "[OK] Connected to MySQL on {$foundHost}:{$port} as user 'root'.\n";

// Ensure database dost_academy exists
try {
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `{$dbName}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    echo "[OK] Database `{$dbName}` created / verified.\n";
} catch (Throwable $e) {
    fwrite(STDERR, "[FATAL] Failed to create database `{$dbName}`: " . $e->getMessage() . "\n");
    exit(1);
}

// Update or generate .env with verified MySQL config
$defaultEnv = "APP_NAME=\"DOST Academy\"\n" .
    "APP_ENV=local\n" .
    "APP_KEY=\n" .
    "APP_DEBUG=true\n" .
    "APP_URL=http://localhost:8000\n\n" .
    "DB_CONNECTION=mysql\n" .
    "DB_HOST={$foundHost}\n" .
    "DB_PORT={$port}\n" .
    "DB_DATABASE={$dbName}\n" .
    "DB_USERNAME=root\n" .
    "DB_PASSWORD={$foundPass}\n\n" .
    "JWT_SECRET=\n" .
    "JWT_TTL=60\n\n" .
    "FRONTEND_URL=http://localhost:3000\n";

if (!file_exists($envPath)) {
    file_put_contents($envPath, $defaultEnv);
    echo "[OK] Created .env configured for MySQL.\n";
} else {
    $cur = file_get_contents($envPath);
    if (!preg_match('/^DB_CONNECTION=/m', $cur)) {
        $cur .= "\nDB_CONNECTION=mysql\nDB_HOST={$foundHost}\nDB_PORT={$port}\nDB_DATABASE={$dbName}\nDB_USERNAME=root\nDB_PASSWORD={$foundPass}\n";
    } else {
        $cur = preg_replace('/^DB_CONNECTION=.*$/m', 'DB_CONNECTION=mysql', $cur);
        $cur = preg_replace('/^DB_HOST=.*$/m', "DB_HOST={$foundHost}", $cur);
        $cur = preg_replace('/^DB_PORT=.*$/m', "DB_PORT={$port}", $cur);
        $cur = preg_replace('/^DB_DATABASE=.*$/m', "DB_DATABASE={$dbName}", $cur);
        $cur = preg_replace('/^DB_USERNAME=.*$/m', 'DB_USERNAME=root', $cur);
        $cur = preg_replace('/^DB_PASSWORD=.*$/m', "DB_PASSWORD={$foundPass}", $cur);
    }
    file_put_contents($envPath, $cur);
    echo "[OK] Updated .env for MySQL.\n";
}

exit(0);
