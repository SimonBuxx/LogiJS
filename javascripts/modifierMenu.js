// File: properties.js
// Contains functions for the modifier mode

function enterModifierMode() {
    closeCustomDialog();
    closeSaveDialog();
    closeModifierMenu();
    justClosedMenu = false;
    hideModuleOptions();
    setControlMode('modify');
    setSelectMode('none');
    setActive(modifierModeButton, true);
    configureButtons('edit');
    addType = 0;
}

function closeModifierMenu() {
    hideElementMenus(); // Hide all element menus
    unmarkPropTargets(); // Unmark all outputs, clocks, etc.
    mainCanvas.elt.classList.remove('dark-canvas'); // Lighten up the canvas
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
function showClockPropMenu() {
    hideElementMenus();
    setClockModifierVisibility(true);
    //inputIsTopBox.checked(inputs[inputToModify].isTop);
    //captionInput.value(inputs[inputToModify].lbl);
    //sequencer.value(inputToModify + 1);
    clockspeedSlider.value = 61 - inputs[inputToModify].speed;
    if (inputs[inputToModify].speed !== 1) {
        document.getElementById('cs-label').innerHTML = inputs[inputToModify].speed + ' ticks/toggle';
    } else {
        document.getElementById('cs-label').innerHTML = inputs[inputToModify].speed + ' tick/toggle';
    }
}

/*
    Shows the DOM elements for the output options and unmarks all other
    objects that can be marked in modifier mode
*/
function showOutputPropMenu() {
    hideElementMenus();
    setOutputModifierVisibility(true);
    setOutputColor(outputs[outputToModify].colr);
    //captionInput.value(outputs[outputToModify].lbl);
    //sequencer.value(outputToModify + 1);
}

/*
    Shows the DOM elements for the label options and unmarks all other
    objects that can be marked in modifier mode
*/
function showLabelPropMenu() {
    hideElementMenus();
    setLabelModifierVisibility(true);
    labelTextBox.value = labels[labelToModify].txt;
}

function updateModifierMenuPosition() {
    mainCanvas.elt.classList.add('dark-canvas');
    if (inputToModify >= 0) {
        modifierMenuX = (inputs[inputToModify].x + transform.dx - 1) * transform.zoom;
        modifierMenuY = (inputs[inputToModify].y + transform.dy + GRIDSIZE + 2) * transform.zoom;
    } else if (outputToModify >= 0) {
        modifierMenuX = (outputs[outputToModify].x + transform.dx - GRIDSIZE / 2 - 1) * transform.zoom;
        modifierMenuY = (outputs[outputToModify].y + transform.dy + GRIDSIZE / 2 + 2) * transform.zoom;
    } else if (labelToModify >= 0) {
        modifierMenuX = (labels[labelToModify].x + transform.dx) * transform.zoom;
        modifierMenuY = (labels[labelToModify].y + transform.dy + GRIDSIZE / 2 + GRIDSIZE * (labels[labelToModify].lines.length - 1)) * transform.zoom;
    }
}

function positionModifierElements() {
    //sequencer.position(modifierMenuX + 442, modifierMenuY + 67);

    //captionInput.position(modifierMenuX + 250, modifierMenuY + 70);
    //inputIsTopBox.position(modifierMenuX + 280, modifierMenuY + 120);

    document.getElementById('clock-modifier').style.left = modifierMenuX + 240 + 'px';
    document.getElementById('clock-modifier').style.top = modifierMenuY + 50 + 'px';

    document.getElementById('output-modifier').style.left = modifierMenuX + 240 + 'px';
    document.getElementById('output-modifier').style.top = modifierMenuY + 50 + 'px';

    document.getElementById('label-modifier').style.left = modifierMenuX + 240 + 'px';
    document.getElementById('label-modifier').style.top = modifierMenuY + 50 + 'px';
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
        clockspeedSlider.value = 60 - inputs[inputToModify].speed;
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

function swapInputs(a, b) {
    inputs[a] = inputs.splice(b, 1, inputs[a])[0];
}

function swapOutputs(a, b) {
    outputs[a] = outputs.splice(b, 1, outputs[a])[0];
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
            redButton.className += ' col-active';
            break;
        case 1:
            yellowButton.className += ' col-active';
            break;
        case 2:
            greenButton.className += ' col-active';
            break;
        case 3:
            blueButton.className += ' col-active';
            break;
        default:
    }
    hideAllOptions();
}

function setOutputModifierVisibility(show) {
    if (show) {
        document.getElementById('output-modifier').style.display = 'block';
        /*captionInput.show();
        if (!sequencerAdjusted) {
            adjustSequencer(true, outputToModify + 1);
        }
        sequencer.show();*/
    } else {
        document.getElementById('output-modifier').style.display = 'none';
    }
}

function setClockModifierVisibility(show) {
    if (show) {
        document.getElementById('clock-modifier').style.display = 'block';
    } else {
        document.getElementById('clock-modifier').style.display = 'none';
    }
}

function setLabelModifierVisibility(show) {
    if (show) {
        document.getElementById('label-modifier').style.display = 'block';
    } else {
        document.getElementById('label-modifier').style.display = 'none';
    }
}

function hideElementMenus() {
    document.getElementById('output-modifier').style.display = 'none';
    document.getElementById('clock-modifier').style.display = 'none';
    document.getElementById('label-modifier').style.display = 'none';
}

function elementMenuShown() {
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
    redButton.className = 'colorButton redButton';
    yellowButton.className = 'colorButton yellowButton';
    greenButton.className = 'colorButton greenButton';
    blueButton.className = 'colorButton blueButton';
}

function createColorButtons() {
    redButton = document.getElementsByClassName('redButton')[0];
    redButton.addEventListener('mouseenter', function () {
        setHelpText('Set the output color to red');
    });
    redButton.addEventListener('mouseleave', function () {
        setHelpText('');
    });

    yellowButton = document.getElementsByClassName('yellowButton')[0];
    yellowButton.addEventListener('mouseenter', function () {
        setHelpText('Set the output color to yellow');
    });
    yellowButton.addEventListener('mouseleave', function () {
        setHelpText('');
    });

    greenButton = document.getElementsByClassName('greenButton')[0];
    greenButton.addEventListener('mouseenter', function () {
        setHelpText('Set the output color to green');
    });
    greenButton.addEventListener('mouseleave', function () {
        setHelpText('');
    });

    blueButton = document.getElementsByClassName('blueButton')[0];
    blueButton.addEventListener('mouseenter', function () {
        setHelpText('Set the output color to blue');
    });
    blueButton.addEventListener('mouseleave', function () {
        setHelpText('');
    });
}

function createModifierElements() {
    inputIsTopBox = createCheckbox('Pin to the top', false);
    inputIsTopBox.hide();
    inputIsTopBox.changed(newIsTopState);
    inputIsTopBox.elt.className = 'topBox';
    inputIsTopBox.mouseOver(function () {
        setHelpText('On an exported module, this input should appear on top of the element');
    });
    inputIsTopBox.mouseOut(function () {
        setHelpText('');
    });

    captionInput = createInput('');
    captionInput.elt.style.fontFamily = 'ArcaMajora3';
    captionInput.hide();
    captionInput.size(167, 15);
    captionInput.attribute('placeholder', 'Pin Name');
    captionInput.input(newCaption);
    captionInput.elt.className = "textInput";
    captionInput.style('font-size', '20px');
    captionInput.mouseOver(function () {
        setHelpText('Caption of the corresponding pin on an exported module');
    });
    captionInput.mouseOut(function () {
        setHelpText('');
    });

    clockspeedSlider = document.getElementById('cs-slider');
    clockspeedSlider.addEventListener('mouseenter', function () {
        setHelpText('Sets the toggle speed of this clock element');
    });
    clockspeedSlider.addEventListener('mouseleave', function () {
        setHelpText('');
    });

    labelTextBox = document.getElementById('label-textbox');
    labelTextBox.onkeyup = labelChanged;
    labelTextBox.addEventListener('mouseenter', function () {
        setHelpText('Edit the text of this label');
    });
    labelTextBox.addEventListener('mouseleave', function () {
        setHelpText('');
    });

    sequencer = createSelect();
    sequencer.hide();
    sequencer.size(42, 33);
    sequencer.changed(sequencerChanged);
    fillSequencer(1);
    sequencer.elt.className = 'sequencer';
    sequencer.mouseOver(function () {
        setHelpText('Position of the corresponding pin on an exported module');
    });
    sequencer.mouseOut(function () {
        setHelpText('');
    });

    createColorButtons();
}