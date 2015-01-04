
var DEFAULT_TUBE_COLOR = 0x7080D0
var DEFAULT_TUBE_OPACITY = 1.0
var DEFAULT_TUBE_SEGMENTS = 50
var DEFAULT_TUBE_RADIUS = 3
var DEFAULT_TUBE_RADIUSSEGMENTS = 4
var DEFAULT_TUBE_SCALE = 1

function Noodle(basisPath, color, opacity, segments, radius, radiusSegments, scale) {
    //segments = defaultIfUndefined(segments, DEFAULT_TUBE_SEGMENTS)
    this.path = basisPath;
    this.color = defaultIfUndefined(color, DEFAULT_TUBE_COLOR);
    this.opacity = defaultIfUndefined(opacity, DEFAULT_TUBE_OPACITY);
    this.segments = defaultIfUndefined(segments, DEFAULT_TUBE_SEGMENTS);
    this.radius = defaultIfUndefined(radius, DEFAULT_TUBE_RADIUS);
    this.radiusSegments = defaultIfUndefined(radiusSegments, DEFAULT_TUBE_RADIUSSEGMENTS);
    this.scale = defaultIfUndefined(scale, DEFAULT_TUBE_SCALE);

    this.tubeMesh = createTubeMesh(this.path, this.color, this.opacity, this.segments, this.radius, this.radiusSegments, this.scale)

    this.redrawTube = function () {
        this.tubeMesh = createTubeMesh(this.path, this.color, this.opacity, this.segments, this.radius, this.radiusSegments, this.scale)
    }
}


function defaultIfUndefined(value, defaultValue) {
    return (!value) ? defaultValue : value
}

function createTubeMesh(extrudePath, tubeColor, tubeOpacity, segments, radius, radiusSegments, scale) {
    var geometry = new THREE.TubeGeometry(extrudePath, segments, radius, radiusSegments, false);

    var tubeMesh = THREE.SceneUtils.createMultiMaterialObject(geometry, [
        new THREE.MeshLambertMaterial({
            color: tubeColor,
            opacity: tubeOpacity,
            transparent: true
        }),
        new THREE.MeshBasicMaterial({
            color: 0x000000,
            opacity: 0.3,
            wireframe: true,
            transparent: true
        })]);
    tubeMesh.scale.set(scale, scale, scale)

    return tubeMesh;
}


function addGeometry(geometry, tubeColor) {
    // 3d shape
    var tubeMesh = THREE.SceneUtils.createMultiMaterialObject(geometry, [
        new THREE.MeshLambertMaterial({
            color: tubeColor
        }),
        new THREE.MeshBasicMaterial({
            color: 0x000000,
            opacity: 0.1,
            wireframe: true,
            transparent: true
        })]);

    return tubeMesh;
}