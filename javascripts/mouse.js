// File: mouse.js

// Variables for zooming
let maxZoom = 2.0;
let minZoom = 0.2;
let origX = 0;
let origY = 0;

let lockElements = false; // For delete mode, ensures that wires can be deleted without accidentally deleting other elements

let previewSymbol = null;

/*
    Triggers when the mouse wheel is used
*/
function mouseWheel(event) {
    if (loading || mouseOverGUI()) { return; }
    if (keyIsDown(18) && !simulationIsRunning) { // If the alt key is pressed => scroll trough basic elements
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
        if (controlMode !== 'none' && selectMode === 'none') {
            setPropMode(false);
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
        dragSpeed = 1 / transform.zoom;
        if (!simulationIsRunning) {
            reDraw();
        }
    }
    updateCursors();
}

function mouseMoved() {
    if (loading) { return; }
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
    if (simulationIsRunning || propMode) {
        if (!simulationIsRunning) {
            for (const elem of outputsList) {
                if (elem.mouseOver()) {
                    hand = true;
                    cursor(HAND);
                }
            }
            for (const elem of inputsList) {
                if (elem.mouseOver()) {
                    hand = true;
                    cursor(HAND);
                }
            }
            for (const elem of labelsList) {
                if (elem.mouseOver()) {
                    hand = true;
                    cursor(HAND);
                }
            }
            for (const elem of gatesList) {
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
            for (const elem of segmentDisplaysList) {
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
            for (const elem of customObjectsList) {
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
            for (const elem of inputsList) {
                if (elem.mouseOver() && !elem.getIsClock()) {
                    hand = true;
                    cursor(HAND);
                }
            }
        }
    }
    if (controlMode === 'select' && sClickBox.mouseOver() && showSClickBox) {
        hand = true;
        cursor(MOVE);
    }
    if (!hand) {
        cursor(ARROW);
    }

    // Repositions and draws the preview component, so the user will see where the gate will be placed
    // First checks whether one of the basic components is chosen 
    if(controlMode === 'addObject' && !mouseOverGUI() && previewSymbol !== null && 0 >= addType <= 9){
        // Prevents that a gate is created over an existing gate
        for (let i = 0; i < gatesList.length; i++) {
            if ((gatesList[i].x === Math.round(((mouseX - GRIDSIZE / 2) / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE) &&
                (gatesList[i].y === Math.round(((mouseY - GRIDSIZE / 2) / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE)) {
                    return;
            }  
        }
        reDraw();
    } 
    

    if (controlMode === 'addObject' && addType === 'diode') {
        for (const elem of diodesList) {
            if (elem.mouseOver()) {
                hand = true;
                cursor(HAND);
            }
        }
    }
    // if two wires have a right angle, show a hand
    if (rightAngle(Math.round((mouseX / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE, Math.round((mouseY / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE)) {
        hand = true;
        cursor(HAND);
    }
    if (showDPreview) {
        reDraw();
        showPreview('diode', Math.round((mouseX / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE, Math.round((mouseY / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE);
        diodePreviewShown = true;
    } else if (diodePreviewShown) {
        reDraw();
        diodePreviewShown = false;
    }
    if (showCPPreview) {
        reDraw();
        showPreview('conpoint', Math.round((mouseX / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE, Math.round((mouseY / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE);
        conpointPreviewShown = true;
    } else if (conpointPreviewShown) {
        reDraw();
        conpointPreviewShown = false;
    }
    if (negPort !== null) {
        reDraw();
        showNegationPreview(negPort, isOutput, negDir, isTop);
        negPreviewShown = true;
    } else if (negPreviewShown) {
        reDraw();
        negPreviewShown = false;
    }
}

function mouseDragged() {
    if (loading) { return; }
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
    if (loading) { return; }
    if (controlMode !== 'select') {
        showSClickBox = false;
    }
    if (wireMode === 'hold') {
        wireMode = 'none';
    }
    if (!simulationIsRunning && !mouseOverGUI() && (mouseButton === LEFT)) {
        switch (controlMode) {
            case 'none':
                switch (wireMode) {
                    case 'none':
                        wireMode = 'preview';
                        previewSegmentStartX = Math.round((mouseX / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE;
                        previewSegmentStartY = Math.round((mouseY / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE;
                        break;
                    default:
                }
                let noValidTarget = true;
                for (let i = 0; i < inputsList.length; i++) {
                    if (Boolean(inputsList[i].mouseOver()) && propMode) {
                        noValidTarget = false;
                        // If the propMode is active, give options to name and make top
                        if (propInput !== i) {
                            if (propInput >= 0) {
                                inputsList[propInput].mark(false);
                            }
                            inputsList[i].mark(true);
                            propInput = i;
                            showInputPropMenu();
                        }
                    }
                }
                for (let i = 0; i < outputsList.length; i++) {
                    if (Boolean(outputsList[i].mouseOver()) && propMode) {
                        noValidTarget = false;
                        if (propOutput !== i) {
                            if (propOutput >= 0) {
                                outputsList[propOutput].mark(false);
                            }
                            outputsList[i].mark(true);
                            propOutput = i;
                            showOutputPropMenu();
                        }
                    }
                }
                for (let i = 0; i < labelsList.length; i++) {
                    if (Boolean(labelsList[i].mouseOver()) && propMode) {
                        noValidTarget = false;
                        if (propLabel !== i) {
                            if (propLabel >= 0) {
                                labelsList[propLabel].mark(false);
                            }
                            labelsList[i].mark(true);
                            propLabel = i;
                            showLabelPropMenu();
                        }
                    }
                }
                if (noValidTarget && propMode) {
                    hidePropMenu();
                    unmarkPropTargets();
                }
                break;
            case 'addObject':
                switch (wireMode) {
                    case 'none':
                        wireMode = 'preview';
                        previewSegmentStartX = Math.round((mouseX / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE;
                        previewSegmentStartY = Math.round((mouseY / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE;
                        break;
                    default:
                }
                break;
            case 'delete':
                previewSegmentStartX = Math.round((mouseX / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE;
                previewSegmentStartY = Math.round((mouseY / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE;
                wireMode = 'delete';
                break;
            case 'select':
                switch (selectMode) {
                    case 'none':
                        selectStartX = Math.round(((mouseX + GRIDSIZE / 2) / transform.zoom - transform.dx - GRIDSIZE / 2) / GRIDSIZE) * GRIDSIZE - GRIDSIZE / 2;
                        selectStartY = Math.round(((mouseY + GRIDSIZE / 2) / transform.zoom - transform.dy - GRIDSIZE / 2) / GRIDSIZE) * GRIDSIZE - GRIDSIZE / 2;
                        selectMode = 'start';
                        reDraw();
                        break;
                    case 'end':
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
                                sClickBox.x + sClickBox.w / 2, sClickBox.y + sClickBox.h / 2);
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
    if (loading) { return; }
    if (!simulationIsRunning && !mouseOverGUI()) {
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
                            if (mouseButton === LEFT) {
                                addCustom(customFile, gateDirection);
                            }
                            break;
                        case 7:
                            if (mouseButton === LEFT) {
                                addOutput();
                            }
                            break;
                        case 8:
                            if (mouseButton === LEFT) {
                                addSegDisplay(segmentDisplayBits);
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
        redoButton.elt.disabled = (actionRedoList.length === 0);
        undoButton.elt.disabled = (actionUndoList.length === 0);
    } else {
        // Buttons should be operateable during simulation
        if (mouseButton === LEFT) {
            for (var i = 0; i < inputsList.length; i++) {
                if (Boolean(inputsList[i].mouseOver()) && !inputsList[i].getIsClock()) {
                    inputsList[i].toggle();
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
    if (loading) { return; }
    if (!simulationIsRunning && !mouseOverGUI()) {
        if (mouseButton === LEFT) {
            switch (controlMode) {
                case 'addObject':
                    if (wireMode === 'preview') { // If the preview wire mode is active
                        let pushed = false;
                        for (let i = 0; i < previewWireSegmentsList.length; i++) { // Push all preview segments to the existing segments
                            if (segmentExists(previewWireSegmentsList[i].startX, previewWireSegmentsList[i].startY, previewWireSegmentsList[i].endX, previewWireSegmentsList[i].endY) < 0) {
                                pushed = true;
                            }
                        }
                        if (pushed) {
                            let oldWires = [];
                            for (let i = wiresList.length - 1; i >= 0; i--) {
                                oldWires[i] = new Wire(wiresList[i].direction, wiresList[i].startX, wiresList[i].startY, false, wiresList[i].transform);
                                oldWires[i].endX = wiresList[i].endX;
                                oldWires[i].endY = wiresList[i].endY;
                                oldWires[i].id = wiresList[i].id;
                            }
                            let oldSegments = [];
                            for (let i = wireSegmentsList.length - 1; i >= 0; i--) {
                                oldSegments[i] = new Wire(wireSegmentsList[i].direction, wireSegmentsList[i].startX, wireSegmentsList[i].startY, false, wireSegmentsList[i].transform);
                                oldSegments[i].id = wireSegmentsList[i].id;
                            }
                            pushUndoAction('reWire', 0, [_.cloneDeep(oldSegments), _.cloneDeep(oldWires), _.cloneDeep(wireConnectionPointsList)]); // push the action for undoing
                        }
                        for (let i = 0; i < previewWireSegmentsList.length; i++) { // Push all preview segments to the existing segments
                            if (segmentExists(previewWireSegmentsList[i].startX, previewWireSegmentsList[i].startY, previewWireSegmentsList[i].endX, previewWireSegmentsList[i].endY) < 0) {
                                wireSegmentsList.push(previewWireSegmentsList[i]);
                            }
                        }
                        findLines();
                        lockElements = false;
                        previewWireSegmentsList = []; // delete the preview segments
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
                        for (let i = 0; i < previewWireSegmentsList.length; i++) { // Push all preview segments to the existing segments
                            if (segmentExists(previewWireSegmentsList[i].startX, previewWireSegmentsList[i].startY, previewWireSegmentsList[i].endX, previewWireSegmentsList[i].endY) < 0) {
                                pushed = true;
                            }
                        }
                        if (pushed) {
                            let oldWires = [];
                            for (let i = wiresList.length - 1; i >= 0; i--) {
                                oldWires[i] = new Wire(wiresList[i].direction, wiresList[i].startX, wiresList[i].startY, false, wiresList[i].transform);
                                oldWires[i].endX = wiresList[i].endX;
                                oldWires[i].endY = wiresList[i].endY;
                                oldWires[i].id = wiresList[i].id;
                            }
                            let oldSegments = [];
                            for (let i = wireSegmentsList.length - 1; i >= 0; i--) {
                                oldSegments[i] = new Wire(wireSegmentsList[i].direction, wireSegmentsList[i].startX, wireSegmentsList[i].startY, false, wireSegmentsList[i].transform);
                                oldSegments[i].id = wireSegmentsList[i].id;
                            }
                            pushUndoAction('reWire', 0, [_.cloneDeep(oldSegments), _.cloneDeep(oldWires), _.cloneDeep(wireConnectionPointsList)]); // push the action for undoing
                        }
                        for (let i = 0; i < previewWireSegmentsList.length; i++) { // Push all preview segments to the existing segments
                            if (segmentExists(previewWireSegmentsList[i].startX, previewWireSegmentsList[i].startY, previewWireSegmentsList[i].endX, previewWireSegmentsList[i].endY) < 0) {
                                wireSegmentsList.push(previewWireSegmentsList[i]);
                            }
                        }
                        findLines();
                        lockElements = false;
                        previewWireSegmentsList = []; // delete the preview segments
                        if (pushed) {
                            wireMode = 'hold'; // wiring done, reset wireMode
                        } else {
                            wireMode = 'none';
                        }
                        doConpoints(); // Update all conpoints and diodes
                    }
                    if (wireMode === 'none') {
                        // Invert In-/Outputs
                        for (let i = 0; i < gatesList.length; i++) {
                            for (let j = 0; j < gatesList[i].inputCount; j++) {
                                if (gatesList[i].mouseOverInput(j)) {
                                    gatesList[i].invertInput(j);
                                    let act = new Action('invGIP', [i, j], null);
                                    actionUndoList.push(act);
                                }
                            }
                            for (let j = 0; j < gatesList[i].outputCount; j++) {
                                if (gatesList[i].mouseOverOutput(j)) {
                                    gatesList[i].invertOutput(j);
                                    let act = new Action('invGOP', [i, j], null);
                                    actionUndoList.push(act);
                                }
                            }
                        }
                        for (let i = 0; i < customObjectsList.length; i++) {
                            if (customObjectsList[i].visible) {
                                for (let j = 0; j < customObjectsList[i].inputCount; j++) {
                                    if (customObjectsList[i].mouseOverInput(j)) {
                                        customObjectsList[i].invertInput(j);
                                        let act = new Action('invCIP', [i, j], null);
                                        actionUndoList.push(act);
                                    }
                                }
                                for (let j = 0; j < customObjectsList[i].outputCount; j++) {
                                    if (customObjectsList[i].mouseOverOutput(j)) {
                                        customObjectsList[i].invertOutput(j);
                                        let act = new Action('invCOP', [i, j], null);
                                        actionUndoList.push(act);
                                    }
                                }
                            }
                        }
                        for (let i = 0; i < segmentDisplaysList.length; i++) {
                            for (let j = 0; j < segmentDisplaysList[i].inputCount; j++) {
                                if (segmentDisplaysList[i].mouseOverInput(j)) {
                                    segmentDisplaysList[i].invertInput(j);
                                    let act = new Action('invDIP', [i, j], null);
                                    actionUndoList.push(act);
                                }
                            }
                        }
                        if (fullCrossing(Math.round((mouseX / transform.zoom - transform.dx) / (GRIDSIZE / 2)) * (GRIDSIZE / 2), Math.round((mouseY / transform.zoom - transform.dy) / (GRIDSIZE / 2)) * (GRIDSIZE / 2))) {
                            toggleDiodeAndConpoint();
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
                        let oldWires = _.cloneDeep(wiresList);
                        let oldSegments = _.cloneDeep(wireSegmentsList);
                        let existing = false;
                        for (let i = previewWireSegmentsList.length - 1; i >= 0; i--) {
                            let exists = segmentExists(previewWireSegmentsList[i].startX, previewWireSegmentsList[i].startY, previewWireSegmentsList[i].endX, previewWireSegmentsList[i].endY);
                            if (exists >= 0) {
                                existing = true;
                                wireSegmentsList.splice(exists, 1);
                            }
                        }
                        if (existing) {
                            pushUndoAction('reWire', 0, [oldSegments, oldWires, _.cloneDeep(wireConnectionPointsList)]); // Push the action, if more than 0 segments were deleted
                            findLines();
                        }
                        previewWireSegmentsList = [];
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
        redoButton.elt.disabled = (actionRedoList.length === 0);
        undoButton.elt.disabled = (actionUndoList.length === 0);
    } else {
        previewWireSegmentsList = [];
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
    for (let i = gatesList.length - 1; i >= 0; i--) {
        if (gatesList[i].mouseOver()) {
            return i;
        }
    }
    return -1; // Return -1 if mouse isn't over a gate
}

function mouseOverCustom() {
    // Iterate backwards so that in overlapping situations
    // the last added gets removed first
    for (let i = customObjectsList.length - 1; i >= 0; i--) {
        if (customObjectsList[i].mouseOver() && customObjectsList[i].visible) {
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
    for (let i = outputsList.length - 1; i >= 0; i--) {
        if (outputsList[i].mouseOver()) {
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
    for (var i = inputsList.length - 1; i >= 0; i--) {
        if (inputsList[i].mouseOver()) {
            return i;
        }
    }
    return -1;
}

function mouseOverDiode() {
    for (var i = diodesList.length - 1; i >= 0; i--) {
        if (diodesList[i].mouseOver()) {
            return i;
        }
    }
    return -1;
}

function mouseOverLabel() {
    for (var i = labelsList.length - 1; i >= 0; i--) {
        if (labelsList[i].mouseOver()) {
            return i;
        }
    }
    return -1;
}

function mouseOverSegDisplay() {
    for (var i = segmentDisplaysList.length - 1; i >= 0; i--) {
        if (segmentDisplaysList[i].mouseOver()) {
            return i;
        }
    }
    return -1;
}

//Checks if the mouse hovers over the GUI(true) or the grid(false)
function mouseOverGUI() {
    if (mouseY > window.height - 220 && mouseX < 970 && showHints) {
        return true;
    }
    if (propInput + propOutput + propLabel < -2) {
        return (mouseY < 0) || (mouseX < 0);
    } else {
        return (mouseY < 0) || (mouseX < 0) || (mouseX > window.width - 203);

    }
}

/*
    Handles the dragging of the canvas
    by calculating dx and dy
*/
function handleDragging() {
    if (loading) { return; }
    if (mouseIsPressed && mouseButton === RIGHT && mouseX > 0 && mouseY > 0) {
        if (lastMousePositionX !== 0) {
            transform.dx += Math.round((mouseX - lastMousePositionX) * dragSpeed);
        }
        if (lastMousePositionY !== 0) {
            transform.dy += Math.round((mouseY - lastMousePositionY) * dragSpeed);
        }
        lastMousePositionX = mouseX;
        lastMousePositionY = mouseY;
        if (!simulationIsRunning) {
            reDraw();
        }
    } else {
        lastMousePositionX = 0;
        lastMousePositionY = 0;
    }
}