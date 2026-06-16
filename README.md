# GeoQuiz PWA

## Cel aplikacji
Aplikacja jest edukacyjną grą w formie quizu geograficznego, zaprojektowaną zgodnie ze standardami Progressive Web App (PWA). Pozwala użytkownikowi sprawdzić swoją wiedzę na temat państw i kontynentów, oferując zaawansowane doświadczenie zbliżone do natywnej aplikacji mobilnej (działanie offline, powiadomienia push, synchronizacja w tle).

## Link do aplikacji (Wdrożenie)
🌍 **https://projekt-ti-gabrych-smaga.pages.dev/**

## Opis funkcji
* **Quiz geograficzny:** Zestaw pytań z natychmiastową weryfikacją poprawności odpowiedzi, wzbogacony o płynne animacje CSS przejść między pytaniami.
* **Zaawansowany tryb Offline:** Zastosowano strategię **Network-First z fallbackiem do Cache**. Aplikacja wyświetla estetyczny baner informujący o utracie połączenia z siecią, ale w pełni pozwala na dalszą grę. Service Worker obsługuje automatyczne aktualizacje (`skipWaiting`, `clients.claim`).
* **Trwałe dane i historia (IndexedDB):** Zamiast prostego `localStorage`, aplikacja wykorzystuje asynchroniczną bazę danych IndexedDB do zapisu najlepszego wyniku oraz historii 5 ostatnich rozegranych partii wraz z dokładnymi datami.
* **Powiadomienia Push (ntfy.sh):** Po zakończeniu gry aplikacja wysyła bezobsługowe powiadomienia push (m.in. o pobiciu nowego rekordu) przez zewnętrzną usługę ntfy.sh do subskrybentów kanału.
* **Geolokalizacja i API:** Przy użyciu darmowego Open-Meteo API aplikacja pobiera współrzędne urządzenia i wyświetla aktualną temperaturę oraz siłę wiatru.
* **Background Sync:** Zaimplementowano mechanizm synchronizacji w tle. Jeśli użytkownik ukończy grę bez dostępu do internetu, aplikacja zsynchronizuje dane i wyśle powiadomienie automatycznie po odzyskaniu połączenia z siecią.
* **Instalacja (PWA):** Skonfigurowany plik `manifest.json` (z wymaganą sekcją `screenshots` oraz ikonami) umożliwia bezproblemową instalację aplikacji na smartfonie i komputerze jako samodzielnego programu (`display: standalone`).
* **Analityka:** Zintegrowano Cloudflare Web Analytics w celu śledzenia statystyk ruchu z poszanowaniem prywatności (privacy-first, bez cookies).

## Instrukcja uruchomienia (lokalnie)
1. Sklonuj lub pobierz folder z plikami projektu.
2. Otwórz folder w edytorze kodu (np. Visual Studio Code).
3. Uruchom projekt przez lokalny serwer (np. za pomocą rozszerzenia Live Server), wpisując w przeglądarce wygenerowany adres (np. `http://127.0.0.1:5500`).
4. **Testowanie trybu offline:** Otwórz Chrome DevTools (F12) -> zakładka *Network* -> zaznacz "Offline" i odśwież stronę. Zobaczysz dedykowany baner informacyjny.
5. **Testowanie powiadomień i Background Sync:** Otwórz w przeglądarce kanał na `https://ntfy.sh` (zgodny z kodem w `app.js`) lub pobierz aplikację ntfy na telefon, aby na żywo odbierać alerty z aplikacji. Zakończenie gry offline i późniejsze podłączenie do sieci wyzwoli powiadomienie przez Service Workera.
