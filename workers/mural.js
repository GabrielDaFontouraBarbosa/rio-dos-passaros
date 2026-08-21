// Cloudflare Worker: guarda as cartinhas do Mural (nome, idade, mensagem) e
// deixa o admin apagar.
//
// Por que um Worker existe: o site está no GitHub Pages, que só serve
// arquivos estáticos — não roda PHP, não grava nada em disco. As mensagens
// do Mural moram numa KV Namespace da Cloudflare, não num arquivo do
// repositório.
//
// Três rotas:
//   GET  /listar                     → devolve todas as cartinhas
//   POST /postar  {nome, idade, mensagem, jardim} → grava uma cartinha nova
//   POST /deletar {id, senha}                       → apaga, se a senha bater
//
// Variáveis de ambiente (Settings → Variables do Worker):
//   MURAL_KV            KV Namespace onde as cartinhas ficam gravadas (binding)
//   MURAL_ADMIN_SENHA   senha pra apagar cartinha (Secret)
//   SITE_URL            ex.: https://www.riodospassaros.com.br

const CHAVE_KV = 'mensagens';
const MAX_MENSAGENS_GUARDADAS = 300;
const MAX_NOME = 40;
const MAX_MENSAGEM = 240;
// A KV da Cloudflare exige TTL mínimo de 60s pra chaves com expirationTtl —
// não dá pra usar um valor menor aqui, senão o put() lança exceção.
const INTERVALO_MINIMO_SEGUNDOS = 60;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') return responderCors(env, new Response(null, { status: 204 }));
    if (url.pathname === '/listar' && request.method === 'GET') return listar(env);
    if (url.pathname === '/postar' && request.method === 'POST') return postar(request, env);
    if (url.pathname === '/deletar' && request.method === 'POST') return deletar(request, env);

    return responderCors(env, new Response('Não encontrado', { status: 404 }));
  },
};

// ---------------- CORS ----------------
// Só o site pode chamar o Worker pelo navegador — mesma lógica do worker do
// pássaro do dia (não é proteção de verdade contra chamadas fora do
// navegador, mas evita que outro site aponte um formulário pra cá).
function cabecalhosCors(env) {
  return {
    'Access-Control-Allow-Origin': env.SITE_URL,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

function responderCors(env, resposta) {
  const headers = new Headers(resposta.headers);
  Object.entries(cabecalhosCors(env)).forEach(([k, v]) => headers.set(k, v));
  return new Response(resposta.body, { status: resposta.status, headers });
}

function json(env, dados, status = 200) {
  return responderCors(
    env,
    new Response(JSON.stringify(dados), { status, headers: { 'Content-Type': 'application/json' } })
  );
}

// ---------------- Comparação em tempo constante ----------------
// Evita que o tempo de resposta vaze quantos caracteres da senha o
// atacante já acertou. Mesma ideia usada no worker do pássaro do dia.
function iguaisEmTempoConstante(a, b) {
  if (a.length !== b.length) return false;
  let diferenca = 0;
  for (let i = 0; i < a.length; i++) diferenca |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diferenca === 0;
}

// ---------------- Armazenamento ----------------
async function lerMensagens(env) {
  const dados = await env.MURAL_KV.get(CHAVE_KV, { type: 'json' });
  return Array.isArray(dados) ? dados : [];
}

async function gravarMensagens(env, mensagens) {
  await env.MURAL_KV.put(CHAVE_KV, JSON.stringify(mensagens));
}

// Escapa como o htmlspecialchars do PHP fazia: o front-end injeta isso via
// innerHTML, então o texto precisa chegar como entidade, não como tag.
function escaparHtml(texto) {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ---------------- Rota: listar ----------------
async function listar(env) {
  const mensagens = await lerMensagens(env);
  return json(env, { mensagens });
}

// ---------------- Rota: postar ----------------
async function postar(request, env) {
  let corpo;
  try {
    corpo = await request.json();
  } catch (e) {
    return json(env, { ok: false, erro: 'Requisição inválida.' }, 400);
  }

  // Campo-armadilha: fica escondido no formulário, então gente nunca
  // preenche e robô que preenche tudo, sim. Responde 200 de propósito — o
  // robô acha que deu certo e não tenta de novo.
  if (corpo.jardim) return json(env, { ok: true });

  const ip = request.headers.get('CF-Connecting-IP') || 'desconhecido';
  const chaveLimite = `rl:${ip}`;
  const jaPostouRecente = await env.MURAL_KV.get(chaveLimite);
  if (jaPostouRecente) {
    return json(env, { ok: false, erro: 'Calma aí! Espere um minuto antes de postar de novo.' }, 429);
  }

  const nome = String(corpo.nome || '').trim();
  const mensagem = String(corpo.mensagem || '').trim();
  const idade = Number(corpo.idade);

  if (!nome || nome.length > MAX_NOME) {
    return json(env, { ok: false, erro: `Nome inválido (até ${MAX_NOME} caracteres).` }, 400);
  }
  if (!mensagem || mensagem.length > MAX_MENSAGEM) {
    return json(env, { ok: false, erro: `Mensagem inválida (até ${MAX_MENSAGEM} caracteres).` }, 400);
  }
  if (!Number.isInteger(idade) || idade < 1 || idade > 120) {
    return json(env, { ok: false, erro: 'Idade inválida.' }, 400);
  }

  const mensagens = await lerMensagens(env);
  const proximoId = mensagens.reduce((max, m) => Math.max(max, Number(m.id) || 0), 0) + 1;

  const novaMensagem = {
    id: proximoId,
    nome: escaparHtml(nome),
    idade,
    mensagem: escaparHtml(mensagem),
    criadoEm: new Date().toISOString(),
  };

  mensagens.push(novaMensagem);
  const aparadas = mensagens.length > MAX_MENSAGENS_GUARDADAS
    ? mensagens.slice(mensagens.length - MAX_MENSAGENS_GUARDADAS)
    : mensagens;

  await gravarMensagens(env, aparadas);
  await env.MURAL_KV.put(chaveLimite, '1', { expirationTtl: INTERVALO_MINIMO_SEGUNDOS });

  return json(env, { ok: true, mensagem: novaMensagem });
}

// ---------------- Rota: deletar ----------------
async function deletar(request, env) {
  let corpo;
  try {
    corpo = await request.json();
  } catch (e) {
    return json(env, { ok: false, erro: 'Requisição inválida.' }, 400);
  }

  const senha = String(corpo.senha || '');
  if (!senha || !env.MURAL_ADMIN_SENHA || !iguaisEmTempoConstante(senha, env.MURAL_ADMIN_SENHA)) {
    return json(env, { ok: false, erro: 'Senha de admin incorreta.' }, 403);
  }

  const id = Number(corpo.id);
  if (!Number.isInteger(id)) {
    return json(env, { ok: false, erro: 'Id inválido.' }, 400);
  }

  const mensagens = await lerMensagens(env);
  const restantes = mensagens.filter((m) => Number(m.id) !== id);

  if (restantes.length === mensagens.length) {
    return json(env, { ok: false, erro: 'Mensagem não encontrada.' }, 404);
  }

  await gravarMensagens(env, restantes);
  return json(env, { ok: true });
}
