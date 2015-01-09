/// <reference path="Libs/jquery-2.1.3.min.js" />
/// <reference path="Libs/Leap/leap-0.6.4.js" />
/// <reference path="Libs/THREEJS/three.js" />
/// <reference path="Libs/Leap/leap-plugins-0.1.10.js" />
/// <reference path="Libs/Leap/leap-plugins-0.1.10-utils.js" />
/// <reference path="Libs/Leap/leap-widgets-0.1.0.js" />
/// <reference path="Libs/Leap/leap.rigged-hand-0.1.5.js" />
/// <reference path="Helpers.js" />
/// <reference path="Diagnostics.js" />
/// <reference path="DrawingHelper.js" />
/// <reference path="SplineMaker.js" />

var clock = new THREE.Clock();

var drawPositions = [];

var drawCounter = 0;
var splineCurve;
var drawnTubes = [];

function TryDrawObject(handGesture) {

    if (handGesture.isInDrawMode) {
        if (!clock.running)
            clock.start();

        if (!splineCurve) {
            var drawPoint = handGesture.drawPoint;
            splineCurve = new AdaptiveSpline([drawPoint], scene, 5);
        } else {
            splineCurve.AddPoint(handGesture.drawPoint);
        }
        
        GetLabel(1).updateText("Distance " + splineCurve.DistanceOfEnds());
    }
    else if (handGesture.isInClearMode) {
        function removeFromScene(object, number, array) {
            scene.remove(object);
        }

        drawnTubes.forEach(removeFromScene);
        drawnTubes = [];
    }
    else {
        //TODO: add tolerances to prevent stop drawing if it was only momentary (i.e. bad read)
        if (splineCurve) {
            //mergeSpheresFromSpline(splineCurve, scene);
            var curve = null;
            var closeSplineAtIndex = splineToBeClosed(splineCurve.pointDistances);
            if (closeSplineAtIndex) {
                curve = new THREE.ClosedSplineCurve3(splineCurve.curve.points.slice(0, closeSplineAtIndex));
            } else {
                curve = splineCurve.curve;
            }
            
            var tube = createTube(curve, 0x7080d0, 50, 3, 4, 1);
            //scene.addAndPushToArray(tube, drawnTubes)
            scene.add(tube);
            drawnTubes.push(tube);

            //var smoothedTube = createTube(curve, 0x00fff0, 50, 3, 4, 1);
            //scene.addAndPushToArray(smoothedTube, drawnTubes)
            //scene.add(smoothedTube);
            //drawnTubes.push(smoothedTube);
            destroySpline();
        }
    }
}


function splineToBeClosed(splinePointDistances) {
    var max = splinePointDistances[Math.floor(splinePointDistances.length / 2)];
    var min = Math.min.apply(null, splinePointDistances);

    if (max > splinePointDistances.last()) {
        var currentMin = max;
        var currentMinIndex = splinePointDistances.length - 1;
        for (var i = splinePointDistances.length; i >= splinePointDistances.length - 10; i--) {
            if (splinePointDistances[i]){
                var lower = Math.min(currentMin, splinePointDistances[i]);
                if (lower < currentMin){
                    currentMin = lower;
                    currentMinIndex = i;
                }
            }
        }

        return currentMinIndex;
    }
    
    return null;
}

function destroySpline() {
    if (splineCurve)
        splineCurve.ClearAll();

    splineCurve = null;
}

function LoopLogEntry(timeEntered) {
    this.logTime = timeEntered;
    this.logPosition = null;
}

function GestureLogEntry(currPos) {
    this.logPosition = currPos
}
GestureLogEntry.prototype = new LoopLogEntry(clock.getElapsedTime())

//Draws a 3D dimensional object (sphere for now) of a given size and at the specified screen position
function createBox(size, xpos, ypos, zpos, meshColor) {
    var geom = new THREE.BoxGeometry(size, size, size);
    var material = new THREE.MeshNormalMaterial(meshColor)
    material
    var mesh = new THREE.Mesh(geom, material)

    mesh.position.x = xpos;
    mesh.position.y = ypos;
    mesh.position.z = zpos;

    //Unsure if still needed:
    //sphere.updateMatrix();
    //sphere.matrixAutoUpdate = false;
    return mesh;
}


function getCurrentAverageDeltas() {
    var totalClockDeltas = 0;
    for (i = 0; i < drawPositions.length; i++) {
        totalClockDeltas = parseFloat(totalClockDeltas) + parseFloat(drawPositions[i].time);
    }

    return (totalClockDeltas / drawPositions.length);
}

function getSmoothedPosition() {
    var totalClockDeltas = 0;
    for (i = 0; i < drawPositions.length; i++) {
        totalClockDeltas = parseFloat(totalClockDeltas) + parseFloat(drawPositions[i].time);
    }

    return (totalClockDeltas / drawPositions.length);
}

function writeLastFewMeasurements(count) {

    var measurements = "Measurements: "

    for (i = drawPositions.length - count; i <= drawPositions.length - 1; i++) {
        if (i > 0) {
            measurements = measurements + drawPositions[i].time + ", ";
        }
    }

    updateCoordsLabel("fingercoords", measurements);
}

//Create a buffer of time vs position objects to define whether or not the previous point should be connected
function CreateDrawPositionLog(timeStamp, currentPosition) {
    var drawPositionLog = {
        time: timeStamp,
        position: currentPosition
    }

    return drawPositionLog;
}
