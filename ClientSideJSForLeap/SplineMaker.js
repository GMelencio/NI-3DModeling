/// <reference path="DrawingHelper.js" />
/// <reference path="Libs/THREEJS/three.js" />
var splinePointsLength;

function AdaptiveSpline(points, targetScene, drawReductionFactor) {
    this.curve = new THREE.SplineCurve3(points);
    this.PointsContainer = [];
    this.drawnLines = [];
    this.pointDistances = [];
    var drawCounter = 0;
    if (!drawReductionFactor)
        drawReductionFactor = 1;

    this.AddPoint = function (position) {
        drawCounter++;

        if ((drawCounter % drawReductionFactor) == 0) {
            var point = addSplineObject(position);
            if (this.PointsContainer.last()) 
                var line = drawLineBetweenPoints(this.PointsContainer.last().position, position);
            
            this.PointsContainer.push(point);

            targetScene.add(point);
            targetScene.add(line);
            this.drawnLines.push(line);
            this.curve.points.push(position);
            this.pointDistances.push(this.DistanceOfEnds());
        }
    };
    
    this.ClearAll = function(){
        function removeFromScene(object, number, array) {
            targetScene.remove(object);
        }

        this.drawnLines.forEach(removeFromScene);
        this.PointsContainer.forEach(removeFromScene);

        this.drawnLines = [];
        var drawCounter = 0;
        this.pointDistances = [];
    }

    this.DistanceOfEnds = function () {
        var firstPoint = this.curve.points[0];
        var lastPoint = this.curve.points.last();
        return lastPoint.distanceTo(firstPoint);
    }
}

function addSplineObject(position) {
	var geometry = new THREE.SphereGeometry( 2, 2, 2 );
	var material = new THREE.MeshLambertMaterial( { color: 0x00ff00 } );

	var mesh = new THREE.Mesh( geometry, material );

	mesh.material.ambient = mesh.material.color;

	mesh.position.x = position.x;
	mesh.position.y = position.y;
	mesh.position.z = position.z;

	mesh.castShadow = true;
	mesh.receiveShadow = true;

	return mesh;

}


function updateSplineOutline(splineCurve, targetScene) {

	splineCurve.updateArcLengths();

	var arcLen = splineCurve.getLength();

	arcLen = Math.floor( arcLen / 8 );

	var points = splineCurve.getPoints( arcLen );
    
	var geometry = new THREE.Geometry();

	for (var i = 0; i < points.length; i++) {
	    var vertex = new THREE.Vector3(points[i].x, points[i].y, points[i].z);
	    geometry.vertices.push(vertex);
	}

	var splineOutline = new THREE.Line( geometry, new THREE.LineBasicMaterial( { color: 0x000000, opacity: 0.5 } ) );

	targetScene.add(tubeMesh);
}

function drawLineBetweenPoints(startVect, endVect) {

    var geometry = new THREE.Geometry();
    geometry.vertices.push(startVect);
    geometry.vertices.push(endVect);

    return new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0x000000, opacity: 0.5 }));
}

