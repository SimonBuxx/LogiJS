// File: mouse.js

// Variables for zooming
let maxZoom = 2.0;
let minZoom = 0.2;
let origX = 0;
let origY = 0;

let lockElements = false; // For delete mode, ensures that wires can be deleted without accidentally deleting other elements

/*
    Triggers when the mouse wheel is used
*/
function mouseWheel(event) {
    if (loading || mouseOverGUI() || modifierMenuDisplayed()) { return; }
    if (keyIsDown(18) && !simRunning) { // If the alt key is pressed => scroll trough basic elements
        wheel = Math.sign(event.deltaY);
        addType = Math.max(1, Math.min(9, addType + wheel));
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
        if (controlMode !== 'modify' && selectMode === 'none') {
            leaveModifierMode();
        }
        return;
    }

    if (mouseX > 0 && mouseY > 0) {
        wheel = Math.sign(event.deltaY) * 1.5; // -1.5 for zoom in, +1.5 for zoom out
        if ((currentGridSize + 1 < maxZoom * GRIDSIZE && wheel < 1) || (currentGridSize - 1 > minZoom * GRIDSIZE) && wheel > 1) {
            origX = mouseX * (transform.zoom);
            origY = mouseY * (transform.zoom);
            transform.dx += (origX - (mouseX * (((currentGridSize - wheel) / GRIDSIZE)))) * (GRIDSIZE / (currentGridSize - wheel)) * (GRIDSIZE / (currentGridSize - wheel));
            transform.dy += (origY - (mouseY * (((currentGridSize - wheel) / GRIDSIZE)))) * (GRIDSIZE / (currentGridSize - wheel)) * (GRIDSIZE / (currentGridSize - wheel));
            currentGridSize -= wheel;

        }
        transform.zoom = (currentGridSize / GRIDSIZE);
        dragSpeed = 1 / transform.zoom;
        if (!simRunning && !showCustomDialog) {
            reDraw();
        }
    }
    updateCursors();
}

function mouseMoved() {
    if (loading || modifierMenuDisplayed()) { return; }
    updateCursors();
}

function updateCursors() {
    let negDir = 0;
    let negPort = null;
    let isOutput = false;
    let isTop = false;
    let hand = false;
    let showDPreview = false;
    let showCPPreview = false;
    if ((simRunning || controlMode === 'modify') && !showCustomDialog) {
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
                        negDir = elem.direction;
                        negPort = e;
                        isOutput = false;
                    }
                }
                for (const e of elem.outputClickBoxes) {
                    if (e.mouseOver()) {
                        hand = true;
                        cursor(HAND);
                        negDir = elem.direction;
                        negPort = e;
                        isOutput = true;
                    }
                }
            }
            for (const elem of segDisplays) {
                for (const e of elem.inputClickBoxes) {
                    if (e.mouseOver()) {
                        hand = true;
                        cursor(HAND);
                        negDir = 3;
                        negPort = e;
                        isOutput = false;
                    }
                }
            }
            for (const elem of customs) {
                if (!elem.visible) {
                    continue;
                }
                for (let i = 0; i < elem.inputClickBoxes.length; i++) {
                    if (elem.inputClickBoxes[i].mouseOver()) {
                        hand = true;
                        cursor(HAND);
                        negDir = elem.direction;
                        negPort = elem.inputClickBoxes[i];
                        isOutput = false;
                        isTop = elem.objects[INPNUM][i].isTop; // Seems to work
                    }
                }
                for (const e of elem.outputClickBoxes) {
                    if (e.mouseOver()) {
                        hand = true;
                        cursor(HAND);
                        negDir = elem.direction;
                        negPort = e;
                        isOutput = true;
                    }
                }
            }
            if (fullCrossing(Math.round((mouseX / transform.zoom - transform.dx) / (GRIDSIZE / 2)) * (GRIDSIZE / 2), Math.round((mouseY / transform.zoom - transform.dy) / (GRIDSIZE / 2)) * (GRIDSIZE / 2))) {
                hand = true;
                cursor(HAND);
                if (isConPoint(Math.round((mouseX / transform.zoom - transform.dx) / (GRIDSIZE / 2)) * (GRIDSIZE / 2), Math.round((mouseY / transform.zoom - transform.dy) / (GRIDSIZE / 2)) * (GRIDSIZE / 2)) < 0 ||
                    isDiode(Math.round((mouseX / transform.zoom - transform.dx) / (GRIDSIZE / 2)) * (GRIDSIZE / 2), Math.round((mouseY / transform.zoom - transform.dy) / (GRIDSIZE / 2)) * (GRIDSIZE / 2)) >= 0) {
                    showDPreview = true;
                } else {
                    showCPPreview = true;
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
    if (showCustomDialog) {
        let pos = mouseOverImport(Math.round(window.width / 8) + 40, 90, customDialogRows, customDialogColumns);
        let place = customDialogColumns * pos.row + pos.col + customDialogPage * customDialogColumns * customDialogRows;
        if (pos.col >= 0 && pos.row >= 0 && place < importSketchData.sketches.length) {
            hand = true;
            cursor(HAND);
            if (importSketchData.looks[place].outputs === 0) {
                hand = true;
                cursor('not-allowed');
            }
        }
    }
    if (controlMode === 'select' && selectionBox.mouseOver() && showSelectionBox) {
        hand = true;
        cursor(MOVE);
    }
    if (!hand) {
        cursor(ARROW);
    }
    if (showCustomDialog) {
        return;
    }
    if (removeOldPreview) {
        reDraw();
        removeOldPreview = false;
    }
    if (showDPreview) {
        showPreview('diode', Math.round((mouseX / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE, Math.round((mouseY / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE);
        removeOldPreview = true;
    }
    if (showCPPreview) {
        showPreview('conpoint', Math.round((mouseX / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE, Math.round((mouseY / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE);
        removeOldPreview = true;
    }
    if (negPort !== null) {
        showNegationPreview(negPort, isOutput, negDir, isTop);
        removeOldPreview = true;
    }
}

function mouseDragged() {
    if (loading || showCustomDialog || modifierMenuDisplayed()) { return; }
    if (controlMode === 'select' && selectMode === 'drag') {
        if (sDragX2 !== Math.round((mouseX / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE ||
            sDragY2 !== Math.round((mouseY / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE) {
            moveSelection(Math.round((mouseX / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE - sDragX2,
                Math.round((mouseY / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE - sDragY2);
            finishSelection();
            sDragX2 = Math.round((mouseX / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE;
            sDragY2 = Math.round((mouseY / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE;
        }
    }
}

/*
    Executed when a mouse button is pressed down
*/
function mousePressed() {
    if (modifierMenuDisplayed() && !mouseOverGUI()) {
        clickedOutOfGUI = true;
    } else {
        clickedOutOfGUI = false;
    }
    console.log(clickedOutOfGUI);
    if (loading || showCustomDialog || modifierMenuDisplayed()) { return; }

    if (controlMode !== 'select') {
        showSelectionBox = false;
    }
    if (wireMode === 'hold') {
        wireMode = 'none';
    }
    if (!simRunning && !mouseOverGUI() && (mouseButton === LEFT)) {
        switch (controlMode) {
            case 'modify':
                switch (wireMode) {
                    case 'none':
                        wireMode = 'preview';
                        wirePreviewStartX = Math.round((mouseX / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE;
                        wirePreviewStartY = Math.round((mouseY / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE;
                        break;
                    default:
                }
                break;
            case 'addObject':
                switch (wireMode) {
                    case 'none':
                        wireMode = 'preview';
                        wirePreviewStartX = Math.round((mouseX / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE;
                        wirePreviewStartY = Math.round((mouseY / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE;
                        break;
                    default:
                }
                break;
            case 'delete':
                wirePreviewStartX = Math.round((mouseX / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE;
                wirePreviewStartY = Math.round((mouseY / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE;
                wireMode = 'delete';
                break;
            case 'select':
                switch (selectMode) {
                    case 'none':
                        selectStartX = Math.round(((mouseX + GRIDSIZE / 2) / transform.zoom - transform.dx - GRIDSIZE / 2) / GRIDSIZE) * GRIDSIZE - GRIDSIZE / 2;
                        selectStartY = Math.round(((mouseY + GRIDSIZE / 2) / transform.zoom - transform.dy - GRIDSIZE / 2) / GRIDSIZE) * GRIDSIZE - GRIDSIZE / 2;
                        setSelectMode('start');
                        reDraw();
                        break;
                    case 'end':
                        selectEndX = Math.round(((mouseX + GRIDSIZE / 2) / transform.zoom - transform.dx - GRIDSIZE / 2) / GRIDSIZE) * GRIDSIZE + GRIDSIZE / 2;
                        selectEndY = Math.round(((mouseY + GRIDSIZE / 2) / transform.zoom - transform.dy - GRIDSIZE / 2) / GRIDSIZE) * GRIDSIZE + GRIDSIZE / 2;
                        setSelectMode('start');
                        if (selectionBox.mouseOver()) {
                            // Start dragging
                            sDragX1 = Math.round((mouseX / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE;
                            sDragY1 = Math.round((mouseY / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE;
                            sDragX2 = Math.round((mouseX / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE;
                            sDragY2 = Math.round((mouseY / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE;
                            if (initX === 0 || initY === 0) {
                                initX = sDragX1;
                                initY = sDragY1;
                            }
                            setSelectMode('drag');
                        } else {
                            enterModifierMode();
                            pushSelectAction(sDragX2 - initX, sDragY2 - initY, selectionBox.x - selectionBox.w / 2, selectionBox.y - selectionBox.h / 2,
                                selectionBox.x + selectionBox.w / 2, selectionBox.y + selectionBox.h / 2);
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
    if (showCustomDialog) {
        let pos = mouseOverImport(Math.round(window.width / 8) + 40, 90, customDialogRows, customDialogColumns);
        if (pos.row >= 0 && pos.col >= 0) {
            importItemClicked(pos.row, pos.col);
        }
        return;
    }
    if (loading || modifierMenuDisplayed()) {
        return;
    }
    if (!simRunning && !mouseOverGUI()) {
        switch (controlMode) {
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
                        case 11:
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
                                addSegDisplay(sevenSegmentBits);
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
    if (loading || showCustomDialog) { return; }
    let justClosedMenu = false;
    if (modifierMenuDisplayed()) {
        if (!mouseOverGUI() && clickedOutOfGUI) {
            closeModifierMenu();
            unmarkPropTargets();
            justClosedMenu = true;
        }
    }
    if (!simRunning && !mouseOverGUI()) {
        if (mouseButton === LEFT) {
            switch (controlMode) {
                case 'addObject':
                    if (wireMode === 'preview') { // If the preview wire mode is active
                        let pushed = false;
                        for (let i = 0; i < pwSegments.length; i++) { // Push all preview segments to the existing segments
                            if (segmentExists(pwSegments[i].startX, pwSegments[i].startY, pwSegments[i].endX, pwSegments[i].endY) < 0) {
                                pushed = true;
                            }
                        }
                        if (pushed) {
                            let oldWires = [];
                            for (let i = wires.length - 1; i >= 0; i--) {
                                oldWires[i] = new Wire(wires[i].direction, wires[i].startX, wires[i].startY, false, wires[i].transform);
                                oldWires[i].endX = wires[i].endX;
                                oldWires[i].endY = wires[i].endY;
                                oldWires[i].id = wires[i].id;
                            }
                            let oldSegments = [];
                            for (let i = segments.length - 1; i >= 0; i--) {
                                oldSegments[i] = new Wire(segments[i].direction, segments[i].startX, segments[i].startY, false, segments[i].transform);
                                oldSegments[i].id = segments[i].id;
                            }
                            pushUndoAction('reWire', 0, [_.cloneDeep(oldSegments), _.cloneDeep(oldWires), _.cloneDeep(conpoints)]); // push the action for undoing
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
                case 'modify':
                    if (!justClosedMenu) {
                        if (wireMode === 'preview') { // If the preview wire mode is active
                            let pushed = false;
                            for (let i = 0; i < pwSegments.length; i++) { // Push all preview segments to the existing segments
                                if (segmentExists(pwSegments[i].startX, pwSegments[i].startY, pwSegments[i].endX, pwSegments[i].endY) < 0) {
                                    pushed = true;
                                }
                            }
                            if (pushed) {
                                let oldWires = [];
                                for (let i = wires.length - 1; i >= 0; i--) {
                                    oldWires[i] = new Wire(wires[i].direction, wires[i].startX, wires[i].startY, false, wires[i].transform);
                                    oldWires[i].endX = wires[i].endX;
                                    oldWires[i].endY = wires[i].endY;
                                    oldWires[i].id = wires[i].id;
                                }
                                let oldSegments = [];
                                for (let i = segments.length - 1; i >= 0; i--) {
                                    oldSegments[i] = new Wire(segments[i].direction, segments[i].startX, segments[i].startY, false, segments[i].transform);
                                    oldSegments[i].id = segments[i].id;
                                }
                                pushUndoAction('reWire', 0, [_.cloneDeep(oldSegments), _.cloneDeep(oldWires), _.cloneDeep(conpoints)]); // push the action for undoing
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
                            if (fullCrossing(Math.round((mouseX / transform.zoom - transform.dx) / (GRIDSIZE / 2)) * (GRIDSIZE / 2), Math.round((mouseY / transform.zoom - transform.dy) / (GRIDSIZE / 2)) * (GRIDSIZE / 2))) {
                                toggleDiodeAndConpoint();
                            }
                            for (let i = 0; i < inputs.length; i++) {
                                if (inputs[i].mouseOver() && controlMode === 'modify') {
                                    if (inputToModify !== i) {
                                        if (inputToModify >= 0) {
                                            inputs[inputToModify].mark(false);
                                        }
                                        inputs[i].mark(true);
                                        inputToModify = i;
                                        sequencerAdjusted = false;
                                        showModifierMenu();
                                        showInputPropMenu();
                                        positionModifierElements();
                                        wireMode = 'none';
                                        reDraw();
                                    }
                                }
                            }
                            for (let i = 0; i < outputs.length; i++) {
                                if (outputs[i].mouseOver() && controlMode === 'modify') {
                                    if (outputToModify !== i) {
                                        if (outputToModify >= 0) {
                                            outputs[outputToModify].mark(false);
                                        }
                                        outputs[i].mark(true);
                                        outputToModify = i;
                                        sequencerAdjusted = false;
                                        showModifierMenu();
                                        showOutputPropMenu();
                                        positionModifierElements();
                                        wireMode = 'none';
                                        reDraw();
                                    }
                                }
                            }
                            for (let i = 0; i < labels.length; i++) {
                                if (labels[i].mouseOver() && controlMode === 'modify') {
                                    if (labelToModify !== i) {
                                        if (labelToModify >= 0) {
                                            labels[labelToModify].mark(false);
                                        }
                                        labels[i].mark(true);
                                        labelToModify = i;
                                        sequencerAdjusted = false;
                                        showModifierMenu();
                                        showLabelPropMenu();
                                        positionModifierElements();
                                        wireMode = 'none';
                                        reDraw();
                                    }
                                }
                            }
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
                        let oldWires = _.cloneDeep(wires);
                        let oldSegments = _.cloneDeep(segments);
                        let existing = false;
                        for (let i = pwSegments.length - 1; i >= 0; i--) {
                            let exists = segmentExists(pwSegments[i].startX, pwSegments[i].startY, pwSegments[i].endX, pwSegments[i].endY);
                            if (exists >= 0) {
                                existing = true;
                                segments.splice(exists, 1);
                            }
                        }
                        if (existing) {
                            pushUndoAction('reWire', 0, [oldSegments, oldWires, _.cloneDeep(conpoints)]); // Push the action, if more than 0 segments were deleted
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
                                setSelectMode('end');
                            break;
                        case 'drag':
                            setSelectMode('end');
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

/*
    baseX, baseY: Top left corner where the first preview image starts
*/
function mouseOverImport(baseX, baseY, rows, cols) {
    let mx = mouseX - baseX;
    let my = mouseY - baseY;
    if (mx % 240 > 200 || my % 240 > 200) {
        return {
            row: -1,
            col: -1
        };
    }
    mx = Math.floor(mx / 240);
    my = Math.floor(my / 240);
    if (my >= rows || mx >= cols || mx < 0 || my < 0) {
        return {
            row: -1,
            col: -1
        };
    }
    return {
        row: my,
        col: mx
    };
}

//Checks if the mouse hovers over the GUI(true) or the grid(false)
function mouseOverGUI() {
    /*if (mouseY > window.height - 220 && mouseX < 970 && showHints) {
        return true;
    }*/
    if (controlMode === 'modify' && inputToModify + outputToModify + labelToModify >= -2) {
        return (mouseY < 0) || (mouseX < 0) || mouseX >= modifierMenuX && mouseX <= modifierMenuX + 250 && mouseY >= modifierMenuY && mouseY <= modifierMenuY + 150;
    }
    return (mouseY < 0) || (mouseX < 0);
}

/*
    Handles the dragging of the canvas
    by calculating dx and dy
*/
function handleDragging() {
    if (loading || showCustomDialog || modifierMenuDisplayed()) { return; }
    if (mouseIsPressed && mouseButton === RIGHT && mouseX > 0 && mouseY > 0) {
        if (lastX !== 0) {
            transform.dx += Math.round((mouseX - lastX) * dragSpeed);
        }
        if (lastY !== 0) {
            transform.dy += Math.round((mouseY - lastY) * dragSpeed);
        }
        lastX = mouseX;
        lastY = mouseY;
        if (!simRunning) {
            reDraw();
        }
    } else {
        lastX = 0;
        lastY = 0;
    }
}