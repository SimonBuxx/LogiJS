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
    setInputModifierVisibility(false);
    setOutputModifierVisibility(false);
    setLabelModifierVisibility(false);
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
    setOutputModifierVisibility(false);
    setInputModifierVisibility(true);
    setLabelModifierVisibility(false);
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
    setInputModifierVisibility(false);
    setOutputModifierVisibility(false);
    setLabelModifierVisibility(true);
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
    propBoxLabel.show();
    setOutputModifierVisibility(true);
    setInputModifierVisibility(false);
    setLabelModifierVisibility(false);
    setOutputColor(outputs[propOutput].colr);
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
function newOutputColor(code) {
    setOutputColor(code);
    outputs[propOutput].colr = code;
    outputs[propOutput].updateColor();
}

function setOutputColor(code) {
    setColorButtonsUnactive();
    switch (code) {
        case 0:
            setActive(redButton);
            break;
        case 1:
            setActive(yellowButton);
            break;
        case 2:
            setActive(greenButton);
            break;
        case 3:
            setActive(blueButton);
            break;
        default:
    }
}

function createColorButtons() {
    redButton = createButton('');
    redButton.size(40, 25);
    redButton.position(windowWidth - 190, 90);
    redButton.elt.className = 'colorButton redButton';
    redButton.mousePressed(function () {
        newOutputColor(0);
    });

    yellowButton = createButton('');
    yellowButton.size(40, 25);
    yellowButton.position(windowWidth - 150, 90);
    yellowButton.elt.className = 'colorButton yellowButton';
    yellowButton.mousePressed(function () {
        newOutputColor(1);
    });

    greenButton = createButton('');
    greenButton.size(40, 25);
    greenButton.position(windowWidth - 110, 90);
    greenButton.elt.className = 'colorButton greenButton';
    greenButton.mousePressed(function () {
        newOutputColor(2);
    });

    blueButton = createButton('');
    blueButton.size(40, 25);
    blueButton.position(windowWidth - 70, 90);
    blueButton.elt.className = 'colorButton blueButton';
    blueButton.mousePressed(function () {
        newOutputColor(3);
    });

    setColorButtonVisibility(false);
}

function setOutputModifierVisibility(show) {
    setColorButtonVisibility(show);
    if (show) {
        opNameLabel.show();
        outputCaptionBox.show();
    } else {
        opNameLabel.hide();
        outputCaptionBox.hide();
    }
}

function setInputModifierVisibility(show) {
    if (show) {
        inputIsTopBox.show();
        inputCaptionBox.show();
        ipNameLabel.show();
    } else {
        inputIsTopBox.hide();
        inputCaptionBox.hide();
        ipNameLabel.hide();
        clockspeedLabel.hide();
        clockspeedSlider.hide();
    }
}

function setLabelModifierVisibility(show) {
    if (show) {
        labCaptLabel.show();
        labelTextBox.show();
    } else {
        labCaptLabel.hide();
        labelTextBox.hide();
    }
}

function setColorButtonVisibility(show) {
    if (show) {
        redButton.show();
        yellowButton.show();
        greenButton.show();
        blueButton.show();
    } else {
        redButton.hide();
        yellowButton.hide();
        greenButton.hide();
        blueButton.hide();
    }
}

function setColorButtonsUnactive() {
    redButton.elt.className = 'colorButton redButton';
    yellowButton.elt.className = 'colorButton yellowButton';
    greenButton.elt.className = 'colorButton greenButton';
    blueButton.elt.className = 'colorButton blueButton';
}