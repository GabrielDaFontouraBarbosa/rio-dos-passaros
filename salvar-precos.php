<?php
// Grava edições nos preços de anúncio por país (aba "Mapa de Anúncios",
// com o cadeado destrancado). Faz merge por código ISO A3 — só sobrescreve
// os países enviados, preserva o resto do arquivo.
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
$precosEnviados = is_array($corpo) ? ($corpo['precos'] ?? null) : null;

if (!is_array($precosEnviados) || count($precosEnviados) === 0) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'erro' => 'Nenhum preço recebido.']);
    exit;
}

$camposNumericos = ['cpm', 'cpc', 'reach'];

foreach ($precosEnviados as $iso => $valores) {
    // países: ISO A3 (ex.: BRA). Estados dos EUA: "US-" + sigla postal (ex.: US-NY).
    if (!preg_match('/^([A-Z]{3}|US-[A-Z]{2})$/', (string) $iso)) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'erro' => "Código inválido: \"$iso\". Use ISO A3 (ex.: BRA) ou US-<sigla> para estado dos EUA (ex.: US-NY)."]);
        exit;
    }
    if (!is_array($valores)) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'erro' => "Valores inválidos para \"$iso\"."]);
        exit;
    }
    foreach ($camposNumericos as $campo) {
        if (!isset($valores[$campo]) || !is_numeric($valores[$campo]) || (float) $valores[$campo] < 0) {
            http_response_code(400);
            echo json_encode(['ok' => false, 'erro' => "Valor inválido no campo \"$campo\" de \"$iso\". Use apenas números maiores ou iguais a zero."]);
            exit;
        }
    }
}

$caminhoArquivo = __DIR__ . '/data/ad-pricing.json';
$dadosAtuais = json_decode(file_get_contents($caminhoArquivo), true);

if (!is_array($dadosAtuais)) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'erro' => 'Não foi possível ler o arquivo de preços atual.']);
    exit;
}

foreach ($precosEnviados as $iso => $valores) {
    $dadosAtuais['precos'][$iso] = [
        'cpm' => round((float) $valores['cpm'], 2),
        'cpc' => round((float) $valores['cpc'], 2),
        'reach' => (int) $valores['reach'],
        'currency' => 'BRL',
    ];
}

$gravado = file_put_contents(
    $caminhoArquivo,
    json_encode($dadosAtuais, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE),
    LOCK_EX
);

if ($gravado === false) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'erro' => 'Falha ao gravar o arquivo de preços no servidor.']);
    exit;
}

echo json_encode(['ok' => true]);
