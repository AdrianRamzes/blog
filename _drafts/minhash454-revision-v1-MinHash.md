---
id: 468
title: MinHash
date: 2016-03-08T12:22:16+00:00
author: admin
layout: revision
guid: http://www.karalus.eu/2016/03/454-revision-v1/
permalink: /2016/03/454-revision-v1/
---
Załóżmy, że musimy porównać ze sobą wiele dokumentów o dużym rozmiarze. Stosując podejście tradycyjne musielibyśmy podzielić dokumenty na wyrazy lub k-długie podciągi, tak aby każdy dokument był reprezentowany jako zbiór występujących w nim podciagów, dopiero wtedy porównywalibyśmy te zbiory. Podejście <a href="https://en.wikipedia.org/wiki/MinHash" target="_blank">MinHash</a> polega na tym, aby dla każdego dokumentu wygenerować jego sygnaturę, i porównywać ze sobą tylko te sygnatury. Oczywiście, stosując funkcje skrótu chodzi nam o to, aby mało różniące się dokumenty generowały zupełnie inne hash'e. W technice MinHash chodzi o coś dokładnie odwrotnego. Chcemy, aby podobne dokumenty miały podobne sygnatury.  
Pomijając matematyczne teorie, należy zapamiętać, że: **prawdopodobieństwo konfliktu wygenerowanych hash'y jest równe współczynnikowi podobieństwa Jaccarda**. Jeśli chcemy oszacować podobieństwo dwóch dokumentów zazwyczaj używa się 100-200 różnych funkcji hashujących.

Czas na implementację.  
Będę kontynuować przykład z mojego <a href="/blog/2016/02/obliczanie-wspolczynnika-jaccarda-dla-wielu-obiektow/" target="_blank">wcześniejszego wpisu</a>.

Funkcja generująca hash ma postać następującą:

```csharp
private static uint GetHash(int a, int b, int p, int input)
{
    return (uint)((a * input + b) % p);
}
```

Parametr _p_ to duża liczba pierwsza, przyjmuje się, że _p_ nie może być mniejsze niż największy identyfikator w kolekcji. W naszym przypadku _p_ będzie zawsze miało wartość równą 28000019.

No dobra, teraz zmieniając parametry _a_ i _b_ będziemy mogli wygenerować 100 rożnych funkcji hashujących. Wszystkie funkcje będziemy przechowywać w tablicy.

```csharp
private static void InitializeHashFunctions(int universeSize)
{
    _hashFunctions = new HashFunction[_numHashFunctions];

    Random rand = new Random(13);
    for (int i = 0; i < _numHashFunctions; i++)
    {
        int a = rand.Next(universeSize);
        int b = rand.Next(universeSize);
        int p = 28000019;// First Prime Number Greater Than Biggest Identifier
        _hashFunctions[i] = input => GetHash(a, b, p, input);
    }
}
```

Okej. Mamy już tablicę. Teraz czas na funkcję, która policzy nam MinHashe dla pojedynczego zbioru piosenek.

```csharp
private static uint[] GetMinHash(IEnumerable<int> set)
{
    var minHashes = new uint[_numHashFunctions];
    for (int i = 0; i < _numHashFunctions; i++)
    {
        minHashes[i] = int.MaxValue;
    }

    foreach (var item in set)//songs: 5 10 15   // 5 -> 55, 10 -> 2, 15 -> 99
    {
        for (int i = 0; i < _numHashFunctions; i++)
        {
            var hash = _hashFunctions[i](item);
            minHashes[i] = Math.Min(hash, minHashes[i]);
        }
    }
    return minHashes;
}
```

Teraz wystarczy obliczyć MinHash'e dla każdego użytkownika - w ten sposób powstanie macierz sygnatur. W celu przyspieszenia obliczeń wykonamy je równolegle:

```csharp
Dictionary<int, uint[]> signatureMatrix = new Dictionary<int, uint[]>();
Parallel.ForEach(users, user =>
{
    var hash = GetMinHash(user.Value);
    //usersMinHash[user.Key] = new HashSet<uint>(hash);
    lock (sync)
    {
        signatureMatrix[user.Key] = hash;
    }
});
```

Na moim komputerze (Intel i7-4702MQ) obliczenie MinHash'y dla 1014070 użytkowników zajmuje ok 9 sek. Uważam, że jest to całkiem przyzwoity wynik.

Super, mamy te MinHash'e i teraz zamiast porównywać zbiory porównujemy sygnatury. Nadal pozostaje JEDEN BARDZO DUŻY PROBLEM - w celu znalezienia podobnych użytkowników nadal musimy porównać KAŻDEGO Z KAŻDYM! Przyspieszyliśmy nieco czas porównywania, ale wcale nie zmieniła się ilość potrzebnych porównań, która nadal jest ogromna. Ten problem można obejść stosując kolejny trik <a href="https://en.wikipedia.org/wiki/Locality-sensitive_hashing" target="_blank">LSH</a>. Opiszę go w moim następnym wpisie.

 