---
id: 185
title: Async Await
date: 2015-04-05T19:24:30+00:00
author: admin
layout: revision
guid: http://www.karalus.eu/2015/04/164-autosave-v1/
permalink: /2015/04/164-autosave-v1/
---
Mechanizm Async-Await dla programisty, który wcześniej pracował głównie z klasami typu Thread, Parallel, Task, czy BackgroundWorker, może początkowo wydawać się dziwny.

<!--more-->

Szybko idzie się jednak przyzwyczaić, ponieważ sam sposób pisania aplikacji wielowątkowych z wątkiem interfejsu jest bardzo intuicyjny.  
Jak to robić?

1) Po pierwsze piszemy metodę, która ma się wykonywać równolegle.  
W moim przypadku skomplikowane obliczenia są symulowane przez Thread.Sleep();

```csharp
private Task DoSomeWorkAsync()
        {
            return Task.Run(() => { Thread.Sleep(500); });
        }
```

Metoda ta musi zwracać obiekt klasy Task (dla metod void) lub Task (dla metod zwracających obiekt T)

```csharp
private Task<int> DoSomeWorkAsync()
        {
            return Task.Run(() =>
            {
                Thread.Sleep(500);
                return 0;
            });
        }
```

2) Słówko kluczowe "async", najprościej mówiąc:  
Oznacza, że w danej metodzie występuje wywołanie metody ze słowem kluczowym await.  
Jeśli jakaś metoda ma modyfikator async => w jej ciele jest await.

UWAGA! Nazwy metod, które są poprzedzone modyfikatorem async, kończą sie na Async, np. SomeWorkAsync, GetValueAsync.  
Jest to ogólnie przyjęta konwencja.

3) Słówko kluczowe "await", powoduje zwrócenie wykonywania do metody wywołującej funckę async.  
We wnętrzu metody z modyfikatorem async, wywołujemy metodę zwracającą Task. Wyłołanie to poprzedzamy słówkiem await. Podczas wykonywania kodu, jeżeli natrafimy na await, to

Najlepiej pokazać to na prostym przykładzie aplikacji z paskiem postępu.

<img class="alignnone size-medium wp-image-165" src="/wp-content/uploads/2015/03/2015-03-31-17_28_12-MainWindow.png?resize=300%2C86" alt="2015-03-31 17_28_12-MainWindow" width="300" height="86" srcset="/wp-content/uploads/2015/03/2015-03-31-17_28_12-MainWindow.png?resize=300%2C86 300w, /wp-content/uploads/2015/03/2015-03-31-17_28_12-MainWindow.png?w=656 656w" sizes="(max-width: 300px) 100vw, 300px" data-recalc-dims="1" /> 

 