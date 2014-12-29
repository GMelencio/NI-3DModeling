//Set up variables
var draw2D = false;
var allPoints = [];

var draw3D = true;
var sphereSize = 5;
var spheresDrawn = [];

var clearDrawingRequestCount = 0;
var useOffesets = false;
var yoffset = 100;

var riggedHandPlugin;
window.addEventListener('keydown', checkRotation, false);
window.addEventListener('keyup', checkRotation, false);
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(120, window.innerWidth / window.innerHeight, 0.1, 1000);

var controls = new THREE.TrackballControls(camera);

controls.rotateSpeed = 1.0;
controls.zoomSpeed = 1.2;
controls.panSpeed = 0.8;

controls.noZoom = false;
controls.noPan = false;

controls.staticMoving = true;
controls.dynamicDampingFactor = 0.3;

controls.keys = [65, 83, 68];

controls.addEventListener('change', render);


camera.position.z = 100
camera.lookAt(scene.position);

//var renderer = new THREE.WebGLRenderer();
var renderer = new THREE.WebGLRenderer({ alpha: 1, antialias: true, clearColor: 0xffffff });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//Requisite render loop for THREE
function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
}
render()

//-------LEAP-related functions follow---------------------------

Leap.loop(
      function (frame) {

          frame.hands.forEach(
            function (hand) {
                //TODO: for some reason these are not clickable because of the THREE js scene ?())
                //draw3D = document.getElementById("mode3dcheck").checked == true;
                //draw2D = document.getElementById("mode2dcheck").checked == true;

                TryDrawObject(hand)
            }
       )
      }
   )
    .use('riggedHand')
    .use('handEntry')
    .on('handLost', function (hand) {
        clearDrawingRequestCount++;
        if (clearDrawingRequestCount >= 3) {
            clearDrawing(hand);
            updateCoordsLabel("clearRequestCount", "");
        }
        else {
            updateCoordsLabel("clearRequestCount", "Clear request # " + clearDrawingRequestCount);
        }
    })

function clearDrawing(hand) {
    var label = hand.data('label');
    if (label) {
        allPoints.forEach(function (point) { document.body.removeChild(point); })
        allPoints = [];
        hand.data({ label: undefined });
    }

    spheresDrawn.forEach(function (sphere) { scene.remove(sphere); })
    spheresDrawn = [];

    clearDrawingRequestCount = 0;
}

function clearDrawingClicked() {
    alert("clear button clicked")
    allPoints.forEach(function (point) { document.body.removeChild(point); })
    allPoints = [];

    spheresDrawn.forEach(function (sphere) { scene.remove(sphere); })
    spheresDrawn = [];
}

riggedHandPlugin = Leap.loopController.plugins.riggedHand;

//This method will draw a 2D or 3D object based on whether or not the recognized gesture is used and 
//The object will be drawn at the where the gesture is performed
function TryDrawObject(hand) {
    var extendedFingers = getExtendedFingers(hand);

    //Draw mode is defined as having only the index finger extended
    var isInDrawMode = extendedFingers.length == 1 && hand.indexFinger.extended
    //Draw mode is defined as having only the pinky finger extended
    var isInClearMode = extendedFingers.length == 1 && hand.pinky.extended

    if (isInDrawMode) {
        clearDrawingRequestCount = 0;
        var indexFinger = extendedFingers[0];
        var pos = indexFinger.tipPosition;
        var handMesh = hand.data('riggedHand.mesh');
        var screenPosition = handMesh.screenPosition(pos, riggedHandPlugin.camera);
        //var screenPosition = handMesh.screenPosition(pos, camera);

        if (draw2D) {
            drawPoint(hand, screenPosition.x, screenPosition.y);
        }

        if (draw3D) {
            var sphere = createSphere(sphereSize, indexFinger.stabilizedTipPosition[0],
                                                  indexFinger.stabilizedTipPosition[1],
                                                  indexFinger.stabilizedTipPosition[2]);
            addSphereToScene(sphere);

        }
    }
    else if (isInClearMode) {
        clearDrawing(hand);
    }
    else {
        updateCoordsLabel("fingercoords", "You are not drawing right now");
    }

}

//Draws text at the specified point coordinates
function drawPoint(hand, xcoord, ycoord) {
    var label = hand.data('label');
    label = document.createElement('label');
    document.body.appendChild(label);
    hand.data('label', label);

    label.innerHTML = '.';

    label.style.left = xcoord + 'px';
    label.style.bottom = ycoord + 'px';

    //Add the drawn point to the array so that we can clear it later
    allPoints.push(label);

    var fingerXpos = "X: " + xcoord;
    var fingerYpos = "Y: " + ycoord;
    updateCoordsLabel("fingercoords", fingerXpos.substring(0, 10) + ", " + fingerYpos.substring(0, 10));
}

//Draws a 3D minsional object (sphere for now) of a given size and at the specified screen position
function createSphere(size, xpos, ypos, zpos) {
    var geom = new THREE.SphereGeometry(size, 8, 8);
    var material = new THREE.MeshNormalMaterial({ color: 0x00fff0 })
    var sphere = new THREE.Mesh(geom, material)
    sphere.position = calculate3DPosition(xpos, ypos, zpos)

    return sphere;
}

function addSphereToScene(sphere, doNotlogCoords) {
    scene.add(sphere);
    spheresDrawn.push(sphere);
    var xpos = "X: " + sphere.position.x;
    var ypos = "Y: " + sphere.position.y;
    var zpos = "Z: " + sphere.position.z;

    if (!doNotlogCoords) {
        updateCoordsLabel("spherecoords", "Sphere # " + spheresDrawn.length + " drawn at " + xpos.substring(0, 5) + ", " + ypos.substring(0, 5) + ", " +
                          zpos.substring(0, 5));
    }
}



//Calculates the 3D position for a 3D object for a given screen position
//TODO: This is a total hack and works half the time, needs a lot of work to get it to "draw" the object in the right place
function calculate3DPosition(screenPosX, screenPosY, screenPosZ) {
    if (useOffesets) {
        var xpos = screenPosX - (window.innerWidth / 2);
        var ypos = screenPosY - (window.innerHeight / 2) + yoffset;
        var zpos = ((((screenPosZ * -100000) + 99000)) / 7);
        return new THREE.Vector3(xpos, ypos, zpos);
    }
    else {
        return new THREE.Vector3(screenPosX, screenPosY, screenPosZ);
    }
}



//Helper method to write out debug messages
function updateCoordsLabel(elementid, message) {
    var coordslabel = document.getElementById(elementid);
    coordslabel.innerHTML = message;
}

//Gets the number of extended fingers for a given hand (seems more relaible than the built-in leap function to check)
function getExtendedFingers(hand) {
    var extendedFingers = [];
    hand.fingers.forEach(function (finger) {
        if (finger.extended)
            extendedFingers.push(finger);
    });

    return extendedFingers;
}

var rotSpeed = .02
function checkRotation() {

    var x = camera.position.x,
        y = camera.position.y,
        z = camera.position.z;

    if (keyboard.pressed("left")) {
        camera.position.x = x * Math.cos(rotSpeed) + z * Math.sin(rotSpeed);
        camera.position.z = z * Math.cos(rotSpeed) - x * Math.sin(rotSpeed);
    } else if (keyboard.pressed("right")) {
        camera.position.x = x * Math.cos(rotSpeed) - z * Math.sin(rotSpeed);
        camera.position.z = z * Math.cos(rotSpeed) + x * Math.sin(rotSpeed);
    }

    camera.lookAt(scene.position);
}