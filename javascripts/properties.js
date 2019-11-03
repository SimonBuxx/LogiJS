// File: properties.js
// Contains functions for the properties mode

/*
    Starts or stops the properties mode
*/
function setmodifierModeActive(active) {
    modifierModeActive = active;
    if (!active) {
        hidePropMenu();
        unmarkPropTargets();
    } else {
        setControlMode('none');
        addType = 0;
    }
}

function enterModifierMode() {
    modifierModeActive = true;
    setControlMode('none');
    setActive(modifierModeButton);
    disableButtons(false);
    addType = 0;
}

function leaveModifierMode() {
    modifierModeActive = false;
    hidePropMenu();
    unmarkPropTargets();
}

// Hides the PropMenu without quitting the modifierModeActive
// Used, when the user clickes outside a valid target for modifierModeActive
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
            setActive(redButton, false);
            break;
        case 1:
            setActive(yellowButton, false);
            break;
        case 2:
            setActive(greenButton, false);
            break;
        case 3:
            setActive(blueButton, false);
            break;
        default:
    }
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

function createModifierElements() {
    propBoxLabel = createP('Properties');
    propBoxLabel.hide();
    propBoxLabel.elt.style.color = 'white';
    propBoxLabel.elt.style.fontFamily = 'Open Sans';
    propBoxLabel.elt.style.margin = '3px 0px 0px 0px';
    propBoxLabel.position(windowWidth - 190, 30);
    propBoxLabel.style('font-size', '30px');

    inputIsTopBox = createCheckbox('Pin input to the top', false);
    inputIsTopBox.hide();
    inputIsTopBox.position(windowWidth - 190, 90);
    inputIsTopBox.changed(newIsTopState);
    inputIsTopBox.elt.style.color = 'white';
    inputIsTopBox.elt.style.fontFamily = 'Open Sans';

    ipNameLabel = createP('Input name:');
    ipNameLabel.hide();
    ipNameLabel.elt.style.color = 'white';
    ipNameLabel.elt.style.fontFamily = 'Open Sans';
    ipNameLabel.elt.style.margin = '3px 0px 0px 0px';
    ipNameLabel.position(windowWidth - 190, 120);

    inputCaptionBox = createInput('');
    inputCaptionBox.elt.style.fontFamily = 'Open Sans';
    inputCaptionBox.hide();
    inputCaptionBox.size(170, 15);
    inputCaptionBox.position(windowWidth - 190, 150);
    inputCaptionBox.input(newInputCaption);
    inputCaptionBox.elt.className = "textInput";

    opNameLabel = createP('Output name:');
    opNameLabel.hide();
    opNameLabel.elt.style.color = 'white';
    opNameLabel.elt.style.fontFamily = 'Open Sans';
    opNameLabel.elt.style.margin = '3px 0px 0px 0px';
    opNameLabel.position(windowWidth - 190, 120);

    labCaptLabel = createP('Label text:');
    labCaptLabel.hide();
    labCaptLabel.elt.style.color = 'white';
    labCaptLabel.elt.style.fontFamily = 'Open Sans';
    labCaptLabel.elt.style.margin = '3px 0px 0px 0px';
    labCaptLabel.position(windowWidth - 190, 90);

    outputCaptionBox = createInput('');
    outputCaptionBox.elt.style.fontFamily = 'Open Sans';
    outputCaptionBox.hide();
    outputCaptionBox.size(170, 15);
    outputCaptionBox.position(windowWidth - 190, 150);
    outputCaptionBox.elt.className = 'textInput';
    outputCaptionBox.input(newOutputCaption);

    labelTextBox = createElement('textarea');
    labelTextBox.elt.style.fontFamily = 'Open Sans';
    labelTextBox.elt.style.fontSize = '15px';
    labelTextBox.hide();
    labelTextBox.size(170, 200);
    labelTextBox.position(windowWidth - 190, 120);
    labelTextBox.input(labelChanged);


    createColorButtons();
}