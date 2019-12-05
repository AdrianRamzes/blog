---
id: 363
title: Yield return
date: 2015-09-06T21:32:40+00:00
author: admin
layout: revision
guid: http://www.karalus.eu/2015/09/357-revision-v1/
permalink: /2015/09/357-revision-v1/
---
Metodę, która zwraca obiekt (kolekcję) _IEnumerable<T>_ możemy napisać używając _yield return_.  
<!--more-->Jeżeli w ciele metody znajduje się słowo kluczowe 

_yield_ to jej wywołanie nie powoduje od razu wykonania kodu &#8211; odwrotnie niż to ma miejsce w zwykłych metodach.

Załóżmy, że mamy funkcję, która wraca nam _IEnumerable<int>_ kolejnych liczb naturalnych:

<pre class="brush: csharp; title: ; notranslate" title="">private static IEnumerable&lt;int&gt; Regular(int size)
        {
            var result = new int[size];

            for (int i = 0; i &lt; size; i++)
            {
                result[i] = i;
            }

            return result;
        }
</pre>

Jeśli wywołamy ją w następujący sposób:

<pre class="brush: csharp; title: ; notranslate" title="">var regular = Regular(1000);
            var x = regular.ElementAt(0);
</pre>

to pomimo tego, że potrzebujemy jedynie pierwszy element kolekcji, zużyliśmy tyle samo zasobów pamięci i procesora co dla tysięcznego elementu.  
Jest to ogromne marnotrawstwo!

Gdyby ciało metody wyglądało tak:

<pre class="brush: csharp; title: ; notranslate" title="">private static IEnumerable&lt;int&gt; Yield(int count)
        {
            for (int i = 0; i &lt; count; i++)
            {
                yield return i;
            }
        }
</pre>

to pętla wykona się tylko raz!  
Dlaczego? Ponieważ wywołanie metody _Yield(1000)_ nie powoduje jej wykonania z miejsca, a dopiero przy pierwszym odwołaniu się do kolekcji. Dodatkowo wykonuje się tylko tyle razy ile potrzeba, aby zwrócić wynik.

Ogromna oszczędność!

Jednak nie jest do, aż tak kolorowe.

Ponieważ, metoda _Yield_ wykona się ZAWSZE gdy nastąpi odwołanie, do któregoś elementu.  
Co jeśli odwołamy się do elementu o indeksie 999? Pętla wewnątrz metody wykona się 1000 razy.  
I tutaj jeszcze jest ok, ponieważ w tym przypadku nie ma znaczenia czy użyjemy metody z yield czy nie, jednak jeśli odwołamy się do tego samego elementu kolejny raz, to pętla wykona się kolejny 1000 razy!

Z tego wynika, że nie jest to wartościowanie leniwe z prawdziwego zdarzenia. Brakuje mechanizmu trzymającego w pamięci wszystkie poprzednie wyniki.  
Odwołanie się do elementu #5 powinno zapisać w pamięci ten element, oraz wszystkie wcześniejsze (#1 #2 #3 i #4).

Tak, więc słowo kluczowe &#8222;yield&#8221;, może pomóc nam zaoszczędzić nieco czasu i zasobów, ale w pewnych przypadkach może być odwrotnie.