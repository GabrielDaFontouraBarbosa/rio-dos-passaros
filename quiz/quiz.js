const perguntaElement = document.getElementById("pergunta");
const perguntaPt = document.getElementById("perguntaPt");
const questionContent = document.getElementById("questionContent");
const audioPlaceholder = document.getElementById("audioPlaceholder");
const audioTitle = document.getElementById("audioTitle");
const audioTitlePt = document.getElementById("audioTitlePt");
const audioNoteText = document.getElementById("audioNoteText");
const audioNoteTextPt = document.getElementById("audioNoteTextPt");
const playSoundBtn = document.getElementById("playSoundBtn");
const birdAudio = document.getElementById("birdAudio");
const timerElement = document.getElementById("timer");
const respostaA = document.getElementById("respostaA");
const respostaB = document.getElementById("respostaB");
const respostaC = document.getElementById("respostaC");
const respostaD = document.getElementById("respostaD");
const respostaAPt = document.getElementById("respostaAPt");
const respostaBPt = document.getElementById("respostaBPt");
const respostaCPt = document.getElementById("respostaCPt");
const respostaDPt = document.getElementById("respostaDPt");
const answersSection = document.getElementById("answersSection");
const divRA = document.getElementById("divRA");
const divRB = document.getElementById("divRB");
const divRC = document.getElementById("divRC");
const divRD = document.getElementById("divRD");
const modeSelection = document.getElementById("modeSelection");
const birdQuizBtn = document.getElementById("birdQuizBtn");
const soundQuizBtn = document.getElementById("soundQuizBtn");
const resultOverlay = document.getElementById("soundResultOverlay");
const resultBirdImage = document.getElementById("resultBirdImage");
const resultVideo = document.getElementById("resultVideo");
const resultVideoLink = document.getElementById("resultVideoLink");
const resultBirdName = document.getElementById("resultBirdName");
const resultBirdNamePt = document.getElementById("resultBirdNamePt");
const resultTitle = document.getElementById("resultTitle");
const resultTitlePt = document.getElementById("resultTitlePt");
const closeResultBtn = document.getElementById("closeResultBtn");

const respostasMap = {
    a: divRA,
    b: divRB,
    c: divRC,
    d: divRD,
};
const resultCard = document.querySelector('.result-card');

let currentQuestion = null;
let quizMode = null;
let activeQuestions = [];
let acertos = 0;
let erros = 0;
let timerId = null;
let tempo = 0;
let isShowingResult = false;
let isAnswering = false;
let advanceTimeoutId = null;

const MODO_PARA_TIPO = { sound: 'audio', bird: 'texto' };

function validarPerguntas(lista) {
    lista.forEach((questao, indice) => {
        if (!['audio', 'texto'].includes(questao.type)) {
            console.warn(`Pergunta ${indice} tem "type" ausente ou inválido (${questao.type}):`, questao.pergunta);
        }
        if (questao.type === 'audio') {
            if (!questao.audioSrc) {
                console.warn(`Pergunta de áudio sem "audioSrc":`, questao.pergunta);
            }
            if (!questao.imageFile) {
                console.warn(`Pergunta de áudio sem "imageFile":`, questao.pergunta);
            }
        }
    });
}
validarPerguntas(perguntas);

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

function formatSecondsToMMSS(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function startTimer() {
    timerId = setInterval(() => {
        tempo += 1;
        timerElement.innerText = formatSecondsToMMSS(tempo);
    }, 1000);
}

function stopTimer() {
    if (timerId) {
        clearInterval(timerId);
        timerId = null;
    }
}

function shuffleArray(array) {
    return array
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);
}

function getLabelsForLanguage(lang) {
    return ['A', 'B', 'C', 'D'];
}

function getTranslatedQuestion(question) {
    return {
        pergunta: question.pergunta,
        respostas: {
            a: { resposta: question.respostas.a.resposta, correta: question.respostas.a.correta },
            b: { resposta: question.respostas.b.resposta, correta: question.respostas.b.correta },
            c: { resposta: question.respostas.c.resposta, correta: question.respostas.c.correta },
            d: { resposta: question.respostas.d.resposta, correta: question.respostas.d.correta },
        },
        audioTitle: question.audioTitle || 'Listen to the bird call',
        audioNoteText: question.audioNoteText || 'Press to hear the sound',
        playButton: question.playButton || 'Play sound',
    };
}

function selectQuizMode(mode) {
    quizMode = mode;
    modeSelection.classList.add('hidden');
    initializeQuiz();
}

function initializeQuiz() {
    tempo = 0;
    timerElement.innerText = formatSecondsToMMSS(tempo);
    stopTimer();
    startTimer();

    const tipoEsperado = MODO_PARA_TIPO[quizMode];
    const availableQuestions = perguntas.filter(question => question.type === tipoEsperado);

    activeQuestions = shuffleArray(availableQuestions);
    acertos = 0;
    erros = 0;

    if (!activeQuestions.length) {
        stopTimer();
        audioPlaceholder.classList.add('hidden');
        answersSection.classList.add('hidden');
        perguntaElement.innerText = 'No questions available for this quiz mode yet.';
        perguntaPt.innerText = 'Nenhuma pergunta disponível para este modo de quiz ainda.';
        return;
    }

    answersSection.classList.remove('hidden');
    carregarPergunta();
}

function carregarPergunta() {
    if (advanceTimeoutId) {
        clearTimeout(advanceTimeoutId);
        advanceTimeoutId = null;
    }
    resetAnswerStyles();
    isAnswering = false;

    if (!activeQuestions.length) {
        finalizarQuiz();
        return;
    }

    const randomIndex = getRandomInt(0, activeQuestions.length);
    currentQuestion = activeQuestions.splice(randomIndex, 1)[0];
    renderQuestion(currentQuestion);
}

function renderQuestion(question) {
    const translated = getTranslatedQuestion(question);
    const pt = question.translations?.pt || {};
    const hasAudio = question.type === 'audio';

    perguntaElement.innerText = translated.pergunta;
    perguntaPt.innerText = pt.pergunta || '';

    if (hasAudio) {
        audioPlaceholder.classList.remove('hidden');
        audioTitle.innerText = translated.audioTitle;
        audioTitlePt.innerText = pt.audioTitle || '';
        audioNoteText.innerText = translated.audioNoteText;
        audioNoteTextPt.innerText = pt.audioNoteText || '';
        playSoundBtn.innerText = translated.playButton;
        if (question.audioSrc) {
            birdAudio.src = question.audioSrc;
        }
    } else {
        audioPlaceholder.classList.add('hidden');
        birdAudio.src = '';
    }

    respostaA.innerText = translated.respostas.a.resposta;
    respostaB.innerText = translated.respostas.b.resposta;
    respostaC.innerText = translated.respostas.c.resposta;
    respostaD.innerText = translated.respostas.d.resposta;

    respostaAPt.innerText = pt.respostas?.a?.resposta || '';
    respostaBPt.innerText = pt.respostas?.b?.resposta || '';
    respostaCPt.innerText = pt.respostas?.c?.resposta || '';
    respostaDPt.innerText = pt.respostas?.d?.resposta || '';
}

function resetAnswerStyles() {
    Object.values(respostasMap).forEach(element => {
        element.classList.remove('correct', 'incorrect');
    });
}

function getCorrectAnswerKey(question) {
    return Object.keys(question.respostas).find(key => question.respostas[key].correta);
}

function responderPergunta(answerKey) {
    if (!currentQuestion || isShowingResult || isAnswering) {
        return;
    }
    isAnswering = true;

    const selectedElement = respostasMap[answerKey];
    const correctKey = getCorrectAnswerKey(currentQuestion);
    const isCorrect = answerKey === correctKey;

    if (isCorrect) {
        selectedElement.classList.add('correct');
        acertos += 1;
    } else {
        selectedElement.classList.add('incorrect');
        respostasMap[correctKey]?.classList.add('correct');
        erros += 1;
    }

    if (quizMode === 'sound' && currentQuestion.type === 'audio' && isCorrect) {
        showSoundResult(currentQuestion);
        return;
    }

    advanceTimeoutId = window.setTimeout(() => {
        carregarPergunta();
    }, 650);
}

function showSoundResult(question) {
    const translated = getTranslatedQuestion(question);
    const pt = question.translations?.pt || {};
    const correctKey = getCorrectAnswerKey(question);
    const birdName = translated.respostas[correctKey].resposta;
    const birdNamePt = pt.respostas?.[correctKey]?.resposta || birdName;
    if (!question.imageFile) {
        console.warn('Pergunta de áudio sem "imageFile", ocultando imagem do resultado:', question.pergunta);
    }
    resultBirdImage.src = question.imageFile ? `../images/sessaopassaros/${question.imageFile}` : '';
    resultBirdImage.style.visibility = question.imageFile ? 'visible' : 'hidden';
    resultBirdImage.alt = birdName;
    resultBirdName.innerText = `This sound was from ${birdName}!`;
    resultBirdNamePt.innerText = `Esse som era de ${birdNamePt}!`;
    resultTitle.innerText = 'Correct!';
    resultTitlePt.innerText = 'Acertou!';

    if (question.videoId) {
        resultVideo.src = `https://www.youtube.com/embed/${question.videoId}?autoplay=1&rel=0`;
        resultVideo.classList.remove('hidden');
        resultVideoLink.href = `https://www.youtube.com/watch?v=${question.videoId}`;
        resultVideoLink.classList.remove('hidden');
    } else {
        resultVideo.classList.add('hidden');
        resultVideoLink.classList.add('hidden');
        resultVideo.src = '';
    }

    resultCard.classList.add('animate__animated', 'animate__zoomIn');
    resultCard.addEventListener('animationend', () => {
        resultCard.classList.remove('animate__animated', 'animate__zoomIn');
    }, { once: true });

    resultOverlay.classList.remove('hidden');
    isShowingResult = true;
}

function hideResultOverlay() {
    resultOverlay.classList.add('hidden');
    isShowingResult = false;
    carregarPergunta();
}

function finalizarQuiz() {
    stopTimer();
    sessionStorage.setItem('quiz_acertos', acertos);
    sessionStorage.setItem('quiz_erros', erros);
    sessionStorage.setItem('quiz_tempo', tempo);
    window.location.href = 'final.html';
}

playSoundBtn.addEventListener('click', () => {
    if (!birdAudio.src) {
        return;
    }
    birdAudio.currentTime = 0;
    birdAudio.play();
});

birdQuizBtn.addEventListener('click', () => selectQuizMode('bird'));
soundQuizBtn.addEventListener('click', () => selectQuizMode('sound'));
closeResultBtn.addEventListener('click', hideResultOverlay);

divRA.addEventListener('click', () => responderPergunta('a'));
divRB.addEventListener('click', () => responderPergunta('b'));
divRC.addEventListener('click', () => responderPergunta('c'));
divRD.addEventListener('click', () => responderPergunta('d'));

modeSelection.classList.remove('hidden');
resultOverlay.classList.add('hidden');

document.addEventListener('DOMContentLoaded', () => {
    timerElement.innerText = formatSecondsToMMSS(0);
});