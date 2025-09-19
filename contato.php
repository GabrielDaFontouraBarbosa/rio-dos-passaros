<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Sanitiza os dados recebidos
    $name = htmlspecialchars(trim($_POST["name"]));
    $email = htmlspecialchars(trim($_POST["email"]));
    $subject = htmlspecialchars(trim($_POST["subject"]));
    $message = htmlspecialchars(trim($_POST["message"]));
    $date = date("d/m/Y H:i:s");

    // Monta a mensagem (campos em português para compatibilidade com admin)
    $msg = "Data: $date\nNome: $name\nEmail: $email\nAssunto: $subject\nMensagem: $message\n----------------------\n";

    // Salva em um arquivo
    file_put_contents("mensagens-contato.txt", $msg, FILE_APPEND);

    // Redireciona para a página principal ou página de obrigado
    header("Location: index.html");
    exit();
} else {
    header("Location: index.html");
    exit();
}
?>