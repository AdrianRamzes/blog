---
id: 203
title: 'C# WPF MVVM - NotificationObject i Services'
date: 2015-04-08T14:22:34+00:00
author: admin
layout: revision
guid: http://www.karalus.eu/2015/04/43-revision-v1/
permalink: /2015/04/43-revision-v1/
---
Service to nic innego jak klasa, która ma wykonywać pewne operacje na rzecz aplikacji. Jej instancja jest trzymana po stronie ViewModel'u i jest na jego usługach. Obliczenia, operacje wykonywane na obiektach modelu, plikach, obsługa połączeń z internetem lub innymi aplikacjami (nawet na tym samym komputerze), to wszystko powinno być realizowane przez serwisy.

Z racji tego, że jestem zwolennikiem nauki przez praktykę, zaprezentuje bardzo proste i intuicyjne zastosowanie serwisów.  
<!--more-->

Po pierwsze, tworzymy nowy projekt o strukturze takiej jaką opisywałem w moim wcześniejszym <a href="http://www.karalus.eu/Blog/2014/08/c-wpf-mvvm-nowy-projekt-project-template/" target="_blank">wpisie</a>.

Gdy mamy już odtworzoną strukturę projektu oraz dodaną klasę pomocniczą NotificationObject, możemy przystąpić do tworzenia "servisu".

Dodajemy nową klasę do katalogu "Services":

```csharp
public class TimerService
{
}
```

Chcę, aby klasa implementowała mechanizm startowania (w osobnym wątku) zegara, który będzie podnosił event za każdym razem gdy minie wyznaczony czas. Ma to robić bez przerwy, do odwołania.  
Co prawda jest to troszkę naiwne, ponieważ istnieją już klasy, które mają takie mechanizmy np. Timer. Jednak my zrobimy to po swojemu z użyciem BackgroundWorker'a.

```csharp
#region Members
private BackgroundWorker _worker;
private int _ticks = 0;
#endregion
```

Warto dodać też zmienną, która będzie zliczać tyknięcia i podawać nam tę informację jako parametr eventu.

Definiujemy publiczne zdarzenia, pod które będzie można się podpiąć:

```csharp
#region Events
public event TickEventHandler Tick;
public delegate void TickEventHandler(object sender, int tick);
#endregion
```

 

W konstruktorze zawrzemy inicjalizację naszego workera.

```csharp
public TimerService()
        {
            InitializeWorkers();
        }

        private void InitializeWorkers()
        {
            _worker = new BackgroundWorker();
            _worker.WorkerSupportsCancellation = true;
            _worker.DoWork += _worker_DoWork;
            _worker.RunWorkerCompleted += _worker_RunWorkerCompleted;
        }
        private void _worker_DoWork(object sender, DoWorkEventArgs e)
        {
            int sleepTime = (int)e.Argument;

            while (!_worker.CancellationPending)
            {
                RaiseTickEvent();
                Thread.Sleep(sleepTime);
            }
        }
        private void _worker_RunWorkerCompleted(object sender, RunWorkerCompletedEventArgs e)
        {

        }

```

Metoda wywołująca zdarzenie, będzie wykonywana poza wątkiem głównym. Musi być zabezpieczona na wypadek odpięcia się nasłuchujących na niej funkcji.

```csharp
private void RaiseTickEvent()
        {
            var copy = Tick;
            if (Tick != null)
            {
                copy(this, _ticks++);
            }
        }
```

Dlaczego akurat tak? Ponieważ, pomiędzy sprawdzeniem czy event jest nullem, a jego wywołaniem, inny wątek może odpiąć się od nasłuchiwania. Wyjaśnię ten mechanizm przy okazji moich następnych wpisów związanych z programowaniem współbieżnym.

Właściwości naszej klasy:

```csharp
#region Properties
        private int _sleepTime = 1000;
        public int SleepTime
        {
            get
            {
                return _sleepTime;
            }

            set
            {
                if (_sleepTime != value)
                {
                    _sleepTime = value;
                }
            }
        }

        private string _serviceName;
        public string ServiceName
        {
            get
            {
                return _serviceName;
            }
            set
            {
                if (value != _serviceName)
                {
                    _serviceName = value;
                }
            }
        }

        public bool IsRunning
        {
            get
            {
                return (_worker != null) ? _worker.IsBusy : false;
            }
        }
        #endregion
```

 

Na zewnątrz naszej klasy TimerService udostępniamy również dwie publiczne metody:

```csharp
#region Public Methods
        public void RunServiceAsync()
        {
            if (_worker != null)
            {
                _worker.RunWorkerAsync(SleepTime);
            }
        }
        public void CancelServiceAsync()
        {
            _worker.CancelAsync();
        }
        #endregion
```

To wszystko.

Mamy już zbudowany nasz "Service". Teraz przejdziemy do ViewModel, gdzie utworzymy jego instancję oraz spróbujemy go uruchomić 😉

W tym celu musimy dodać do folderu "ViewModels" klasę "MainWindowViewModel", która będzie dziedziczyć po "BaseViewModel".

```csharp
public class MainWindowViewModel : BaseViewModel
{
}
```

W niej definiujemy nasz serwis:

```csharp
private TimerService _timer;
```

Jeszcze jego inicjalizacja i wywołanie w konstruktorze:

```csharp
#region Constructor
        public MainWindowViewModel()
        {
            InitializeServices();

            _timer.RunServiceAsync();//todo on command
        }

        #endregion

        #region InitializeServices
        private void InitializeServices()
        {
            _timer = new TimerService();
            _timer.SleepTime = 1000;//1s
            _timer.Tick += _timer_Tick;
        }

        void _timer_Tick(object sender, int tick)
        {
        }
        #endregion
```

Jeśli można by było podzielić "**ViewModel**" na część View-ViewModelu i część Modelu-ViewModelu, to właśnie skończyliśmy pisać tę drugą.  
Przypomina mi się tutaj <a href="http://nonsensopedia.wikia.com/wiki/Dzida" target="_blank">budowa dzidy</a> ;). Można powiedzieć, że cała logika aplikacji została już napisana. Teraz zajmiemy się wyświetlaniem stanu naszego programu. Co chcielibyśmy wyświetlić? Liczbę tyknięć zegara.

W tym celu dodajemy nową właściwość naszej klasy "MainWindowViewModel":

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
                if (_message != value)
                {
                    _message = value;
                    RaisePropertyChanged(() => Message);
                }
            }
        }
```

To tutaj użyliśmy magicznego pomocnika jakim jest klasa **NotificationObject**, a dokładniej odziedziczona metoda **RaisePropertyChanged**.  
Ta metoda mówi do naszego widoku: "Jeśli ktoś mnie słyszy, to niech wie, że wartość obiektu Message, właśnie się zmieniła!".

Funkcją, która będzie zmieniać właściwość "Message", jest funkcja wywoływana podczas zdarzenia Tick.  
Powinna teraz wyglądać tak:

```csharp
void _timer_Tick(object sender, int tick)
        {
            Message = string.Format("Tick #{0}", tick);
        }
```

I to wszystko jeśli chodzi o część **ViewModel**. Choć przed nami jeszcze implementacja widoku, tutaj warto się zatrzymać.

Cała idea wzorca MVVM polega właśnie na tym, że ViewModel, krzyczy: "Jeśli ktoś mnie słyszy[,]". Jeśli tak - to super, a jeśli nie - to trudno. Nie wpływa to zupełnie na pracę całej aplikacji. Dzięki temu całkowicie oddzielamy widok aplikacji od jej logiki. Jedynym pomostem są właściwości klas z ViewModelu, które informują (słuchacza/y), o zmianie ich wartości.

Teraz zajmiemy się wyświetlaniem. Musimy podpiąć widok, tak aby nasłuchiwał na naszej zmiennej Message. Nic prostszego:

Jeśli zrobiłeś, drogi czytelniku, wszystko tak jak Cię o to prosiłem (chodzi mi o strukturę projektu), to w katalogu "View" powinieneś mieć plik: "**MainWindow**.**xaml**".  
Do znacznika **Window**, dodajemy atrybut:

```csharp
xmlns:viewModels="clr-namespace:ServicesSample.ViewModels"
```

oraz dodajemy zasób:

```csharp
<Window.Resources>
        <viewModels:MainWindowViewModel x:Key="MainViewModel" />
    </Window.Resources>
```

A wszystko po to, aby w domyślnym kontenerze zdefiniować DataContext

```csharp
DataContext="{StaticResource MainViewModel}"
```

Jeszcze tylko TextBlock, który nam to wszystko wyświetli

```csharp
<TextBlock Text="{Binding Message}" HorizontalAlignment="Center" VerticalAlignment="Center" Width="Auto"/>
```

Cały plik widoku powinien wyglądać następująco:

```csharp
<Window x:Class="ServicesSample.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        xmlns:viewModels="clr-namespace:ServicesSample.ViewModels"
        Title="MainWindow" Height="350" Width="525">
    <Window.Resources>
        <viewModels:MainWindowViewModel x:Key="MainViewModel" />
    </Window.Resources>
    <Grid DataContext="{StaticResource MainViewModel}">
        <TextBlock Text="{Binding Message}" HorizontalAlignment="Center" VerticalAlignment="Center" Width="Auto"/>
    </Grid>
</Window>
```

Koniec :-).

Po uruchomieniu powinniśmy zobaczyć zmieniający się co sekundę (lub inny ustawiony odcinek czasu) tekst.

[<img class="alignnone wp-image-58 size-full" src="https://i0.wp.com/www.karalus.eu/wp-content/uploads/2014/09/2014-09-17-22_52_38-MainWindow.png?resize=525%2C350" alt="" width="525" height="350" srcset="https://i0.wp.com/www.karalus.eu/wp-content/uploads/2014/09/2014-09-17-22_52_38-MainWindow.png?w=525 525w, https://i0.wp.com/www.karalus.eu/wp-content/uploads/2014/09/2014-09-17-22_52_38-MainWindow.png?resize=300%2C200 300w" sizes="(max-width: 525px) 100vw, 525px" data-recalc-dims="1" />](https://i0.wp.com/www.karalus.eu/wp-content/uploads/2014/09/2014-09-17-22_52_38-MainWindow.png)

**Cały projekt jest dostępny do pobrania na <a href="https://github.com/RamzesBlog/ServicesSample" target="_blank">GitHub</a>.**