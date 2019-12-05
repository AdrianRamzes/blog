---
id: 350
title: Użycie IProgress i CancellationToken
date: 2015-07-22T21:36:43+00:00
author: admin
layout: revision
guid: http://www.karalus.eu/2015/07/326-revision-v1/
permalink: /2015/07/326-revision-v1/
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
    Console.WriteLine(&quot;Current progress: {0}&quot;, value);
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