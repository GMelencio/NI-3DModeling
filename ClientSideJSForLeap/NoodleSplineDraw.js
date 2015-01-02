/// <reference path="Libs/jquery-2.1.3.min.js" />
/// <reference path="Libs/Leap/leap-0.6.4.js" />
/// <reference path="Libs/THREEJS/three.js" />
/// <reference path="Libs/Leap/leap-plugins-0.1.10.js" />
/// <reference path="Libs/Leap/leap-plugins-0.1.10-utils.js" />
/// <reference path="Libs/Leap/leap-widgets-0.1.0.js" />
/// <reference path="Libs/Leap/leap.rigged-hand-0.1.5.js" />
/// <reference path="Helpers.js" />
/// <reference path="Diagnostics.js" />
/// <reference path="SplineMaker.js" />
/// <reference path="NoodleMaker.js" />

var splineCurve;
var drawnTubes = [];

function TryDrawObject(handGesture) {

    if (handGesture.isInDrawMode) {

        if (!splineCurve) {
            var drawPoint = handGesture.drawPoint;
            splineCurve = new AdaptiveSpline([drawPoint], scene, 5);
        } else {
            splineCurve.AddPoint(handGesture.drawPoint);
        }

        UpdateLabelText(1, "Distance " + splineCurve.DistanceOfEnds());
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
         
            var noodle = drawNoodleFromSpline(splineCurve, 0x708090, 0.8, splineToBeClosed);
            scene.addAndPushToArray(noodle.tubeMesh, drawnTubes);

            var smoothedNoodle = drawNoodleFromSpline(splineCurve, 0xFF0000, 0.1, splineToBeClosed, smoothenSpline);
            scene.addAndPushToArray(smoothedNoodle.tubeMesh, drawnTubes);
            destroySpline();
        }
    }
}

function drawNoodleFromSpline(adaptiveSpline, color, opacity, closingFunction, smoothingFunction) {
    var curve = closingFunction(adaptiveSpline);

    if (smoothingFunction)
        curve = smoothingFunction(curve, 16, 4)

    return new Noodle(curve, color, opacity);
}

function splineToBeClosed(adaptiveSpline) {
    var splinePointDistances = adaptiveSpline.pointDistances;

    var max = splinePointDistances[Math.floor(splinePointDistances.length / 2)];
    var min = Math.min.apply(null, splinePointDistances);

    if (max > splinePointDistances.last()) {
        var currentMin = max;
        var currentMinIndex = splinePointDistances.length - 1;
        for (var i = splinePointDistances.length; i >= splinePointDistances.length - 10; i--) {
            if (splinePointDistances[i]) {
                var lower = Math.min(currentMin, splinePointDistances[i]);
                if (lower < currentMin) {
                    currentMin = lower;
                    currentMinIndex = i;
                }
            }
        }

        return new THREE.ClosedSplineCurve3(adaptiveSpline.curve.points.slice(0, currentMinIndex));
    }

    return adaptiveSpline.curve;
}

function destroySpline() {
    if (splineCurve)
        splineCurve.ClearAll();

    splineCurve = null;
}