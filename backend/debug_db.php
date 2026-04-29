<?php
$host = '127.0.0.1';
$port = '3307';
$user = 'root';
$pass = '';

try {
    $pdo = new PDO("mysql:host=$host;port=$port", $user, $pass);
    $pdo->exec("USE bistroflow_saas");
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "TABLES FOUND: " . implode(', ', $tables) . "\n";
} catch (PDOException $e) {
    die("DB ERROR: " . $e->getMessage());
}
