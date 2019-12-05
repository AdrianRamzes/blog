---
id: 197
title: 'MVVM - PRISM DelegateCommand'
date: 2015-04-08T14:21:11+00:00
author: admin
layout: revision
guid: http://www.karalus.eu/2015/04/89-revision-v1/
permalink: /2015/04/89-revision-v1/
---
Jak już obiecałem, opiszę dzisiaj inną implementację DelegateCommand.  
DelegateCommand jest klasą dostarczaną wraz z pakietem NuGet Prism v5.0

<!--more-->

Działa identycznie jak ta, którą przedstawiałem w moim wcześniejszym <a href="http://www.karalus.eu/Blog/2014/10/c-wpf-mvvm-delegatecommand/" target="_blank">wpisie</a>. Jedyną różnicą jest wykonywanie metody "CanExecute".  
Tutaj to programista jest odpowiedzialny za poinformowanie widoku o możliwości zmiany wartości zwracanej przez CanEecute.

Poprzednio udowadniałem, że CanExecute wykonuje się praktycznie w "losowych" momentach i to całkiem często. Ostrzegałem też, przed wsadzaniem do tej metody ciężkich obliczeń.  
Jeśli jednak z jakiegoś egzotycznego powodu Twoja metoda CanExecute musi wykonywać takie operacje lub jeśli po prostu zależy Ci na całkowitej kontroli swojego kodu. To użyj klasy DelegateCommand z pakietu Prism. Jak to zrobić?

(Projekt przygotowany do pracy we wzorcu MVVM zgodnie z moim wcześniejszym <a href="http://www.karalus.eu/Blog/2014/08/c-wpf-mvvm-nowy-projekt-project-template/" target="_blank">wpisem</a>)

Dodaj do swojego projektu NuGet pakiet Prism (aktualna wersja na 18.10.2014 to 5.0).

[<img class="alignnone wp-image-90 size-full" src="https://i0.wp.com/www.karalus.eu/wp-content/uploads/2014/10/2014-10-15-20_50_09-PrismDelegateCommand-Manage-NuGet-Packages.png?resize=900%2C600" alt="" width="900" height="600" srcset="https://i0.wp.com/www.karalus.eu/wp-content/uploads/2014/10/2014-10-15-20_50_09-PrismDelegateCommand-Manage-NuGet-Packages.png?w=900 900w, https://i0.wp.com/www.karalus.eu/wp-content/uploads/2014/10/2014-10-15-20_50_09-PrismDelegateCommand-Manage-NuGet-Packages.png?resize=300%2C200 300w" sizes="(max-width: 900px) 100vw, 900px" data-recalc-dims="1" />](https://i0.wp.com/www.karalus.eu/wp-content/uploads/2014/10/2014-10-15-20_50_09-PrismDelegateCommand-Manage-NuGet-Packages.png)

 

Referencje dodają się automatycznie. Jedyne co teraz musisz zrobić to zacząć używać dobrodziejstw Prism'a 😉

We ViewModelu deklarujemy komendtę dwie właściwość w celu zapewnienia interakcji z użytkownikiem:

Deklaracja komendy:

<pre class="brush: csharp; title: ; notranslate" title="">public DelegateCommand ClickCommand { get; private set; }
</pre>

Oraz jej inicjalizacja w konstruktorze:

<pre class="brush: csharp; title: ; notranslate" title="">public MainWindowViewModel()
        {
            ClickCommand = new DelegateCommand(Click, CanExecuteClick);
        }
</pre>

Message - do wyświetlania komunikatów:

<pre class="brush: csharp; title: ; notranslate" title="">private string _message;
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
                    RaisePropertyChanged(() =&gt; Message);
                }
            }
        }
</pre>

Input - wartość wprowadzana przez użytkownika:

<pre class="brush: csharp; title: ; notranslate" title="">private string _input;
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
                    RaisePropertyChanged(() =&gt; Input);
                    ClickCommand.RaiseCanExecuteChanged();
                }
            }
        }
</pre>

Bardzo ważna jest turaj linijka:

<pre class="brush: csharp; title: ; notranslate" title="">ClickCommand.RaiseCanExecuteChanged();
</pre>

W tym miejscu wykonana zostanie metoda CanExecute zdefiniowana dla ClickCommand. Jest to dokładnie taka informacja:  
"Oj! Wartość zwracana przez CanExecute mogła ulec zmianie. Proszę to sprawdzić."

Odpowiednio metody Execute i CanExecute:

<pre class="brush: csharp; title: ; notranslate" title="">private int _count = 0;
        private void Click()
        {
            _count++;
            Message = string.Format(&quot;Click #{0}&quot;, _count);
        }

        private bool CanExecuteClick()
        {
            Debug.WriteLine(&quot;called CanExecuteClick: {0}; Input value: {1}&quot;, DateTime.Now, Input);

            return string.IsNullOrEmpty(Input) || (Input.Length % 2) == 0;
        }
</pre>

Metoda CanExecuteClick() zwraca true jeśli wartość wpisana przez użytkownika ma parzystą ilość znaków (mało przydatne ale obrazujące o co chodzi).

Po stronie widoku:

<pre class="brush: xml; title: ; notranslate" title="">&lt;Grid DataContext=&quot;{StaticResource MainViewModel}&quot;&gt;
        &lt;Label Content=&quot;Input:&quot;/&gt;
        &lt;TextBox Text=&quot;{Binding Input, UpdateSourceTrigger=PropertyChanged}&quot; Margin=&quot;40,5,0,0&quot; Width=&quot;120&quot; VerticalAlignment=&quot;Top&quot; HorizontalAlignment=&quot;Left&quot;/&gt;
        &lt;TextBlock Text=&quot;{Binding Message}&quot; VerticalAlignment=&quot;Top&quot; HorizontalAlignment=&quot;Center&quot;/&gt;
        &lt;Button Command=&quot;{Binding ClickCommand}&quot; VerticalAlignment=&quot;Center&quot; HorizontalAlignment=&quot;Center&quot; Content=&quot;Click!&quot;/&gt;
    &lt;/Grid&gt;
</pre>

Podsumowując. Prism dostarcza nam już gotowej implementacji klasy DelegateCommand. W tej implementacji metoda CanExecute jest wykonywana tylko na żądanie programisty oraz bezpośrednio przed metodą Execute.

[<img class="alignnone wp-image-92 size-full" src="https://i1.wp.com/www.karalus.eu/wp-content/uploads/2014/10/2014-10-16-19_09_28-PrismDelegateCommand-Running-Microsoft-Visual-Studio.png?resize=701%2C315" alt="" width="701" height="315" srcset="https://i1.wp.com/www.karalus.eu/wp-content/uploads/2014/10/2014-10-16-19_09_28-PrismDelegateCommand-Running-Microsoft-Visual-Studio.png?w=701 701w, https://i1.wp.com/www.karalus.eu/wp-content/uploads/2014/10/2014-10-16-19_09_28-PrismDelegateCommand-Running-Microsoft-Visual-Studio.png?resize=300%2C134 300w" sizes="(max-width: 701px) 100vw, 701px" data-recalc-dims="1" />](https://i1.wp.com/www.karalus.eu/wp-content/uploads/2014/10/2014-10-16-19_09_28-PrismDelegateCommand-Running-Microsoft-Visual-Studio.png)(Jak widać: CanExecute jest wykonywane tylko gdy zmienia się wartość wprowadzana przez użytkownika)

Powoduje to większą kontrole nad kodem oraz zwiększa wydajność (jeśli CanExecute jest zasobożerne). Łatwo natomiast może dojść do sytuacji, w której aktywność przycisku nie będzie odzwierciedlać faktycznej wartości zwracanej przez CanExecute, ponieważ programista zapomni (o co nie łatwo) jawnie wywołać RaiseCanExecuteChanged.

 

**Cały kod jest jak zawsze dostępny na <a href="https://github.com/RamzesBlog/PrismDelegateCommand" target="_blank">GitHub</a>. 😉**

 

 