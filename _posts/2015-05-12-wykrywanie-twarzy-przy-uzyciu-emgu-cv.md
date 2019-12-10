---
title: Wykrywanie twarzy przy użyciu Emgu CV
date: 2015-05-12T17:14:18+00:00
author: Adrian Karalus
layout: post
permalink: /2015/05/wykrywanie-twarzy-przy-uzyciu-emgu-cv/
image: /blog/wp-content/uploads/2015/05/blog_facedetection.png
categories:
  - Programowanie
---
W oparciu o aplikację, którą przedstawiałem w poprzednim [wpisie](/blog/2015/04/obraz-z-kamerki-przy-uzyciu-emgu-cv/), zademonstruję jak napisać aplikację wykrywającą twarz przy pomocy biblioteki Emgu CV.  

  
Cały kod bezpośrednio związany z wykrywaniem twarzy można znaleźć w przykładach dostarczonych wraz z biblioteką.

Do projektu poprzedniej aplikacji dodaję jedynie nowy serwis **FaceDetectionService**, który dziedziczy po klasie WebCamService.

Mój pomysł polega na tym, aby rozszerzyć klasę WebCamService o dodatkowy event,

```csharp
public event ImageWithDetectionChangedEventHandler ImageWithDetectionChanged;
public delegate void ImageWithDetectionChangedEventHandler(object sender, Image<Bgr, Byte> image);
```

który ma być *rozszerzeniem* na istniejący już istniejący **ImageChanged**.  
Różnica polega na tym, że przed podniesieniem zdarzenia, zdjęcie przekazywane w parametrze jest dodatkowo obrabiane - rysowane są na nim prostokąty w miejscu wykrycia twarzy.

```csharp
private void InitializeServices()
{
    base.ImageChanged += _webCamService_ImageChanged;
}

private void RaiseImageWithDetectionChangedEvent(Image<Bgr, Byte> image)
{
    if (ImageWithDetectionChanged != null)
    {
        ImageWithDetectionChanged(this, image);
    }
}

private bool isDetecting = false;
private async void _webCamService_ImageChanged(object sender, Image<Bgr, byte> image)
{
    bool isDelayed = false;

    if (!isDetecting)
    {
        isDetecting = true;

        var result = await DetectFacesAsync(image);

        isDelayed = true;
        _faces = result;

        isDetecting = false;
    }

    if (!isDelayed)// to prevent displaing delayed image
    {
        DrawRectangles(image);
        RaiseImageWithDetectionChangedEvent(image);
    }
}

```

### Funkcja wykrywania twarzy
(lekko zmodyfikowana wersja funkcji dostarczonej wraz z przykładami):

```csharp
private void DetectFace(Image<Bgr, Byte> image, List<Rectangle> faces)
{
#if !IOS
    if (GpuInvoke.HasCuda)
    {
        using (GpuCascadeClassifier face = new GpuCascadeClassifier(_faceFileName))
        {
            using (GpuImage<Bgr, Byte> gpuImage = new GpuImage<Bgr, byte>(image))
            using (GpuImage<Gray, Byte> gpuGray = gpuImage.Convert<Gray, Byte>())
            {
                Rectangle[] faceRegion = face.DetectMultiScale(gpuGray, 1.1, 10, Size.Empty);
                faces.AddRange(faceRegion);
            }
        }
    }
    else
#endif
    {
        //Read the HaarCascade objects
        using (CascadeClassifier face = new CascadeClassifier(_faceFileName))
        {
            using (Image<Gray, Byte> gray = image.Convert<Gray, Byte>()) //Convert it to Grayscale
            {
                //normalizes brightness and increases contrast of the image
                gray._EqualizeHist();

                //Detect the faces  from the gray scale image and store the locations as rectangle
                //The first dimensional is the channel
                //The second dimension is the index of the rectangle in the specific channel
                Rectangle[] facesDetected = face.DetectMultiScale(
                    gray,
                    1.1,
                    10,
                    new Size(20, 20),
                    Size.Empty);
                faces.AddRange(facesDetected);
            }
        }
    }
}

```

### Metoda w wersji asynchronicznej:

```csharp
private Task<List<Rectangle>> DetectFacesAsync(Image<Bgr, byte> image)
{
    return Task.Run(() =>
    {
        List<Rectangle> faces = new List<Rectangle>();

        DetectFace(image, faces);

        return faces;
    });
}
```

 

Cały kod jak zawsze dostępny na [GITHUB ](https://github.com/AdrianRamzes/FaceDetection)😉

Efekt na zdjęciu:

![](/blog/wp-content/uploads/2015/05/blog_facedetection.png)

oraz filmie:

[![https://youtu.be/hmy6kFr89Go](https://img.youtube.com/vi/hmy6kFr89Go/0.jpg)](https://www.youtube.com/watch?v=hmy6kFr89Go)