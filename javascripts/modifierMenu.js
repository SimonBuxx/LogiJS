// File: modifierMenu.js
// Contains functions for the modifier mode

function enterModifierMode() {
    customDialog.hide();
    closeSaveDialog();
    closeModifierMenu();
    justClosedMenu = false;
    hideModuleOptions();
    hideAllOptions();
    setUnactive();
    setControlMode('modify');
    setSelectMode('none');
    editButton.classList.add('active');
    configureButtons('edit');
    document.getElementById('select-tools').style.display = 'none';
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
    document.getElementById('clock-modifier').style.left = modifierMenuX + 240 + 'px';
    document.getElementById('clock-modifier').style.top = modifierMenuY + 'px';

    document.getElementById('output-modifier').style.left = modifierMenuX + 240 + 'px';
    document.getElementById('output-modifier').style.top = modifierMenuY + 'px';

    document.getElementById('label-modifier').style.left = modifierMenuX + 240 + 'px';
    document.getElementById('label-modifier').style.top = modifierMenuY + 'px';
}

function swapInputs(a, b) {
    inputs[a] = inputs.splice(b, 1, inputs[a])[0];
}

function swapOutputs(a, b) {
    outputs[a] = outputs.splice(b, 1, outputs[a])[0];
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
            redButton.classList.add('active');
            break;
        case 1:
            yellowButton.classList.add('active');
            break;
        case 2:
            greenButton.classList.add('active');
            break;
        case 3:
            blueButton.classList.add('active');
            break;
        default:
    }
    hideAllOptions();
}

function setOutputModifierVisibility(show) {
    if (show) {
        document.getElementById('output-modifier').style.display = 'block';
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

function setColorButtonsUnactive() {
    redButton.classList.remove('active');
    yellowButton.classList.remove('active');
    greenButton.classList.remove('active');
    blueButton.classList.remove('active');
}