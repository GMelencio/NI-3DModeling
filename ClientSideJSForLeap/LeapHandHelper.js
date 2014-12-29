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

    this.isInDrawMode = extendedFingers.length == 1 && hand.indexFinger.extended;
    this.isInClearMode = extendedFingers.length == 1 && hand.pinky.extended;

    if (this.isInDrawMode) {
        var handMesh = hand.data('riggedHand.mesh');

        //var worldPos = handMesh.getWorldPosition();
        this.drawPoint = handMesh.fingers[1].tip.getWorldPosition();
    }
}
HandGesture.prototype = new DrawRequest();