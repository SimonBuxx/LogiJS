// File: properties.js
// Contains functions for the modifier mode

function enterModifierMode() {
    setControlMode('modify');
    setSelectMode('none');
    setActive(modifierModeButton, true);
    disableButtons(false);
    addType = 0;
}

function leaveModifierMode() {
    closeModifierMenu();
    unmarkPropTargets();
}

// Hides the PropMenu without quitting the modifierModeActive
// Used, when the user clickes outside a valid target for modifierModeActive
function closeModifierMenu() {
    setInputModifierVisibility(false);
    setOutputModifierVisibility(false);
    setLabelModifierVisibility(false);
    captionInput.hide();
    sequencer.hide();
    inputToModify = -1;
    labelToModify = -1;
    outputToModify = -1;
}

/*
    Unmarks all objects that can be marked in the modifier mode
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
    inputToModify = -1;
    outputToModify = -1;
    labelToModify = -1;
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
    objects that can be marked in modifier mode
*/
function showInputPropMenu() {
    setOutputModifierVisibility(false);
    setInputModifierVisibility(true);
    setLabelModifierVisibility(false);
    if (inputs[inputToModify].clock) {
        minusLabel.show();
        plusLabel.show();
        clockspeedSlider.show();
        clockspeedSlider.value(60 - inputs[inputToModify].speed);
    } else {
        minusLabel.hide();
        plusLabel.hide();
        clockspeedSlider.hide();
    }
    inputIsTopBox.checked(inputs[inputToModify].isTop);
    captionInput.value(inputs[inputToModify].lbl);
    sequencer.value(inputToModify + 1);

    outputToModify = -1;
    labelToModify = -1;
    for (const elem of outputs) {
        elem.mark(false);
    }
    for (const elem of labels) {
        elem.mark(false);
    }
}

/*
    Shows the DOM elements for the output options and unmarks all other
    objects that can be marked in modifier mode
*/
function showOutputPropMenu() {
    setOutputModifierVisibility(true);
    setInputModifierVisibility(false);
    setLabelModifierVisibility(false);
    setOutputColor(outputs[outputToModify].colr);
    captionInput.value(outputs[outputToModify].lbl);
    sequencer.value(outputToModify + 1);

    inputToModify = -1;
    labelToModify = -1;
    for (const elem of inputs) {
        elem.mark(false);
    }
    for (const elem of labels) {
        elem.mark(false);
    }
}

/*
    Shows the DOM elements for the label options and unmarks all other
    objects that can be marked in modifier mode
*/
function showLabelPropMenu() {
    setInputModifierVisibility(false);
    setOutputModifierVisibility(false);
    setLabelModifierVisibility(true);
    labelTextBox.value(labels[labelToModify].txt);
    outputToModify = -1;
    inputToModify = -1;
    for (const elem of outputs) {
        elem.mark(false);
    }
    for (const elem of inputs) {
        elem.mark(false);
    }
}

function showModifierMenu() {
    fill('rgba(50, 50, 50, 0.9)');
    noStroke();
    strokeCap(SQUARE);
    if (inputToModify >= 0) {
        modifierMenuX = (inputs[inputToModify].x + transform.dx - 1) * transform.zoom;
        modifierMenuY = (inputs[inputToModify].y + transform.dy + GRIDSIZE + 2) * transform.zoom;
        if (!inputs[inputToModify].clock) {
            rect(modifierMenuX, modifierMenuY, 250, 100);
        } else {
            rect(modifierMenuX, modifierMenuY, 250, 150);
        }
    } else if (outputToModify >= 0) {
        modifierMenuX = (outputs[outputToModify].x + transform.dx - GRIDSIZE / 2 - 1) * transform.zoom;
        modifierMenuY = (outputs[outputToModify].y + transform.dy + GRIDSIZE / 2 + 2) * transform.zoom;
        rect(modifierMenuX, modifierMenuY, 250, 100);
    } else if (labelToModify >= 0) {
        modifierMenuX = (labels[labelToModify].x + transform.dx - GRIDSIZE / 2 - 1) * transform.zoom;
        modifierMenuY = (labels[labelToModify].y + transform.dy + GRIDSIZE / 2 + GRIDSIZE * (labels[labelToModify].lines.length - 1) + 2) * transform.zoom;
        rect(modifierMenuX, modifierMenuY, 250, 150);
    }
    strokeCap(ROUND);
}

function positionModifierElements() {
    sequencer.position(modifierMenuX + 332, modifierMenuY + 27);

    captionInput.position(modifierMenuX + 150, modifierMenuY + 30);
    inputIsTopBox.position(modifierMenuX + 160, modifierMenuY + 80);
    clockspeedSlider.position(modifierMenuX + 190, modifierMenuY + 130);
    minusLabel.position(modifierMenuX + 168, modifierMenuY + 121);
    plusLabel.position(modifierMenuX + 365, modifierMenuY + 125);

    redButton.position(modifierMenuX + 195, modifierMenuY + 90);
    yellowButton.position(modifierMenuX + 235, modifierMenuY + 90);
    greenButton.position(modifierMenuX + 275, modifierMenuY + 90);
    blueButton.position(modifierMenuX + 315, modifierMenuY + 90);

    labelTextBox.position(modifierMenuX + 160, modifierMenuY + 40);
}

function newIsTopState() {
    inputs[inputToModify].setIsTop(inputIsTopBox.checked());
}

function newCaption() {
    if (inputToModify >= 0) {
        inputs[inputToModify].lbl = captionInput.value();
    } else {
        outputs[outputToModify].lbl = captionInput.value();
    }
}

function sequencerChanged() {
    if (inputToModify >= 0) {
        inputs[parseInt(sequencer.value()) - 1] = inputs.splice(inputToModify, 1, inputs[parseInt(sequencer.value()) - 1])[0];
        inputToModify = parseInt(sequencer.value()) - 1;
        inputIsTopBox.checked(inputs[inputToModify].isTop);
        captionInput.value(inputs[inputToModify].lbl);
        if (inputs[inputToModify].clock) {
            clockspeedSlider.value(60 - inputs[inputToModify].speed);
        }
        adjustSequencer(false, inputToModify + 1);
        sequencer.value(inputToModify + 1);
    } else {
        outputs[parseInt(sequencer.value()) - 1] = outputs.splice(outputToModify, 1, outputs[parseInt(sequencer.value()) - 1])[0];
        outputToModify = parseInt(sequencer.value()) - 1;
        captionInput.value(outputs[outputToModify].lbl);
        setOutputColor(outputs[outputToModify].colr);
        adjustSequencer(true, outputToModify + 1);
        sequencer.value(outputToModify + 1);
    }
}

function fillSequencer(max, top) {
    sequencer.elt.innerHTML = '';
    sequencer.option(top);
    for (let i = 1; i <= max; i++) {
        if (i !== top) {
            sequencer.option(i);
        }
    }
    sequencer.value('1');
}


/*
    Updates the color of the marked output according to the
    selected color in the select box
*/
function newOutputColor(code) {
    setOutputColor(code);
    outputs[outputToModify].colr = code;
    outputs[outputToModify].updateColor();
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
        captionInput.show();
        if (!sequencerAdjusted) {
            adjustSequencer(true, outputToModify + 1);
        }
        sequencer.show();
    }
}

function setInputModifierVisibility(show) {
    if (show) {
        inputIsTopBox.show();
        captionInput.show();
        if (!sequencerAdjusted) {
            adjustSequencer(false, inputToModify + 1);
        }
        sequencer.show();
    } else {
        inputIsTopBox.hide();
        minusLabel.hide();
        plusLabel.hide();
        clockspeedSlider.hide();
    }
}

function setLabelModifierVisibility(show) {
    if (show) {
        labelTextBox.show();
    } else {
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

function modifierMenuDisplayed() {
    return (controlMode === 'modify' && (inputToModify + outputToModify + labelToModify >= -2));
}

function adjustSequencer(io, top) {
    if (io) {
        fillSequencer(outputs.length, top);
    } else {
        fillSequencer(inputs.length, top);
    }
    sequencerAdjusted = true;
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
    redButton.elt.className = 'colorButton redButton';
    redButton.elt.title = 'Make this output red';
    redButton.mousePressed(function () {
        newOutputColor(0);
    });

    yellowButton = createButton('');
    yellowButton.size(40, 25);
    yellowButton.elt.className = 'colorButton yellowButton';
    yellowButton.elt.title = 'Make this output yellow';
    yellowButton.mousePressed(function () {
        newOutputColor(1);
    });

    greenButton = createButton('');
    greenButton.size(40, 25);
    greenButton.elt.className = 'colorButton greenButton';
    greenButton.elt.title = 'Make this output green';
    greenButton.mousePressed(function () {
        newOutputColor(2);
    });

    blueButton = createButton('');
    blueButton.size(40, 25);
    blueButton.elt.className = 'colorButton blueButton';
    blueButton.elt.title = 'Make this output blue';
    blueButton.mousePressed(function () {
        newOutputColor(3);
    });

    setColorButtonVisibility(false);
}

function createModifierElements() {
    inputIsTopBox = createCheckbox('Pin this to the top', false);
    inputIsTopBox.hide();
    inputIsTopBox.changed(newIsTopState);
    inputIsTopBox.elt.className = 'topBox';
    inputIsTopBox.elt.title = 'Select this to fix the pin of this input on top of this sketch\'s custom module';

    minusLabel = createP('-');
    minusLabel.hide();
    minusLabel.elt.style.color = 'white';
    minusLabel.elt.style.fontFamily = 'Open Sans';
    minusLabel.elt.style.margin = '3px 0px 0px 0px';
    minusLabel.style('font-size', '30px');

    captionInput = createInput('');
    captionInput.elt.style.fontFamily = 'Open Sans';
    captionInput.hide();
    captionInput.size(167, 15);
    captionInput.attribute('placeholder', 'Pin name');
    captionInput.input(newCaption);
    captionInput.elt.className = "textInput";
    captionInput.elt.title = 'This is the name that will appear on the corresponding pin on the custom module.';

    plusLabel = createP('+');
    plusLabel.hide();
    plusLabel.elt.style.color = 'white';
    plusLabel.elt.style.fontFamily = 'Open Sans';
    plusLabel.elt.style.margin = '3px 0px 0px 0px';
    plusLabel.style('font-size', '30px');

    clockspeedSlider = createSlider(1, 60, 30, 1);
    clockspeedSlider.hide();
    clockspeedSlider.input(function () {
        newClockspeed();
    });
    clockspeedSlider.elt.className = 'slider';
    clockspeedSlider.elt.title = 'Clock speed';

    labelTextBox = createElement('textarea');
    labelTextBox.elt.className = 'labelTextBox';
    labelTextBox.attribute('placeholder', 'New Label');
    labelTextBox.hide();
    labelTextBox.size(215, 115);
    labelTextBox.elt.onkeyup = labelChanged;

    sequencer = createSelect();
    sequencer.hide();
    sequencer.size(43, 33);
    sequencer.changed(sequencerChanged);
    fillSequencer(1);
    sequencer.elt.className = 'sequencer';
    sequencer.elt.title = 'Change order';

    createColorButtons();
}