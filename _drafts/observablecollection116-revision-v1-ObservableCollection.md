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

```csharp
public class Person
    {
        public string Name { get; set; }
        public int Age { get; set; }
    }
```

Do ViewModel'u dodajemy properties "List", będzie to kolekcja obiektów "Person", którą wyświetlimy w ListBox'ie:

```csharp
public ObservableCollection<Person> List { get; set; }
```

Przydałby się jeszcze jakiś mechanizm dokonywania zmian w kolekcji, a w szczególności dodawania do niej nowych elementów, tak więc dodajemy komendę wraz z implementacją metody "Execue":

```csharp
public DelegateCommand AddNewPersonCommand { get; set; }

        private void AddNewPersonExecute()
        {
            List.Add(new Person() { Name = string.Format("Example Name #{0}", List.Count + 1), Age = _rand.Next(0 , 130) });
        }

        private Random _rand = new Random();
```

 

Zaostał nam już tylko widok - View:  
ListBox - do wyświetlania kolekcji "List":

```xml
<ListBox ItemsSource="{Binding List}" >
            <ListBox.ItemTemplate>
                <DataTemplate>
                    <Grid Height="30">
                        <TextBlock Text="{Binding Name}" VerticalAlignment="Top" HorizontalAlignment="Left"/>
                        <TextBlock Text="{Binding Age, StringFormat=Age: {0} }" VerticalAlignment="Bottom" HorizontalAlignment="Right"/>
                    </Grid>
                </DataTemplate>
            </ListBox.ItemTemplate>
        </ListBox>
```

Oraz przycisk, za pomocą którego wywoływać będziemy komendę "AddNewPersonCommand":

```xml
<Button Command="{Binding AddNewPersonCommand}" Content="Add New Person" VerticalAlignment="Center" HorizontalAlignment="Center" Padding="5,2"/>
```

I to w zasadzie wszystko, jeśli chodzi o używanie ObservableCollection. Deklaracja kolekcji i powiązanie z nią widoku. Reszta dzieje się "automagicznie" 😉

Cały program jak zawsze dostępny na <a href="https://github.com/RamzesBlog/ObservableCollectionExample" target="_blank">GitHub </a>😉