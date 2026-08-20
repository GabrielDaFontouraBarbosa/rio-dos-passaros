// URL do Worker que guarda as cartinhas do Mural (ver workers/mural.js).
// Deixe vazio pra esconder o formulário: enquanto o Worker não estiver no
// ar, a página aparece normalmente, só sem jeito de postar ou ler nada.
const URL_MURAL = '';

const parede = document.getElementById('muralParede');
const form = document.getElementById('muralForm');
const status = document.getElementById('muralStatus');
const adminToggle = document.getElementById('muralAdminToggle');
const adminBtn = document.getElementById('muralAdminBtn');
const adminForm = document.getElementById('muralAdminForm');

const CHAVE_SENHA_ADMIN = 'muralAdminSenha';
const CORES = ['cartinha--amarela', 'cartinha--rosa', 'cartinha--azul', 'cartinha--verde', 'cartinha--laranja'];

document.addEventListener('DOMContentLoaded', () => {
  if (!URL_MURAL) {
    desligarMural();
    return;
  }

  atualizarModoAdmin();
  carregarMural();
  ligarFormularioAdmin();
});

// O Worker ainda não tem URL configurada: nada quebra, só avisa e some
// com os controles em vez de tentar postar/carregar e falhar.
function desligarMural() {
  parede.innerHTML = '';
  mostrarVazio('Mural em preparação. Volte em breve!');
  form.querySelector('.mural-btn-enviar').disabled = true;
  definirStatus('O mural ainda está sendo configurado.', 'neutro');
  adminToggle.hidden = true;
}

// ---------------- Modo admin ----------------
// Sem sessão de servidor (o site é 100% estático no GitHub Pages): a senha
// digitada fica só no sessionStorage do navegador e é reenviada a cada
// apagar. O Worker confere ela em tempo constante antes de apagar algo.
function atualizarModoAdmin() {
  const senha = sessionStorage.getItem(CHAVE_SENHA_ADMIN);
  parede.classList.toggle('mural-admin', Boolean(senha));
  adminBtn.textContent = senha ? '🔓 Sair do modo admin' : '🔒 Modo admin';
}

function ligarFormularioAdmin() {
  adminBtn.addEventListener('click', () => {
    const jaLogado = Boolean(sessionStorage.getItem(CHAVE_SENHA_ADMIN));
    if (jaLogado) {
      sessionStorage.removeItem(CHAVE_SENHA_ADMIN);
      atualizarModoAdmin();
      return;
    }
    adminForm.hidden = !adminForm.hidden;
  });

  adminForm.addEventListener('submit', (evento) => {
    evento.preventDefault();
    const campo = document.getElementById('muralAdminSenha');
    if (!campo.value) return;
    sessionStorage.setItem(CHAVE_SENHA_ADMIN, campo.value);
    campo.value = '';
    adminForm.hidden = true;
    atualizarModoAdmin();
  });
}

// ---------------- Carregar / renderizar ----------------
async function carregarMural() {
  try {
    const res = await fetch(`${URL_MURAL}/listar`, { cache: 'no-store' });
    if (!res.ok) throw new Error('não encontrado');
    const dados = await res.json();
    const mensagens = Array.isArray(dados.mensagens) ? dados.mensagens : [];

    parede.innerHTML = '';
    if (mensagens.length === 0) {
      mostrarVazio('O mural está vazio. Seja a primeira pessoa a colar uma cartinha!');
      return;
    }
    mensagens.forEach((msg, indice) => parede.appendChild(criarCartinha(msg, indice)));
  } catch (erro) {
    parede.innerHTML = '';
    mostrarVazio('Não deu pra carregar o mural agora. Tenta recarregar a página.');
  }
}

function mostrarVazio(texto) {
  const p = document.createElement('p');
  p.className = 'mural-vazio';
  p.textContent = texto;
  parede.appendChild(p);
}

// Hash simples e determinístico: a mesma cartinha sempre cai na mesma
// posição/rotação/cor, então o mural não "pula" toda vez que a página recarrega.
function hashParaSemente(id) {
  let h = 0;
  const texto = String(id);
  for (let i = 0; i < texto.length; i++) {
    h = (h * 31 + texto.charCodeAt(i)) >>> 0;
  }
  return h;
}

function criarCartinha(msg, indice) {
  const semente = hashParaSemente(msg.id ?? indice);
  const rotacao = (semente % 17) - 8; // entre -8deg e 8deg
  const deslocamento = (semente % 13) - 6; // entre -6px e 6px, jitter vertical
  const cor = CORES[semente % CORES.length];

  const cartinha = document.createElement('article');
  cartinha.className = `cartinha ${cor}`;
  cartinha.style.setProperty('--rot', `${rotacao}deg`);
  cartinha.style.setProperty('--desloc', `${deslocamento}px`);
  cartinha.style.animationDelay = `${Math.min(indice * 60, 900)}ms`;

  const data = msg.criadoEm ? formatarData(msg.criadoEm) : '';

  cartinha.innerHTML = `
    <button type="button" class="cartinha-deletar" aria-label="Apagar esta cartinha" data-id="${msg.id}">×</button>
    <p class="cartinha-mensagem">${msg.mensagem}</p>
    <div class="cartinha-rodape">
      <strong class="cartinha-nome">${msg.nome}</strong>
      <span class="cartinha-idade">${msg.idade} anos</span>
    </div>
    ${data ? `<span class="cartinha-data">${data}</span>` : ''}
  `;

  cartinha.querySelector('.cartinha-deletar').addEventListener('click', () => apagarCartinha(msg.id, cartinha));

  return cartinha;
}

function formatarData(iso) {
  try {
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch (erro) {
    return '';
  }
}

// ---------------- Apagar ----------------
async function apagarCartinha(id, elemento) {
  if (!confirm('Apagar esta cartinha do mural?')) return;

  const senha = sessionStorage.getItem(CHAVE_SENHA_ADMIN) || '';

  try {
    const res = await fetch(`${URL_MURAL}/deletar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, senha }),
    });
    const dados = await res.json();

    if (!dados.ok) {
      // Senha errada: sai do modo admin em vez de deixar tentando de novo.
      if (res.status === 403) {
        sessionStorage.removeItem(CHAVE_SENHA_ADMIN);
        atualizarModoAdmin();
      }
      alert(dados.erro || 'Não deu pra apagar agora.');
      return;
    }

    elemento.classList.add('cartinha--saindo');
    elemento.addEventListener('animationend', () => {
      elemento.remove();
      if (!parede.querySelector('.cartinha')) mostrarVazio('O mural está vazio. Seja a primeira pessoa a colar uma cartinha!');
    }, { once: true });
  } catch (erro) {
    alert('Sem conexão com o servidor. Tenta de novo em instantes.');
  }
}

// ---------------- Postar ----------------
form.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  definirStatus('', '');

  const nome = document.getElementById('muralNome').value.trim();
  const idade = document.getElementById('muralIdade').value;
  const mensagem = document.getElementById('muralMensagem').value.trim();
  const jardim = document.getElementById('muralJardim').value;

  if (!nome || !idade || !mensagem) {
    definirStatus('Preenche nome, idade e mensagem pra colar sua cartinha.', 'erro');
    return;
  }

  const botao = form.querySelector('.mural-btn-enviar');
  botao.disabled = true;
  definirStatus('Colando sua cartinha...', 'neutro');

  try {
    const res = await fetch(`${URL_MURAL}/postar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, idade: Number(idade), mensagem, jardim }),
    });
    const dados = await res.json();

    if (!dados.ok) {
      definirStatus(dados.erro || 'Não deu pra colar sua cartinha agora.', 'erro');
      botao.disabled = false;
      return;
    }

    const vazio = parede.querySelector('.mural-vazio');
    if (vazio) vazio.remove();
    if (dados.mensagem) parede.appendChild(criarCartinha(dados.mensagem, parede.children.length));

    form.reset();
    definirStatus('Cartinha colada no mural! Obrigado por participar. 🐦', 'sucesso');
    botao.disabled = false;
  } catch (erro) {
    definirStatus('Sem conexão com o servidor. Tenta de novo em instantes.', 'erro');
    botao.disabled = false;
  }
});

function definirStatus(texto, tipo) {
  status.textContent = texto;
  status.className = `mural-status ${tipo}`;
}
