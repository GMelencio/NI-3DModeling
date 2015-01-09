/// <reference path="Libs/THREEJS/three.js" />

var startVector = new THREE.Vector3(-200, -30, -15);
var endVector = new THREE.Vector3(250, 100, -15);

var X_NOISE = 45
var Y_NOISE = 100
var Z_NOISE = 75

function RunSimulation() {

    var spline = drawCrookedSpline(startVector, endVector);

    for (i = 0; i < spline.points.length; i++) {
        xPos = spline.points[i].x;
        yPos = spline.points[i].y;
        zPos = spline.points[i].z;
        
        TryDrawObject(new SimulatedHandGesture(xPos, yPos, zPos));
    }

    var simulatedHandGesture = new SimulatedHandGesture(0, 0, 0);
    simulatedHandGesture.isInDrawMode = false;
    TryDrawObject(simulatedHandGesture);
}

//Creates a straight spline and then makes it crooked by breaking up the segments and introducing noise
function drawCrookedSpline(startVector, endVector) {
    var mySpline = new THREE.SplineCurve3([startVector, endVector]);

    mySpline.updateArcLengths();

    var arcLen = mySpline.getLength();

    arcLen = Math.floor(arcLen / 8);

    var points = mySpline.getPoints(arcLen);

    var crookedSpline = new THREE.SplineCurve3([startVector]);

    for (var i = 1; i < points.length - 1; i++) {

        var xcoord = points[i].x + X_NOISE / 2 - X_NOISE * Math.random()
        var ycoord = points[i].y + Y_NOISE / 2 - Y_NOISE * Math.random();
        var zcoord = points[i].z + Z_NOISE / 2 - Z_NOISE * Math.random();

        crookedSpline.points.push(new THREE.Vector3(xcoord, ycoord, zcoord));
    }

    crookedSpline.points.push(endVector);

    return crookedSpline;
}

//Override of simulated hand gesture
function SimulatedHandGesture(x, y, z) {
    this.isInDrawMode = true;
    this.isInClearMode = false;

    this.drawPoint = new THREE.Vector3(x, y, z);
}
SimulatedHandGesture.prototype = new DrawRequest();