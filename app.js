// --- IMPLEMENTACJA INDEXEDDB ---
const DB_NAME = 'GeoQuizDB';
const DB_VERSION = 2; // Zmieniamy wersję, aby zresetować strukturę bazy!
const STORE_NAME = 'scores';

function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            // Usuwamy starą bazę jeśli istnieje i tworzymy nową
            if (db.objectStoreNames.contains(STORE_NAME)) {
                db.deleteObjectStore(STORE_NAME);
            }
            // Tworzymy nową strukturę
            db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        };

        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

// Funkcja dodająca nowy wynik do historii
async function saveScoreIndexedDB(score, total) {
    const db = await initDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    // Zapisujemy każdy wynik jako osobny obiekt z datą
    const record = {
        id: Date.now(), 
        score: score,
        total: total,
        date: new Date().toLocaleString()
    };
    
    store.add(record);
}

// Funkcja pobierająca całą historię wyników
async function getScoreHistory() {
    const db = await initDB();
    return new Promise((resolve) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll(); // Pobieramy WSZYSTKIE rekordy

        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => resolve([]);
    });
}

// --- POWIADOMIENIA PUSH NTFY.SH ---
async function sendPushNotification(title, message) {
    try {
        await fetch('https://ntfy.sh/geoquiz-smaga-gabrych-2026', {
            method: 'POST',
            headers: {
                'Title': title,
                'Priority': 'default',
                'Tags': 'trophy,earth_africa'
            },
            body: message
        });
        console.log("Powiadomienie push wysłane pomyślnie!");
    } catch (error) {
        console.error("Błąd wysyłania powiadomienia:", error);
    }
}

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
    // Animacja przejścia CSS (wymuszenie restartu)
    quizContainer.classList.remove('fade-in-animation');
    void quizContainer.offsetWidth; // reflow
    quizContainer.classList.add('fade-in-animation');

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

// Wyświetla wyniki i aktualizuje historię
async function showResults() {
    quizContainer.classList.add('hide');
    resultContainer.classList.remove('hide');
    finalScoreElement.innerText = score;
    totalQuestionsElement.innerText = questions.length;

    // 1. Pobierz dotychczasową historię, żeby sprawdzić poprzedni rekord
    const history = await getScoreHistory();
    let previousBestScore = history.length > 0 ? Math.max(...history.map(h => h.score)) : 0;

    // 2. Zapisz obecną grę do bazy
    await saveScoreIndexedDB(score, questions.length);

    // 3. Pobierz zaktualizowaną historię i wyświetl ją na ekranie
    const updatedHistory = await getScoreHistory();
    displayHistory(updatedHistory);

    // 4. Obsługa najlepszego wyniku i powiadomień
    let currentBestScore = Math.max(previousBestScore, score);
    bestScoreElement.innerText = currentBestScore;

    if (score > previousBestScore) {
        console.log("Nowy rekord zapisany w IndexedDB!");
        sendPushNotification('Nowy Rekord w GeoQuiz!', `Udało się zdobyć ${score} punktów!`);
    } else {
        sendPushNotification('Koniec gry w GeoQuiz', `Twój wynik to ${score}/${questions.length}.`);
    }
    // Rejestracja Background Sync do synchronizacji danych po odzyskaniu sieci
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
        navigator.serviceWorker.ready.then(registration => {
            registration.sync.register('sync-scores')
                .then(() => console.log('Zadanie Background Sync ("sync-scores") zarejestrowane!'))
                .catch(err => console.error('Błąd rejestracji Background Sync:', err));
        });
    }
}

// Generuje HTML z historią i dokleja go do ekranu końcowego
function displayHistory(history) {
    let historyContainer = document.getElementById('history-container');
    
    // Jeśli kontener jeszcze nie istnieje, tworzymy go w locie
    if (!historyContainer) {
        historyContainer = document.createElement('div');
        historyContainer.id = 'history-container';
        historyContainer.style.marginTop = '20px';
        historyContainer.style.fontSize = '0.9em';
        resultContainer.appendChild(historyContainer);
    }
    
    let historyHTML = '<h3>Historia gier:</h3><ul style="list-style: none; padding: 0;">';
    
    // Odwracamy listę (najnowsze gry na górze) i bierzemy tylko 5 ostatnich
    const recentHistory = history.reverse().slice(0, 5);
    
    recentHistory.forEach(item => {
        historyHTML += `<li style="margin-bottom: 8px; padding: 5px; background: #f0f4f8; border-radius: 5px;">
            📅 ${item.date} - <b>Wynik: ${item.score}/${item.total}</b>
        </li>`;
    });
    
    historyHTML += '</ul>';
    historyContainer.innerHTML = historyHTML;
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

// Nasłuchiwanie utraty połączenia z internetem
window.addEventListener('offline', () => {
    document.getElementById('offline-banner').style.display = 'block';
});

// Nasłuchiwanie powrotu połączenia z internetem
window.addEventListener('online', () => {
    document.getElementById('offline-banner').style.display = 'none';
});

// Sprawdzenie stanu podczas ładowania strony (jeśli aplikacja włączy się już bez internetu)
if (!navigator.onLine) {
    document.getElementById('offline-banner').style.display = 'block';
}
