---
id: 326
title: Użycie IProgress i CancellationToken
date: 2015-07-22T21:25:48+00:00
author: Adrian Karalus
layout: post
guid: http://www.karalus.eu/?p=326
permalink: /2015/07/iprogress-cancellationtoken/
image: /wp-content/uploads/2015/07/IprogressDemo-250x184.png
categories:
  - Programowanie
tags:
  - async
  - await
  - 'c#'
  - CancellationRequest
  - CancellationToken
  - IProgress
  - task
  - wielowątkowość
---
<p style="padding-left: 60px;">
  Pisząc aplikację wielowątkowe często istnieje potrzeba raportowania aktualnego postępu lub przerwania obliczeń &#8222;z zewnątrz&#8221;.<br /> Klasa <strong>BackgroundWorker</strong> dostarcza do tego gotowe metody. Jednak jak to zrobić gdy pracujemy z klasą <strong>Task</strong>?
</p>

<!--more-->

### 

&nbsp;

### 1) Raportowanie:

&nbsp;

Jednym z możliwych sposobów, rozwiązania tego problemu, jest użycie obiektów implementujących interface **IProgress<T>**.  
Metoda, która ma wykonywać się asynchronicznie, jako parametr powinna przyjmować obiekty typu IProgress<T>:

<pre class="brush: csharp; title: ; notranslate" title="">Task DoSomeWorkAsync(IProgress&lt;int&gt; progress)
</pre>

Obiekt ten zawiera metodę Report(T), która jako parametr przyjmuje typ generyczny w tym przypadku będzie to int.  
Wywołanie tych obliczeń wygląda w następujący sposób:

<pre class="brush: csharp; title: ; notranslate" title="">var progressIndicator = new Progress&lt;int&gt;(ReportProgress);
await DoSomeWorkAsync(progressIndicator, token);
.
.
.
private Task DoSomeWorkAsync(IProgress&lt;int&gt; progress)
{
    return Task.Run(() =&gt;
    {
        for (int i = 0; i &lt; int.MaxValue; i++)
        {
            progress.Report(i);
        }
    });
}
</pre>

do tego metoda raportująca:

<pre class="brush: csharp; title: ; notranslate" title="">private void ReportProgress(int value)
{
    Console.WriteLine("Current progress: {0}", value);
}
</pre>

### 2) Przerwanie obliczeń:

&nbsp;

Do metody asynchronicznej przekazujemy dodatkowy parametr: **CancellationToken**.  
Dzięki temu możemy, wewnątrz metody, sprawdzać czy nie przyszło żądanie o przerwanie obliczeń.  
Wystarczy sprawdzić stan flagi **IsCancellationRequested**.

<pre class="brush: csharp; title: ; notranslate" title="">private Task DoSomeWorkAsync(CancellationToken cancellationToken)
        {
            return Task.Run(() =&gt;
            {
                for (int i = 0; i &lt; int.MaxValue; i++)
                {
                    if (cancellationToken.IsCancellationRequested)
                    {
                        break;
                    }
                }
            });
        }
</pre>

wywołanie metody w tym przypadku wygląda tak:

<pre class="brush: csharp; title: ; notranslate" title="">var cts = new CancellationTokenSource();
var token = cts.Token;
await DoSomeWorkAsync(token);
</pre>

oraz żądanie przerwania:

<pre class="brush: csharp; title: ; notranslate" title="">cts.Cancel();
</pre>

Cały działający kod z przykładem (pomimo tego, że ma on tylko 55 linii) jak zawsze dostępny na <a href="https://github.com/RamzesBlog/IPorgressConsoleDemo" target="_blank"><strong>GitHub</strong> </a>😉