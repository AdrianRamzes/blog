var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
ctx.fillStyle = "#000000";
ctx.font = "30px Arial";

var allPoints = 0
var hits = 0;

var nextShot = function() {
    var x = Math.random();
    var y = Math.random();

    if(x*x+y*y < 1) {
        ctx.fillStyle = "#FF0000";
        hits++;
    } else {
        ctx.fillStyle = "#000000";
    }
    allPoints++;
    ctx.fillRect(x*600, y*600, 1, 1);
};

var work = function(){
    for (let i = 0; i < 1000; i++)
        nextShot();
    var pi = (hits/(allPoints | 1)) * 4;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(10, 25, 110, 35);
    ctx.fillStyle = "#000000";
    ctx.fillText(pi.toFixed(5), 10, 50);
}

setInterval(function(){
    //for (let i = 0; i < 1000; i++)
        work();
}, 0);

var lastAllPoint = 0;
setInterval(function(){
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(10, 125, 110, 35);
    ctx.fillStyle = "#000000";
    ctx.fillText("" + (allPoints - lastAllPoint), 10, 150);
    lastAllPoint = allPoints;
}, 1000);