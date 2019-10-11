// File: properties.js
// Contains functions for the properties mode

/*
    Starts or stops the properties mode
*/
function setPropMode(active) {
    propMode = active;
    if (!active) {
        hidePropMenu();
        unmarkPropTargets();
    } else {
        setControlMode('none');
        addType = 0;
    }
}

// Hides the PropMenu without quitting the PropMode
// Used, when the user clickes outside a valid target for PropMode
function hidePropMenu() {
    propBoxLabel.hide();
    ipNameLabel.hide();
    colNameLabel.hide();
    labCaptLabel.hide();
    opNameLabel.hide();
    inputIsTopBox.hide();
    inputCaptionBox.hide();
    outputCaptionBox.hide();
    outputColorBox.hide();
    labelTextBox.hide();
    clockspeedLabel.hide();
    clockspeedSlider.hide();
    propInput = -1;
    propLabel = -1;
    propOutput = -1;
}

/*
    Unmarks all objects that can be marked in the properties mode
*/
function unmarkPropTargets() {
    for (const elem of inputs) {
        elem.mark(false);
    }
    for (const elem of outputs) {
        elem.mark(false);
    }
    for (const elem of labels) {
        elem.mark(false);
    }
    propInput = -1;
    propOutput = -1;
    propLabel = -1;
}

/*
    Unmarks all markable objects, for example after dragging a selection
*/
function unmarkAll() {
    for (const elem of inputs) {
        elem.mark(false);
    }
    for (const elem of outputs) {
        elem.mark(false);
    }
    for (const elem of labels) {
        elem.mark(false);
    }
    for (const elem of gates) {
        elem.marked = false;
    }
    for (const elem of customs) {
        elem.marked = false;
    }
    for (const elem of conpoints) {
        elem.marked = false;
    }
    for (const elem of diodes) {
        elem.marked = false;
    }
    for (const elem of wires) {
        elem.marked = false;
    }
    for (const elem of segDisplays) {
        elem.marked = false;
    }
}

/*
    Shows the DOM elements for the input options and unmarks all other
    objects that can be marked in properties mode
*/
function showInputPropMenu() {
    propBoxLabel.show();
    labCaptLabel.hide();
    outputCaptionBox.hide();
    outputColorBox.hide();
    colNameLabel.hide();
    labelTextBox.hide();
    inputIsTopBox.show();
    inputCaptionBox.show();
    ipNameLabel.show();
    opNameLabel.hide();
    if (inputs[propInput].clock) {
        clockspeedLabel.show();
        clockspeedSlider.show();
        clockspeedSlider.value(60 - inputs[propInput].speed);
    } else {
        clockspeedLabel.hide();
        clockspeedSlider.hide();
    }
    inputIsTopBox.checked(inputs[propInput].isTop);
    inputCaptionBox.value(inputs[propInput].lbl);
    propOutput = -1;
    propLabel = -1;
    for (const elem of outputs) {
        elem.mark(false);
    }
    for (const elem of labels) {
        elem.mark(false);
    }
}

/*
    Shows the DOM elements for the label options and unmarks all other
    objects that can be marked in properties mode
*/
function showLabelPropMenu() {
    propBoxLabel.show();
    labCaptLabel.show();
    opNameLabel.hide();
    ipNameLabel.hide();
    colNameLabel.hide();
    outputCaptionBox.hide();
    outputColorBox.hide();
    inputIsTopBox.hide();
    inputCaptionBox.hide();
    clockspeedLabel.hide();
    clockspeedSlider.hide();
    labelTextBox.show();
    labelTextBox.value(labels[propLabel].txt);
    propOutput = -1;
    propInput = -1;
    for (const elem of outputs) {
        elem.mark(false);
    }
    for (const elem of inputs) {
        elem.mark(false);
    }
}

/*
    Shows the DOM elements for the output options and unmarks all other
    objects that can be marked in properties mode
*/
function showOutputPropMenu() {
    labCaptLabel.hide();
    propBoxLabel.show();
    opNameLabel.show();
    ipNameLabel.hide();
    colNameLabel.show();
    inputIsTopBox.hide();
    inputCaptionBox.hide();
    labelTextBox.hide();
    clockspeedLabel.hide();
    clockspeedSlider.hide();
    outputCaptionBox.show();
    outputColorBox.show();
    switch (outputs[propOutput].colr) {
        case 0:
            outputColorBox.value('red');
            break;
        case 1:
            outputColorBox.value('yellow');
            break;
        case 2:
            outputColorBox.value('green');
            break;
        case 3:
            outputColorBox.value('blue');
            break;
        default:
    }
    outputCaptionBox.value(outputs[propOutput].lbl);
    propInput = -1;
    propLabel = -1;
    for (const elem of inputs) {
        elem.mark(false);
    }
    for (const elem of labels) {
        elem.mark(false);
    }
}

function newIsTopState() {
    inputs[propInput].setIsTop(inputIsTopBox.checked());
}

function newInputCaption() {
    inputs[propInput].lbl = inputCaptionBox.value();
}

function newOutputCaption() {
    outputs[propOutput].lbl = outputCaptionBox.value();
}

/*
    Updates the color of the marked output according to the
    selected color in the select box
*/
function newOutputColor() {
    switch (outputColorBox.value()) {
        case 'red':
            outputs[propOutput].colr = 0;
            break;
        case 'yellow':
            outputs[propOutput].colr = 1;
            break;
        case 'green':
            outputs[propOutput].colr = 2;
            break;
        case 'blue':
            outputs[propOutput].colr = 3;
            break;
        default:
    }
    outputs[propOutput].updateColor();
}