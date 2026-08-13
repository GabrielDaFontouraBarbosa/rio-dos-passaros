// Avisa sobre o pássaro do dia em três canais:
//   1. e-mail pessoal pro dono do site (BOSS_EMAIL)
//   2. WhatsApp pro dono do site (CallMeBot)
//   3. Broadcast do Resend pra quem se inscreveu no site (RESEND_SEGMENT_ID)
//
// Chamado só quando um pássaro NOVO é escolhido (ver escolher-passaro-do-dia.js)
// — nunca no caminho em que o dia já tinha pássaro escolhido, senão o aviso
// duplicaria a cada re-execução da Action no mesmo dia.
//
// Os segredos vêm de variáveis de ambiente, configuradas como "Secrets" do
// repositório no GitHub (Settings → Secrets and variables → Actions). Cada
// canal que não tiver os segredos configurados é pulado sem quebrar os outros.
const SITE_URL = 'https://www.riodospassaros.com.br';

async function enviarEmail(passaro) {
  const apiKey = process.env.RESEND_API_KEY;
  const destino = process.env.BOSS_EMAIL;
  if (!apiKey || !destino) {
    console.log('[e-mail] RESEND_API_KEY ou BOSS_EMAIL não configurados — pulando.');
    return;
  }

  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Rio dos Pássaros <onboarding@resend.dev>',
      to: [destino],
      subject: `Pássaro do dia: ${passaro.nome}`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px;">
          <p style="text-transform:uppercase; letter-spacing:0.05em; font-size:12px; color:#888;">Pássaro do dia</p>
          <h2 style="margin:4px 0;">${passaro.nome}</h2>
          ${passaro.nomeCientifico ? `<p style="color:#666; font-style:italic; margin:0 0 12px;">${passaro.nomeCientifico}</p>` : ''}
          <p>${passaro.descricao || ''}</p>
        </div>
      `,
    }),
  });

  if (!resp.ok) {
    console.log('[e-mail] falhou:', resp.status, await resp.text());
  } else {
    console.log('[e-mail] enviado pra', destino);
  }
}

async function enviarWhatsapp(passaro) {
  const telefone = process.env.CALLMEBOT_PHONE;
  const apiKey = process.env.CALLMEBOT_APIKEY;
  if (!telefone || !apiKey) {
    console.log('[whatsapp] CALLMEBOT_PHONE ou CALLMEBOT_APIKEY não configurados — pulando.');
    return;
  }

  const texto = `🐦 Pássaro do dia no Rio dos Pássaros: ${passaro.nome}${passaro.nomeCientifico ? ` (${passaro.nomeCientifico})` : ''}`;
  const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(telefone)}&text=${encodeURIComponent(texto)}&apikey=${encodeURIComponent(apiKey)}`;

  const resp = await fetch(url);
  const corpo = await resp.text();
  console.log('[whatsapp] CallMeBot respondeu:', resp.status, corpo.slice(0, 200));
}

// Envio pra lista de inscritos. É um "Broadcast" e não um laço de e-mails
// avulsos por um motivo prático: o Resend cuida do descadastro sozinho (o
// rodapé com o link sai automático e quem sai da lista para de receber sem a
// gente precisar guardar essa informação em lugar nenhum). Também é uma
// chamada só, independente de ter 5 ou 500 inscritos.
async function enviarBroadcast(passaro) {
  const apiKey = process.env.RESEND_API_KEY;
  const segmento = process.env.RESEND_SEGMENT_ID;
  const remetente = process.env.RESEND_REMETENTE;
  if (!apiKey || !segmento || !remetente) {
    console.log('[broadcast] RESEND_SEGMENT_ID ou RESEND_REMETENTE não configurados — pulando.');
    return;
  }

  const resp = await fetch('https://api.resend.com/broadcasts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      segment_id: segmento,
      from: remetente,
      subject: `Pássaro do dia: ${passaro.nome}`,
      name: `Pássaro do dia — ${new Date().toISOString().slice(0, 10)}`,
      html: htmlDoBroadcast(passaro),
      send: true, // sem isso o broadcast fica salvo como rascunho e ninguém recebe
    }),
  });

  if (!resp.ok) {
    console.log('[broadcast] falhou:', resp.status, await resp.text());
  } else {
    console.log('[broadcast] disparado pro segmento', segmento);
  }
}

// A foto vem com caminho relativo no passaros.json ("images/..."), que não
// significa nada dentro de um cliente de e-mail — tem que virar URL absoluta.
function htmlDoBroadcast(passaro) {
  const foto = passaro.foto && passaro.foto.arquivo ? `${SITE_URL}/${passaro.foto.arquivo}` : null;
  return `
    <div style="font-family: -apple-system, Segoe UI, sans-serif; max-width: 520px; color: #333;">
      <p style="text-transform:uppercase; letter-spacing:0.05em; font-size:12px; color:#888; margin:0 0 4px;">Pássaro do dia</p>
      <h2 style="margin:0 0 2px; color:#d94b59;">${passaro.nome}</h2>
      ${passaro.nomeCientifico ? `<p style="color:#7a5a3a; font-style:italic; margin:0 0 14px;">${passaro.nomeCientifico}</p>` : ''}
      ${foto ? `<img src="${foto}" alt="${passaro.nome}" width="320" style="max-width:100%; height:auto; border-radius:12px; margin-bottom:14px;">` : ''}
      <p style="line-height:1.55;">${passaro.descricao || ''}</p>
      <p style="margin:22px 0;">
        <a href="${SITE_URL}" style="background:#6DB3E5; color:#fff; text-decoration:none; font-weight:700; padding:11px 20px; border-radius:999px; display:inline-block;">Ver no site</a>
      </p>
      ${
        passaro.foto && passaro.foto.autor
          ? `<p style="font-size:12px; color:#999; margin:0;">Foto: ${passaro.foto.autor}${passaro.foto.licenca ? ` · ${passaro.foto.licenca}` : ''}</p>`
          : ''
      }
    </div>
  `;
}

async function notificar(passaro) {
  await Promise.allSettled([enviarEmail(passaro), enviarWhatsapp(passaro), enviarBroadcast(passaro)]);
}

module.exports = { notificar };
