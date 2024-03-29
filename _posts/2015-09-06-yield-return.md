---
title: Yield return
date: 2015-09-06T21:22:27+00:00
author: Adrian Karalus
layout: post
permalink: /2015/09/yield-return/
image: /assets/content/uploads/2015/09/yieldreturn-250x202.png
categories:
  - Programowanie
tags:
  - 'c#'
  - IEnumerable
  - lazy
  - loading
  - return
  - yield
---
Metodę, która zwraca obiekt (kolekcję) `IEnumerable<T>` możemy napisać używając `yield return`.  
Jeżeli w ciele metody znajduje się słowo kluczowe 

`yield` to jej wywołanie nie powoduje od razu wykonania kodu - odwrotnie niż to ma miejsce w zwykłych metodach.

Załóżmy, że mamy funkcję, która wraca nam `IEnumerable<int>` kolejnych liczb naturalnych:

```csharp
private static IEnumerable<int> Regular(int size)
{
    var result = new int[size];

    for (int i = 0; i < size; i++)
    {
        result[i] = i;
    }

    return result;
}
```

Jeśli wywołamy ją w następujący sposób:

```csharp
var regular = Regular(1000);
var x = regular.ElementAt(0);
```

to pomimo tego, że potrzebujemy jedynie pierwszy element kolekcji, zużyliśmy tyle samo zasobów pamięci i procesora co dla tysięcznego elementu.  
Jest to ogromne marnotrawstwo!

Gdyby ciało metody wyglądało tak:

```csharp
private static IEnumerable<int> Yield(int count)
{
    for (int i = 0; i < count; i++)
    {
        yield return i;
    }
}
```

to pętla wykona się tylko raz!  
Dlaczego? Ponieważ wywołanie metody _Yield(1000)_ nie powoduje jej wykonania z miejsca, a dopiero przy pierwszym odwołaniu się do kolekcji. Dodatkowo wykonuje się tylko tyle razy ile potrzeba, aby zwrócić wynik.

Ogromna oszczędność!

Jednak nie jest do, aż tak kolorowe.

Ponieważ, metoda *Yield* wykona się ZAWSZE gdy nastąpi odwołanie, do któregoś elementu.  
Co jeśli odwołamy się do elementu o indeksie 999? Pętla wewnątrz metody wykona się 1000 razy.  
I tutaj jeszcze jest ok, ponieważ w tym przypadku nie ma znaczenia czy użyjemy metody z yield czy nie, jednak jeśli odwołamy się do tego samego elementu kolejny raz, to pętla wykona się kolejny 1000 razy!

Z tego wynika, że nie jest to wartościowanie leniwe z prawdziwego zdarzenia. Brakuje mechanizmu trzymającego w pamięci wszystkie poprzednie wyniki.  
Odwołanie się do elementu #5 powinno zapisać w pamięci ten element, oraz wszystkie wcześniejsze (#1 #2 #3 i #4).

Tak, więc słowo kluczowe **yield**, może pomóc nam zaoszczędzić nieco czasu i zasobów, ale w pewnych przypadkach może być odwrotnie.