/// <reference path="Libs/THREEJS/three.js" />

//"Base" class for the drawing actions to be performed
function DrawRequest() {
    //Draw mode is defined as having only the index finger extended
    this.isInDrawMode = false;
    //Draw mode is defined as having only the pinky finger extended
    this.isInClearMode = false;
    this.drawPoint = new THREE.Vector3(0, 0, 0);
}

//helper class to log points drawn and the time they were drawn
function PointWithTime(drawnAtPosition, timeDrawn) {
    this.position = drawnAtPosition;
    this.timestamp = (!timeDrawn) ? new Date().getTime() : timeDrawn;
}

//Extension of Arrayto add "last()" function
if (!Array.prototype.last) {
    Array.prototype.last = function () {
        return this[this.length - 1];
    };
};

if (!THREE.Scene.prototype.addAndPushToArray) {
    THREE.Scene.prototype.addAndPushToArray = function (object, array) {
        this.add(object);
        array.push(object);
    }
}

//Creates a 3D object as a marker for the points
function createSphere(position, radius, widthSegments, heightSegments, meshParams) {
    var geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
    var material = new THREE.MeshLambertMaterial(meshParams);

    var mesh = new THREE.Mesh(geometry, material);

    mesh.material.ambient = mesh.material.color;

    mesh.position.x = position.x;
    mesh.position.y = position.y;
    mesh.position.z = position.z;

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    return mesh;
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


//Helper method to write out debug messages to specific named divs
function updateCoordsLabel(elementid, message) {
    var coordslabel = document.getElementById(elementid);
    coordslabel.innerHTML = message;
}