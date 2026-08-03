<?php
// Checagem compartilhada pelos endpoints que gravam dados do admin.
declare(strict_types=1);

const DESBLOQUEIO_DURACAO_SEGUNDOS = 900; // 15 minutos

// TODO: substituir por verificação de role no servidor. Esta função hoje só
// confirma que a sessão passou pelo PIN nos últimos 15 minutos — quando
// existir login de verdade, troque por checagem de usuário autenticado com
// role=admin (e pode manter o PIN como confirmação extra antes de salvar).
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
