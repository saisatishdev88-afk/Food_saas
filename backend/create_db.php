<?php
$host = '127.0.0.1';
$port = '3307';
$user = 'root';
$pass = '';

try {
    $pdo = new PDO("mysql:host=$host;port=$port", $user, $pass);
    $pdo->exec("DROP DATABASE IF EXISTS bistroflow_saas");
    $pdo->exec("CREATE DATABASE bistroflow_saas");
    echo "Database bistroflow_saas dropped and recreated successfully on port 3307.\n";
} catch (PDOException $e) {
    die("DB ERROR: " . $e->getMessage());
}
