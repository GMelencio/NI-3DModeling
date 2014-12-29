/// <reference path="Libs/jquery-2.1.3.min.js" />
/// <reference path="Libs/Leap/leap-0.6.4.js" />
/// <reference path="Libs/THREEJS/three.js" />
/// <reference path="Libs/Leap/leap-plugins-0.1.10.js" />
/// <reference path="Libs/Leap/leap-plugins-0.1.10-utils.js" />
/// <reference path="Libs/Leap/leap-widgets-0.1.0.js" />
/// <reference path="Libs/Leap/leap.rigged-hand-0.1.5.js" />
/// <reference path="Helpers.js" />

var clock = new THREE.Clock();

var drawPositions = [];

function TryDrawObject(handGesture) {

    if (handGesture.isInDrawMode) {
        if (!clock.running)
            clock.start();

        var realX = handGesture.drawPoint.x;
        var realY= handGesture.drawPoint.y;
        var realZ = handGesture.drawPoint.z;

        
        var correctedX = KM.x_k.elements[0];
        var correctedY = KM.x_k.elements[1];
        var correctedZ = KM.x_k.elements[2];

        scene.add(createBox(5, realX, realY, realZ, { color: 0xFF0000 }));
        scene.add(createBox(5, correctedX, correctedY, correctedZ, { color: 0x00FF00 }));
        
        var timePosLog = CreateDrawPositionLog(clock.getDelta(), handGesture.drawPoint);
        drawPositions.push(timePosLog);
        writeLastFewMeasurements(5);
    }
    else {
        if (clock.running) {
            var averageTime = getCurrentAverageDeltas();

            updateCoordsLabel("spherecoords", "Logged # " + drawPositions.length + " Average: " + averageTime + " Last: " + drawPositions[drawPositions.length - 1].time);
            clock.stop;
        }
    }
}




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
        if (i > 0)
        {
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
