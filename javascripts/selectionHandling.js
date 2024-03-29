// File: selectionHandling.js
// Contains functions for the selection feature

/*
    This is invoked when the selection area is drawn
    It selects all underlying items 
*/
function handleSelection(x1, y1, x2, y2) {
    selectionBox.updatePosition(x1 + (x2 - x1) / 2, y1 + (y2 - y1) / 2);
    selectionBox.updateSize(x2 - x1, y2 - y1);
    selectionBox.setTransform(transform);

    selectionStartPosX = selectionBox.x;
    selectionStartPosY = selectionBox.y;

    selectionLog = [];
    busLog = [];
    deleteLog = [];
    selWireIndizes = [];
    selDiodeIndizes = [];
    selGatesIndizes = [];
    selInputsIndizes = [];
    selOutputsIndizes = [];
    selLabelIndizes = [];
    selSegDisplayIndizes = [];
    selCustomIndizes = [];
    selConpointIndizes = [];
    selBusWrappersIndizes = [];
    selBusUnwrappersIndizes = [];
    selBusInputIndizes = [];
    selDecodersIndizes = [];
    selBusIndizes = [];

    for (let i = 0; i < wires.length; i++) {
        if (((wires[i].direction === 0) && ((wires[i].startX >= x1 || x1 <= wires[i].endX) &&
            (wires[i].startX <= x2 || x2 >= wires[i].endX)) && (wires[i].startY >= y1 && wires[i].endY <= y2)) ||
            ((wires[i].direction === 1) && ((wires[i].startY >= y1 || y1 <= wires[i].endY) &&
                (wires[i].startY <= y2 || y2 >= wires[i].endY)) && (wires[i].startX >= x1 && wires[i].endX <= x2))) {
            wires[i].marked = true;
            selWireIndizes.push(i);
        }
    }

    for (let i = 0; i < busses.length; i++) {
        if (((busses[i].direction === 0) && ((busses[i].startX >= x1 || x1 <= busses[i].endX) &&
            (busses[i].startX <= x2 || x2 >= busses[i].endX)) && (busses[i].startY >= y1 && busses[i].endY <= y2)) ||
            ((busses[i].direction === 1) && ((busses[i].startY >= y1 || y1 <= busses[i].endY) &&
                (busses[i].startY <= y2 || y2 >= busses[i].endY)) && (busses[i].startX >= x1 && busses[i].endX <= x2))) {
            busses[i].marked = true;
            selBusIndizes.push(i);
        }
    }

    for (let i = 0; i < diodes.length; i++) {
        if (diodes[i].x >= x1 && diodes[i].x <= x2 && diodes[i].y >= y1 && diodes[i].y <= y2) {
            diodes[i].marked = true;
            selDiodeIndizes.push(i);
        }
    }

    for (let i = 0; i < gates.length; i++) {
        if (gates[i].x >= x1 && gates[i].x <= x2 && gates[i].y >= y1 && gates[i].y <= y2) {
            gates[i].marked = true;
            selGatesIndizes.push(i);
        }
    }

    for (let i = 0; i < inputs.length; i++) {
        if (inputs[i].x >= x1 && inputs[i].x <= x2 && inputs[i].y >= y1 && inputs[i].y <= y2) {
            inputs[i].marked = true;
            selInputsIndizes.push(i);
        }
    }

    for (let i = 0; i < outputs.length; i++) {
        if (outputs[i].x >= x1 && outputs[i].x <= x2 && outputs[i].y >= y1 && outputs[i].y <= y2) {
            outputs[i].marked = true;
            selOutputsIndizes.push(i);
        }
    }

    for (let i = 0; i < labels.length; i++) {
        if (labels[i].x >= x1 && labels[i].x <= x2 && labels[i].y >= y1 && labels[i].y <= y2) {
            labels[i].marked = true;
            selLabelIndizes.push(i);
        }
    }

    for (let i = 0; i < segDisplays.length; i++) {
        if (segDisplays[i].x >= x1 && segDisplays[i].x <= x2 && segDisplays[i].y >= y1 && segDisplays[i].y <= y2) {
            segDisplays[i].marked = true;
            selSegDisplayIndizes.push(i);
        }
    }

    for (let i = 0; i < busWrappers.length; i++) {
        if (busWrappers[i].x >= x1 && busWrappers[i].x <= x2 && busWrappers[i].y >= y1 && busWrappers[i].y <= y2) {
            busWrappers[i].marked = true;
            selBusWrappersIndizes.push(i);
        }
    }

    for (let i = 0; i < busUnwrappers.length; i++) {
        if (busUnwrappers[i].x >= x1 && busUnwrappers[i].x <= x2 && busUnwrappers[i].y >= y1 && busUnwrappers[i].y <= y2) {
            busUnwrappers[i].marked = true;
            selBusUnwrappersIndizes.push(i);
        }
    }

    for (let i = 0; i < busInputs.length; i++) {
        if (busInputs[i].x >= x1 && busInputs[i].x <= x2 && busInputs[i].y >= y1 && busInputs[i].y <= y2) {
            busInputs[i].marked = true;
            selBusInputIndizes.push(i);
        }
    }

    for (let i = 0; i < decoders.length; i++) {
        if (decoders[i].x >= x1 && decoders[i].x <= x2 && decoders[i].y >= y1 && decoders[i].y <= y2) {
            decoders[i].marked = true;
            selDecodersIndizes.push(i);
        }
    }

    for (let i = 0; i < customs.length; i++) {
        if (customs[i].visible && (customs[i].x >= x1 && customs[i].x <= x2 && customs[i].y >= y1 && customs[i].y <= y2)) {
            customs[i].marked = true;
            selCustomIndizes.push(i);
        }
    }

    for (let i = 0; i < conpoints.length; i++) {
        if (conpoints[i].x >= x1 && conpoints[i].x <= x2 && conpoints[i].y >= y1 && conpoints[i].y <= y2) {
            conpoints[i].marked = true;
            selConpointIndizes.push(i);
        }
    }

    document.getElementById('select-tools').style.display = 'block';
    document.getElementById('copy-select-button').disabled = false;
    document.getElementById('delete-select-button').disabled = false;
    positionSelectionTools();
}

function deleteSelection() {
    let selectionOffsetX = selectionBox.x - selectionStartPosX;
    let selectionOffsetY = selectionBox.y - selectionStartPosY;
    if (selectionOffsetX !== 0 || selectionOffsetY !== 0) {
        moveSelection(-selectionOffsetX, -selectionOffsetY);
    }

    for (let i = selWireIndizes.length - 1; i >= 0; i--) {
        wires[selWireIndizes[i]].marked = false;
        deleteLog.push(['wire', selWireIndizes[i], wires.splice(selWireIndizes[i], 1)[0]]);
    }

    for (let i = selBusIndizes.length - 1; i >= 0; i--) {
        busses[selBusIndizes[i]].marked = false;
        deleteLog.push(['bus', selBusIndizes[i], busses.splice(selBusIndizes[i], 1)[0]]);
    }

    for (let i = selGatesIndizes.length - 1; i >= 0; i--) {
        gates[selGatesIndizes[i]].marked = false;
        deleteLog.push(['gate', selGatesIndizes[i], gates.splice(selGatesIndizes[i], 1)[0]]);
    }

    for (let i = selInputsIndizes.length - 1; i >= 0; i--) {
        inputs[selInputsIndizes[i]].marked = false;
        deleteLog.push(['input', selInputsIndizes[i], inputs.splice(selInputsIndizes[i], 1)[0]]);
    }

    for (let i = selOutputsIndizes.length - 1; i >= 0; i--) {
        outputs[selOutputsIndizes[i]].marked = false;
        deleteLog.push(['output', selOutputsIndizes[i], outputs.splice(selOutputsIndizes[i], 1)[0]]);
    }

    for (let i = selLabelIndizes.length - 1; i >= 0; i--) {
        labels[selLabelIndizes[i]].marked = false;
        deleteLog.push(['label', selLabelIndizes[i], labels.splice(selLabelIndizes[i], 1)[0]]);
    }

    for (let i = selSegDisplayIndizes.length - 1; i >= 0; i--) {
        segDisplays[selSegDisplayIndizes[i]].marked = false;
        deleteLog.push(['segDisplay', selSegDisplayIndizes[i], segDisplays.splice(selSegDisplayIndizes[i], 1)[0]]);
    }

    for (let i = selBusWrappersIndizes.length - 1; i >= 0; i--) {
        busWrappers[selBusWrappersIndizes[i]].marked = false;
        deleteLog.push(['busWrapper', selBusWrappersIndizes[i], busWrappers.splice(selBusWrappersIndizes[i], 1)[0]]);
    }

    for (let i = selBusUnwrappersIndizes.length - 1; i >= 0; i--) {
        busUnwrappers[selBusUnwrappersIndizes[i]].marked = false;
        deleteLog.push(['busUnwrapper', selBusUnwrappersIndizes[i], busUnwrappers.splice(selBusUnwrappersIndizes[i], 1)[0]]);
    }

    for (let i = selBusInputIndizes.length - 1; i >= 0; i--) {
        busInputs[selBusInputIndizes[i]].marked = false;
        deleteLog.push(['busInput', selBusInputIndizes[i], busInputs.splice(selBusInputIndizes[i], 1)[0]]);
    }

    for (let i = selDecodersIndizes.length - 1; i >= 0; i--) {
        decoders[selDecodersIndizes[i]].marked = false;
        deleteLog.push(['decoder', selDecodersIndizes[i], decoders.splice(selDecodersIndizes[i], 1)[0]]);
    }

    for (let i = selCustomIndizes.length - 1; i >= 0; i--) {
        customs[selCustomIndizes[i]].marked = false;
        customs[selCustomIndizes[i]].visible = false;
        /*for (let j = customs.length - 1; j >= 0; j--) {
            if (customs[j].pid === customs[selCustomIndizes[i]].id) {
                customs.splice(j, 1);
            }
        }*/
        //console.log('push custom delete ' + selCustomIndizes[i]);
        //selCustomIndizes = selCustomIndizes.concat(invisibleCustoms);
        deleteLog.push(['custom', selCustomIndizes[i], []/*customs.splice(selCustomIndizes[i], 1)[0]*/]);
    }

    if (deleteLog.length > 0) {
        let conpointsBefore = _.cloneDeep(conpoints);

        for (let i = 0; i < selConpointIndizes.length; i++) {
            conpointsBefore[selConpointIndizes[i]].marked = false;
            conpoints[selConpointIndizes[i]].marked = false;
        }

        let diodesBefore = _.cloneDeep(diodes);
        for (let i = 0; i < selDiodeIndizes.length; i++) {
            diodesBefore[selDiodeIndizes[i]].marked = false;
            diodes[selDiodeIndizes[i]].marked = false;
        }

        doConpoints();

        let conpointsAfter = _.cloneDeep(conpoints);
        let diodesAfter = _.cloneDeep(diodes);
        pushUndoAction('delSel', [], [_.cloneDeep(deleteLog), conpointsBefore, conpointsAfter, diodesBefore, diodesAfter]);
    }

    enterModifierMode();
    initX = 0;
    initY = 0;
}

function copySelection() {
    copiedElements = [];

    for (let i = 0; i < selWireIndizes.length; i++) {
        copiedElements.push(_.cloneDeep(wires[selWireIndizes[i]]));
    }
    for (let i = 0; i < selBusIndizes.length; i++) {
        copiedElements.push(_.cloneDeep(busses[selBusIndizes[i]]));
    }
    for (let i = 0; i < selDiodeIndizes.length; i++) {
        copiedElements.push(_.cloneDeep(diodes[selDiodeIndizes[i]]));
    }
    for (let i = 0; i < selGatesIndizes.length; i++) {
        copiedElements.push(_.cloneDeep(gates[selGatesIndizes[i]]));
    }
    for (let i = 0; i < selInputsIndizes.length; i++) {
        copiedElements.push(_.cloneDeep(inputs[selInputsIndizes[i]]));
    }
    for (let i = 0; i < selOutputsIndizes.length; i++) {
        copiedElements.push(_.cloneDeep(outputs[selOutputsIndizes[i]]));
    }
    for (let i = 0; i < selLabelIndizes.length; i++) {
        copiedElements.push(_.cloneDeep(labels[selLabelIndizes[i]]));
    }
    for (let i = 0; i < selSegDisplayIndizes.length; i++) {
        copiedElements.push(_.cloneDeep(segDisplays[selSegDisplayIndizes[i]]));
    }
    for (let i = 0; i < selBusWrappersIndizes.length; i++) {
        copiedElements.push(_.cloneDeep(busWrappers[selBusWrappersIndizes[i]]));
    }
    for (let i = 0; i < selBusUnwrappersIndizes.length; i++) {
        copiedElements.push(_.cloneDeep(busUnwrappers[selBusUnwrappersIndizes[i]]));
    }
    for (let i = 0; i < selBusInputIndizes.length; i++) {
        copiedElements.push(_.cloneDeep(busInputs[selBusInputIndizes[i]]));
    }
    for (let i = 0; i < selDecodersIndizes.length; i++) {
        copiedElements.push(_.cloneDeep(decoders[selDecodersIndizes[i]]));
    }
    for (let i = 0; i < selCustomIndizes.length; i++) {
        copiedElements.push(_.cloneDeep(customs[selCustomIndizes[i]]));
    }
    for (let i = 0; i < selConpointIndizes.length; i++) {
        copiedElements.push(_.cloneDeep(conpoints[selConpointIndizes[i]]));
    }

    copiedOffsetStartX = selectionBox.x + GRIDSIZE;
    copiedOffsetStartY = selectionBox.y + GRIDSIZE;
    copiedOffsetWidth = selectionBox.w;
    copiedOffsetHeight = selectionBox.h;

    finishSelection();
    enterModifierMode();
    initX = 0;
    initY = 0;

    setHelpText('Selection copied, paste with <span style="color: #c83232">[V]</span>', 'info-circle');
    setTimeout(function () { setHelpText(''); }, 3000);

    //console.log(copiedElements);
}

function pasteSelection() {
    /*
        If no elements are in clipboard, return
    */
    if (copiedElements.length === 0) {
        setHelpText('No elements in clipboard', 'info-circle');
        setTimeout(function () { setHelpText(''); }, 3000);
        return;
    }

    selectionIsCopied = true;

    selectionLog = [];
    busLog = [];
    deleteLog = [];
    selWireIndizes = [];
    selDiodeIndizes = [];
    selGatesIndizes = [];
    selInputsIndizes = [];
    selOutputsIndizes = [];
    selLabelIndizes = [];
    selSegDisplayIndizes = [];
    selCustomIndizes = [];
    selConpointIndizes = [];
    selBusWrappersIndizes = [];
    selBusUnwrappersIndizes = [];
    selBusInputIndizes = [];
    selDecodersIndizes = [];
    selBusIndizes = [];
    unmarkAll();

    let newCustoms = 0;
    let customDependencies = 0;

    for (let i = 0; i < copiedElements.length; i++) {
        let elem = _.cloneDeep(copiedElements[i]); // Clone the current element
        elem.alterPosition(GRIDSIZE, GRIDSIZE); // Move the element down right
        let busFlag = elem.id.charAt(elem.id.length - 1);
        if (elem.id.charAt(0) === 'b') {
            elem.id = elem.id.charAt(0) + elem.id.charAt(1) + Date.now() + Math.random(); // Give the cloned element a new ID
        } else {
            elem.id = elem.id.charAt(0) + Date.now() + Math.random(); // Give the cloned element a new ID
        }
        if (busFlag === 'b') {
            elem.id += 'b';
        }
        switch (elem.id.charAt(0)) { // Switch depending on the type of element
            /*
                For all cases: push the cloned element and note the position
            */
            case 'w':
                wires.push(_.cloneDeep(elem));
                selWireIndizes.push(wires.length - 1);
                break;
            case 'b':
                switch (elem.id.charAt(1)) {
                    case 'b':
                        busses.push(_.cloneDeep(elem));
                        selBusIndizes.push(busses.length - 1);
                        break;
                    case 'i':
                        busInputs.push(_.cloneDeep(elem));
                        selBusInputIndizes.push(busInputs.length - 1);
                        break;
                    default:
                }
                break;
            case 'd':
                diodes.push(_.cloneDeep(elem));
                selDiodeIndizes.push(diodes.length - 1);
                break;
            case 'g':
                gates.push(_.cloneDeep(elem));
                selGatesIndizes.push(gates.length - 1);
                break;
            case 'i':
                inputs.push(_.cloneDeep(elem));
                selInputsIndizes.push(inputs.length - 1);
                break;
            case 'o':
                outputs.push(_.cloneDeep(elem));
                selOutputsIndizes.push(outputs.length - 1);
                break;
            case 'l':
                labels.push(_.cloneDeep(elem));
                selLabelIndizes.push(labels.length - 1);
                break;
            case 's':
                segDisplays.push(_.cloneDeep(elem));
                selSegDisplayIndizes.push(segDisplays.length - 1);
                break;
            case 'r':
                busWrappers.push(_.cloneDeep(elem));
                selBusWrappersIndizes.push(busWrappers.length - 1);
                break;
            case 'u':
                busUnwrappers.push(_.cloneDeep(elem));
                selBusUnwrappersIndizes.push(busUnwrappers.length - 1);
                break;
            case 'e':
                decoders.push(_.cloneDeep(elem));
                selDecodersIndizes.push(decoders.length - 1);
                break;
            case 'c':
                customs.push(_.cloneDeep(elem));
                selCustomIndizes.push(customs.length - 1);
                newCustoms++;
                break;
            case 'p':
                conpoints.push(_.cloneDeep(elem));
                selConpointIndizes.push(conpoints.length - 1);
                break;
            default:
                console.error('An error occured while pasting');
        }
    }

    /*
        Configure buttons and modes to enable movement of the new elements
    */
    configureButtons('select');
    setUnactive();
    hideAllOptions();
    selectButton.classList.add('active');
    controlMode = 'select';
    setSelectMode('end');

    selectStartX = copiedOffsetStartX;
    selectStartY = copiedOffsetStartY;

    selectionBox.updatePosition(copiedOffsetStartX, copiedOffsetStartY);
    selectionBox.updateSize(copiedOffsetWidth, copiedOffsetHeight);
    selectionBox.setTransform(transform);

    document.getElementById('select-tools').style.display = 'block';
    positionSelectionTools();

    let head = customs.length; // Before loading the custom contents, note how many customs have existed before

    if (newCustoms === 0) {
        pushUndoAction('pasteSel', [customDependencies], [_.cloneDeep(copiedElements)]);
    } else {
        for (i = newCustoms; i > 0; i--) { // For every newly created custom
            if (i === 1) { // If this is the last custom to be loaded
                /*
                    Load the custom's content, note the number of new custom dependencies and push the action for undo/redo
                */
                loadCustomFile(customs[head - i].filename, head - i, head - i, function () { // jshint ignore:line
                    customDependencies = customs.length - head;
                    pushUndoAction('pasteSel', [customDependencies], [_.cloneDeep(copiedElements)]);
                });
            } else {
                loadCustomFile(customs[head - i].filename, head - i, head - i); // Load the custom's dependencies
            }
            customs[head - i].parsed = false;
        }
    }
}

/*
    Moves the selected items by dx, dy
*/
function moveSelection(dx, dy) {
    selectionBox.updatePosition(selectionBox.x + dx, selectionBox.y + dy);
    positionSelectionTools();

    for (let i = 0; i < selWireIndizes.length; i++) {
        wires[selWireIndizes[i]].alterPosition(dx, dy);
    }

    for (let i = 0; i < selBusIndizes.length; i++) {
        busses[selBusIndizes[i]].alterPosition(dx, dy);
    }

    for (let i = 0; i < selDiodeIndizes.length; i++) {
        diodes[selDiodeIndizes[i]].alterPosition(dx, dy);
    }

    for (let i = 0; i < selGatesIndizes.length; i++) {
        gates[selGatesIndizes[i]].alterPosition(dx, dy);
    }

    for (let i = 0; i < selInputsIndizes.length; i++) {
        inputs[selInputsIndizes[i]].alterPosition(dx, dy);
    }

    for (let i = 0; i < selOutputsIndizes.length; i++) {
        outputs[selOutputsIndizes[i]].alterPosition(dx, dy);
    }

    for (let i = 0; i < selLabelIndizes.length; i++) {
        labels[selLabelIndizes[i]].alterPosition(dx, dy);
    }

    for (let i = 0; i < selSegDisplayIndizes.length; i++) {
        segDisplays[selSegDisplayIndizes[i]].alterPosition(dx, dy);
    }

    for (let i = 0; i < selBusWrappersIndizes.length; i++) {
        busWrappers[selBusWrappersIndizes[i]].alterPosition(dx, dy);
    }

    for (let i = 0; i < selBusUnwrappersIndizes.length; i++) {
        busUnwrappers[selBusUnwrappersIndizes[i]].alterPosition(dx, dy);
    }

    for (let i = 0; i < selBusInputIndizes.length; i++) {
        busInputs[selBusInputIndizes[i]].alterPosition(dx, dy);
    }

    for (let i = 0; i < selDecodersIndizes.length; i++) {
        decoders[selDecodersIndizes[i]].alterPosition(dx, dy);
    }

    for (let i = 0; i < selCustomIndizes.length; i++) {
        customs[selCustomIndizes[i]].alterPosition(dx, dy);
    }

    for (let i = 0; i < selConpointIndizes.length; i++) {
        conpoints[selConpointIndizes[i]].alterPosition(dx, dy);
    }
}

/*
    Recalculates all wire segments and redoes the connection points
*/
function finishSelection() {
    let selectionOffsetX = selectionBox.x - selectionStartPosX;
    let selectionOffsetY = selectionBox.y - selectionStartPosY;

    document.getElementById('select-tools').style.display = 'none';

    if (selectionOffsetX !== 0 || selectionOffsetY !== 0) {

        for (let i = 0; i < selWireIndizes.length; i++) {
            selectionLog.push(['mWire', selWireIndizes[i]]);
        }
        integrateWires();

        for (let i = 0; i < selBusIndizes.length; i++) {
            busLog.push(['mBus', selBusIndizes[i]]);
        }
        integrateBusses();

        let conpointsBefore = _.cloneDeep(conpoints);

        for (let i = 0; i < selConpointIndizes.length; i++) {
            conpointsBefore[selConpointIndizes[i]].alterPosition(-selectionOffsetX, -selectionOffsetY);
            conpointsBefore[selConpointIndizes[i]].marked = false;
            conpoints[selConpointIndizes[i]].marked = false;
        }

        let diodesBefore = _.cloneDeep(diodes);
        for (let i = 0; i < selDiodeIndizes.length; i++) {
            diodesBefore[selDiodeIndizes[i]].alterPosition(-selectionOffsetX, -selectionOffsetY);
            diodesBefore[selDiodeIndizes[i]].marked = false;
            diodes[selDiodeIndizes[i]].marked = false;
        }

        doConpoints();

        let conpointsAfter = _.cloneDeep(conpoints);
        let diodesAfter = _.cloneDeep(diodes);
        if ((selGatesIndizes.length + selInputsIndizes.length + selOutputsIndizes.length + selLabelIndizes.length + selSegDisplayIndizes.length + selBusWrappersIndizes.length + selBusUnwrappersIndizes.length + selBusInputIndizes.length + selDecodersIndizes.length +
            selCustomIndizes.length + selConpointIndizes.length > 0 || selectionLog.length > 0 || busLog.length > 0) /*&& (selectionOffsetX !== 0 || selectionOffsetY !== 0)*/) {
            console.log('moveSel, offset: ' + selectionOffsetX + ' ' + selectionOffsetY);
            pushUndoAction('moveSel', [selectionOffsetX, selectionOffsetY, selGatesIndizes, selInputsIndizes, selOutputsIndizes, selLabelIndizes, selSegDisplayIndizes, selBusWrappersIndizes, selBusUnwrappersIndizes, selBusInputIndizes, selDecodersIndizes, selCustomIndizes, selConpointIndizes, selectionIsCopied],
                [_.cloneDeep(selectionLog), conpointsBefore, conpointsAfter, diodesBefore, diodesAfter, _.cloneDeep(busLog)]);
        }
    }
    selectionIsCopied = false;
}

function integrateWires() {
    // These are set true when a preview wire in that direction is 100% part of the existing wire
    let overlapOverAllX = false;
    let overlapOverAllY = false;

    let xIndex = -1;
    let yIndex = -1;

    let deletedIndices = [];

    let wiresToAdd = [];
    let wiresToAddIndizes = [];

    for (let i = selWireIndizes.length - 1; i >= 0; i--) {
        wires[selWireIndizes[i]].marked = false; // Unmark all marked wires
        wiresToAdd = wiresToAdd.concat(wires.splice(selWireIndizes[i], 1));
        wiresToAddIndizes.push(selWireIndizes[i]);
    }

    for (let j = 0; j < wiresToAdd.length; j++) {
        xIndex = -1;
        yIndex = -1;
        deletedIndices = [];
        overlapOverAllX = false;
        overlapOverAllY = false;
        if (wiresToAdd[j].direction === 0) {
            for (let i = 0; i < wires.length; i++) {
                let overlap = wireOverlap(wiresToAdd[j], wires[i]);
                if ((overlap[0] !== overlap[2] || overlap[1] !== overlap[3]) || (wires[i].direction === 0 && wiresToAdd[j].startY === wires[i].startY &&
                    (wiresToAdd[j].startX == wires[i].endX || wiresToAdd[j].startX == wires[i].startX || wiresToAdd[j].endX == wires[i].startX || wiresToAdd[j].endX == wires[i].endX))) { //jshint ignore:line
                    if (xIndex >= 0) {
                        let newWire = new Wire(0, Math.min(wires[xIndex].startX, wires[i].startX), wires[xIndex].startY);
                        newWire.endX = Math.max(wires[xIndex].endX, wires[i].endX);
                        newWire.endY = wires[xIndex].startY;
                        if (newWire.startX !== wires[i].startX || newWire.endX !== wires[i].endX) {
                            selectionLog.push(['rWire', xIndex, wires[xIndex], newWire, wiresToAdd[j], wiresToAddIndizes[j]]);
                            wires.splice(xIndex, 1, newWire);
                            deletedIndices.push(i);
                        } else {
                            overlapOverAllX = true;
                            selectionLog.push(['rWire', xIndex, wires[xIndex], newWire, wiresToAdd[j], wiresToAddIndizes[j]]);
                        }
                    } else {
                        let newWire = new Wire(0, Math.min(wiresToAdd[j].startX, wires[i].startX), wiresToAdd[j].startY);
                        newWire.endX = Math.max(wiresToAdd[j].endX, wires[i].endX);
                        newWire.endY = wiresToAdd[j].startY;
                        if (newWire.startX !== wires[i].startX || newWire.endX !== wires[i].endX) {
                            selectionLog.push(['rWire', i, wires[i], newWire, wiresToAdd[j], wiresToAddIndizes[j]]);
                            wires.splice(i, 1, newWire);
                            xIndex = i;
                        } else {
                            overlapOverAllX = true;
                            selectionLog.push(['rWire', i, wires[i], newWire, wiresToAdd[j], wiresToAddIndizes[j]]);
                        }
                    }
                }
            }
            if (xIndex < 0 && !overlapOverAllX) {
                let newWire = new Wire(0, wiresToAdd[j].startX, wiresToAdd[j].startY);
                newWire.endX = wiresToAdd[j].endX;
                newWire.endY = wiresToAdd[j].startY;
                selectionLog.push(['aWire', wires.length, newWire, wiresToAddIndizes[j]]);
                wires.push(newWire);
            }
        } else {
            for (let i = 0; i < wires.length; i++) {
                let overlap = wireOverlap(wiresToAdd[j], wires[i]);
                // If there's an overlap or the wires are adjacent
                if ((overlap[0] !== overlap[2] || overlap[1] !== overlap[3]) || (wires[i].direction === 1 && wiresToAdd[j].startX === wires[i].startX &&
                    (wiresToAdd[j].startY == wires[i].endY || wiresToAdd[j].startY == wires[i].startY || wiresToAdd[j].endY == wires[i].startY || wiresToAdd[j].endY == wires[i].endY))) { //jshint ignore:line
                    if (yIndex >= 0) {
                        let newWire = new Wire(1, wires[yIndex].startX, Math.min(wires[yIndex].startY, wires[i].startY));
                        newWire.endX = wires[yIndex].startX;
                        newWire.endY = Math.max(wires[yIndex].endY, wires[i].endY);
                        if (newWire.startY !== wires[i].startY || newWire.endY !== wires[i].endY) {
                            selectionLog.push(['rWire', yIndex, wires[yIndex], newWire, wiresToAdd[j], wiresToAddIndizes[j]]);
                            wires.splice(yIndex, 1, newWire);
                            deletedIndices.push(i);
                        } else {
                            overlapOverAllY = true;
                            selectionLog.push(['rWire', yIndex, wires[yIndex], newWire, wiresToAdd[j], wiresToAddIndizes[j]]);
                        }
                    } else {
                        let newWire = new Wire(1, wiresToAdd[j].startX, Math.min(wiresToAdd[j].startY, wires[i].startY));
                        newWire.endX = wiresToAdd[j].startX;
                        newWire.endY = Math.max(wiresToAdd[j].endY, wires[i].endY);
                        if (newWire.startY !== wires[i].startY || newWire.endY !== wires[i].endY) {
                            selectionLog.push(['rWire', i, wires[i], newWire, wiresToAdd[j], wiresToAddIndizes[j]]);
                            wires.splice(i, 1, newWire);
                            yIndex = i;
                        } else {
                            overlapOverAllY = true;
                            selectionLog.push(['rWire', i, wires[i], newWire, wiresToAdd[j], wiresToAddIndizes[j]]);
                        }
                    }
                }
            }

            if (yIndex < 0 && !overlapOverAllY) {
                let newWire = new Wire(1, wiresToAdd[j].startX, wiresToAdd[j].startY);
                newWire.endX = wiresToAdd[j].startX;
                newWire.endY = wiresToAdd[j].endY;
                selectionLog.push(['aWire', wires.length, newWire, wiresToAddIndizes[j]]);
                wires.push(newWire);
            }
        }

        for (let i = deletedIndices.length - 1; i >= 0; i--) {
            selectionLog.push(['dWire', deletedIndices[i], wires.splice(deletedIndices[i], 1)[0]]);
        }
    }
}

function integrateBusses() {
    // These are set true when a preview wire in that direction is 100% part of the existing wire
    let overlapOverAllX = false;
    let overlapOverAllY = false;

    let xIndex = -1;
    let yIndex = -1;

    let deletedIndices = [];

    let bussesToAdd = [];
    let bussesToAddIndizes = [];

    for (let i = selBusIndizes.length - 1; i >= 0; i--) {
        busses[selBusIndizes[i]].marked = false; // Unmark all marked busses
        bussesToAdd = bussesToAdd.concat(busses.splice(selBusIndizes[i], 1));
        bussesToAddIndizes.push(selBusIndizes[i]);
    }

    for (let j = 0; j < bussesToAdd.length; j++) {
        xIndex = -1;
        yIndex = -1;
        deletedIndices = [];
        overlapOverAllX = false;
        overlapOverAllY = false;
        if (bussesToAdd[j].direction === 0) {
            for (let i = 0; i < busses.length; i++) {
                let overlap = wireOverlap(bussesToAdd[j], busses[i]);
                if ((overlap[0] !== overlap[2] || overlap[1] !== overlap[3]) || (busses[i].direction === 0 && bussesToAdd[j].startY === busses[i].startY &&
                    (bussesToAdd[j].startX == busses[i].endX || bussesToAdd[j].startX == busses[i].startX || bussesToAdd[j].endX == busses[i].startX || bussesToAdd[j].endX == busses[i].endX))) { //jshint ignore:line
                    if (xIndex >= 0) {
                        let newBus = new Bus(0, Math.min(busses[xIndex].startX, busses[i].startX), busses[xIndex].startY);
                        newBus.endX = Math.max(busses[xIndex].endX, busses[i].endX);
                        newBus.endY = busses[xIndex].startY;
                        if (newBus.startX !== busses[i].startX || newBus.endX !== busses[i].endX) {
                            busLog.push(['rBus', xIndex, busses[xIndex], newBus, bussesToAdd[j], bussesToAddIndizes[j]]);
                            busses.splice(xIndex, 1, newBus);
                            deletedIndices.push(i);
                        } else {
                            overlapOverAllX = true;
                            busLog.push(['rBus', xIndex, busses[xIndex], newBus, bussesToAdd[j], bussesToAddIndizes[j]]);
                        }
                    } else {
                        let newBus = new Bus(0, Math.min(bussesToAdd[j].startX, busses[i].startX), bussesToAdd[j].startY);
                        newBus.endX = Math.max(bussesToAdd[j].endX, busses[i].endX);
                        newBus.endY = bussesToAdd[j].startY;
                        if (newBus.startX !== busses[i].startX || newBus.endX !== busses[i].endX) {
                            busLog.push(['rBus', i, busses[i], newBus, bussesToAdd[j], bussesToAddIndizes[j]]);
                            busses.splice(i, 1, newBus);
                            xIndex = i;
                        } else {
                            overlapOverAllX = true;
                            busLog.push(['rBus', i, busses[i], newBus, bussesToAdd[j], bussesToAddIndizes[j]]);
                        }
                    }
                }
            }
            if (xIndex < 0 && !overlapOverAllX) {
                let newBus = new Bus(0, bussesToAdd[j].startX, bussesToAdd[j].startY);
                newBus.endX = bussesToAdd[j].endX;
                newBus.endY = bussesToAdd[j].startY;
                busLog.push(['aBus', busses.length, newBus, bussesToAddIndizes[j]]);
                busses.push(newBus);
            }
        } else {
            for (let i = 0; i < busses.length; i++) {
                let overlap = wireOverlap(bussesToAdd[j], busses[i]);
                // If there's an overlap or the busses are adjacent
                if ((overlap[0] !== overlap[2] || overlap[1] !== overlap[3]) || (busses[i].direction === 1 && bussesToAdd[j].startX === busses[i].startX &&
                    (bussesToAdd[j].startY == busses[i].endY || bussesToAdd[j].startY == busses[i].startY || bussesToAdd[j].endY == busses[i].startY || bussesToAdd[j].endY == busses[i].endY))) { //jshint ignore:line
                    if (yIndex >= 0) {
                        let newBus = new Bus(1, busses[yIndex].startX, Math.min(busses[yIndex].startY, busses[i].startY));
                        newBus.endX = busses[yIndex].startX;
                        newBus.endY = Math.max(busses[yIndex].endY, busses[i].endY);
                        if (newBus.startY !== busses[i].startY || newBus.endY !== busses[i].endY) {
                            busLog.push(['rBus', yIndex, busses[yIndex], newBus, bussesToAdd[j], bussesToAddIndizes[j]]);
                            busses.splice(yIndex, 1, newBus);
                            deletedIndices.push(i);
                        } else {
                            overlapOverAllY = true;
                            busLog.push(['rBus', yIndex, busses[yIndex], newBus, bussesToAdd[j], bussesToAddIndizes[j]]);
                        }
                    } else {
                        let newBus = new Bus(1, bussesToAdd[j].startX, Math.min(bussesToAdd[j].startY, busses[i].startY));
                        newBus.endX = bussesToAdd[j].startX;
                        newBus.endY = Math.max(bussesToAdd[j].endY, busses[i].endY);
                        if (newBus.startY !== busses[i].startY || newBus.endY !== busses[i].endY) {
                            busLog.push(['rBus', i, busses[i], newBus, bussesToAdd[j], bussesToAddIndizes[j]]);
                            busses.splice(i, 1, newBus);
                            yIndex = i;
                        } else {
                            overlapOverAllY = true;
                            busLog.push(['rBus', i, busses[i], newBus, bussesToAdd[j], bussesToAddIndizes[j]]);
                        }
                    }
                }
            }

            if (yIndex < 0 && !overlapOverAllY) {
                let newBus = new Bus(1, bussesToAdd[j].startX, bussesToAdd[j].startY);
                newBus.endX = bussesToAdd[j].startX;
                newBus.endY = bussesToAdd[j].endY;
                busLog.push(['aBus', busses.length, newBus, bussesToAddIndizes[j]]);
                busses.push(newBus);
            }
        }

        for (let i = deletedIndices.length - 1; i >= 0; i--) {
            busLog.push(['dBus', deletedIndices[i], busses.splice(deletedIndices[i], 1)[0]]);
        }
    }
}

function positionSelectionTools() {
    document.getElementById('select-tools').style.left = ((selectionBox.x + selectionBox.w / 2 + transform.dx + 2) * transform.zoom) + 240 - 200 + 'px';
    document.getElementById('select-tools').style.top = ((selectionBox.y + transform.dy - selectionBox.h / 2 - 1) * transform.zoom) - 50 + 'px';
}