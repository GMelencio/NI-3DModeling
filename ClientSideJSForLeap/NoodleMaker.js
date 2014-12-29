function createTube(extrudePath, segments, radius, radiusSegments, scale) {
    tube = new THREE.TubeGeometry(extrudePath, segments, radius, radiusSegments, false);

    var tubeMesh = addGeometry(tube, 0xff00ff);
    tubeMesh.scale.set(scale, scale, scale)
    return tubeMesh;
}

function addGeometry(geometry, color) {

    // 3d shape
    var tubeMesh = THREE.SceneUtils.createMultiMaterialObject(geometry, [
        new THREE.MeshLambertMaterial({
            color: color
        }),
        new THREE.MeshBasicMaterial({
            color: 0x000000,
            opacity: 0.3,
            wireframe: true,
            transparent: true
        })]);

    return tubeMesh;

}