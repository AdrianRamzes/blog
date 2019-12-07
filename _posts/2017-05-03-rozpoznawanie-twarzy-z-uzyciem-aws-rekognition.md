---
title: Rozpoznawanie twarzy z użyciem AWS Rekognition
date: 2017-05-03T21:08:10+00:00
author: Adrian Karalus
layout: post
permalink: /2017/05/rozpoznawanie-twarzy-z-uzyciem-aws-rekognition/
image: /blog/wp-content/uploads/2017/05/AWSRekognitionDemo_2017-05-02_14-32-14.png
categories:
  - Programowanie
tags:
  - aws
  - face
  - google cloud
  - microsoft azure
  - recognition
  - rekognition
  - rozpoznawanie
  - twarzy
---
W grudniu 2016 roku Amazon zapowiedział, że AWS zostanie wzbogacony o nową usługę - AWS Rekognition. Pozwala ona na korzystanie z ich sztucznej sieci neuronowej do rozpoznawania zdjęć. Uważam, że jest to świetne rozwiązanie dla małych firm i startupów, które nie mają czasu, środków ani potężnej bazy zdjęć, aby wytrenować własną sieć neuronową do takiego poziomu by była w stanie z dużą dokładnością rozpoznawać przedmioty na zdjęciu. Do korzystania z AWS Rekognition nie trzeba wiedzieć czym jest uczenie maszynowe, deep learning ani sztuczna sieć neuronowa. Jeśli chcemy korzystać z dobrodziejstw sztucznej inteligencji AWS Rekognition jest jednym z najprostszych sposobów. Oczywiście Amazon nie jest jedyną firmą, która daje takie możliwości, jest też <a href="https://cloud.google.com/vision/" target="_blank" rel="noopener noreferrer">Google Cloud</a> czy <a href="https://www.microsoft.com/cognitive-services/en-us/face-api" target="_blank" rel="noopener noreferrer">Microsoft Azure</a>.

Takim oto demo można pobawić się u Google'a:

![](/blog/wp-content/uploads/2017/05/chrome_2017-05-03_13-49-35.png)

Trudno nie być pod wrażeniem, skoro została rozpoznana nawet rasa psa 😉

Jak zacząć pracę z AWS Rekognition?  
Po pierwsze musimy mieć <a href="http://docs.aws.amazon.com/AmazonSimpleDB/latest/DeveloperGuide/AboutAWSAccounts.html" target="_blank" rel="noopener noreferrer">konto AWS</a> i utworzonego użytkownika z dostępem do usługi AWS Rekognition.  
Instrukcje, krok po kroku znajdziecie w <a href="http://docs.aws.amazon.com/rekognition/latest/dg/setting-up.html" target="_blank" rel="noopener noreferrer">dokumentacji AWSa</a>. Dla utworzonego użytkownika generujemy AWSAccessKeyId oraz AWSSecretAccessKey. O tym jak korzystać z AccessKeyId oraz SecretAccessKey można przeczytać [tutaj](http://docs.aws.amazon.com/sdk-for-net/v3/developer-guide/net-dg-config-creds.html). Generalnie, są trzy sposoby - ja używam "Credentials File", jednak nie ma to większego znaczenia. Najważniejsze to pamiętać o tym, by przypadkiem nikomu nie udostępniać tych danych, ponieważ może to nas kosztować wiele tysięcy $ ;). Po GitHubie, krążą boty, które szukają kluczy AWS'owych commitowanych przez nieostrożnych programistów.

  1. Tworzymy nowy projekt WPF! (w tym przykładzie będę opierał się sporo na projekcie z mojego <a href="/blog/2015/05/wykrywanie-twarzy-przy-uzyciu-emgu-cv/" target="_blank" rel="noopener noreferrer">poprzedniego wpisu</a>)
  2. Do projektu, przy użyciu nuget package manager'a dodajemy najnowszą wersję AWSSDK.Rekognition (3.3.x)![](/blog/wp-content/uploads/2017/05/devenv_2017-05-02_13-48-37.png) 

oraz EmguCV (3.1.x.x)

![](/blog/wp-content/uploads/2017/05/devenv_2017-05-02_13-46-50.png)
    
* Zgodnie z wybraną strategią używania kluczy, edytujemy plik App.config. W moim przypadku jest to podanie ścieżki do pliku "credentials"
* Korzystanie z AWSSDK.Rekognition jest banalnie proste:

```csharp
public class RekognitionService
{
    AmazonRekognitionClient _client;

    public RekognitionService()
    {
        _client = new AmazonRekognitionClient();
    }

    public DetectFacesResponse Recognize(Bitmap image)
    {
        MemoryStream memoryStream = new MemoryStream();

        image.Save(memoryStream, System.Drawing.Imaging.ImageFormat.Jpeg);

        var result = _client.DetectFaces(new DetectFacesRequest()
        {
            Attributes = new List<string> { "ALL" },
            Image = new Amazon.Rekognition.Model.Image() { Bytes = memoryStream }
        });

        return result;
    }
}
```

Do wcześniej już opisywanego projektu dodałem klasę RekognitionService, która implementuje metodę Recognize. Domyślnie metody przyjmują stream pliku w formacie JPEG, użyłem MemoryStream, aby umożliwić przerobienie bitmapy na jpeg "w locie" bez konieczności zapisywania pliku na dysku.
        
W odpowiedzi na żądanie dostajemy już zdeserializowany obiekt - DetectFaceResponse, w którym znajdziemy współrzędne znaczników (Landmarks - na zdjęciu poniżej kolor niebieski), BoundingBox z twarzą oraz informację o wystąpieniu lub braku dodatkowych cechy np. broda, okulary, wąsy.
        
Demo, które napisałem umożliwia zrobienie zdjęcia przy pomocy kamerki internetowej oraz wyświetlenie szczegółów dot. wykrytej na zdjęciu twarzy.
        
![](/blog/wp-content/uploads/2017/05/AWSRekognitionDemo_2017-05-02_14-32-14.png)

Cały kod dostępny na <a href="https://github.com/AdrianRamzes/AWSRekognitionDemo" target="_blank" rel="noopener noreferrer">GitHub</a>.