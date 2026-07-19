const perguntaElement = document.getElementById("pergunta");
const timerElement = document.getElementById("timer");
const respostaA = document.getElementById("respostaA");
const respostaB = document.getElementById("respostaB");
const respostaC = document.getElementById("respostaC");
const respostaD = document.getElementById("respostaD");


var acertos = 0;
var erros = 0;

let timer;
var tempo = 0;

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}
function formatSecondsToMMSS(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  // Adiciona um zero à esquerda se os minutos/segundos forem menores que 10
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function iniciarTimer()
{
    timer = setInterval(adicionarSegundo, 1000)
}
function adicionarSegundo()
{
    tempo++;
    timerElement.innerText = formatSecondsToMMSS(tempo);
}

function carregarPergunta()
{
    var pergunta = perguntas[getRandomInt(0, perguntas.length)]

    perguntaElement.innerText = pergunta.pergunta
    respostaA.innerText = pergunta.respostas.a.resposta
    respostaB.innerText = pergunta.respostas.b.resposta
    respostaC.innerText = pergunta.respostas.c.resposta
    respostaD.innerText = pergunta.respostas.d.resposta
}

iniciarTimer();
carregarPergunta();