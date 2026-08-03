<?php
// Invalida o desbloqueio no servidor assim que o admin clica em "Trancar
// agora" — não espera os 15 minutos de inatividade acabarem.
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
session_start();
unset($_SESSION['admin_unlocked_at']);
echo json_encode(['ok' => true]);
