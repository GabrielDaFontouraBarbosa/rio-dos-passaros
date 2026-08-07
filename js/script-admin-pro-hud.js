// Simulação do "Plano PRO": upgrade fictício + HUD de campanha em Nova
// Iorque, por cima do globo da aba Mapa de Anúncios. É só uma demonstração
// visual — nenhum número aqui vem de anunciante real (ver AVISO no
// data/ad-pricing.json). Depende do window.AdminGlobo exposto pelo
// script-admin-globe.js quando o globo termina de carregar.
document.addEventListener('DOMContentLoaded', () => {
  const btnAtivar = document.getElementById('btnAtivarPro');
  const btnSair = document.getElementById('btnSairPro');
  const overlayIntro = document.getElementById('proIntroOverlay');
  const barraIntro = document.getElementById('proIntroBarra');
  const listaChecklist = document.getElementById('proIntroChecklist');
  const btnPularIntro = document.getElementById('btnPularIntro');
  const faixaHud = document.getElementById('proHudFaixa');
  const drawerPais = document.getElementById('drawerPais');
  const drawerPro = document.getElementById('drawerPro');
  const statusDesde = document.getElementById('proStatusDesde');
  const barraOrcamento = document.getElementById('proOrcamentoBarra');
  const textoOrcamentoGasto = document.getElementById('proOrcamentoGasto');
  const textoOrcamentoTotal = document.getElementById('proOrcamentoTexto');
  const listaTicker = document.getElementById('proTicker');
  if (!btnAtivar || !overlayIntro || !faixaHud || !drawerPro) return;

  const formatoMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const formatoNumero = new Intl.NumberFormat('pt-BR');
  const formatoHora = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const NYC = { lat: 40.7128, lng: -74.006 };
  const ORCAMENTO_ALOCADO = 48500;
  const MAX_ARCOS = 7;
  const MAX_TICKER = 7;

  // Hubs plausíveis de onde o "tráfego" simulado parte rumo a Nova Iorque.
  const ORIGENS = [
    { cidade: 'São Paulo', lat: -23.55, lng: -46.63 },
    { cidade: 'Rio de Janeiro', lat: -22.9, lng: -43.2 },
    { cidade: 'Londres', lat: 51.5, lng: -0.12 },
    { cidade: 'Toronto', lat: 43.65, lng: -79.38 },
    { cidade: 'Miami', lat: 25.76, lng: -80.19 },
    { cidade: 'Lisboa', lat: 38.72, lng: -9.14 },
    { cidade: 'Berlim', lat: 52.52, lng: 13.4 },
    { cidade: 'Sydney', lat: -33.87, lng: 151.21 },
    { cidade: 'Los Angeles', lat: 34.05, lng: -118.24 },
    { cidade: 'Chicago', lat: 41.88, lng: -87.63 },
  ];

  const BAIRROS_NY = ['Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island'];
  const PASSAROS_TICKER = ['Canário', 'Sabiá', 'Tiziu', 'Beija-Flor', 'Coleiro', 'Quero-Quero', 'Bem-Te-Vi', 'Tico-Tico', 'Papagaio', 'Arara', 'Uirapuru', 'Curió'];

  const ETAPAS_INTRO = [
    { texto: 'Processando pagamento do Plano PRO...', feito: 'Pagamento aprovado' },
    { texto: 'Configurando segmentação geográfica: Nova Iorque, EUA...', feito: 'Segmentação configurada' },
    { texto: 'Alocando orçamento de campanha...', feito: `Orçamento de ${formatoMoeda.format(ORCAMENTO_ALOCADO)} alocado` },
    { texto: "Publicando campanha 'Expansão Nova Iorque'...", feito: 'Campanha no ar' },
  ];

  function gerarEventoTicker() {
    const bairro = BAIRROS_NY[Math.floor(Math.random() * BAIRROS_NY.length)];
    const passaro = PASSAROS_TICKER[Math.floor(Math.random() * PASSAROS_TICKER.length)];
    const modelos = [
      `🦜 Página do ${passaro} visitada · ${bairro}, NY`,
      `🎧 Piado do ${passaro} reproduzido · ${bairro}, NY`,
      `🧩 Quiz de piados concluído · ${bairro}, NY`,
      `⭐ Pássaro do dia compartilhado · ${bairro}, NY`,
      `🛒 Produto da loja visualizado · ${bairro}, NY`,
      `👁️ Impressão de anúncio servida · ${bairro}, NY`,
      `🖱️ Clique no anúncio · ${bairro}, NY`,
    ];
    return modelos[Math.floor(Math.random() * modelos.length)];
  }

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Depois que "Pular animação" é clicado, cada nova espera resolve na hora —
  // o passo que já estava em andamento só termina no próprio tempo dele, o
  // que dá um efeito de "acelerar até o fim" em vez de um corte seco.
  let intraPulada = false;
  async function esperar(ms) {
    if (intraPulada) return;
    await delay(ms);
  }

  async function tocarIntro() {
    intraPulada = false;
    overlayIntro.hidden = false;
    barraIntro.style.width = '0%';
    listaChecklist.innerHTML = ETAPAS_INTRO.map(
      (etapa, i) => `
        <li class="pro-check-item" data-estado="pendente" data-indice="${i}">
          <span class="pro-check-icone">○</span>
          <span class="pro-check-texto">${etapa.texto}</span>
        </li>`
    ).join('');
    const itens = Array.from(listaChecklist.children);

    for (let i = 0; i < ETAPAS_INTRO.length; i++) {
      const item = itens[i];
      item.dataset.estado = 'ativo';
      item.querySelector('.pro-check-icone').textContent = '⏳';
      await esperar(650);
      item.dataset.estado = 'feito';
      item.querySelector('.pro-check-icone').textContent = '✅';
      item.querySelector('.pro-check-texto').textContent = ETAPAS_INTRO[i].feito;
      barraIntro.style.width = `${Math.round(((i + 1) / ETAPAS_INTRO.length) * 100)}%`;
      await esperar(280);
    }
    await esperar(500);

    overlayIntro.hidden = true;
    ativarModoPro();
  }

  btnPularIntro.addEventListener('click', () => {
    intraPulada = true;
  });

  // ---------------- Métricas + orçamento (números fictícios que "vivem") ----------------
  let stats = { impressoes: 0, cliques: 0, usuariosAgora: 0, orcamentoGasto: 0 };
  let intervalos = [];

  function limparIntervalos() {
    intervalos.forEach(clearInterval);
    intervalos = [];
  }

  function animarValor(elId, valorNovo) {
    const el = document.getElementById(elId);
    if (!el) return;
    el.textContent = formatoNumero.format(valorNovo);
    el.classList.remove('pro-valor-pop');
    void el.offsetWidth; // força reflow pra reiniciar a animação CSS
    el.classList.add('pro-valor-pop');
  }

  function atualizarMetricasHud() {
    animarValor('proImpressoes', stats.impressoes);
    animarValor('proCliques', stats.cliques);
    const ctr = stats.impressoes ? (stats.cliques / stats.impressoes) * 100 : 0;
    document.getElementById('proCtr').textContent = `${ctr.toFixed(2)}%`;
    animarValor('proUsuariosAgora', stats.usuariosAgora);
  }

  function atualizarOrcamento() {
    const pct = Math.min(100, (stats.orcamentoGasto / ORCAMENTO_ALOCADO) * 100);
    barraOrcamento.style.width = `${pct}%`;
    textoOrcamentoGasto.textContent = formatoMoeda.format(stats.orcamentoGasto);
    textoOrcamentoTotal.textContent = `de ${formatoMoeda.format(ORCAMENTO_ALOCADO)} alocados`;
  }

  function iniciarContadores() {
    stats = {
      impressoes: 8400 + Math.floor(Math.random() * 2000),
      cliques: 0,
      usuariosAgora: 24 + Math.floor(Math.random() * 12),
      orcamentoGasto: ORCAMENTO_ALOCADO * (0.35 + Math.random() * 0.1),
    };
    stats.cliques = Math.round(stats.impressoes * (0.02 + Math.random() * 0.015));
    atualizarMetricasHud();
    atualizarOrcamento();

    intervalos.push(
      setInterval(() => {
        stats.impressoes += 15 + Math.floor(Math.random() * 45);
        if (Math.random() < 0.4) stats.cliques += 1;
        stats.usuariosAgora = Math.max(12, Math.min(80, stats.usuariosAgora + Math.floor(Math.random() * 7) - 3));
        if (stats.orcamentoGasto < ORCAMENTO_ALOCADO * 0.96) {
          stats.orcamentoGasto += ORCAMENTO_ALOCADO * (0.0015 + Math.random() * 0.002);
        }
        atualizarMetricasHud();
        atualizarOrcamento();
      }, 1000)
    );

    intervalos.push(setInterval(adicionarTicker, 2200));
    adicionarTicker();
  }

  function adicionarTicker() {
    const li = document.createElement('li');
    li.className = 'pro-ticker-item pro-ticker-item-novo';
    li.innerHTML = `<span>${gerarEventoTicker()}</span><span class="pro-ticker-tempo">agora</span>`;
    listaTicker.insertBefore(li, listaTicker.firstChild);
    while (listaTicker.children.length > MAX_TICKER) {
      listaTicker.removeChild(listaTicker.lastChild);
    }
  }

  // ---------------- Segmentação de público (sorteada a cada ativação) ----------------
  function gerarSplit(faixas) {
    const brutos = faixas.map(([nome, min, max]) => [nome, min + Math.random() * (max - min)]);
    const soma = brutos.reduce((s, [, v]) => s + v, 0);
    const pcts = brutos.map(([nome, v]) => [nome, Math.round((v / soma) * 100)]);
    const somaArredondada = pcts.reduce((s, [, v]) => s + v, 0);
    pcts[pcts.length - 1][1] += 100 - somaArredondada; // fecha em exatamente 100%
    return pcts;
  }

  function montarSegmentacao(containerId, linhas) {
    const container = document.getElementById(containerId);
    container.innerHTML = linhas
      .map(
        ([nome, pct]) => `
        <div class="pro-seg-linha">
          <span>${nome}</span>
          <div class="pro-seg-barra"><div class="pro-seg-barra-preenchimento" data-alvo="${pct}"></div></div>
          <span class="pro-seg-valor">${pct}%</span>
        </div>`
      )
      .join('');
    requestAnimationFrame(() => {
      container.querySelectorAll('.pro-seg-barra-preenchimento').forEach((barra) => {
        barra.style.width = `${barra.dataset.alvo}%`;
      });
    });
  }

  function renderSegmentacao() {
    montarSegmentacao(
      'proSegmentacaoDispositivo',
      gerarSplit([
        ['Mobile', 55, 68],
        ['Desktop', 22, 34],
        ['Tablet', 5, 12],
      ])
    );
    montarSegmentacao(
      'proSegmentacaoIdade',
      gerarSplit([
        ['18–24', 8, 16],
        ['25–34', 30, 40],
        ['35–44', 24, 32],
        ['45–54', 10, 18],
        ['55+', 4, 10],
      ])
    );
  }

  // ---------------- Tráfego animado no globo (arcos + anéis em NY) ----------------
  let arcos = [];

  function gerarArco() {
    const origem = ORIGENS[Math.floor(Math.random() * ORIGENS.length)];
    return {
      startLat: origem.lat,
      startLng: origem.lng,
      endLat: NYC.lat,
      endLng: NYC.lng,
      cor: [Math.random() > 0.5 ? '#3ecf8e' : '#5b8def', '#ffd60a'],
    };
  }

  function iniciarCamadasTrafego(globo) {
    arcos = [gerarArco(), gerarArco(), gerarArco()];
    globo
      .arcsData(arcos)
      .arcColor((d) => d.cor)
      .arcAltitude(0.32)
      .arcStroke(0.5)
      .arcDashLength(0.4)
      .arcDashGap(2)
      .arcDashAnimateTime(1500)
      .ringsData([{ lat: NYC.lat, lng: NYC.lng }])
      .ringColor(() => (t) => `rgba(255, 214, 10, ${1 - t})`)
      .ringMaxRadius(6)
      .ringPropagationSpeed(3)
      .ringRepeatPeriod(900);

    intervalos.push(
      setInterval(() => {
        arcos = [...arcos, gerarArco()];
        if (arcos.length > MAX_ARCOS) arcos = arcos.slice(arcos.length - MAX_ARCOS);
        globo.arcsData(arcos);
      }, 2200)
    );
  }

  function pararCamadasTrafego(globo) {
    arcos = [];
    globo.arcsData([]).ringsData([]);
  }

  // ---------------- Ativar / sair do modo PRO ----------------
  let autoRotatePrevio = null;

  function ativarModoPro() {
    const globo = window.AdminGlobo;

    faixaHud.hidden = false;
    drawerPais.hidden = true;
    drawerPro.hidden = false;
    btnAtivar.hidden = true;
    btnSair.hidden = false;
    statusDesde.textContent = `Ativa desde ${formatoHora.format(new Date())}`;

    renderSegmentacao();
    iniciarContadores();

    if (globo) {
      autoRotatePrevio = globo.controls().autoRotate;
      globo.controls().autoRotate = false;
      globo.pointOfView({ lat: NYC.lat, lng: NYC.lng, altitude: 1.6 }, 2200);
      iniciarCamadasTrafego(globo);
    }
  }

  function desativarModoPro() {
    limparIntervalos();
    const globo = window.AdminGlobo;
    if (globo) {
      pararCamadasTrafego(globo);
      if (autoRotatePrevio !== null) globo.controls().autoRotate = autoRotatePrevio;
      globo.pointOfView({ lat: 10, lng: 0, altitude: 2.2 }, 1800);
    }

    faixaHud.hidden = true;
    drawerPro.hidden = true;
    drawerPais.hidden = false;
    btnAtivar.hidden = false;
    btnAtivar.disabled = false;
    btnSair.hidden = true;
  }

  btnAtivar.addEventListener('click', () => {
    if (btnAtivar.disabled) return;
    btnAtivar.disabled = true;
    tocarIntro();
  });
  btnSair.addEventListener('click', desativarModoPro);

  function habilitarBotao() {
    btnAtivar.disabled = false;
    btnAtivar.title = '';
  }
  if (window.AdminGlobo) {
    habilitarBotao();
  } else {
    document.addEventListener('admin-globo-pronto', habilitarBotao, { once: true });
  }
});
