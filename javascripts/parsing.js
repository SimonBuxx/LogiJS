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

/*
    Explores the group that contains the given wire
*/

function exploreGroup(wire) {
    groups.push(new Group());
    exGroup(wire, groups.length - 1);
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

function generatePreviewWires(startX, startY, endX, endY) {
    if (startX === endX && startY === endY) {
        pwWireX = null;
        pwWireY = null;
        return;
    }

    if (startDirection === 0) {
        if (startX <= endX) {
            pwWireX = new Wire(0, startX, startY, false);
            pwWireX.endX = endX;
        } else if (startX >= endX) {
            pwWireX = new Wire(0, endX, startY, false);
            pwWireX.endX = startX;
        }
        pwWireX.endY = startY;
        
        if (startY <= endY) {
            pwWireY = new Wire(1, endX, startY, false);
            pwWireY.endY = endY;
        } else if (startY >= endY) {
            pwWireY = new Wire(1, endX, endY, false);
            pwWireY.endY = startY;
        }
        pwWireY.endX = endX;
    } else if (startDirection === 1) {
        if (startY <= endY) {
            pwWireY = new Wire(1, startX, startY, false);
            pwWireY.endY = endY;
        } else if (startY >= endY) {
            pwWireY = new Wire(1, startX, endY, false);
            pwWireY.endY = startY;
        }
        pwWireY.endX = startX;

        if (startX <= endX) {
            pwWireX = new Wire(0, startX, endY, false);
            pwWireX.endX = endX;
        } else if (startX >= endX) {
            pwWireX = new Wire(0, endX, endY, false);
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
        for (let k = 0; k < segDisplays[j].inputCount; k++) {
            let inputWires = wirePoints(segDisplays[j].inputClickBoxes[k].x, segDisplays[j].inputClickBoxes[k].y, -1);
            if (inputWires.length > 0) {
                groups[wires[inputWires[0]].group].addInput(segDisplays[j], k);
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
        let wire1 = new Wire(0, Math.min(w.startX, w.endX), w.startY, false);
        wire1.endX = minX;
        wire1.endY = wire1.startY;
        newWires.push(wire1);
    }

    if (w.direction === 0 && Math.max(w.startX, w.endX) > maxX) {
        let wire2 = new Wire(0, maxX, w.startY, false);
        wire2.endX = Math.max(w.startX, w.endX);
        wire2.endY = wire2.startY;
        newWires.push(wire2);
    }

    if (w.direction === 1 && Math.min(w.startY, w.endY) < minY) {
        let wire1 = new Wire(1, w.startX, Math.min(w.startY, w.endY), false);
        wire1.endX = wire1.startX;
        wire1.endY = minY;
        newWires.push(wire1);
    }

    if (w.direction === 1 && Math.max(w.startY, w.endY) > maxY) {
        let wire2 = new Wire(1, w.startX, maxY, false);
        wire2.endX = wire2.startX;
        wire2.endY = Math.max(w.startY, w.endY);
        newWires.push(wire2);
    }
    return newWires;
}