/// <reference path="KalmanFilter3D.js" />

initKalmanFilter();

function TryDrawObject(handGesture) {
    if (handGesture.isInDrawMode) {

        var realX = handGesture.drawPoint.x;
        var realY = handGesture.drawPoint.y;
        var realZ = handGesture.drawPoint.z;

        drawRealPoint(realX, realY, realZ, scene);
        //drawKalmanPoint(realX, realY, realZ, scene);
        //drawPredictionPoints(3, scene);
    }
    else {
        for (var i = 0; i < rPoints.length; i++) {
            rPoints[i].update();
            // if point faded out, remove it from the list
            if (!rPoints[i].isAlive()) {
                scene.remove(rPoints[i].box);
                rPoints.splice(i, 1);
                i--;
            }
        }

        for (var i = 0; i < kPoints.length; i++) {
            kPoints[i].update();
            // if point faded out, remove it from the list
            if (!kPoints[i].isAlive()) {
                scene.remove(kPoints[i].box);
                kPoints.splice(i, 1);
                i--;
            }
        }

        for (var i = 0; i < pPoints.length; i++) {
            pPoints[i].update();
            // if point faded out, remove it from the list
            if (!pPoints[i].isAlive()) {
                scene.remove(pPoints[i].box);
                pPoints.splice(i, 1);
                i--;
            }
        }
    }
}

function drawRealPoint(cur_xPos, cur_yPos, cur_zPos, targetScene) {
    var rPoint = new RealPoint(cur_xPos, cur_yPos, cur_zPos);
    rPoints.push(rPoint);
    targetScene.add(rPoint.draw3D());
}

function drawKalmanPoint(cur_xPos, cur_yPos, cur_zPos, targetScene) {
    /*** KALMAN FILTER CODE ***/
    var velX = cur_xPos - last_x.elements[0];
    var velY = cur_yPos - last_x.elements[1];
    var velZ = cur_zPos - last_x.elements[2];

    var measurement = $V([cur_xPos, cur_yPos, cur_zPos, velX, velY, velZ]);
    var control = $V([0, 0, 0, 0, 0, 0]); // TODO - adjust

    // prediction
    var x = (A.multiply(last_x)).add(B.multiply(control));
    var P = ((A.multiply(last_P)).multiply(A.transpose())).add(Q);

    // correction
    var S = ((H.multiply(P)).multiply(H.transpose())).add(R);
    var K = (P.multiply(H.transpose())).multiply(S.inverse());
    var y = measurement.subtract(H.multiply(x));

    var cur_x = x.add(K.multiply(y));
    var cur_P = ((Matrix.I(4)).subtract(K.multiply(H))).multiply(P);

    last_x = cur_x;
    last_P = cur_P;
    /**************************/
    var kPoint = new KalmanPoint(cur_x.elements[0], cur_x.elements[1], cur_x.elements[2]);
    kPoints.push(kPoint);
    targetScene.add(kPoint.draw3D());
}

function drawPredictionPoints(count, targetScene) {

    var predX = last_x;
    for (var i = 0; i < count; i++) {
        predX = (A.multiply(predX)).add(B.multiply(control));
        var pPoint = new PredictionPoint(predX.elements[0], predX.elements[1], predX.elements[2]);
        pPoints.push(pPoint);
        targetScene.add(pPoint.draw3D());
        //var P = ((A.multiply(last_P)).multiply(A.transpose())).add(Q);
    }
}