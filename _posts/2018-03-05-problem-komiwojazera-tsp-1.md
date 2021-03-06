---
title: 'Problem komiwojażera - TSP #1'
date: 2018-03-05T02:34:47+00:00
author: Adrian Karalus
layout: post
permalink: /2018/03/problem-komiwojazera-tsp-1/
image: /assets/content/uploads/2018/03/tsp_nn_solutions.gif
categories:
  - Programowanie
tags:
  - '#tsp #nn #traveling #salesman #problem #np-hard #csharp'
---
## Wstęp

Chciałbym zacząć mini serię wpisów o algorytmach używanych do wyznaczenia trasy w [problemie komiwojażera](https://pl.wikipedia.org/wiki/Problem_komiwojażera). TSP (Travelling Salesman Problem) jest problemem NP-trudnym. Żaden z dzisiejszych algorytmów, nie gwarantuje znalezienia optymalnej trasy. Oczywiście chodzi tutaj o wyznaczenie jej w sensownym czasie. "W sensownym czasie" jest tutaj kluczem, ponieważ zawsze można użyć brutalnej siły (brute force), jednak takie podejście nie jest akceptowane z racji tego, że już dla 20 miast (wierzchołków) mamy 60822550204416000 możliwości (6,08x10<sup>16</sup>).  
GOOD-LUCK-WITH-THAT. 

## NN

W pierwszym wpisie z serii chciałbym omówić najprostsze podejście do problemu - NN (Nearest Neighbour).  
NN jest algorytmem zachłannym i polega na wybraniu losowego wierzchołka i przechodzeniu do kolejnego, najbliższego jeszcze nieodwiedzonego.  
Działanie:

  1. Ustaw dowolny wierzchołek jako aktualny
  2. Znajdź najkrótszą drogę łączącą aktualny wierzchołek z jeszcze nieodwiedzonym wierzchołkiem V - tzw. najbliższy sąsiad
  3. Ustaw V jako aktualny wierzchołek
  4. Oznacz V jako odwiedzony
  5. Jeśli wszystkie wierzchołki zostały odwiedzone, przerwij program
  6. Idź do kroku 2.

To podejście jest bardzo szybkie, jednak zazwyczaj nie daje ono optymalnego wyniku. 

## Implementacja oraz testy

Dane wejściowe programu znajdują się w pliku [kroA100](/assets/content/uploads/2018/03/kroA100.txt" rel="noopener), który zawiera 100 losowych punktów w postaci `{id} {x} {y}`. Program na starcie wczytuje dane do dwóch kolekcji:

```csharp
static Dictionary<int, Vertex> vertices;
static Dictionary<int, Dictionary<int, double>> distances;
```

`vertices` - słownik zawierający wczytane punkty, kluczem jest id punktu.  
`distances` - słowik zawierający informacje o odległości pomiędzy dowolną parą punktów. 

Poniżej znajduje się kod metody, która przyjmuje punkt startowy i zwraca pojedyncze rozwiązanie.

```csharp
private static List<Edge> NN(Vertex firstVertex)
{
    var used = new HashSet<int>();

    var solution = new List<Edge>();
    var source = firstVertex;
    for (int i = 0; i < vertices.Count - 1; i++)
    {
        used.Add(source.Id);

        var targetId = distances[source.Id]
            .OrderBy(x => x.Value)
            .First(n => !used.Contains(n.Key))
            .Key;

        var target = vertices[targetId];

        solution.Add(new Edge(source, target));

        source = target;
    }

    solution.Add(new Edge(source, solution[0].Source));

    return solution;
}
```

## Wynik

Najlepszy wynik uzyskany przy pomocy powyżej zaimplementowanego algorytmu NN to: 24698.  
Jest to zaskakująco dobrze, biorąc pod uwagę, że najlepszy znaleziony wynik dla kroA100 wynosi [21282](http://comopt.ifi.uni-heidelberg.de/software/TSPLIB95/STSP.html" rel="noopener).  
Poniżej wizualizacja kilku tras wyznaczonym przez powyższy NN. 

![](/assets/content/uploads/2018/03/tsp_nn_solutions.gif)