// URL do Worker que recebe as inscrições (ver workers/inscrever-passaro-do-dia.js).
// Deixe vazio pra esconder o formulário: enquanto o Worker não estiver no ar, o
// card aparece normalmente, só sem o botão de inscrição.
const URL_INSCRICAO = '';

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
        ${URL_INSCRICAO ? blocoInscricao() : ''}
      </div>
    `;

    if (URL_INSCRICAO) ligarInscricao(card);
    mostrarRetornoDaConfirmacao(card);
  } catch (erro) {
    wrap.remove();
  }
});

// ---------------- Inscrição por e-mail ----------------
// O formulário nasce fechado: quem só quer ver o pássaro do dia não precisa
// desviar o olho pra um campo de e-mail.
function blocoInscricao() {
  return `
    <div class="pdd-inscricao" id="pddInscricao">
      <button type="button" class="pdd-inscricao-abrir" id="pddAbrir">
        <span aria-hidden="true">✉️</span> Receber todo dia por e-mail
      </button>

      <form class="pdd-inscricao-form" id="pddForm" hidden>
        <label class="pdd-inscricao-label" for="pddEmail">Seu e-mail</label>
        <div class="pdd-inscricao-linha">
          <input type="email" id="pddEmail" name="email" required autocomplete="email"
                 placeholder="voce@exemplo.com" maxlength="254">
          <button type="submit" class="pdd-inscricao-enviar" id="pddEnviar">Quero receber</button>
        </div>
        <!-- Campo-armadilha: invisível pra gente, irresistível pra robô. -->
        <input type="text" name="jardim" id="pddJardim" tabindex="-1" autocomplete="off" aria-hidden="true">
        <p class="pdd-inscricao-aviso">
          Um e-mail por dia com o pássaro escolhido. Mandamos um pedido de confirmação
          antes de cadastrar, e dá pra sair quando quiser pelo link no rodapé de cada e-mail.
        </p>
        <p class="pdd-inscricao-status" id="pddStatus" role="status" aria-live="polite"></p>
      </form>
    </div>
  `;
}

function ligarInscricao(card) {
  const abrir = card.querySelector('#pddAbrir');
  const form = card.querySelector('#pddForm');
  const campo = card.querySelector('#pddEmail');
  const enviar = card.querySelector('#pddEnviar');
  const status = card.querySelector('#pddStatus');
  if (!abrir || !form) return;

  abrir.addEventListener('click', () => {
    abrir.hidden = true;
    form.hidden = false;
    campo.focus();
  });

  form.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const email = campo.value.trim();
    if (!email) return;

    enviar.disabled = true;
    definirStatus(status, 'Enviando...', 'neutro');

    try {
      const resposta = await fetch(`${URL_INSCRICAO}/inscrever`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, jardim: card.querySelector('#pddJardim').value }),
      });
      const dados = await resposta.json().catch(() => ({}));

      if (!resposta.ok) {
        definirStatus(status, dados.erro || 'Não deu pra inscrever agora. Tenta de novo em instantes.', 'erro');
        enviar.disabled = false;
        return;
      }

      // Some com o formulário: o próximo passo é na caixa de entrada, não aqui.
      form.innerHTML = `
        <p class="pdd-inscricao-status sucesso">
          📬 Quase lá! Mandamos um e-mail de confirmação pra <strong>${escaparHtml(email)}</strong>.
          Clique no link de lá pra começar a receber.
        </p>`;
    } catch (erro) {
      definirStatus(status, 'Sem conexão com o servidor. Tenta de novo em instantes.', 'erro');
      enviar.disabled = false;
    }
  });
}

function definirStatus(elemento, texto, tipo) {
  if (!elemento) return;
  elemento.textContent = texto;
  elemento.className = `pdd-inscricao-status ${tipo}`;
}

function escaparHtml(texto) {
  const div = document.createElement('div');
  div.textContent = texto;
  return div.innerHTML;
}

// O Worker devolve a pessoa pro site com ?inscricao=… depois de ela clicar no
// link de confirmação — a resposta aparece no mesmo card onde ela se inscreveu.
function mostrarRetornoDaConfirmacao(card) {
  const situacao = new URLSearchParams(window.location.search).get('inscricao');
  if (!situacao) return;

  const mensagens = {
    ok: ['sucesso', '🎉 Inscrição confirmada! O pássaro de amanhã chega no seu e-mail.'],
    expirado: ['erro', '⌛ Esse link de confirmação venceu. Faça a inscrição de novo, é rapidinho.'],
    invalido: ['erro', '🔒 Esse link de confirmação não é válido. Faça a inscrição de novo.'],
    erro: ['erro', '😕 Algo deu errado ao confirmar. Tenta de novo daqui a pouco.'],
  };
  const [tipo, texto] = mensagens[situacao] || mensagens.erro;

  const aviso = document.createElement('p');
  aviso.className = `pdd-inscricao-status ${tipo} pdd-retorno`;
  aviso.setAttribute('role', 'status');
  aviso.textContent = texto;
  card.querySelector('.passaro-do-dia-texto').appendChild(aviso);

  // Tira o parâmetro da barra de endereços pra um F5 não repetir a mensagem.
  window.history.replaceState({}, '', window.location.pathname);
}
