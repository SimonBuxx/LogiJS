// File: cpdiodes.js

/*
    Deletes all diodes that are not connected to two or more segments
*/
function deleteInvalidDiodes() {
    for (let j = diodes.length - 1; j >= 0; j--) {
        if (!rightAngle(diodes[j].x, diodes[j].y)) {
            diodes.splice(j, 1);
        }
    }
}

/*
    Deletes all conpoints that are not connected to three or more segments
*/
function deleteInvalidConpoints() {
    for (let j = conpoints.length - 1; j >= 0; j--) {
        if (wirePoints(conpoints[j].x, conpoints[j].y, -1).length < 3 || isDiode(conpoints[j].x, conpoints[j].y) >= 0) {
            conpoints.splice(j, 1);
        }
    }
}

function getGroup(seg) {
    for (let i = 0; i < groups.length; i++) {
        for (let j = 0; j < groups[i].segments.length; j++) {
            if ((groups[i].segments[j].startX === seg.startX) && (groups[i].segments[j].startY === seg.startY) && (groups[i].segments[j].direction === seg.direction)) {
                return i;
            }
        }
    }
    return -1;
}

function segmentStartsIn(x, y) {
    for (let i = 0; i < segments.length; i++) {
        if (segments[i].startX === x && segments[i].startY === y) {
            return i;
        }
    }
    return -1;
}

function segmentEndsIn(x, y) {
    for (let i = 0; i < segments.length; i++) {
        if (segments[i].endX === x && segments[i].endY === y) {
            return i;
        }
    }
    return -1;
}

/*
    Creates a new connection point for group g at position x, y
    Only creates if not existing and no diode at the point
*/
function createConpoint(x, y, state, g) {
    if ((isConPoint(x, y) < 0) && (isDiode(x, y) < 0)) {
        console.log('Pushing a conpoint');
        conpoints.push(new ConPoint(x, y, state, g));
    }
}

/*
    Determines, whether there is a vertical and a horizontal wire segment starting or ending in point (x, y)
*/
function rightAngle(x, y) {
    let hor = false;
    let ver = false;
    for (let i = 0; i < segments.length; i++) {
        if (segments[i].startX === x && segments[i].startY === y) {
            hor = (hor || segments[i].direction === 0);
            ver = (ver || segments[i].direction === 1);
        }
        if (segments[i].endX === x && segments[i].endY === y) {
            hor = (hor || segments[i].direction === 0);
            ver = (ver || segments[i].direction === 1);
        }
    }
    return (hor && ver);
}

/*
    Creates a new diode if the point meets the requirements
    gA: Group A (horizontal, not influenced by the vertical wire)
    gB: Group B (vertical, synced to group A)
    Nice-to-have-TODO: Diodes can only be put in places where horizontal + vertical wires are
*/
function createDiode(x, y, state) {
    // If there is no diode and a diode can be set
    if ((isDiode(x, y) < 0) && (rightAngle(x, y))) {
        diodes.push(new Diode(x, y, state, transform));
        diodes[diodes.length - 1].updateClickBox();
        pushUndoAction('addDi', [], diodes[diodes.length - 1]);
        let cp = isConPoint(x, y);
        if (cp >= 0) {
            console.log('Top diode is over conpoint');
            diodes[diodes.length - 1].cp = true;
            conpoints.splice(cp, 1);
        }
    }
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

function isDiode(x, y) {
    for (let i = 0; i < diodes.length; i++) {
        if (diodes[i].x === x && diodes[i].y === y) {
            return i;
        }
    }
    return -1;
}

/*
    Updates all ConPoints, including deleting
*/
function doConpoints() {
    for (let i = 0; i < segments.length; i++) {
        // Get all segments starting or ending in the point
        let wp1 = wirePoints(segments[i].startX, segments[i].startY, -1);
        let wp2 = wirePoints(segments[i].endX, segments[i].endY, -1);

        // If there are 3 segments connecting
        if (wp1.length === 3) {
            if (isConPoint(segments[i].startX, segments[i].startY) < 0) {
                createConpoint(segments[i].startX, segments[i].startY, false, -1);
            }
        } else if (wp1.length === 4) {
            if (isConPoint(segments[i].startX, segments[i].startY) < 0) {
                for (let k = 0; k < wp1.length; k++) {
                    if (segments[wp1[k]].direction === segments[i].direction) { // If they have the same direction
                        let s = wp1[k];
                        wp1 = []; // Only explore in this segment
                        wp1.push(s);
                    }
                }
            } // else explore every segment
        }
        // Same thing for the other direction
        if (wp2.length === 3) {
            if (isConPoint(segments[i].endX, segments[i].endY) < 0) {
                createConpoint(segments[i].endX, segments[i].endY, false, -1);
            }
        } else if (wp2.length === 4) {
            if (isConPoint(segments[i].endX, segments[i].endY) < 0) {
                for (let k = 0; k < wp2.length; k++) {
                    if (segments[wp2[k]].direction === segments[i].direction) { // If they have the same direction
                        let s = wp2[k];
                        wp2 = []; // Only explore in this segment
                        wp2.push(s);
                    }
                }
            } // else explore every segment
        }
    }
    deleteInvalidConpoints();
    deleteInvalidDiodes();
}