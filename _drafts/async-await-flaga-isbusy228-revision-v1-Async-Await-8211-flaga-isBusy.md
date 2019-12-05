---
id: 231
title: 'Async Await &#8211; flaga isBusy'
date: 2015-04-15T12:43:26+00:00
author: admin
layout: revision
guid: http://www.karalus.eu/2015/04/228-revision-v1/
permalink: /2015/04/228-revision-v1/
---
Załóżmy, że nasze asynchroniczne zadanie odpalane jest na jakiś event, np. kliknięcie przycisku.  
<!--more-->

  
Co jeśli zadanie jest dość wyczerpujące, a na dodatek nie powinno być wywoływane więcej niż raz w krótkim czasie? (przez zniecierpliwionego użytkownika, który klika po kilka razy w ten sam przycisk bo myśli, że to pomoże).

W takim przypadku powinniśmy przede wszystkim, poinformować użytkownika, że trwają obliczenia (jakaś grafika &#8211; busy indicator) oraz zablokować przycisk, tak aby nie można było już w niego kliknąć.

Super. Pewnie to wystarczy. A co jeśli zdarzeniem nie jest kliknięcie przycisku tylko cokolwiek innego, być może nie związanego z interfejsem użytkownika.  
Generalnie, przyda się flaga, która będzie stawiana gdy obliczenia się wykonują &#8211; odpowiednik IsBusy w klasie BackgroundWorker.

Rozwiązanie jest banalne.

<pre class="brush: csharp; title: ; notranslate" title="">private bool isBusy = false;
        private async void sthAsync(object sender, EventArgs e)
        {
            if (!isBusy)
            {
                isBusy = true;
                await someTaskAsync();
                isBusy = false;
            }
        }

        private Task someTaskAsync()
        {
            return Task.Run(() =&gt;
            {
                Thread.Sleep(2 * 1000);// 1000ms = 1s
            });
        }
</pre>

To czy metoda asynchroniczna będzie wywołana uzależniamy od wartości flagi isBusy.  
Przed i po wywołaniu metody asynchronicznej ze słówkiem await, zmieniamy wartość flagi isBusy.

To tyle. Tym razem kodu nie umieszczam na GITHUB, ponieważ cały potrzebny kod jest w tym wpisie 😉