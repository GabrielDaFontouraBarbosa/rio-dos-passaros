document.addEventListener("DOMContentLoaded", function () {
    // Constantes para os tempos de animação
    const LOADING_DELAY = 500;
    const FADE_IN_DELAY = 50;
    const LOADING_HIDE_DELAY = 300;
  
    // Encontra todas as seções automaticamente
    const secoes = Array.from(document.querySelectorAll('section[id]')).map(s => s.id);
    const loading = document.getElementById("loading");
    let secaoAtual = null;
  
    // Função para trocar de seção
    function trocarSecao(novaSecao) {
        // Não faz nada se já estiver na seção atual
        if (secaoAtual === novaSecao) return;
        
        const secaoElement = document.getElementById(novaSecao);
        if (!secaoElement) {
            console.error(`Seção ${novaSecao} não encontrada!`);
            return;
        }
  
        // Oculta todas as seções
        secoes.forEach(secao => {
            const elemento = document.getElementById(secao);
            if (elemento) {
                elemento.style.display = "none";
                elemento.style.opacity = "0";
                elemento.setAttribute('aria-hidden', 'true');
            }
        });
  
        // Mostra o loading
        loading.classList.remove("d-none");
        loading.classList.add("show");
        loading.setAttribute('aria-busy', 'true');
  
        setTimeout(() => {
            // Mostra a nova seção
            secaoElement.style.display = "block";
            secaoElement.setAttribute('aria-hidden', 'false');
            
            setTimeout(() => {
                secaoElement.style.opacity = "1";
                secaoAtual = novaSecao;
                
                // Move o foco para o cabeçalho da nova seção para acessibilidade
                const heading = secaoElement.querySelector('h1, h2');
                if (heading) heading.focus();
                
                setTimeout(() => {
                    // Esconde o loading
                    loading.classList.remove("show");
                    loading.setAttribute('aria-busy', 'false');
                    setTimeout(() => loading.classList.add("d-none"), LOADING_HIDE_DELAY);
                }, LOADING_HIDE_DELAY);
            }, FADE_IN_DELAY);
        }, LOADING_DELAY);

        if (!secaoElement) {
            console.error(`Seção ${novaSecao} não encontrada!`);
            return;
        }
        
    }
  
    // Configura eventos de clique para todos os botões
    function configurarBotao(botaoId, secaoId) {
        const botao = document.getElementById(botaoId);
        if (botao) {
            botao.addEventListener("click", (e) => {
                e.preventDefault();
                trocarSecao(secaoId);
            });
            
            // Melhoria: adiciona ARIA para acessibilidade
            botao.setAttribute('aria-controls', secaoId);
        } else {
            console.warn(`Botão ${botaoId} não encontrado`);
        }
    }
  
    // Configura todos os botões
    configurarBotao("btnHome", "home");
    configurarBotao("btnSobreNos", "sobre");
    configurarBotao("btnPassaros", "passaros");
    configurarBotao("btnGaleria", "galeria");
    configurarBotao("btnJogos", "jogos");
  
    // Função adicional para mostrar animação ou interações na seção "home"
    function configurarHome() {
        const homeSection = document.getElementById("home");

        // Adiciona animação ao conteúdo na seção "home"
        if (homeSection) {
            const homeContent = homeSection.querySelector(".home-content");
            if (homeContent) {
                homeContent.style.opacity = "0";
                setTimeout(() => {
                    homeContent.style.transition = "opacity 1s ease-in";
                    homeContent.style.opacity = "1";
                }, 500);
            }
        }
    }

    // Inicializa a seção "home" com animação
    configurarHome();
  
    // Mostra a seção home inicialmente
    trocarSecao("home");
});
