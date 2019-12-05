---
id: 349
title: Użycie IProgress i CancellationToken
date: 2015-07-22T21:36:37+00:00
author: admin
layout: revision
guid: http://www.karalus.eu/2015/07/326-autosave-v1/
permalink: /2015/07/326-autosave-v1/
---
<p style="padding-left: 60px;">
  Pisząc aplikację wielowątkowe często istnieje potrzeba raportowania aktualnego postępu lub przerwania obliczeń "z zewnątrz".<br /> Klasa <strong>BackgroundWorker</strong> dostarcza do tego gotowe metody. Jednak jak to zrobić gdy pracujemy z klasą <strong>Task</strong>?
</p>

<!--more-->

### 

 

### 1) Raportowanie:

 

Jednym z możliwych sposobów, rozwiązania tego problemu, jest użycie obiektów implementujących interface **IProgress<T>**.  
Metoda, która ma wykonywać się asynchronicznie, jako parametr powinna przyjmować obiekty typu IProgress<T>:

```csharp
Task DoSomeWorkAsync(IProgress<int> progress)
```

Obiekt ten zawiera metodę Report(T), która jako parametr przyjmuje typ generyczny w tym przypadku będzie to int.  
Wywołanie tych obliczeń wygląda w następujący sposób:

```csharp
var progressIndicator = new Progress<int>(ReportProgress);
await DoSomeWorkAsync(progressIndicator, token);
.
.
.
private Task DoSomeWorkAsync(IProgress<int> progress)
{
    return Task.Run(() =>
    {
        for (int i = 0; i < int.MaxValue; i++)
        {
            progress.Report(i);
        }
    });
}
```

do tego metoda raportująca:

```csharp
private void ReportProgress(int value)
{
    Console.WriteLine("Current progress: {0}", value);
}
```

### 2) Przerwanie obliczeń:

 

Do metody asynchronicznej przekazujemy dodatkowy parametr: **CancellationToken**.  
Dzięki temu możemy, wewnątrz metody, sprawdzać czy nie przyszło żądanie o przerwanie obliczeń.  
Wystarczy sprawdzić stan flagi **IsCancellationRequested**.

```csharp
private Task DoSomeWorkAsync(CancellationToken cancellationToken)
        {
            return Task.Run(() =>
            {
                for (int i = 0; i < int.MaxValue; i++)
                {
                    if (cancellationToken.IsCancellationRequested)
                    {
                        break;
                    }
                }
            });
        }
```

wywołanie metody w tym przypadku wygląda tak:

```csharp
var cts = new CancellationTokenSource();
var token = cts.Token;
await DoSomeWorkAsync(token);
```

oraz żądanie przerwania:

```csharp
cts.Cancel();
```

Cały działający kod z przykładem (pomimo tego, że ma on tylko 55 linii) jak zawsze dostępny na <a href="https://github.com/RamzesBlog/IPorgressConsoleDemo" target="_blank"><strong>GitHub</strong> </a>😉