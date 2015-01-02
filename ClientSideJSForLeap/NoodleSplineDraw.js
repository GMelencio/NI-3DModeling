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
            //mergeSpheresFromSpline(splineCurve, scene);
            var curve = null;
            var closeSplineAtIndex = splineToBeClosed(splineCurve.pointDistances);
            if (closeSplineAtIndex) {
                curve = new THREE.ClosedSplineCurve3(splineCurve.curve.points.slice(0, closeSplineAtIndex));
            } else {
                curve = splineCurve.curve;
            }

            UpdateLabelText(2, "First point " + vectorToXYZString(splineCurve.pointDrawLog[0].position) + " drawn at " + splineCurve.pointDrawLog[0].timestamp);
            UpdateLabelText(3, "Last point " + vectorToXYZString(splineCurve.pointDrawLog.last().position) + " drawn at " + splineCurve.pointDrawLog.last().timestamp);

            var noodle = new Noodle(curve, 0x7080F0, 0.1);
            scene.addAndPushToArray(noodle.tubeMesh, drawnTubes)

            var smoothSpline = smoothenSpline(curve, 16);
            //Have to do it this way because javascript did not like to do much recusion
            for (var i = 0; i < 4; i++){
                smoothSpline = smoothenSpline(smoothSpline, 16);
            }
            var noodle2 = new Noodle(smoothSpline, 0xFF0000, 0.8)
            scene.addAndPushToArray(noodle2.tubeMesh, drawnTubes)
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
            if (splinePointDistances[i]) {
                var lower = Math.min(currentMin, splinePointDistances[i]);
                if (lower < currentMin) {
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