// File: mouse.js

// Variables for zooming
let maxZoom = 2.0;
let minZoom = 0.2;
let origX = 0;
let origY = 0;

let lockElements = false; // For delete mode, ensures that wires can be deleted without
// accidentally deleting other elements

let previewSymbol = null;

/*
    Triggers when the mouse wheel is used
*/
function mouseWheel(event) {
    if (keyIsDown(18) && !simRunning) {
        wheel = Math.sign(event.deltaY); // -1 for zoom in, +1 for zoom out
        addType = Math.max(1, Math.min(9, addType + wheel));
        console.log(addType);
        switch (addType) {
            case 1:
                andClicked(true);
                break;
            case 2:
                orClicked(true);
                break;
            case 3:
                xorClicked(true);
                break;
            case 4:
                inputClicked(true);
                break;
            case 5:
                buttonClicked(true);
                break;
            case 6:
                clockClicked(true);
                break;
            case 7:
                outputClicked(true);
                break;
            case 8:
                segDisplayClicked(true);
                break;
            case 9:
                labelButtonClicked(true);
                break;
            default:
                console.log('Invalid object type!');
                break;

        }
        if (ctrlMode !== 'none' && selectMode === 'none') {
            setPropMode(false);
        }
        if (ctrlMode !== 'addObject' || (addType > 3 || addType === 0)) {
            gateInputSelect.hide();
            labelGateInputs.hide();
        }
        if (ctrlMode !== 'addObject' || ((addType > 3 || addType === 0) && addType !== 10)) {
            directionSelect.hide();
            labelDirection.hide();
        }
        if (ctrlMode !== 'addObject' || addType !== 8) {
            bitSelect.hide();
            labelBits.hide();
        }
        return;
    }
    if (mouseX > 0 && mouseY > 0) {
        wheel = Math.sign(event.deltaY) * 1.5; // -1.5 for zoom in, +1.5 for zoom out
        if ((gridSize + 1 < maxZoom * GRIDSIZE && wheel < 1) || (gridSize - 1 > minZoom * GRIDSIZE) && wheel > 1) {
            origX = mouseX * (transform.zoom);
            origY = mouseY * (transform.zoom);
            transform.dx += (origX - (mouseX * (((gridSize - wheel) / GRIDSIZE)))) * (GRIDSIZE / (gridSize - wheel)) * (GRIDSIZE / (gridSize - wheel));
            transform.dy += (origY - (mouseY * (((gridSize - wheel) / GRIDSIZE)))) * (GRIDSIZE / (gridSize - wheel)) * (GRIDSIZE / (gridSize - wheel));
            gridSize -= wheel;

        }
        transform.zoom = (gridSize / GRIDSIZE);
        if (!simRunning) {
            reDraw();
        }
    }
    updateCursors();
}

function mouseMoved() {
    updateCursors();
}

function updateCursors() {
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
            for (const elem of labels) {
                if (elem.mouseOver()) {
                    hand = true;
                    cursor(HAND);
                }
            }
            for (const elem of gates) {
                for (const e of elem.inputClickBoxes) {
                    if (e.mouseOver()) {
                        hand = true;
                        cursor(HAND);
                    }
                }
                for (const e of elem.outputClickBoxes) {
                    if (e.mouseOver()) {
                        hand = true;
                        cursor(HAND);
                    }
                }
            }
            for (const elem of segDisplays) {
                for (const e of elem.inputClickBoxes) {
                    if (e.mouseOver()) {
                        hand = true;
                        cursor(HAND);
                    }
                }
            }
            for (const elem of customs) {
                if (!elem.visible) {
                    continue;
                }
                for (const e of elem.inputClickBoxes) {
                    if (e.mouseOver()) {
                        hand = true;
                        cursor(HAND);
                    }
                }
                for (const e of elem.outputClickBoxes) {
                    if (e.mouseOver()) {
                        hand = true;
                        cursor(HAND);
                    }
                }
            }
            if (rightAngle(Math.round((mouseX / transform.zoom - transform.dx) / (GRIDSIZE / 2)) * (GRIDSIZE / 2), Math.round((mouseY / transform.zoom - transform.dy) / (GRIDSIZE / 2)) * (GRIDSIZE / 2))) {
                hand = true;
                cursor(HAND);
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
    if (ctrlMode === 'select' && sClickBox.mouseOver() && showSClickBox) {
        hand = true;
        cursor(MOVE);
    }
    if (!hand) {
        cursor(ARROW);
    }

    // Repositions and draws the component, so the user will see where the gate will be placed
    // First checks whether and/or/xor gates or switch/button/clock/segmentDisplay are chosen 
    if(ctrlMode === 'addObject' && !mouseOverGUI() && previewSymbol !== null){
        if(0 >= addType <= 9){
            // Prevents that a gate is created over an existing gate
            for (let i = 0; i < gates.length; i++) {
                if ((gates[i].x === Math.round(((mouseX - GRIDSIZE / 2) / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE) &&
                    (gates[i].y === Math.round(((mouseY - GRIDSIZE / 2) / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE)) {
                        return;
                    }  
            }
        }
        // Changes preview gate coordinates according to mouse position
        reDraw();
    } 
    

    if (ctrlMode === 'addObject' && addType === 'diode') {
        for (const elem of diodes) {
            if (elem.mouseOver()) {
                hand = true;
                cursor(HAND);
            }
        }
        // if two wires have a right angle, show a hand
        if (rightAngle(Math.round((mouseX / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE, Math.round((mouseY / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE)) {
            hand = true;
            cursor(HAND);
        }
    }
}

function mouseDragged() {
    if (ctrlMode === 'select' && selectMode === 'drag') {
        if (sDragX2 !== Math.round((mouseX / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE ||
            sDragY2 !== Math.round((mouseY / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE) {
            moveSelection(Math.round((mouseX / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE - sDragX2,
                Math.round((mouseY / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE - sDragY2);
            sDragX2 = Math.round((mouseX / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE;
            sDragY2 = Math.round((mouseY / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE;
        }
    }
}

/*
    Executed when a mouse button is pressed down
*/
function mousePressed() {
    if (ctrlMode !== 'select') {
        showSClickBox = false;
    }
    if (wireMode === 'hold') {
        wireMode = 'none';
    }
    if (!simRunning && !mouseOverGUI() && (mouseButton === LEFT)) {
        switch (ctrlMode) {
            case 'none':
                switch (wireMode) {
                    case 'none':
                        wireMode = 'preview';
                        pwstartX = Math.round((mouseX / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE;
                        pwstartY = Math.round((mouseY / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE;
                        break;
                    default:
                }
                break;
            case 'addObject':
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
                        reDraw();
                        break;
                    case 'end':
                        selectStartX = Math.round(((mouseX + GRIDSIZE / 2) / transform.zoom - transform.dx - GRIDSIZE / 2) / GRIDSIZE) * GRIDSIZE - GRIDSIZE / 2;
                        selectStartY = Math.round(((mouseY + GRIDSIZE / 2) / transform.zoom - transform.dy - GRIDSIZE / 2) / GRIDSIZE) * GRIDSIZE - GRIDSIZE / 2;
                        selectEndX = Math.round(((mouseX + GRIDSIZE / 2) / transform.zoom - transform.dx - GRIDSIZE / 2) / GRIDSIZE) * GRIDSIZE + GRIDSIZE / 2;
                        selectEndY = Math.round(((mouseY + GRIDSIZE / 2) / transform.zoom - transform.dy - GRIDSIZE / 2) / GRIDSIZE) * GRIDSIZE + GRIDSIZE / 2;
                        selectMode = 'start';
                        if (sClickBox.mouseOver()) {
                            // Start dragging
                            sDragX1 = Math.round((mouseX / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE;
                            sDragY1 = Math.round((mouseY / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE;
                            sDragX2 = Math.round((mouseX / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE;
                            sDragY2 = Math.round((mouseY / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE;
                            if (initX === 0 || initY === 0) {
                                initX = sDragX1;
                                initY = sDragY1;
                            }
                            selectMode = 'drag';
                        } else {
                            setControlMode('none');
                            setActive(propertiesButton);
                            pushSelectAction(sDragX2 - initX, sDragY2 - initY, sClickBox.x - sClickBox.w / 2, sClickBox.y - sClickBox.h / 2,
                                sClickBox.x + sClickBox.w / 2, sClickBox.y + sClickBox.w / 2);
                            initX = 0;
                            initY = 0;
                        }
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
    if (ctrlMode !== 'none' && selectMode === 'none') {
        setPropMode(false);
    }
    if (ctrlMode !== 'addObject' || (addType > 3 || addType === 0)) {
        gateInputSelect.hide();
        labelGateInputs.hide();
    }
    if (ctrlMode !== 'addObject' || ((addType > 3 || addType === 0) && addType !== 10)) {
        directionSelect.hide();
        labelDirection.hide();
    }
    if (ctrlMode !== 'addObject' || addType !== 8) {
        bitSelect.hide();
        labelBits.hide();
    }
    if (!simRunning && !mouseOverGUI()) {
        switch (ctrlMode) {
            case 'addObject':
                if (wireMode !== 'hold') {
                    switch (addType) { // Handle object adding
                        case 1:
                        case 2:
                        case 3:
                            if (mouseButton === LEFT) {
                                addGate(addType, gateInputCount, gateDirection);
                            }
                            break;
                        case 10:
                            if (mouseButton === LEFT) {
                                addCustom(custFile, gateDirection);
                            }
                            break;
                        case 7:
                            if (mouseButton === LEFT) {
                                addOutput();
                            }
                            break;
                        case 8:
                            if (mouseButton === LEFT) {
                                addSegDisplay(segBits);
                                setTimeout(reDraw, 50);
                            }
                            break;
                        case 4:
                        case 5:
                        case 6:
                            if (mouseButton === LEFT) {
                                addInput();
                            }
                            break;
                        case 9:
                            addLabel();
                            break;
                        case 'none':
                            break;
                        default:
                            console.log('Invalid object type!');
                    }
                }
                break;
            case 'none':
                break;
            default:
                break;
        }
        redoButton.elt.disabled = (actionRedo.length === 0);
        undoButton.elt.disabled = (actionUndo.length === 0);
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
        if (mouseButton === LEFT) {
            switch (ctrlMode) {
                case 'addObject':
                    if (wireMode === 'preview') { // If the preview wire mode is active
                        let pushed = false;
                        for (let i = 0; i < pwSegments.length; i++) { // Push all preview segments to the existing segments
                            if (segmentExists(pwSegments[i].startX, pwSegments[i].startY, pwSegments[i].endX, pwSegments[i].endY) < 0) {
                                pushed = true;
                            }
                        }
                        if (pushed) {
                            let oldSegments = [];
                            for (let i = segments.length - 1; i >= 0; i--) {
                                oldSegments[i] = new WSeg(segments[i].direction, segments[i].startX, segments[i].startY, false, segments[i].transform);
                            }
                            pushUndoAction('reWire', 0, [oldSegments.slice(0), conpoints.slice(0)]); // push the action for undoing
                        }
                        for (let i = 0; i < pwSegments.length; i++) { // Push all preview segments to the existing segments
                            if (segmentExists(pwSegments[i].startX, pwSegments[i].startY, pwSegments[i].endX, pwSegments[i].endY) < 0) {
                                segments.push(pwSegments[i]);
                            }
                        }
                        findLines();
                        lockElements = false;
                        pwSegments = []; // delete the preview segments
                        if (pushed) {
                            wireMode = 'hold'; // wiring done, reset wireMode
                        } else {
                            wireMode = 'none';
                        }
                        doConpoints(); // Update all conpoints and diodes
                    }
                    break;
                case 'none':
                    if (wireMode === 'preview') { // If the preview wire mode is active
                        let pushed = false;
                        for (let i = 0; i < pwSegments.length; i++) { // Push all preview segments to the existing segments
                            if (segmentExists(pwSegments[i].startX, pwSegments[i].startY, pwSegments[i].endX, pwSegments[i].endY) < 0) {
                                pushed = true;
                            }
                        }
                        if (pushed) {
                            let oldSegments = [];
                            for (let i = segments.length - 1; i >= 0; i--) {
                                oldSegments[i] = new WSeg(segments[i].direction, segments[i].startX, segments[i].startY, false, segments[i].transform);
                            }
                            pushUndoAction('reWire', 0, [oldSegments.slice(0), conpoints.slice(0)]); // push the action for undoing
                        }
                        for (let i = 0; i < pwSegments.length; i++) { // Push all preview segments to the existing segments
                            if (segmentExists(pwSegments[i].startX, pwSegments[i].startY, pwSegments[i].endX, pwSegments[i].endY) < 0) {
                                segments.push(pwSegments[i]);
                            }
                        }
                        findLines();
                        lockElements = false;
                        pwSegments = []; // delete the preview segments
                        if (pushed) {
                            wireMode = 'hold'; // wiring done, reset wireMode
                        } else {
                            wireMode = 'none';
                        }
                        doConpoints(); // Update all conpoints and diodes
                    }
                    if (wireMode === 'none') {
                        // Invert In-/Outputs
                        for (let i = 0; i < gates.length; i++) {
                            for (let j = 0; j < gates[i].inputCount; j++) {
                                if (gates[i].mouseOverInput(j)) {
                                    gates[i].invertInput(j);
                                    let act = new Action('invGIP', [i, j], null);
                                    actionUndo.push(act);
                                }
                            }
                            for (let j = 0; j < gates[i].outputCount; j++) {
                                if (gates[i].mouseOverOutput(j)) {
                                    gates[i].invertOutput(j);
                                    let act = new Action('invGOP', [i, j], null);
                                    actionUndo.push(act);
                                }
                            }
                        }
                        for (let i = 0; i < customs.length; i++) {
                            if (customs[i].visible) {
                                for (let j = 0; j < customs[i].inputCount; j++) {
                                    if (customs[i].mouseOverInput(j)) {
                                        customs[i].invertInput(j);
                                        let act = new Action('invCIP', [i, j], null);
                                        actionUndo.push(act);
                                    }
                                }
                                for (let j = 0; j < customs[i].outputCount; j++) {
                                    if (customs[i].mouseOverOutput(j)) {
                                        customs[i].invertOutput(j);
                                        let act = new Action('invCOP', [i, j], null);
                                        actionUndo.push(act);
                                    }
                                }
                            }
                        }
                        for (let i = 0; i < segDisplays.length; i++) {
                            for (let j = 0; j < segDisplays[i].inputCount; j++) {
                                if (segDisplays[i].mouseOverInput(j)) {
                                    segDisplays[i].invertInput(j);
                                    let act = new Action('invDIP', [i, j], null);
                                    actionUndo.push(act);
                                }
                            }
                        }
                        let noValidTarget = true;
                        for (let i = 0; i < inputs.length; i++) {
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
                        for (let i = 0; i < outputs.length; i++) {
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
                        for (let i = 0; i < labels.length; i++) {
                            if (Boolean(labels[i].mouseOver()) && propMode) {
                                noValidTarget = false;
                                if (propLabel !== i) {
                                    if (propLabel >= 0) {
                                        labels[propLabel].mark(false);
                                    }
                                    labels[i].mark(true);
                                    propLabel = i;
                                    showLabelPropMenu();
                                }
                            }
                        }
                        if (noValidTarget && propMode) {
                            hidePropMenu();
                            unmarkPropTargets();
                        }
                        if (fullCrossing(Math.round((mouseX / transform.zoom - transform.dx) / (GRIDSIZE / 2)) * (GRIDSIZE / 2), Math.round((mouseY / transform.zoom - transform.dy) / (GRIDSIZE / 2)) * (GRIDSIZE / 2))) {
                            toggleDiodeAndConpoint();
                        } else if (rightAngle(Math.round((mouseX / transform.zoom - transform.dx) / (GRIDSIZE / 2)) * (GRIDSIZE / 2), Math.round((mouseY / transform.zoom - transform.dy) / (GRIDSIZE / 2)) * (GRIDSIZE / 2))) {
                            toggleDiode();
                        }
                    }
                    break;
                case 'delete': // If the delete mode is active
                    if (!lockElements) {
                        // Delete elements with mouseOver
                        let gateNumber = mouseOverGate();
                        if (gateNumber >= 0) {
                            deleteGate(gateNumber);
                        }
                        let customNumber = mouseOverCustom();
                        if (customNumber >= 0) {
                            deleteCustom(customNumber);
                        }
                        let outputNumber = mouseOverOutput();
                        if (outputNumber >= 0) {
                            deleteOutput(outputNumber);
                        }
                        let inputNumber = mouseOverInput();
                        if (inputNumber >= 0) {
                            deleteInput(inputNumber);
                        }
                        let diodeNumber = mouseOverDiode();
                        if (diodeNumber >= 0) {
                            deleteDiode(diodeNumber);
                        }
                        let labelNumber = mouseOverLabel();
                        if (labelNumber >= 0) {
                            deleteLabel(labelNumber);
                        }
                        let segDisNumber = mouseOverSegDisplay();
                        if (segDisNumber >= 0) {
                            deleteSegDisplay(segDisNumber);
                        }
                    }
                    if (wireMode === 'delete') { // A wire should be deleted
                        let oldSegments = segments.slice(0);
                        let existing = false;
                        for (let i = pwSegments.length - 1; i >= 0; i--) {
                            let exists = segmentExists(pwSegments[i].startX, pwSegments[i].startY, pwSegments[i].endX, pwSegments[i].endY);
                            if (exists >= 0) {
                                existing = true;
                                segments.splice(exists, 1);
                            }
                        }
                        if (existing) {
                            pushUndoAction('reWire', 0, [oldSegments.slice(0), conpoints.slice(0)]); // Push the action, if more than 0 segments were deleted
                            findLines();
                        }
                        pwSegments = [];
                        wireMode = 'none';
                        lockElements = false;
                        doConpoints();
                    }
                    break;
                case 'select':
                    switch (selectMode) {
                        case 'start':
                            // Selection done, give the rectangle coordinates and dimensions to the handling function
                            handleSelection(Math.min(selectStartX, selectEndX), Math.min(selectStartY, selectEndY),
                                Math.max(selectStartX, selectEndX), Math.max(selectStartY, selectEndY));
                            selectMode = 'end';
                            break;
                        case 'drag':
                            finishSelection();
                            selectMode = 'end';
                            break;
                        default:
                    }
                    break;
                default:
                    console.log('Control Mode not supported!');
            }
        }
        // Enable or disable the Undo-Redo buttons
        redoButton.elt.disabled = (actionRedo.length === 0);
        undoButton.elt.disabled = (actionUndo.length === 0);
    } else {
        pwSegments = [];
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
    for (let i = gates.length - 1; i >= 0; i--) {
        if (gates[i].mouseOver()) {
            return i;
        }
    }
    return -1; // Return -1 if mouse isn't over a gate
}

function mouseOverCustom() {
    // Iterate backwards so that in overlapping situations
    // the last added gets removed first
    for (let i = customs.length - 1; i >= 0; i--) {
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
    for (let i = outputs.length - 1; i >= 0; i--) {
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

function mouseOverLabel() {
    for (var i = labels.length - 1; i >= 0; i--) {
        if (labels[i].mouseOver()) {
            return i;
        }
    }
    return -1;
}

function mouseOverSegDisplay() {
    for (var i = segDisplays.length - 1; i >= 0; i--) {
        if (segDisplays[i].mouseOver()) {
            return i;
        }
    }
    return -1;
}

//Checks if the mouse hovers over the GUI(true) or the grid(false)
function mouseOverGUI() {
    if (propInput + propOutput + propLabel < -2) {
        return (mouseY < 0) || (mouseX < 0);
    } else {
        return (mouseY < 0) || (mouseX < 0) || (mouseY > window.height - 300 && mouseX > window.width - 215);

    }
}