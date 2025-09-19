function animateBoat() {
    let boat = document.getElementById("boat");
    let positionX = -50; // Começa mais longe à esquerda
    let waveOffset = 0;
    let speed = 0.2; // Ajuste conforme necessário
    let waveAmplitude = 20;

    function moveBoat() {
        positionX += speed; // Move o barco para a direita
        waveOffset += 0.05;

        // Aplica movimento lateral e balanço
        boat.style.transform = `translate(${positionX}vw, ${Math.sin(waveOffset) * waveAmplitude}px)`;

        // Agora só reseta quando sair completamente da tela (150vw)
        if (positionX > 110) {
            positionX = -50; // Reinicia bem longe à esquerda
        }

        requestAnimationFrame(moveBoat);
    }

    moveBoat();
}

window.onload = animateBoat;

