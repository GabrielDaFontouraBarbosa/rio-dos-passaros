<?php
// Valida usuário/senha do admin no servidor — antes disso a checagem vivia
// só no JavaScript (js/script-login.js), com as credenciais visíveis pra
// qualquer um que abrisse "ver código-fonte".
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
session_start();

const MAX_TENTATIVAS = 5;
const BLOQUEIO_SEGUNDOS = 60;

function respond(array $dados, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($dados);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(['ok' => false, 'erro' => 'Método não permitido.'], 405);
}

$agora = time();
$bloqueadoAte = $_SESSION['login_bloqueado_ate'] ?? 0;

if ($bloqueadoAte > $agora) {
    respond([
        'ok' => false,
        'bloqueado' => true,
        'segundosRestantes' => $bloqueadoAte - $agora,
        'erro' => 'Muitas tentativas erradas. Aguarde antes de tentar de novo.',
    ], 429);
}

$corpo = json_decode(file_get_contents('php://input'), true);
$userRecebido = is_array($corpo) ? ($corpo['user'] ?? '') : '';
$passRecebido = is_array($corpo) ? ($corpo['pass'] ?? '') : '';

if (!is_string($userRecebido) || !is_string($passRecebido) || $userRecebido === '' || $passRecebido === '') {
    respond(['ok' => false, 'erro' => 'Usuário e senha são obrigatórios.'], 400);
}

$config = require __DIR__ . '/admin-config.php';
$userCorreto = hash_equals((string) $config['admin_user'], $userRecebido);
$passCorreto = hash_equals((string) $config['admin_pass'], $passRecebido);

if ($userCorreto && $passCorreto) {
    unset($_SESSION['login_tentativas'], $_SESSION['login_bloqueado_ate']);
    $_SESSION['admin_logged_in_at'] = $agora;
    respond(['ok' => true]);
}

$_SESSION['login_tentativas'] = ($_SESSION['login_tentativas'] ?? 0) + 1;

if ($_SESSION['login_tentativas'] >= MAX_TENTATIVAS) {
    $_SESSION['login_bloqueado_ate'] = $agora + BLOQUEIO_SEGUNDOS;
    $_SESSION['login_tentativas'] = 0;
    respond([
        'ok' => false,
        'bloqueado' => true,
        'segundosRestantes' => BLOQUEIO_SEGUNDOS,
        'erro' => 'Usuário ou senha incorretos. Muitas tentativas — aguarde 60 segundos.',
    ], 429);
}

respond([
    'ok' => false,
    'bloqueado' => false,
    'erro' => 'Usuário ou senha incorretos.',
]);
