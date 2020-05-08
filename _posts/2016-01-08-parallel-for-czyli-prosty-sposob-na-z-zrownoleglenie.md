---
title: 'Parallel.For - Czyli prosty sposób na zrównoleglenie.'
date: 2016-01-08T18:59:23+00:00
author: Adrian Karalus
layout: post
permalink: /2016/01/parallel-for-czyli-prosty-sposob-na-z-zrownoleglenie/
image: /assets/content/uploads/2016/01/2016-01-08-17_45_35-ParallelForExample-Microsoft-Visual-Studio-250x129.png
categories:
  - Programowanie
tags:
  - for
  - ForEach
  - loop
  - parallel
---
Ogromna większość dzisiejszych procesorów posiada wiele rdzeni, co umożliwia działanie programu na wielu wątkach oraz przyspieszenie obliczeń.  
Pętle, które posiadają dużą ilość kroków czasami, aż proszą się o to by zastosować przetwarzanie równoległe.

Oczywiście, zrównoleglenia można użyć tylko w przypadku gdy kolejne kroki pętli (oraz wyniki otrzymywane w pojedynczym kroku) są od siebie niezależne. W przeciwnym przypadku, równoległe obliczenia mogą okazać się niemożliwe do zrobienia, a ewentualny zysk - bardzo mały.

Te założenia w praktyce dość mocno ograniczają nam ilość przypadków, w których można zastosować zrónoleglenie. Jednak, są to problemy ogólnie z przetwarzaniem równoległym i nie będę się tutaj na ten temat rozpisywać.

Jednym z najprostszych sposobów zrównoleglenia obliczeń wykonywanych w pętli - jest skorzystanie z dobrodziejstw klasy *Parallel*, a dokładniej metod **For** i **ForEach**.

```csharp
var start = 0;
var stop = 100;

Parallel.For(start, stop, (i) =>
{
    //Do something with: i
});
```

Chyba nie da się prościej.  
Funkcja przyjmowana przez metodę *For* (w tym przypadku wyrażenie lambda z jednym parametrem), może przyjmować dwa parametry.  
Drugim jest obiekty typy **ParallelLoopState**, który może posłużyć do komunikacji pomiędzy iteracjami, oraz do przerwania wykonywania pętli.

```csharp
Parallel.For(start, stop, (i, loopState) =>
{
    Console.WriteLine(i + " " + Thread.CurrentThread.ManagedThreadId);

    if (i.Equals(10))
        loopState.Stop(); //or loopState.Break();

});
```

Do przerwania obliczeń, mamy do wyboru, [aż dwie metody - każda ma inne działanie](http://stackoverflow.com/questions/8818203/what-is-difference-between-loopstate-break-loopstate-stop-and-cancellationt).

Dzięki metodzie `Parallel.ForEach` możliwe jest, zrównoleglenie działań na obiektach kolekcji.

```csharp
Parallel.ForEach(new List<int>() { 0, 1, 2, 3 }, (i) =>
{
    Console.WriteLine(i);
});
```

Jedną z największych, moim zdaniem, zalet używania `Parallel.For` oraz `Parallel.ForEach` jest taki, że liczba użytych wątków jest dobrana tak, aby maksymalnie wykorzystać sprzęt na jakim działa program, a tym samym zmaksymalizować zysk czasowy. Wszystko to dzieje się automagicznie 😉