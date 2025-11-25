<?php
session_start();
require 'config.php';

$request_uri = $_SERVER['REQUEST_URI'];
$uri = ltrim(strtok($request_uri, '?'), '/');

// Rutas públicas (no requieren autenticación)
$public_routes = [
    'login' => '/templates/login.html',
    'home' => '/templates/home.html',
];

// Rutas protegidas (requieren autenticación)
$protected_routes = [
    'dashboard' => '/templates/dashboard.html',
    'admin' => '/templates/admin.html',
    'profile' => '/templates/profile.html',
    'settings' => '/templates/settings.html',
];

if (empty($uri)) {
    $uri = 'home';
}

// Verificar si es una ruta protegida
if (array_key_exists($uri, $protected_routes)) {
    // Verificar si el usuario está autenticado
    if (!isset($_SESSION['user_id'])) {
        // Redirigir al login si no está autenticado
        header('Location: /login');
        exit;
    }
    
    // Usuario autenticado, redirigir a la vista protegida
    header('Location: ' . $protected_routes[$uri]);
    exit;
}

// Verificar si es una ruta pública
if (array_key_exists($uri, $public_routes)) {
    header('Location: ' . $public_routes[$uri]);
    exit;
}

// Ruta no encontrada
http_response_code(404);
echo "Error 404: Ruta no encontrada";
exit;
?>