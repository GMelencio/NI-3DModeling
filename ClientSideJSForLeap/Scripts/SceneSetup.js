if (!Detector.webgl) Detector.addGetWebGLMessage();

var container, stats; // make global?
var camera, controls, scene, renderer; // make global
var randomConesToCreate = 15; // Make global
var createLightingForScene = true; // Make global
//make stats optional 

var sceneLights, sceneFog;

var sceneArea = 200;

render();

function initScene(basisScene) {
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, sceneArea / 100,
      sceneArea * 4);
    camera.position.z = sceneArea;

    controls = new THREE.OrbitControls(camera);
    controls.damping = 0.2;
    controls.addEventListener('change', render);

    scene = basisScene;
    scene.fog = new THREE.FogExp2(0xcccccc, 0.002);

    // Create the cones to provide perspective
    createRandomCones(randomConesToCreate, scene);

    if (createLightingForScene)
        createSceneLighting(scene);

    // renderer
    renderer = new THREE.WebGLRenderer({ antialias: false });

    renderer.setClearColor(scene.fog.color, 1);
    renderer.setSize(window.innerWidth, window.innerHeight);

    container = document.getElementById('container');
    container.appendChild(renderer.domElement);

    //window.addEventListener('resize', onWindowResize, false);
}

function AddFogAndLighting(targetScene) {
    targetScene.fog = sceneFog = new THREE.FogExp2(0xcccccc, 0.002);

    if (createLightingForScene)
        createSceneLighting(targetScene);
}

function getCurrentSceneArea() {
    //TODO: allow for this to change based on user input through menu?
    return sceneArea;
}

function createSceneLighting(targetScene) {
    if (!sceneLights)
        sceneLights = []

    light = new THREE.DirectionalLight(0xffffff);
    light.position.set(1, 1, 1);
    targetScene.add(light);
    sceneLights.push(light);

    light = new THREE.DirectionalLight(0x002288);
    light.position.set(-1, -1, -1);
    targetScene.add(light);
    sceneLights.push(light);

    light = new THREE.AmbientLight(0x222222);
    targetScene.add(light);
    sceneLights.push(light);
}

function createRandomCones(coneCount, targetScene) {
    var geometry = new THREE.CylinderGeometry(0, 10, 30, 4, 1);
    var material = new THREE.MeshLambertMaterial({ color: 0xffffff, shading: THREE.FlatShading });

    for (var i = 0; i < coneCount; i++) {
        var mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = (Math.random() - 0.5) * 1000;
        mesh.position.y = (Math.random() - 0.5) * 1000;
        mesh.position.z = (Math.random() - 0.5) * 1000;
        mesh.updateMatrix();
        mesh.matrixAutoUpdate = false;
        targetScene.add(mesh);
    }
}

function render() {
    requestAnimationFrame(render);
    //renderer.render(scene, camera);
    //stats.update();
}