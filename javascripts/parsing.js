// File: parsing.js

let startDirection = 0; // Start direction for the current wire preview
let traced = []; // List of all traced segments (needed by parseGroups)

/*
    Gives a list of all segments that have an end in x, y, except segment j
*/
function segmentPoints(x, y, j) {
    let points = 0;
    for (let i = 0; i < wires.length; i++) {
        if (wires[i].direction === 0 && Math.min(wires[i].startX, wires[i].endX) < x && Math.max(wires[i].startX, wires[i].endX) > x && wires[i].startY === y && (i !== j)) {
            points += 2;
        }
        if (wires[i].direction === 1 && Math.min(wires[i].startY, wires[i].endY) < y && Math.max(wires[i].startY, wires[i].endY) > y && wires[i].startX === x && (i !== j)) {
            points += 2;
        }
        if (wires[i].direction === 0 && Math.min(wires[i].startX, wires[i].endX) < x && Math.max(wires[i].startX, wires[i].endX) === x && wires[i].startY === y && (i !== j)) {
            points++;
        }
        if (wires[i].direction === 0 && Math.min(wires[i].startX, wires[i].endX) === x && Math.max(wires[i].startX, wires[i].endX) > x && wires[i].startY === y && (i !== j)) {
            points++;
        }
        if (wires[i].direction === 1 && Math.min(wires[i].startY, wires[i].endY) < y && Math.max(wires[i].startY, wires[i].endY) === y && wires[i].startX === x && (i !== j)) {
            points++;
        }
        if (wires[i].direction === 1 && Math.min(wires[i].startY, wires[i].endY) === y && Math.max(wires[i].startY, wires[i].endY) > y && wires[i].startX === x && (i !== j)) {
            points++;
        }
    }
    return points;
    
    /*let indexList = [];
    for (let i = 0; i < segments.length; i++) {
        if ((segments[i].endX === x && segments[i].endY === y) || (segments[i].startX === x && segments[i].startY === y) && (i !== j)) {
            indexList.push(i);
        }
    }
    return indexList;*/
}

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
    let indexList = [];
    for (let i = 0; i < wires.length; i++) {
        if (wire.direction === 0 && wires[i].direction === 1) {
            if ((wires[i].startY <= wire.startY && wires[i].endY === wire.startY && wires[i].startX >= wire.startX && wires[i].startX <= wire.endX) ||
                (wires[i].startY === wire.startY && wires[i].endY >= wire.startY && wires[i].startX >= wire.startX && wires[i].startX <= wire.endX) ||
                (wires[i].startY <= wire.startY && wires[i].endY >= wire.startY && wires[i].startX >= wire.startX && wires[i].startX === wire.endX) ||
                (wires[i].startY <= wire.startY && wires[i].endY >= wire.startY && wires[i].startX === wire.startX && wires[i].startX <= wire.endX)) {
                indexList.push(i);
            }
        } else if (wire.direction === 1 && wires[i].direction === 0) {
            if ((wire.startY <= wires[i].startY && wire.endY === wires[i].startY && wire.startX >= wires[i].startX && wire.startX <= wires[i].endX) ||
                (wire.startY === wires[i].startY && wire.endY >= wires[i].startY && wire.startX >= wires[i].startX && wire.startX <= wires[i].endX) ||
                (wire.startY <= wires[i].startY && wire.endY >= wires[i].startY && wire.startX >= wires[i].startX && wire.startX === wires[i].endX) ||
                (wire.startY <= wires[i].startY && wire.endY >= wires[i].startY && wire.startX === wires[i].startX && wire.startX <= wires[i].endX)) {
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
    groups[g].addSegment(wires[j]);
    traced.push(j);

    let connected = wireConnect(wires[j]); // Gives all connected wires (no full crossings)

    for (let elem of listConpoints(wires[j].startX, wires[j].startY, wires[j].endX, wires[j].endY)) {
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

/*
    Generates a set of wire segments from start to end, with state wstate
*/
function generateSegmentSet(startX, startY, endX, endY, wstate) {
    pwSegments = [];
    if (startDirection === 0) { // Horizontal first
        if (startX < endX) {
            for (let i = Math.abs(endX - startX); i >= GRIDSIZE; i -= GRIDSIZE) {
                pwSegments.push(new Wire(0, endX - i, startY, wstate, transform));
            }
        } else if (startX > endX) {
            for (let i = Math.abs(endX - startX); i >= GRIDSIZE; i -= GRIDSIZE) {
                pwSegments.push(new Wire(0, startX - i, startY, wstate, transform));
            }
        }
        if (startY < endY) {
            for (let i = Math.abs(endY - startY); i >= GRIDSIZE; i -= GRIDSIZE) {
                pwSegments.push(new Wire(1, endX, endY - i, wstate, transform));
            }
        } else if (startY > endY) {
            for (let i = Math.abs(endY - startY); i >= GRIDSIZE; i -= GRIDSIZE) {
                pwSegments.push(new Wire(1, endX, startY - i, wstate, transform));
            }
        }
    } else { // Vertical first
        if (startY < endY) {
            for (let i = Math.abs(endY - startY); i >= GRIDSIZE; i -= GRIDSIZE) {
                pwSegments.push(new Wire(1, startX, endY - i, wstate, transform));
            }
        } else if (startY > endY) {
            for (let i = Math.abs(endY - startY); i >= GRIDSIZE; i -= GRIDSIZE) {
                pwSegments.push(new Wire(1, startX, startY - i, wstate, transform));
            }
        }
        if (startX < endX) {
            for (let i = Math.abs(endX - startX); i >= GRIDSIZE; i -= GRIDSIZE) {
                pwSegments.push(new Wire(0, endX - i, endY, wstate, transform));
            }
        } else if (startX > endX) {
            for (let i = Math.abs(endX - startX); i >= GRIDSIZE; i -= GRIDSIZE) {
                pwSegments.push(new Wire(0, startX - i, endY, wstate, transform));
            }
        }
    }
    // Set the mode according to the first segment from the preview
    if (pwSegments[0] != null && !lockElements) { // jshint ignore:line
        lockElements = true;
        startDirection = pwSegments[0].direction;
        closeModifierMenu();
        unmarkPropTargets();
    }
}

/*
    Returns the index of a segment at the given position or -1 if it doesn't exist
*/
function segmentExists(startX, startY, endX, endY) {
    for (let i = 0; i < segments.length; i++) {
        if ((segments[i].startX === startX) && (segments[i].startY === startY) && (segments[i].endX === endX) && (segments[i].endY === endY)) {
            return i;
        }
    }
    return -1;
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

/*
    Takes all segments and bundles them into wires (straight lines that are potentially longer than one segment)
*/
function findLines(newSegments) {
    let seg = _.cloneDeep(segments);
    for (let i = 0; i < seg.length; i++) {
        for (let j = 0; j < seg.length; j++) {
            if (i !== j && seg[i] !== null && seg[j] !== null) {
                if (((seg[i].startX === seg[j].startX) && (seg[i].endX === seg[j].endX) &&
                    (seg[i].startY === seg[j].startY) && (seg[i].endY === seg[j].endY)) ||
                    ((seg[i].startX === seg[j].endX) && (seg[i].endX === seg[j].startX) &&
                        (seg[i].startY === seg[j].endY) && (seg[i].endY === seg[j].startY))) {
                    seg[j] = null;
                }
            }
        }
    }
    for (let i = seg.length - 1; i >= 0; i--) {
        if (seg[i] === null) {
            seg.splice(i, 1);
        }
    }
    segments = _.cloneDeep(seg);
    //segments.concat(_.cloneDeep(seg));
    for (let i = 0; i < seg.length; i++) {
        for (let j = 0; j < seg.length; j++) {
            if (i !== j && seg[i] !== null && seg[j] !== null) {
                if (seg[i].direction === seg[j].direction) {
                    if (seg[i].endX === seg[j].startX && seg[i].endY === seg[j].startY) {
                        let marked = (seg[i].marked || seg[j].marked);
                        let w = new Wire(seg[i].direction, seg[i].startX, seg[i].startY, false, seg[i].transform);
                        w.marked = marked;
                        if (seg[i].parents[0] !== undefined) {
                            w.addParent(seg[i].IOs[0], seg[i].parents[0], seg[i].ports[0]);
                        }
                        if (seg[j].parents[0] !== undefined) {
                            w.addParent(seg[j].IOs[0], seg[j].parents[0], seg[j].ports[0]);
                        }
                        if (seg[i].parents[1] !== undefined) {
                            w.addParent(seg[i].IOs[1], seg[i].parents[1], seg[i].ports[1]);
                        }
                        if (seg[j].parents[1] !== undefined) {
                            w.addParent(seg[j].IOs[1], seg[j].parents[1], seg[j].ports[1]);
                        }
                        w.endX = seg[j].endX;
                        w.endY = seg[j].endY;
                        seg.push(w);
                        seg[i] = null;
                        seg[j] = null;
                    }
                }
            }
        }
    }
    for (let i = seg.length - 1; i >= 0; i--) {
        if (seg[i] === null) {
            seg.splice(i, 1);
        }
    }
    wires = seg;
    //wires = wires.concat(seg);
    //console.log(wires);
}
/*
function deleteFromWires(deletedSegments) {
    console.log(deletedSegments);
    let cloneWires = _.cloneDeep(wires);
    for (let i = 0; i < deletedSegments.length; i++) {
        for (let j = 0; j < cloneWires.length; j++) {
            if (deletedSegments[i][0].direction === cloneWires[j].direction && deletedSegments[i][0].direction === 0) {
                if (deletedSegments[i][0].startY === cloneWires[j].startY &&
                    Math.min(deletedSegments[i][0].startX, deletedSegments[i][0].endX) >= Math.min(cloneWires[j].startX, cloneWires[j].endX) &&
                    Math.max(deletedSegments[i][0].startX, deletedSegments[i][0].endX) <= Math.max(cloneWires[j].startX, cloneWires[j].endX)) {
                    console.log('Deleting from ' + j);
                    removeFromWire(cloneWires[j], deletedSegments, j);
                }
            }
        }
    }
}

function removeFromWire(w, seg, wireIndex) {
    let newWires = [];
    let minX = seg[0][0].startX;
    let minY = seg[0][0].startY;
    let maxX = seg[0][0].endX;
    let maxY = seg[0][0].endY;

    for (let i = 0; i < seg.length; i++) {
        minX = Math.min(minX, seg[i][0].startX, seg[i][0].endX);
        minY = Math.min(minY, seg[i][0].startY, seg[i][0].endY);
        maxX = Math.max(maxX, seg[i][0].startX, seg[i][0].endX);
        maxY = Math.max(maxY, seg[i][0].startX, seg[i][0].endY);
    }

    if (w.direction === 0 && Math.min(w.startX, w.endX) < minX) {
        let wire1 = new Wire(0, Math.min(w.startX, w.endX), w.startY, false, transform);
        wire1.endX = minX;
        wire1.endY = wire1.startY;
        newWires.push(wire1);
    }

    if (w.direction === 0 && Math.max(w.startX, w.endX) > maxX) {
        let wire2 = new Wire(0, maxX, w.startY, false, transform);
        wire2.endX = Math.max(w.startX, w.endX);
        wire2.endY = wire2.startY;
        newWires.push(wire2);
    }

    if (w.direction === 1 && Math.min(w.startY, w.endY) < minY) {
        let wire1 = new Wire(0, w.startX, Math.min(w.startY, w.endY), false, transform);
        wire1.endX = wire1.startX;
        wire1.endY = minY;
        newWires.push(wire1);
    }

    if (w.direction === 1 && Math.max(w.startY, w.endY) > maxY) {
        let wire2 = new Wire(0, w.startX, maxY, false, transform);
        wire2.endX = wire2.startX;
        wire2.endY = Math.max(w.startY, w.endY);
        newWires.push(wire2);
    }
    console.log(newWires);
    wires.splice(wireIndex, 1);
    for (let i = 0; i < newWires.length; i++) {
        wires.splice(wireIndex + i, 0, newWires[i]);
    }
}*/

/*function mergeWires() {
    let cloneWires = _.cloneDeep(wires);
    let deleteList = [];
    for (let i = 0; i < cloneWires.length; i++) {
        for (let j = 0; j < cloneWires.length; j++) {
            if (cloneWires[i].direction === cloneWires[j].direction && i !== j && deleteList.indexOf(i) < 0) {
                if ((cloneWires[i].startX === cloneWires[j].startX || cloneWires[i].startX === cloneWires[j].endX || cloneWires[i].endX === cloneWires[j].startX || cloneWires[i].endX === cloneWires[j].endX) &&
                    (cloneWires[i].startY === cloneWires[j].startY || cloneWires[i].startY === cloneWires[j].endY || cloneWires[i].endY === cloneWires[j].startY || cloneWires[i].endY === cloneWires[j].endY)) {
                    console.log('Merging ' + i + ' and ' + j);
                    cloneWires[i] = new Wire(cloneWires[i].direction,
                        Math.min(cloneWires[i].startX, cloneWires[j].startX, cloneWires[i].endX, cloneWires[j].endX),
                        Math.min(cloneWires[i].startY, cloneWires[j].startY, cloneWires[i].endY, cloneWires[j].endY), false, transform);
                    cloneWires[i].endX = Math.max(cloneWires[i].startX, cloneWires[j].startX, cloneWires[i].endX, cloneWires[j].endX);
                    cloneWires[i].endY = Math.max(cloneWires[i].startY, cloneWires[j].startY, cloneWires[i].endY, cloneWires[j].endY);
                    deleteList.push(j);
                }
            }
        }
    }
    for (let i = deleteList.length - 1; i >= 0; i--) {
        cloneWires.splice(deleteList[i], 1);
    }
    wires = cloneWires;
}*/