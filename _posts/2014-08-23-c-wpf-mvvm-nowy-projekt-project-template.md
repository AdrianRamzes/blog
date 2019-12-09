---
title: 'C# WPF MVVM - nowy projekt (Project Template)'
date: 2014-08-23T19:33:40+00:00
author: Adrian Karalus
layout: post
permalink: /2014/08/c-wpf-mvvm-nowy-projekt-project-template/
image: /blog/wp-content/uploads/2014/08/2014-08-23-19_21_47-MvvmTemplate-Microsoft-Visual-Studio.png
categories:
  - Programowanie
tags:
  - 'c#'
  - mvvm
  - wpf
--- 
Większość wzorców projektowych, wymaga od programisty większego nakładu pracy, niż bezsensowne klepanie kodu "na szybko". W zamian za czytelny kod i strukturę, musimy się czasami nieźle nagłówkować. Jednak czas poświęcony nad utrzymaniem projektu w zgodzie ze wzorcem, zwraca się z nawiązką.  
MVVM nie jest tutaj wyjątkiem. Postaram się opisać go dokładniej (wraz z przykładami), przy okazji moich następnych wpisów. Dziś chcę opisać, jak  mvvm wygląda w moim wykonaniu oraz od czego zaczynam gdy tworzę nowy projekt.

A więc, od początku:

1. Tworzymy nowy projekt C#/WPF  😉  
Jego struktura jest dość uboga:  
![](/blog/wp-content/uploads/2014/08/2014-08-23-17_38_16-WpfApplication1-Microsoft-Visual-Studio.png)

2. Do projektu dodajemy katalogi:  
Models, Views, ViewModels oraz Services, Converters i Helpers.  
(W następnych wpisach dokładnie opiszę, co będziemy w nich trzymać)

3. Tworzymy dwie nowe klasy DelegateCommand i NotificationObject. W tym celu dodajemy do folderu "Helpers", dwa pliki .cs o zawartości:

NotificationObject.cs

```csharp
using System;
using System.ComponentModel;
using System.Linq.Expressions;

namespace MvvmTemplate.Helpers
{
    public class NotificationObject : INotifyPropertyChanged
    {
        protected void RaisePropertyChanged<T>(Expression<Func<T>> action)
        {
            var propertyName = GetPropertyName(action);
            RaisePropertyChanged(propertyName);
        }

        private static string GetPropertyName<T>(Expression<Func<T>> action)
        {
            var expression = (MemberExpression)action.Body;
            var propertyName = expression.Member.Name;
            return propertyName;
        }

        private void RaisePropertyChanged(string propertyName)
        {
            if (PropertyChanged != null)
                PropertyChanged(this, new PropertyChangedEventArgs(propertyName));
        }

        public event PropertyChangedEventHandler PropertyChanged;
    }
}
```

DelegateCommand.cs

```csharp
using System;
using System.Windows.Input;

namespace MvvmTemplate.Helpers
{
    public class DelegateCommand : ICommand
    {
        private readonly Action _command;
        private readonly Func<bool> _canExecute;
        public event EventHandler CanExecuteChanged
        {
            add { CommandManager.RequerySuggested += value; }
            remove { CommandManager.RequerySuggested -= value; }
        }

        public DelegateCommand(Action command, Func<bool> canExecute = null)
        {
            if (command == null)
                throw new ArgumentNullException();
            _canExecute = canExecute;
            _command = command;
        }

        public void Execute(object parameter)
        {
            _command();
        }

        public bool CanExecute(object parameter)
        {
            return _canExecute == null || _canExecute();
        }

    }
}
```

4. Warto jeszcze dodać do folderu "ViewModels" klasę BaseViewModel, po której będą dziedziczyć nasze przyszłe ViewModels

BaseViewModel.cs:

```csharp
using ClipboardAssistant.Helpers;

namespace ClipboardAssistant.ViewModels
{
    public class BaseViewModel : NotificationObject
    {
    }
}
```

5. Pliki MainWindow.xaml i MainWindow.xaml.cs przenosimy do folderu "Views".

6. Jeszcze tylko podmieniamy ścieżkę do widoku, uruchamianego podczas startu aplikacji.  
Z
`StartupUri="MainWindow.xaml"`
na
`StartupUri="Views\MainWindow.xaml"`

Całość powinna wyglądać tak:

![](/blog/wp-content/uploads/2014/08/2014-08-23-19_18_26-MvvmTemplate-Microsoft-Visual-Studio.png)

To wszystko co trzeba zrobić. Jeśli posiadasz Visual Studio 2012 możesz dodać do niego rozszerzenie [WPF MVVM project template](http://visualstudiogallery.msdn.microsoft.com/970005b8-ee15-4295-9960-375e6ea1276c). Powyższe klasy DelegateCommand i NotificationObject pochodzą właśnie z tego rozszerzenia. W następnych wpisach dokładnie opiszę do czego się ich używa 😉  
**Cały projekt jest dostępny na [GitHub](https://github.com/AdrianRamzes/MvvmTemplate).**

 