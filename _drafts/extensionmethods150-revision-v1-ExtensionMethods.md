---
id: 278
title: ExtensionMethods
date: 2015-05-11T12:26:33+00:00
author: Adrian Karalus
layout: revision
guid: http://www.karalus.eu/2015/05/150-revision-v1/
permalink: /2015/05/150-revision-v1/
---
W języku C# możliwe jest rozszerzanie typów o własne metody.  
Dużo ciekawych (ale i beznadziejnie bezużytecznych) przykładów znajdziecie na <a href="http://extensionmethod.net/csharp/" target="_blank">tej</a> stronie.

<!--more-->

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

Kolejną ciekawą metodą jest IsNull(), która rozszerza klasę "object".  
Pamiętajmy, że po tej klasie dziedziczą wszystkie inne klasy, a więc metody IsNull() można używać na każdym obiekcie.  
Implementacja:

```csharp
public static bool IsNull(this object o)
        {
            return o == null;
        }
```

Po co używać tej metody? Jakie są argumenty za?  
Nie ma żadnych! Tylko i wyłącznie estetyka i trochę większe zbliżenie języka programowania do języka mówionego 😉  
"if(variable.IsNull())" czy ""if(variable == null)". Kwestia tylko i wyłącznie gustu, a o nim się nie dyskutuje.

Jednym z praktycznych zastosowań jest rozszerzenie kolekcji IEnumerable<> o metodę ForEach().  
Taką metodę posiada lista, ale np. tablica już nie. Dzięki temu rozszerzeniu możemy wywoływać ForEach() na dowolnym obiekci klasy implementującej interfejs IEnumerable. Nawet na stringach!  
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

 

Jak zawsze kod do tego wpisu został opublikowany na <a href="https://github.com/AdrianRamzes/ExtensionMethods" target="_blank">GitHub </a>😉