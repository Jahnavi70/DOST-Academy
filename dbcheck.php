<?php
// DB health check: exit 0 = healthy (users table has rows), exit 1 = needs seed/repair
try {
    $env = @parse_ini_file(__DIR__ . '/.env');
    $conn = $env['DB_CONNECTION'] ?? 'mysql';
    if ($conn === 'mysql') {
        $host = $env['DB_HOST'] ?? '127.0.0.1';
        $port = $env['DB_PORT'] ?? '3306';
        $database = $env['DB_DATABASE'] ?? 'dost_academy';
        $username = $env['DB_USERNAME'] ?? 'root';
        $password = $env['DB_PASSWORD'] ?? '';
        $db = new PDO("mysql:host={$host};port={$port};dbname={$database}", $username, $password);
    } else {
        $db = new PDO('sqlite:' . __DIR__ . '/database/database.sqlite');
    }
    $n = $db->query("SELECT COUNT(*) FROM users")->fetchColumn();
    exit($n > 0 ? 0 : 1);
} catch (Throwable $e) {
    exit(1);
}
