---
title: 'Rozszerzenia Chrome: Pomodoro Timer'
date: 2018-02-11T16:59:47+00:00
author: Adrian Karalus
layout: post
permalink: /2018/02/rozszerzenia-chrome-pomodoro-timer/
image: /assets/content/uploads/2018/02/chrome_2018-01-10_01-25-39.png
categories:
  - Programowanie
---
Nigdy wcześniej nie pisałem rozszerzeń do Chrome, ale chciałem spróbować. Wiedziałem wcześniej jedynie, że to nie jest zbyt trudne, tutaj cytat mojego kolegi: "Nie wiem jak robi się rozszerzenia do chrome, ale daję to moim studentom na pierwszym roku i jakoś dają radę, więc, to nie może być trudne". I rzeczywiście nie jest. Rozszerzenie do przeglądarki to nic innego jak HTML+CSS+JS. 

***Jeśli umiesz w podstawy frontend, to umiesz też w chrome extension.***

## manifest.json

Zaczynamy od stworzenia zwykłego projektu html/js/css. Następnie dodajemy plik *manifest.json*, w którym znajdują się podstawowe informacje o rozszerzeniu, takie jak: nazwa, opis, wersja oraz deklaracja uprawnień, jakie są potrzebne, aby rozszerzenie działało. 

```javascript
{
  "manifest_version": 2,

  "name": "Timer",
  "description": "This is a simple pomodoro timer.",
  "version": "0.1",

  "browser_action": {
    "default_icon": "pomodoro_x128.png",
    "default_popup": "pomodoro-timer.html"
  },

  "icons": {
    "128": "pomodoro_x128.png"
  },

  "permissions": [
    "background",
    "storage",
    "notifications"
  ],

  "background": {
    "page": "background.html"
  }
}
```

Najważniejsze jest pole *default_popup*, które mówi przeglądarce - jaki widok ma się wyświetlić po kliknięciu na ikonę rozszerzenia.  
Mój Timer, będzie działał w tle, więc potrzebne jest zdefiniowanie dodatkowej strony - background, która będzie żyć tak długo jak długo działa przeglądarka, bez względu na to czy rozszerzenie jest widoczne. W tym celu należy podać wartość parametru _background.page_. W manifeście znajdują się również inne informacje o aplikacji takie jak: nazwa rozszerzenia, opis, ikona, wersja oraz wykorzystywane uprawnienia. W tym przypadku są to: 

 - *backgroud* - działanie w tle, 
 - *storage* - dostęp do zapisywania i odczytywania danych, 
 - *notifications* - wysyłanie powiadomień.

## Popup

![](/assets/content/uploads/2018/02/chrome_2018-01-10_01-25-39.png)

Popup czyli główne okienko rozszerzenia pokazujące się po kliknięciu ikony. [(pomodoro-timer.html)](https://github.com/AdrianRamzes/pomodoro-timer/blob/master/pomodoro-timer.html)  
Tutaj dołączamy pliki javascript.`<script src="js/pomodoro-timer.js"></script>` 

Skrypt okna `pomodoro-timer.js`, zawiera obsługę kliknięć - sterowanie timerem oraz wyświetla aktualną wartość zegara. 

## Background

Timer będzie działać w tle, dlatego potrzebne jest utworzenie strony oraz skryptu, który działa nawet po zamknięciu widoku rozszerzenia. Skrypty widoku oraz tła mogą komunikować się dzięki "messages", czyli mechanizmowi wysyłania i odbierania wiadomości, który jest realizowany przez przeglądarkę.  
`chrome.extension.sendMessage()` oraz `chrome.extension.onMessage.addListener(func)` 

## Testowanie

Rozszerzenia nie trzeba umieszczać w sklepie, aby dodać je do przeglądarki. W celu przetestowania rozszerzenia należy przejść na stronę rozszerzeń (wpisując w pasek adresu "chrome://extensions/") oraz zaznaczyć opcję *Tryb programisty*. Wtedy pojawi się przycisk umożliwiający wczytanie rozszerzenia w postaci spakowanego pliku .zip. 

Zapraszam do pobrania mojego [rozszerzenia](https://chrome.google.com/webstore/detail/timer/pakimokpohbojafpbgknlohgoepnelki?utm_source=chrome-ntp-icon).  
Kod, który posłużył mi do jego napisania jest w całości dostępny na [GitHub](https://github.com/AdrianRamzes/pomodoro-timer).