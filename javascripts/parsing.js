// File: parsing.js

let startDirection = 0;
let traced = [];

/*
    Finds connected wires and orders them in groups of segments
*/
function parseGroups() {
    traced = [];
    groups = [];
    for (let i = 0; i < segments.length; i++) {
        if (traced.indexOf(i) < 0) {
            exploreGroup(i);
        }
    }
    deleteInvalidConpoints();
    deleteInvalidDiodes();
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
    Recursive wire traversing algorithm (bad style but works fine)
*/
function exGroup(j, g) {
    if (traced.indexOf(j) > 0) {
        return;
    }
    groups[g].addSegment(segments[j]);
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

    // If there are 3 segments connecting
    if (wp1.length === 2) {
        if (isConPoint(segments[j].startX, segments[j].startY) >= 0) {
            conpoints[isConPoint(segments[j].startX, segments[j].startY)].setGroup(g);
        } else {
            // This is to stop group linking when diodes are placed (or in general no conpoint set)
            for (let k = 0; k < wp1.length; k++) {
                if (segments[wp1[k]].direction === segments[j].direction) { // If they have the same direction
                    let s = wp1[k];
                    wp1 = []; // Only explore in this segment
                    wp1.push(s);
                }
            }
        }
    } else if (wp1.length === 3) {
        if (isConPoint(segments[j].startX, segments[j].startY) < 0) {
            for (let k = 0; k < wp1.length; k++) {
                if (segments[wp1[k]].direction === segments[j].direction) { // If they have the same direction
                    let s = wp1[k];
                    wp1 = []; // Only explore in this segment
                    wp1.push(s);
                }
            }
        } else { // else explore every segment
            conpoints[isConPoint(segments[j].startX, segments[j].startY)].setGroup(g);
        }
    }
    // Same thing for the other direction
    if (wp2.length === 2) {
        if (isConPoint(segments[j].endX, segments[j].endY) >= 0) {
            conpoints[isConPoint(segments[j].endX, segments[j].endY)].setGroup(g);
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
        if (isConPoint(segments[j].endX, segments[j].endY) < 0) {
            for (let k = 0; k < wp2.length; k++) {
                if (segments[wp2[k]].direction === segments[j].direction) { // If they have the same direction
                    let s = wp2[k];
                    wp2 = []; // Only explore in this segment
                    wp2.push(s);
                }
            }
        } else { // else explore every segment
            conpoints[isConPoint(segments[j].endX, segments[j].endY)].setGroup(g);
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
    let togo = 0;
    if (startDirection === 0) {
        // Horizontal first
        togo = Math.abs(endX - startX);
        if (startX < endX) {
            while (togo >= GRIDSIZE) {
                let seg = new WSeg(0, endX - togo, startY, wstate, transform);
                pwSegments.push(seg);
                togo -= GRIDSIZE;
            }
        } else if (startX > endX) {
            while (togo >= GRIDSIZE) {
                let seg = new WSeg(0, startX - togo, startY, wstate, transform);
                pwSegments.push(seg);
                togo -= GRIDSIZE;
            }
        }
        togo = Math.abs(endY - startY);
        if (startY < endY) {
            while (togo >= GRIDSIZE) {
                let seg = new WSeg(1, endX, endY - togo, wstate, transform);
                pwSegments.push(seg);
                togo -= GRIDSIZE;
            }
        } else if (startY > endY) {
            while (togo >= GRIDSIZE) {
                let seg = new WSeg(1, endX, startY - togo, wstate, transform);
                pwSegments.push(seg);
                togo -= GRIDSIZE;
            }
        }
    } else {
        // Vertical first
        togo = Math.abs(endY - startY);
        if (startY < endY) {
            while (togo >= GRIDSIZE) {
                let seg = new WSeg(1, startX, endY - togo, wstate, transform);
                pwSegments.push(seg);
                togo -= GRIDSIZE;
            }
        } else if (startY > endY) {
            while (togo >= GRIDSIZE) {
                let seg = new WSeg(1, startX, startY - togo, wstate, transform);
                pwSegments.push(seg);
                togo -= GRIDSIZE;
            }
        }
        togo = Math.abs(endX - startX);
        if (startX < endX) {
            while (togo >= GRIDSIZE) {
                let seg = new WSeg(0, endX - togo, endY, wstate, transform);
                pwSegments.push(seg);
                togo -= GRIDSIZE;
            }
        } else if (startX > endX) {
            while (togo >= GRIDSIZE) {
                let seg = new WSeg(0, startX - togo, endY, wstate, transform);
                pwSegments.push(seg);
                togo -= GRIDSIZE;
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
                                diodes[j].setGroups(getGroup(segments[s]), h); // Set the diode groups
                            }
                        } else if (t >= 0) {
                            if (segments[t].startY === segments[t].endY) { // If the segment is horizontal
                                diodes[j].setGroups(getGroup(segments[t]), h); // Set the diode groups
                            }
                        }

                    } else if (groups[h].segments[i].startY === groups[h].segments[i].endY) { // if the segment is horizontal
                        let s = segmentStartsIn(groups[h].segments[i].startX, groups[h].segments[i].startY); // Get the segment that starts in x,y or -1
                        let t = segmentEndsIn(groups[h].segments[i].startX, groups[h].segments[i].startY); // Get the segment that ends in x,y or -1
                        if (s >= 0) {
                            if (segments[s].startX === segments[s].endX) { // If the segment is vertical
                                diodes[j].setGroups(h, getGroup(segments[s])); // Set the diode groups
                            }
                        } else if (t >= 0) {
                            if (segments[t].startX === segments[t].endX) { // If the segment is vertical
                                diodes[j].setGroups(h, getGroup(segments[t])); // Set the diode groups
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
                                diodes[j].setGroups(getGroup(segments[s]), h); // Set the diode groups
                            }
                        } else if (t >= 0) {
                            if (segments[t].startY === segments[t].endY) { // If the segment is horizontal
                                diodes[j].setGroups(getGroup(segments[t]), h); // Set the diode groups
                            }
                        }
                    } else if (groups[h].segments[i].startY === groups[h].segments[i].endY) { // if the segment is horizontal
                        let s = segmentStartsIn(groups[h].segments[i].endX, groups[h].segments[i].endY); // Get the segment that starts in x,y or -1
                        let t = segmentEndsIn(groups[h].segments[i].endX, groups[h].segments[i].endY); // Get the segment that ends in x,y or -1
                        if (s >= 0) {
                            if (segments[s].startX === segments[s].endX) { // If the segment is vertical
                                diodes[j].setGroups(h, getGroup(segments[s])); // Set the diode groups
                            }
                        } else if (t >= 0) {
                            if (segments[t].startX === segments[t].endX) { // If the segment is vertical
                                diodes[j].setGroups(h, getGroup(segments[t])); // Set the diode groups
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
            if (i !== j  && seg[i] !== null && seg[j] !== null) {
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