---
id: 547
title: Raspberry Pi!
date: 2017-01-22T22:09:13+00:00
author: admin
layout: post
guid: http://www.karalus.eu/?p=547
permalink: /?p=547
categories:
  - Inne
---
Zostałem szczęśliwym posiadaczem Raspberry Pi 3 Model B, używam go jako domowego serwera, na którym stoi NGINX wraz z aplikacją napisaną w MONO.  
Skonfigurowanie wszystkiego od zera, wraz z montażem cyfrowego termometru zajęło mi ok. 2 h. Póki co wykorzystuję go jako domowy termometr, którego temperaturę mogę odczytać wchodząc na stronę internetową. Taki sobie bajer, sam jeszcze nie wiem, do czego będę używał mojej malinki w przyszłości.

  1. Instalacja raspbiana:  
    Nic prostszego. Ściągamy obraz systemu Raspbian ze strony <a href="https://www.raspberrypi.org/downloads/raspbian/" target="_blank">raspberrypi.org</a>. Wrzucamy go na kartę microSD i ładujemy do naszego PI.  
    Po odpaleniu systemu podłączamy się do sieci (Raspberry Pi 3 ma wbudowany moduł) i przeprowadzamy aktualizację.</p> <pre class="brush: bash; title: ; notranslate" title="">sudo apt-get update
</pre>