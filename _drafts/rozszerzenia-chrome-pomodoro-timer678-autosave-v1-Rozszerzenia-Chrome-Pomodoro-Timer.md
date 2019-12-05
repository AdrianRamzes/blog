---
id: 755
title: 'Rozszerzenia Chrome: Pomodoro Timer'
date: 2018-02-11T17:00:55+00:00
author: admin
layout: revision
guid: http://www.karalus.eu/2018/02/678-autosave-v1/
permalink: /2018/02/678-autosave-v1/
---
Nigdy wcześniej nie pisałem rozszerzeń do Chrome, ale chciałem spróbować. Wiedziałem wcześniej jedynie, że to nie jest zbyt trudne, tutaj cytat mojego kolegi: "Nie wiem jak robi się rozszerzenia do chrome, ale daję to moim studentom na pierwszym roku i jakoś dają radę, więc, to nie może być trudne". I rzeczywiście nie jest. Rozszerzenie do przeglądarki to nic innego jak HTML+CSS+JS. 

<span>"Jeśli umiesz podstawy frontend, to umiesz też chrome extension."</span>

## manifest.json

Zaczynamy od stworzenia zwykłego projektu html/js/css. Następnie dodajemy plik _manifest.json_, w którym znajdują się podstawowe informacje o rozszerzeniu, takie jak: nazwa, opis, wersja oraz deklaracja uprawnień, jakie są potrzebne, aby rozszerzenie działało. 

<pre lang="javascript">{
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

Najważniejsze jest pole _default_popup_, które mówi przeglądarce - jaki widok ma się wyświetlić po kliknięciu na ikonę rozszerzenia.  
Mój Timer, będzie działał w tle, więc potrzebne jest zdefiniowanie dodatkowej strony - background, która będzie żyć tak długo jak długo działa przeglądarka, bez względu na to czy rozszerzenie jest widoczne. W tym celu należy podać wartość parametru _background.page_. W manifeście znajdują się również inne informacje o aplikacji takie jak: nazwa rozszerzenia, opis, ikona, wersja oraz wykorzystywane uprawnienia. W tym przypadku są to: 

  * _backgroud_ - działanie w tle, 
  * _storage_ - dostęp do zapisywania i odczytywania danych, 
  * _notifications_ - wysyłanie powiadomień. </p> 

## Popup

<img src="https://i0.wp.com/www.karalus.eu/wp-content/uploads/2018/02/chrome_2018-01-10_01-25-39.png?resize=553%2C288" alt="" width="553" height="288" class="alignnone size-full wp-image-752" srcset="https://i0.wp.com/www.karalus.eu/wp-content/uploads/2018/02/chrome_2018-01-10_01-25-39.png?w=553 553w, https://i0.wp.com/www.karalus.eu/wp-content/uploads/2018/02/chrome_2018-01-10_01-25-39.png?resize=300%2C156 300w" sizes="(max-width: 553px) 100vw, 553px" data-recalc-dims="1" /> 

Popup czyli główne okienko rozszerzenia pokazujące się po kliknięciu ikony. <a target="_blank" href="https://github.com/RamzesBlog/pomodoro-timer/blob/master/pomodoro-timer.html">(pomodoro-timer.html)</a>  
Tutaj dołączamy pliki javascript.`<script src="js/pomodoro-timer.js"></script>` 

Skrypt okna `pomodoro-timer.js`, zawiera obsługę kliknięć - sterowanie timerem oraz wyświetla aktualną wartość zegara. 

## Background

Timer będzie działać w tle, dlatego potrzebne jest utworzenie strony oraz skryptu, który działa nawet po zamknięciu widoku rozszerzenia. Skrypty widoku oraz tła mogą komunikować się dzięki "messages", czyli mechanizmowi wysyłania i odbierania wiadomości, który jest realizowany przez przeglądarkę.  
`chrome.extension.sendMessage()` oraz `chrome.extension.onMessage.addListener(func)` 

## Testowanie

Rozszerzenia nie trzeba umieszczać w sklepie, aby dodać je do przeglądarki. W celu przetestowania rozszerzenia należy przejść na stronę rozszerzeń (wpisując w pasek adresu "chrome://extensions/") oraz zaznaczyć opcję "Tryb programisty". Wtedy pojawi się przycisk umożliwiający wczytanie rozszerzenia w postaci spakowanego pliku .zip. 

Zapraszam do pobrania mojego <a target="_blank" href="https://chrome.google.com/webstore/detail/timer/pakimokpohbojafpbgknlohgoepnelki?utm_source=chrome-ntp-icon">rozszerzenia</a>.  
Kod, który posłużył mi do jego napisania jest w całości dostępny na <a target="_blank" href="https://github.com/RamzesBlog/pomodoro-timer">GitHub</a>.