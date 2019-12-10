---
title: ExtensionMethods
date: 2015-03-19T17:14:57+00:00
author: Adrian Karalus
layout: post
permalink: /2015/03/extensionmethods/
image: /blog/wp-content/uploads/2015/03/2015-03-19-17_08_12-ExtensionMethods-Microsoft-Visual-Studio.png
categories:
  - Programowanie
tags:
  - 'c#'
  - extension
  - ForEach
  - isnull
  - loop
  - method
  - times
---
W języku C# możliwe jest rozszerzanie typów o własne metody.  
Dużo ciekawych (ale i beznadziejnie bezużytecznych) przykładów znajdziecie na [tej](http://extensionmethod.net/csharp/) stronie.

Mnie osobiście urzekła pętla Times. Wcześniej spotkałem się z tą pętlą przy okazji nauki języka Ruby.  
Przykład użycia:

```csharp
10.Times(() => DoSomething());
10.Times((i) => DoSomething(i));
```

Przyznacie, że nie można odmówić jej uroku 😉

Implementacja:

```csharp
public static void Times(this int count, Action action)
{
    for (int i = 0; i < count; i++)
    {
        action();
    }
}

public static void Times(this int count, Action<int> action)
{
    for (int i = 0; i < count; i++)
    {
        action(i);
    }
}
```

Kolejną ciekawą metodą jest IsNull(), która rozszerza klasę *object*.  
Pamiętajmy, że po tej klasie dziedziczą wszystkie inne klasy, a więc metody `IsNull()` można używać na każdym obiekcie.  
Implementacja:

```csharp
public static bool IsNull(this object o)
{
    return o == null;
}
```

Po co używać tej metody? Jakie są argumenty za?  
Nie ma żadnych! Tylko i wyłącznie estetyka i trochę większe zbliżenie języka programowania do języka mówionego 😉  
`if(variable.IsNull())` czy `if(variable == null)`. Kwestia tylko i wyłącznie gustu, a o nim się nie dyskutuje.

Jednym z praktycznych zastosowań jest rozszerzenie kolekcji `IEnumerable<>` o metodę `ForEach()`.  
Taką metodę posiada lista, ale np. tablica już nie. Dzięki temu rozszerzeniu możemy wywoływać `ForEach()` na dowolnym obiekci klasy implementującej interfejs IEnumerable. Nawet na stringach!  
Implementacja:

```csharp
public static void ForEach<T>(this IEnumerable<T> collection, Action<T> action)
{
    foreach (T element in collection)
    {
        action(element);
    }
}
```

przykład użycia:

```csharp
object[] array = new object[5];
array.ForEach((o) => Console.WriteLine(o.IsNull() ? "null" : "not null"));
```

i przykład ze stringiem:

```csharp
"THE END".ForEach((c) => { });
```

 

Jak zawsze kod do tego wpisu został opublikowany na [GitHub ](https://github.com/AdrianRamzes/ExtensionMethods)😉