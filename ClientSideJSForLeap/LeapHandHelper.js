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

function HandGesture(hand) {
    var extendedFingers = getExtendedFingers(hand);

    this.isInDrawMode = extendedFingers.length == 2 && (hand.indexFinger.extended && hand.middleFinger.extended);
    this.isInClearMode = extendedFingers.length == 1 && hand.pinky.extended;

    if (this.isInDrawMode) {
        var handMesh = hand.data('riggedHand.mesh');

        //var worldPos = handMesh.getWorldPosition();
        this.drawPoint = handMesh.fingers[1].tip.getWorldPosition();
    }

    this.isPinching = !this.isInDrawMode && hand.pinchStrength > 0.9
    this.pinchSpace = new PinchSpace(hand);

    this.palmPosition = hand.palmPosition;
    this.palmNormal = hand.palmNormal;

}
HandGesture.prototype = new DrawRequest();


function PinchSpace(hand) {
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

        var handMesh = hand.data('riggedHand.mesh');
        this.pincherPosition = handMesh.fingers[pincherIndex].tip.getWorldPosition();
        this.thumbPosition = handMesh.fingers[0].tip.getWorldPosition();

        this.pinchCenter = this.pincherPosition.add(this.thumbPosition).divideScalar(2);
        this.pinchRadius = this.thumbPosition.distanceTo(this.pincherPosition);
    }
}

