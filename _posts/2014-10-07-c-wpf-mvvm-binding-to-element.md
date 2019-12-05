---
id: 79
title: 'C# WPF MVVM – Binding to element'
date: 2014-10-07T19:14:49+00:00
author: Adrian Karalus
layout: post
guid: http://www.karalus.eu/Blog/?p=79
permalink: /2014/10/c-wpf-mvvm-binding-to-element/
image: /wp-content/uploads/2014/10/ElementBinding_icon.png
categories:
  - Programowanie
---
Dzisiaj obędzie się bez użycia wzorca <a href="http://www.karalus.eu/Blog/2014/08/c-wpf-mvvm-nowy-projekt-project-template/" target="_blank">MVVM</a>. To co chcę pokazać jest &#8222;wykonywane&#8221; jedynie po stronie widoku.  
<!--more-->

Nieraz zdarza się, że chcemy aby zachowanie niektórych kontrolek w naszym programie zależało od stanu innej kontrolki. Każdy chyba widział jak podczas instalacji nie możemy przejść do następnego kroku jeśli nie zaakceptujemy regulaminu. W tym przypadku &#8222;**button**&#8221; jest niedostępny, dopóki nie zmienimy stanu &#8222;**checkbox**‚a&#8221;. Tutaj WPF dostarcza nam mechanizm **powiązań.**

Tak więc&#8230; bardzo prosty przykład:

Tworzymy CheckBox i nadajemy mu nazwę (Name).

<pre class="brush: xml; title: ; notranslate" title="">&lt;CheckBox Name="v_CheckBox" Content="IsEnabled"/&gt;
</pre>

Teraz dodajmy przycisk:

<pre class="brush: xml; title: ; notranslate" title="">&lt;Button HorizontalAlignment="Center" VerticalAlignment="Center" Content="Click!"/&gt;
</pre>

Ok&#8230; póki co są to niezależne kontrolki.  
Spróbujmy powiązać stan checkbox&#8217;a ze stanem przycisku, a konkretniej to wartość własności &#8222;IsChecked&#8221; checkbox&#8217;a z wartością własności &#8222;IsEnabled&#8221; przycisku.  
W tym celu dodajemy do przycisku własność:

<pre class="brush: xml; title: ; notranslate" title="">IsEnabled=
</pre>

Jako wartość podajemy powiązanie z dwoma parametrami:

<pre class="brush: xml; title: ; notranslate" title="">{Binding ElementName=v_CheckBox, Path=IsChecked}
</pre>

ElementName jak nie trudno się domyśleć służy do wskazania na element, z którym chcemy powiązać, a &#8222;Path&#8221; oznacza z jakim properties.

Oczywiście możemy wiązać, ze sobą nie tylko wartości boolowskie, ale także string.  
W zasadzie to powiązać można ze sobą dowolne wartości, jednak wtedy trzeba dopisać **Converter**. O konwerterach napiszę innym razem 😉

Powiążemy jeszcze jedną właściwość naszego przycisku. Załóżmy, że dajemy użytkownikowi (z jakiejś dziwnej przyczyny) możliwość zmiany tekstu wyświetlanego wewnątrz przycisku.  
W tym celu dodajmy do naszego okna jeszcze jedną kontrolkę TexBox i nadajmy mu nazwę oraz jakiś wstępny tekst.

<pre class="brush: xml; title: ; notranslate" title="">&lt;TextBox Name="v_TextBox" VerticalAlignment="Bottom" HorizontalAlignment="Right" Text="Click!" Height="20" Width="120" Background="LightGray"/&gt;
</pre>

Teraz wystarczy w naszym przycisku podmienić wcześniejszą wartość Content na powiązanie:

<pre class="brush: xml; title: ; notranslate" title="">{Binding ElementName=v_TextBox, Path=Text}
</pre>

Oto cała zawartość głównego kontenera:

<pre class="brush: xml; title: ; notranslate" title="">&lt;Grid&gt;
        &lt;CheckBox Name="v_CheckBox" Content="IsEnabled" HorizontalAlignment="Left" VerticalAlignment="Top"/&gt;
        &lt;Button HorizontalAlignment="Center" VerticalAlignment="Center" Content="{Binding ElementName=v_TextBox, Path=Text}" IsEnabled="{Binding ElementName=v_CheckBox, Path=IsChecked}"/&gt;
        &lt;Label Content="Button Text:" VerticalAlignment="Bottom" HorizontalAlignment="Right" Margin="0,0,120,0"/&gt;
        &lt;TextBox Name="v_TextBox" VerticalAlignment="Bottom" HorizontalAlignment="Right" Text="Click!" Height="20" Width="120" Background="LightGray"/&gt;
    &lt;/Grid&gt;
</pre>

&nbsp;

Efekt powinien być taki:

[<img class="alignnone wp-image-80 size-full" src="https://i0.wp.com/www.karalus.eu/wp-content/uploads/2014/10/ElementBinding.png?resize=1053%2C706" alt="" width="1053" height="706" srcset="https://i0.wp.com/www.karalus.eu/wp-content/uploads/2014/10/ElementBinding.png?w=1053 1053w, https://i0.wp.com/www.karalus.eu/wp-content/uploads/2014/10/ElementBinding.png?resize=300%2C201 300w, https://i0.wp.com/www.karalus.eu/wp-content/uploads/2014/10/ElementBinding.png?resize=1024%2C686 1024w" sizes="(max-width: 1000px) 100vw, 1000px" data-recalc-dims="1" />](https://i0.wp.com/www.karalus.eu/wp-content/uploads/2014/10/ElementBinding.png)

I to chyba wszystko. Jak widać nie trzeba zawsze stosować wzorca MVVM i <a href="http://www.karalus.eu/Blog/2014/10/c-wpf-mvvm-delegatecommand/" target="_blank">CanExecute</a>. Czasami jest to strzelanie z armaty do muchy. Dlatego powstały powiązania, aby załatwić sprawę prostych zależności.

&nbsp;

**Całość jak zawsze dostępna na <a href="https://github.com/RamzesBlog/ElementBinding" target="_blank">GitHub!</a> 😉**