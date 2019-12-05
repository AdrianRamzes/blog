---
id: 315
title: 'Mechanizm wtyczek w języku c# (Plugins)'
date: 2015-06-27T00:26:27+00:00
author: Adrian Karalus
layout: revision
guid: http://www.karalus.eu/2015/06/306-revision-v1/
permalink: /2015/06/306-revision-v1/
---
W dzisiejszym wpisie przedstawię wam jak stworzyć prosty mechanizm wtyczek w języku C#.

<!--more-->

Stworzymy prostą aplikację do rysowania (coś jak mspaint), ale wszystkie narzędzia będą dokładane poprzez wtyczki &#8211; plugins.

W tym celu stwórzmy bazę, czyli główną aplikację. W tym przypadku będzie to aplikacja WPF.

Na sam początek dodajmy do naszej aplikacji menu:

<pre class="brush: csharp; title: ; notranslate" title="">&lt;Grid.RowDefinitions&gt;
            &lt;RowDefinition Height=&quot;25&quot; /&gt;
            &lt;RowDefinition Height=&quot;*&quot; /&gt;
        &lt;/Grid.RowDefinitions&gt;

        &lt;Menu Grid.Row=&quot;0&quot;&gt;
            &lt;MenuItem Header=&quot;Program&quot;&gt;
                &lt;MenuItem Header=&quot;Close&quot; Click=&quot;MenuItem_Click&quot;/&gt;
            &lt;/MenuItem&gt;
        &lt;/Menu&gt;
</pre>

Będzie tam tylko jedna opcja pozwalająca zamknąć program.

<pre class="brush: csharp; title: ; notranslate" title="">private void MenuItem_Click(object sender, RoutedEventArgs e)
        {
            this.Close();
        }
</pre>

Żeby rysować trzeba mieć na czym, dodajmy więc ‚**Canvas**‚:

&nbsp;

<pre class="brush: csharp; title: ; notranslate" title="">&lt;Canvas Grid.Row=&quot;1&quot; Background=&quot;Transparent&quot; /&gt;
</pre>

I to w zasadzie cały nasz interfejs.

Od teraz drodzy fanatycy technologii WPF i MVVM, zamknijcie oczy, ponieważ nie będziemy tutaj bawić się w żadne wzorce projektowe. Nie o to w tym przykładzie chodzi.

Więc&#8230; nadamy nazwy naszym kontrolką 😉

odpowiednio:

<pre class="brush: csharp; title: ; notranslate" title="">&lt;Menu Name=&quot;v_Menu&quot; Grid.Row=&quot;0&quot;&gt;
</pre>

i

<pre class="brush: csharp; title: ; notranslate" title="">&lt;Canvas Name=&quot;v_Canvas&quot; Grid.Row=&quot;1&quot; Background=&quot;Transparent&quot; /&gt;
</pre>

Teraz omówmy jak zrobić mechanizm wtyczek.

Chcemy umożliwić innym programistom pisanie wtyczek do naszego programu. Aby zapewnić obsługę tych wtyczek muszą one implementować znany naszej aplikacji interface. Interface powinien być zadeklarowany w zewnętrznym projekcie. Dzięki temu będziemy mogli udostępnić go innym.

W tym celu dodajemy do naszej solucji nowy projekt typu "**Class Library**".

W tym projekcie będziemy trzymać tylko jeden plik z interfejsem **IPlugin**:

<pre class="brush: csharp; title: ; notranslate" title="">public interface IPlugin : IDisposable
    {
        MenuItem GetMenuItem();

        void Initialize(Canvas canvas, Color color, int thickness);

        void SetColor(Color color);

        void SetThickness(int thickness);
    }
</pre>

Pomysł jest prosty, każdy plugin musi podać swój **MenuItem** &#8211; tak abyśmy mogli dodać go do menu naszej aplikacji.

Metoda **Initialize** ma pozwolić przekazać do wtyczki kontrolkę "**Canvas**" oraz ustawić wartości początkowe takie jak kolor czy grubość (w końcu są to wtyczki z narzędziami do rysowania).

Dodajemy referencję do **PluginInterface** do naszego projektu.

Teraz należy zaimplementować obsługę przyszłych wtyczek.  
Zakładam, że wszystkie wtyczki będą wsadzane do folderu "**Plugins**", w miejscu gdzie leży program. Oto metoda, która przeszuka ten folder i załaduje listę obiektów typu **Assembly**.

<pre class="brush: csharp; title: ; notranslate" title="">private List&lt;Assembly&gt; GetAssemblies(string directory)
        {
            var assemblies = new List&lt;Assembly&gt;();
            if (Directory.Exists(directory))
            {
                foreach (var file in Directory.GetFiles(directory, &quot;*.dll&quot;))
                {
                    assemblies.Add(Assembly.LoadFrom(file));
                }
            }
            return assemblies;
        }
</pre>

Teraz dla każdego **Assembly** sprawdzamy czy zawiera on klasy implementujące **IPlugin**.  
Jeśli tak, to tworzymy instancje tych klas.

W przypadku tej konkretnej aplikacji, na każdym z tych obiektów wykonywane są dodatkowe operacje w celu wkomponowania tych funkcjonalności w interfejs użytkownika. Dlatego wywołujemy metodę **GetMenuItem**, która zwróci nam obiekt gotowy do dodania do menu naszej aplikacji.

Cała metoda inicjująca wtyczki wygląda tak:

<pre class="brush: csharp; title: ; notranslate" title="">private void InitializePlugins()
        {
            var assemblies = GetAssemblies(&quot;Plugins&quot;);

            List&lt;MenuItem&gt; menuItems = new List&lt;MenuItem&gt;();

            foreach (var assembly in assemblies)
            {
                var types = assembly.GetTypes();

                foreach (var type in types)
                {
                    if (type.IsClass &amp;&amp; type.IsPublic &amp;&amp; type.GetInterface(typeof(IPlugin).FullName) != null)
                    {
                        var item = Activator.CreateInstance(type) as IPlugin;
                        var menuItem = item.GetMenuItem();
                        menuItem.Tag = item;
                        menuItem.Click += pluginMenuItem_Click;
                        menuItems.Add(menuItem);
                    }
                }
            }

            if (menuItems.Any())
            {
                var tools = new MenuItem();
                tools.Header = &quot;Tools&quot;;
                menuItems.ForEach((i) =&gt; { tools.Items.Add(i); });

                v_Menu.Items.Add(tools);
            }
        }
</pre>

W obsłudze zdarzenia "**Click**", podmieniamy aktualnie aktywną wtyczkę na nową (ukrytą we własności "**Tag**"):

<pre class="brush: csharp; title: ; notranslate" title="">private void pluginMenuItem_Click(object sender, RoutedEventArgs e)
        {
            MenuItem menuItem = sender as MenuItem;

            if (menuItem == null)
                return;

            if (_currentActivePlugin != null)
                _currentActivePlugin.Dispose();

            IPlugin plugin = menuItem.Tag as IPlugin;
            if (plugin != null)
            {
                _currentActivePlugin = plugin;
                _currentActivePlugin.Initialize(v_Canvas, _currentColor, _currentThickness);
            }
        }
</pre>

To tyle jeśli chodzi o obsługę wtyczek w naszej aplikacji. Jedyne co musimy teraz zrobić to napisać plugin i sprawdzić czy całość działa 😉

(W projekcie na <a href="https://github.com/RamzesBlog/PluginsExample" target="_blank">GITHUB </a>są napisane 3 pluginy, jednak w tym wpisie opiszę tylko jeden z nich).

Tworzymy nowy projekt "**Class Library**" w naszej solucji.  
Naszą wtyczką będzie narzędzie do rysowania linii więc projekt nazwałem "**LineToolPlugin**".  
Pamiętajmy, że każdy plugin musi implementować interfejs **IPlugin**, więc należy dodać referencję do projektu "**PluginInterface**".

Oto implementacja całej klasy **LineTool**:

<pre class="brush: csharp; title: ; notranslate" title="">public class LineTool : IPlugin
    {
        private int _thickness = 3; // default value
        private Color _color = Colors.Black; //default color
        private Canvas _canvas;

        public MenuItem GetMenuItem()
        {
            MenuItem menuItem = new MenuItem();
            menuItem.Header = &quot;Line&quot;;
            return menuItem;
        }

        public void Initialize(Canvas canvas, Color color, int thickness)
        {
            _canvas = canvas;
            _color = color;
            _thickness = thickness;
            if (_canvas != null)
            {
                _canvas.MouseLeftButtonDown += Canvas_MouseLeftButtonDown;
                _canvas.MouseLeftButtonUp += Canvas_MouseLeftButtonUp;
                _canvas.MouseMove += Canvas_MouseMove;
            }
        }

        public void SetColor(Color color)
        {
            if (color != null)
            {
                _color = color;
            }
        }

        public void SetThickness(int thickness)
        {
            if (thickness &gt;= 0)
            {
                _thickness = thickness;
            }
        }

        public void Dispose()
        {
            if (_canvas != null)
            {
                _canvas.MouseLeftButtonDown -= Canvas_MouseLeftButtonDown;
                _canvas.MouseLeftButtonUp -= Canvas_MouseLeftButtonUp;
                _canvas.MouseMove -= Canvas_MouseMove;
            }
        }

        private void Canvas_MouseLeftButtonDown(object sender, MouseButtonEventArgs e)
        {
            var canvas = (Canvas)sender;

            if (canvas.CaptureMouse())
            {
                var startPoint = e.GetPosition(canvas);
                var line = new Line
                {
                    Stroke = new SolidColorBrush(_color),
                    StrokeThickness = _thickness,
                    X1 = startPoint.X,
                    Y1 = startPoint.Y,
                    X2 = startPoint.X,
                    Y2 = startPoint.Y,
                };

                canvas.Children.Add(line);
            }
        }

        private void Canvas_MouseMove(object sender, MouseEventArgs e)
        {
            var canvas = (Canvas)sender;

            if (canvas.IsMouseCaptured &amp;&amp; e.LeftButton == MouseButtonState.Pressed)
            {
                var line = canvas.Children.OfType&lt;Line&gt;().LastOrDefault();

                if (line != null)
                {
                    var endPoint = e.GetPosition(canvas);
                    line.X2 = endPoint.X;
                    line.Y2 = endPoint.Y;
                }
            }
        }

        private void Canvas_MouseLeftButtonUp(object sender, MouseButtonEventArgs e)
        {
            ((Canvas)sender).ReleaseMouseCapture();
        }
    }
</pre>

Budujemy naszą wtyczkę i dodajemy wygenerowany plik "**LineToolPlugin.dll**" do folderu **Plugins**

[<img class="alignnone size-full wp-image-313" src="https://i1.wp.com/www.karalus.eu/wp-content/uploads/2015/06/PluginsExample1.png?resize=308%2C351" alt="LineToolsPluin-dll-content" width="308" height="351" srcset="https://i1.wp.com/www.karalus.eu/wp-content/uploads/2015/06/PluginsExample1.png?w=308 308w, https://i1.wp.com/www.karalus.eu/wp-content/uploads/2015/06/PluginsExample1.png?resize=263%2C300 263w" sizes="(max-width: 308px) 100vw, 308px" data-recalc-dims="1" />](https://i1.wp.com/www.karalus.eu/wp-content/uploads/2015/06/PluginsExample1.png)

Ważne jest aby wybrać opcję "**Copy always**"

[<img class="alignnone size-full wp-image-314" src="https://i2.wp.com/www.karalus.eu/wp-content/uploads/2015/06/PluginsExample2.png?resize=447%2C219" alt="PluginsExample-copyAlways" width="447" height="219" srcset="https://i2.wp.com/www.karalus.eu/wp-content/uploads/2015/06/PluginsExample2.png?w=447 447w, https://i2.wp.com/www.karalus.eu/wp-content/uploads/2015/06/PluginsExample2.png?resize=300%2C147 300w" sizes="(max-width: 447px) 100vw, 447px" data-recalc-dims="1" />](https://i2.wp.com/www.karalus.eu/wp-content/uploads/2015/06/PluginsExample2.png)

&nbsp;

Pliki "*.pdb" to tzw. symbole, przydają się przy debugowaniu ale o tym przy okazji następnych wpisów 😉

&nbsp;

Całość jak zawsze dostępna na <a href="https://github.com/RamzesBlog/PluginsExample" target="_blank">GitHub </a>🙂

&nbsp;

&nbsp;