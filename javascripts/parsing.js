// File: parsing.js

/*
    Gives an index list of all wires that go trough x/y (including edge cases), except wire j
*/
function wirePoints(x, y, j) {
    let indexList = [];
    for (let i = 0; i < wires.length; i++) {
        if (((wires[i].direction === 0 && wires[i].endX <= x && wires[i].startX >= x && wires[i].startY === y) ||
            (wires[i].direction === 1 && wires[i].endY <= y && wires[i].startY >= y && wires[i].startX === x) ||
            (wires[i].direction === 0 && wires[i].startX <= x && wires[i].endX >= x && wires[i].startY === y) ||
            (wires[i].direction === 1 && wires[i].startY <= y && wires[i].endY >= y && wires[i].startX === x)) &&
            (i !== j)) {
            indexList.push(i);
        }
    }
    return indexList;
}

function busPoints(x, y, j) {
    let indexList = [];
    for (let i = 0; i < busses.length; i++) {
        if (((busses[i].direction === 0 && busses[i].endX <= x && busses[i].startX >= x && busses[i].startY === y) ||
            (busses[i].direction === 1 && busses[i].endY <= y && busses[i].startY >= y && busses[i].startX === x) ||
            (busses[i].direction === 0 && busses[i].startX <= x && busses[i].endX >= x && busses[i].startY === y) ||
            (busses[i].direction === 1 && busses[i].startY <= y && busses[i].endY >= y && busses[i].startX === x)) &&
            (i !== j)) {
            indexList.push(i);
        }
    }
    return indexList;
}

/*
    Gives an index list of all wires that connect to another wire without crossing it
*/
function wireConnect(wire) {
    let wMinX = Math.min(wire.startX, wire.endX);
    let wMinY = Math.min(wire.startY, wire.endY);
    let wMaxX = Math.max(wire.startX, wire.endX);
    let wMaxY = Math.max(wire.startY, wire.endY);
    let indexList = [];

    for (let i = 0; i < wires.length; i++) {
        let minX = Math.min(wires[i].startX, wires[i].endX);
        let minY = Math.min(wires[i].startY, wires[i].endY);
        let maxX = Math.max(wires[i].startX, wires[i].endX);
        let maxY = Math.max(wires[i].startY, wires[i].endY);
        if (wire.direction === 0 && wires[i].direction === 1) {
            if ((minY <= wMinY && maxY === wMinY && minX >= wMinX && minX <= wMaxX) ||
                (minY === wMinY && maxY >= wMinY && minX >= wMinX && minX <= wMaxX) ||
                (minY <= wMinY && maxY >= wMinY && minX >= wMinX && minX === wMaxX) ||
                (minY <= wMinY && maxY >= wMinY && minX === wMinX && minX <= wMaxX)) {
                indexList.push(i);
            }
        } else if (wire.direction === 1 && wires[i].direction === 0) {
            if ((wMinY <= minY && wMaxY === minY && wMinX >= minX && wMinX <= maxX) ||
                (wMinY === minY && wMaxY >= minY && wMinX >= minX && wMinX <= maxX) ||
                (wMinY <= minY && wMaxY >= minY && wMinX >= minX && wMinX === maxX) ||
                (wMinY <= minY && wMaxY >= minY && wMinX === minX && wMinX <= maxX)) {
                indexList.push(i);
            }
        }
    }
    return indexList;
}

function busConnect(bus) {
    let wMinX = Math.min(bus.startX, bus.endX);
    let wMinY = Math.min(bus.startY, bus.endY);
    let wMaxX = Math.max(bus.startX, bus.endX);
    let wMaxY = Math.max(bus.startY, bus.endY);
    let indexList = [];

    for (let i = 0; i < busses.length; i++) {
        let minX = Math.min(busses[i].startX, busses[i].endX);
        let minY = Math.min(busses[i].startY, busses[i].endY);
        let maxX = Math.max(busses[i].startX, busses[i].endX);
        let maxY = Math.max(busses[i].startY, busses[i].endY);
        if (bus.direction === 0 && busses[i].direction === 1) {
            if ((minY <= wMinY && maxY === wMinY && minX >= wMinX && minX <= wMaxX) ||
                (minY === wMinY && maxY >= wMinY && minX >= wMinX && minX <= wMaxX) ||
                (minY <= wMinY && maxY >= wMinY && minX >= wMinX && minX === wMaxX) ||
                (minY <= wMinY && maxY >= wMinY && minX === wMinX && minX <= wMaxX)) {
                indexList.push(i);
            }
        } else if (bus.direction === 1 && busses[i].direction === 0) {
            if ((wMinY <= minY && wMaxY === minY && wMinX >= minX && wMinX <= maxX) ||
                (wMinY === minY && wMaxY >= minY && wMinX >= minX && wMinX <= maxX) ||
                (wMinY <= minY && wMaxY >= minY && wMinX >= minX && wMinX === maxX) ||
                (wMinY <= minY && wMaxY >= minY && wMinX === minX && wMinX <= maxX)) {
                indexList.push(i);
            }
        }
    }
    return indexList;
}

/*
    Gives an index list of all wires that go trough x/y (excluding edge cases), except wire j
*/
function wiresTrough(x, y, j) {
    let indexList = [];
    for (let i = 0; i < wires.length; i++) {
        if (((wires[i].direction === 0 && wires[i].endX < x && wires[i].startX > x && wires[i].startY === y) ||
            (wires[i].direction === 1 && wires[i].endY < y && wires[i].startY > y && wires[i].startX === x) ||
            (wires[i].direction === 0 && wires[i].startX < x && wires[i].endX > x && wires[i].startY === y) ||
            (wires[i].direction === 1 && wires[i].startY < y && wires[i].endY > y && wires[i].startX === x)) &&
            (i !== j)) {
            indexList.push(i);
        }
    }
    return indexList;
}

function bussesTrough(x, y, j) {
    let indexList = [];
    for (let i = 0; i < busses.length; i++) {
        if (((busses[i].direction === 0 && busses[i].endX < x && busses[i].startX > x && busses[i].startY === y) ||
            (busses[i].direction === 1 && busses[i].endY < y && busses[i].startY > y && busses[i].startX === x) ||
            (busses[i].direction === 0 && busses[i].startX < x && busses[i].endX > x && busses[i].startY === y) ||
            (busses[i].direction === 1 && busses[i].startY < y && busses[i].endY > y && busses[i].startX === x)) &&
            (i !== j)) {
            indexList.push(i);
        }
    }
    return indexList;
}

/*
    Groups all wires in the sketch
*/
function parseGroups() {
    traced = [];
    groups = [];
    for (let i = 0; i < wires.length; i++) {
        if (traced.indexOf(i) < 0) { // If the segment wasn't included in a group yet
            exploreGroup(i); // Explore a new group starting at this segment
        }
    }
}

function parseBusGroups() {
    traced = [];
    busGroups = [];
    for (let i = 0; i < busses.length; i++) {
        if (traced.indexOf(i) < 0) { // If the segment wasn't included in a group yet
            exploreBusGroup(i); // Explore a new group starting at this segment
        }
    }
}

/*
    Explores the group that contains the given wire
*/

function exploreGroup(wire) {
    groups.push(new Group());
    exGroup(wire, groups.length - 1);
}

function exploreBusGroup(bus) {
    busGroups.push(new BusGroup());
    exBusGroup(bus, busGroups.length - 1);
}

/*
    Recursive wire traversing algorithm
    Starts at one wire and explorers one wire group
*/
function exGroup(j, g) {
    wires[j].setGroup(g);
    groups[g].addWire(wires[j]);
    traced.push(j);

    let connected = wireConnect(wires[j]); // Gives all connected wires (no full crossings)

    for (let elem of listConpoints(Math.min(wires[j].startX, wires[j].endX), Math.min(wires[j].startY, wires[j].endY),
        Math.max(wires[j].startX, wires[j].endX), Math.max(wires[j].startY, wires[j].endY))) {
        conpoints[elem].setGroup(g);
        let troughWire = wiresTrough(conpoints[elem].x, conpoints[elem].y, j);
        if (troughWire.length === 1) {
            connected.push(troughWire[0]);
        }
    }

    // Trace the remaining wires recursivly
    for (let i = 0; i < connected.length; i++) {
        if (traced.indexOf(connected[i]) < 0) {
            exGroup(connected[i], g);
        }
    }
}

function exBusGroup(j, g) {
    busses[j].setGroup(g);
    busGroups[g].addBus(busses[j]);
    traced.push(j);

    let connected = busConnect(busses[j]); // Gives all connected wires (no full crossings)

    for (let elem of listConpoints(Math.min(busses[j].startX, busses[j].endX), Math.min(busses[j].startY, busses[j].endY),
        Math.max(busses[j].startX, busses[j].endX), Math.max(busses[j].startY, busses[j].endY))) {
        conpoints[elem].setGroup(g);
        let troughWire = bussesTrough(conpoints[elem].x, conpoints[elem].y, j);
        if (troughWire.length === 1) {
            connected.push(troughWire[0]);
        }
    }

    // Trace the remaining wires recursivly
    for (let i = 0; i < connected.length; i++) {
        if (traced.indexOf(connected[i]) < 0) {
            exBusGroup(connected[i], g);
        }
    }
}

function generatePreviewWires(startX, startY, endX, endY) {
    if (startX === endX && startY === endY) {
        pwWireX = null;
        pwWireY = null;
        return;
    }

    let mimicBus = busInsert && !(controlMode === 'delete');

    if (startDirection === 0) {
        if (startX <= endX) {
            pwWireX = new Wire(0, startX, startY, mimicBus);
            pwWireX.endX = endX;
        } else if (startX >= endX) {
            pwWireX = new Wire(0, endX, startY, mimicBus);
            pwWireX.endX = startX;
        }
        pwWireX.endY = startY;

        if (startY <= endY) {
            pwWireY = new Wire(1, endX, startY, mimicBus);
            pwWireY.endY = endY;
        } else if (startY >= endY) {
            pwWireY = new Wire(1, endX, endY, mimicBus);
            pwWireY.endY = startY;
        }
        pwWireY.endX = endX;
    } else if (startDirection === 1) {
        if (startY <= endY) {
            pwWireY = new Wire(1, startX, startY, mimicBus);
            pwWireY.endY = endY;
        } else if (startY >= endY) {
            pwWireY = new Wire(1, startX, endY, mimicBus);
            pwWireY.endY = startY;
        }
        pwWireY.endX = startX;

        if (startX <= endX) {
            pwWireX = new Wire(0, startX, endY, mimicBus);
            pwWireX.endX = endX;
        } else if (startX >= endX) {
            pwWireX = new Wire(0, endX, endY, mimicBus);
            pwWireX.endX = startX;
        }
        pwWireX.endY = endY;
    }

    if (pwWireX !== null && pwWireX.startX === pwWireX.endX) {
        pwWireX = null;
    }

    if (pwWireY !== null && pwWireY.startY === pwWireY.endY) {
        pwWireY = null;
    }

    if ((startX !== endX || startY !== endY) && !lockElements) {
        lockElements = true;
        if (startX !== endX) {
            startDirection = 0;
        } else {
            startDirection = 1;
        }
        closeModifierMenu();
        unmarkPropTargets();
    }
}

function wireOverlap(a, b) {
    if (a.direction === 0 && a.startY === b.startY && a.direction === b.direction) {
        if (Math.min(a.startX, a.endX) <= Math.min(b.startX, b.endX) && Math.max(a.startX, a.endX) >= Math.max(b.startX, b.endX)) {
            return [Math.min(b.startX, b.endX), b.startY, Math.max(b.startX, b.endX), b.startY];
        } else if (Math.min(b.startX, b.endX) <= Math.min(a.startX, a.endX) && Math.max(b.startX, b.endX) >= Math.max(a.startX, a.endX)) {
            return [Math.min(a.startX, a.endX), a.startY, Math.max(a.startX, a.endX), a.startY];
        } else if (Math.min(a.startX, a.endX) <= Math.min(b.startX, b.endX) && Math.max(a.startX, a.endX) >= Math.min(b.startX, b.endX)) {
            return [Math.min(b.startX, b.endX), b.startY, Math.max(a.startX, a.endX), b.startY];
        } else if (Math.min(b.startX, b.endX) <= Math.min(a.startX, a.endX) && Math.max(b.startX, b.endX) >= Math.min(a.startX, a.endX)) {
            return [Math.min(a.startX, a.endX), a.startY, Math.max(b.startX, b.endX), a.startY];
        }
    }

    if (a.direction === 1 && a.startX === b.startX && a.direction === b.direction) {
        if (Math.min(a.startY, a.endY) <= Math.min(b.startY, b.endY) && Math.max(a.startY, a.endY) >= Math.max(b.startY, b.endY)) {
            return [b.startX, Math.min(b.startY, b.endY), b.startX, Math.max(b.startY, b.endY)];
        } else if (Math.min(b.startY, b.endY) <= Math.min(a.startY, a.endY) && Math.max(b.startY, b.endY) >= Math.max(a.startY, a.endY)) {
            return [a.startX, Math.min(a.startY, a.endY), a.startX, Math.max(a.startY, a.endY)];
        } else if (Math.min(a.startY, a.endY) <= Math.min(b.startY, b.endY) && Math.max(a.startY, a.endY) >= Math.min(b.startY, b.endY)) {
            return [b.startX, Math.min(b.startY, b.endY), b.startX, Math.max(a.startY, a.endY)];
        } else if (Math.min(b.startY, b.endY) <= Math.min(a.startY, a.endY) && Math.max(b.startY, b.endY) >= Math.min(a.startY, a.endY)) {
            return [a.startX, Math.min(a.startY, a.endY), a.startX, Math.max(b.startY, b.endY)];
        }
    }

    return [a.startX, a.endX, a.startX, a.endX];
}

/*
    Links all in- and outputs to the wire group that they belong to
    This requires that the wires have been grouped by parseGroups()
*/
function integrateElements() {
    for (let j = 0; j < gates.length; j++) {
        for (let k = 0; k < gates[j].outputCount; k++) {
            let outputWires = wirePoints(gates[j].outputClickBoxes[k].x, gates[j].outputClickBoxes[k].y, -1);
            if (outputWires.length > 0) {
                groups[wires[outputWires[0]].group].addOutput(gates[j], k);
            }
        }
        for (let k = 0; k < gates[j].inputCount; k++) {
            let inputWires = wirePoints(gates[j].inputClickBoxes[k].x, gates[j].inputClickBoxes[k].y, -1);
            if (inputWires.length > 0) {
                groups[wires[inputWires[0]].group].addInput(gates[j], k);
            }
        }
    }

    for (let j = 0; j < customs.length; j++) {
        if (customs[j].visible) {
            for (let k = 0; k < customs[j].outputCount; k++) {
                let outputWires = wirePoints(customs[j].outputClickBoxes[k].x, customs[j].outputClickBoxes[k].y, -1);
                if (outputWires.length > 0) {
                    groups[wires[outputWires[0]].group].addOutput(customs[j], k);
                }
            }
            for (let k = 0; k < customs[j].inputCount; k++) {
                let inputWires = wirePoints(customs[j].inputClickBoxes[k].x, customs[j].inputClickBoxes[k].y, -1);
                if (inputWires.length > 0) {
                    groups[wires[inputWires[0]].group].addInput(customs[j], k);
                }
            }
        }
    }

    for (let j = 0; j < segDisplays.length; j++) {
        if (!segDisplays[j].id.endsWith('b')) {
            for (let k = 0; k < segDisplays[j].inputCount; k++) {
                let inputWires = wirePoints(segDisplays[j].inputClickBoxes[k].x, segDisplays[j].inputClickBoxes[k].y, -1);
                if (inputWires.length > 0) {
                    groups[wires[inputWires[0]].group].addInput(segDisplays[j], k);
                }
            }
        }
    }

    for (let j = 0; j < busWrappers.length; j++) {
        for (let k = 0; k < busWrappers[j].inputCount; k++) {
            let inputWires = wirePoints(busWrappers[j].inputClickBoxes[k].x, busWrappers[j].inputClickBoxes[k].y, -1);
            if (inputWires.length > 0) {
                groups[wires[inputWires[0]].group].addInput(busWrappers[j], k);
                console.log("Wire integration");
            }
        }
    }

    for (let j = 0; j < busUnwrappers.length; j++) {
        for (let k = 0; k < busUnwrappers[j].outputCount; k++) {
            let outputWires = wirePoints(busUnwrappers[j].outputClickBoxes[k].x, busUnwrappers[j].outputClickBoxes[k].y, -1);
            if (outputWires.length > 0) {
                groups[wires[outputWires[0]].group].addOutput(busUnwrappers[j], k);
            }
        }
    }

    for (let j = 0; j < inputs.length; j++) {
        let outputWires = wirePoints(inputs[j].clickBox.x, inputs[j].clickBox.y, -1);
        if (outputWires.length > 0) {
            groups[wires[outputWires[0]].group].addOutput(inputs[j], 0);
        }
    }

    for (let j = 0; j < outputs.length; j++) {
        let inputWires = wirePoints(outputs[j].clickBox.x, outputs[j].clickBox.y, -1);
        if (inputWires.length > 0) {
            groups[wires[inputWires[0]].group].addInput(outputs[j], 0);
        }
    }

    for (let j = 0; j < diodes.length; j++) {
        let diodeWires = wiresTrough(diodes[j].clickBox.x, diodes[j].clickBox.y, -1);
        if (diodeWires.length > 1) {
            if (wires[diodeWires[0]].direction === 0 && wires[diodeWires[1]].direction === 1) {
                diodes[j].setGroups(wires[diodeWires[0]].group, wires[diodeWires[1]].group);
            } else if (wires[diodeWires[0]].direction === 1 && wires[diodeWires[1]].direction === 0) {
                diodes[j].setGroups(wires[diodeWires[1]].group, wires[diodeWires[0]].group);
            }
        }
    }
}

function integrateBusElements() {
    /*for (let j = 0; j < gates.length; j++) {
        for (let k = 0; k < gates[j].outputCount; k++) {
            let outputWires = wirePoints(gates[j].outputClickBoxes[k].x, gates[j].outputClickBoxes[k].y, -1);
            if (outputWires.length > 0) {
                groups[wires[outputWires[0]].group].addOutput(gates[j], k);
            }
        }
        for (let k = 0; k < gates[j].inputCount; k++) {
            let inputWires = wirePoints(gates[j].inputClickBoxes[k].x, gates[j].inputClickBoxes[k].y, -1);
            if (inputWires.length > 0) {
                groups[wires[inputWires[0]].group].addInput(gates[j], k);
            }
        }
    }

    for (let j = 0; j < customs.length; j++) {
        if (customs[j].visible) {
            for (let k = 0; k < customs[j].outputCount; k++) {
                let outputWires = wirePoints(customs[j].outputClickBoxes[k].x, customs[j].outputClickBoxes[k].y, -1);
                if (outputWires.length > 0) {
                    groups[wires[outputWires[0]].group].addOutput(customs[j], k);
                }
            }
            for (let k = 0; k < customs[j].inputCount; k++) {
                let inputWires = wirePoints(customs[j].inputClickBoxes[k].x, customs[j].inputClickBoxes[k].y, -1);
                if (inputWires.length > 0) {
                    groups[wires[inputWires[0]].group].addInput(customs[j], k);
                }
            }
        }
    }*/

    for (let j = 0; j < segDisplays.length; j++) {
        if (segDisplays[j].id.endsWith('b')) {
            let inputBusses = busPoints(segDisplays[j].inputClickBox.x, segDisplays[j].inputClickBox.y, -1);
            if (inputBusses.length > 0) {
                busGroups[busses[inputBusses[0]].group].addInput(segDisplays[j], 0);
                if (segDisplays[j].inputCount > busGroups[busses[inputBusses[0]].group].busWidth) {
                    busGroups[busses[inputBusses[0]].group].updateBusWidth(segDisplays[j].inputCount);
                }
            }
        }
    }

    for (let j = 0; j < busWrappers.length; j++) {
        let outputBusses = busPoints(busWrappers[j].outputClickBox.x, busWrappers[j].outputClickBox.y, -1);
        if (outputBusses.length > 0) {
            busGroups[busses[outputBusses[0]].group].addOutput(busWrappers[j], 0);
            if (busWrappers[j].inputCount > busGroups[busses[outputBusses[0]].group].busWidth) {
                busGroups[busses[outputBusses[0]].group].updateBusWidth(busWrappers[j].inputCount);
            }
        }
    }

    for (let j = 0; j < busUnwrappers.length; j++) {
        let inputBusses = busPoints(busUnwrappers[j].inputClickBox.x, busUnwrappers[j].inputClickBox.y, -1);
        if (inputBusses.length > 0) {
            busGroups[busses[inputBusses[0]].group].addInput(busUnwrappers[j], 0);
            if (busUnwrappers[j].outputCount > busGroups[busses[inputBusses[0]].group].busWidth) {
                busGroups[busses[inputBusses[0]].group].updateBusWidth(busUnwrappers[j].outputCount);
            }
        }
    }

    /*for (let j = 0; j < inputs.length; j++) {
        let outputWires = wirePoints(inputs[j].clickBox.x, inputs[j].clickBox.y, -1);
        if (outputWires.length > 0) {
            groups[wires[outputWires[0]].group].addOutput(inputs[j], 0);
        }
    }

    for (let j = 0; j < outputs.length; j++) {
        let inputWires = wirePoints(outputs[j].clickBox.x, outputs[j].clickBox.y, -1);
        if (inputWires.length > 0) {
            groups[wires[inputWires[0]].group].addInput(outputs[j], 0);
        }
    }

    for (let j = 0; j < diodes.length; j++) {
        let diodeWires = wiresTrough(diodes[j].clickBox.x, diodes[j].clickBox.y, -1);
        if (diodeWires.length > 1) {
            if (wires[diodeWires[0]].direction === 0 && wires[diodeWires[1]].direction === 1) {
                diodes[j].setGroups(wires[diodeWires[0]].group, wires[diodeWires[1]].group);
            } else if (wires[diodeWires[0]].direction === 1 && wires[diodeWires[1]].direction === 0) {
                diodes[j].setGroups(wires[diodeWires[1]].group, wires[diodeWires[0]].group);
            }
        }
    }*/

    for (let i = 0; i < busGroups.length; i++) {
        busGroups[i].updateBusWidth();
    }
}

function removeFromWire(w, overlap, wireIndex) {
    let newWires = [];
    let minX = overlap[0];
    let minY = overlap[1];
    let maxX = overlap[2];
    let maxY = overlap[3];

    if (minX === maxX && minY === maxY) {
        return false;
    }

    if ((w.direction === 0 && w.startY !== minY) || (w.direction === 1 && w.startX !== minX)) {
        return false;
    }

    if (w.direction === 0 && Math.min(w.startX, w.endX) < minX) {
        let wire1 = new Wire(0, Math.min(w.startX, w.endX), w.startY);
        wire1.endX = minX;
        wire1.endY = wire1.startY;
        newWires.push(wire1);
    }

    if (w.direction === 0 && Math.max(w.startX, w.endX) > maxX) {
        let wire2 = new Wire(0, maxX, w.startY);
        wire2.endX = Math.max(w.startX, w.endX);
        wire2.endY = wire2.startY;
        newWires.push(wire2);
    }

    if (w.direction === 1 && Math.min(w.startY, w.endY) < minY) {
        let wire1 = new Wire(1, w.startX, Math.min(w.startY, w.endY));
        wire1.endX = wire1.startX;
        wire1.endY = minY;
        newWires.push(wire1);
    }

    if (w.direction === 1 && Math.max(w.startY, w.endY) > maxY) {
        let wire2 = new Wire(1, w.startX, maxY);
        wire2.endX = wire2.startX;
        wire2.endY = Math.max(w.startY, w.endY);
        newWires.push(wire2);
    }
    return newWires;
}


function removeFromBus(w, overlap, busIndex) {
    let newBusses = [];
    let minX = overlap[0];
    let minY = overlap[1];
    let maxX = overlap[2];
    let maxY = overlap[3];

    if (minX === maxX && minY === maxY) {
        return false;
    }

    if ((w.direction === 0 && w.startY !== minY) || (w.direction === 1 && w.startX !== minX)) {
        return false;
    }

    if (w.direction === 0 && Math.min(w.startX, w.endX) < minX) {
        let bus1 = new Bus(0, Math.min(w.startX, w.endX), w.startY);
        bus1.endX = minX;
        bus1.endY = bus1.startY;
        newBusses.push(bus1);
    }

    if (w.direction === 0 && Math.max(w.startX, w.endX) > maxX) {
        let bus2 = new Bus(0, maxX, w.startY);
        bus2.endX = Math.max(w.startX, w.endX);
        bus2.endY = bus2.startY;
        newBusses.push(bus2);
    }

    if (w.direction === 1 && Math.min(w.startY, w.endY) < minY) {
        let bus1 = new Bus(1, w.startX, Math.min(w.startY, w.endY));
        bus1.endX = bus1.startX;
        bus1.endY = minY;
        newBusses.push(bus1);
    }

    if (w.direction === 1 && Math.max(w.startY, w.endY) > maxY) {
        let bus2 = new Bus(1, w.startX, maxY);
        bus2.endX = bus2.startX;
        bus2.endY = Math.max(w.startY, w.endY);
        newBusses.push(bus2);
    }
    return newBusses;
}