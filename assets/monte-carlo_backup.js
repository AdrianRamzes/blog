var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
ctx.fillStyle = "#000000";
ctx.font = "30px Arial";

var allPoints = 0
var hits = 0;

var nextShot = function() {
    let x = Math.random();
    let y = Math.random();

    if(x*x+y*y < 1) {
        ctx.fillStyle = "#FF0000";
        hits++;
    } else {
        ctx.fillStyle = "#000000";
    }
    allPoints++;
    ctx.fillRect(x*canvas.width, y*canvas.height, 1, 1);
};

var work = function(ms){
    for (let i = 0; i < ms; i++)
        nextShot();
    let pi = (hits/(allPoints | 1)) * 4;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(10, 25, 110, 35);
    ctx.fillStyle = "#000000";
    ctx.fillText(pi.toFixed(5), 10, 50);
}

var interval = null;
function start(ms) {
    reset();
    interval = setInterval(function() {
        work(ms);
    }, 0);
}

function stop() {
    if(interval)
        clearInterval(interval);
}

function reset() {
    stop();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    allPoints = 0;
    hits = 0;
}
// var lastAllPoint = 0;
// setInterval(function(){
//     ctx.fillStyle = "#FFFFFF";
//     ctx.fillRect(10, 125, 110, 35);
//     ctx.fillStyle = "#000000";
//     ctx.fillText("" + (allPoints - lastAllPoint), 10, 150);
//     lastAllPoint = allPoints;
// }, 1000);

