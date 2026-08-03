document.addEventListener('DOMContentLoaded', async () => {
  const wrap = document.getElementById('passaroDoDiaWrap');
  const card = document.getElementById('passaroDoDiaCard');
  if (!wrap || !card) return;

  try {
    const [estadoRes, passarosRes] = await Promise.all([
      fetch('./data/passaro-do-dia.json', { cache: 'no-store' }),
      fetch('./data/passaros.json', { cache: 'no-store' }),
    ]);
    if (!estadoRes.ok || !passarosRes.ok) throw new Error('não encontrado');

    const estado = await estadoRes.json();
    const { passaros } = await passarosRes.json();
    const passaro = passaros.find((p) => p.id === estado.passaroId);
    if (!passaro) throw new Error('pássaro do dia não está mais na lista');

    card.innerHTML = `
      <span class="passaro-do-dia-selo">Pássaro do dia</span>
      <img class="passaro-do-dia-foto" src="${passaro.foto.arquivo}" alt="${passaro.nome}">
      <div class="passaro-do-dia-texto">
        <h2>${passaro.nome}</h2>
        ${passaro.nomeCientifico ? `<p class="passaro-do-dia-cientifico">${passaro.nomeCientifico}</p>` : ''}
        <p class="passaro-do-dia-descricao">${passaro.descricao || ''}</p>
        <a class="passaro-do-dia-link" href="./passaros-lista.html">Ver todos os pássaros</a>
      </div>
    `;
  } catch (erro) {
    wrap.remove();
  }
});
