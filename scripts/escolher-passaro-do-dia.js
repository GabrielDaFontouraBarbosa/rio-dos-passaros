// Roda 1x por dia via GitHub Actions (.github/workflows/passaro-do-dia.yml).
// Escolhe um pássaro aleatório entre os que ainda não apareceram no ciclo
// atual, grava em data/passaro-do-dia.json. Quando todos já apareceram,
// reinicia o ciclo.
const fs = require('fs');
const path = require('path');

const CAMINHO_PASSAROS = path.join(__dirname, '..', 'data', 'passaros.json');
const CAMINHO_ESTADO = path.join(__dirname, '..', 'data', 'passaro-do-dia.json');

const { passaros } = JSON.parse(fs.readFileSync(CAMINHO_PASSAROS, 'utf8'));
const todosIds = passaros.map((p) => p.id);

let estado = { historicoRecente: [] };
if (fs.existsSync(CAMINHO_ESTADO)) {
  estado = JSON.parse(fs.readFileSync(CAMINHO_ESTADO, 'utf8'));
}

const hoje = new Date().toISOString().slice(0, 10);
if (estado.data === hoje) {
  console.log('Pássaro do dia já foi escolhido hoje (' + hoje + '), nada a fazer.');
  process.exit(0);
}

let historico = (estado.historicoRecente || []).filter((id) => todosIds.includes(id));
let disponiveis = todosIds.filter((id) => !historico.includes(id));
if (disponiveis.length === 0) {
  historico = [];
  disponiveis = todosIds;
}

const escolhido = disponiveis[Math.floor(Math.random() * disponiveis.length)];
historico.push(escolhido);

const novoEstado = { data: hoje, passaroId: escolhido, historicoRecente: historico };
fs.writeFileSync(CAMINHO_ESTADO, JSON.stringify(novoEstado, null, 2) + '\n', 'utf8');

const passaroEscolhido = passaros.find((p) => p.id === escolhido);
console.log(`Pássaro do dia (${hoje}): ${passaroEscolhido?.nome} [${escolhido}] — ${historico.length}/${todosIds.length} já mostrados neste ciclo.`);

const { notificar } = require('./notificar-passaro-do-dia');
notificar(passaroEscolhido).catch((erro) => console.log('Falha ao notificar:', erro.message));
