<?php
header('Content-Type: application/json');
$arquivo = 'mensagens-contato.txt';
$mensagens = [];

if (file_exists($arquivo)) {
    $conteudo = file($arquivo, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    $msgAtual = [];
    foreach ($conteudo as $linha) {
        if (trim($linha) === "----------------------") {
            if (!empty($msgAtual)) {
                $mensagens[] = $msgAtual;
                $msgAtual = [];
            }
        } else {
            // Exemplo: Data: 01/01/2024 12:00:00
            $partes = explode(":", $linha, 2);
            if (count($partes) == 2) {
                $chave = strtolower(trim($partes[0]));
                $valor = trim($partes[1]);
                $msgAtual[$chave] = $valor;
            }
        }
    }
}
echo json_encode(array_reverse($mensagens)); // Mostra as mais recentes primeiro
?>