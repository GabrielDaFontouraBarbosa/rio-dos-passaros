<?php
// Diz pro admin.html se a sessão atual passou pelo login. Usado como porteiro
// no carregamento da página — antes disso, admin.html abria pra qualquer um
// que soubesse a URL, sem checar nada.
declare(strict_types=1);

require __DIR__ . '/admin-auth.php';

header('Content-Type: application/json; charset=utf-8');
echo json_encode(['ok' => estaLogado()]);
