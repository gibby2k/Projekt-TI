const questions = [
    {
        question: "Które państwo jest największe pod względem powierzchni?",
        answers: [
            { text: "Chiny", correct: false },
            { text: "USA", correct: false },
            { text: "Rosja", correct: true },
            { text: "Kanada", correct: false }
        ]
    },
    {
        question: "Jak nazywa się stolica Australii?",
        answers: [
            { text: "Sydney", correct: false },
            { text: "Melbourne", correct: false },
            { text: "Canberra", correct: true },
            { text: "Perth", correct: false }
        ]
    },
    {
        question: "Przez ile państw przepływa rzeka Nil?",
        answers: [
            { text: "11", correct: true },
            { text: "5", correct: false },
            { text: "8", correct: false },
            { text: "3", correct: false }
        ]
    },
    {
        question: "Który kontynent jest najmniejszy?",
        answers: [
            { text: "Europa", correct: false },
            { text: "Australia", correct: true },
            { text: "Antarktyda", correct: false },
            { text: "Ameryka Południowa", correct: false }
        ]
    }
];

const questionElement = document.getElementById('question-text');
const answerButtonsElement = document.getElementById('answer-buttons');
const nextButton = document.getElementById('next-btn');
const scoreElement = document.getElementById('score');
const quizContainer = document.getElementById('quiz-container');
const resultContainer = document.getElementById('result-container');
const finalScoreElement = document.getElementById('final-score');
const totalQuestionsElement = document.getElementById('total-questions');
const restartButton = document.getElementById('restart-btn');
const bestScoreElement = document.getElementById('best-score');

let currentQuestionIndex = 0;
let score = 0;

function startGame() {
    currentQuestionIndex = 0;
    score = 0;
    scoreElement.innerText = score;
    quizContainer.classList.remove('hide');
    resultContainer.classList.add('hide');
    nextButton.classList.add('hide');
    setNextQuestion();
}

function setNextQuestion() {
    resetState();
    showQuestion(questions[currentQuestionIndex]);
}

function showQuestion(question) {
    questionElement.innerText = question.question;
    question.answers.forEach(answer => {
        const button = document.createElement('button');
        button.innerText = answer.text;
        button.classList.add('btn');
        if (answer.correct) {
            button.dataset.correct = answer.correct;
        }
        button.addEventListener('click', selectAnswer);
        answerButtonsElement.appendChild(button);
    });
}

function resetState() {
    nextButton.classList.add('hide');
    while (answerButtonsElement.firstChild) {
        answerButtonsElement.removeChild(answerButtonsElement.firstChild);
    }
}

function selectAnswer(e) {
    const selectedButton = e.target;
    const isCorrect = selectedButton.dataset.correct === "true";
    
    if (isCorrect) {
        selectedButton.classList.add('correct');
        score++;
        scoreElement.innerText = score;
    } else {
        selectedButton.classList.add('wrong');
    }

    Array.from(answerButtonsElement.children).forEach(button => {
        if (button.dataset.correct === "true") {
            button.classList.add('correct');
        }
        button.disabled = true;
    });

    if (questions.length > currentQuestionIndex + 1) {
        nextButton.classList.remove('hide');
    } else {
        setTimeout(showResults, 1500);
    }
}

function showResults() {
    quizContainer.classList.add('hide');
    resultContainer.classList.remove('hide');
    finalScoreElement.innerText = score;
    totalQuestionsElement.innerText = questions.length;

    // Obsługa localStorage dla najlepszego wyniku
    let bestScore = localStorage.getItem('geoQuizBestScore') || 0;
    
    if (score > bestScore) {
        localStorage.setItem('geoQuizBestScore', score);
        bestScore = score;
        console.log("Nowy rekord zapisany!");
    }
    
    bestScoreElement.innerText = bestScore;
}

nextButton.addEventListener('click', () => {
    currentQuestionIndex++;
    setNextQuestion();
});

restartButton.addEventListener('click', startGame);

// Inicjalizacja gry
startGame();

console.log("Ładuję nowy plik app.js z integracją API!");

// Rejestracja Service Workera
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./service-worker.js')
    .then((registration) => {
      console.log('SUKCES! Service Worker zarejestrowany. Zakres:', registration.scope);
    })
    .catch((error) => {
      console.error('BŁĄD rejestracji Service Workera:', error);
    });
}

// Integracja Open-Meteo API (Geolokalizacja)
if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
            const { latitude, longitude } = pos.coords;
            
            // Pobieranie danych z darmowego API
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weathercode,windspeed_10m&timezone=auto`;
            
            const res = await fetch(url);
            const data = await res.json();
            
            const temp = data.current.temperature_2m;
            const wind = data.current.windspeed_10m;
            
            document.getElementById('weather').textContent = `Lokalna pogoda: ${temp}°C, wiatr: ${wind} km/h`;
        } catch (error) {
            document.getElementById('weather').textContent = 'Nie udało się pobrać pogody.';
        }
    }, () => {
        document.getElementById('weather').textContent = 'Lokalizacja ukryta. Zaczynamy GeoQuiz!';
    });
}