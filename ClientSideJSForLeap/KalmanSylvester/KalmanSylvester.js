/// <reference path="KalmanModel.js" />
/// <reference path="KalmanSylvester.js" />

var KM, x_0, P_0, F_k, Q_k;
var KO, z_k, H_k, R_k

function initKM(x, y, z) {
    x_0 = $V([x, y, z]);
    //P prior knowledge of state
    P_0 = $M([
                  [1, 0, 0],
                  [0, 1, 0],
                  [0, 0, 1]
    ]); //identity matrix. Initial covariance. Set to 1
    F_k = $M([
                  [1, 0, 0],
                  [0, 1, 0],
                  [0, 0, 1]
    ]); //identity matrix. How change to model is applied. Set to 1
    Q_k = $M([
                  [0, 0, 0],
                  [0, 0, 0],
                  [0, 0, 0]
    ]); //empty matrix. Noise in system is zero

    KM = new KalmanModel(x_0, P_0, F_k, Q_k);
}

function initKO(x, y, z) {
    z_k = $V([x, y, z]); //initial observed values
    H_k = $M([
                  [1, 0, 0],
                  [0, 1, 0],
                  [0, 0, 1]
    ]); //identity matrix. Describes relationship between model and observation
    R_k = $M([
                  [2, 0, 0],
                  [0, 2, 0],
                  [0, 0, 2]
    ]); //2x Scalar matrix. Describes noise from sensor. Set to 2 to begin
    KO = new KalmanObservation(z_k, H_k, R_k);
}

function getKalmanCorrection(x, y, z) {
    if (!KM) {
        initKM(realX, realY, realZ);
    } else if (!KO) {
        initKO(realX, realY, realZ);
    }
    else {
        KO.z_k = $V([realX, realY, realZ]);
        KM.update(KO);
    }

}

function resetKalmanFilter() {
    KM = null;
    KO = null;
}