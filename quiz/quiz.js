const perguntaElement = document.getElementById("pergunta");
const timerElement = document.getElementById("timer");
const respostaA = document.getElementById("respostaA");
const respostaB = document.getElementById("respostaB");
const respostaC = document.getElementById("respostaC");
const respostaD = document.getElementById("respostaD");

const divRA = document.getElementById("divRA")
const divRB = document.getElementById("divRB")
const divRC = document.getElementById("divRC")
const divRD = document.getElementById("divRD")

divRA.addEventListener("click", (e) => {
    responderPergunta("a")
})
divRB.addEventListener("click", (e) => {
    responderPergunta("b")
})
divRC.addEventListener("click", (e) => {
    responderPergunta("c")
})
divRD.addEventListener("click", (e) => {
    responderPergunta("d")
})


var alternativaCorreta;
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
    var randomNumber = getRandomInt(0, perguntas.length)
    var pergunta = perguntas[randomNumber]
    perguntas.splice(randomNumber, 1)

    perguntaElement.innerText = pergunta.pergunta
    respostaA.innerText = pergunta.respostas.a.resposta
    respostaB.innerText = pergunta.respostas.b.resposta
    respostaC.innerText = pergunta.respostas.c.resposta
    respostaD.innerText = pergunta.respostas.d.resposta

    definirAlternativaCorreta(pergunta)
}
function definirAlternativaCorreta(pergunta)
{
    if(pergunta.respostas.a.correta)
    {
        alternativaCorreta = "a"
    }
    else if(pergunta.respostas.b.correta)
    {
        alternativaCorreta = "b"
    }
    else if(pergunta.respostas.c.correta)
    {
        alternativaCorreta = "c"
    }
    else if(pergunta.respostas.d.correta)
    {
        alternativaCorreta = "d"
    }
}
function responderPergunta(resposta)
{
    if (resposta === alternativaCorreta)
    {
        acertos++
    }
    else
    {
        erros++
    }

    if (perguntas.length === 0)
    {
        finalizarQuiz()
        return
    }

    carregarPergunta();
}

function finalizarQuiz()
{
    clearInterval(timer)
    sessionStorage.setItem('quiz_acertos', acertos)
    sessionStorage.setItem('quiz_erros', erros)
    sessionStorage.setItem('quiz_tempo', tempo)
    window.location.href = 'final.html'
}

iniciarTimer();
carregarPergunta();