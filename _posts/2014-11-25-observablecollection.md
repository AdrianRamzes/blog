---
id: 116
title: ObservableCollection
date: 2014-11-25T15:03:24+00:00
author: Adrian Karalus
layout: post
guid: http://www.karalus.eu/Blog/?p=116
permalink: /2014/11/observablecollection/
image: /wp-content/uploads/2014/11/2014-11-25-14_58_37-MainWindow.png
categories:
  - Programowanie
tags:
  - 'c#'
  - mvvm
  - ObservableCollection
  - wpf
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
            List.Add(new Person() { Name = string.Format("Example Name #{0}", List.Count + 1), Age = _rand.Next(0 , 130) });
        }

        private Random _rand = new Random();
</pre>

&nbsp;

Zaostał nam już tylko widok &#8211; View:  
ListBox &#8211; do wyświetlania kolekcji "List":

<pre class="brush: xml; title: ; notranslate" title="">&lt;ListBox ItemsSource="{Binding List}" &gt;
            &lt;ListBox.ItemTemplate&gt;
                &lt;DataTemplate&gt;
                    &lt;Grid Height="30"&gt;
                        &lt;TextBlock Text="{Binding Name}" VerticalAlignment="Top" HorizontalAlignment="Left"/&gt;
                        &lt;TextBlock Text="{Binding Age, StringFormat=Age: {0} }" VerticalAlignment="Bottom" HorizontalAlignment="Right"/&gt;
                    &lt;/Grid&gt;
                &lt;/DataTemplate&gt;
            &lt;/ListBox.ItemTemplate&gt;
        &lt;/ListBox&gt;
</pre>

Oraz przycisk, za pomocą którego wywoływać będziemy komendę "AddNewPersonCommand":

<pre class="brush: xml; title: ; notranslate" title="">&lt;Button Command="{Binding AddNewPersonCommand}" Content="Add New Person" VerticalAlignment="Center" HorizontalAlignment="Center" Padding="5,2"/&gt;
</pre>

I to w zasadzie wszystko, jeśli chodzi o używanie ObservableCollection. Deklaracja kolekcji i powiązanie z nią widoku. Reszta dzieje się "automagicznie" 😉

Cały program jak zawsze dostępny na <a href="https://github.com/RamzesBlog/ObservableCollectionExample" target="_blank">GitHub </a>😉