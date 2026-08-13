# Inscrição no Pássaro do Dia — setup

O site está no GitHub Pages, que não roda backend. O Worker aqui é a única peça
de servidor: ele guarda a chave da API do Resend e confirma a inscrição por
e-mail antes de gravar qualquer contato.

```
[botão no site] → POST /inscrever → e-mail de confirmação
                                          ↓ (a pessoa clica)
                  GET /confirmar → contato entra no segmento do Resend
                                          ↓
[GitHub Action diária] → POST /broadcasts → todo mundo do segmento recebe
```

## Passo 1 — Verificar o domínio no Resend

**Sem isso nada funciona.** O remetente de teste (`onboarding@resend.dev`) só
entrega para o dono da conta.

No Resend: **Domains → Add Domain** → `riodospassaros.com.br`. Ele mostra
registros SPF e DKIM pra colar no painel de DNS do domínio. A propagação leva de
minutos a algumas horas. Esses registros não afetam o GitHub Pages — são tipos
diferentes dos que apontam o site.

Depois de verificado, escolha um remetente, por exemplo:
`Rio dos Pássaros <passarododia@riodospassaros.com.br>`

## Passo 2 — Criar o segmento e a chave

1. No Resend, crie um **Segment** (ex.: "Pássaro do Dia"). Copie o ID.
2. **API Keys → Create**, com permissão de envio **e** de contatos (a chave atual
   provavelmente só envia). Copie a chave.

## Passo 3 — Publicar o Worker

Na Cloudflare (conta gratuita, **não precisa mover o domínio pra lá**):
**Workers & Pages → Create → Worker**. Cole o conteúdo de
`inscrever-passaro-do-dia.js` e publique.

Em **Settings → Variables and Secrets**:

| nome | tipo | valor |
|---|---|---|
| `RESEND_API_KEY` | Secret | a chave do passo 2 |
| `SEGREDO_ASSINATURA` | Secret | texto aleatório longo, só seu |
| `RESEND_SEGMENT_ID` | Text | o ID do passo 2 |
| `REMETENTE` | Text | `Rio dos Pássaros <passarododia@riodospassaros.com.br>` |
| `SITE_URL` | Text | `https://www.riodospassaros.com.br` |

Para gerar o `SEGREDO_ASSINATURA` (qualquer terminal):

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Guarde-o: trocar esse valor invalida os links de confirmação que já saíram.

## Passo 4 — Ligar o site no Worker

Copie a URL do Worker (algo como `https://xxx.SEU-SUBDOMINIO.workers.dev`) e
cole na primeira linha de `js/script-passaro-do-dia.js`:

```js
const URL_INSCRICAO = 'https://xxx.SEU-SUBDOMINIO.workers.dev';
```

Enquanto estiver vazio, o card aparece normalmente e o botão de inscrição fica
escondido — nada quebra.

## Passo 5 — Secrets do GitHub

Em **Settings → Secrets and variables → Actions**:

| nome | valor |
|---|---|
| `RESEND_SEGMENT_ID` | o mesmo ID do passo 2 |
| `RESEND_REMETENTE` | o mesmo remetente do passo 1 |

O `RESEND_API_KEY` já existe; se você gerou uma chave nova no passo 2, atualize.
Sem esses dois, o broadcast é pulado e só o aviso pessoal continua saindo.

## Testar

1. Abra o site, clique em **Receber todo dia por e-mail** e use seu e-mail.
2. Confirme pelo link. Você volta pro site com a mensagem de sucesso.
3. Confira se o contato apareceu no segmento do Resend.
4. Rode a Action à mão (**Actions → Pássaro do Dia → Run workflow**) pra disparar
   um broadcast sem esperar a meia-noite.

> O passo 4 só manda e-mail se o pássaro do dia **mudar** — se já rodou hoje, o
> script sai antes de notificar. Pra forçar, apague o campo `"data"` de
> `data/passaro-do-dia.json` e rode de novo.

## Limites

- Plano grátis do Resend: **100 e-mails/dia**, 3.000/mês → teto de ~100 inscritos.
- O cron do GitHub Actions **não é pontual** (pode atrasar minutos ou horas) e é
  desativado automaticamente após ~60 dias sem atividade no repositório.
- O Worker grátis da Cloudflare aguenta 100 mil requisições/dia — folgado aqui.

## Se aparecer abuso

O formulário tem campo-armadilha e validação, mas o caminho `/inscrever` manda
e-mail — ou seja, um robô insistente queima sua cota. Se acontecer, o remédio é
uma **Rate limiting rule** na Cloudflare (ex.: 5 requisições por IP a cada 10
minutos) ou colocar o **Turnstile**, o captcha invisível deles.
