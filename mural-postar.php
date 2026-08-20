<?php
// Recebe uma cartinha do Mural (nome, idade, mensagem) e grava em
// data/mural.json. Endpoint público — qualquer visitante pode postar —, mas
// com campo-armadilha e um intervalo mínimo entre posts pra frear spam.
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
session_start();

const INTERVALO_MINIMO_SEGUNDOS = 15;
const MAX_MENSAGENS_GUARDADAS = 300;
const MAX_NOME = 40;
const MAX_MENSAGEM = 240;

function respond(array $dados, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($dados);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(['ok' => false, 'erro' => 'Método não permitido.'], 405);
}

$corpo = json_decode((string) file_get_contents('php://input'), true);
if (!is_array($corpo)) {
    respond(['ok' => false, 'erro' => 'Requisição inválida.'], 400);
}

// Campo-armadilha: fica escondido no formulário, então gente nunca preenche
// e robô que preenche tudo, sim. Responde 200 de propósito — o robô acha que
// deu certo e não tenta de novo.
if (!empty($corpo['jardim'])) {
    respond(['ok' => true]);
}

$ultimoPost = $_SESSION['mural_ultimo_post'] ?? 0;
if ((time() - $ultimoPost) < INTERVALO_MINIMO_SEGUNDOS) {
    respond(['ok' => false, 'erro' => 'Calma aí! Espere alguns segundos antes de postar de novo.'], 429);
}

$nome = trim((string) ($corpo['nome'] ?? ''));
$idadeBruta = $corpo['idade'] ?? null;
$mensagem = trim((string) ($corpo['mensagem'] ?? ''));

if ($nome === '' || mb_strlen($nome) > MAX_NOME) {
    respond(['ok' => false, 'erro' => 'Nome inválido (até ' . MAX_NOME . ' caracteres).'], 400);
}

if ($mensagem === '' || mb_strlen($mensagem) > MAX_MENSAGEM) {
    respond(['ok' => false, 'erro' => 'Mensagem inválida (até ' . MAX_MENSAGEM . ' caracteres).'], 400);
}

if (!is_scalar($idadeBruta) || !preg_match('/^\d{1,3}$/', (string) $idadeBruta)) {
    respond(['ok' => false, 'erro' => 'Idade inválida.'], 400);
}
$idade = (int) $idadeBruta;
if ($idade < 1 || $idade > 120) {
    respond(['ok' => false, 'erro' => 'Idade inválida.'], 400);
}

$caminhoArquivo = __DIR__ . '/data/mural.json';
$dadosAtuais = json_decode((string) file_get_contents($caminhoArquivo), true);
if (!is_array($dadosAtuais) || !isset($dadosAtuais['mensagens']) || !is_array($dadosAtuais['mensagens'])) {
    $dadosAtuais = ['mensagens' => []];
}

$proximoId = 1;
foreach ($dadosAtuais['mensagens'] as $msg) {
    if (isset($msg['id']) && (int) $msg['id'] >= $proximoId) {
        $proximoId = (int) $msg['id'] + 1;
    }
}

$novaMensagem = [
    'id' => $proximoId,
    'nome' => htmlspecialchars($nome, ENT_QUOTES, 'UTF-8'),
    'idade' => $idade,
    'mensagem' => htmlspecialchars($mensagem, ENT_QUOTES, 'UTF-8'),
    'criadoEm' => date('c'),
];

$dadosAtuais['mensagens'][] = $novaMensagem;

// Mantém só as mais recentes pra não crescer sem limite.
if (count($dadosAtuais['mensagens']) > MAX_MENSAGENS_GUARDADAS) {
    $dadosAtuais['mensagens'] = array_slice($dadosAtuais['mensagens'], -MAX_MENSAGENS_GUARDADAS);
}

$gravado = file_put_contents(
    $caminhoArquivo,
    json_encode($dadosAtuais, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE),
    LOCK_EX
);

if ($gravado === false) {
    respond(['ok' => false, 'erro' => 'Não foi possível salvar sua cartinha agora. Tenta de novo em instantes.'], 500);
}

$_SESSION['mural_ultimo_post'] = time();

respond(['ok' => true, 'mensagem' => $novaMensagem]);
