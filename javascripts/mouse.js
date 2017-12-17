// File: mouse.js

/*
    Triggers when the mouse wheel is used
*/
function mouseWheel(event) {
    // -1 for zoom in, +1 for zoom out
    this.wheel = Math.sign(event.deltaY);
    if (gridSize < maxZoom * GRIDSIZE && gridSize > minZoom * GRIDSIZE) {
        gridSize -= wheel;
    }
    if (gridSize == maxZoom * GRIDSIZE) gridSize--;
    if (gridSize == minZoom * GRIDSIZE) gridSize++;
    transform.zoom = (gridSize / GRIDSIZE);
    if (!simRunning) {
        reDraw();
    }
}

function mouseMoved() {
    let hand = false;
    if (simRunning || propMode) {
        if (!simRunning) {
            for (const elem of outputs) {
                if (elem.mouseOver()) {
                    hand = true;
                    cursor(HAND);
                }
            }
            for (const elem of inputs) {
                if (elem.mouseOver()) {
                    hand = true;
                    cursor(HAND);
                }
            }
        } else {
            for (const elem of inputs) {
                if (elem.mouseOver() && !elem.getIsClock()) {
                    hand = true;
                    cursor(HAND);
                }
            }
        }
    }
    if (!hand) {
        cursor(ARROW);
    }
}

/*
    Executed when a mouse button is pressed down
*/
function mousePressed() {
    if (!simRunning && !mouseOverGUI() && (mouseButton == LEFT)) {
        switch (ctrlMode) {
            case 'addWire':
                switch (wireMode) {
                    case 'none':
                        wireMode = 'preview';
                        pwstartX = Math.round((mouseX / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE;
                        pwstartY = Math.round((mouseY / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE;
                        break;
                    default:
                }
                break;
            case 'delete':
                pwstartX = Math.round((mouseX / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE;
                pwstartY = Math.round((mouseY / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE;
                wireMode = 'delete';
                break;
            case 'select':
                switch (selectMode) {
                    case 'none':
                        selectStartX = Math.round(((mouseX + GRIDSIZE / 2) / transform.zoom - transform.dx - GRIDSIZE / 2) / GRIDSIZE) * GRIDSIZE - GRIDSIZE / 2;
                        selectStartY = Math.round(((mouseY + GRIDSIZE / 2) / transform.zoom - transform.dy - GRIDSIZE / 2) / GRIDSIZE) * GRIDSIZE - GRIDSIZE / 2;
                        selectEndX = Math.round(((mouseX + GRIDSIZE / 2) / transform.zoom - transform.dx - GRIDSIZE / 2) / GRIDSIZE) * GRIDSIZE + GRIDSIZE / 2;
                        selectEndY = Math.round(((mouseY + GRIDSIZE / 2) / transform.zoom - transform.dy - GRIDSIZE / 2) / GRIDSIZE) * GRIDSIZE + GRIDSIZE / 2;
                        selectMode = 'start';
                        break;
                    case 'end':
                        selectStartX = Math.round(((mouseX + GRIDSIZE / 2) / transform.zoom - transform.dx - GRIDSIZE / 2) / GRIDSIZE) * GRIDSIZE - GRIDSIZE / 2;
                        selectStartY = Math.round(((mouseY + GRIDSIZE / 2) / transform.zoom - transform.dy - GRIDSIZE / 2) / GRIDSIZE) * GRIDSIZE - GRIDSIZE / 2;
                        selectEndX = Math.round(((mouseX + GRIDSIZE / 2) / transform.zoom - transform.dx - GRIDSIZE / 2) / GRIDSIZE) * GRIDSIZE + GRIDSIZE / 2;
                        selectEndY = Math.round(((mouseY + GRIDSIZE / 2) / transform.zoom - transform.dy - GRIDSIZE / 2) / GRIDSIZE) * GRIDSIZE + GRIDSIZE / 2;
                        selectMode = 'start';
                        break;
                    default:
                        break;
                }
                break;
            default:
        }
    }
}

function mouseClicked() {
    reDraw();
    if (ctrlMode !== 'none') {
        stopPropMode();
    }
    if (!simRunning && !mouseOverGUI()) {
        switch (ctrlMode) {
            case 'addObject':
                switch (addType) { // Handle object adding
                    case 'gate':
                        if (mouseButton == LEFT) {
                            addGate(gateType, gateInputCount, gateDirection);
                        }
                        break;
                    case 'custom':
                        if (mouseButton == LEFT) {
                            addCustom(custFile, gateDirection);
                        }
                        break;
                    case 'output':
                        if (mouseButton == LEFT) {
                            addOutput();
                        }
                        break;
                    case 'input':
                        if (mouseButton == LEFT) {
                            addInput();
                        }
                        break;
                    case 'diode':
                        if (mouseButton == LEFT) {
                            toggleDiode();
                        }
                    case 'none':
                        break;
                    default:
                        console.log('Invalid object type!');
                }
                break;
            case 'none':
                if (mouseButton === LEFT) {
                    // Invert In-/Outputs
                    for (var i = 0; i < gates.length; i++) {
                        for (var j = 0; j < gates[i].inputCount; j++) {
                            if (gates[i].mouseOverInput(j)) {
                                gates[i].invertInput(j);
                                var act = new Action('invGIP', [i, j], null);
                                actionUndo.push(act);
                            }
                        }
                        for (var j = 0; j < gates[i].outputCount; j++) {
                            if (gates[i].mouseOverOutput(j)) {
                                gates[i].invertOutput(j);
                                var act = new Action('invGOP', [i, j], null);
                                actionUndo.push(act);
                            }
                        }
                    }
                    for (var i = 0; i < customs.length; i++) {
                        if (customs[i].visible) {
                            for (var j = 0; j < customs[i].inputCount; j++) {
                                if (customs[i].mouseOverInput(j)) {
                                    customs[i].invertInput(j);
                                    var act = new Action('invCIP', [i, j], null);
                                    actionUndo.push(act);
                                }
                            }
                            for (var j = 0; j < customs[i].outputCount; j++) {
                                if (customs[i].mouseOverOutput(j)) {
                                    customs[i].invertOutput(j);
                                    var act = new Action('invCOP', [i, j], null);
                                    actionUndo.push(act);
                                }
                            }
                        }
                    }
                    let noValidTarget = true;
                    for (var i = 0; i < inputs.length; i++) {
                        if (Boolean(inputs[i].mouseOver()) && propMode) {
                            noValidTarget = false;
                            // If the propMode is active, give options to name and make top
                            if (propInput !== i) {
                                if (propInput >= 0) {
                                    inputs[propInput].mark(false);
                                }
                                inputs[i].mark(true);
                                propInput = i;
                                showInputPropMenu();
                            }
                        }
                    }
                    for (var i = 0; i < outputs.length; i++) {
                        if (Boolean(outputs[i].mouseOver()) && propMode) {
                            noValidTarget = false;
                            if (propOutput !== i) {
                                if (propOutput >= 0) {
                                    outputs[propOutput].mark(false);
                                }
                                outputs[i].mark(true);
                                propOutput = i;
                                showOutputPropMenu();
                            }
                        }
                    }
                    if (noValidTarget && propMode) {
                        hidePropMenu();
                        unmarkAllTargets();
                    }
                }
                break;
            default:
                break;
        }
        redoButton.elt.disabled = (actionRedo.length == 0);
        undoButton.elt.disabled = (actionUndo.length == 0);
    } else {
        // Buttons should be operateable during simulation
        if (mouseButton === LEFT) {
            for (var i = 0; i < inputs.length; i++) {
                if (Boolean(inputs[i].mouseOver()) && !inputs[i].getIsClock()) {
                    inputs[i].toggle();
                }
            }
        }
    }
    reDraw();
}

/*
    Triggered by p5 when a mouse button is released
    Jobs: Adding / Deleting wires, including managing ConPoints
          Finishing the selection process by invoking handleSelection
*/
function mouseReleased() {
    if (!simRunning && !mouseOverGUI()) {
        if (mouseButton == LEFT) {
            switch (ctrlMode) {
                case 'addObject':
                    break;
                case 'addWire':
                    if (wireMode == 'preview') { // If the preview wire mode is active
                        if (pwSegments.length > 0) { // If a wire was drawn (not 0 segments)
                            pushUndoAction('reWire', 0, [segments.slice(0), conpoints.slice(0)]); // push the action for undoing
                        }
                        for (var i = 0; i < pwSegments.length; i++) { // Push all preview segments to the existing segments
                            if (segmentExists(pwSegments[i].startX, pwSegments[i].startY, pwSegments[i].endX, pwSegments[i].endY) < 0) {
                                segments.push(pwSegments[i]);
                            }
                        }
                        lockElements = false;
                        pwSegments = []; // delete the preview segments
                        wireMode = 'none'; // wiring done, reset wireMode
                        doConpoints(); // Update all conpoints and diodes
                    }
                    break;
                case 'delete': // If the delete mode is active
                    if (!lockElements) {
                        // Delete elements with mouseOver
                        var gateNumber = mouseOverGate();
                        if (gateNumber >= 0) {
                            deleteGate(gateNumber);
                        }
                        var customNumber = mouseOverCustom();
                        if (customNumber >= 0) {
                            deleteCustom(customNumber);
                        }
                        var outputNumber = mouseOverOutput();
                        if (outputNumber >= 0) {
                            deleteOutput(outputNumber);
                        }
                        var inputNumber = mouseOverInput();
                        if (inputNumber >= 0) {
                            deleteInput(inputNumber);
                        }
                        var diodeNumber = mouseOverDiode();
                        if (diodeNumber >= 0) {
                            deleteDiode(diodeNumber);
                        }
                    }
                    if (wireMode == 'delete') { // A wire should be deleted
                        var oldSegments = segments.slice(0);
                        var existing = false;
                        for (var i = pwSegments.length - 1; i >= 0; i--) {
                            var exists = segmentExists(pwSegments[i].startX, pwSegments[i].startY, pwSegments[i].endX, pwSegments[i].endY);
                            if (exists >= 0) {
                                existing = true;
                                segments.splice(exists, 1);
                            }
                        }
                        if (existing) {
                            pushUndoAction('reWire', 0, [oldSegments.slice(0), conpoints.slice(0)]); // Push the action, if more than 0 segments were deleted
                        }
                        pwSegments = [];
                        wireMode = 'none';
                        lockElements = false;
                        doConpoints();
                    }
                    break;
                case 'none':
                    break;
                case 'select':
                    // Selection done, give the rectangle coordinates and dimensions to the handling function
                    handleSelection(selectStartX, selectStartY, mouseX / transform.zoom - transform.dx, mouseY / transform.zoom - transform.dy);
                    selectMode = 'end';
                    break;
                default:
                    console.log('Control Mode not supported!');
            }
        }
        // Enable or disable the Undo-Redo buttons
        redoButton.elt.disabled = (actionRedo.length == 0);
        undoButton.elt.disabled = (actionUndo.length == 0);
    } else {
        pwSegments = []; // Not shure if this else branch has any purpose...
        wireMode = 'none';
        lockElements = false;
    }
    reDraw();
}

/*
    Returns the number of the gate where the mouse is over, default -1
*/
function mouseOverGate() {
    // Iterate backwards so that in overlapping situations
    // the last added gets removed first
    for (var i = gates.length - 1; i >= 0; i--) {
        if (gates[i].mouseOver()) {
            return i;
        }
    }
    return -1; // Return -1 if mouse isn't over a gate
}

function mouseOverCustom() {
    // Iterate backwards so that in overlapping situations
    // the last added gets removed first
    for (var i = customs.length - 1; i >= 0; i--) {
        if (customs[i].mouseOver() && customs[i].visible) {
            return i;
        }
    }
    return -1; // Return -1 if mouse isn't over a gate
}

/*
    Determines if the mouse is over an output
    Output number, if found, -1 else
*/
function mouseOverOutput() {
    for (var i = outputs.length - 1; i >= 0; i--) {
        if (outputs[i].mouseOver()) {
            return i;
        }
    }
    return -1;
}

/*
    Determines if the mouse is over an input
    Input number, if found, -1 else
*/
function mouseOverInput() {
    for (var i = inputs.length - 1; i >= 0; i--) {
        if (inputs[i].mouseOver()) {
            return i;
        }
    }
    return -1;
}

function mouseOverDiode() {
    for (var i = diodes.length - 1; i >= 0; i--) {
        if (diodes[i].mouseOver()) {
            return i;
        }
    }
    return -1;
}

function mouseOverGUI() {
    if (propInput + propOutput < -1) {
        return (mouseY < 0) || (mouseX < 0);
    } else {
        return (mouseY < 0) || (mouseX < 0) || (mouseY < 60 && mouseX > window.width - 130);
    }
}