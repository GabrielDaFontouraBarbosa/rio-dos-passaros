document.addEventListener('DOMContentLoaded', () => {
  const pane = document.getElementById('mapa-anuncios-pane');
  const botaoAba = document.querySelector('button[data-bs-target="#mapa-anuncios-pane"]');
  if (!pane || !botaoAba || typeof AdminData === 'undefined') return;

  const GEOJSON_URL = './data/paises-110m.geojson';
  const GEOJSON_ESTADOS_EUA_URL = './data/estados-eua.geojson';
  const formatoMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const formatoNumero = new Intl.NumberFormat('pt-BR');

  const NOMES_PT = {
    BRA: 'Brasil', USA: 'Estados Unidos', GBR: 'Reino Unido', DEU: 'Alemanha',
    CHE: 'Suíça', NOR: 'Noruega', AUS: 'Austrália', CAN: 'Canadá',
    NLD: 'Países Baixos', SWE: 'Suécia', DNK: 'Dinamarca', IRL: 'Irlanda',
    BEL: 'Bélgica', AUT: 'Áustria', SGP: 'Singapura', KOR: 'Coreia do Sul',
    NZL: 'Nova Zelândia', JPN: 'Japão', FRA: 'França', ITA: 'Itália',
    ESP: 'Espanha', PRT: 'Portugal', CHL: 'Chile', URY: 'Uruguai',
    ARG: 'Argentina', MEX: 'México', COL: 'Colômbia', PER: 'Peru',
    ZAF: 'África do Sul', IND: 'Índia',
  };

  // Estados dos EUA: mostrados individualmente no globo (em vez do país
  // inteiro como um bloco só), com sigla postal como chave de preço (US-NY).
  const SIGLA_ESTADOS_EUA = {
    Alabama: 'AL', Alaska: 'AK', Arizona: 'AZ', Arkansas: 'AR', California: 'CA',
    Colorado: 'CO', Connecticut: 'CT', Delaware: 'DE', 'District of Columbia': 'DC',
    Florida: 'FL', Georgia: 'GA', Hawaii: 'HI', Idaho: 'ID', Illinois: 'IL',
    Indiana: 'IN', Iowa: 'IA', Kansas: 'KS', Kentucky: 'KY', Louisiana: 'LA',
    Maine: 'ME', Maryland: 'MD', Massachusetts: 'MA', Michigan: 'MI', Minnesota: 'MN',
    Mississippi: 'MS', Missouri: 'MO', Montana: 'MT', Nebraska: 'NE', Nevada: 'NV',
    'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY',
    'North Carolina': 'NC', 'North Dakota': 'ND', Ohio: 'OH', Oklahoma: 'OK', Oregon: 'OR',
    Pennsylvania: 'PA', 'Puerto Rico': 'PR', 'Rhode Island': 'RI', 'South Carolina': 'SC',
    'South Dakota': 'SD', Tennessee: 'TN', Texas: 'TX', Utah: 'UT', Vermont: 'VT',
    Virginia: 'VA', Washington: 'WA', 'West Virginia': 'WV', Wisconsin: 'WI', Wyoming: 'WY',
  };
  const NOMES_PT_ESTADOS_EUA = { NY: 'Nova Iorque' };
  const SIGLA_ESTADO_DESTACADO = 'NY'; // destaque visual pedido pra Nova Iorque

  function isoDoPais(props) {
    if (props.ISO_A3 && props.ISO_A3 !== '-99') return props.ISO_A3;
    if (props.ISO_A3_EH && props.ISO_A3_EH !== '-99') return props.ISO_A3_EH;
    return props.ADM0_A3;
  }

  // Chave única pra qualquer polígono do globo: país (ISO A3) ou estado dos
  // EUA ("US-" + sigla postal, ex. US-NY). Usada pra indexar os preços.
  function chaveDoPoligono(props) {
    if (props.__estadoEUA) return `US-${props.__siglaEUA}`;
    return isoDoPais(props);
  }

  function nomeDoPoligono(props) {
    if (props.__estadoEUA) {
      return NOMES_PT_ESTADOS_EUA[props.__siglaEUA] || props.name;
    }
    const iso = isoDoPais(props);
    return NOMES_PT[iso] || props.NAME || 'País';
  }

  function ehEstadoDestacado(props) {
    return !!props.__estadoEUA && props.__siglaEUA === SIGLA_ESTADO_DESTACADO;
  }

  function nomeParaChave(chave) {
    if (chave.startsWith('US-')) {
      const sigla = chave.slice(3);
      return NOMES_PT_ESTADOS_EUA[sigla] || sigla;
    }
    return NOMES_PT[chave] || chave;
  }

  function bandeiraEmoji(iso2) {
    if (!iso2 || iso2.length !== 2 || iso2 === '-9') return '🏳️';
    return String.fromCodePoint(...[...iso2.toUpperCase()].map((c) => 127397 + c.charCodeAt(0)));
  }

  function suportaWebGL() {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }

  function corHex(hex1, hex2, t) {
    const c1 = [1, 3, 5].map((i) => parseInt(hex1.slice(i, i + 2), 16));
    const c2 = [1, 3, 5].map((i) => parseInt(hex2.slice(i, i + 2), 16));
    const rgb = c1.map((v, i) => Math.round(v + (c2[i] - v) * t));
    return `rgb(${rgb.join(',')})`;
  }

  function corPorPreco(t) {
    // verde (barato) -> âmbar -> vermelho (caro), paleta da plumagem
    if (t <= 0.5) return corHex('#3ecf8e', '#f2c94c', t / 0.5);
    return corHex('#f2c94c', '#e5484d', (t - 0.5) / 0.5);
  }

  let precos = {}; // { chave: {cpm,cpc,reach,currency} }, chave = ISO A3 ou "US-XX"
  let geoFeatures = [];
  let cpmMax = 1;
  let globo = null;
  let inicializado = false;
  let paisSelecionadoIso = null;

  function tPreco(chave) {
    const p = precos[chave];
    if (!p) return null;
    return Math.max(0, Math.min(1, p.cpm / cpmMax));
  }

  function corDoPais(props) {
    if (ehEstadoDestacado(props)) return '#ffd60a'; // Nova Iorque sempre em destaque, à parte da escala
    const t = tPreco(chaveDoPoligono(props));
    return t === null ? '#3a4150' : corPorPreco(t);
  }

  function altitudeDoPais(props) {
    const t = tPreco(chaveDoPoligono(props));
    const base = t === null ? 0.008 : 0.02 + t * 0.32;
    return ehEstadoDestacado(props) ? base + 0.05 : base;
  }

  function tooltipDoPais(props) {
    const chave = chaveDoPoligono(props);
    const nome = nomeDoPoligono(props);
    const p = precos[chave];
    const destaque = ehEstadoDestacado(props) ? ' ⭐' : '';
    if (!p) {
      return `<div class="globo-tooltip"><strong>${nome}${destaque}</strong><br>Sem preço definido</div>`;
    }
    return `<div class="globo-tooltip"><strong>${nome}${destaque}</strong><br>CPM: ${formatoMoeda.format(p.cpm)}</div>`;
  }

  function renderDrawerVazio() {
    const drawer = document.getElementById('drawerPais');
    drawer.classList.add('vazio');
    drawer.innerHTML = 'Clique num país no globo pra ver os detalhes de anúncio dele aqui.';
  }

  function renderDrawer(props, emEdicao = false) {
    const iso = chaveDoPoligono(props);
    const nome = nomeDoPoligono(props) + (ehEstadoDestacado(props) ? ' ⭐' : '');
    const iso2 = props.__estadoEUA ? 'US' : (props.ISO_A2 && props.ISO_A2 !== '-99' ? props.ISO_A2 : '');
    const p = precos[iso] || { cpm: 0, cpc: 0, reach: 0, currency: 'BRL' };
    const drawer = document.getElementById('drawerPais');
    drawer.classList.remove('vazio');

    if (emEdicao) {
      drawer.innerHTML = `
        <div class="drawer-pais-nome">${bandeiraEmoji(iso2)} ${nome}</div>
        <div class="drawer-pais-iso">${iso}</div>
        <div class="drawer-linha"><span>CPM (R$)</span><input type="number" min="0" step="0.01" id="editCpm" value="${p.cpm}"></div>
        <div class="drawer-linha"><span>CPC (R$)</span><input type="number" min="0" step="0.01" id="editCpc" value="${p.cpc}"></div>
        <div class="drawer-linha"><span>Alcance/mês</span><input type="number" min="0" step="1" id="editReach" value="${p.reach}"></div>
        <div class="acoes-edicao">
          <button class="btn-salvar" id="btnSalvarPais">Salvar preços</button>
          <button class="btn-descartar" id="btnCancelarEdicaoPais">Cancelar</button>
        </div>
      `;
      document.getElementById('btnSalvarPais').addEventListener('click', async () => {
        const cpm = Number(document.getElementById('editCpm').value);
        const cpc = Number(document.getElementById('editCpc').value);
        const reach = Number(document.getElementById('editReach').value);
        if ([cpm, cpc, reach].some((v) => isNaN(v) || v < 0)) {
          alert('Usa só números maiores ou iguais a zero.');
          return;
        }
        try {
          await AdminData.savePricing({ [iso]: { cpm, cpc, reach, currency: 'BRL' } });
          precos[iso] = { cpm, cpc, reach, currency: 'BRL' };
          recalcularCpmMax();
          atualizarCamadaPoligonos();
          renderDrawer(props, false);
        } catch (erro) {
          alert(`Não deu pra salvar: ${erro.message}`);
        }
      });
      document.getElementById('btnCancelarEdicaoPais').addEventListener('click', () => renderDrawer(props, false));
      return;
    }

    drawer.innerHTML = `
      <div class="drawer-pais-nome">${bandeiraEmoji(iso2)} ${nome}</div>
      <div class="drawer-pais-iso">${iso}</div>
      <div class="drawer-linha"><span>CPM</span><span>${p ? formatoMoeda.format(p.cpm) : '—'}</span></div>
      <div class="drawer-linha"><span>CPC</span><span>${p ? formatoMoeda.format(p.cpc) : '—'}</span></div>
      <div class="drawer-linha"><span>Alcance estimado</span><span>${p ? formatoNumero.format(p.reach) + '/mês' : '—'}</span></div>
      ${!precos[iso] ? '<p class="drawer-pais-iso">Sem preço definido ainda.</p>' : ''}
      <div class="acoes-edicao">
        <button class="btn-salvar somente-edicao" id="btnEditarPais">Editar</button>
      </div>
    `;
    const btnEditar = document.getElementById('btnEditarPais');
    if (btnEditar) btnEditar.addEventListener('click', () => renderDrawer(props, true));
  }

  function recalcularCpmMax() {
    // a escala de cor/altura dos países é calibrada só pelos países — um
    // "pacote" de estado dos EUA (ex.: US-NY a R$1500) não pode esmagar a
    // escala de todo mundo. Nova Iorque tem tratamento visual à parte.
    const valores = Object.entries(precos)
      .filter(([chave]) => !chave.startsWith('US-'))
      .map(([, p]) => p.cpm);
    cpmMax = valores.length ? Math.max(...valores) : 1;
  }

  function atualizarCamadaPoligonos() {
    if (!globo) return;
    globo
      .polygonCapColor((d) => corDoPais(d.properties))
      .polygonAltitude((d) => altitudeDoPais(d.properties))
      .polygonStrokeColor((d) => (ehEstadoDestacado(d.properties) ? '#ffd60a' : 'rgba(15,19,25,0.6)'))
      .polygonLabel((d) => tooltipDoPais(d.properties));
  }

  async function renderFallbackTabela(mensagemErro) {
    const wrap = document.getElementById('globo-wrap');
    let linhas = '';
    try {
      if (!Object.keys(precos).length) precos = (await AdminData.getPricing()).precos;
      linhas = Object.entries(precos)
        .sort((a, b) => b[1].cpm - a[1].cpm)
        .map(([chave, p]) => `<tr><td>${nomeParaChave(chave)}</td><td>${chave}</td><td class="num tabular">${formatoMoeda.format(p.cpm)}</td><td class="num tabular">${formatoMoeda.format(p.cpc)}</td><td class="num tabular">${formatoNumero.format(p.reach)}</td></tr>`)
        .join('');
    } catch (e) {
      /* segue com tabela vazia */
    }
    wrap.innerHTML = `
      <div class="tabela-fallback-wrap">
        ${mensagemErro ? `<p class="globo-fallback-aviso" style="position:static;padding:0 0 12px;">${mensagemErro}</p>` : ''}
        <table class="tabela-plumagem">
          <thead><tr><th>País</th><th>ISO</th><th class="num">CPM</th><th class="num">CPC</th><th class="num">Alcance/mês</th></tr></thead>
          <tbody>${linhas || '<tr><td colspan="5">Nenhum país com preço definido ainda. Destranque o cadeado para começar.</td></tr>'}</tbody>
        </table>
      </div>`;
  }

  async function inicializarGlobo() {
    if (inicializado) return;
    inicializado = true;

    if (!suportaWebGL() || typeof Globe === 'undefined') {
      await renderFallbackTabela('Seu navegador não suporta o globo 3D (WebGL). Mostrando os preços em tabela.');
      return;
    }

    try {
      const [geo, geoEstadosEUA, precosResp] = await Promise.all([
        fetch(GEOJSON_URL).then((r) => r.json()),
        fetch(GEOJSON_ESTADOS_EUA_URL).then((r) => r.json()),
        AdminData.getPricing(),
      ]);

      // tira o polígono único dos EUA e entra com os estados individuais no lugar
      const paisesSemEUA = geo.features.filter((f) => isoDoPais(f.properties) !== 'USA');
      const estadosEUA = geoEstadosEUA.features.map((f) => {
        const sigla = SIGLA_ESTADOS_EUA[f.properties.name] || '??';
        f.properties.__estadoEUA = true;
        f.properties.__siglaEUA = sigla;
        return f;
      });
      geoFeatures = [...paisesSemEUA, ...estadosEUA];

      precos = precosResp.precos || {};
      recalcularCpmMax();

      const host = document.getElementById('globo-canvas-host');
      document.getElementById('globo-skeleton').remove();

      const reduzMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      globo = Globe()(host)
        .backgroundColor('rgba(0,0,0,0)')
        .showAtmosphere(true)
        .atmosphereColor('#3ecf8e')
        .atmosphereAltitude(0.18)
        .polygonsData(geoFeatures)
        .polygonCapCurvatureResolution(6)
        .polygonGeoJsonGeometry((d) => d.geometry)
        .polygonCapColor((d) => corDoPais(d.properties))
        .polygonSideColor(() => 'rgba(0,0,0,0.25)')
        .polygonStrokeColor((d) => (ehEstadoDestacado(d.properties) ? '#ffd60a' : 'rgba(15,19,25,0.6)'))
        .polygonAltitude((d) => altitudeDoPais(d.properties))
        .polygonLabel((d) => tooltipDoPais(d.properties))
        .polygonsTransitionDuration(300)
        .onPolygonHover((d) => {
          globo.polygonAltitude((f) => (f === d ? altitudeDoPais(f.properties) + 0.03 : altitudeDoPais(f.properties)));
          host.style.cursor = d ? 'pointer' : 'grab';
        })
        .onPolygonClick((d) => {
          paisSelecionadoIso = chaveDoPoligono(d.properties);
          renderDrawer(d.properties, false);
        });

      globo.controls().autoRotate = !reduzMovimento;
      globo.controls().autoRotateSpeed = 0.5;

      function ajustarTamanho() {
        globo.width(host.clientWidth).height(host.clientHeight);
      }
      ajustarTamanho();
      window.addEventListener('resize', ajustarTamanho);

      configurarPainelPrecoPadrao();

      // Expõe a instância pronta pra outros scripts (ex.: o HUD do Plano PRO)
      // poderem desenhar camadas extra (arcos, anéis) sem duplicar a
      // inicialização do globo.
      window.AdminGlobo = globo;
      document.dispatchEvent(new CustomEvent('admin-globo-pronto', { detail: { globo } }));
    } catch (erro) {
      await renderFallbackTabela('Não foi possível carregar o mapa de anúncios agora. Tente de novo mais tarde.');
    }
  }

  function paisesSemPreco() {
    return geoFeatures.filter((f) => !precos[chaveDoPoligono(f.properties)]);
  }

  function configurarPainelPrecoPadrao() {
    const btn = document.getElementById('btnPrecoPadrao');
    if (!btn) return;
    btn.addEventListener('click', async () => {
      const cpm = Number(document.getElementById('padraoCpm').value);
      const cpc = Number(document.getElementById('padraoCpc').value);
      const reach = Number(document.getElementById('padraoReach').value);
      if ([cpm, cpc, reach].some((v) => isNaN(v) || v < 0)) {
        alert('Usa só números maiores ou iguais a zero.');
        return;
      }
      const semPreco = paisesSemPreco();
      if (!semPreco.length) {
        alert('Todos os países já têm preço definido.');
        return;
      }
      const payload = {};
      semPreco.forEach((f) => {
        payload[chaveDoPoligono(f.properties)] = { cpm, cpc, reach, currency: 'BRL' };
      });
      btn.disabled = true;
      try {
        await AdminData.savePricing(payload);
        Object.assign(precos, payload);
        recalcularCpmMax();
        atualizarCamadaPoligonos();
        alert(`Preço padrão aplicado a ${semPreco.length} localidade(s).`);
      } catch (erro) {
        alert(`Não deu pra aplicar: ${erro.message}`);
      } finally {
        btn.disabled = false;
      }
    });
  }

  botaoAba.addEventListener('shown.bs.tab', () => {
    if (!inicializado) {
      inicializarGlobo();
      renderDrawerVazio();
    } else if (globo) {
      globo.resumeAnimation();
    }
  });

  botaoAba.addEventListener('hidden.bs.tab', () => {
    if (globo) globo.pauseAnimation();
  });

  document.addEventListener('visibilitychange', () => {
    if (!globo) return;
    if (document.hidden) globo.pauseAnimation();
    else if (pane.classList.contains('active')) globo.resumeAnimation();
  });
});
