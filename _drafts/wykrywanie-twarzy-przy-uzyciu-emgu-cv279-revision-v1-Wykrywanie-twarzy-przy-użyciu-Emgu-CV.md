---
id: 294
title: Wykrywanie twarzy przy użyciu Emgu CV
date: 2015-05-14T16:53:38+00:00
author: Adrian Karalus
layout: revision
guid: http://www.karalus.eu/2015/05/279-revision-v1/
permalink: /2015/05/279-revision-v1/
---
W oparciu o aplikację, którą przedstawiałem w poprzednim <a href="http://www.karalus.eu/2015/04/obraz-z-kamerki-przy-uzyciu-emgu-cv/" target="_blank">wpisie</a>, zademonstruję jak napisać aplikację wykrywającą twarz przy pomocy biblioteki Emgu CV.  
<!--more-->

  
Cały kod bezpośrednio związany z wykrywaniem twarzy można znaleźć w przykładach dostarczonych wraz z biblioteką.

Do projektu poprzedniej aplikacji dodaję jedynie nowy serwis &#8222;FaceDetectionService&#8221;, który dziedziczy po klasie WebCamService.

Mój pomysł polega na tym, aby rozszerzyć klasę WebCamService o dodatkowy event,

<pre class="brush: csharp; title: ; notranslate" title="">public event ImageWithDetectionChangedEventHandler ImageWithDetectionChanged;
        public delegate void ImageWithDetectionChangedEventHandler(object sender, Image&lt;Bgr, Byte&gt; image);
</pre>

który ma być &#8222;rozszerzeniem&#8221; na istniejący już istniejący &#8222;ImageChanged&#8221;.  
Różnica polega na tym, że przed podniesieniem zdarzenia, zdjęcie przekazywane w parametrze jest dodatkowo obrabiane &#8211; rysowane są na nim prostokąty w miejscu wykrycia twarzy.

<pre class="brush: csharp; title: ; notranslate" title="">private void InitializeServices()
        {
            base.ImageChanged += _webCamService_ImageChanged;
        }

        private void RaiseImageWithDetectionChangedEvent(Image&lt;Bgr, Byte&gt; image)
        {
            if (ImageWithDetectionChanged != null)
            {
                ImageWithDetectionChanged(this, image);
            }
        }

        private bool isDetecting = false;
        private async void _webCamService_ImageChanged(object sender, Image&lt;Bgr, byte&gt; image)
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

</pre>

**Funkcja wykrywania twarzy** (lekko zmodyfikowana wersja funkcji dostarczonej wraz z przykładami):

<pre class="brush: csharp; title: ; notranslate" title="">private void DetectFace(Image&lt;Bgr, Byte&gt; image, List&lt;Rectangle&gt; faces)
        {
#if !IOS
            if (GpuInvoke.HasCuda)
            {
                using (GpuCascadeClassifier face = new GpuCascadeClassifier(_faceFileName))
                {
                    using (GpuImage&lt;Bgr, Byte&gt; gpuImage = new GpuImage&lt;Bgr, byte&gt;(image))
                    using (GpuImage&lt;Gray, Byte&gt; gpuGray = gpuImage.Convert&lt;Gray, Byte&gt;())
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
                    using (Image&lt;Gray, Byte&gt; gray = image.Convert&lt;Gray, Byte&gt;()) //Convert it to Grayscale
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

</pre>

**Metoda w wersji asynchronicznej:**

<pre class="brush: csharp; title: ; notranslate" title="">private Task&lt;List&lt;Rectangle&gt;&gt; DetectFacesAsync(Image&lt;Bgr, byte&gt; image)
        {
            return Task.Run(() =&gt;
            {
                List&lt;Rectangle&gt; faces = new List&lt;Rectangle&gt;();

                DetectFace(image, faces);

                return faces;
            });
        }
</pre>

&nbsp;

Cały kod jak zawsze dostępny na <a href="https://github.com/RamzesBlog/FaceDetection" target="_blank">GITHUB </a>😉

Efekt na zdjęciu:

[<img class="alignnone size-full wp-image-282" src="https://i2.wp.com/www.karalus.eu/wp-content/uploads/2015/05/blog_facedetection.png?resize=657%2C437" alt="blog_facedetection" width="657" height="437" srcset="https://i2.wp.com/www.karalus.eu/wp-content/uploads/2015/05/blog_facedetection.png?w=657 657w, https://i2.wp.com/www.karalus.eu/wp-content/uploads/2015/05/blog_facedetection.png?resize=300%2C200 300w" sizes="(max-width: 657px) 100vw, 657px" data-recalc-dims="1" />](https://i2.wp.com/www.karalus.eu/wp-content/uploads/2015/05/blog_facedetection.png)

oraz filmie:

<span class="embed-youtube" style="text-align:center; display: block;"></span>