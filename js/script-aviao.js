$(document).ready(function () {
    $("#aviao").click(function () {
        $(this).css({ transform: "scale(1) rotate(0deg)" }); // Garante um início limpo

        function animarVoo() {
            $(this)
                // Aproximação + Inclinação para a Direita
                .animate({ top: "-=80px" }, { 
                    duration: 2000,
                    step: function (now, fx) {
                        let progress = fx.pos;
                        let scaleValue = 1 + progress * 0.8; // Agora cresce até 1.8x (antes era 2.5x)
                        let rotateValue = progress * 8; // Inclina até 8° para a direita (antes era 10°)
                        $(this).css("transform", `scale(${scaleValue}) rotate(${rotateValue}deg)`);
                    }
                })

                // Inclinação para a Esquerda no meio do voo
                .animate({ top: "-=40px" }, { 
                    duration: 1000,
                    step: function (now, fx) {
                        let progress = fx.pos;
                        let scaleValue = 1.8; // Mantém tamanho máximo
                        let rotateValue = 8 - progress * 16; // Inclina para a esquerda (-8°)
                        $(this).css("transform", `scale(${scaleValue}) rotate(${rotateValue}deg)`);
                    }
                })

                // Retorno ao tamanho original + Inclinação para a Direita novamente
                .animate({ top: "+=80px" }, { 
                    duration: 2000,
                    step: function (now, fx) {
                        let progress = fx.pos;
                        let scaleValue = 1.8 - progress * 0.8; // Volta ao tamanho normal
                        let rotateValue = -8 + progress * 16; // Inclina para a direita de novo
                        $(this).css("transform", `scale(${scaleValue}) rotate(${rotateValue}deg)`);
                    }
                })

                // Ajuste final SUAVE para voltar à posição normal
                .animate({ top: "+=40px" }, { 
                    duration: 1000,
                    step: function (now, fx) {
                        let progress = fx.pos;
                        let scaleValue = 1 + (1 - progress) * 0.3; // Volta ao tamanho original suavemente
                        let rotateValue = (1 - progress) * 8; // Inclina gradualmente até 0°
                        $(this).css("transform", `scale(${scaleValue}) rotate(${rotateValue}deg)`);
                    },
                    complete: function () {
                        $(this).css("transform", "scale(1) rotate(0deg)"); // Ajuste final limpo
                    }
                });
        }

        $(this).stop(true, false); // Evita animação resetar bruscamente
        animarVoo.call(this);
    });
});
