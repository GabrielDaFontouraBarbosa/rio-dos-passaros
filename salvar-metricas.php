<?php
// Grava edições nos dados de métricas (aba "Métricas" do admin, com o
// cadeado destrancado). Faz merge por data — só sobrescreve os dias
// enviados, preserva o resto do arquivo.
declare(strict_types=1);

require __DIR__ . '/admin-auth.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'erro' => 'Método não permitido.']);
    exit;
}

exigirAdminDesbloqueado();

$corpo = json_decode(file_get_contents('php://input'), true);
$diarioEnviado = is_array($corpo) ? ($corpo['diario'] ?? null) : null;

if (!is_array($diarioEnviado) || count($diarioEnviado) === 0) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'erro' => 'Nenhum dado de métricas recebido.']);
    exit;
}

$camposNumericos = ['visitas', 'visitantesUnicos', 'impressoes', 'cliques', 'receita'];

foreach ($diarioEnviado as $linha) {
    if (!is_array($linha) || !isset($linha['data']) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', (string) $linha['data'])) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'erro' => 'Cada linha precisa de uma data válida (AAAA-MM-DD).']);
        exit;
    }
    foreach ($camposNumericos as $campo) {
        if (!isset($linha[$campo]) || !is_numeric($linha[$campo]) || (float) $linha[$campo] < 0) {
            http_response_code(400);
            echo json_encode(['ok' => false, 'erro' => "Valor inválido no campo \"$campo\" da linha {$linha['data']}. Use apenas números maiores ou iguais a zero."]);
            exit;
        }
    }
}

$caminhoArquivo = __DIR__ . '/data/metrics.json';
$dadosAtuais = json_decode(file_get_contents($caminhoArquivo), true);

if (!is_array($dadosAtuais)) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'erro' => 'Não foi possível ler o arquivo de métricas atual.']);
    exit;
}

$porData = [];
foreach ($dadosAtuais['diario'] as $linha) {
    $porData[$linha['data']] = $linha;
}

foreach ($diarioEnviado as $linha) {
    $porData[$linha['data']] = [
        'data' => $linha['data'],
        'visitas' => (int) $linha['visitas'],
        'visitantesUnicos' => (int) $linha['visitantesUnicos'],
        'impressoes' => (int) $linha['impressoes'],
        'cliques' => (int) $linha['cliques'],
        'receita' => round((float) $linha['receita'], 2),
    ];
}

ksort($porData);
$dadosAtuais['diario'] = array_values($porData);

$gravado = file_put_contents(
    $caminhoArquivo,
    json_encode($dadosAtuais, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE),
    LOCK_EX
);

if ($gravado === false) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'erro' => 'Falha ao gravar o arquivo de métricas no servidor.']);
    exit;
}

echo json_encode(['ok' => true]);
