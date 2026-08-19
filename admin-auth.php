<?php
// Checagem compartilhada pelos endpoints do admin.
declare(strict_types=1);

const DESBLOQUEIO_DURACAO_SEGUNDOS = 900; // 15 minutos — cadeado do PIN, para salvar
const LOGIN_DURACAO_SEGUNDOS = 28800; // 8 horas — sessão de login, para visualizar

// Confirma que a sessão passou pelo PIN nos últimos 15 minutos. Usado pelos
// endpoints que GRAVAM dados sensíveis (métricas, preços).
function exigirAdminDesbloqueado(): void
{
    session_start();
    $desbloqueadoEm = $_SESSION['admin_unlocked_at'] ?? 0;
    $expirado = (time() - $desbloqueadoEm) > DESBLOQUEIO_DURACAO_SEGUNDOS;

    if (!$desbloqueadoEm || $expirado) {
        http_response_code(403);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['ok' => false, 'erro' => 'Cadeado trancado. Destranque com o PIN antes de salvar.']);
        exit;
    }

    // janela de inatividade rola a cada ação autenticada com sucesso
    $_SESSION['admin_unlocked_at'] = time();
}

// Confirma que o usuário passou pelo login (usuário+senha) nas últimas 8h.
// Usado pelos endpoints que só LEEM dados do admin (ex.: mensagens de contato).
function estaLogado(): bool
{
    session_start();
    $logadoEm = $_SESSION['admin_logged_in_at'] ?? 0;
    $expirado = (time() - $logadoEm) > LOGIN_DURACAO_SEGUNDOS;
    return $logadoEm && !$expirado;
}

function exigirLogin(): void
{
    if (!estaLogado()) {
        http_response_code(403);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['ok' => false, 'erro' => 'Faça login antes de acessar isso.']);
        exit;
    }
}
