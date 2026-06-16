# GeoQuiz PWA

## Cel aplikacji
Aplikacja jest prostą, edukacyjną grą w formie quizu geograficznego, zaprojektowaną zgodnie ze standardami Progressive Web App (PWA). Pozwala użytkownikowi sprawdzić swoją wiedzę na temat państw, kontynentów i podstawowych faktów geograficznych, oferując doświadczenie zbliżone do natywnej aplikacji mobilnej.

## Opis funkcji
* **Quiz geograficzny:** Zestaw pytań jednokrotnego wyboru z natychmiastową weryfikacją poprawności odpowiedzi.
* **Tryb Offline:** Dzięki wykorzystaniu Service Workera (strategia Cache-First), w pełni wczytana aplikacja działa bez dostępu do internetu.
* **Geolokalizacja i API:** Aplikacja pyta o zgodę na lokalizację i przy użyciu zewnętrznego API (Open-Meteo) wyświetla użytkownikowi aktualną temperaturę oraz siłę wiatru.
* **Trwałe dane (High Score):** Najlepszy wynik gracza jest automatycznie zapisywany i przechowywany w pamięci przeglądarki (localStorage).
* **Instalacja (PWA):** Aplikacja posiada poprawnie skonfigurowany plik manifest.json z zestawem ikon, co umożliwia jej instalację z poziomu przeglądarki (np. "Dodaj do ekranu głównego" na smartfonie).

## Instrukcja uruchomienia
1. Sklonuj lub pobierz folder z plikami projektu.
2. Otwórz folder w edytorze kodu (np. Visual Studio Code).
3. Ze względu na zabezpieczenia przeglądarek wymagane przez PWA, aplikację należy uruchomić przez lokalny serwer (np. za pomocą wtyczki Live Server).
4. Przejdź pod adres wygenerowany przez serwer (np. `http://localhost:5500` lub `http://127.0.0.1:5500`) w przeglądarce Google Chrome.
5. Aby przetestować działanie offline, przejdź do narzędzi deweloperskich (DevTools) -> zakładka Network -> zaznacz opcję "Offline" i odśwież stronę.