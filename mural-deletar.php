<?php
// Apaga uma cartinha do Mural. Só quem passou pelo login do admin
// (login.html / sessao.php) pode apagar — mesma checagem usada pra ler as
// mensagens de contato em get-mensagens.php.
declare(strict_types=1);

require __DIR__ . '/admin-auth.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'erro' => 'Método não permitido.']);
    exit;
}

exigirLogin();

$corpo = json_decode((string) file_get_contents('php://input'), true);
$id = is_array($corpo) ? ($corpo['id'] ?? null) : null;

if (!is_numeric($id)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'erro' => 'Id inválido.']);
    exit;
}

$caminhoArquivo = __DIR__ . '/data/mural.json';
$dadosAtuais = json_decode((string) file_get_contents($caminhoArquivo), true);

if (!is_array($dadosAtuais) || !isset($dadosAtuais['mensagens']) || !is_array($dadosAtuais['mensagens'])) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'erro' => 'Não foi possível ler o mural.']);
    exit;
}

$idAlvo = (int) $id;
$restantes = array_values(array_filter(
    $dadosAtuais['mensagens'],
    fn ($msg) => (int) ($msg['id'] ?? -1) !== $idAlvo
));

if (count($restantes) === count($dadosAtuais['mensagens'])) {
    http_response_code(404);
    echo json_encode(['ok' => false, 'erro' => 'Mensagem não encontrada.']);
    exit;
}

$dadosAtuais['mensagens'] = $restantes;

$gravado = file_put_contents(
    $caminhoArquivo,
    json_encode($dadosAtuais, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE),
    LOCK_EX
);

if ($gravado === false) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'erro' => 'Falha ao gravar o mural no servidor.']);
    exit;
}

echo json_encode(['ok' => true]);
