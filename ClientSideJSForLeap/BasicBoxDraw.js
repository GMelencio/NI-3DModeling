/// <reference path="Helpers.js" />
var objectSize = 7;
var objectsDrawn = [];

//This method will draw a 2D or 3D object based on whether or not the recognized gesture is used and 
//The object will be drawn at the where the gesture is performed
function TryDrawObject(handGesture) {

    if (handGesture.isInDrawMode) {
        var worldPos = handGesture.drawPoint;
        
        var xcoord = worldPos.x; // hand.indexFinger.stabilizedTipPosition[0];
        var ycoord = worldPos.y;// hand.indexFinger.stabilizedTipPosition[1];
        var zcoord = worldPos.z;// hand.indexFinger.stabilizedTipPosition[2];

        var xpos = " X : " + xcoord;
        var ypos = " Y : " + ycoord;
        var zpos = " Z : " + zcoord;

        updateCoordsLabel("fingercoords", "Drawing requested at " + xpos.substring(0, 7) + ypos.substring(0, 7) + zpos.substring(0, 7));
        var newObject = create3DObject(objectSize, xcoord, ycoord, zcoord);
        addObjectToScene(newObject, scene, false);
        objectsDrawn.push(newObject);
    }
    else if (handGesture.isInClearMode) {
        clearDrawing(hand);
    }
    else {
        updateCoordsLabel("fingercoords", "You are not drawing right now");
    }
}


function clearDrawing(hand) {
    objectsDrawn.forEach(function (sphere) { scene.remove(sphere); })
    objectsDrawn = [];
}

//Draws a 3D dimensional object (sphere for now) of a given size and at the specified screen position
function create3DObject(size, xpos, ypos, zpos) {
    var geom = new THREE.BoxGeometry(size, size, size);
    var material = new THREE.MeshNormalMaterial({ color: 0x00fff0 })
    var mesh = new THREE.Mesh(geom, material)

    var adjustedPosition = calculate3DPosition(xpos, ypos, zpos);

    mesh.position.x = adjustedPosition.x;
    mesh.position.y = adjustedPosition.y;
    mesh.position.z = adjustedPosition.z;

    //Unsure if still needed:
    //sphere.updateMatrix();
    //sphere.matrixAutoUpdate = false;
    return mesh;
}

function addObjectToScene(newObject, targetScene, forceGeometryUpdates) {

    if (forceGeometryUpdates) {
        //From: http://aerotwist.com/tutorials/getting-started-with-three-js/
        // set the geometry to dynamic
        // so that it allow updates
        newObject.geometry.dynamic = true;

        // changes to the vertices
        newObject.geometry.verticesNeedUpdate = true;

        // changes to the normals
        newObject.geometry.normalsNeedUpdate = true;
    }

    targetScene.add(newObject);
    var xpos = "X: " + newObject.position.x;
    var ypos = "Y: " + newObject.position.y;
    var zpos = "Z: " + newObject.position.z;

    updateCoordsLabel("spherecoords", "Cube # " + objectsDrawn.length + " drawn at " + xpos.substring(0, 7) + ", " + ypos.substring(0, 7) + ", " + zpos.substring(0, 7));
}

//Calculates the 3D position for a 3D object for a given screen position
function calculate3DPosition(screenPosX, screenPosY, screenPosZ) {
    /*
    //TODO: This is a total hack and works half the time, needs a lot of work to get it to "draw" the object in the right place
    if (useOffesets) {
        var xpos = screenPosX - (window.innerWidth / 2);
        var ypos = screenPosY - (window.innerHeight / 2) + 100;
        var zpos = ((((screenPosZ * -100000) + 99000)) / 7);
        return new THREE.Vector3(xpos, ypos, zpos);
    }
    else 
    */
    return new THREE.Vector3(screenPosX, screenPosY, screenPosZ * 1.05);
}