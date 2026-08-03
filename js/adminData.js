// Camada única de acesso aos dados do admin. Todo o resto do código fala só
// com essas funções — se um backend real entrar no lugar dos arquivos JSON,
// só este arquivo muda.
const AdminData = (() => {
  async function getMetrics(periodoDias) {
    const res = await fetch('./data/metrics.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('Não foi possível carregar as métricas.');
    const completo = await res.json();
    const diario = periodoDias ? completo.diario.slice(-periodoDias) : completo.diario;
    return { ...completo, diario };
  }

  async function saveMetrics(diario) {
    const res = await fetch('./salvar-metricas.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ diario }),
    });
    const dados = await res.json().catch(() => ({}));
    if (!res.ok || !dados.ok) throw new Error(dados.erro || 'Falha ao salvar métricas.');
    return dados;
  }

  async function getPricing() {
    const res = await fetch('./data/ad-pricing.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('Não foi possível carregar os preços.');
    return res.json();
  }

  // Aceita um ou vários países de uma vez: { BRA: {cpm,cpc,reach}, USA: {...} }
  async function savePricing(precosPorPais) {
    const res = await fetch('./salvar-precos.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ precos: precosPorPais }),
    });
    const dados = await res.json().catch(() => ({}));
    if (!res.ok || !dados.ok) throw new Error(dados.erro || 'Falha ao salvar preços.');
    return dados;
  }

  return { getMetrics, saveMetrics, getPricing, savePricing };
})();
