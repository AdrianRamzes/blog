---
title: Obliczanie współczynnika Jaccarda dla wielu obiektów.
date: 2016-02-11T00:26:55+00:00
author: Adrian Karalus
layout: post
permalink: /2016/02/obliczanie-wspolczynnika-jaccarda-dla-wielu-obiektow/
image: /blog/assets/content/uploads/2016/02/7017OS_09_03-250x142.jpg
categories:
  - Programowanie
tags:
  - 'c#'
  - Jaccard
  - NN
  - programowanie
---
**Problem:**  
Mamy [dane z serwisu muzycznego](/blog/assets/content/uploads/2016/02/facts.7z) - log odsłuchanych utworów, postaci: IdUtworu, IdUżytkownika, Data odtworzenia.  
Chcemy się dowiedzieć, którzy użytkownicy mają podobny gust muzyczny. Dla każdego użytkownika chcemy dostać listę jego najbliższych sąsiadów.  
Do miary podobieństwa użyjemy [współczynnika Jaccarda](https://en.wikipedia.org/wiki/Jaccard_index).  
Wpisów jest ponad 27 mln. (plik tekstowy ma ponad 500 MB), użyte algorytmy i struktury danych mają więc ogromny wpływ na czas obliczeń.

## Rozwiązanie:  

### 1. Wczytanie danych.**

 - najszybszą metodą wczytywania danych z pliku (wg. autora [tego wpisu](http://cc.davelozinski.com/c-sharp/fastest-way-to-read-text-files)), jest wczytywanie linijka po linijce. Przeprowadzone przeze mnie testy również potwierdzają wyniki tego eksperymentu.

 - do przechowywanie danych proponuję użyć słownika `Dictionary<int, HashSet<int>>`. Kluczem będzie IdUżytkownika, a wartością zbiór pisenek. Dlaczego HashSet? Ponieważ, nie interesuje nas ile razy użytkownik odtworzył daną piosenkę, a jedynie czy w ogóle ją odtworzył. HashSet ma jeszcze jedną niewątpliwą zaletę: przy dużej ilości elementów, czas operacji Contains jest stały. Oczywiście wiąże się to z większą zajętością pamięci fizycznej. Moja maszyna ma 16GB RAM, więc w tym przypadku nie mam co się martwić o OutOfMemoryException.

```csharp
Dictionary<int, HashSet<int>> users = new Dictionary<int, HashSet<int>>();
using (StreamReader sr = File.OpenText("facts.csv"))
{
    string s = String.Empty;

    var headers = sr.ReadLine().Split(',');//first line
    while ((s = sr.ReadLine()) != null)
    {
        var values = s.Split(',');
        int songId = int.Parse(values[0]);
        int userId = int.Parse(values[1]);

        if (users.ContainsKey(userId))
        {
            //if (!users[userId].Contains(songId))
            users[userId].Add(songId);
        }
        else
        {
            users[userId] = new HashSet<int>() { songId };
        }
    }
}
```

Wykonanie powyższego kody zajmuje średnio 20 sek.

### 2. Obliczenie podobieństwa.

 - znajdziemy wszystkich najbliższych sąsiadów dla 100 pierwszych użytkowników. Wyniki będą trzymane w słowniku `Dictionary<int, Dictionary<int, double>>`, będzie IdUżytkownika, a wartością słownik IdUżytkownika-Wartość współczynnika Jaccarda.

```csharp
Dictionary<int, Dictionary<int, double>> similarity = new Dictionary<int, Dictionary<int, double>>();
foreach(var currentUser in users.Take(100))
{
    foreach (var user in users)
    {
        //calculate Jaccard
    }
}
```

 - współczynnik Jaccarda wyznaczymy dzieląc liczebność części wspólnej zbiorów przez liczebność sumy zbiorów.  
Można to zrobić na wiele różnych sposobów np. używając metod Intersect i Union. Warto jednak wykorzystać fakt, że jedne zbiory piosenek są mniejsze od drugich.  
Okazuje się, że najszybszą metodą (przynajmniej z tych, które znam) jest "ręczne" iterowanie po mniejszym zbiorze i sprawdzanie (przy pomocy metody Contains) czy dana piosenka występuje w drugim zbiorze.  
Nie trzeba również wykonywać operacji Union. Wystarczy dodać do siebie liczności zbiorów, a następnie od sumy odjąć część wspólną. Takie proste zabiegi powodują znaczne zwiększenie wydajności.

```csharp
Dictionary<int, Dictionary<int, double>> similarity = new Dictionary<int, Dictionary<int, double>>();
foreach(var currentUser in users.Take(100))
{
    similarity[currentUser.Key] = new Dictionary<int, double>();

    foreach (var user in users)
    {
        if (user.Key.Equals(currentUser.Key))
            continue;
        else
        {
            var sameSongs = 0;
            if (currentUser.Value.Count < user.Value.Count)
            {
                foreach (var currentSong in currentUser.Value)
                {
                    if (user.Value.Contains(currentSong))
                        sameSongs++;
                }
            }
            else
            {
                foreach (var currentSong in user.Value)
                {
                    if (currentUser.Value.Contains(currentSong))
                        sameSongs++;
                }
            }

            if (sameSongs > 0)
            {
                similarity[currentUser.Key][user.Key] = ((double)sameSongs / ((currentUser.Value.Count() + user.Value.Count()) - sameSongs));
            }
        }
    }
}
```

Całość możemy dodatkowo zrównoleglić przy pomocy [Parallel.ForEach](/blog/2016/01/parallel-for-czyli-prosty-sposob-na-z-zrownoleglenie/).

```csharp
Dictionary<int, Dictionary<int, double>> similarity = new Dictionary<int, Dictionary<int, double>>();
Parallel.ForEach(users.Take(100).ToArray(), (currentUser) =>
{
    lock (sync)
    {
        similarity[currentUser.Key] = new Dictionary<int, double>(); ;
    }
    
    foreach (var user in users)
    {
        if (user.Key.Equals(currentUser.Key))
            continue;
        else
        {
            var sameSongs = 0;
            
            if (currentUser.Value.Count < user.Value.Count)
            {
                foreach (var currentSong in currentUser.Value)
                {
                    if (user.Value.Contains(currentSong))
                        sameSongs++;
                }
            }
            else
            {
                foreach (var currentSong in user.Value)
                {
                    if (currentUser.Value.Contains(currentSong))
                        sameSongs++;
                }
            }
            
            if (sameSongs > 0)
            {
                lock (sync)
                {
                    similarity[currentUser.Key][user.Key] = ((double)sameSongs / ((currentUser.Value.Count() + user.Value.Count()) - sameSongs));
                }
            }
        }
    }
});
```

Należy pamiętać, że operację na słowniku należy zamknąć w sekcji krytycznej.  
U mnie obliczenia zajmują jakieś 10 sek. (Intel i7-4702MQ) ale to jest tylko dla 100 pierwszych użytkowników. Użytkowników jest ponad milion, co sprawia, że jeśli chciałbym policzyć współczynnik Jaccarda dla wszystkich zajęłoby to ponad 27h.

Warto zauważyć, że każdy użytkownik ma tylko niewielu bliskich sąsiadów (czyli użytkowników o podobnym guście muzycznym). W praktyce, zazwyczaj chodzi nam o krótką listę najbardziej podobnych użytkowników (powiedzmy 100 najbliższych sąsiadów), oznacza to, że większość czasu jest marnowana. Przydałby się mechanizm, który dokona wstępnego odsiania użytkowników niepodobnych. Z pomocą przychodzi tutaj technika zwana [MinHash](/blog/2016/03/minhash/2016-03-04-minhash") oraz algorytm [LSH](en.wikipedia.org/wiki/Locality-sensitive_hashing). O tym opowiem w moim następnym wpisie.