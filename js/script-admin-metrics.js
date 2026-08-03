document.addEventListener('DOMContentLoaded', () => {
  const painel = document.getElementById('metricas-pane');
  if (!painel || typeof AdminData === 'undefined' || typeof Chart === 'undefined') return;

  const formatoMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const formatoNumero = new Intl.NumberFormat('pt-BR');
  const formatoData = (iso) => {
    const [ano, mes, dia] = iso.split('-');
    return `${dia}/${mes}`;
  };

  let dadosCompletos = null;
  let periodoAtual = 30;
  let ordenacaoTopPaginas = { campo: 'visitas', asc: false };
  const graficos = {};
  const pendencias = {}; // { '2026-07-31': {data, visitas, ...} }

  async function iniciar() {
    try {
      dadosCompletos = await AdminData.getMetrics(null);
      renderTudo();
    } catch (erro) {
      painel.querySelector('.aba-cabecalho').insertAdjacentHTML(
        'afterend',
        `<div class="alert alert-danger">Não foi possível carregar as métricas agora. ${erro.message}</div>`
      );
    }
  }

  function janela(dias) {
    const arr = dadosCompletos.diario;
    const atual = arr.slice(-dias);
    const anterior = arr.slice(-(dias * 2), -dias);
    return { atual, anterior };
  }

  function somar(lista, campo) {
    return lista.reduce((soma, d) => soma + d[campo], 0);
  }

  function variacaoPercentual(atual, anterior) {
    if (!anterior) return null;
    return ((atual - anterior) / anterior) * 100;
  }

  function renderKpiVariacao(elId, variacao) {
    const el = document.getElementById(elId);
    if (variacao === null || !isFinite(variacao)) {
      el.textContent = 'sem período anterior pra comparar';
      el.className = 'kpi-variacao';
      return;
    }
    const seta = variacao >= 0 ? '▲' : '▼';
    el.textContent = `${seta} ${Math.abs(variacao).toFixed(1)}% vs. período anterior`;
    el.className = `kpi-variacao ${variacao >= 0 ? 'positiva' : 'negativa'}`;
  }

  function renderKpis() {
    const { atual, anterior } = janela(periodoAtual);

    const visitasAtual = somar(atual, 'visitas');
    const visitasAnterior = somar(anterior, 'visitas');
    const unicosAtual = somar(atual, 'visitantesUnicos');
    const unicosAnterior = somar(anterior, 'visitantesUnicos');
    const receitaAtual = somar(atual, 'receita');
    const receitaAnterior = somar(anterior, 'receita');
    const impressoesAtual = somar(atual, 'impressoes');
    const impressoesAnterior = somar(anterior, 'impressoes');
    const rpmAtual = impressoesAtual ? (receitaAtual / impressoesAtual) * 1000 : 0;
    const rpmAnterior = impressoesAnterior ? (receitaAnterior / impressoesAnterior) * 1000 : 0;

    document.getElementById('kpiVisitas').textContent = formatoNumero.format(visitasAtual);
    document.getElementById('kpiVisitantes').textContent = formatoNumero.format(unicosAtual);
    document.getElementById('kpiReceita').textContent = formatoMoeda.format(receitaAtual);
    document.getElementById('kpiRpm').textContent = formatoMoeda.format(rpmAtual);

    renderKpiVariacao('kpiVisitasVariacao', variacaoPercentual(visitasAtual, visitasAnterior));
    renderKpiVariacao('kpiVisitantesVariacao', variacaoPercentual(unicosAtual, unicosAnterior));
    renderKpiVariacao('kpiReceitaVariacao', variacaoPercentual(receitaAtual, receitaAnterior));
    renderKpiVariacao('kpiRpmVariacao', variacaoPercentual(rpmAtual, rpmAnterior));
  }

  function destruirGrafico(chave) {
    if (graficos[chave]) {
      graficos[chave].destroy();
      delete graficos[chave];
    }
  }

  function renderGraficoAcessos(atual) {
    destruirGrafico('acessos');
    const ctx = document.getElementById('graficoAcessos').getContext('2d');
    graficos.acessos = new Chart(ctx, {
      type: 'line',
      data: {
        labels: atual.map((d) => formatoData(d.data)),
        datasets: [
          {
            label: 'Visitas',
            data: atual.map((d) => d.visitas),
            borderColor: '#e5484d',
            backgroundColor: 'rgba(229,72,77,0.18)',
            fill: true,
            tension: 0.3,
          },
          {
            label: 'Visitantes únicos',
            data: atual.map((d) => d.visitantesUnicos),
            borderColor: '#3ecf8e',
            backgroundColor: 'rgba(62,207,142,0.12)',
            fill: true,
            tension: 0.3,
          },
        ],
      },
      options: opcoesBase({
        tooltipCallback: (ctx) => ` ${ctx.dataset.label}: ${formatoNumero.format(ctx.parsed.y)}`,
      }),
    });
  }

  function renderGraficoReceita(atual) {
    destruirGrafico('receita');
    const ctx = document.getElementById('graficoReceita').getContext('2d');
    graficos.receita = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: atual.map((d) => formatoData(d.data)),
        datasets: [
          {
            label: 'Receita AdSense',
            data: atual.map((d) => d.receita),
            backgroundColor: '#3ecf8e',
            borderRadius: 4,
          },
        ],
      },
      options: opcoesBase({
        tooltipCallback: (ctx) => ` ${formatoMoeda.format(ctx.parsed.y)}`,
      }),
    });
  }

  function renderGraficoImpressoesCliques(atual) {
    destruirGrafico('impressoesCliques');
    const ctx = document.getElementById('graficoImpressoesCliques').getContext('2d');
    graficos.impressoesCliques = new Chart(ctx, {
      data: {
        labels: atual.map((d) => formatoData(d.data)),
        datasets: [
          {
            type: 'bar',
            label: 'Impressões',
            data: atual.map((d) => d.impressoes),
            backgroundColor: 'rgba(229,72,77,0.55)',
            yAxisID: 'y',
          },
          {
            type: 'bar',
            label: 'Cliques',
            data: atual.map((d) => d.cliques),
            backgroundColor: 'rgba(62,207,142,0.7)',
            yAxisID: 'y',
          },
          {
            type: 'line',
            label: 'CTR (%)',
            data: atual.map((d) => (d.impressoes ? (d.cliques / d.impressoes) * 100 : 0)),
            borderColor: '#f2c94c',
            yAxisID: 'y1',
            tension: 0.3,
          },
        ],
      },
      options: opcoesBase({
        tooltipCallback: (ctx) =>
          ctx.dataset.label === 'CTR (%)'
            ? ` CTR: ${ctx.parsed.y.toFixed(2)}%`
            : ` ${ctx.dataset.label}: ${formatoNumero.format(ctx.parsed.y)}`,
        eixoSecundario: true,
      }),
    });
  }

  function renderGraficoOrigem() {
    destruirGrafico('origem');
    const origem = dadosCompletos.origemTrafego;
    const ctx = document.getElementById('graficoOrigem').getContext('2d');
    graficos.origem = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Busca orgânica', 'Direto', 'Redes sociais', 'Referência'],
        datasets: [
          {
            data: [origem.organico, origem.direto, origem.redesSociais, origem.referencia],
            backgroundColor: ['#3ecf8e', '#e5484d', '#f2c94c', '#5b8def'],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { color: '#eef1f6' } },
          tooltip: { callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.parsed}%` } },
        },
      },
    });
  }

  function opcoesBase({ tooltipCallback, eixoSecundario }) {
    const escalas = {
      x: { ticks: { color: '#8b93a1' }, grid: { color: 'rgba(255,255,255,0.05)' } },
      y: { ticks: { color: '#8b93a1' }, grid: { color: 'rgba(255,255,255,0.05)' }, beginAtZero: true },
    };
    if (eixoSecundario) {
      escalas.y1 = {
        position: 'right',
        ticks: { color: '#8b93a1', callback: (v) => `${v}%` },
        grid: { display: false },
        beginAtZero: true,
      };
    }
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      scales: escalas,
      plugins: {
        legend: { labels: { color: '#eef1f6' } },
        tooltip: { callbacks: { label: tooltipCallback } },
      },
    };
  }

  function renderTabelaTopPaginas() {
    const corpo = document.querySelector('#tabelaTopPaginas tbody');
    const linhas = [...dadosCompletos.topPaginas].sort((a, b) => {
      const campo = ordenacaoTopPaginas.campo;
      const dir = ordenacaoTopPaginas.asc ? 1 : -1;
      return a[campo] > b[campo] ? dir : a[campo] < b[campo] ? -dir : 0;
    });
    corpo.innerHTML = linhas
      .map(
        (p) => `<tr>
          <td>${p.pagina}</td>
          <td class="num tabular">${formatoNumero.format(p.visitas)}</td>
          <td class="num tabular">${formatoMoeda.format(p.receita)}</td>
        </tr>`
      )
      .join('');
  }

  document.querySelectorAll('#tabelaTopPaginas th[data-campo]').forEach((th) => {
    th.addEventListener('click', () => {
      const campo = th.dataset.campo;
      if (ordenacaoTopPaginas.campo === campo) {
        ordenacaoTopPaginas.asc = !ordenacaoTopPaginas.asc;
      } else {
        ordenacaoTopPaginas = { campo, asc: false };
      }
      renderTabelaTopPaginas();
    });
  });

  function renderPainelEdicao() {
    const { atual } = janela(periodoAtual);
    const corpo = document.querySelector('#tabelaEdicaoMetricas tbody');
    corpo.innerHTML = atual
      .map((d) => {
        const p = pendencias[d.data] || d;
        return `<tr data-data="${d.data}">
          <td>${formatoData(d.data)}</td>
          <td><input type="number" min="0" step="1" data-campo="visitas" value="${p.visitas}"></td>
          <td><input type="number" min="0" step="1" data-campo="visitantesUnicos" value="${p.visitantesUnicos}"></td>
          <td><input type="number" min="0" step="1" data-campo="impressoes" value="${p.impressoes}"></td>
          <td><input type="number" min="0" step="1" data-campo="cliques" value="${p.cliques}"></td>
          <td><input type="number" min="0" step="0.01" data-campo="receita" value="${p.receita}"></td>
        </tr>`;
      })
      .join('');

    corpo.querySelectorAll('input').forEach((input) => {
      input.addEventListener('input', () => {
        const tr = input.closest('tr');
        const data = tr.dataset.data;
        const original = dadosCompletos.diario.find((d) => d.data === data);
        const atualLinha = pendencias[data] || { ...original };
        atualLinha[input.dataset.campo] = Number(input.value);
        pendencias[data] = atualLinha;
        atualizarAvisoNaoSalvo();
      });
    });
  }

  function atualizarAvisoNaoSalvo() {
    const temPendencia = Object.keys(pendencias).length > 0;
    document.getElementById('avisoNaoSalvoMetricas').hidden = !temPendencia;
  }

  document.getElementById('btnSalvarMetricas').addEventListener('click', async () => {
    const linhas = Object.values(pendencias);
    if (!linhas.length) return;
    const btn = document.getElementById('btnSalvarMetricas');
    btn.disabled = true;
    btn.textContent = 'Salvando...';
    try {
      await AdminData.saveMetrics(linhas);
      linhas.forEach((linha) => {
        const idx = dadosCompletos.diario.findIndex((d) => d.data === linha.data);
        if (idx >= 0) dadosCompletos.diario[idx] = linha;
      });
      Object.keys(pendencias).forEach((k) => delete pendencias[k]);
      atualizarAvisoNaoSalvo();
      renderTudo();
    } catch (erro) {
      alert(`Não deu pra salvar: ${erro.message}`);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Salvar';
    }
  });

  document.getElementById('btnDescartarMetricas').addEventListener('click', () => {
    Object.keys(pendencias).forEach((k) => delete pendencias[k]);
    atualizarAvisoNaoSalvo();
    renderPainelEdicao();
  });

  window.addEventListener('beforeunload', (e) => {
    if (Object.keys(pendencias).length) {
      e.preventDefault();
      e.returnValue = '';
    }
  });

  const botaoAbaMetricas = document.querySelector('button[data-bs-target="#metricas-pane"]');
  if (botaoAbaMetricas) {
    botaoAbaMetricas.addEventListener('hide.bs.tab', (e) => {
      if (Object.keys(pendencias).length && !confirm('Você tem alterações não salvas nas métricas. Sair mesmo assim?')) {
        e.preventDefault();
      }
    });
  }

  function renderTudo() {
    const { atual } = janela(periodoAtual);
    renderKpis();
    renderGraficoAcessos(atual);
    renderGraficoReceita(atual);
    renderGraficoImpressoesCliques(atual);
    renderGraficoOrigem();
    renderTabelaTopPaginas();
    renderPainelEdicao();
  }

  document.querySelectorAll('#seletorPeriodoMetricas button').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (Object.keys(pendencias).length && !confirm('Trocar o período descarta as alterações não salvas na tabela de edição. Continuar?')) {
        return;
      }
      Object.keys(pendencias).forEach((k) => delete pendencias[k]);
      atualizarAvisoNaoSalvo();
      periodoAtual = Number(btn.dataset.periodo);
      document.querySelectorAll('#seletorPeriodoMetricas button').forEach((b) => b.classList.remove('ativo'));
      btn.classList.add('ativo');
      renderTudo();
    });
  });

  AdminLock.aoMudar(() => {
    // o painel de edição só é útil (e só aparece) com o cadeado destrancado;
    // a visibilidade em si é controlada por CSS (body.admin-desbloqueado)
  });

  iniciar();
});
