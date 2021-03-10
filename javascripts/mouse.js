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
    if (loading || saveDialog || customDialog.isVisible || screenshotDialog || linkDialog || mouseOverGUI() || elementMenuShown()) { return; }

    if (mouseX > 0 && mouseY > 0) {
        wheel = Math.sign(event.deltaY) * 2; // -1.5 for zoom in, +1.5 for zoom out
        if ((currentGridSize + 1 < maxZoom * GRIDSIZE && wheel < 1) || (currentGridSize - 1 > minZoom * GRIDSIZE) && wheel > 1) {
            origX = mouseX * (transform.zoom);
            origY = mouseY * (transform.zoom);
            transform.dx += (origX - (mouseX * (((currentGridSize - wheel) / GRIDSIZE)))) * (GRIDSIZE / (currentGridSize - wheel)) * (GRIDSIZE / (currentGridSize - wheel));
            transform.dy += (origY - (mouseY * (((currentGridSize - wheel) / GRIDSIZE)))) * (GRIDSIZE / (currentGridSize - wheel)) * (GRIDSIZE / (currentGridSize - wheel));
            currentGridSize -= wheel;

        }
        transform.zoom = (currentGridSize / GRIDSIZE);
        dragSpeed = 1 / transform.zoom;
        if (selectMode === 'end') {
            positionSelectionTools();
        }
        if (!simRunning) {
            reDraw();
        }
        document.getElementById('zoomLabelContainer').style.opacity = '1';
        document.getElementById('zoomLabel').innerHTML = '<i class="fa fa-search icon" style="color: rgb(200, 50, 50);"></i> ' + Math.round(transform.zoom * 100) + '%';
        window.clearTimeout(isScrolling);
        isScrolling = setTimeout(function () {
            document.getElementById('zoomLabelContainer').style.opacity = '0';
        }, 2000);
    }
    updateCursors();
}

function mouseMoved() {
    if (loading || saveDialog || screenshotDialog || linkDialog || elementMenuShown()) { return; }
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
    let showBusCPPreview = false;
    if ((simRunning || controlMode === 'modify') && !customDialog.isVisible) {
        if (!simRunning) {
            for (const elem of outputs) {
                if (elem.mouseOver()) {
                    hand = true;
                    cursor(HAND);
                }
            }
            for (const elem of inputs) {
                if (elem.mouseOver() && (elem.getIsClock() || moduleOptions)) {
                    hand = true;
                    cursor(HAND);
                }
            }
            if (!moduleOptions) {
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
                    if (!elem.useBusInput) {
                        for (const e of elem.inputClickBoxes) {
                            if (e.mouseOver()) {
                                hand = true;
                                cursor(HAND);
                                negDir = 3;
                                negPort = e;
                                isOutput = false;
                            }
                        }
                    } else {
                        if (elem.invertClickBox.mouseOver()) {
                            hand = true;
                            cursor(HAND);
                        }
                    }
                }
                for (const elem of busWrappers) {
                    for (const e of elem.inputClickBoxes) {
                        if (e.mouseOver()) {
                            hand = true;
                            cursor(HAND);
                            negDir = elem.direction;
                            negPort = e;
                            isOutput = false;
                        }
                    }
                    if (elem.invertClickBox.mouseOver()) {
                        hand = true;
                        cursor(HAND);
                    }
                }
                for (const elem of busUnwrappers) {
                    for (const e of elem.outputClickBoxes) {
                        if (e.mouseOver()) {
                            hand = true;
                            cursor(HAND);
                            negDir = elem.direction;
                            negPort = e;
                            isOutput = true;
                        }
                    }
                    if (elem.invertClickBox.mouseOver()) {
                        hand = true;
                        cursor(HAND);
                    }
                }
                for (const elem of decoders) {
                    if (!elem.useInBus) {
                        for (const e of elem.inputClickBoxes) {
                            if (e.mouseOver()) {
                                hand = true;
                                cursor(HAND);
                                negDir = elem.direction;
                                negPort = e;
                                isOutput = false;
                            }
                        }
                    }

                    if (!elem.useOutBus) {
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
                    
                    if ((elem.useInBus && elem.invertInputClickBox.mouseOver()) || (elem.useOutBus && elem.invertOutputClickBox.mouseOver())) {
                        hand = true;
                        cursor(HAND);
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
            }
            if (!moduleOptions && fullCrossing(Math.round((mouseX / transform.zoom - transform.dx) / (GRIDSIZE / 2)) * (GRIDSIZE / 2), Math.round((mouseY / transform.zoom - transform.dy) / (GRIDSIZE / 2)) * (GRIDSIZE / 2))) {
                hand = true;
                cursor(HAND);
                if (isConPoint(Math.round((mouseX / transform.zoom - transform.dx) / (GRIDSIZE / 2)) * (GRIDSIZE / 2), Math.round((mouseY / transform.zoom - transform.dy) / (GRIDSIZE / 2)) * (GRIDSIZE / 2)) < 0 ||
                    isDiode(Math.round((mouseX / transform.zoom - transform.dx) / (GRIDSIZE / 2)) * (GRIDSIZE / 2), Math.round((mouseY / transform.zoom - transform.dy) / (GRIDSIZE / 2)) * (GRIDSIZE / 2)) >= 0) {
                    showDPreview = true;
                } else {
                    showCPPreview = true;
                }
            }
            if (!moduleOptions && busFullCrossing(Math.round((mouseX / transform.zoom - transform.dx) / (GRIDSIZE / 2)) * (GRIDSIZE / 2), Math.round((mouseY / transform.zoom - transform.dy) / (GRIDSIZE / 2)) * (GRIDSIZE / 2))) {
                hand = true;
                cursor(HAND);
                showBusCPPreview = true;
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
    if (controlMode === 'select') {
        if (selectionBox.mouseOver() && showSelectionBox) {
            hand = true;
            cursor(MOVE);
        } else if (showSelectionBox) {
            hand = true;
            cursor(HAND);
        } else {
            hand = true;
            cursor('crosshair');
        }
    }
    if (!hand) {
        cursor(ARROW);
    }
    if (customDialog.isVisible || moduleOptions) {
        return;
    }
    if (redrawNextFrame) {
        reDraw();
        redrawNextFrame = false;
    }
    if (showDPreview) {
        showPreview('diode', Math.round((mouseX / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE, Math.round((mouseY / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE);
        redrawNextFrame = true;
    }
    if (showCPPreview) {
        showPreview('conpoint', Math.round((mouseX / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE, Math.round((mouseY / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE);
        redrawNextFrame = true;
    }
    if (showBusCPPreview) {
        showPreview('busConpoint', Math.round((mouseX / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE, Math.round((mouseY / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE);
        redrawNextFrame = true;
    }
    if (negPort !== null) {
        showNegationPreview(negPort, isOutput, negDir, isTop);
        redrawNextFrame = true;
    }
}

function mouseDragged() {
    if (loading || saveDialog || customDialog.isVisible || screenshotDialog || linkDialog || elementMenuShown()) { return; }
    if (controlMode === 'select' && selectMode === 'drag') {
        if (sDragX2 !== Math.round((mouseX / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE ||
            sDragY2 !== Math.round((mouseY / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE) {
            moveSelection(Math.round((mouseX / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE - sDragX2,
                Math.round((mouseY / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE - sDragY2);
            sDragX2 = Math.round((mouseX / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE;
            sDragY2 = Math.round((mouseY / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE;
        }
    } else if (controlMode === 'select' && selectMode === 'end') {
        positionSelectionTools();
    }
}

/*
    Executed when a mouse button is pressed down
*/
function mousePressed() {
    if (elementMenuShown() && !mouseOverGUI()) {
        clickedOutOfGUI = true;
    } else {
        clickedOutOfGUI = false;
    }
    if (loading || saveDialog || customDialog.isVisible || screenshotDialog || linkDialog || moduleOptions || elementMenuShown()) { return; }

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
                        if (selectionBox.mouseOver(true)) {
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
                            document.getElementById('copy-select-button').disabled = false;
                            document.getElementById('delete-select-button').disabled = false;
                        } else {
                            finishSelection();
                            enterModifierMode();
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
    if (loading || saveDialog || screenshotDialog || linkDialog || justClosedMenu || moduleOptions || customDialog.isVisible || elementMenuShown() || mouseOverGUI()) {
        return;
    }
    if (!simRunning && !mouseOverGUI()) {
        switch (controlMode) {
            case 'addObject':
                if (wireMode !== 'hold') {
                    switch (addType) { // Handle object adding
                        case 1:
                        case 2:
                        case 3: // add logic gate
                            if (mouseButton === LEFT) {
                                addGate(addType, gateInputCount, gateDirection);
                            }
                            break;
                        case 10:
                        case 11: // add custom module
                            if (mouseButton === LEFT) {
                                addCustom(custFile, gateDirection);
                            }
                            break;
                        case 12: // add bus unwrapper
                            if (mouseButton === LEFT) {
                                addBusUnwrapper(busWrapperWidth, gateDirection);
                            }
                            break;
                        case 13: // add bus wrapper
                            if (mouseButton === LEFT) {
                                addBusWrapper(busWrapperWidth, gateDirection);
                            }
                            break;
                        case 14: // add decoder
                            if (mouseButton === LEFT) {
                                addDecoder(decoderBitWidth, gateDirection);
                            }
                            break;
                        case 7: // add output
                            if (mouseButton === LEFT) {
                                addOutput();
                            }
                            break;
                        case 8: // add 7-segment display
                            if (mouseButton === LEFT) {
                                addSegDisplay(sevenSegmentBits);
                                /*if (busVersions) {
                                    addBusSegDisplay(sevenSegmentBits);
                                } else {
                                    addSegDisplay(sevenSegmentBits);
                                }*/
                                setTimeout(reDraw, 50);
                            }
                            break;
                        case 4:
                        case 5:
                        case 6: // add input
                            if (mouseButton === LEFT) {
                                addInput();
                            }
                            break;
                        case 9: // add label
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
        updateUndoButtons();
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
    if (moduleOptions && !mouseOverGUI() && mouseButton === LEFT) {
        let swapped = false;
        for (let i = 0; i < inputs.length; i++) {
            if (inputs[i].mouseOver() && !swapped) {
                if (swapInput !== i) {
                    if (swapInput >= 0) {
                        inputs[swapInput].mark(false);
                        swapInputs(swapInput, i);
                        swapInput = -1;
                        swapped = true;
                        initPinConfigurator();
                        showModulePreviewer();
                    } else {
                        inputs[i].mark(true);
                        swapInput = i;
                    }
                } else {
                    inputs[swapInput].mark(false);
                    swapInput = -1;
                    swapped = true;
                }
                reDraw();
            }
        }
        swapped = false;
        for (let i = 0; i < outputs.length; i++) {
            if (outputs[i].mouseOver() && !swapped) {
                if (swapOutput !== i) {
                    if (swapOutput >= 0) {
                        outputs[swapOutput].mark(false);
                        swapOutputs(swapOutput, i);
                        swapOutput = -1;
                        swapped = true;
                        initPinConfigurator();
                        showModulePreviewer();
                    } else {
                        outputs[i].mark(true);
                        swapOutput = i;
                    }
                } else {
                    outputs[swapOutput].mark(false);
                    swapOutput = -1;
                    swapped = true;
                }
                reDraw();
            }
        }
    }

    dropdownClicked = false;
    if (loading || customDialog.isVisible || saveDialog || screenshotDialog || linkDialog || moduleOptions || mouseOverGUI()) { return; }
    if (elementMenuShown()) {
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
                        if (busInsert) {
                            addBusses();
                        } else {
                            addWires();
                        }
                    }
                    break;
                case 'modify':
                    if (!justClosedMenu) {
                        if (wireMode === 'preview') { // If the preview wire mode is active
                            if (busInsert) {
                                addBusses();
                            } else {
                                addWires();
                            }
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
                                if (!segDisplays[i].useBusInput) {
                                    for (let j = 0; j < segDisplays[i].inputCount; j++) {
                                        if (segDisplays[i].mouseOverInput(j)) {
                                            segDisplays[i].invertInput(j);
                                            let act = new Action('invDIP', [i, j], null);
                                            actionUndo.push(act);
                                        }
                                    }
                                } else {
                                    if (segDisplays[i].mouseOverInvert()) {
                                        segDisplays[i].invertInputBus();
                                    }
                                }
                            }
                            for (let i = 0; i < decoders.length; i++) {
                                if (!decoders[i].useInBus) {
                                    for (let j = 0; j < decoders[i].inputCount; j++) {
                                        if (decoders[i].mouseOverInput(j)) {
                                            decoders[i].invertInput(j);
                                            let act = new Action('invDECIP', [i, j], null);
                                            actionUndo.push(act);
                                        }
                                    }
                                } else {
                                    if (decoders[i].mouseOverInputInvert()) {
                                        decoders[i].invertInputBus();
                                    }
                                }
                                if (!decoders[i].useOutBus) {
                                    for (let j = 0; j < decoders[i].outputCount; j++) {
                                        if (decoders[i].mouseOverOutput(j)) {
                                            decoders[i].invertOutput(j);
                                            let act = new Action('invDECOP', [i, j], null);
                                            actionUndo.push(act);
                                        }
                                    }
                                } else {
                                    if (decoders[i].mouseOverOutputInvert()) {
                                        decoders[i].invertOutputBus();
                                    }
                                }
                            }
                            for (let i = 0; i < busWrappers.length; i++) {
                                for (let j = 0; j < busWrappers[i].inputCount; j++) {
                                    if (busWrappers[i].mouseOverInput(j)) {
                                        busWrappers[i].invertInput(j);
                                        let act = new Action('invBWIP', [i, j], null);
                                        actionUndo.push(act);
                                    }
                                }
                                if (busWrappers[i].mouseOverInvert()) {
                                    busWrappers[i].invertOutputBus();
                                }
                            }
                            for (let i = 0; i < busUnwrappers.length; i++) {
                                for (let j = 0; j < busUnwrappers[i].outputCount; j++) {
                                    if (busUnwrappers[i].mouseOverOutput(j)) {
                                        busUnwrappers[i].invertOutput(j);
                                        let act = new Action('invBUOP', [i, j], null);
                                        actionUndo.push(act);
                                    }
                                }
                                if (busUnwrappers[i].mouseOverInvert()) {
                                    busUnwrappers[i].invertInputBus();
                                }
                            }
                            if (fullCrossing(Math.round((mouseX / transform.zoom - transform.dx) / (GRIDSIZE / 2)) * (GRIDSIZE / 2), Math.round((mouseY / transform.zoom - transform.dy) / (GRIDSIZE / 2)) * (GRIDSIZE / 2))) {
                                toggleDiodeAndConpoint();
                            }
                            if (busFullCrossing(Math.round((mouseX / transform.zoom - transform.dx) / (GRIDSIZE / 2)) * (GRIDSIZE / 2), Math.round((mouseY / transform.zoom - transform.dy) / (GRIDSIZE / 2)) * (GRIDSIZE / 2))) {
                                toggleBusConpoint();
                            }
                            for (let i = 0; i < inputs.length; i++) {
                                if (inputs[i].mouseOver() && controlMode === 'modify') {
                                    if (inputToModify !== i) {
                                        if (inputToModify >= 0) {
                                            inputs[inputToModify].mark(false);
                                        }
                                        if (inputs[i].clock) {
                                            inputs[i].mark(true);
                                            inputToModify = i;
                                            updateModifierMenuPosition();
                                            showClockPropMenu();
                                            positionModifierElements();
                                            wireMode = 'none';
                                            reDraw();
                                        }
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
                                        updateModifierMenuPosition();
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
                                        updateModifierMenuPosition();
                                        showLabelPropMenu();
                                        positionModifierElements();
                                        wireMode = 'none';
                                        reDraw();
                                    }
                                }
                            }
                        }
                    } else {
                        wireMode = 'none';
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
                        let wrapperNumber = mouseOverBusWrapper();
                        if (wrapperNumber >= 0) {
                            deleteBusWrapper(wrapperNumber);
                        }
                        let unwrapperNumber = mouseOverBusUnwrapper();
                        if (unwrapperNumber >= 0) {
                            deleteBusUnwrapper(unwrapperNumber);
                        }
                        let decoderNumber = mouseOverDecoder();
                        if (decoderNumber >= 0) {
                            deleteDecoder(decoderNumber);
                        }
                        let segDisNumber = mouseOverSegDisplay();
                        if (segDisNumber >= 0) {
                            deleteSegDisplay(segDisNumber);
                        }
                    }
                    if (wireMode === 'delete') { // A wire should be deleted
                        deleteWires();
                        deleteBusses();
                        pwWireX = null; // reset the preview wires
                        pwWireY = null;
                        wireMode = 'none';
                        lockElements = false;
                    }
                    break;
                case 'select':
                    switch (selectMode) {
                        case 'none':
                            break;
                        case 'start':
                            // Selection done, give the rectangle coordinates and dimensions to the handling function
                            handleSelection(Math.min(selectStartX, selectEndX), Math.min(selectStartY, selectEndY),
                                Math.max(selectStartX, selectEndX), Math.max(selectStartY, selectEndY));
                            setSelectMode('end');
                            break;
                        case 'end':
                            break;
                        case 'drag':
                            setSelectMode('end');
                            break;
                        default:
                            console.log('[MOUSE RELEASED] Select mode ' + selectMode + ' not supported!');
                    }
                    break;
                default:
                    console.log('Control mode not supported!');
            }
        }
        updateUndoButtons();
    } else {
        pwWireX = null;
        pwWireY = null;
        wireMode = 'none';
        lockElements = false;
    }
    justClosedMenu = false;
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

function mouseOverBusWrapper() {
    for (var i = busWrappers.length - 1; i >= 0; i--) {
        if (busWrappers[i].mouseOver()) {
            return i;
        }
    }
    return -1;
}

function mouseOverBusUnwrapper() {
    for (var i = busUnwrappers.length - 1; i >= 0; i--) {
        if (busUnwrappers[i].mouseOver()) {
            return i;
        }
    }
    return -1;
}

function mouseOverDecoder() {
    for (var i = decoders.length - 1; i >= 0; i--) {
        if (decoders[i].mouseOver()) {
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
    if (mx % 220 > 200 || my % 220 > 200) {
        return {
            row: -1,
            col: -1
        };
    }
    mx = Math.floor(mx / 220);
    my = Math.floor(my / 220);
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
    if (moduleOptions && mouseX >= window.width - 360) {
        return true;
    }
    if (dropdownClicked) {
        return true;
    }
    if (controlMode === 'modify' && inputToModify + outputToModify + labelToModify >= -2) {
        return (mouseY < 0) || (mouseX < 0) || mouseX >= modifierMenuX && mouseX <= modifierMenuX + 300 && mouseY >= modifierMenuY && mouseY <= modifierMenuY + 150;
    }
    return (mouseY < 0) || (mouseX < 0);
}

/*
    Handles the dragging of the canvas
    by calculating dx and dy
*/
function handleDragging() {
    if (loading || saveDialog || screenshotDialog || linkDialog || customDialog.isVisible || elementMenuShown() || mouseOverGUI()) { return; }
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