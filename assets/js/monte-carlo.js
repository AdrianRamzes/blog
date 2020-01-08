var MonteCarlo = /** @class */ (function () {
    function MonteCarlo() {
        this.allPoints = 0;
        this.hits = 0;
        this.interval = -1;
        this.monteCarloCanvas = document.getElementById("montecarloCanvas");
        this.context = this.monteCarloCanvas.getContext("2d");
        this.context.fillStyle = "#000000";
        this.context.font = "30px Arial";
    }
    MonteCarlo.prototype.nextShot = function () {
        var x = Math.random();
        var y = Math.random();
        if (x * x + y * y < 1) {
            this.context.fillStyle = "#FF0000";
            this.hits++;
        }
        else {
            this.context.fillStyle = "#000000";
        }
        this.allPoints++;
        this.context.fillRect(x * this.monteCarloCanvas.width, y * this.monteCarloCanvas.height, 1, 1);
    };
    MonteCarlo.prototype.work = function (shots) {
        for (var i = 0; i < shots; i++)
            this.nextShot();
        var pi = (this.hits / (this.allPoints | 1)) * 4;
        this.context.fillStyle = "#FFFFFF";
        this.context.fillRect(10, 25, 110, 35);
        this.context.fillStyle = "#000000";
        this.context.fillText(pi.toFixed(5), 10, 50);
    };
    MonteCarlo.prototype.start = function (shots) {
        this.reset();
        var self = this;
        this.interval = setInterval(function () {
            self.work(shots);
        }, 0);
    };
    MonteCarlo.prototype.stop = function () {
        if (this.interval)
            clearInterval(this.interval);
    };
    MonteCarlo.prototype.reset = function () {
        this.stop();
        this.context.clearRect(0, 0, this.monteCarloCanvas.width, this.monteCarloCanvas.height);
        this.allPoints = 0;
        this.hits = 0;
    };
    return MonteCarlo;
}());
var RandomMovements = /** @class */ (function () {
    function RandomMovements() {
        this.points = [];
        this.interval = -1;
        this.randomMovementsCanvas = document.getElementById("randomMovementsCanvas");
        this.context = this.randomMovementsCanvas.getContext("2d");
        this.context.fillStyle = "#FF0000";
        this.context.font = "30px Arial";
    }
    RandomMovements.prototype.drawPoint = function (p) {
        this.context.fillRect(p.x, p.y, p.size, p.size);
    };
    ;
    RandomMovements.prototype.drawFrame = function () {
        var _this = this;
        this.clearCanvas();
        this.points.forEach(function (p) {
            var diffX = _this.getRandom(-1, 1);
            var diffY = _this.getRandom(-1, 1);
            p.x += diffX;
            p.y += diffY;
            p.x = Math.min(Math.max(0, p.x), _this.randomMovementsCanvas.width);
            p.y = Math.min(Math.max(0, p.y), _this.randomMovementsCanvas.height);
            _this.drawPoint(p);
        });
    };
    ;
    RandomMovements.prototype.getRandom = function (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };
    RandomMovements.prototype.addRandomPoints = function (n) {
        for (var i = 0; i < n; i++) {
            var p = {
                x: this.getRandom(0, this.randomMovementsCanvas.width),
                y: this.getRandom(0, this.randomMovementsCanvas.height),
                size: 2
            };
            this.points.push(p);
        }
    };
    ;
    RandomMovements.prototype.clearCanvas = function () {
        this.context.clearRect(0, 0, this.randomMovementsCanvas.width, this.randomMovementsCanvas.height);
    };
    RandomMovements.prototype.start = function (n, delta) {
        var me = this;
        this.addRandomPoints(n);
        this.interval = setInterval(function () {
            var startTime = new Date().getMilliseconds();
            me.drawFrame();
            var endTime = new Date().getMilliseconds();
            var elapsed = endTime - startTime;
            if (elapsed > 0)
                me.points = me.points.slice(delta);
            else
                me.addRandomPoints(delta);
            me.context.fillText("delay:  " + (endTime - startTime) + "ms", 10, 50);
            me.context.fillText("points: " + me.points.length, 10, 80);
        }, 0);
    };
    RandomMovements.prototype.stop = function () {
        if (this.interval)
            clearInterval(this.interval);
    };
    RandomMovements.prototype.reset = function () {
        this.stop();
        this.points = [];
        this.clearCanvas();
    };
    return RandomMovements;
}());
var monteCarlo = new MonteCarlo();
var randomMovements = new RandomMovements();
