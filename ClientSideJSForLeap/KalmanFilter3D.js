/// <reference path="Helpers.js" />


// CONSTANTS
var FPS = 60;
var PIX_SIZE = 4;
var RED_COLOR = { color: 0xFF0000 };
var GREEN_COLOR = { color: 0x00FF00 };
var BLUE_COLOR = { color: 0x0000FF };

// Simulation Values:
var FADE_OUT_TIME = 2.0;
var PREDICT_AMOUNT = 1.0;

// drawing values
var canvas;
var ctx;
var xPos;
var yPos;
var zPos;

// Kalman Filter Values:
var X_NOISE = 0;
var Y_NOISE = 0;
var Z_NOISE = 0;

// Matrices
var A;
var B;
var H;
var Q;
var R;

var last_x;
var last_P;

var rPoints; // real points
var kPoints; // kalman points
var pPoints; // predicted points


// Init: initialize all variables and starts animation
function initKalmanFilter() {
    xPos = 0;
    yPos = 0;
    zPos = 0;

    A = $M([
		[1, 0, 0.2, 0],
		[0, 1, 0, 0.2],
		[0, 0, 1, 0],
		[0, 0, 0, 1]
    ]);

    B = $M([
		[1, 0, 0, 0],
		[0, 1, 0, 0],
		[0, 0, 1, 0],
		[0, 0, 0, 1]
    ]);

    H = $M([
		[1, 0, 0, 0],
		[0, 1, 0, 0],
		[0, 0, 1, 0],
		[0, 0, 0, 1]
    ]);

    Q = $M([
		[0.001, 0, 0, 0],
		[0, 0.001, 0, 0],
		[0, 0, 0, 0],
		[0, 0, 0, 0]
    ]);

    R = $M([
		[0.1, 0, 0, 0],
		[0, 0.1, 0, 0],
		[0, 0, 0.1, 0],
		[0, 0, 0, 0.1]
    ]);

    last_x = $V([0, 0, 0, 0]);

    last_P = $M([
		[0, 0, 0, 0],
		[0, 0, 0, 0],
		[0, 0, 0, 0],
		[0, 0, 0, 0]
    ]);

    rPoints = Array();
    kPoints = Array();
    pPoints = Array();
}


/* Point class (prototype):
 *	Keeps track of a point, and it's current fade-out state.
 *	A point will automatically draw itself to the screen, and
 *	must be updated every frame. isAlive() will return false when
 *	this point has faded out completely.
 */
function Point(size, color) {
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.lastX = 0;
    this.lastY = 0;
    this.lastZ = 0;

    // override values:
    this.size = size;
    this.color = color;
    this.duration = Math.round(FADE_OUT_TIME * FPS); // frames
    this.maxDuration = this.duration;

    // update timer
    this.update = function () {
        this.duration -= 1;
    }

    // returns FALSE if this point is done, ready to be removed
    this.isAlive = function () {
        return (this.duration > 0);
    }

    this.box = null;

    this.draw3D = function () {
        this.box = createBox(size, this.x, this.y, this.z, color);
        return this.box;
    };
}


/* RealPoint: display a point by the actual measurement (after noise) */
function RealPoint(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;

    this.duration = Math.round(FADE_OUT_TIME * FPS); // frames
    this.maxDuration = this.duration;
}
RealPoint.prototype = new Point(3, BLUE_COLOR);

/* KalmanPoint: point to display the filtered value as determined
 *	by the Kalman Filter.
 */
function KalmanPoint(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;

    this.duration = Math.round(FADE_OUT_TIME * FPS); // frames
    this.maxDuration = this.duration;

    // set last point if a previous KalmanPoint exists
    if (kPoints.length > 0) {
        this.lastX = kPoints[kPoints.length - 1].x;
        this.lastY = kPoints[kPoints.length - 1].y;
        this.lastZ = kPoints[kPoints.length - 1].z;
    }
    else {
        this.lastX = 0;
        this.lastY = 0;
        this.lastZ = 0;
    }
}
KalmanPoint.prototype = new Point(4, GREEN_COLOR);


/* PredictionPoint: point to display predicted value */
function PredictionPoint(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;

    // set last point if a previous PredictionPoint exists
    if (pPoints.length > 0) {
        this.lastX = pPoints[pPoints.length - 1].x;
        this.lastY = pPoints[pPoints.length - 1].y;
        this.lastZ = pPoints[pPoints.length - 1].z;
    }
        // or else to the last Kalman point
    else if (kPoints.length > 0) {
        this.lastX = kPoints[kPoints.length - 1].x;
        this.lastY = kPoints[kPoints.length - 1].y;
        this.lastZ = kPoints[kPoints.length - 1].z;
    }
        // otherwise to the user's current position
    else {
        this.lastX = xPos;
        this.lastY = yPos;
        this.lastZ = zPos;
    }
}
PredictionPoint.prototype = new Point(2, RED_COLOR);



///* frame(): update the Kalman Filter based on current position, and
// *	draw all simulated points/lines to the screen.
// */
//function frame() {
//    // if paused, just call for the next frame and return
//    if (!running) {
//        animationHandle = setTimeout(frame, 1000 / FPS);
//        return;
//    }

//    // clear screen
//    ctx.clearRect(0, 0, canvas.width, canvas.height);

//    // introduce some noise (if set)
//    cur_xPos = xPos // + X_NOISE / 2 - X_NOISE * Math.random();
//    cur_yPos = yPos // + Y_NOISE / 2 - Y_NOISE * Math.random();
//    cur_zPos = zPos

//    // add current position to the filter (after noise applied)
//    rPoints.push(new RealPoint(cur_xPos, cur_yPos, cur_zPos));


//    /*** KALMAN FILTER CODE ***/
//    var velX = cur_xPos - last_x.elements[0];
//    var velY = cur_yPos - last_x.elements[1];
//    var velZ = cur_zPos - last_x.elements[2];

//    var measurement = $V([cur_xPos, cur_yPos, velX, velY]);
//    var control = $V([0, 0, 0, 0]); // TODO - adjust

//    // prediction
//    var x = (A.multiply(last_x)).add(B.multiply(control));
//    var P = ((A.multiply(last_P)).multiply(A.transpose())).add(Q);

//    // correction
//    var S = ((H.multiply(P)).multiply(H.transpose())).add(R);
//    var K = (P.multiply(H.transpose())).multiply(S.inverse());
//    var y = measurement.subtract(H.multiply(x));

//    var cur_x = x.add(K.multiply(y));
//    var cur_P = ((Matrix.I(4)).subtract(K.multiply(H))).multiply(P);

//    last_x = cur_x;
//    last_P = cur_P;
//    /**************************/

//    kPoints.push(new KalmanPoint(cur_x.elements[0], cur_x.elements[1], cur_x.elements[2]));

//    // run prediction for n frames (only if prediction is on):
//    if (predictionOn) {
//        var predX = last_x;
//        var count = Math.round(FPS * PREDICT_AMOUNT);
//        pPoints = Array();
//        for (var i = 0; i < count; i++) {
//            predX = (A.multiply(predX)).add(B.multiply(control));
//            pPoints.push(new PredictionPoint(predX.elements[0], predX.elements[1]));
//            //var P = ((A.multiply(last_P)).multiply(A.transpose())).add(Q);
//        }
//    }


//    // draw all real points
//    for (var i = 0; i < rPoints.length; i++) {
//        rPoints[i].draw(ctx);
//        rPoints[i].update();
//        // if point faded out, remove it from the list
//        if (!rPoints[i].isAlive()) {
//            rPoints.splice(i, 1);
//            i--;
//        }
//    }

//    // draw all kalman points
//    for (var i = 0; i < kPoints.length; i++) {
//        kPoints[i].draw(ctx);
//        kPoints[i].update();
//        // if point faded out, remove it from the list
//        if (!kPoints[i].isAlive()) {
//            kPoints.splice(i, 1);
//            i--;
//        }
//    }

//    // draw all prediction points if prediction is enabled
//    if (predictionOn) {
//        for (var i = 0; i < pPoints.length; i++) {
//            pPoints[i].draw(ctx);
//        }
//    }

//    // call next animation frame
//    animationHandle = setTimeout(frame, 1000 / FPS);
//}



///* Called by mouse movement across the canvas:
// *	updates the current position of the cursor.
// */
//function updatePosition(event) {
//    // no position updates if animation is paused
//    if (!running)
//        return;

//    // calculate the position offset of the Canvas on the web page
//    var rect = canvas.getBoundingClientRect();
//    var mouseX = event.clientX - rect.left;
//    var mouseY = event.clientY - rect.top;

//    // update the cursor's x and y position
//    xPos = Math.floor(mouseX);
//    yPos = Math.floor(mouseY);
//}