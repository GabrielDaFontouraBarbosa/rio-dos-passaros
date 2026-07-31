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

const questionTranslation = document.getElementById("questionTranslation");
const audioTranslation = document.getElementById("audioTranslation");
const translationA = document.getElementById("translationA");
const translationB = document.getElementById("translationB");
const translationC = document.getElementById("translationC");
const translationD = document.getElementById("translationD");
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

const translationDictionary = {
    'which': 'qual',
    'bird': 'pássaro',
    'can': 'pode',
    'sing': 'cantar',
    'the': 'o',
    'national': 'nacional',
    'anthem': 'hino',
    'makes': 'faz',
    'this': 'este',
    'sound': 'som',
    'listen': 'ouça',
    'to': 'ao',
    'call': 'piado',
    'and': 'e',
    'choose': 'escolha',
    'tap': 'toque',
    'button': 'botão',
    'hear': 'ouvir',
    'play': 'tocar',
    'has': 'tem',
    'short': 'curto',
    'floating': 'flutuante',
    'song': 'canto',
    'quick': 'rápido',
    'bright': 'brilhante',
    'soft': 'suave',
    'melodic': 'melodioso',
    'deep': 'grave',
    'strong': 'forte',
    'forest': 'floresta',
    'clear': 'claro',
    'proud': 'orgulhoso',
    'fast': 'rápido',
    'repeated': 'repetido',
    'sings': 'canta',
    'in': 'com',
    'hopping': 'saltitante',
    'voice': 'voz',
    'highest': 'mais alto',
    'flaps': 'bate',
    'its': 'suas',
    'wings': 'asas',
    'fastest': 'mais rápido',
    'is': 'é',
    'famous': 'famoso',
    'for': 'pelo',
    'beautiful': 'bonito',
    'loves': 'adora',
    'lakes': 'lagos',
    'rivers': 'rios',
    'press': 'pressione',
    'birdcall': 'piado'
};

function preserveCase(token, translation) {
    if (!token) return translation;
    if (token[0] === token[0].toUpperCase()) {
        return translation.charAt(0).toUpperCase() + translation.slice(1);
    }
    return translation;
}

function translateText(text) {
    return text.split(/(\s+|[.,!?;:])/).map(token => {
        if (token.trim() === '') return token;
        const normalized = token.toLowerCase().replace(/[.,!?;:]$/, '');
        const translation = translationDictionary[normalized];
        if (!translation) return token;
        const translatedToken = preserveCase(token, translation);
        return /[.,!?;:]$/.test(token) ? translatedToken + token.slice(-1) : translatedToken;
    }).join('');
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

    const availableQuestions = perguntas.filter(question => {
        if (quizMode === 'sound') {
            return question.type === 'audio';
        }
        return !question.type || question.type !== 'audio';
    });

    activeQuestions = shuffleArray(availableQuestions);
    acertos = 0;
    erros = 0;
    carregarPergunta();
}

function carregarPergunta() {
    resetAnswerStyles();

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

    renderTranslations(question);
}

function renderTranslations(question) {
    const portuguese = question.translations?.pt || {};
    questionTranslation.innerText = portuguese.pergunta || translateText(question.pergunta);

    if (question.type === 'audio') {
        audioTranslation.innerText = portuguese.audioNoteText || translateText(question.audioNoteText || 'Press to hear the bird sound');
    } else {
        audioTranslation.innerText = '';
    }

    translationA.innerText = portuguese.respostas?.a?.resposta || translateText(question.respostas.a.resposta);
    translationB.innerText = portuguese.respostas?.b?.resposta || translateText(question.respostas.b.resposta);
    translationC.innerText = portuguese.respostas?.c?.resposta || translateText(question.respostas.c.resposta);
    translationD.innerText = portuguese.respostas?.d?.resposta || translateText(question.respostas.d.resposta);
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
    if (!currentQuestion || isShowingResult) {
        return;
    }

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

    window.setTimeout(() => {
        carregarPergunta();
    }, 650);
}

function showSoundResult(question) {
    const translated = getTranslatedQuestion(question);
    const pt = question.translations?.pt || {};
    const correctKey = getCorrectAnswerKey(question);
    const birdName = translated.respostas[correctKey].resposta;
    const birdNamePt = pt.respostas?.[correctKey]?.resposta || birdName;
    const imageFile = question.imageFile || 'bem-te-vi-vetor.png';
    const imagePath = `../images/sessaopassaros/${imageFile}`;

    resultBirdImage.src = imagePath;
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