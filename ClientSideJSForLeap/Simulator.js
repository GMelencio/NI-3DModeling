var animationHandle;
var FPS = 60;
var numerOfMovements = 1000;

var xPos = -150
var yPos = -60
var zPos = -50

var xIncrement = 5;
var yIncrement = 3;
var zIncrement = 2;

var X_NOISE = 21
var Y_NOISE = 13
var Z_NOISE = 8


for(i = 0; i <= numerOfMovements; i++){
    xPos = xPos + xIncrement + X_NOISE / 2 - X_NOISE * Math.random();
    yPos = yPos + yIncrement + Y_NOISE / 2 - Y_NOISE * Math.random();
    zPos = zPos + zIncrement + Z_NOISE / 2 - Z_NOISE * Math.random();

    var simulatedHandGesture = new SimulatedHandGesture(xPos, yPos, zPos);
    TryDrawObject(simulatedHandGesture);
}

function SimulatedHandGesture(x, y, z) {
    this.isInDrawMode = true;
    this.isInClearMode = false;

    this.drawPoint = new THREE.Vector3(x, y, z);
}
SimulatedHandGesture.prototype = new DrawRequest();