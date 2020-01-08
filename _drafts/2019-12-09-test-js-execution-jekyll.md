---
title: 'Metoda Monte-Carlo'
date: 2019-12-09T00:13:47+00:00
author: Adrian Karalus
layout: post
permalink: /2019/12/metoda-monte-carlo/
---
Ostatnio z nudów naklepalem parę dziwactw w JS i w sumie niektóre wyszły spoko, więc chciałem się nimi podzielić.

1. wyznaczanie liczby PI metodą Monte Carlo

```js
let hits = 0;
let total = 0;
let nextShot = function() {
    let x = Math.random();
    let y = Math.random();

    if(x*x+y*y < 1) {
        hits++;
    }
    total++;
};

let work = function(shots) {
    for (let i = 0; i < shots; i++)
        nextShot();
    let pi = (hits/(total | 1)) * 4;
}
```

Efekt jest taki:
<button onclick="monteCarlo.start(1)">Start Slow</button>
<button onclick="monteCarlo.start(1000)">Start Fast</button>
<button onclick="monteCarlo.stop()">Stop</button>
<button onclick="monteCarlo.reset()">Reset</button>
<canvas id="montecarloCanvas" width="600" height="600"
style="border:1px solid #000000;">
Your browser does not support the canvas element.
</canvas>

Randomowe ruchy punktów taki:
<button onclick="randomMovements.start(500, 1)">Start</button>
<button onclick="randomMovements.stop()">Stop</button>
<button onclick="randomMovements.reset()">Reset</button>
<canvas id="randomMovementsCanvas" width="600" height="600"
style="border:1px solid #000000;">
Your browser does not support the canvas element.
</canvas>

<script src="{{ "/assets/js/monte-carlo.js" | relative_url }}"></script>