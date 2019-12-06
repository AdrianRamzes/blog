---
id: 199
title: 'C# WPF MVVM – Binding to element'
date: 2015-04-08T14:21:44+00:00
author: admin
layout: revision
guid: http://www.karalus.eu/2015/04/79-revision-v1/
permalink: /2015/04/79-revision-v1/
---
Dzisiaj obędzie się bez użycia wzorca <a href="http://www.karalus.eu/Blog/2014/08/c-wpf-mvvm-nowy-projekt-project-template/" target="_blank">MVVM</a>. To co chcę pokazać jest "wykonywane" jedynie po stronie widoku.  
<!--more-->

Nieraz zdarza się, że chcemy aby zachowanie niektórych kontrolek w naszym programie zależało od stanu innej kontrolki. Każdy chyba widział jak podczas instalacji nie możemy przejść do następnego kroku jeśli nie zaakceptujemy regulaminu. W tym przypadku "**button**" jest niedostępny, dopóki nie zmienimy stanu "**checkbox**‚a". Tutaj WPF dostarcza nam mechanizm **powiązań.**

Tak więc, bardzo prosty przykład:

Tworzymy CheckBox i nadajemy mu nazwę (Name).

```xml
<CheckBox Name="v_CheckBox" Content="IsEnabled"/>
```

Teraz dodajmy przycisk:

```xml
<Button HorizontalAlignment="Center" VerticalAlignment="Center" Content="Click!"/>
```

Ok, póki co są to niezależne kontrolki.  
Spróbujmy powiązać stan checkbox'a ze stanem przycisku, a konkretniej to wartość własności "IsChecked" checkbox'a z wartością własności "IsEnabled" przycisku.  
W tym celu dodajemy do przycisku własność:

```xml
IsEnabled=
```

Jako wartość podajemy powiązanie z dwoma parametrami:

```xml
{Binding ElementName=v_CheckBox, Path=IsChecked}
```

ElementName jak nie trudno się domyśleć służy do wskazania na element, z którym chcemy powiązać, a "Path" oznacza z jakim properties.

Oczywiście możemy wiązać, ze sobą nie tylko wartości boolowskie, ale także string.  
W zasadzie to powiązać można ze sobą dowolne wartości, jednak wtedy trzeba dopisać **Converter**. O konwerterach napiszę innym razem 😉

Powiążemy jeszcze jedną właściwość naszego przycisku. Załóżmy, że dajemy użytkownikowi (z jakiejś dziwnej przyczyny) możliwość zmiany tekstu wyświetlanego wewnątrz przycisku.  
W tym celu dodajmy do naszego okna jeszcze jedną kontrolkę TexBox i nadajmy mu nazwę oraz jakiś wstępny tekst.

```xml
<TextBox Name="v_TextBox" VerticalAlignment="Bottom" HorizontalAlignment="Right" Text="Click!" Height="20" Width="120" Background="LightGray"/>
```

Teraz wystarczy w naszym przycisku podmienić wcześniejszą wartość Content na powiązanie:

```xml
{Binding ElementName=v_TextBox, Path=Text}
```

Oto cała zawartość głównego kontenera:

```xml
<Grid>
        <CheckBox Name="v_CheckBox" Content="IsEnabled" HorizontalAlignment="Left" VerticalAlignment="Top"/>
        <Button HorizontalAlignment="Center" VerticalAlignment="Center" Content="{Binding ElementName=v_TextBox, Path=Text}" IsEnabled="{Binding ElementName=v_CheckBox, Path=IsChecked}"/>
        <Label Content="Button Text:" VerticalAlignment="Bottom" HorizontalAlignment="Right" Margin="0,0,120,0"/>
        <TextBox Name="v_TextBox" VerticalAlignment="Bottom" HorizontalAlignment="Right" Text="Click!" Height="20" Width="120" Background="LightGray"/>
    </Grid>
```

 

Efekt powinien być taki:

[<img class="alignnone wp-image-80 size-full" src="/wp-content/uploads/2014/10/ElementBinding.png?resize=1053%2C706" alt="" width="1053" height="706" srcset="/wp-content/uploads/2014/10/ElementBinding.png?w=1053 1053w, /wp-content/uploads/2014/10/ElementBinding.png?resize=300%2C201 300w, /wp-content/uploads/2014/10/ElementBinding.png?resize=1024%2C686 1024w" sizes="(max-width: 1000px) 100vw, 1000px" data-recalc-dims="1" />](/wp-content/uploads/2014/10/ElementBinding.png)

I to chyba wszystko. Jak widać nie trzeba zawsze stosować wzorca MVVM i <a href="http://www.karalus.eu/Blog/2014/10/c-wpf-mvvm-delegatecommand/" target="_blank">CanExecute</a>. Czasami jest to strzelanie z armaty do muchy. Dlatego powstały powiązania, aby załatwić sprawę prostych zależności.

 

**Całość jak zawsze dostępna na <a href="https://github.com/RamzesBlog/ElementBinding" target="_blank">GitHub!</a> 😉**