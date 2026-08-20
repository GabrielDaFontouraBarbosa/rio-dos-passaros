const parede = document.getElementById('muralParede');
const form = document.getElementById('muralForm');
const status = document.getElementById('muralStatus');

const CORES = ['cartinha--amarela', 'cartinha--rosa', 'cartinha--azul', 'cartinha--verde', 'cartinha--laranja'];

document.addEventListener('DOMContentLoaded', async () => {
  await verificarSessaoAdmin();
  await carregarMural();
});

// Mostra os botões de apagar só pra quem já passou pelo login do admin
// (mesma sessão usada em admin.html). Quem não está logado nem vê o botão.
async function verificarSessaoAdmin() {
  try {
    const res = await fetch('./sessao.php');
    const dados = await res.json();
    parede.classList.toggle('mural-admin', Boolean(dados.ok));
  } catch (erro) {
    parede.classList.remove('mural-admin');
  }
}

async function carregarMural() {
  try {
    const res = await fetch(`./data/mural.json?v=${Date.now()}`, { cache: 'no-store' });
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

async function apagarCartinha(id, elemento) {
  if (!confirm('Apagar esta cartinha do mural?')) return;

  try {
    const res = await fetch('./mural-deletar.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    const dados = await res.json();

    if (!dados.ok) {
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
    const res = await fetch('./mural-postar.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, idade, mensagem, jardim }),
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
