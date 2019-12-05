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

<pre class="brush: csharp; title: ; notranslate" title="">private Task DoSomeWorkAsync()
        {
            return Task.Run(() =&gt; { Thread.Sleep(500); });
        }
</pre>

Metoda ta musi zwracać obiekt klasy Task (dla metod void) lub Task (dla metod zwracających obiekt T)

<pre class="brush: csharp; title: ; notranslate" title="">private Task&lt;int&gt; DoSomeWorkAsync()
        {
            return Task.Run(() =&gt;
            {
                Thread.Sleep(500);
                return 0;
            });
        }
</pre>

2) Słówko kluczowe &#8222;async&#8221;, najprościej mówiąc:  
Oznacza, że w danej metodzie występuje wywołanie metody ze słowem kluczowym await.  
Jeśli jakaś metoda ma modyfikator async => w jej ciele jest await.

UWAGA! Nazwy metod, które są poprzedzone modyfikatorem async, kończą sie na Async, np. SomeWorkAsync, GetValueAsync.  
Jest to ogólnie przyjęta konwencja.

3) Słówko kluczowe &#8222;await&#8221;, powoduje zwrócenie wykonywania do metody wywołującej funckę async.  
We wnętrzu metody z modyfikatorem async, wywołujemy metodę zwracającą Task. Wyłołanie to poprzedzamy słówkiem await. Podczas wykonywania kodu, jeżeli natrafimy na await, to

Najlepiej pokazać to na prostym przykładzie aplikacji z paskiem postępu.

<img class="alignnone size-medium wp-image-165" src="https://i2.wp.com/www.karalus.eu/wp-content/uploads/2015/03/2015-03-31-17_28_12-MainWindow.png?resize=300%2C86" alt="2015-03-31 17_28_12-MainWindow" width="300" height="86" srcset="https://i2.wp.com/www.karalus.eu/wp-content/uploads/2015/03/2015-03-31-17_28_12-MainWindow.png?resize=300%2C86 300w, https://i2.wp.com/www.karalus.eu/wp-content/uploads/2015/03/2015-03-31-17_28_12-MainWindow.png?w=656 656w" sizes="(max-width: 300px) 100vw, 300px" data-recalc-dims="1" /> 

&nbsp;