<?php
// Valida o PIN do cadeado do admin no servidor — a checagem que decide de
// verdade é esta, não a do JavaScript (que só evita clique acidental).
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
$bloqueadoAte = $_SESSION['pin_bloqueado_ate'] ?? 0;

if ($bloqueadoAte > $agora) {
    respond([
        'ok' => false,
        'bloqueado' => true,
        'segundosRestantes' => $bloqueadoAte - $agora,
        'erro' => 'Muitas tentativas erradas. Aguarde antes de tentar de novo.',
    ], 429);
}

$corpo = json_decode(file_get_contents('php://input'), true);
$pinRecebido = is_array($corpo) ? ($corpo['pin'] ?? '') : '';

if (!is_string($pinRecebido) || !preg_match('/^\d{4}$/', $pinRecebido)) {
    respond(['ok' => false, 'erro' => 'PIN inválido.'], 400);
}

// TODO: substituir por verificação de role no servidor. Hoje qualquer
// sessão que acerte o PIN vira "admin" — quando existir login de verdade
// com contas/perfis, troque esta checagem por sessão de usuário autenticado
// com role=admin, e mantenha o PIN só como confirmação extra de UX.
$config = require __DIR__ . '/admin-config.php';
$pinCorreto = hash_equals((string) $config['admin_pin'], $pinRecebido);

if ($pinCorreto) {
    unset($_SESSION['pin_tentativas'], $_SESSION['pin_bloqueado_ate']);
    $_SESSION['admin_unlocked_at'] = $agora;
    respond(['ok' => true]);
}

$_SESSION['pin_tentativas'] = ($_SESSION['pin_tentativas'] ?? 0) + 1;

if ($_SESSION['pin_tentativas'] >= MAX_TENTATIVAS) {
    $_SESSION['pin_bloqueado_ate'] = $agora + BLOQUEIO_SEGUNDOS;
    $_SESSION['pin_tentativas'] = 0;
    respond([
        'ok' => false,
        'bloqueado' => true,
        'segundosRestantes' => BLOQUEIO_SEGUNDOS,
        'erro' => 'PIN incorreto. Muitas tentativas — aguarde 60 segundos.',
    ], 429);
}

respond([
    'ok' => false,
    'bloqueado' => false,
    'tentativasRestantes' => MAX_TENTATIVAS - $_SESSION['pin_tentativas'],
    'erro' => 'PIN incorreto.',
]);
