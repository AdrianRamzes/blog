---
id: 236
title: Obraz z kamerki przy użyciu Emgu CV
date: 2015-04-27T11:21:48+00:00
author: admin
layout: revision
guid: http://www.karalus.eu/2015/04/233-autosave-v1/
permalink: /2015/04/233-autosave-v1/
---
W tym wpisie zaprezentuję prosty przykład aplikacji używającej kamerki internetowej z użyciem biblioteki Emgu CV (wrapper Open CV).  
<!--more-->Jednocześnie pokażę bardzo praktyczne zastosowanie "serwisów" we wzorcu MVVM.

Aby w ogóle rozpocząć pracę z kamerką należy ściągnąć i zainstalować bibliotekę EmguCV, można to zrobić przy pomocy NuGet packages manager (co w moim przypadku nie zadziałało - wiesza się przy ściąganiu i za chiny nie chce iść dalej,)  lub ze strony <a href="http://www.emgu.com/wiki/index.php/Main_Page" target="_blank">emgu</a>.

Jeśli skorzystałeś/łaś z NuGet'a to wszystkie pliki dll i odpowiednie referencje dodały się same. Natomiast w przypadku zwykłej instalacji, należy przejść do folderu zawierającegu (domyślnie C:\Emgu\), następnie do folderu bin. Skopiować wszystkie pliki *.dll dla odpowiedniej wersji (x86 lub x64) i przenieść do naszego projektu np. do folderu lib. Pamiętaj, żeby nadać im opcję "copy to output directory".

OK! Jeśli część dodawania referencji jest już za nami, to możemy przejść do implementacji naszego projektu.  
Będzie to aplikacji napisana w zgodzie ze wzorcem MVVM, więc przygotuj najpierw wszystko tak jak w moim wcześniejszym wpisie.

**WebCamService**

W folderze Services dodajemy nową klasę o nazwie WebCamService. Ta klasa będzie obsługiwać kamerkę. Powinna posaidać dwie metody "Run" i "Cancel". Po uruchomieniu powinna podnosić event o przechwyceniu obrazu z kamerki. Wszystko to robi już klasa Capture z biblioteki emgu, jednak my opakujemy to w bardziej elegancką w tym przypadku formę.

```csharp
public class WebCamService
    {
        private Capture _capture;

        private bool _isRunning = false;
        public bool IsRunning
        {
            get
            {
                return _isRunning;
            }
        }

        public event ImageChangedEventHndler ImageChanged;
        public delegate void ImageChangedEventHndler(object sender, Bitmap image);

        public WebCamService()
        {
            _capture = new Capture();
            _capture.ImageGrabbed += _capture_ImageGrabbed;
        }

        void _capture_ImageGrabbed(object sender, EventArgs e)
        {
            RaiseImageChangedEvent(_capture.RetrieveBgrFrame().Bitmap);
        }

        public void RunServiceAsync()
        {
            _capture.Start();
            _isRunning = true;
        }

        public void CancelServiceAsync()
        {
            _capture.Stop();
            _isRunning = false;
        }

        private void RaiseImageChangedEvent(Bitmap image)
        {
            if (ImageChanged != null)
            {
                ImageChanged(this, image);
            }
        }
    }
```

Jak widać obiekty klasy Capture dostarczają już event "ImageGrabbed". Jednak co w przypadku gdy nie chcemy być bombardowani wywołaniami tego zdarzenia z częstotliwością równą częstotliwości kamerki (fps).

Caputre dostarcza również taką metodę jak: "QueryFrame()", dzięki niej, sami możemy odpytywać kamerkę o aktualną klatkę.

I w ten sposób przejdę do drugiej możliwej implementacji klasy WebCamService, która może się przydać wtedy gdy mamy zamiar wykonywać na obrazie jakieś bardziej zasobożerne zadania.

```csharp
public class WebCamService
    {
        private Capture _capture;
        private BackgroundWorker _webCamWorker;

        public event ImageChangedEventHndler ImageChanged;
        public delegate void ImageChangedEventHndler(object sender, Image<Bgr, Byte> image);

        public bool IsRunning
        {
            get
            {
                return (_webCamWorker != null) ? _webCamWorker.IsBusy : false;
            }
        }

        public void RunServiceAsync()
        {
            _webCamWorker.RunWorkerAsync();
        }

        public void CancelServiceAsync()
        {
            if (_webCamWorker != null)
            {
                _webCamWorker.CancelAsync();
            }
        }

        private void RaiseImageChangedEvent(Image<Bgr, Byte> image)
        {
            if (ImageChanged != null)
            {
                ImageChanged(this, image);
            }
        }

        public WebCamService()
        {
            _capture = new Emgu.CV.Capture();
            InitializeWorkers();
        }

        private void InitializeWorkers()
        {
            _webCamWorker = new BackgroundWorker();
            _webCamWorker.WorkerSupportsCancellation = true;
            _webCamWorker.DoWork += _webCamWorker_DoWork;
            _webCamWorker.RunWorkerCompleted += _webCamWorker_RunWorkerCompleted;
        }
        private void _webCamWorker_DoWork(object sender, DoWorkEventArgs e)
        {
            while (!_webCamWorker.CancellationPending)
            {
                RaiseImageChangedEvent(_capture.QueryFrame().Copy());
            }
        }
        private void _webCamWorker_RunWorkerCompleted(object sender, RunWorkerCompletedEventArgs e)
        {

        }
    }
```

Z zewnątrz działanie tej klasy jest identyczne, jednak w środku działa poboczny wątek i jest miejsce na rozbudowę. Sami decydujemy kiedy event się odpali.

 

Należy jeszcze wspomnieć o tym jak wyświetlić przechwycony obraz.

**MainViewModel**

```csharp
public class MainWindowViewModel : BaseViewModel
    {
        private WebCamService _webCamService;

        private Bitmap _frame;
        public Bitmap Frame
        {
            get
            {
                return _frame;
            }

            set
            {
                if (_frame != value)
                {
                    _frame = value;
                    RaisePropertyChanged(() => Frame);
                }
            }
        }

        private ICommand _toggleWebServiceCommand;
        public ICommand ToggleWebServiceCommand
        {
            get
            {
                return _toggleWebServiceCommand;
            }

            private set { }
        }

        public MainWindowViewModel()
        {
            InitializeServices();
            InitializeCommands();
        }

        private void InitializeServices()
        {
            _webCamService = new WebCamService();
            _webCamService.ImageChanged += _webCamService_ImageChanged;
        }

        private void InitializeCommands()
        {
            _toggleWebServiceCommand = new DelegateCommand(ToggleWebServiceExecute);
        }

        private void _webCamService_ImageChanged(object sender, System.Drawing.Bitmap image)
        {
            this.Frame = image;
        }

        private void ToggleWebServiceExecute()
        {
            if (!_webCamService.IsRunning)
            {
                _webCamService.RunServiceAsync();
            }
            else
            {
                _webCamService.CancelServiceAsync();
            }
        }
    }
```

ViewModel w tym przypadku będzie bardzo prostu. Implementujemy jedynie komendę włączania/wyłączania kamerki oraz wystawiamy obiekt typu "Bitmap", który będziemy wyświetlać.

Przyjrzyjmy się widokowi:

**MainWindow**

```csharp
<Window x:Class="WebCamExample.Views.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        xmlns:viewModels="clr-namespace:WebCamExample.ViewModels"
        xmlns:converters="clr-namespace:WebCamExample.Converters"
        Title="MainWindow" Height="350" Width="525">
    <Window.Resources>
        <viewModels:MainWindowViewModel x:Key="MainWindowViewModel" />
        <converters:BitmapToImageSourceConverter x:Key="BitmapToImageSourceConverter"/>
    </Window.Resources>
    <Grid DataContext="{StaticResource MainWindowViewModel}">
        <Grid.RowDefinitions>
            <RowDefinition Height="*"/>
            <RowDefinition Height="30"/>
        </Grid.RowDefinitions>

        <Image Name="v_Image_Frame" Source="{Binding Frame, Converter={StaticResource BitmapToImageSourceConverter}}" Stretch="Uniform"/>

        <Button Name="v_Button_ToggleWebCam" Grid.Row="1" Command="{Binding ToggleWebServiceCommand}"
                Click="v_Button_ToggleWebCam_Click" VerticalAlignment="Center" Content="Start!" HorizontalAlignment="Center" Margin="5"/>
    </Grid>
</Window>
```

oraz implementacja kliknięcia w przycisk w code-behind:

```csharp
bool _isRunning = false;

        private void v_Button_ToggleWebCam_Click(object sender, RoutedEventArgs e)
        {
            _isRunning = !_isRunning;

            v_Button_ToggleWebCam.Content = _isRunning ? "Stop" : "Start";
        }
```

Mała adnotacja co do zgodności ze wzorcem. Oczywiście, żeby być w 100% zgodnym ze wzorcem musiałbym we ViewModel wystawić properties "IsRunning" i od stanu tej zmiennej uzależniać widok. Jednak w tym przypadku, zrobiłem to celowo aby pokazać, że czasami ścisłe trzymanie się wzorca jest pozbawione sensu i kompletnie nadmiarowe. Łatwiej, prościej i czytelniej będzie, gdy tekst przycisku będzie ustawiany po prostu w C-B.

UWAGA!  
Kontrolka Image przyjmuję jako źródło obiekt typu ImageSource, a więc potrzebna jest nam jeszcze konwersja typów z Bitmap -> ImageSource. Oto implementacja tego konwertera (nie ukrywam, że znaleziona w internecie prawdopodobnie na <a href="http://stackoverflow.com" target="_blank">StackOverflow</a>)

<pre>B```

```csharp
public class BitmapToImageSourceConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, System.Globalization.CultureInfo culture)
        {
            if (value == null) return null;

            using (MemoryStream ms = new MemoryStream())
            {
                ((System.Drawing.Bitmap)value).Save(ms, System.Drawing.Imaging.ImageFormat.Bmp);
                BitmapImage image = new BitmapImage();
                image.BeginInit();
                ms.Seek(0, SeekOrigin.Begin);
                image.StreamSource = new MemoryStream(ms.ToArray());
                image.EndInit();

                return image;
            }
        }

        public object ConvertBack(object value, Type targetType, object parameter, System.Globalization.CultureInfo culture)
        {
            throw new NotImplementedException();
        }
    }
```

To chyba wszystko. Cały działający kod, jak zawsze, dostępny na <a href="https://github.com/RamzesBlog/EmguWebCamExample" target="_blank">GitHub</a>! 😉

 

[<img class="alignnone size-full wp-image-272" src="https://i0.wp.com/www.karalus.eu/wp-content/uploads/2015/04/blog_webcamService.png?resize=588%2C342" alt="blog_webcamService" width="588" height="342" srcset="https://i0.wp.com/www.karalus.eu/wp-content/uploads/2015/04/blog_webcamService.png?w=588 588w, https://i0.wp.com/www.karalus.eu/wp-content/uploads/2015/04/blog_webcamService.png?resize=300%2C174 300w" sizes="(max-width: 588px) 100vw, 588px" data-recalc-dims="1" />](https://i0.wp.com/www.karalus.eu/wp-content/uploads/2015/04/blog_webcamService.png)