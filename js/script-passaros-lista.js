document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('listaGrid');
  const contagem = document.getElementById('listaContagem');
  const busca = document.getElementById('buscaPassaro');
  const modal = document.getElementById('modalPassaro');
  const btnFechar = document.getElementById('fecharModalPassaro');

  let passaros = [];

  try {
    const res = await fetch('./data/passaros.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const dados = await res.json();
    passaros = dados.passaros || [];
  } catch (erro) {
    grid.innerHTML = `<div class="lista-sem-resultado">Não foi possível carregar a lista de pássaros agora. Tente recarregar a página.</div>`;
    return;
  }

  contagem.textContent = `(${passaros.length})`;

  function renderGrid(lista) {
    if (!lista.length) {
      grid.innerHTML = '<div class="lista-sem-resultado">Nenhum pássaro encontrado com esse nome.</div>';
      return;
    }
    grid.innerHTML = lista
      .map(
        (p) => `
      <button class="passaro-card" data-id="${p.id}" type="button">
        <img src="${p.foto.arquivo}" alt="${p.nome}" loading="lazy">
        <div class="passaro-card-info">
          <p class="passaro-card-nome">${p.nome}</p>
          ${p.nomeCientifico ? `<p class="passaro-card-cientifico">${p.nomeCientifico}</p>` : ''}
        </div>
      </button>`
      )
      .join('');

    grid.querySelectorAll('.passaro-card').forEach((card) => {
      card.addEventListener('click', () => abrirModal(card.dataset.id));
    });
  }

  function abrirModal(id) {
    const p = passaros.find((x) => x.id === id);
    if (!p) return;

    document.getElementById('modalPassaroFoto').src = p.foto.arquivo;
    document.getElementById('modalPassaroFoto').alt = p.nome;
    document.getElementById('modalPassaroNome').textContent = p.nome;
    document.getElementById('modalPassaroCientifico').textContent = p.nomeCientifico || '';
    document.getElementById('modalPassaroDescricao').textContent = p.descricao || '';

    const extrasEl = document.getElementById('modalPassaroExtras');
    const linhas = [
      ['Habitat', p.habitat],
      ['Local no Brasil', p.localBrasil],
      ['Bioma', p.bioma],
      ['Coloração', p.coloracao],
      ['Base alimentar', p.baseNutricional],
    ].filter(([, valor]) => valor);
    extrasEl.innerHTML = linhas
      .map(([rotulo, valor]) => `<div class="modal-passaro-extra-row"><span>${rotulo}</span><span>${valor}</span></div>`)
      .join('');

    const creditoEl = document.getElementById('modalPassaroCredito');
    if (p.foto.autor && p.foto.fonte) {
      creditoEl.innerHTML = `Foto: ${p.foto.autor} (${p.foto.licenca || 'licença livre'}) — <a href="${p.foto.fonte}" target="_blank" rel="noopener">Wikipédia</a>`;
    } else {
      creditoEl.textContent = '';
    }

    modal.classList.remove('hidden');
  }

  function fecharModal() {
    modal.classList.add('hidden');
  }

  btnFechar.addEventListener('click', fecharModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) fecharModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') fecharModal();
  });

  busca.addEventListener('input', () => {
    const termo = busca.value.trim().toLowerCase();
    if (!termo) {
      renderGrid(passaros);
      return;
    }
    const filtrados = passaros.filter(
      (p) => p.nome.toLowerCase().includes(termo) || (p.nomeCientifico || '').toLowerCase().includes(termo)
    );
    renderGrid(filtrados);
  });

  renderGrid(passaros);
});
