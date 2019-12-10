---
title: 'MVVM - PRISM DelegateCommand'
date: 2014-10-16T19:22:26+00:00
author: Adrian Karalus
layout: post
permalink: /2014/10/prism-delegatecommand/
image: /blog/wp-content/uploads/2014/10/2014-10-16-19_09_28-PrismDelegateCommand-Running-Microsoft-Visual-Studio.png
categories:
  - Programowanie
---
Jak już obiecałem, opiszę dzisiaj inną implementację DelegateCommand.  
DelegateCommand jest klasą dostarczaną wraz z pakietem NuGet Prism v5.0

Działa identycznie jak ta, którą przedstawiałem w moim wcześniejszym [wpisie](/blog/2014/10/c-wpf-mvvm-delegatecommand/). Jedyną różnicą jest wykonywanie metody **CanExecute**.  
Tutaj to programista jest odpowiedzialny za poinformowanie widoku o możliwości zmiany wartości zwracanej przez CanEecute.

Poprzednio udowadniałem, że CanExecute wykonuje się praktycznie w *losowych* momentach i to całkiem często. Ostrzegałem też, przed wsadzaniem do tej metody ciężkich obliczeń.  
Jeśli jednak z jakiegoś egzotycznego powodu Twoja metoda CanExecute musi wykonywać takie operacje lub jeśli po prostu zależy Ci na całkowitej kontroli swojego kodu. To użyj klasy DelegateCommand z pakietu Prism. Jak to zrobić?

(Projekt przygotowany do pracy we wzorcu MVVM zgodnie z moim wcześniejszym [wpisem](/blog/2014/08/c-wpf-mvvm-nowy-projekt-project-template/))

Dodaj do swojego projektu NuGet pakiet Prism (aktualna wersja na 18.10.2014 to 5.0).

![](/blog/wp-content/uploads/2014/10/2014-10-15-20_50_09-PrismDelegateCommand-Manage-NuGet-Packages.png)

 

Referencje dodają się automatycznie. Jedyne co teraz musisz zrobić to zacząć używać dobrodziejstw Prism'a 😉

We ViewModelu deklarujemy komendtę dwie właściwość w celu zapewnienia interakcji z użytkownikiem:

Deklaracja komendy:

```csharp
public DelegateCommand ClickCommand { get; private set; }
```

Oraz jej inicjalizacja w konstruktorze:

```csharp
public MainWindowViewModel()
{
    ClickCommand = new DelegateCommand(Click, CanExecuteClick);
}
```

Message - do wyświetlania komunikatów:

```csharp
private string _message;
public string Message
{
    get
    {
        return _message;
    }
    set
    {
        if(_message != value)
        {
            _message = value;
            RaisePropertyChanged(() => Message);
        }
    }
}
```

Input - wartość wprowadzana przez użytkownika:

```csharp
private string _input;
public string Input
{
    get
    {
        return _input;
    }

    set
    {
        if(value != _input)
        {
            _input = value;
            RaisePropertyChanged(() => Input);
            ClickCommand.RaiseCanExecuteChanged();
        }
    }
}
```

Bardzo ważna jest turaj linijka:

```csharp
ClickCommand.RaiseCanExecuteChanged();
```

W tym miejscu wykonana zostanie metoda CanExecute zdefiniowana dla ClickCommand. Jest to dokładnie taka informacja:  
"Oj! Wartość zwracana przez CanExecute mogła ulec zmianie. Proszę to sprawdzić."

Odpowiednio metody Execute i CanExecute:

```csharp
private int _count = 0;
private void Click()
{
    _count++;
    Message = string.Format("Click #{0}", _count);
}

private bool CanExecuteClick()
{
    Debug.WriteLine("called CanExecuteClick: {0}; Input value: {1}", DateTime.Now, Input);

    return string.IsNullOrEmpty(Input) || (Input.Length % 2) == 0;
}
```

Metoda CanExecuteClick() zwraca true jeśli wartość wpisana przez użytkownika ma parzystą ilość znaków (mało przydatne ale obrazujące o co chodzi).

Po stronie widoku:

```xml
<Grid DataContext="{StaticResource MainViewModel}">
    <Label Content="Input:"/>
    <TextBox Text="{Binding Input, UpdateSourceTrigger=PropertyChanged}" Margin="40,5,0,0" Width="120" VerticalAlignment="Top" HorizontalAlignment="Left"/>
    <TextBlock Text="{Binding Message}" VerticalAlignment="Top" HorizontalAlignment="Center"/>
    <Button Command="{Binding ClickCommand}" VerticalAlignment="Center" HorizontalAlignment="Center" Content="Click!"/>
</Grid>
```

Podsumowując. Prism dostarcza nam już gotowej implementacji klasy DelegateCommand. W tej implementacji metoda CanExecute jest wykonywana tylko na żądanie programisty oraz bezpośrednio przed metodą Execute.

![](/blog/wp-content/uploads/2014/10/2014-10-16-19_09_28-PrismDelegateCommand-Running-Microsoft-Visual-Studio.png)(Jak widać: CanExecute jest wykonywane tylko gdy zmienia się wartość wprowadzana przez użytkownika)

Powoduje to większą kontrole nad kodem oraz zwiększa wydajność (jeśli CanExecute jest zasobożerne). Łatwo natomiast może dojść do sytuacji, w której aktywność przycisku nie będzie odzwierciedlać faktycznej wartości zwracanej przez CanExecute, ponieważ programista zapomni (o co nie łatwo) jawnie wywołać RaiseCanExecuteChanged.

 

**Cały kod jest jak zawsze dostępny na [GitHub](https://github.com/AdrianRamzes/PrismDelegateCommand). 😉**

 

 