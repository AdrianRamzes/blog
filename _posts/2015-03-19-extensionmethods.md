---
id: 150
title: ExtensionMethods
date: 2015-03-19T17:14:57+00:00
author: Adrian Karalus
layout: post
guid: http://www.karalus.eu/Blog/?p=150
permalink: /2015/03/extensionmethods/
image: /wp-content/uploads/2015/03/2015-03-19-17_08_12-ExtensionMethods-Microsoft-Visual-Studio.png
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
Dużo ciekawych (ale i beznadziejnie bezużytecznych) przykładów znajdziecie na <a href="http://extensionmethod.net/csharp/" target="_blank">tej</a> stronie.

<!--more-->

Mnie osobiście urzekła pętla Times. Wcześniej spotkałem się z tą pętlą przy okazji nauki języka Ruby.  
Przykład użycia:

<pre class="brush: csharp; title: ; notranslate" title="">10.Times(() =&gt; DoSomething());
10.Times((i) =&gt; DoSomething(i));
</pre>

Przyznacie, że nie można odmówić jej uroku 😉

Implementacja:

<pre class="brush: csharp; title: ; notranslate" title="">public static void Times(this int count, Action action)
        {
            for (int i = 0; i &lt; count; i++)
            {
                action();
            }
        }

        public static void Times(this int count, Action&lt;int&gt; action)
        {
            for (int i = 0; i &lt; count; i++)
            {
                action(i);
            }
        }
</pre>

Kolejną ciekawą metodą jest IsNull(), która rozszerza klasę &#8222;object&#8221;.  
Pamiętajmy, że po tej klasie dziedziczą wszystkie inne klasy, a więc metody IsNull() można używać na każdym obiekcie.  
Implementacja:

<pre class="brush: csharp; title: ; notranslate" title="">public static bool IsNull(this object o)
        {
            return o == null;
        }
</pre>

Po co używać tej metody? Jakie są argumenty za?  
Nie ma żadnych! Tylko i wyłącznie estetyka i trochę większe zbliżenie języka programowania do języka mówionego 😉  
&#8222;if(variable.IsNull())&#8221; czy &#8222;&#8221;if(variable == null)&#8221;. Kwestia tylko i wyłącznie gustu, a o nim się nie dyskutuje.

Jednym z praktycznych zastosowań jest rozszerzenie kolekcji IEnumerable<> o metodę ForEach().  
Taką metodę posiada lista, ale np. tablica już nie. Dzięki temu rozszerzeniu możemy wywoływać ForEach() na dowolnym obiekci klasy implementującej interfejs IEnumerable. Nawet na stringach!  
Implementacja:

<pre class="brush: csharp; title: ; notranslate" title="">public static void ForEach&lt;T&gt;(this IEnumerable&lt;T&gt; collection, Action&lt;T&gt; action)
        {
            foreach (T element in collection)
            {
                action(element);
            }
        }
</pre>

przykład użycia:

<pre class="brush: csharp; title: ; notranslate" title="">object[] array = new object[5];
            array.ForEach((o) =&gt; Console.WriteLine(o.IsNull() ? "null" : "not null"));
</pre>

i przykład ze stringiem:

<pre class="brush: csharp; title: ; notranslate" title="">"THE END".ForEach((c) =&gt; { });
</pre>

&nbsp;

Jak zawsze kod do tego wpisu został opublikowany na <a href="https://github.com/RamzesBlog/ExtensionMethods" target="_blank">GitHub </a>😉