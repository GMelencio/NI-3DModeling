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
var pinchSpheres = [];
var drawRawNoodles = true;
var drawSmoothedNoodles = false;
var selectedTube = null;

function PinchSphere(position, radius, persistCount) {
    var numFramesAlive = persistCount;
    this.sphere = createSphere(position, radius, 8, 8, { color: 0x00ff00, opacity: 0.2, transparent: true});

    this.updateToRemove = function () {
        numFramesAlive--;
        return (numFramesAlive <= 0);
    }
}

function SelectedTube(tube) {
    this.oldColor = tube.children[0].material.color;
    tube.children[0].material.color.setHex(0xdf0000);
    this.mesh = tube;

    this.revertToUnselected = function () {
        this.mesh.children[0].material.color.setHex(0x708090);
    }
}

var prevPalmPosition = null;
var prevPalmNormal = null;

function TryDrawObject(handGesture) {
    pinchSpheres.forEach(removePinchSpheresFromScene);
    UpdateLabelText(2, "");

    if (handGesture.isPinching) {
        if (!selectedTube) {
            var pinchBall = new PinchSphere(handGesture.pinchSpace.pinchCenter, 3, 45);
            pinchSpheres.push(pinchBall);
            scene.add(pinchBall.sphere);

            var p1 = handGesture.pinchSpace.pincherPosition;
            var p2 = handGesture.pinchSpace.thumbPosition;

            var dir = new THREE.Vector3();
            dir.sub(p1, p2).normalize();

            var raycaster = new THREE.Raycaster(p2, dir, 0, handGesture.pinchSpace.pinchRadius * 40);


            drawnTubes.forEach(
                function (tube, number, array) {
                    var intersection = raycaster.intersectObject(tube, true);
                    if (intersection.length > 0) {
                        selectedTube = new SelectedTube(tube);
                        UpdateLabelText(2, "Tube Intersected at " + handGesture.pinchSpace.pinchCenter);
                    }
                }
            );
        }
        else {
            if (prevPalmPosition && prevPalmNormal) {
                selectedTube.mesh.translateX(handGesture.palmPosition[0] - prevPalmPosition[0]);
                selectedTube.mesh.translateY(handGesture.palmPosition[1] - prevPalmPosition[1]);
                selectedTube.mesh.translateZ(handGesture.palmPosition[2] - prevPalmPosition[2]);
                
                
            }
        }

        prevPalmPosition = handGesture.palmPosition;
        prevPalmNormal = handGesture.palmNormal;
    }
    else {
        if (selectedTube) {
            selectedTube.revertToUnselected();
            selectedTube = null;
        }

        if (handGesture.isInDrawMode) {

            //HACK: Compensating for how Leap does not seem to be accurately scaling the depth of the gesture
            handGesture.drawPoint.z = handGesture.drawPoint.z * 1.5;

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

                if (drawRawNoodles) {
                    var noodle = drawNoodleFromSpline(splineCurve, 0x708090, 0.9, splineToBeClosed);
                    scene.addAndPushToArray(noodle.tubeMesh, drawnTubes);
                }

                if (drawSmoothedNoodles) {
                    var smoothedNoodle = drawNoodleFromSpline(splineCurve, 0xFF0000, 0.6, splineToBeClosed, smoothenSpline);
                    scene.addAndPushToArray(smoothedNoodle.tubeMesh, drawnTubes);
                }
                destroySpline();
            }
        }
    }
}



function removePinchSpheresFromScene(pinchSphere, number, array) {
    if (pinchSphere) {
        if (pinchSphere.updateToRemove()) {
            scene.remove(pinchSphere.sphere);
            var index = array.indexOf(pinchSphere);
            array.splice(index, 1);
        }
    }
}

function drawNoodleFromSpline(adaptiveSpline, color, opacity, closingFunction, smoothingFunction) {
    var curve = closingFunction(adaptiveSpline);

    if (smoothingFunction)
        curve = smoothingFunction(curve, 24, 2)

    return new Noodle(curve, color, opacity);
}

function splineToBeClosed(adaptiveSpline, testPointsFromEnd) {
    testPointsFromEnd = !testPointsFromEnd ? 10 : testPointsFromEnd;

    var splinePointDistances = adaptiveSpline.pointDistances;

    var max = splinePointDistances[Math.floor(splinePointDistances.length / 2)];
    var min = Math.min.apply(null, splinePointDistances);

    if (max > splinePointDistances.last()) {
        var currentMin = max;
        var currentMinIndex = splinePointDistances.length - 1;
        for (var i = splinePointDistances.length; i >= splinePointDistances.length - testPointsFromEnd; i--) {
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