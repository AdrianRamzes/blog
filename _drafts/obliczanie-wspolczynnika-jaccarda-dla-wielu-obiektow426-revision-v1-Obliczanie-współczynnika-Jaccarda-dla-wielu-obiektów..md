---
id: 466
title: Obliczanie współczynnika Jaccarda dla wielu obiektów.
date: 2016-03-04T01:35:31+00:00
author: admin
layout: revision
guid: http://www.karalus.eu/2016/03/426-revision-v1/
permalink: /2016/03/426-revision-v1/
---
**Problem:**  
Mamy <a href="http://www.karalus.eu/wp-content/uploads/2016/02/facts.7z" target="_blank">dane z serwisu muzycznego</a> - log odsłuchanych utworów, postaci: IdUtworu, IdUżytkownika, Data odtworzenia.  
Chcemy się dowiedzieć, którzy użytkownicy mają podobny gust muzyczny. Dla każdego użytkownika chcemy dostać listę jego najbliższych sąsiadów.  
Do miary podobieństwa użyjemy <a href="https://en.wikipedia.org/wiki/Jaccard_index" target="_blank">współczynnika Jaccarda</a>.  
Wpisów jest ponad 27 mln. (plik tekstowy ma ponad 500 MB), użyte algorytmy i struktury danych mają więc ogromny wpływ na czas obliczeń.

**Rozwiązanie:  
**  
**1. Wczytanie danych.**

**a)** najszybszą metodą wczytywania danych z pliku (wg. autora <a href="http://cc.davelozinski.com/c-sharp/fastest-way-to-read-text-files" target="_blank">tego wpisu</a>), jest wczytywanie linijka po linijce. Przeprowadzone przeze mnie testy również potwierdzają wyniki tego eksperymentu.

**b)** do przechowywanie danych proponuję użyć słownika Dictionary<int, HashSet<int>>. Kluczem będzie IdUżytkownika, a wartością zbiór pisenek. Dlaczego HashSet? Ponieważ, nie interesuje nas ile razy użytkownik odtworzył daną piosenkę, a jedynie czy w ogóle ją odtworzył. HashSet ma jeszcze jedną niewątpliwą zaletę: przy dużej ilości elementów, czas operacji Contains jest stały. Oczywiście wiąże się to z większą zajętością pamięci fizycznej. Moja maszyna ma 16GB RAM, więc w tym przypadku nie mam co się martwić o OutOfMemoryException.

<pre class="brush: csharp; title: ; notranslate" title="">Dictionary&lt;int, HashSet&lt;int&gt;&gt; users = new Dictionary&lt;int, HashSet&lt;int&gt;&gt;();
            using (StreamReader sr = File.OpenText(&quot;facts.csv&quot;))
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
                        users[userId] = new HashSet&lt;int&gt;() { songId };
                    }
                }
            }
</pre>

Wykonanie powyższego kody zajmuje średnio 20 sek.

**2. Obliczenie podobieństwa.**

**a)** znajdziemy wszystkich najbliższych sąsiadów dla 100 pierwszych użytkowników. Wyniki będą trzymane w słowniku Dictionary<int, Dictionary<int, double>>, będzie IdUżytkownika, a wartością słownik IdUżytkownika-Wartość współczynnika Jaccarda.

<pre class="brush: csharp; title: ; notranslate" title="">Dictionary&lt;int, Dictionary&lt;int, double&gt;&gt; similarity = new Dictionary&lt;int, Dictionary&lt;int, double&gt;&gt;();
            foreach(var currentUser in users.Take(100))
            {
                foreach (var user in users)
                {
                    //calculate Jaccard
                }
            }
</pre>

**b)** współczynnik Jaccarda wyznaczymy dzieląc liczebność części wspólnej zbiorów przez liczebność sumy zbiorów.  
Można to zrobić na wiele różnych sposobów np. używając metod Intersect i Union. Warto jednak wykorzystać fakt, że jedne zbiory piosenek są mniejsze od drugich.  
Okazuje się, że najszybszą metodą (przynajmniej z tych, które znam) jest "ręczne" iterowanie po mniejszym zbiorze i sprawdzanie (przy pomocy metody Contains) czy dana piosenka występuje w drugim zbiorze.  
Nie trzeba również wykonywać operacji Union. Wystarczy dodać do siebie liczności zbiorów, a następnie od sumy odjąć część wspólną. Takie proste zabiegi powodują znaczne zwiększenie wydajności.

<pre class="brush: csharp; title: ; notranslate" title="">Dictionary&lt;int, Dictionary&lt;int, double&gt;&gt; similarity = new Dictionary&lt;int, Dictionary&lt;int, double&gt;&gt;();
            foreach(var currentUser in users.Take(100))
            {
                similarity[currentUser.Key] = new Dictionary&lt;int, double&gt;();

                foreach (var user in users)
                {
                    if (user.Key.Equals(currentUser.Key))
                        continue;
                    else
                    {
                        var sameSongs = 0;
                        if (currentUser.Value.Count &lt; user.Value.Count)
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

                        if (sameSongs &gt; 0)
                        {
                            similarity[currentUser.Key][user.Key] = ((double)sameSongs / ((currentUser.Value.Count() + user.Value.Count()) - sameSongs));
                        }
                    }
                }
            }
</pre>

Całość możemy dodatkowo zrównoleglić przy pomocy <a href="http://www.karalus.eu/2016/01/parallel-for-czyli-prosty-sposob-na-z-zrownoleglenie/" target="_blank">Parallel.ForEach</a>.

<pre class="brush: csharp; title: ; notranslate" title="">Dictionary&lt;int, Dictionary&lt;int, double&gt;&gt; similarity = new Dictionary&lt;int, Dictionary&lt;int, double&gt;&gt;();
            Parallel.ForEach(users.Take(100).ToArray(), (currentUser) =&gt;
            {
                lock (sync)
                {
                    similarity[currentUser.Key] = new Dictionary&lt;int, double&gt;(); ;
                }
				
                foreach (var user in users)
                {
                    if (user.Key.Equals(currentUser.Key))
                        continue;
                    else
                    {
                        var sameSongs = 0;
                        
                        if (currentUser.Value.Count &lt; user.Value.Count)
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
						
                        if (sameSongs &gt; 0)
                        {
                            lock (sync)
                            {
                                similarity[currentUser.Key][user.Key] = ((double)sameSongs / ((currentUser.Value.Count() + user.Value.Count()) - sameSongs));
                            }
                        }
                    }
                }
            });
</pre>

Należy pamiętać, że operację na słowniku należy zamknąć w sekcji krytycznej.  
U mnie obliczenia zajmują jakieś 10 sek. (Intel i7-4702MQ) ale to jest tylko dla 100 pierwszych użytkowników. Użytkowników jest ponad milion, co sprawia, że jeśli chciałbym policzyć współczynnik Jaccarda dla wszystkich zajęłoby to ponad 27h.

Warto zauważyć, że każdy użytkownik ma tylko niewielu bliskich sąsiadów (czyli użytkowników o podobnym guście muzycznym). W praktyce, zazwyczaj chodzi nam o krótką listę najbardziej podobnych użytkowników (powiedzmy 100 najbliższych sąsiadów), oznacza to, że większość czasu jest marnowana. Przydałby się mechanizm, który dokona wstępnego odsiania użytkowników niepodobnych. Z pomocą przychodzi tutaj technika zwana <a href="http://www.karalus.eu/2016/03/minhash/" target="_blank">MinHash</a> oraz algorytm <a href="https://en.wikipedia.org/wiki/Locality-sensitive_hashing" target="_blank">LSH</a>. O tym opowiem w moim następnym wpisie.