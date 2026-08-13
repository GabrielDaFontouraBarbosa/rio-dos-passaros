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
  const seloAoVivo = document.getElementById('proHudAoVivo');
  const elHistorico = document.getElementById('proHistorico');
  const btnNovaCampanha = document.getElementById('btnNovaCampanha');
  if (!btnAtivar || !overlayIntro || !faixaHud || !drawerPro) return;

  const formatoMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const formatoNumero = new Intl.NumberFormat('pt-BR');
  const formatoHora = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const formatoData = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' });

  const NYC = { lat: 40.7128, lng: -74.006 };
  const CHAVE_PRECO_NY = 'US-NY';
  const ORCAMENTO_ALOCADO = 1500; // R$ investidos na campanha de Nova Iorque
  // Fallback: só entra em cena se o globo não tiver publicado os preços (ex.:
  // navegador sem WebGL, que cai na tabela). O valor real vem de AdminPrecos,
  // o mesmo objeto que o drawer edita — ver cpmAtual().
  const CPM_NY_PADRAO = 55;
  const CTR_ALVO = 0.0055; // CTR de display plausível pra banner geo-segmentado (~0,55%)
  const MINUTOS_ENTREGA = 150; // ritmo: o orçamento inteiro leva ~2h30 de aba aberta pra ser entregue
  const AQUECIMENTO_SEG = [45, 90]; // quanto a campanha já entregou quando o HUD abre
  const TIQUE_MS = 2000;
  const MAX_ARCOS = 4;
  const MAX_TICKER = 7;
  const CHAVE_STORAGE_CAMPANHA = 'rdp-pro-campanha';
  const CHAVE_STORAGE_HISTORICO = 'rdp-pro-historico';

  function cpmAtual() {
    const preco = window.AdminPrecos && window.AdminPrecos.get(CHAVE_PRECO_NY);
    return preco && preco.cpm > 0 ? preco.cpm : CPM_NY_PADRAO;
  }

  // ---------------- Persistência (relógio de parede) ----------------
  // localStorage pode estourar (modo anônimo, storage bloqueado, cota cheia).
  // Nada aqui é essencial pro HUD funcionar, então falha vira "não persiste"
  // em vez de quebrar a tela.
  function lerStorage(chave) {
    try {
      const bruto = localStorage.getItem(chave);
      return bruto ? JSON.parse(bruto) : null;
    } catch (e) {
      return null;
    }
  }

  function gravarStorage(chave, valor) {
    try {
      localStorage.setItem(chave, JSON.stringify(valor));
    } catch (e) {
      /* segue sem persistir */
    }
  }

  function apagarStorage(chave) {
    try {
      localStorage.removeItem(chave);
    } catch (e) {
      /* segue sem persistir */
    }
  }

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
  // Uma identidade governa o HUD inteiro e vale em QUALQUER instante:
  //     gasto = (impressões / 1000) × CPM
  // Só as impressões avançam sozinhas; gasto, cliques e CTR são derivados delas.
  // O CPM vem de AdminPrecos (o mesmo que o drawer edita), o total contratado é
  // orçamento ÷ CPM, e os cliques saem do CTR alvo. Se alguém pegar os quatro
  // números da faixa e conferir na mão, eles fecham — em t=0 e três horas depois.
  let stats = { impressoes: 0, cliques: 0, usuariosAgora: 0, orcamentoGasto: 0 };
  let campanha = null; // { cpm, ctrAlvo, orcamento, impressoesContratadas, inicio, encerrada }
  let historico = lerStorage(CHAVE_STORAGE_HISTORICO); // null na primeira vez
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

  // Os contadores internos são fracionários (uma impressão "e meia" por tique é
  // normal quando o ritmo é derivado do orçamento); só o que vai pra tela é
  // arredondado, e o CTR é calculado em cima do que está escrito na tela pra
  // bater com a divisão feita no olho.
  function atualizarMetricasHud() {
    const impressoes = Math.round(stats.impressoes);
    const cliques = Math.round(stats.cliques);
    animarValor('proImpressoes', impressoes);
    animarValor('proCliques', cliques);
    const ctr = impressoes ? (cliques / impressoes) * 100 : 0;
    document.getElementById('proCtr').textContent = `${ctr.toFixed(2)}%`;
    animarValor('proUsuariosAgora', stats.usuariosAgora);
  }

  function atualizarOrcamento() {
    const pct = Math.min(100, (stats.orcamentoGasto / ORCAMENTO_ALOCADO) * 100);
    barraOrcamento.style.width = `${pct}%`;
    textoOrcamentoGasto.textContent = formatoMoeda.format(stats.orcamentoGasto);
    const cpm = campanha ? campanha.cpm : cpmAtual();
    textoOrcamentoTotal.textContent =
      campanha && campanha.encerrada
        ? `de ${formatoMoeda.format(ORCAMENTO_ALOCADO)} alocados · 100% entregue`
        : `de ${formatoMoeda.format(ORCAMENTO_ALOCADO)} alocados · CPM ${formatoMoeda.format(cpm)}`;
  }

  // Gasto nunca é sorteado nem travado num Math.min: é sempre a conta do CPM em
  // cima das impressões que já saíram.
  function recalcularGasto() {
    stats.orcamentoGasto = (stats.impressoes / 1000) * campanha.cpm;
  }

  function impressoesPorSegundo() {
    return campanha.impressoesContratadas / (MINUTOS_ENTREGA * 60);
  }

  // Reconstrói o objeto da campanha. Com `retomada` (o que veio do localStorage)
  // ela volta a ser a MESMA campanha de antes do F5; sem, nasce uma nova.
  // Repare no que é guardado: só inicio, cpm e ctrAlvo. Impressões, cliques e
  // gasto não são salvos porque são função do tempo decorrido — dá pra
  // recalcular tudo a partir do instante de início.
  function montarCampanha(retomada) {
    const cpm = retomada && retomada.cpm > 0 ? retomada.cpm : cpmAtual();
    const ctrAlvo = retomada && retomada.ctrAlvo > 0 ? retomada.ctrAlvo : CTR_ALVO * (0.85 + Math.random() * 0.3);
    // Campanha nova entra no ar praticamente zerada — a intro é o checkout, ela
    // acabou de subir. O `inicio` recua só o aquecimento (~1 min de entrega),
    // pra hora do cabeçalho bater com o gasto mostrado logo abaixo dela.
    const aquecimentoSeg = AQUECIMENTO_SEG[0] + Math.random() * (AQUECIMENTO_SEG[1] - AQUECIMENTO_SEG[0]);
    const inicio = retomada && retomada.inicio ? retomada.inicio : Date.now() - aquecimentoSeg * 1000;
    return {
      cpm,
      ctrAlvo,
      orcamento: ORCAMENTO_ALOCADO,
      impressoesContratadas: (ORCAMENTO_ALOCADO / cpm) * 1000,
      inicio,
      encerrada: false,
    };
  }

  function salvarCampanha() {
    if (!campanha) return;
    gravarStorage(CHAVE_STORAGE_CAMPANHA, {
      inicio: campanha.inicio,
      cpm: campanha.cpm,
      ctrAlvo: campanha.ctrAlvo,
    });
  }

  function iniciarContadores(retomada) {
    campanha = montarCampanha(retomada);
    if (!retomada) registrarCampanha(); // só campanha nova entra no histórico
    renderHistorico();
    salvarCampanha();

    // O coração da persistência: as impressões são função do tempo de parede
    // desde o início. Um F5 (ou o navegador fechado a tarde inteira) não muda
    // nada — a conta é refeita do mesmo jeito, e a campanha pode voltar já
    // esgotada se você demorou demais.
    const decorridoSeg = (Date.now() - campanha.inicio) / 1000;
    const entregues = Math.max(0, Math.min(campanha.impressoesContratadas, impressoesPorSegundo() * decorridoSeg));
    stats = {
      impressoes: entregues,
      cliques: entregues * campanha.ctrAlvo,
      usuariosAgora: 3 + Math.floor(Math.random() * 7),
      orcamentoGasto: 0,
    };
    recalcularGasto();

    definirEstadoAoVivo(true);
    statusDesde.textContent = `Ativa desde ${formatoHora.format(new Date(campanha.inicio))}`;
    atualizarMetricasHud();
    atualizarOrcamento();
    listaTicker.innerHTML = ''; // não arrasta eventos (nem o "orçamento esgotado") da ativação anterior

    // Voltou depois do orçamento ter acabado: nem chega a ligar os intervalos.
    if (stats.impressoes >= campanha.impressoesContratadas) {
      encerrarCampanha();
      return;
    }

    intervalos.push(
      setInterval(() => {
        const restante = campanha.impressoesContratadas - stats.impressoes;
        const passo = impressoesPorSegundo() * (TIQUE_MS / 1000) * (0.75 + Math.random() * 0.5);
        const entregues = Math.min(passo, restante);
        stats.impressoes += entregues;
        // Cliques oscilam em volta do CTR alvo em vez de virem de uma chance fixa
        // por tique: com chance fixa o CTR exibido descolava do semeado e subia
        // sozinho quanto mais tempo a aba ficasse aberta.
        stats.cliques += entregues * campanha.ctrAlvo * (0.6 + Math.random() * 0.8);
        stats.usuariosAgora = Math.max(2, Math.min(12, stats.usuariosAgora + Math.floor(Math.random() * 3) - 1));
        recalcularGasto();
        atualizarMetricasHud();
        atualizarOrcamento();
        if (stats.impressoes >= campanha.impressoesContratadas) encerrarCampanha();
      }, TIQUE_MS)
    );

    intervalos.push(setInterval(adicionarTicker, 4500));
    adicionarTicker();
  }

  // ==================================================================
  //  ⬇ AQUI É COM VOCÊ — o que sobrevive quando uma campanha nova começa?
  //
  //  Chamada uma única vez, no instante em que uma campanha NOVA nasce (nunca
  //  numa retomada de F5). Recebe o histórico salvo — `anterior` é null na
  //  primeiríssima vez — e a campanha que está subindo. O que você devolver vai
  //  pro localStorage e vira a linha de resumo no topo do drawer.
  //
  //  A campanha traz: { cpm, ctrAlvo, orcamento, impressoesContratadas, inicio }
  //
  //  Candidatos a acumular, e o que cada um permite escrever na tela:
  //    campanhas        → "3ª campanha"
  //    totalInvestido   → "R$ 4.500 investidos"        (somar campanha.orcamento)
  //    impressoesTotais → "81.819 impressões contratadas"
  //    desde            → "desde 07/08"                (guardar campanha.inicio da 1ª)
  //
  //  Não precisa ser tudo: textoHistorico() monta a frase só com os campos que
  //  existirem. Se inventar um campo novo, acrescente uma linha lá pra ele
  //  aparecer. A decisão de fundo é o que torna o painel convincente — um total
  //  que só cresce diz "esse sistema já rodou antes", que é o oposto do que um
  //  contador zerado diz.
  // ==================================================================
  function acumularHistorico(anterior, campanha) {
    return {
      campanhas: (anterior && anterior.campanhas ? anterior.campanhas : 0) + 1,
      // O orçamento é comprometido na largada (a intro aloca antes de publicar),
      // então cada campanha entra aqui pelo valor cheio, não pelo que gastou.
      totalInvestido: (anterior && anterior.totalInvestido ? anterior.totalInvestido : 0) + campanha.orcamento,
      // Data da primeiríssima campanha — nunca é sobrescrita, é ela que dá idade
      // ao painel.
      desde: anterior && anterior.desde ? anterior.desde : campanha.inicio,
    };
  }

  function registrarCampanha() {
    historico = acumularHistorico(historico, campanha);
    gravarStorage(CHAVE_STORAGE_HISTORICO, historico);
  }

  // Monta a frase com o que existir no histórico — cada campo é opcional, então
  // dá pra mexer no acumularHistorico() sem tocar aqui.
  function textoHistorico(h) {
    // Na primeira campanha não há história pra contar — e "R$ 1.500 investidos"
    // logo acima da barra que já diz R$ 1.500 só faria eco.
    if (!h || !(h.campanhas > 1)) return '';
    const partes = [`${h.campanhas}ª campanha`];
    if (h.totalInvestido) partes.push(`${formatoMoeda.format(h.totalInvestido)} investidos`);
    if (h.impressoesTotais) partes.push(`${formatoNumero.format(Math.round(h.impressoesTotais))} impressões contratadas`);
    if (h.desde) partes.push(`desde ${formatoData.format(new Date(h.desde))}`);
    return partes.join(' · ');
  }

  function renderHistorico() {
    if (!elHistorico) return;
    const texto = textoHistorico(historico);
    elHistorico.textContent = texto;
    elHistorico.hidden = !texto;
  }

  // Fim de verdade quando o orçamento acaba. Sem isso as impressões seguiriam
  // subindo com o gasto travado no teto — ou seja, entrega de graça, e a
  // identidade gasto = impressões/1000 × CPM deixaria de valer.
  function encerrarCampanha() {
    if (!campanha || campanha.encerrada) return;
    campanha.encerrada = true;
    stats.impressoes = campanha.impressoesContratadas;
    limparIntervalos(); // para métricas, ticker e a geração de arcos de uma vez
    recalcularGasto();
    atualizarMetricasHud();
    atualizarOrcamento();

    definirEstadoAoVivo(false);
    // A hora do fim não é "agora": numa retomada de F5 o orçamento pode ter
    // acabado horas atrás. Sai do próprio início + a duração da entrega, e nunca
    // passa do relógio atual.
    const fim = Math.min(Date.now(), campanha.inicio + MINUTOS_ENTREGA * 60 * 1000);
    statusDesde.textContent = `Encerrada às ${formatoHora.format(new Date(fim))} · orçamento esgotado`;
    adicionarTickerTexto('🏁 Orçamento esgotado — entrega encerrada · Nova Iorque, NY');
    if (btnNovaCampanha) btnNovaCampanha.hidden = false;
    if (window.AdminGlobo) pararCamadasTrafego(window.AdminGlobo);
  }

  // "Nova campanha": esquece a que esgotou e recomeça do zero — orçamento cheio,
  // público re-sorteado, arcos de volta no globo. O histórico NÃO é apagado; é
  // justamente ele que faz a próxima rodada dizer "3ª campanha".
  function comecarNovaCampanha() {
    limparIntervalos();
    apagarStorage(CHAVE_STORAGE_CAMPANHA);
    if (btnNovaCampanha) btnNovaCampanha.hidden = true;
    renderSegmentacao();
    iniciarContadores();
    if (window.AdminGlobo) iniciarCamadasTrafego(window.AdminGlobo);
  }

  if (btnNovaCampanha) btnNovaCampanha.addEventListener('click', comecarNovaCampanha);

  function definirEstadoAoVivo(aoVivo) {
    statusDesde.classList.toggle('pro-status-encerrada', !aoVivo);
    if (!seloAoVivo) return;
    seloAoVivo.classList.toggle('encerrada', !aoVivo);
    const texto = seloAoVivo.querySelector('.pro-hud-ao-vivo-texto');
    if (texto) texto.textContent = aoVivo ? 'AO VIVO' : 'ENCERRADA';
  }

  function adicionarTickerTexto(texto) {
    const li = document.createElement('li');
    li.className = 'pro-ticker-item pro-ticker-item-novo';
    li.innerHTML = `<span>${texto}</span><span class="pro-ticker-tempo">agora</span>`;
    listaTicker.insertBefore(li, listaTicker.firstChild);
    while (listaTicker.children.length > MAX_TICKER) {
      listaTicker.removeChild(listaTicker.lastChild);
    }
  }

  function adicionarTicker() {
    adicionarTickerTexto(gerarEventoTicker());
  }

  // O drawer pode editar o CPM de US-NY com a campanha no ar. As impressões já
  // entregues são fato consumado, então o que muda é o preço delas: o gasto é
  // recalculado pelo CPM novo e o total contratado encolhe/cresce junto. Se o
  // preço subir tanto que o orçamento já não cobre o que foi entregue, a
  // campanha encerra na hora — que é o que aconteceria de verdade.
  document.addEventListener('admin-precos-alterados', () => {
    if (!campanha || campanha.encerrada) return;
    const novoCpm = cpmAtual();
    if (novoCpm === campanha.cpm) return;
    campanha.cpm = novoCpm;
    campanha.impressoesContratadas = (ORCAMENTO_ALOCADO / novoCpm) * 1000;
    salvarCampanha(); // o CPM novo precisa sobreviver ao F5 junto com a campanha
    if (stats.impressoes >= campanha.impressoesContratadas) {
      encerrarCampanha();
      return;
    }
    recalcularGasto();
    atualizarMetricasHud();
    atualizarOrcamento();
  });

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
      }, 3500)
    );
  }

  function pararCamadasTrafego(globo) {
    arcos = [];
    globo.arcsData([]).ringsData([]);
  }

  // ---------------- Ativar / sair do modo PRO ----------------
  let autoRotatePrevio = null;

  // `retomada` chega preenchida quando o modo PRO está voltando de um F5 — nesse
  // caso a intro não roda (o checkout já aconteceu) e a campanha continua a
  // mesma, com o tempo que passou já descontado.
  function ativarModoPro(retomada) {
    const globo = window.AdminGlobo;

    faixaHud.hidden = false;
    drawerPais.hidden = true;
    drawerPro.hidden = false;
    btnAtivar.hidden = true;
    btnSair.hidden = false;
    if (btnNovaCampanha) btnNovaCampanha.hidden = true;

    renderSegmentacao();
    iniciarContadores(retomada); // é quem escreve o "Ativa desde", pra hora bater com o gasto exibido

    if (globo) {
      autoRotatePrevio = globo.controls().autoRotate;
      globo.controls().autoRotate = false;
      globo.pointOfView({ lat: NYC.lat, lng: NYC.lng, altitude: 1.6 }, 2200);
      // Campanha retomada já esgotada não ganha arcos de tráfego de volta: sem
      // orçamento não há entrega, e o globo tem que contar a mesma história que
      // o selo "ENCERRADA".
      if (!campanha.encerrada) iniciarCamadasTrafego(globo);
    }
  }

  function desativarModoPro() {
    limparIntervalos();
    campanha = null; // zera o estado "encerrada" pra uma próxima ativação começar limpa
    // Sair do PRO é abandonar a campanha de vez: sem apagar isso, o próximo F5
    // jogaria você de volta no modo PRO sem ter clicado em nada.
    apagarStorage(CHAVE_STORAGE_CAMPANHA);
    definirEstadoAoVivo(true);
    if (btnNovaCampanha) btnNovaCampanha.hidden = true;
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

  // Se havia campanha salva, o modo PRO volta sozinho — sem intro, porque o
  // checkout já rolou. Só depois do globo pronto: o HUD precisa dele pros arcos,
  // e o globo só carrega quando a aba Mapa de Anúncios é aberta.
  function retomarCampanhaSalva() {
    const salva = lerStorage(CHAVE_STORAGE_CAMPANHA);
    if (!salva || !salva.inicio) return;
    ativarModoPro(salva);
  }

  function aoGloboPronto() {
    habilitarBotao();
    retomarCampanhaSalva();
  }
  if (window.AdminGlobo) {
    aoGloboPronto();
  } else {
    document.addEventListener('admin-globo-pronto', aoGloboPronto, { once: true });
  }
});
