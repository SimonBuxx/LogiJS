// File: parsing.js

let startDirection = 0;
let traced = []; // List of all traced segments

/*
    Gives a list of all wires that have an end in x, y, except wire j
*/
function wirePoints(x, y, j) {
    let indexList = [];
    for (let i = 0; i < segments.length; i++) {
        if (segments[i].endX === x && segments[i].endY === y) {
            if (i !== j) {
                indexList.push(i);
            }
        }
        if (segments[i].startX === x && segments[i].startY === y) {
            if (i !== j) {
                indexList.push(i);
            }
        }
    }
    return indexList;
}

/*
    Finds connected wires and orders them in groups of segments
*/
function parseGroups() {
    traced = [];
    groups = [];
    for (let i = 0; i < segments.length; i++) {
        if (traced.indexOf(i) < 0) { // If the segment wasn't included in a group yet
            exploreGroup(i); // Explore a new group starting at this segment
        }
    }
}

/*
    Explores one part of the graph
    j: Start segment
*/

function exploreGroup(j) {
    groups.push(new Group());
    exGroup(j, groups.length - 1);
}

/*
    Recursive wire traversing algorithm
    Starts at one segment and explorers one wire group, meaning a set of segments
    that are connected and therefore always have the same state
*/
function exGroup(j, g) {
    if (traced.indexOf(j) > 0) {
        return;
    }
    groups[g].addSegment(segments[j]);
    segments[j].setGroup(g);
    traced.push(j);

    if (segments[j].parentStart !== null) {
        if (segments[j].startIO) {
            groups[g].addOutput(segments[j].parentStart, segments[j].start);
        } else {
            groups[g].addInput(segments[j].parentStart, segments[j].start);
        }
    }

    if (segments[j].parentEnd !== null) {
        if (segments[j].endIO) {
            groups[g].addOutput(segments[j].parentEnd, segments[j].end);
        } else {
            groups[g].addInput(segments[j].parentEnd, segments[j].end);
        }
    }

    let wp1 = wirePoints(segments[j].startX, segments[j].startY, j);
    let wp2 = wirePoints(segments[j].endX, segments[j].endY, j);

    let cp = isConPoint(segments[j].startX, segments[j].startY); // Calculate once to save resources

    // If there are 2 segments connecting
    if (wp1.length === 2) { // T-Crossing
        if (cp >= 0) {
            // Set the group of the connection point to the group we're currently exploring
            conpoints[cp].setGroup(g);
        }
    } else if (wp1.length === 3) { // Full crossing
        // If there is a connection point (unclear on full crossings!)
        if (cp < 0) {
            for (let k = 0; k < wp1.length; k++) {
                if (segments[wp1[k]].direction === segments[j].direction) { // If they have the same direction
                    let s = wp1[k];
                    wp1 = []; // Only explore in this segment
                    wp1.push(s);
                }
            }
        } else { // else explore every segment
            conpoints[cp].setGroup(g);
        }
    }

    cp = isConPoint(segments[j].endX, segments[j].endY);

    // Same thing for the other direction
    if (wp2.length === 2) {
        if (cp >= 0) {
            conpoints[cp].setGroup(g);
        } else {
            for (let k = 0; k < wp2.length; k++) {
                if (segments[wp2[k]].direction === segments[j].direction) { // If they have the same direction
                    let s = wp2[k];
                    wp2 = []; // Only explore in this segment
                    wp2.push(s);
                }
            }
        }
    } else if (wp2.length === 3) {
        if (cp < 0) {
            for (let k = 0; k < wp2.length; k++) {
                if (segments[wp2[k]].direction === segments[j].direction) { // If they have the same direction
                    let s = wp2[k];
                    wp2 = []; // Only explore in this segment
                    wp2.push(s);
                }
            }
        } else { // else explore every segment
            conpoints[cp].setGroup(g);
        }
    }
    // Trace the remaining segments recursivly
    for (let i = 0; i < wp1.length; i++) {
        if (traced.indexOf(wp1[i]) < 0) {
            exGroup(wp1[i], g);
        }
    }

    for (let i = 0; i < wp2.length; i++) {
        if (traced.indexOf(wp2[i]) < 0) {
            exGroup(wp2[i], g);
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
                pwSegments.push(new WSeg(0, endX - i, startY, wstate, transform));
            }
        } else if (startX > endX) {
            for (let i = Math.abs(endX - startX); i >= GRIDSIZE; i -= GRIDSIZE) {
                pwSegments.push(new WSeg(0, startX - i, startY, wstate, transform));
            }
        }
        if (startY < endY) {
            for (let i = Math.abs(endY - startY); i >= GRIDSIZE; i -= GRIDSIZE) {
                pwSegments.push(new WSeg(1, endX, endY - i, wstate, transform));
            }
        } else if (startY > endY) {
            for (let i = Math.abs(endY - startY); i >= GRIDSIZE; i -= GRIDSIZE) {
                pwSegments.push(new WSeg(1, endX, startY - i, wstate, transform));
            }
        }
    } else { // Vertical first
        if (startY < endY) {
            for (let i = Math.abs(endY - startY); i >= GRIDSIZE; i -= GRIDSIZE) {
                pwSegments.push(new WSeg(1, startX, endY - i, wstate, transform));
            }
        } else if (startY > endY) {
            for (let i = Math.abs(endY - startY); i >= GRIDSIZE; i -= GRIDSIZE) {
                pwSegments.push(new WSeg(1, startX, startY - i, wstate, transform));
            }
        }
        if (startX < endX) {
            for (let i = Math.abs(endX - startX); i >= GRIDSIZE; i -= GRIDSIZE) {
                pwSegments.push(new WSeg(0, endX - i, endY, wstate, transform));
            }
        } else if (startX > endX) {
            for (let i = Math.abs(endX - startX); i >= GRIDSIZE; i -= GRIDSIZE) {
                pwSegments.push(new WSeg(0, startX - i, endY, wstate, transform));
            }
        }
    }
    // Set the mode according to the first segment from the preview
    if (pwSegments[0] != null && !lockElements) { // jshint ignore:line
        lockElements = true;
        startDirection = pwSegments[0].direction;
    }
}

function segmentExists(startX, startY, endX, endY) {
    for (let i = 0; i < segments.length; i++) {
        if ((segments[i].startX === startX) && (segments[i].startY === startY) && (segments[i].endX === endX) && (segments[i].endY === endY)) {
            return i;
        }
    }
    return -1;
}

function integrateElement() {
    for (let h = 0; h < groups.length; h++) {
        for (let i = 0; i < groups[h].segments.length; i++) {
            for (let j = 0; j < gates.length; j++) {
                for (let k = 0; k < gates[j].outputCount; k++) {
                    if (gates[j].pointInOutput(k, groups[h].segments[i].startX, groups[h].segments[i].startY)) {
                        groups[h].segments[i].setStart(1, gates[j], k);
                    }
                    if (gates[j].pointInOutput(k, groups[h].segments[i].endX, groups[h].segments[i].endY)) {
                        groups[h].segments[i].setEnd(1, gates[j], k);
                    }
                }
                for (let k = 0; k < gates[j].inputCount; k++) {
                    if (gates[j].pointInInput(k, groups[h].segments[i].startX, groups[h].segments[i].startY)) {
                        groups[h].segments[i].setStart(0, gates[j], k);
                    }
                    if (gates[j].pointInInput(k, groups[h].segments[i].endX, groups[h].segments[i].endY)) {
                        groups[h].segments[i].setEnd(0, gates[j], k);
                    }
                }
            }
            for (let j = 0; j < customs.length; j++) {
                if (customs[j].visible) {
                    for (let k = 0; k < customs[j].outputCount; k++) {
                        if (customs[j].pointInOutput(k, groups[h].segments[i].startX, groups[h].segments[i].startY)) {
                            groups[h].segments[i].setStart(1, customs[j], k);
                        }
                        if (customs[j].pointInOutput(k, groups[h].segments[i].endX, groups[h].segments[i].endY)) {
                            groups[h].segments[i].setEnd(1, customs[j], k);
                        }
                    }
                    for (let k = 0; k < customs[j].inputCount; k++) {
                        if (customs[j].pointInInput(k, groups[h].segments[i].startX, groups[h].segments[i].startY)) {
                            groups[h].segments[i].setStart(0, customs[j], k);
                        }
                        if (customs[j].pointInInput(k, groups[h].segments[i].endX, groups[h].segments[i].endY)) {
                            groups[h].segments[i].setEnd(0, customs[j], k);
                        }
                    }
                }
            }
            for (let j = 0; j < segDisplays.length; j++) {
                for (let k = 0; k < segDisplays[j].inputCount; k++) {
                    if (segDisplays[j].pointInInput(k, groups[h].segments[i].startX, groups[h].segments[i].startY)) {
                        groups[h].segments[i].setStart(0, segDisplays[j], k);
                    }
                    if (segDisplays[j].pointInInput(k, groups[h].segments[i].endX, groups[h].segments[i].endY)) {
                        groups[h].segments[i].setEnd(0, segDisplays[j], k);
                    }
                }
            }
            for (let j = 0; j < inputs.length; j++) {
                if (inputs[j].pointInOutput(null, groups[h].segments[i].startX, groups[h].segments[i].startY)) {
                    groups[h].segments[i].setStart(1, inputs[j], 0);
                }
                if (inputs[j].pointInOutput(null, groups[h].segments[i].endX, groups[h].segments[i].endY)) {
                    groups[h].segments[i].setEnd(1, inputs[j], 0);
                }
            }
            for (let j = 0; j < outputs.length; j++) {
                if (outputs[j].pointInInput(null, groups[h].segments[i].startX, groups[h].segments[i].startY)) {
                    groups[h].segments[i].setStart(0, outputs[j], 0);
                }
                if (outputs[j].pointInInput(null, groups[h].segments[i].endX, groups[h].segments[i].endY)) {
                    groups[h].segments[i].setEnd(0, outputs[j], 0);
                }
            }
            for (let j = 0; j < diodes.length; j++) { // For all diodes
                if ((groups[h].segments[i].startX === diodes[j].x) && (groups[h].segments[i].startY === diodes[j].y)) { // If there's a diode in the segment start
                    if (groups[h].segments[i].startX === groups[h].segments[i].endX) { // if the segment is vertical
                        let s = segmentStartsIn(groups[h].segments[i].startX, groups[h].segments[i].startY); // Get the segment that starts in x,y or -1
                        let t = segmentEndsIn(groups[h].segments[i].startX, groups[h].segments[i].startY); // Get the segment that ends in x,y or -1
                        if (s >= 0) { // if a horizontal segment exists
                            if (segments[s].startY === segments[s].endY) { // If the segment is horizontal
                                diodes[j].setGroups(segments[s].group, h); // Set the diode groups
                            }
                        } else if (t >= 0) {
                            if (segments[t].startY === segments[t].endY) { // If the segment is horizontal
                                diodes[j].setGroups(segments[t].group, h); // Set the diode groups
                            }
                        }

                    } else if (groups[h].segments[i].startY === groups[h].segments[i].endY) { // if the segment is horizontal
                        let s = segmentStartsIn(groups[h].segments[i].startX, groups[h].segments[i].startY); // Get the segment that starts in x,y or -1
                        let t = segmentEndsIn(groups[h].segments[i].startX, groups[h].segments[i].startY); // Get the segment that ends in x,y or -1
                        if (s >= 0) {
                            if (segments[s].startX === segments[s].endX) { // If the segment is vertical
                                diodes[j].setGroups(h, segments[s].group); // Set the diode groups
                            }
                        } else if (t >= 0) {
                            if (segments[t].startX === segments[t].endX) { // If the segment is vertical
                                diodes[j].setGroups(h, segments[t].group); // Set the diode groups
                            }
                        }
                    }
                }
                if ((groups[h].segments[i].endX === diodes[j].x) && (groups[h].segments[i].endY === diodes[j].y)) { // If there's a diode in the segment end
                    if (groups[h].segments[i].startX === groups[h].segments[i].endX) { // if it's vertical
                        let s = segmentStartsIn(groups[h].segments[i].endX, groups[h].segments[i].endY); // Get the segment that starts in x,y or -1
                        let t = segmentEndsIn(groups[h].segments[i].endX, groups[h].segments[i].endY); // Get the segment that ends in x,y or -1
                        if (s >= 0) { // if a horizontal segment exists
                            if (segments[s].startY === segments[s].endY) { // If the segment is horizontal
                                diodes[j].setGroups(segments[s].group, h); // Set the diode groups
                            }
                        } else if (t >= 0) {
                            if (segments[t].startY === segments[t].endY) { // If the segment is horizontal
                                diodes[j].setGroups(segments[t].group, h); // Set the diode groups
                            }
                        }
                    } else if (groups[h].segments[i].startY === groups[h].segments[i].endY) { // if the segment is horizontal
                        let s = segmentStartsIn(groups[h].segments[i].endX, groups[h].segments[i].endY); // Get the segment that starts in x,y or -1
                        let t = segmentEndsIn(groups[h].segments[i].endX, groups[h].segments[i].endY); // Get the segment that ends in x,y or -1
                        if (s >= 0) {
                            if (segments[s].startX === segments[s].endX) { // If the segment is vertical
                                diodes[j].setGroups(h, segments[s].group); // Set the diode groups
                            }
                        } else if (t >= 0) {
                            if (segments[t].startX === segments[t].endX) { // If the segment is vertical
                                diodes[j].setGroups(h, segments[t].group); // Set the diode groups
                            }
                        }
                    }
                }
            }
        }
    }
}

function findLines() {
    let seg = segments.slice(0);
    for (let i = 0; i < seg.length; i++) {
        for (let j = 0; j < seg.length; j++) {
            if (i !== j && seg[i] !== null && seg[j] !== null) {
                if (seg[i].direction === seg[j].direction) {
                    if (seg[i].endX === seg[j].startX && seg[i].endY === seg[j].startY) {
                        let marked = (seg[i].marked || seg[j].marked);
                        let w = new WSeg(seg[i].direction, seg[i].startX, seg[i].startY, false, seg[i].transform);
                        w.marked = marked;
                        if (seg[i].parentStart !== null) {
                            w.setStart(seg[i].startIO, seg[i].parentStart, seg[i].start);
                        }
                        if (seg[j].parentStart !== null) {
                            w.setStart(seg[j].startIO, seg[j].parentStart, seg[j].start);
                        }
                        if (seg[i].parentEnd !== null) {
                            w.setEnd(seg[i].endIO, seg[i].parentEnd, seg[i].end);
                        }
                        if (seg[j].parentEnd !== null) {
                            w.setEnd(seg[j].endIO, seg[j].parentEnd, seg[j].end);
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
}