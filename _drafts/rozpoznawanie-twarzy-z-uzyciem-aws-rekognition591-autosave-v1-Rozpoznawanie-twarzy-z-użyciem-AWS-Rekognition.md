---
id: 619
title: Rozpoznawanie twarzy z użyciem AWS Rekognition
date: 2017-05-03T21:38:35+00:00
author: admin
layout: revision
guid: http://www.karalus.eu/2017/05/591-autosave-v1/
permalink: /2017/05/591-autosave-v1/
---
W grudniu 2016 roku Amazon zapowiedział, że AWS zostanie wzbogacony o nową usługę &#8211; AWS Rekognition. Pozwala ona na korzystanie z ich sztucznej sieci neuronowej do rozpoznawania zdjęć. Uważam, że jest to świetne rozwiązanie dla małych firm i startupów, które nie mają czasu, środków ani potężnej bazy zdjęć, aby wytrenować własną sieć neuronową do takiego poziomu by była w stanie z dużą dokładnością rozpoznawać przedmioty na zdjęciu. Do korzystania z AWS Rekognition nie trzeba wiedzieć czym jest uczenie maszynowe, deep learning ani sztuczna sieć neuronowa. Jeśli chcemy korzystać z dobrodziejstw sztucznej inteligencji AWS Rekognition jest jednym z najprostszych sposobów. Oczywiście Amazon nie jest jedyną firmą, która daje takie możliwości, jest też <a href="https://cloud.google.com/vision/" target="_blank" rel="noopener noreferrer">Google Cloud</a> czy <a href="https://www.microsoft.com/cognitive-services/en-us/face-api" target="_blank" rel="noopener noreferrer">Microsoft Azure</a>.

Takim oto demo&nbsp;można pobawić się u Google&#8217;a:

[<img class="size-full wp-image-601 aligncenter" src="https://i0.wp.com/www.karalus.eu/wp-content/uploads/2017/05/chrome_2017-05-03_13-49-35.png?resize=709%2C439" alt="" width="709" height="439" srcset="https://i0.wp.com/www.karalus.eu/wp-content/uploads/2017/05/chrome_2017-05-03_13-49-35.png?w=709 709w, https://i0.wp.com/www.karalus.eu/wp-content/uploads/2017/05/chrome_2017-05-03_13-49-35.png?resize=300%2C186 300w" sizes="(max-width: 709px) 100vw, 709px" data-recalc-dims="1" />](https://i0.wp.com/www.karalus.eu/wp-content/uploads/2017/05/chrome_2017-05-03_13-49-35.png)

&nbsp;

Trudno nie być pod wrażeniem, skoro została rozpoznana nawet rasa psa 😉

Jak zacząć pracę z AWS Rekognition?  
Po pierwsze musimy mieć <a href="http://docs.aws.amazon.com/AmazonSimpleDB/latest/DeveloperGuide/AboutAWSAccounts.html" target="_blank" rel="noopener noreferrer">konto AWS</a> i utworzonego użytkownika z dostępem do usługi AWS Rekognition.  
Instrukcje, krok po kroku znajdziecie w <a href="http://docs.aws.amazon.com/rekognition/latest/dg/setting-up.html" target="_blank" rel="noopener noreferrer">dokumentacji AWSa</a>. Dla utworzonego użytkownika generujemy AWSAccessKeyId oraz AWSSecretAccessKey. O tym jak korzystać z AccessKeyId oraz SecretAccessKey można przeczytać [tutaj](http://docs.aws.amazon.com/sdk-for-net/v3/developer-guide/net-dg-config-creds.html). Generalnie, są trzy sposoby &#8211; ja używam "Credentials File", jednak nie ma to większego znaczenia. Najważniejsze to pamiętać o tym, by przypadkiem nikomu nie udostępniać tych danych, ponieważ może to nas kosztować wiele tysięcy $&nbsp;;). Po GitHubie, krążą boty, które szukają kluczy AWS&#8217;owych commitowanych&nbsp;przez nieostrożnych programistów.

  1. Tworzymy nowy projekt WPF! (w tym przykładzie będę opierał się sporo na projekcie z mojego <a href="http://www.karalus.eu/2015/05/wykrywanie-twarzy-przy-uzyciu-emgu-cv/" target="_blank" rel="noopener noreferrer">poprzedniego wpisu</a>)
  2. Do projektu, przy użyciu nuget package manager&#8217;a dodajemy najnowszą wersję AWSSDK.Rekognition (3.3.x)[<img class="size-full wp-image-593 aligncenter" src="https://i0.wp.com/www.karalus.eu/wp-content/uploads/2017/05/devenv_2017-05-02_13-48-37.png?resize=808%2C194" alt="" width="808" height="194" srcset="https://i0.wp.com/www.karalus.eu/wp-content/uploads/2017/05/devenv_2017-05-02_13-48-37.png?w=808 808w, https://i0.wp.com/www.karalus.eu/wp-content/uploads/2017/05/devenv_2017-05-02_13-48-37.png?resize=300%2C72 300w, https://i0.wp.com/www.karalus.eu/wp-content/uploads/2017/05/devenv_2017-05-02_13-48-37.png?resize=768%2C184 768w" sizes="(max-width: 808px) 100vw, 808px" data-recalc-dims="1" />](https://i0.wp.com/www.karalus.eu/wp-content/uploads/2017/05/devenv_2017-05-02_13-48-37.png) 
    &nbsp;oraz EmguCV (3.1.x.x)
    
    [<img class="size-full wp-image-594 aligncenter" src="https://i2.wp.com/www.karalus.eu/wp-content/uploads/2017/05/devenv_2017-05-02_13-46-50.png?resize=844%2C206" alt="" width="844" height="206" srcset="https://i2.wp.com/www.karalus.eu/wp-content/uploads/2017/05/devenv_2017-05-02_13-46-50.png?w=844 844w, https://i2.wp.com/www.karalus.eu/wp-content/uploads/2017/05/devenv_2017-05-02_13-46-50.png?resize=300%2C73 300w, https://i2.wp.com/www.karalus.eu/wp-content/uploads/2017/05/devenv_2017-05-02_13-46-50.png?resize=768%2C187 768w" sizes="(max-width: 844px) 100vw, 844px" data-recalc-dims="1" />  
](https://i2.wp.com/www.karalus.eu/wp-content/uploads/2017/05/devenv_2017-05-02_13-46-50.png) </li> 
    
      * Zgodnie z wybraną strategią używania kluczy, edytujemy plik App.config. W moim przypadku jest to podanie ścieżki do pliku "credentials"
      * Korzystanie z AWSSDK.Rekognition jest banalnie proste: <pre class="brush: csharp; title: ; notranslate" title="">public class RekognitionService
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
                Attributes = new List&amp;lt;string&amp;gt; { &quot;ALL&quot; },
                Image = new Amazon.Rekognition.Model.Image() { Bytes = memoryStream }
            });

            return result;
        }
    }
</pre>
        
        Do wcześniej już opisywanego projektu dodałem klasę RekognitionService, która implementuje metodę Recognize. Domyślnie metody przyjmują stream pliku w formacie JPEG, użyłem MemoryStream, aby umożliwić przerobienie bitmapy na jpeg "w locie" bez konieczności zapisywania pliku na dysku.
        
        W odpowiedzi na żądanie dostajemy już zdeserializowany obiekt &#8211; DetectFaceResponse, w którym znajdziemy współrzędne znaczników (Landmarks &#8211; na zdjęciu poniżej kolor niebieski), BoundingBox z twarzą oraz informację o wystąpieniu lub braku dodatkowych cechy np. broda, okulary, wąsy.
        
        Demo, które napisałem umożliwia zrobienie zdjęcia przy pomocy kamerki internetowej oraz wyświetlenie szczegółów dot. wykrytej na zdjęciu twarzy.
        
        [<img class="size-full wp-image-600 aligncenter" src="https://i0.wp.com/www.karalus.eu/wp-content/uploads/2017/05/AWSRekognitionDemo_2017-05-02_14-32-14.png?resize=1036%2C593" alt="" width="1036" height="593" srcset="https://i0.wp.com/www.karalus.eu/wp-content/uploads/2017/05/AWSRekognitionDemo_2017-05-02_14-32-14.png?w=1036 1036w, https://i0.wp.com/www.karalus.eu/wp-content/uploads/2017/05/AWSRekognitionDemo_2017-05-02_14-32-14.png?resize=300%2C172 300w, https://i0.wp.com/www.karalus.eu/wp-content/uploads/2017/05/AWSRekognitionDemo_2017-05-02_14-32-14.png?resize=768%2C440 768w, https://i0.wp.com/www.karalus.eu/wp-content/uploads/2017/05/AWSRekognitionDemo_2017-05-02_14-32-14.png?resize=1024%2C586 1024w" sizes="(max-width: 1000px) 100vw, 1000px" data-recalc-dims="1" />  
](https://i0.wp.com/www.karalus.eu/wp-content/uploads/2017/05/AWSRekognitionDemo_2017-05-02_14-32-14.png)  
        Cały kod dostępny na <a href="https://github.com/RamzesBlog/AWSRekognitionDemo" target="_blank" rel="noopener noreferrer">GitHub</a>.</li> </ol>