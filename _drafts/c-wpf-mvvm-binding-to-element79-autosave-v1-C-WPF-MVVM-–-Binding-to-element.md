---
id: 198
title: 'C# WPF MVVM – Binding to element'
date: 2015-04-08T14:21:33+00:00
author: admin
layout: revision
guid: http://www.karalus.eu/2015/04/79-autosave-v1/
permalink: /2015/04/79-autosave-v1/
---
Dzisiaj obędzie się bez użycia wzorca <a href="http://www.karalus.eu/Blog/2014/08/c-wpf-mvvm-nowy-projekt-project-template/" target="_blank">MVVM</a>. To co chcę pokazać jest "wykonywane" jedynie po stronie widoku.  
<!--more-->

Nieraz zdarza się, że chcemy aby zachowanie niektórych kontrolek w naszym programie zależało od stanu innej kontrolki. Każdy chyba widział jak podczas instalacji nie możemy przejść do następnego kroku jeśli nie zaakceptujemy regulaminu. W tym przypadku "**button**" jest niedostępny, dopóki nie zmienimy stanu "**checkbox**‚a". Tutaj WPF dostarcza nam mechanizm **powiązań.**

Tak więc&#8230; bardzo prosty przykład:

Tworzymy CheckBox i nadajemy mu nazwę (Name).

<pre class="brush: xml; title: ; notranslate" title="">&lt;CheckBox Name=&quot;v_CheckBox&quot; Content=&quot;IsEnabled&quot;/&gt;
</pre>

Teraz dodajmy przycisk:

<pre class="brush: xml; title: ; notranslate" title="">&lt;Button HorizontalAlignment=&quot;Center&quot; VerticalAlignment=&quot;Center&quot; Content=&quot;Click!&quot;/&gt;
</pre>

Ok&#8230; póki co są to niezależne kontrolki.  
Spróbujmy powiązać stan checkbox&#8217;a ze stanem przycisku, a konkretniej to wartość własności "IsChecked" checkbox&#8217;a z wartością własności "IsEnabled" przycisku.  
W tym celu dodajemy do przycisku własność:

<pre class="brush: xml; title: ; notranslate" title="">IsEnabled=
</pre>

Jako wartość podajemy powiązanie z dwoma parametrami:

<pre class="brush: xml; title: ; notranslate" title="">{Binding ElementName=v_CheckBox, Path=IsChecked}
</pre>

ElementName jak nie trudno się domyśleć służy do wskazania na element, z którym chcemy powiązać, a "Path" oznacza z jakim properties.

Oczywiście możemy wiązać, ze sobą nie tylko wartości boolowskie, ale także string.  
W zasadzie to powiązać można ze sobą dowolne wartości, jednak wtedy trzeba dopisać **Converter**. O konwerterach napiszę innym razem 😉

Powiążemy jeszcze jedną właściwość naszego przycisku. Załóżmy, że dajemy użytkownikowi (z jakiejś dziwnej przyczyny) możliwość zmiany tekstu wyświetlanego wewnątrz przycisku.  
W tym celu dodajmy do naszego okna jeszcze jedną kontrolkę TexBox i nadajmy mu nazwę oraz jakiś wstępny tekst.

<pre class="brush: xml; title: ; notranslate" title="">&lt;TextBox Name=&quot;v_TextBox&quot; VerticalAlignment=&quot;Bottom&quot; HorizontalAlignment=&quot;Right&quot; Text=&quot;Click!&quot; Height=&quot;20&quot; Width=&quot;120&quot; Background=&quot;LightGray&quot;/&gt;
</pre>

Teraz wystarczy w naszym przycisku podmienić wcześniejszą wartość Content na powiązanie:

<pre class="brush: xml; title: ; notranslate" title="">{Binding ElementName=v_TextBox, Path=Text}
</pre>

Oto cała zawartość głównego kontenera:

<pre class="brush: xml; title: ; notranslate" title="">&lt;Grid&gt;
        &lt;CheckBox Name=&quot;v_CheckBox&quot; Content=&quot;IsEnabled&quot; HorizontalAlignment=&quot;Left&quot; VerticalAlignment=&quot;Top&quot;/&gt;
        &lt;Button HorizontalAlignment=&quot;Center&quot; VerticalAlignment=&quot;Center&quot; Content=&quot;{Binding ElementName=v_TextBox, Path=Text}&quot; IsEnabled=&quot;{Binding ElementName=v_CheckBox, Path=IsChecked}&quot;/&gt;
        &lt;Label Content=&quot;Button Text:&quot; VerticalAlignment=&quot;Bottom&quot; HorizontalAlignment=&quot;Right&quot; Margin=&quot;0,0,120,0&quot;/&gt;
        &lt;TextBox Name=&quot;v_TextBox&quot; VerticalAlignment=&quot;Bottom&quot; HorizontalAlignment=&quot;Right&quot; Text=&quot;Click!&quot; Height=&quot;20&quot; Width=&quot;120&quot; Background=&quot;LightGray&quot;/&gt;
    &lt;/Grid&gt;
</pre>

 

Efekt powinien być taki:

[<img class="alignnone wp-image-80 size-full" src="https://i0.wp.com/www.karalus.eu/wp-content/uploads/2014/10/ElementBinding.png?resize=1053%2C706" alt="" width="1053" height="706" srcset="https://i0.wp.com/www.karalus.eu/wp-content/uploads/2014/10/ElementBinding.png?w=1053 1053w, https://i0.wp.com/www.karalus.eu/wp-content/uploads/2014/10/ElementBinding.png?resize=300%2C201 300w, https://i0.wp.com/www.karalus.eu/wp-content/uploads/2014/10/ElementBinding.png?resize=1024%2C686 1024w" sizes="(max-width: 1000px) 100vw, 1000px" data-recalc-dims="1" />](https://i0.wp.com/www.karalus.eu/wp-content/uploads/2014/10/ElementBinding.png)

I to chyba wszystko. Jak widać nie trzeba zawsze stosować wzorca MVVM i <a href="http://www.karalus.eu/Blog/2014/10/c-wpf-mvvm-delegatecommand/" target="_blank">CanExecute</a>. Czasami jest to strzelanie z armaty do muchy. Dlatego powstały powiązania, aby załatwić sprawę prostych zależności.

 

**Całość jak zawsze dostępna na <a href="https://github.com/RamzesBlog/ElementBinding" target="_blank">GitHub!</a> 😉**