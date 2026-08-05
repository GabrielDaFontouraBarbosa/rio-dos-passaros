document.addEventListener('DOMContentLoaded', async () => {
  const CHAVE_CARRINHO = 'rdpCarrinhoLoja';
  let produtos = null;
  let passaros = [];
  let carrinho = carregarCarrinho();

  const toastEl = document.getElementById('lojaToast');
  const carrinhoBotao = document.getElementById('btnAbrirCarrinho');
  const carrinhoContagem = document.getElementById('carrinhoContagem');
  const carrinhoPainel = document.getElementById('carrinhoPainel');
  const carrinhoLista = document.getElementById('carrinhoLista');
  const carrinhoTotalEl = document.getElementById('carrinhoTotal');
  const btnFinalizar = document.getElementById('btnFinalizar');

  try {
    const [resProdutos, resPassaros] = await Promise.all([
      fetch('./data/produtos.json', { cache: 'no-store' }),
      fetch('./data/passaros.json', { cache: 'no-store' }),
    ]);
    if (!resProdutos.ok) throw new Error('HTTP ' + resProdutos.status);
    produtos = await resProdutos.json();
    if (resPassaros.ok) {
      const dadosPassaros = await resPassaros.json();
      passaros = dadosPassaros.passaros || [];
    }
  } catch (erro) {
    document.getElementById('hqContainer').innerHTML =
      '<p class="quadros-sem-resultado">Não foi possível carregar a loja agora. Tente recarregar a página.</p>';
    document.getElementById('melContainer').innerHTML = '';
    document.getElementById('quadrosGrid').innerHTML = '';
    return;
  }

  const numeroWhatsapp = produtos.whatsapp || '5521975449779';

  renderHq();
  renderQuadros();
  renderMel();
  renderCarrinho();

  // ---------- Helpers ----------
  function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function carregarCarrinho() {
    try {
      const bruto = localStorage.getItem(CHAVE_CARRINHO);
      return bruto ? JSON.parse(bruto) : [];
    } catch (erro) {
      return [];
    }
  }

  function salvarCarrinho() {
    localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(carrinho));
  }

  function mostrarToast(mensagem) {
    toastEl.textContent = mensagem;
    toastEl.classList.add('visivel');
    clearTimeout(mostrarToast._t);
    mostrarToast._t = setTimeout(() => toastEl.classList.remove('visivel'), 1800);
  }

  function adicionarAoCarrinho(item) {
    const existente = carrinho.find((i) => i.chave === item.chave);
    if (existente) {
      existente.qtd += item.qtd;
    } else {
      carrinho.push(item);
    }
    salvarCarrinho();
    renderCarrinho();
    mostrarToast('Adicionado ao carrinho!');
  }

  function removerItem(chave) {
    carrinho = carrinho.filter((i) => i.chave !== chave);
    salvarCarrinho();
    renderCarrinho();
  }

  // ---------- HQ ----------
  function renderHq() {
    const hq = produtos.hq;
    const container = document.getElementById('hqContainer');
    container.innerHTML = `
      <div class="hq-produto">
        <div class="hq-capa">
          <span class="hq-capa-titulo">Rio dos Pássaros</span>
          <span class="hq-capa-selo">HQ</span>
          <img src="${hq.imagem}" alt="${hq.nome}">
        </div>
        <div class="hq-info">
          <p>${hq.descricao}</p>
          <div class="produto-preco">${formatarMoeda(hq.preco)} <small>/ unidade</small></div>
          <div class="qtd-control" id="hqQtdControl">
            <button type="button" data-acao="menos">−</button>
            <span id="hqQtd">1</span>
            <button type="button" data-acao="mais">+</button>
          </div>
          <button type="button" class="btn-comprar" id="btnAddHq">Adicionar ao Carrinho</button>
        </div>
      </div>
    `;

    let qtd = 1;
    const qtdEl = document.getElementById('hqQtd');
    document.getElementById('hqQtdControl').addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-acao]');
      if (!btn) return;
      qtd = btn.dataset.acao === 'mais' ? qtd + 1 : Math.max(1, qtd - 1);
      qtdEl.textContent = qtd;
    });

    document.getElementById('btnAddHq').addEventListener('click', () => {
      adicionarAoCarrinho({
        chave: 'hq',
        tipo: 'HQ',
        nome: hq.nome,
        detalhe: 'Edição impressa',
        imagem: hq.imagem,
        precoUnit: hq.preco,
        qtd,
      });
      qtd = 1;
      qtdEl.textContent = qtd;
    });
  }

  // ---------- Quadros ----------
  function renderQuadros() {
    const cfg = produtos.quadros;
    document.getElementById('quadrosDescricao').textContent = cfg.descricao;

    const grid = document.getElementById('quadrosGrid');
    const busca = document.getElementById('buscaQuadro');
    const config = document.getElementById('quadroConfig');
    const tamanhosEl = document.getElementById('quadroTamanhos');
    const moldurasEl = document.getElementById('quadroMolduras');

    let passaroSelecionado = null;
    let tamanhoSelecionado = cfg.tamanhos[0];
    let molduraSelecionada = cfg.molduras[0];
    let qtd = 1;

    tamanhosEl.innerHTML = cfg.tamanhos
      .map(
        (t, i) => `
      <label class="${i === 0 ? 'marcado' : ''}">
        <input type="radio" name="quadroTamanho" value="${t.id}" ${i === 0 ? 'checked' : ''}>
        <span>${t.nome}</span>
      </label>`
      )
      .join('');

    moldurasEl.innerHTML = cfg.molduras
      .map(
        (m, i) => `
      <label class="${i === 0 ? 'marcado' : ''}">
        <input type="radio" name="quadroMoldura" value="${m.id}" ${i === 0 ? 'checked' : ''}>
        <span>${m.nome}</span>
      </label>`
      )
      .join('');

    function atualizarMarcado(container) {
      container.querySelectorAll('label').forEach((label) => {
        const input = label.querySelector('input');
        label.classList.toggle('marcado', input.checked);
      });
    }

    tamanhosEl.addEventListener('change', (e) => {
      tamanhoSelecionado = cfg.tamanhos.find((t) => t.id === e.target.value);
      atualizarMarcado(tamanhosEl);
      atualizarPreco();
    });

    moldurasEl.addEventListener('change', (e) => {
      molduraSelecionada = cfg.molduras.find((m) => m.id === e.target.value);
      atualizarMarcado(moldurasEl);
      atualizarPreco();
    });

    function precoAtual() {
      return cfg.precoBase + (tamanhoSelecionado.adicional || 0) + (molduraSelecionada.adicional || 0);
    }

    function atualizarPreco() {
      document.getElementById('quadroPreco').innerHTML = `${formatarMoeda(precoAtual())} <small>/ unidade</small>`;
    }

    function renderGrid(lista) {
      if (!lista.length) {
        grid.innerHTML = '<p class="quadros-sem-resultado">Nenhum pássaro encontrado com esse nome.</p>';
        return;
      }
      grid.innerHTML = lista
        .map(
          (p) => `
        <button type="button" class="quadro-opcao" data-id="${p.id}">
          <div class="moldura-preview">
            <img src="${p.foto.arquivo}" alt="${p.nome}" loading="lazy">
          </div>
          <span>${p.nome}</span>
        </button>`
        )
        .join('');

      grid.querySelectorAll('.quadro-opcao').forEach((card) => {
        card.addEventListener('click', () => selecionarPassaro(card.dataset.id));
      });
    }

    function selecionarPassaro(id) {
      passaroSelecionado = passaros.find((p) => p.id === id);
      if (!passaroSelecionado) return;

      grid.querySelectorAll('.quadro-opcao').forEach((card) => {
        card.classList.toggle('selecionado', card.dataset.id === id);
      });

      document.getElementById('quadroConfigImg').src = passaroSelecionado.foto.arquivo;
      document.getElementById('quadroConfigImg').alt = passaroSelecionado.nome;
      document.getElementById('quadroConfigNome').textContent = `Quadro ${passaroSelecionado.nome}`;
      config.classList.add('ativo');
      atualizarPreco();
      config.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    document.getElementById('quadroQtdControl').addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-acao]');
      if (!btn) return;
      qtd = btn.dataset.acao === 'mais' ? qtd + 1 : Math.max(1, qtd - 1);
      document.getElementById('quadroQtd').textContent = qtd;
    });

    document.getElementById('btnAddQuadro').addEventListener('click', () => {
      if (!passaroSelecionado) {
        mostrarToast('Escolha um pássaro primeiro!');
        return;
      }
      adicionarAoCarrinho({
        chave: `quadro-${passaroSelecionado.id}-${tamanhoSelecionado.id}-${molduraSelecionada.id}`,
        tipo: 'Quadro',
        nome: `Quadro ${passaroSelecionado.nome}`,
        detalhe: `${tamanhoSelecionado.nome} • ${molduraSelecionada.nome}`,
        imagem: passaroSelecionado.foto.arquivo,
        precoUnit: precoAtual(),
        qtd,
      });
      qtd = 1;
      document.getElementById('quadroQtd').textContent = qtd;
    });

    busca.addEventListener('input', () => {
      const termo = busca.value.trim().toLowerCase();
      const filtrados = termo ? passaros.filter((p) => p.nome.toLowerCase().includes(termo)) : passaros;
      renderGrid(filtrados);
    });

    renderGrid(passaros);
  }

  // ---------- Mel ----------
  function renderMel() {
    const mel = produtos.mel;
    document.getElementById('melNome').textContent = mel.nome;

    const container = document.getElementById('melContainer');
    container.innerHTML = `
      <div class="mel-produto">
        <svg class="mel-pote" viewBox="0 0 120 150" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <defs>
            <linearGradient id="melGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#ffd54a"/>
              <stop offset="100%" stop-color="#e8930f"/>
            </linearGradient>
          </defs>
          <rect x="20" y="10" width="80" height="18" rx="4" fill="#7a5a3a"/>
          <rect x="26" y="4" width="68" height="10" rx="4" fill="#5c4023"/>
          <path d="M18 30 h84 v90 a14 14 0 0 1 -14 14 h-56 a14 14 0 0 1 -14 -14 z" fill="url(#melGrad)" stroke="#c97b0e" stroke-width="2"/>
          <ellipse cx="60" cy="34" rx="42" ry="6" fill="#ffe38a" opacity="0.6"/>
          <text x="60" y="90" text-anchor="middle" font-family="Quicksand, sans-serif" font-weight="700" font-size="14" fill="#5c4023">MEL</text>
          <text x="60" y="106" text-anchor="middle" font-family="Quicksand, sans-serif" font-size="8" fill="#5c4023">Sítio Santa Cruz</text>
        </svg>
        <div class="mel-info">
          <p>${mel.descricao}</p>
          <div class="campo-grupo">
            <label class="rotulo">Escolha o tamanho</label>
            <div class="opcoes-pill" id="melVariantes"></div>
          </div>
          <div class="produto-preco" id="melPreco"></div>
          <div class="qtd-control" id="melQtdControl">
            <button type="button" data-acao="menos">−</button>
            <span id="melQtd">1</span>
            <button type="button" data-acao="mais">+</button>
          </div>
          <button type="button" class="btn-comprar" id="btnAddMel">Adicionar ao Carrinho</button>
        </div>
      </div>
    `;

    const variantesEl = document.getElementById('melVariantes');
    let varianteSelecionada = mel.variantes[0];
    let qtd = 1;

    variantesEl.innerHTML = mel.variantes
      .map(
        (v, i) => `
      <label class="${i === 0 ? 'marcado' : ''}">
        <input type="radio" name="melVariante" value="${v.id}" ${i === 0 ? 'checked' : ''}>
        <span>${v.nome}</span>
      </label>`
      )
      .join('');

    function atualizarPreco() {
      document.getElementById('melPreco').innerHTML = `${formatarMoeda(varianteSelecionada.preco)} <small>/ unidade</small>`;
    }
    atualizarPreco();

    variantesEl.addEventListener('change', (e) => {
      varianteSelecionada = mel.variantes.find((v) => v.id === e.target.value);
      variantesEl.querySelectorAll('label').forEach((label) => {
        label.classList.toggle('marcado', label.querySelector('input').checked);
      });
      atualizarPreco();
    });

    document.getElementById('melQtdControl').addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-acao]');
      if (!btn) return;
      qtd = btn.dataset.acao === 'mais' ? qtd + 1 : Math.max(1, qtd - 1);
      document.getElementById('melQtd').textContent = qtd;
    });

    document.getElementById('btnAddMel').addEventListener('click', () => {
      adicionarAoCarrinho({
        chave: `mel-${varianteSelecionada.id}`,
        tipo: 'Mel',
        nome: mel.nome,
        detalhe: varianteSelecionada.nome,
        imagem: null,
        precoUnit: varianteSelecionada.preco,
        qtd,
      });
      qtd = 1;
      document.getElementById('melQtd').textContent = qtd;
    });
  }

  // ---------- Carrinho ----------
  function calcularTotal() {
    return carrinho.reduce((soma, item) => soma + item.precoUnit * item.qtd, 0);
  }

  function renderCarrinho() {
    const totalItens = carrinho.reduce((soma, item) => soma + item.qtd, 0);
    carrinhoContagem.textContent = totalItens;

    if (!carrinho.length) {
      carrinhoLista.innerHTML = '<p class="carrinho-vazio">Seu carrinho está vazio.</p>';
      btnFinalizar.disabled = true;
    } else {
      carrinhoLista.innerHTML = carrinho
        .map(
          (item) => `
        <div class="carrinho-item">
          ${item.imagem ? `<img src="${item.imagem}" alt="${item.nome}">` : '<span style="font-size:2rem;">🍯</span>'}
          <div class="carrinho-item-info">
            <p class="carrinho-item-nome">${item.nome}</p>
            <p class="carrinho-item-detalhe">${item.detalhe}</p>
            <div class="qtd-control" data-chave="${item.chave}">
              <button type="button" data-acao="menos">−</button>
              <span>${item.qtd}</span>
              <button type="button" data-acao="mais">+</button>
            </div>
            <p class="carrinho-item-preco">${formatarMoeda(item.precoUnit * item.qtd)}</p>
          </div>
          <button type="button" class="carrinho-item-remover" data-chave="${item.chave}" aria-label="Remover">×</button>
        </div>`
        )
        .join('');
      btnFinalizar.disabled = false;
    }

    carrinhoTotalEl.textContent = formatarMoeda(calcularTotal());

    carrinhoLista.querySelectorAll('.qtd-control').forEach((ctrl) => {
      ctrl.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-acao]');
        if (!btn) return;
        const item = carrinho.find((i) => i.chave === ctrl.dataset.chave);
        if (!item) return;
        if (btn.dataset.acao === 'mais') {
          item.qtd += 1;
        } else {
          item.qtd -= 1;
          if (item.qtd <= 0) {
            removerItem(item.chave);
            return;
          }
        }
        salvarCarrinho();
        renderCarrinho();
      });
    });

    carrinhoLista.querySelectorAll('.carrinho-item-remover').forEach((btn) => {
      btn.addEventListener('click', () => removerItem(btn.dataset.chave));
    });
  }

  carrinhoBotao.addEventListener('click', () => carrinhoPainel.classList.add('aberto'));
  document.getElementById('btnFecharCarrinho').addEventListener('click', () => carrinhoPainel.classList.remove('aberto'));
  carrinhoPainel.addEventListener('click', (e) => {
    if (e.target === carrinhoPainel) carrinhoPainel.classList.remove('aberto');
  });

  btnFinalizar.addEventListener('click', () => {
    if (!carrinho.length) return;
    const linhas = carrinho.map(
      (item, i) => `${i + 1}. ${item.nome} (${item.detalhe}) x${item.qtd} - ${formatarMoeda(item.precoUnit * item.qtd)}`
    );
    const texto = [
      'Olá! Gostaria de fazer um pedido na Loja Rio dos Pássaros:',
      '',
      ...linhas,
      '',
      `Total: ${formatarMoeda(calcularTotal())}`,
      '',
      'Aguardo confirmação de disponibilidade, frete e forma de pagamento. Obrigado!',
    ].join('\n');

    window.open(`https://wa.me/${numeroWhatsapp}?text=${encodeURIComponent(texto)}`, '_blank');
  });
});
