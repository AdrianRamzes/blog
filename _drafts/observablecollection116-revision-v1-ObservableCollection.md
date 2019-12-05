---
id: 120
title: ObservableCollection
date: 2014-11-27T14:52:27+00:00
author: Adrian Karalus
layout: revision
guid: http://www.karalus.eu/Blog/2014/11/116-revision-v1/
permalink: /2014/11/116-revision-v1/
---
Dziś opiszę czym jest klasa ObservableCollection oraz jak jej używać.  
<!--more-->

  
ObservableCollection<T> to klasa dziedzicząca po klasie Collection<T>. Co najważniejsze implementuje ona interfejs:

INotifyPropertyChanged i INotifyCollectionChanged. Każda zmiana w kolekcji powoduje podniesienie odpowiedniego eventu, dzięki czemu idealnie nadaje się ona do współpracy z widokiem, który nasłuchuje na zdarzenia zmiany.

Praca z ObservableCollection jest banalna.  
Oto przykładowy program z użyciem klasy ObservableCollection  oraz kontrolki ListBox:  
Po pierwsze dodajmy sobie klasę do folderu Models, musimy przecież mieć co wyświetlać 😉  
Niech to będzie prosta klasa "Person":

<pre class="brush: csharp; title: ; notranslate" title="">public class Person
    {
        public string Name { get; set; }
        public int Age { get; set; }
    }
</pre>

Do ViewModel&#8217;u dodajemy properties "List", będzie to kolekcja obiektów "Person", którą wyświetlimy w ListBox&#8217;ie:

<pre class="brush: csharp; title: ; notranslate" title="">public ObservableCollection&lt;Person&gt; List { get; set; }
</pre>

Przydałby się jeszcze jakiś mechanizm dokonywania zmian w kolekcji, a w szczególności dodawania do niej nowych elementów, tak więc dodajemy komendę wraz z implementacją metody "Execue":

<pre class="brush: csharp; title: ; notranslate" title="">public DelegateCommand AddNewPersonCommand { get; set; }

        private void AddNewPersonExecute()
        {
            List.Add(new Person() { Name = string.Format(&quot;Example Name #{0}&quot;, List.Count + 1), Age = _rand.Next(0 , 130) });
        }

        private Random _rand = new Random();
</pre>

 

Zaostał nam już tylko widok - View:  
ListBox - do wyświetlania kolekcji "List":

<pre class="brush: xml; title: ; notranslate" title="">&lt;ListBox ItemsSource=&quot;{Binding List}&quot; &gt;
            &lt;ListBox.ItemTemplate&gt;
                &lt;DataTemplate&gt;
                    &lt;Grid Height=&quot;30&quot;&gt;
                        &lt;TextBlock Text=&quot;{Binding Name}&quot; VerticalAlignment=&quot;Top&quot; HorizontalAlignment=&quot;Left&quot;/&gt;
                        &lt;TextBlock Text=&quot;{Binding Age, StringFormat=Age: {0} }&quot; VerticalAlignment=&quot;Bottom&quot; HorizontalAlignment=&quot;Right&quot;/&gt;
                    &lt;/Grid&gt;
                &lt;/DataTemplate&gt;
            &lt;/ListBox.ItemTemplate&gt;
        &lt;/ListBox&gt;
</pre>

Oraz przycisk, za pomocą którego wywoływać będziemy komendę "AddNewPersonCommand":

<pre class="brush: xml; title: ; notranslate" title="">&lt;Button Command=&quot;{Binding AddNewPersonCommand}&quot; Content=&quot;Add New Person&quot; VerticalAlignment=&quot;Center&quot; HorizontalAlignment=&quot;Center&quot; Padding=&quot;5,2&quot;/&gt;
</pre>

I to w zasadzie wszystko, jeśli chodzi o używanie ObservableCollection. Deklaracja kolekcji i powiązanie z nią widoku. Reszta dzieje się "automagicznie" 😉

Cały program jak zawsze dostępny na <a href="https://github.com/RamzesBlog/ObservableCollectionExample" target="_blank">GitHub </a>😉