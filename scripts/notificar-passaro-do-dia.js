// Avisa sobre o pássaro do dia por e-mail (Resend) e WhatsApp (CallMeBot).
// Chamado só quando um pássaro NOVO é escolhido (ver escolher-passaro-do-dia.js)
// — nunca no caminho em que o dia já tinha pássaro escolhido, senão o aviso
// duplicaria a cada re-execução da Action no mesmo dia.
//
// Os segredos (RESEND_API_KEY, BOSS_EMAIL, CALLMEBOT_PHONE, CALLMEBOT_APIKEY)
// vêm de variáveis de ambiente, configuradas como "Secrets" do repositório no
// GitHub (Settings → Secrets and variables → Actions). Se um canal não tiver
// os segredos configurados, ele é pulado sem quebrar o outro.

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

async function notificar(passaro) {
  await Promise.allSettled([enviarEmail(passaro), enviarWhatsapp(passaro)]);
}

module.exports = { notificar };
