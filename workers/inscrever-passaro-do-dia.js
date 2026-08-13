// Cloudflare Worker: recebe a inscrição no "pássaro do dia" e confirma por
// e-mail antes de gravar o contato no Resend.
//
// Por que um Worker existe: o site está no GitHub Pages, que não roda backend.
// A chave da API do Resend não pode ir pro navegador (qualquer um leria o
// código-fonte e mandaria e-mail em nome do domínio), então ela mora aqui.
//
// Duas rotas:
//   POST /inscrever   { email }              → manda o e-mail de confirmação
//   GET  /confirmar?e=…&x=…&a=…              → grava o contato e volta pro site
//
// Nada é guardado entre as duas: o link de confirmação carrega o próprio
// e-mail junto de uma assinatura HMAC. Quem não tem o SEGREDO_ASSINATURA não
// consegue forjar um link, e quem tem o link não consegue alterar o e-mail sem
// invalidar a assinatura. Um banco de dados a menos pra manter.
//
// Variáveis de ambiente (Settings → Variables do Worker):
//   RESEND_API_KEY      chave da API do Resend (Secret)
//   SEGREDO_ASSINATURA  texto aleatório longo, só seu (Secret)
//   RESEND_SEGMENT_ID   id do segmento que recebe o pássaro do dia
//   REMETENTE           ex.: Rio dos Pássaros <passarododia@riodospassaros.com.br>
//   SITE_URL            ex.: https://www.riodospassaros.com.br

const VALIDADE_LINK_MS = 48 * 60 * 60 * 1000; // 48h pra confirmar

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') return responderCors(env, new Response(null, { status: 204 }));
    if (url.pathname === '/inscrever' && request.method === 'POST') return inscrever(request, env);
    if (url.pathname === '/confirmar' && request.method === 'GET') return confirmar(url, env);

    return new Response('Não encontrado', { status: 404 });
  },
};

// ---------------- CORS ----------------
// Só o site pode chamar o Worker pelo navegador. Não é proteção de verdade
// (dá pra falsificar fora do navegador), mas evita que outro site coloque um
// formulário apontando pra cá e queime sua cota do Resend.
function cabecalhosCors(env) {
  return {
    'Access-Control-Allow-Origin': env.SITE_URL,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

// ---------------- Assinatura ----------------
const enc = new TextEncoder();

async function assinar(texto, segredo) {
  const chave = await crypto.subtle.importKey('raw', enc.encode(segredo), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const assinatura = await crypto.subtle.sign('HMAC', chave, enc.encode(texto));
  return [...new Uint8Array(assinatura)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Comparação de tempo constante: um `===` vazaria, pelo tempo de resposta,
// quantos caracteres do início da assinatura o atacante já acertou.
function iguaisEmTempoConstante(a, b) {
  if (a.length !== b.length) return false;
  let diferenca = 0;
  for (let i = 0; i < a.length; i++) diferenca |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diferenca === 0;
}

// base64url: o token vai numa URL, então nada de "+", "/" ou "=".
function paraBase64Url(texto) {
  return btoa(texto).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function deBase64Url(texto) {
  const base = texto.replace(/-/g, '+').replace(/_/g, '/');
  return atob(base + '='.repeat((4 - (base.length % 4)) % 4));
}

// ---------------- Rota: inscrever ----------------
function emailValido(email) {
  return typeof email === 'string' && email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

async function inscrever(request, env) {
  let corpo;
  try {
    corpo = await request.json();
  } catch (e) {
    return json(env, { erro: 'Requisição inválida.' }, 400);
  }

  // Campo-armadilha: fica escondido no formulário, então gente nunca preenche
  // e robô que preenche tudo, sim. Responde 200 de propósito — o robô acha que
  // deu certo e não tenta de novo.
  if (corpo.jardim) return json(env, { ok: true });

  const email = String(corpo.email || '').trim().toLowerCase();
  if (!emailValido(email)) return json(env, { erro: 'Esse e-mail não parece válido.' }, 400);

  const expiraEm = Date.now() + VALIDADE_LINK_MS;
  const dados = `${email}|${expiraEm}`;
  const assinatura = await assinar(dados, env.SEGREDO_ASSINATURA);
  const link = `${new URL(request.url).origin}/confirmar?e=${encodeURIComponent(paraBase64Url(email))}&x=${expiraEm}&a=${assinatura}`;

  const resposta = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: env.REMETENTE,
      to: [email],
      subject: 'Confirme sua inscrição no Pássaro do Dia',
      html: emailDeConfirmacao(link, env.SITE_URL),
    }),
  });

  if (!resposta.ok) {
    console.log('[resend] confirmação falhou:', resposta.status, await resposta.text());
    return json(env, { erro: 'Não deu pra enviar o e-mail agora. Tenta de novo em instantes.' }, 502);
  }

  return json(env, { ok: true });
}

// ---------------- Rota: confirmar ----------------
async function confirmar(url, env) {
  const voltar = (situacao) => Response.redirect(`${env.SITE_URL}/?inscricao=${situacao}`, 302);

  let email;
  try {
    email = deBase64Url(url.searchParams.get('e') || '');
  } catch (e) {
    return voltar('invalido');
  }
  const expiraEm = Number(url.searchParams.get('x'));
  const assinatura = url.searchParams.get('a') || '';

  if (!emailValido(email) || !expiraEm) return voltar('invalido');

  const esperada = await assinar(`${email}|${expiraEm}`, env.SEGREDO_ASSINATURA);
  if (!iguaisEmTempoConstante(assinatura, esperada)) return voltar('invalido');

  // A validade é checada depois da assinatura de propósito: sem isso, dava pra
  // descobrir se um link é autêntico só pela mensagem de erro.
  if (Date.now() > expiraEm) return voltar('expirado');

  const resposta = await fetch('https://api.resend.com/contacts', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, unsubscribed: false, segments: [env.RESEND_SEGMENT_ID] }),
  });

  // Contato repetido não é erro pro usuário: quem clicou duas vezes no link
  // continua inscrito, que é o que ele queria.
  if (!resposta.ok && resposta.status !== 409) {
    console.log('[resend] contato falhou:', resposta.status, await resposta.text());
    return voltar('erro');
  }

  return voltar('ok');
}

// ---------------- E-mail de confirmação ----------------
function emailDeConfirmacao(link, siteUrl) {
  return `
    <div style="font-family: -apple-system, Segoe UI, sans-serif; max-width: 480px; color: #333;">
      <p style="text-transform:uppercase; letter-spacing:0.05em; font-size:12px; color:#888; margin:0 0 4px;">Rio dos Pássaros</p>
      <h2 style="margin:0 0 12px; color:#d94b59;">Falta um clique</h2>
      <p style="line-height:1.5;">Alguém — provavelmente você — pediu pra receber o <strong>pássaro do dia</strong> por e-mail. Confirme pra começar a receber:</p>
      <p style="margin:24px 0;">
        <a href="${link}" style="background:#6DB3E5; color:#fff; text-decoration:none; font-weight:700; padding:12px 22px; border-radius:999px; display:inline-block;">Confirmar inscrição</a>
      </p>
      <p style="font-size:13px; color:#777; line-height:1.5;">O link vale por 48 horas. Se não foi você que pediu, é só ignorar este e-mail — sem a confirmação, nada é cadastrado.</p>
      <p style="font-size:13px; color:#777;"><a href="${siteUrl}" style="color:#6DB3E5;">${siteUrl.replace(/^https?:\/\//, '')}</a></p>
    </div>
  `;
}
