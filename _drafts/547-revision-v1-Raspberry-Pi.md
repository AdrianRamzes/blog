---
id: 551
title: Raspberry Pi!
date: 2017-01-22T22:08:34+00:00
author: admin
layout: revision
guid: http://www.karalus.eu/2017/01/547-revision-v1/
permalink: /2017/01/547-revision-v1/
---
Zostałem szczęśliwym posiadaczem Raspberry Pi 3 Model B, używam go jako domowego serwera, na którym stoi NGINX wraz z aplikacją napisaną w MONO.  
Skonfigurowanie wszystkiego od zera, wraz z montażem cyfrowego termometru zajęło mi ok. 2 h. Póki co wykorzystuję go jako domowy termometr, którego temperaturę mogę odczytać wchodząc na stronę internetową. Taki sobie bajer, sam jeszcze nie wiem, do czego będę używał mojej malinki w przyszłości.

  1. Instalacja raspbiana:  
    Nic prostszego. Ściągamy obraz systemu Raspbian ze strony [raspberrypi.org](https://www.raspberrypi.org/downloads/raspbian/). Wrzucamy go na kartę microSD i ładujemy do naszego PI.  
    Po odpaleniu systemu podłączamy się do sieci (Raspberry Pi 3 ma wbudowany moduł) i przeprowadzamy aktualizację.
```bash
sudo apt-get update
```