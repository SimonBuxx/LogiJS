// File: cpdiodes.js

/*
    Deletes all diodes that are not connected to two or more segments
*/
function deleteInvalidDiodes() {
    for (let j = diodes.length - 1; j >= 0; j--) {
        if (!fullCrossing(diodes[j].x, diodes[j].y)) {
            diodes.splice(j, 1);
        }
    }
}

/*
    Deletes all conpoints that are not connected to three or more segments
*/
function deleteInvalidConpoints() {
    for (let j = conpoints.length - 1; j >= 0; j--) {
        if (!tCrossing(conpoints[j].x, conpoints[j].y) && !fullCrossing(conpoints[j].x, conpoints[j].y)) {
            conpoints.splice(j, 1);
        }
    }
}

/*
    Creates a new connection point for group g at position x, y
    Only creates if not existing and no diode at the point
*/
function createConpoint(x, y, state, g) {
    if (isConPoint(x, y) < 0) {
        conpoints.push(new ConPoint(x, y, state, g));
        return conpoints.length - 1;
    }
    return -1;
}

function fullCrossing(x, y) {
    let horFound = false;
    let verFound = false;
    for (let i = 0; i < wires.length; i++) {
        if (wires[i].direction === 0 && Math.min(wires[i].startX, wires[i].endX) < x && Math.max(wires[i].startX, wires[i].endX) > x && Math.min(wires[i].startY, wires[i].endY) == y) { // jshint ignore:line
            horFound = true;
        } else if (wires[i].direction === 1 && Math.min(wires[i].startY, wires[i].endY) < y && Math.max(wires[i].startY, wires[i].endY) > y && Math.min(wires[i].startX, wires[i].endX) == x) { // jshint ignore:line
            verFound = true;
        }
    }
    return (horFound && verFound);
}

function tCrossing(x, y) {
    let horLooseFound = false;
    let verLooseFound = false;
    let horTightFound = false;
    let verTightFound = false;
    for (let i = 0; i < wires.length; i++) {
        if (wires[i].direction === 0 && Math.min(wires[i].startX, wires[i].endX) <= x && Math.max(wires[i].startX, wires[i].endX) >= x && Math.min(wires[i].startY, wires[i].endY) == y) { // jshint ignore:line
            horLooseFound = true;
        } else if (wires[i].direction === 1 && Math.min(wires[i].startY, wires[i].endY) < y && Math.max(wires[i].startY, wires[i].endY) > y && Math.min(wires[i].startX, wires[i].endX) == x) { // jshint ignore:line
            verTightFound = true;
        }

        if (wires[i].direction === 0 && Math.min(wires[i].startX, wires[i].endX) < x && Math.max(wires[i].startX, wires[i].endX) > x && Math.min(wires[i].startY, wires[i].endY) == y) { // jshint ignore:line
            horTightFound = true;
        } else if (wires[i].direction === 1 && Math.min(wires[i].startY, wires[i].endY) <= y && Math.max(wires[i].startY, wires[i].endY) >= y && Math.min(wires[i].startX, wires[i].endX) == x) { // jshint ignore:line
            verLooseFound = true;
        }
    }
    return ((horLooseFound && verTightFound) || (horTightFound && verLooseFound)) && !(horTightFound && verTightFound);
}

function deleteConpoint(conpointNumber) {
    pushUndoAction('delCp', [conpointNumber], conpoints.splice(conpointNumber, 1));
    doConpoints();
    reDraw();
}

function deleteDiode(diodeNumber) {
    pushUndoAction('delDi', [diodeNumber], diodes.splice(diodeNumber, 1));
    doConpoints();
    reDraw();
}

function createDiode(x, y, state) {
    diodes.push(new Diode(x, y, state));
    diodes[diodes.length - 1].updateClickBox();
    pushUndoAction('addDi', [diodes.length - 1], [diodes[diodes.length - 1]]);
}

/*
    Checks if a connection point is at the given position
*/
function isConPoint(x, y) {
    for (let i = 0; i < conpoints.length; i++) {
        if (conpoints[i].x === x && conpoints[i].y === y) {
            return i;
        }
    }
    return -1;
}

function listConpoints(x1, y1, x2, y2) {
    let cps = [];
    if (y1 == y2) { // jshint ignore:line
        for (let i = 0; i < conpoints.length; i++) {
            if (conpoints[i].x > x1 && conpoints[i].x < x2 && conpoints[i].y == y1) { // jshint ignore:line
                cps.push(i);
            }
        }
    } else {
        for (let i = 0; i < conpoints.length; i++) {
            if (conpoints[i].y > y1 && conpoints[i].y < y2 && conpoints[i].x == x1) { // jshint ignore:line
                cps.push(i);
            }
        }
    }
    return cps;
}

function isDiode(x, y) {
    for (let i = 0; i < diodes.length; i++) {
        if (diodes[i].x === x && diodes[i].y === y) {
            return i;
        }
    }
    return -1;
}

function diodesOnWire(wire) {
    let result = [];
    if (wire.direction === 0) {
        for (let i = 0; i < diodes.length; i++) {
            if (diodes[i].y === wire.startY && diodes[i].x >= wire.startX && diodes[i].x <= wire.endX) {
                result.push(i);
            }
        }
    } else { 
        for (let i = 0; i < diodes.length; i++) {
            if (diodes[i].x === wire.startX && diodes[i].y >= wire.startY && diodes[i].y <= wire.endY) {
                result.push(i);
            }
        }
    }
    return result;
}

/*
    Updates all ConPoints, including deleting
*/
function doConpoints() {
    for (let i = 0; i < wires.length; i++) {
        if (tCrossing(wires[i].startX, wires[i].startY)) {
            createConpoint(wires[i].startX, wires[i].startY, false, -1);
        }
        if (tCrossing(wires[i].endX, wires[i].endY)) {
            createConpoint(wires[i].endX, wires[i].endY, false, -1);
        }
    }
    deleteInvalidDiodes();
    deleteInvalidConpoints();
}

function showPreview(type, x, y) {
    fill(50, 50, 50);
    noStroke();
    scale(transform.zoom); // Handle the offset from scaling and translating
    translate(transform.dx, transform.dy);
    switch (type) {
        case 'diode':
            triangle(x, y + 11, x - 11, y, x + 11, y);
            break;
        case 'conpoint':
            rect(x - 3, y - 3, 7, 7);
            break;
        default:
    }
    scale(1 / transform.zoom);
    translate(-transform.zoom * transform.dx, -transform.zoom * transform.dy);
}

function switchDiodeForConpoint(diodeNumber) {
    let newCp = createConpoint(diodes[diodeNumber].x, diodes[diodeNumber].y, false, -1);
    if (newCp >= 0) {
        pushUndoAction('swiDi', [diodeNumber, newCp], [diodes.splice(diodeNumber, 1), conpoints[newCp]]);
    }
}

function toggleDiodeAndConpoint() {
    let diode = isDiode(Math.round((mouseX / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE, Math.round((mouseY / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE);
    if (diode >= 0) {
        switchDiodeForConpoint(diode);
    } else {
        let conpoint = isConPoint(Math.round((mouseX / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE, Math.round((mouseY / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE);
        if (conpoint >= 0) {
            deleteConpoint(conpoint);
        } else {
            createDiode(Math.round((mouseX / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE, Math.round((mouseY / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE, false);
        }
    }
    reDraw();
}