---
id: 193
title: Async Await
date: 2015-04-07T15:23:22+00:00
author: Adrian Karalus
layout: revision
guid: http://www.karalus.eu/2015/04/164-revision-v1/
permalink: /2015/04/164-revision-v1/
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

3) Słówko kluczowe "await", powoduje zwrócenie przepływy sterowania do metody wywołującej funkcję async (asynchroniczną).

Od tego momentu "czekamy" na zakończenie zadania.

Schemat: (pionowe linie reprezentują wykonywany w czasie kod)

[<img class="alignnone size-full wp-image-166" src="/blog/wp-content/uploads/2015/03/20150326_214952.jpg?resize=3264%2C2448" alt="20150326_214952" width="3264" height="2448" srcset="/blog/wp-content/uploads/2015/03/20150326_214952.jpg?w=3264 3264w, /blog/wp-content/uploads/2015/03/20150326_214952.jpg?resize=300%2C225 300w, /blog/wp-content/uploads/2015/03/20150326_214952.jpg?resize=1024%2C768 1024w, /blog/wp-content/uploads/2015/03/20150326_214952.jpg?w=2000 2000w, /blog/wp-content/uploads/2015/03/20150326_214952.jpg?w=3000 3000w" sizes="(max-width: 1000px) 100vw, 1000px" data-recalc-dims="1" />](/blog/wp-content/uploads/2015/03/20150326_214952.jpg)

Najlepiej pokazać to na prostym przykładzie aplikacji z paskiem postępu.

<img class="alignnone size-medium wp-image-165" src="/blog/wp-content/uploads/2015/03/2015-03-31-17_28_12-MainWindow.png?resize=300%2C86" alt="2015-03-31 17_28_12-MainWindow" width="300" height="86" srcset="/blog/wp-content/uploads/2015/03/2015-03-31-17_28_12-MainWindow.png?resize=300%2C86 300w, /blog/wp-content/uploads/2015/03/2015-03-31-17_28_12-MainWindow.png?w=656 656w" sizes="(max-width: 300px) 100vw, 300px" data-recalc-dims="1" /> 

Co zyskujemy?  
- Większa intuicyjność kodu w przypadku pracy z interfejsem użytkownika,  
- w prosty sposób możemy zapewnić responsywność aplikacji.

Cały kod, jak zawsze, dostępny na <a href="https://github.com/AdrianRamzes/AsyncAwaitExample" target="_blank">GITHUB</a>! 🙂