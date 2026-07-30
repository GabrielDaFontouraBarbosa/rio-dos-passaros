const perguntaElement = document.getElementById("pergunta");
const timerElement = document.getElementById("timer");
const respostaA = document.getElementById("respostaA");
const respostaB = document.getElementById("respostaB");
const respostaC = document.getElementById("respostaC");
const respostaD = document.getElementById("respostaD");

const alternativaALabel = document.querySelector("#divRA .alternativa span");
const alternativaBLabel = document.querySelector("#divRB .alternativa span");
const alternativaCLabel = document.querySelector("#divRC .alternativa span");
const alternativaDLabel = document.querySelector("#divRD .alternativa span");

const divRA = document.getElementById("divRA")
const divRB = document.getElementById("divRB")
const divRC = document.getElementById("divRC")
const divRD = document.getElementById("divRD")

const audios = [new Audio('./Click.ogg'), new Audio('./CloseTab.ogg', new Audio('./PickPotion.ogg'))]

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

let currentLanguage = 'pt';
let currentQuestion = null;

function carregarPergunta()
{
    var randomNumber = getRandomInt(0, perguntas.length)
    var pergunta = perguntas[randomNumber]
    perguntas.splice(randomNumber, 1)
    currentQuestion = pergunta

    renderQuestion(pergunta)
    definirAlternativaCorreta(pergunta)
}

function renderQuestion(question) {
    const translated = getTranslatedQuestion(question)
    perguntaElement.innerText = translated.pergunta
    respostaA.innerText = translated.respostas.a.resposta
    respostaB.innerText = translated.respostas.b.resposta
    respostaC.innerText = translated.respostas.c.resposta
    respostaD.innerText = translated.respostas.d.resposta

    alternativaALabel.innerText = translated.labels[0]
    alternativaBLabel.innerText = translated.labels[1]
    alternativaCLabel.innerText = translated.labels[2]
    alternativaDLabel.innerText = translated.labels[3]
}

function getTranslatedQuestion(question) {
    const labels = getLabelsForLanguage(currentLanguage)
    const base = {
        pergunta: question.pergunta,
        respostas: question.respostas,
        labels
    }

    if (!question.translations || !question.translations[currentLanguage]) {
        return base
    }

    const translation = question.translations[currentLanguage]
    return {
        pergunta: translation.pergunta,
        respostas: {
            a: { resposta: translation.respostas.a.resposta, correta: question.respostas.a.correta },
            b: { resposta: translation.respostas.b.resposta, correta: question.respostas.b.correta },
            c: { resposta: translation.respostas.c.resposta, correta: question.respostas.c.correta },
            d: { resposta: translation.respostas.d.resposta, correta: question.respostas.d.correta },
        },
        labels
    }
}

function getLabelsForLanguage(lang) {
    const mapping = {
        pt: ['A', 'B', 'C', 'D'],
        en: ['A', 'B', 'C', 'D'],
        es: ['A', 'B', 'C', 'D'],
        fr: ['A', 'B', 'C', 'D'],
        it: ['A', 'B', 'C', 'D'],
        de: ['A', 'B', 'C', 'D']
    }
    return mapping[lang] || mapping.pt
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
    audios[getRandomInt(0, audios.length)].play();
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

function changeLanguage(lang) {
    currentLanguage = lang
    const buttons = document.querySelectorAll('.lang-btn');
    buttons.forEach(btn => btn.classList.toggle('active', btn.dataset.lang === lang));
    if (currentQuestion) {
        renderQuestion(currentQuestion)
    }
}

iniciarTimer();
carregarPergunta();