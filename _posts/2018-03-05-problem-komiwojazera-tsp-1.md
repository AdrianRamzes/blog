---
id: 792
title: 'Problem komiwojażera - TSP #1'
date: 2018-03-05T02:34:47+00:00
author: Adrian Karalus
layout: post
guid: http://www.karalus.eu/?p=792
permalink: /2018/03/problem-komiwojazera-tsp-1/
image: /wp-content/uploads/2018/03/tsp_nn_solutions.gif
categories:
  - Programowanie
tags:
  - '#tsp #nn #traveling #salesman #problem #np-hard #csharp'
---
## Wstęp

Chciałbym zacząć mini serię wpisów o algorytmach używanych do wyznaczenia trasy w [problemie komiwojażera](https://pl.wikipedia.org/wiki/Problem_komiwojażera). TSP (Travelling Salesman Problem) jest problemem NP-trudnym. Żaden z dzisiejszych algorytmów, nie gwarantuje znalezienia optymalnej trasy. Oczywiście chodzi tutaj o wyznaczenie jej w sensownym czasie. "W sensownym czasie" jest tutaj kluczem, ponieważ zawsze można użyć brutalnej siły (brute force), jednak takie podejście nie jest akceptowane z racji tego, że już dla 20 miast (wierzchołków) mamy 60822550204416000 możliwości (6,08&#215;10<sup>16</sup>).  
GOOD-LUCK-WITH-THAT. 

## NN

W pierwszym wpisie z serii chciałbym omówić najprostsze podejście do problemu &#8211; NN (Nearest Neighbour).  
NN jest algorytmem zachłannym i polega na wybraniu losowego wierzchołka i przechodzeniu do kolejnego, najbliższego jeszcze nieodwiedzonego.  
Działanie:

  1. Ustaw dowolny wierzchołek jako aktualny
  2. Znajdź najkrótszą drogę łączącą aktualny wierzchołek z jeszcze nieodwiedzonym wierzchołkiem V &#8211; tzw. najbliższy sąsiad
  3. Ustaw V jako aktualny wierzchołek
  4. Oznacz V jako odwiedzony
  5. Jeśli wszystkie wierzchołki zostały odwiedzone, przerwij program
  6. Idź do kroku 2.

To podejście jest bardzo szybkie, jednak zazwyczaj nie daje ono optymalnego wyniku. 

## Implementacja oraz testy

Dane wejściowe programu znajdują się w pliku <a href="http://www.karalus.eu/wp-content/uploads/2018/03/kroA100.txt" rel="noopener" target="_blank">kroA100</a>, który zawiera 100 losowych punktów w postaci `{id} {x} {y}`. Program na starcie wczytuje dane do dwóch kolekcji:

<pre class="brush: csharp; title: ; notranslate" title="">static Dictionary&lt;int, Vertex&gt; vertices;
static Dictionary&lt;int, Dictionary&lt;int, double&gt;&gt; distances;
</pre>

`vertices` &#8211; słownik zawierający wczytane punkty, kluczem jest id punktu.  
`distances` &#8211; słowik zawierający informacje o odległości pomiędzy dowolną parą punktów. 

Poniżej znajduje się kod metody, która przyjmuje punkt startowy i zwraca pojedyncze rozwiązanie.

<pre class="brush: csharp; title: ; notranslate" title="">private static List&lt;Edge&gt; NN(Vertex firstVertex)
{
    var used = new HashSet&lt;int&gt;();

    var solution = new List&lt;Edge&gt;();
    var source = firstVertex;
    for (int i = 0; i &lt; vertices.Count - 1; i++)
    {
        used.Add(source.Id);

        var targetId = distances[source.Id]
            .OrderBy(x =&gt; x.Value)
            .First(n =&gt; !used.Contains(n.Key))
            .Key;

        var target = vertices[targetId];

        solution.Add(new Edge(source, target));

        source = target;
    }

    solution.Add(new Edge(source, solution[0].Source));

    return solution;
}
</pre></p> 

## Wynik

Najlepszy wynik uzyskany przy pomocy powyżej zaimplementowanego algorytmu NN to: 24698.  
Jest to zaskakująco dobrze, biorąc pod uwagę, że najlepszy znaleziony wynik dla kroA100 wynosi <a href="http://comopt.ifi.uni-heidelberg.de/software/TSPLIB95/STSP.html" rel="noopener" target="_blank">21282</a>.  
Poniżej wizualizacja kilku tras wyznaczonym przez powyższy NN. 

<img src="https://i2.wp.com/www.karalus.eu/wp-content/uploads/2018/03/tsp_nn_solutions.gif" alt="TSP - NN - rozwiązania " data-recalc-dims="1" />