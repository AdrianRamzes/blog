class MonteCarlo {

    private monteCarloCanvas: HTMLCanvasElement;
    private context: any;
    private allPoints : number = 0
    private hits : number = 0;

    constructor() {
        this.monteCarloCanvas = <HTMLCanvasElement> document.getElementById("montecarloCanvas");
        this.context = this.monteCarloCanvas.getContext("2d");
        this.context.fillStyle = "#000000";
        this.context.font = "30px Arial";
    }

    nextShot() : void {
        let x = Math.random();
        let y = Math.random();

        if(x*x + y*y < 1) {
            this.context.fillStyle = "#FF0000";
            this.hits++;
        } else {
            this.context.fillStyle = "#000000";
        }
        this.allPoints++;
        this.context.fillRect(x*this.monteCarloCanvas.width, y*this.monteCarloCanvas.height, 1, 1);
    }

    work(shots: number) : void {
        for (let i = 0; i < shots; i++)
            this.nextShot();
        let pi = (this.hits/(this.allPoints | 1)) * 4;
        this.context.fillStyle = "#FFFFFF";
        this.context.fillRect(10, 25, 110, 35);
        this.context.fillStyle = "#000000";
        this.context.fillText(pi.toFixed(5), 10, 50);
    }

    private interval: number = -1;
    start(shots) : void {
        this.reset();
        let self = this;
        this.interval = setInterval(function() {
            self.work(shots);
        }, 0);
    }

    stop() : void {
        if(this.interval)
            clearInterval(this.interval);
    }

    reset() : void {
        this.stop();
        this.context.clearRect(0, 0, this.monteCarloCanvas.width, this.monteCarloCanvas.height);
        this.allPoints = 0;
        this.hits = 0;
    }
// var lastAllPoint = 0;
// setInterval(function(){
//     ctx.fillStyle = "#FFFFFF";
//     ctx.fillRect(10, 125, 110, 35);
//     ctx.fillStyle = "#000000";
//     ctx.fillText("" + (allPoints - lastAllPoint), 10, 150);
//     lastAllPoint = allPoints;
// }, 1000);
}

class RandomMovements {
    private randomMovementsCanvas: HTMLCanvasElement;
    private context: any;
    private points = [];

    constructor() {
        this.randomMovementsCanvas = <HTMLCanvasElement> document.getElementById("randomMovementsCanvas");
        this.context = this.randomMovementsCanvas.getContext("2d");
        this.context.fillStyle = "#FF0000";
        this.context.font = "30px Arial";
    }

    private drawPoint(p): void {
        this.context.fillRect(p.x, p.y, p.size, p.size);
    };

    private drawFrame(): void {
        this.clearCanvas();

        this.points.forEach(p => {
            let diffX = this.getRandom(-1, 1);
            let diffY = this.getRandom(-1, 1);

            p.x += diffX;
            p.y += diffY;

            p.x = Math.min(Math.max(0, p.x), this.randomMovementsCanvas.width);
            p.y = Math.min(Math.max(0, p.y), this.randomMovementsCanvas.height);

            this.drawPoint(p);
        });
    };

    private getRandom(min, max) {
        return Math.floor(Math.random() * (max - min + 1) ) + min;
    }

    private addRandomPoints(n) {
        for (let i = 0; i < n; i++) {
            let p = {
                x: this.getRandom(0, this.randomMovementsCanvas.width),
                y: this.getRandom(0, this.randomMovementsCanvas.height),
                size: 2,
            }
            this.points.push(p);
        }
    };

    private clearCanvas() {
        this.context.clearRect(0, 0, this.randomMovementsCanvas.width, this.randomMovementsCanvas.height);
    }

    private interval: number = -1;
    start(n, delta) {
        let me = this;
        this.addRandomPoints(n);
        this.interval = setInterval(function(){
            let startTime = new Date().getMilliseconds();
            me.drawFrame();
            let endTime = new Date().getMilliseconds();
            let elapsed = endTime-startTime;
            if(elapsed > 0)
                me.points = me.points.slice(delta);
            else
                me.addRandomPoints(delta);
            me.context.fillText("delay:  " + (endTime-startTime) + "ms", 10, 50);
            me.context.fillText("points: " + me.points.length, 10, 80);
        }, 0);
    }

    stop() {
        if(this.interval)
            clearInterval(this.interval);
    }

    reset() {
        this.stop();
        this.points = [];
        this.clearCanvas();
    }
}

var monteCarlo = new MonteCarlo();
var randomMovements = new RandomMovements();