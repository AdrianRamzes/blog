---
title: Async Await
date: 2015-04-07T15:25:05+00:00
author: Adrian Karalus
layout: post
permalink: /2015/04/async-await/
image: /assets/content/uploads/2015/03/20150326_214952.jpg
categories:
  - Programowanie
---
Mechanizm Async-Await dla programisty, który wcześniej pracował głównie z klasami typu Thread, Parallel, Task, czy BackgroundWorker, może początkowo wydawać się dziwny.


Szybko idzie się jednak przyzwyczaić, ponieważ sam sposób pisania aplikacji wielowątkowych z wątkiem interfejsu jest bardzo intuicyjny.  
Jak to robić?

1) Po pierwsze piszemy metodę, która ma się wykonywać równolegle.  
W moim przypadku skomplikowane obliczenia są symulowane przez `Thread.Sleep();`

```csharp
private Task DoSomeWorkAsync()
{
    return Task.Run(() => { Thread.Sleep(500); });
}
```

Metoda ta musi zwracać obiekt klasy `Task` (dla metod void) lub `Task<T>`

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

2) Słówko kluczowe **async**, najprościej mówiąc:  
Oznacza, że w danej metodzie występuje wywołanie metody ze słowem kluczowym **await**.  
Jeśli jakaś metoda ma modyfikator *async* => w jej ciele jest *await*.

UWAGA! Nazwy metod, które są poprzedzone modyfikatorem async, kończą sie na Async, np. SomeWorkAsync, GetValueAsync.  
Jest to ogólnie przyjęta konwencja.

3) Słówko kluczowe **await**, powoduje zwrócenie przepływy sterowania do metody wywołującej funkcję **async** (asynchroniczną).

Od tego momentu "czekamy" na zakończenie zadania.

Schemat: (pionowe linie reprezentują wykonywany w czasie kod)

![](/assets/content/uploads/2015/03/20150326_214952.jpg)

Najlepiej pokazać to na prostym przykładzie aplikacji z paskiem postępu.

![](/assets/content/uploads/2015/03/2015-03-31-17_28_12-MainWindow.png)

Co zyskujemy?  
- Większa intuicyjność kodu w przypadku pracy z interfejsem użytkownika,  
- w prosty sposób możemy zapewnić responsywność aplikacji.

Cały kod, jak zawsze, dostępny na [GITHUB](https://github.com/AdrianRamzes/AsyncAwaitExample)! 🙂