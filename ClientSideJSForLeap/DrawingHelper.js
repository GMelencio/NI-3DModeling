/// <reference path="Libs/THREEJS/three.js" />

if (!Array.prototype.last) {
    Array.prototype.last = function () {
        return this[this.length - 1];
    };
};

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

//Helper method to write out debug messages
function updateCoordsLabel(elementid, message) {
    var coordslabel = document.getElementById(elementid);
    coordslabel.innerHTML = message;
}

function DrawRequest() {
    //Draw mode is defined as having only the index finger extended
    this.isInDrawMode = false;
    //Draw mode is defined as having only the pinky finger extended
    this.isInClearMode = false;
    this.drawPoint = new THREE.Vector3(0, 0, 0);
}


