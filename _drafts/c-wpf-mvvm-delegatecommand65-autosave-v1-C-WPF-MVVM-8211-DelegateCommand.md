---
id: 200
title: 'C# WPF MVVM - DelegateCommand'
date: 2015-04-08T14:22:04+00:00
author: admin
layout: revision
guid: http://www.karalus.eu/2015/04/65-autosave-v1/
permalink: /2015/04/65-autosave-v1/
---
Pragnę zaprezentować wam prosty przykład użycia komend.  
Commanding to po prostu mechanizm umożliwiający powiązanie akcji interfejsu z konkretnymi działaniami, zaimplementowanymi we ViewModel&#8217;u. Dzięki temu, możliwe jest oddzielenie warstwy widoku od logiki biznesowej.

Na początek warto przyjrzeć się interfejsowi ICommand.<!--more-->

Jest on bardzo prosty i składa się jedynie z trzech elementów:  
<span style="line-height: 1.7em;">- Execute - metoda wykonywana podczas wywołania komendy,<br /> </span>- CanExecute - metoda sprawdzająca, czy można wykonać metodę Execute  
- CanExecuteChange - event podnoszony, gdy zmienia się wartość zwracana przez CanExecute

DelegateCommand to klasa implementująca interfejs ICommand, która ułatwia nam pracę z komendami i poprawia wygląd kodu.

Implementacja klasy DelegateCommand, którą używam najczęściej w swoich projektach, zapożyczyłem z <a href="http://visualstudiogallery.msdn.microsoft.com/970005b8-ee15-4295-9960-375e6ea1276c" target="_blank">tego szablonu</a> i znajdziecie ją w moim wcześniejszym <a href="http://www.karalus.eu/Blog/2014/08/c-wpf-mvvm-nowy-projekt-project-template/" target="_blank">wpisie</a>. (Jest jeszcze RelayCommand z <a href="https://mvvmlight.codeplex.com/" target="_blank">MVVM Light</a> i DelegateCommand z <a href="http://www.nuget.org/packages/Prism.Mvvm" target="_blank">Prism.MVVM</a> )

Przejdźmy do konkretów. (Szablon projektu MVVM, na którym bazuje, opisałem <a href="http://www.karalus.eu/Blog/2014/08/c-wpf-mvvm-nowy-projekt-project-template/" target="_blank">wcześniej</a>)  
Niech nasz program ma jeden przycisk, jeden checkBox i pole, w którym wyświetlać będziemy komunikaty.  
Przycisk będzie powodował wyświetlenie jakiejś wiadomości w TextBlock&#8217;u, a dostępność przycisku będzie zależna od tego czy CheckBox jest zaznaczony czy nie.

We ViewModel&#8217;u definiujemy właściwość, w której będziemy trzymać wartość wiadomości wyświetlanej użytkownikowi.

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

I powiązany element we View:

<pre class="brush: xml; title: ; notranslate" title="">&lt;TextBlock Text=&quot;{Binding Message}&quot; VerticalAlignment=&quot;Top&quot; HorizontalAlignment=&quot;Center&quot;/&gt;
</pre>

Zaimplementujmy metodę, która będzie wykonywana po wciśnięciu przycisku.

<pre class="brush: csharp; title: ; notranslate" title="">private int _count = 0;
        private void Click()
        {
            _count++;
            Message = string.Format(&quot;Click #{0}&quot;, _count);
        }
</pre>

Aby nasz komunikat nie wyglądał cały czas tak samo, dodałem zmienną pomocniczą _count.

Do tej pory wszystko jasne, ale jak powiązać naszą metodę "Click" z widokiem?  
Za pomocą DelegateCommand!

<pre class="brush: csharp; title: ; notranslate" title="">private ICommand _clickCommand;
        public ICommand ClickCommand
        {
            get
            {
                return _clickCommand;
            }

            private set { }
        }
</pre>

Definiujemy właściwość typu ICommand i tworzymy jej instancję ją w konstruktorze:

<pre class="brush: csharp; title: ; notranslate" title="">public MainWindowViewModel()
        {
            _clickCommand = new DelegateCommand(Click);
        }
</pre>

Jak widać, do zmiennej przypisaliśmy obiekt DelegateCommand, którego konstruktor przyjmuje jako parametr funkcję typu void. Metoda ta jest wykonywana gdy na właściwości ClickCommand wywołana zostanie metoda Execute.

Teraz w widoku wystarczy zdefiniować przycisk w następujący sposób:

<pre class="brush: xml; title: ; notranslate" title="">&lt;Button Command=&quot;{Binding ClickCommand}&quot; Content=&quot;Click!&quot;/&gt;
</pre>

Po kliknięciu przycisku, wykona się metoda "Click".

DelegateCommand, może przyjmować jeszcze jeden parametr i jest nim funkcja zwracająca wartość bool.  
Chodzi o metodę CanExecute, która jest wykonywana za każdym razem gdy zaszły jakieś zmiany w interfejsie (nie we wszystkich implementacjach) i tuż przed wykonaniem metody Execute. Domyślnie, jeśli nie podamy drugiego parametru, CanExecute zawsze będzie zwracał wartość true.

Dodajmy jeszcze jedną właściwość do ViewModel&#8217;u. Po to, aby użytkownik mógł decydować czy przycisk ma być dostępny czy nie.

<pre class="brush: csharp; title: ; notranslate" title="">private bool _isClickButtonEnable;
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
                    RaisePropertyChanged(() =&gt; IsClickButtonEnable);
                }
            }
        }
</pre>

Kontrolka powiązana z IsClickButtonEnable:

<pre class="brush: xml; title: ; notranslate" title="">&lt;CheckBox Content=&quot;Enable&quot; IsChecked=&quot;{Binding IsClickButtonEnable}&quot; VerticalAlignment=&quot;Top&quot; HorizontalAlignment=&quot;Left&quot;/&gt;
</pre>

Do konstruktora dodamy linijkę:

<pre class="brush: csharp; title: ; notranslate" title="">public MainWindowViewModel()
        {
            _clickCommand = new DelegateCommand(Click);
            _isClickButtonEnable = true;
        }
</pre>

Teraz dodamy naszą własną metodę CanExecute:

<pre class="brush: csharp; title: ; notranslate" title="">private bool CanExecuteClick()
        {
            Debug.WriteLine(&quot;called CanExecuteClick: {0}&quot;, DateTime.Now);

            return IsClickButtonEnable;
        }
</pre>

Pozostało jeszcze dodać ją do parametrów konstruktora DelegateCommand:

<pre class="brush: csharp; title: ; notranslate" title="">_clickCommand = new DelegateCommand(Click, CanExecuteClick);
</pre>

To już chyba wszystko. Po uruchomieniu powinnyśmy zobaczyć coś takiego:

[<img class="alignnone wp-image-67 size-full" src="https://i0.wp.com/www.karalus.eu/wp-content/uploads/2014/10/DelegateCommand_1.png?resize=1056%2C350" alt="" width="1056" height="350" srcset="https://i0.wp.com/www.karalus.eu/wp-content/uploads/2014/10/DelegateCommand_1.png?w=1056 1056w, https://i0.wp.com/www.karalus.eu/wp-content/uploads/2014/10/DelegateCommand_1.png?resize=300%2C99 300w, https://i0.wp.com/www.karalus.eu/wp-content/uploads/2014/10/DelegateCommand_1.png?resize=1024%2C339 1024w" sizes="(max-width: 1000px) 100vw, 1000px" data-recalc-dims="1" />](https://i0.wp.com/www.karalus.eu/wp-content/uploads/2014/10/DelegateCommand_1.png)

(Przycisk aktywny po prawej i nieaktywny po lewej)

Oczywiście to czy przycisk jest aktywny czy nie, można powiązać z CheckBox&#8217;em tylko na poziomie widoku i używając do tego jedynie XAML&#8217;a.  
Jednak o powiązaniach między kontrolkami opowiem <a href="http://www.karalus.eu/Blog/2014/10/c-wpf-mvvm-binding-to-element/" target="_blank">innym razem</a>.

Warto jeszcze wspomnieć o tym, kiedy tak naprawdę wywoływane jest CanExecute.  
Nie bez powodu w metodzie "CanExecuteClick()" dodałem linijkę logującą.

[<img class="aligncenter wp-image-72 size-full" src="https://i0.wp.com/www.karalus.eu/Blog/wp-content/uploads/2014/10/DelegateCommand_2.png?resize=556%2C287" alt="" width="556" height="287" srcset="https://i0.wp.com/www.karalus.eu/wp-content/uploads/2014/10/DelegateCommand_2.png?w=556 556w, https://i0.wp.com/www.karalus.eu/wp-content/uploads/2014/10/DelegateCommand_2.png?resize=300%2C154 300w" sizes="(max-width: 556px) 100vw, 556px" data-recalc-dims="1" />](https://i0.wp.com/www.karalus.eu/Blog/wp-content/uploads/2014/10/DelegateCommand_2.png)

 

Jest ona wykonywana przy **każdej** drobnej interakcji widoku z użytkownikiem. Najlepiej założyć, że jest po prostu wykonywana bardzo często i w losowych momentach. Nie należy zatem wkładać tam potężnej logiki. O tym jak zwiększyć kontrolę nad wzywaniem metody CanExecute opowiem przy okazji kolejnych wpisów.

 

**Całość, jak zawsze, dostępna na <a href="https://github.com/RamzesBlog/DelegateCommandExample" target="_blank">GitHub </a>😉**