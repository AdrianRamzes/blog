---
id: 65
title: 'C# WPF MVVM - DelegateCommand'
date: 2014-10-02T21:42:38+00:00
author: Adrian Karalus
layout: post
guid: http://www.karalus.eu/Blog/?p=65
permalink: /2014/10/c-wpf-mvvm-delegatecommand/
image: /wp-content/uploads/2014/10/DelegateCommand_2.png
categories:
  - Programowanie
tags:
  - '#MVVM #wpf #DelegateCommand #ICommand'
---
Pragnę zaprezentować wam prosty przykład użycia komend.  
Commanding to po prostu mechanizm umożliwiający powiązanie akcji interfejsu z konkretnymi działaniami, zaimplementowanymi we ViewModel'u. Dzięki temu, możliwe jest oddzielenie warstwy widoku od logiki biznesowej.

Na początek warto przyjrzeć się interfejsowi ICommand.<!--more-->

Jest on bardzo prosty i składa się jedynie z trzech elementów:  
<span style="line-height: 1.7em;">- Execute - metoda wykonywana podczas wywołania komendy,<br /> </span>- CanExecute - metoda sprawdzająca, czy można wykonać metodę Execute  
- CanExecuteChange - event podnoszony, gdy zmienia się wartość zwracana przez CanExecute

DelegateCommand to klasa implementująca interfejs ICommand, która ułatwia nam pracę z komendami i poprawia wygląd kodu.

Implementacja klasy DelegateCommand, którą używam najczęściej w swoich projektach, zapożyczyłem z <a href="http://visualstudiogallery.msdn.microsoft.com/970005b8-ee15-4295-9960-375e6ea1276c" target="_blank">tego szablonu</a> i znajdziecie ją w moim wcześniejszym <a href="/2014/08/c-wpf-mvvm-nowy-projekt-project-template/" target="_blank">wpisie</a>. (Jest jeszcze RelayCommand z <a href="https://mvvmlight.codeplex.com/" target="_blank">MVVM Light</a> i DelegateCommand z <a href="http://www.nuget.org/packages/Prism.Mvvm" target="_blank">Prism.MVVM</a> )

Przejdźmy do konkretów. (Szablon projektu MVVM, na którym bazuje, opisałem <a href="/2014/08/c-wpf-mvvm-nowy-projekt-project-template/" target="_blank">wcześniej</a>)  
Niech nasz program ma jeden przycisk, jeden checkBox i pole, w którym wyświetlać będziemy komunikaty.  
Przycisk będzie powodował wyświetlenie jakiejś wiadomości w TextBlock'u, a dostępność przycisku będzie zależna od tego czy CheckBox jest zaznaczony czy nie.

We ViewModel'u definiujemy właściwość, w której będziemy trzymać wartość wiadomości wyświetlanej użytkownikowi.

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

I powiązany element we View:

```xml
<TextBlock Text="{Binding Message}" VerticalAlignment="Top" HorizontalAlignment="Center"/>
```

Zaimplementujmy metodę, która będzie wykonywana po wciśnięciu przycisku.

```csharp
private int _count = 0;
        private void Click()
        {
            _count++;
            Message = string.Format("Click #{0}", _count);
        }
```

Aby nasz komunikat nie wyglądał cały czas tak samo, dodałem zmienną pomocniczą _count.

Do tej pory wszystko jasne, ale jak powiązać naszą metodę "Click" z widokiem?  
Za pomocą DelegateCommand!

```csharp
private ICommand _clickCommand;
        public ICommand ClickCommand
        {
            get
            {
                return _clickCommand;
            }

            private set { }
        }
```

Definiujemy właściwość typu ICommand i tworzymy jej instancję ją w konstruktorze:

```csharp
public MainWindowViewModel()
        {
            _clickCommand = new DelegateCommand(Click);
        }
```

Jak widać, do zmiennej przypisaliśmy obiekt DelegateCommand, którego konstruktor przyjmuje jako parametr funkcję typu void. Metoda ta jest wykonywana gdy na właściwości ClickCommand wywołana zostanie metoda Execute.

Teraz w widoku wystarczy zdefiniować przycisk w następujący sposób:

```xml
<Button Command="{Binding ClickCommand}" Content="Click!"/>
```

Po kliknięciu przycisku, wykona się metoda "Click".

DelegateCommand, może przyjmować jeszcze jeden parametr i jest nim funkcja zwracająca wartość bool.  
Chodzi o metodę CanExecute, która jest wykonywana za każdym razem gdy zaszły jakieś zmiany w interfejsie (nie we wszystkich implementacjach) i tuż przed wykonaniem metody Execute. Domyślnie, jeśli nie podamy drugiego parametru, CanExecute zawsze będzie zwracał wartość true.

Dodajmy jeszcze jedną właściwość do ViewModel'u. Po to, aby użytkownik mógł decydować czy przycisk ma być dostępny czy nie.

```csharp
private bool _isClickButtonEnable;
        public bool IsClickButtonEnable
        {
            get
            {
                return _isClickButtonEnable;
            }
            set
            {
                if(_isClickButtonEnable != value)
                {
                    _isClickButtonEnable = value;
                    RaisePropertyChanged(() => IsClickButtonEnable);
                }
            }
        }
```

Kontrolka powiązana z IsClickButtonEnable:

```xml
<CheckBox Content="Enable" IsChecked="{Binding IsClickButtonEnable}" VerticalAlignment="Top" HorizontalAlignment="Left"/>
```

Do konstruktora dodamy linijkę:

```csharp
public MainWindowViewModel()
        {
            _clickCommand = new DelegateCommand(Click);
            _isClickButtonEnable = true;
        }
```

Teraz dodamy naszą własną metodę CanExecute:

```csharp
private bool CanExecuteClick()
        {
            Debug.WriteLine("called CanExecuteClick: {0}", DateTime.Now);

            return IsClickButtonEnable;
        }
```

Pozostało jeszcze dodać ją do parametrów konstruktora DelegateCommand:

```csharp
_clickCommand = new DelegateCommand(Click, CanExecuteClick);
```

To już chyba wszystko. Po uruchomieniu powinnyśmy zobaczyć coś takiego:

[<img class="alignnone wp-image-67 size-full" src="/wp-content/uploads/2014/10/DelegateCommand_1.png?resize=1056%2C350" alt="" width="1056" height="350" srcset="/wp-content/uploads/2014/10/DelegateCommand_1.png?w=1056 1056w, /wp-content/uploads/2014/10/DelegateCommand_1.png?resize=300%2C99 300w, /wp-content/uploads/2014/10/DelegateCommand_1.png?resize=1024%2C339 1024w" sizes="(max-width: 1000px) 100vw, 1000px" data-recalc-dims="1" />](/wp-content/uploads/2014/10/DelegateCommand_1.png)

(Przycisk aktywny po prawej i nieaktywny po lewej)

Oczywiście to czy przycisk jest aktywny czy nie, można powiązać z CheckBox'em tylko na poziomie widoku i używając do tego jedynie XAML'a.  
Jednak o powiązaniach między kontrolkami opowiem <a href="/2014/10/c-wpf-mvvm-binding-to-element/" target="_blank">innym razem</a>.

Warto jeszcze wspomnieć o tym, kiedy tak naprawdę wywoływane jest CanExecute.  
Nie bez powodu w metodzie "CanExecuteClick()" dodałem linijkę logującą.

[<img class="aligncenter wp-image-72 size-full" src="/wp-content/uploads/2014/10/DelegateCommand_2.png?resize=556%2C287" alt="" width="556" height="287" srcset="/wp-content/uploads/2014/10/DelegateCommand_2.png?w=556 556w, /wp-content/uploads/2014/10/DelegateCommand_2.png?resize=300%2C154 300w" sizes="(max-width: 556px) 100vw, 556px" data-recalc-dims="1" />](/wp-content/uploads/2014/10/DelegateCommand_2.png)

 

Jest ona wykonywana przy **każdej** drobnej interakcji widoku z użytkownikiem. Najlepiej założyć, że jest po prostu wykonywana bardzo często i w losowych momentach. Nie należy zatem wkładać tam potężnej logiki. O tym jak zwiększyć kontrolę nad wzywaniem metody CanExecute opowiem przy okazji kolejnych wpisów.

 

**Całość, jak zawsze, dostępna na <a href="https://github.com/AdrianRamzes/DelegateCommandExample" target="_blank">GitHub </a>😉**