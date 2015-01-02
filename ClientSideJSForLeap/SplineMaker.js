/// <reference path="DrawingHelper.js" />
/// <reference path="Libs/THREEJS/three.js" />

//Custom object that encapsulates the functions needed for a SplineCurve3
function AdaptiveSpline(points, targetScene, drawReductionFactor) {
    this.curve = new THREE.SplineCurve3(points);
    this.PointsContainer = [];
    this.drawnLines = [];
    this.pointDistances = [];
    this.pointDrawLog = [];
    var drawCounter = 0;
    if (!drawReductionFactor)
        drawReductionFactor = 1;

    this.AddPoint = function (position) {
        drawCounter++;

        if ((drawCounter % drawReductionFactor) == 0) {
            var point = createSphere(position, 2, 2, 2, { color: 0x00ff00 });
            if (this.PointsContainer.last()) 
                var line = drawLineBetweenPoints(this.PointsContainer.last().position, position);
            
            this.PointsContainer.push(point);

            targetScene.add(point);
            targetScene.add(line);
            this.drawnLines.push(line);
            this.curve.points.push(position);
            this.pointDrawLog.push(new PointWithTime(this.curve.points.last()));
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
        this.pointDrawLog = [];
        this.pointDistances = [];
    }

    this.DistanceOfEnds = function () {
        var firstPoint = this.curve.points[0];
        var lastPoint = this.curve.points.last();
        return lastPoint.distanceTo(firstPoint);
    }
}

function drawLineBetweenPoints(startVect, endVect) {

    var geometry = new THREE.Geometry();
    geometry.vertices.push(startVect);
    geometry.vertices.push(endVect);

    return new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0x000000, opacity: 0.5 }));
}


function smoothenSpline(baseSpline, divisions, recursionCount) {
    baseSpline.updateArcLengths();
    var arcLength = baseSpline.getLength();
    var segments = Math.floor(arcLength / divisions);

    var splinePoints = baseSpline.getPoints(segments);

    var smoothSpline = new THREE.SplineCurve3();
    for (var i = 1; i <= splinePoints.length; i = i + 2) {
        if (splinePoints[i - 1] && splinePoints[i + 1]) {
            var newXPos = (splinePoints[i - 1].x + splinePoints[i + 1].x) / 2;
            var newYPos = (splinePoints[i - 1].y + splinePoints[i + 1].y) / 2;
            var newZPos = (splinePoints[i - 1].z + splinePoints[i + 1].z) / 2;

            var vertex = new THREE.Vector3(newXPos, newYPos, newZPos);
            smoothSpline.points.push(vertex);
        }
    }

     return smoothSpline;
}

