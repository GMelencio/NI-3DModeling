
ShowStatsElement();
CreateDiagnosticLabels(2);
var DiagnosticLabels;

function ShowStatsElement() {
    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = (window.innerHeight - 50) + 'px';
    stats.domElement.style.zIndex = 100;
    container.appendChild(stats.domElement);
}

function CreateDiagnosticLabels(lines) {

    DiagnosticLabels = new Object();
    var count = lines * 2;

    for (var i = 0; i < count/2; i++) {
        var label = new DiagnosticLabel(i, "", i + ":");
        label.div.style.position = 'absolute';
        label.div.style.top = ((i * 30) + 10) + 'px'
        label.div.style.left = '0px';
        document.body.appendChild(label.div);
        
        DiagnosticLabels["diagnosticLabel" + i] = label;

        var label2 = new DiagnosticLabel(i + (count / 2), "", i + (count / 2) + ":");
        label2.div.style.position = 'absolute';
        label2.div.style.top = ((i * 30) + 10) + 'px'
        label2.div.style.left = (window.innerWidth / 2) + 50 + 'px'
        document.body.appendChild(label2.div);
        DiagnosticLabels["diagnosticLabel" + i + (count / 2)] = label2;
    }
}

function GetLabel(labelNumber) {
    return DiagnosticLabels["diagnosticLabel" + labelNumber];
}

function DiagnosticLabel(labelId, initialText, prefixText) {
    var newDiv = document.createElement("div");
    newDiv.id = "diagnosticLabel" + labelId;
    var newContent = document.createTextNode(initialText);
    newDiv.appendChild(newContent); //add the text node to the newly created div. 

    this.div = newDiv;
    this.updateText = function (newText) {
        newContent.data = (!prefixText) ? newText : prefixText + " " + newText;
    }
}

function createDivForLabel() {

}