/// <reference path="Libs/THREEJS/three.js" />
/// <reference path="Libs/Leap/leap-0.6.4.js" />
/// <reference path="Libs/Leap/leap.rigged-hand-0.1.5.js" />
/// <reference path="DrawingHelpers.js" />


//Gets the number of extended fingers for a given hand (seems more relaible than the built-in leap function to check)
function getExtendedFingers(hand) {
    var extendedFingers = [];
    hand.fingers.forEach(function (finger) {
        if (finger.extended)
            extendedFingers.push(finger);
    });

    return extendedFingers;
}

function HandGesture(hand, ibox) {
    var extendedFingers = getExtendedFingers(hand);

    this.isInDrawMode = extendedFingers.length == 2 && (hand.indexFinger.extended && hand.middleFinger.extended);
    this.isInClearMode = extendedFingers.length == 1 && hand.pinky.extended;

    if (this.isInDrawMode) {
        this.drawPoint = (new THREE.Vector3()).fromArray(hand.fingers[1].tipPosition); 
        //this.drawPoint = convertLeapPointToScene(hand.indexFinger.tipPosition, ibox);
    }

    this.isPinching = !this.isInDrawMode && hand.pinchStrength > 0.9
    this.pinchSpace = new PinchSpace(hand, ibox);

    this.palmPosition = hand.palmPosition;
    this.palmNormal = hand.palmNormal;
    this.pitch = hand.pitch();
    this.yaw = hand.yaw();
    this.roll = hand.roll();

}
HandGesture.prototype = new DrawRequest();


function PinchSpace(hand, ibox) {
    this.pincherPosition = new THREE.Vector3(0, 0, 0);
    this.thumbPosition = new THREE.Vector3(0, 0, 0);
    this.pinchCenter = new THREE.Vector3(0, 0, 0);
    this.pinchRadius = 0;

    if (hand.pinchStrength > 0.9) {
        var pincher;
        var pincherIndex = 0;
        var closest = 500;
        for (var f = 1; f < 5; f++) {
            current = hand.fingers[f];
            distance = Leap.vec3.distance(hand.thumb.tipPosition, current.tipPosition);
            if (current != hand.thumb && distance < closest) {
                closest = distance;
                pincher = current;
                pincherIndex = f;
            }
        }

        this.pincherPosition = (new THREE.Vector3()).fromArray(hand.fingers[pincherIndex].tipPosition);
            //convertLeapPointToScene(hand.fingers[pincherIndex].tipPosition, ibox);
        this.thumbPosition = (new THREE.Vector3()).fromArray(hand.fingers[pincherIndex].tipPosition);
            //convertLeapPointToScene(hand.fingers[0].tipPosition, ibox);

        this.pinchCenter = this.pincherPosition.add(this.thumbPosition).divideScalar(2);
        this.pinchRadius = this.thumbPosition.distanceTo(this.pincherPosition);
    }
}

function convertLeapPointToScene(position, ibox) {

    var x, y, z
    var coords = [x, y, z];
    coords.forEach(function (current, index, sourceArray) {
        current = position[index] - ibox.center[index];
        current /= ibox.size[index];
        current *= getCurrentSceneArea(); //TODO: Change this, do not use global variable
        sourceArray[index] = current;
    });


    coords[2] -= getCurrentSceneArea();

    return new THREE.Vector3(coords[0], coords[1], coords[2]);
}

