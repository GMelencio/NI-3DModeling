var wd = window;

var ctnEl = document.getElementById('ctn');
var camera, scene, renderer;
var cubes = [], plane, marker, spline;


// ALLOCATE THESE OUTSIDE OF THE RENDER LOOP - CHANGED
var matrix = new THREE.Matrix4();
var up = new THREE.Vector3(0, 1, 0);
var axis = new THREE.Vector3();
var pt, radians, axis, tangent;


var winDims = [ctnEl.offsetWidth, ctnEl.offsetHeight];
var winHalfW = winDims[0] / 2;

function init() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(70, winDims[0] / winDims[1], 1, 8000);

    camera.position.y = 350;
    camera.position.z = 300;
    camera.lookAt(new THREE.Vector3(150, 150, 0));
    scene.add(camera);

    for (var i = 0; i < 15; i++) {
        //cubes.push(getCube());
    }

    var increment = (360 / cubes.length);
    for (var i = 0; i < cubes.length; i++) {
        var angle = i * increment;
        var x = Math.cos(angle * (Math.PI / 180)) * 450;
        var y = Math.sin(angle * (Math.PI / 180)) * 450;
        cubes[i].position.x = x;
        cubes[i].position.z = y;

        scene.add(cubes[i]);
    }

    marker = getCube();
    scene.add(marker);

    // plane
    plane = new THREE.Mesh(
        new THREE.PlaneGeometry(1500, 1500),
        new THREE.MeshLambertMaterial({ color: 0xff0000 })
    );
    scene.add(plane);

    spline = new THREE.SplineCurve3([
       new THREE.Vector3(0, 0, 0),
       new THREE.Vector3(0, 200, 0),
       new THREE.Vector3(150, 150, 0),
       new THREE.Vector3(150, 50, 0),
       new THREE.Vector3(250, 150, 0),
       new THREE.Vector3(250, 300, 0)
    ]);

    var material = new THREE.LineBasicMaterial({
        color: 0xff00f0,
    });

    var geometry = new THREE.Geometry();
    for (var i = 0; i < spline.getPoints(100).length; i++) {
        geometry.vertices.push(spline.getPoints(100)[i]);
    }

    var line = new THREE.Line(geometry, material);
    scene.add(line);


    renderer = new THREE.WebGLRenderer();

    renderer.setSize(winDims[0], winDims[1]);
    ctnEl.appendChild(renderer.domElement);
}

function getCube() {
    // cube mats and cube
    var mats = [];
    for (var i = 0; i < 6; i++) {
        mats.push(new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff }));
    }

    var cube = new THREE.Mesh(
        new THREE.CubeGeometry(100, 100, 100, 1, 1, 1),
        new THREE.MeshFaceMaterial(mats)
    );

    return cube
}

function animate() {
    requestAnimationFrame(animate);

    render();
}

var t = 0;
function render() {

    // set the marker position
    pt = spline.getPoint(t);
    marker.position.set(pt.x, pt.y, pt.z);

    // get the tangent to the curve
    tangent = spline.getTangent(t).normalize();

    // calculate the axis to rotate around
    axis.cross(up, tangent).normalize();

    // calcluate the angle between the up vector and the tangent
    radians = Math.acos(up.dot(tangent));

    // set the quaternion
    marker.quaternion.setFromAxisAngle(axis, radians);

    t = (t >= 1) ? 0 : t += 0.002;

    renderer.render(scene, camera);
}

init();
animate();

