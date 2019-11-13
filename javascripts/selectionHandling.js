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
    selection = [];
    selectionConpoints = _.cloneDeep(conpoints);
    selectionWires = _.cloneDeep(wires);
    selectionSegments = _.cloneDeep(segments);
    for (let i = 0; i < gates.length; i++) {
        if (gates[i].x >= x1 && gates[i].x <= x2 && gates[i].y >= y1 && gates[i].y <= y2) {
            gates[i].marked = true;
            selection.push([gates[i], i]);
        }
    }
    for (let i = 0; i < customs.length; i++) {
        if (customs[i].visible && (customs[i].x >= x1 && customs[i].x <= x2 && customs[i].y >= y1 && customs[i].y <= y2)) {
            customs[i].marked = true;
            selection.push([customs[i], i]);
        }
    }
    for (let i = 0; i < inputs.length; i++) {
        if (inputs[i].x >= x1 && inputs[i].x <= x2 && inputs[i].y >= y1 && inputs[i].y <= y2) {
            inputs[i].marked = true;
            selection.push([inputs[i], i]);
        }
    }
    for (let i = 0; i < outputs.length; i++) {
        if (outputs[i].x >= x1 && outputs[i].x <= x2 && outputs[i].y >= y1 && outputs[i].y <= y2) {
            outputs[i].marked = true;
            selection.push([outputs[i], i]);
        }
    }
    for (let i = 0; i < conpoints.length; i++) {
        if (conpoints[i].x >= x1 && conpoints[i].x <= x2 && conpoints[i].y >= y1 && conpoints[i].y <= y2) {
            conpoints[i].marked = true;
            selection.push([conpoints[i], i]);
        }
    }
    for (let i = 0; i < diodes.length; i++) {
        if (diodes[i].x >= x1 && diodes[i].x <= x2 && diodes[i].y >= y1 && diodes[i].y <= y2) {
            diodes[i].marked = true;
            selection.push([diodes[i], i]);
        }
    }
    for (let i = 0; i < labels.length; i++) {
        if (labels[i].x >= x1 && labels[i].x <= x2 && labels[i].y >= y1 && labels[i].y <= y2) {
            labels[i].marked = true;
            selection.push([labels[i], i]);
        }
    }
    for (let i = 0; i < segDisplays.length; i++) {
        if (segDisplays[i].x >= x1 && segDisplays[i].x <= x2 && segDisplays[i].y >= y1 && segDisplays[i].y <= y2) {
            segDisplays[i].marked = true;
            selection.push([segDisplays[i], i]);
        }
    }
    /*for (let i = 0; i < wires.length; i++) {
        if (((wires[i].direction === 0) && ((wires[i].startX >= x1 || x1 <= wires[i].endX) &&
            (wires[i].startX <= x2 || x2 >= wires[i].endX)) && (wires[i].startY >= y1 && wires[i].endY <= y2)) ||
            ((wires[i].direction === 1) && ((wires[i].startY >= y1 || y1 <= wires[i].endY) &&
                (wires[i].startY <= y2 || y2 >= wires[i].endY)) && (wires[i].startX >= x1 && wires[i].endX <= x2))) {
            //wires[i].marked = true;
            wires[i].wireFlag = true;
            selection.push([wires[i], i]);
        }
    }*/
    greySegments = [];
    for (let i = 0; i < segments.length; i++) {
        if (((segments[i].direction === 0) && ((segments[i].startX >= x1 || x1 <= segments[i].endX) &&
            (segments[i].startX <= x2 || x2 >= segments[i].endX)) && (segments[i].startY >= y1 && segments[i].endY <= y2)) ||
            ((segments[i].direction === 1) && ((segments[i].startY >= y1 || y1 <= segments[i].endY) &&
                (segments[i].startY <= y2 || y2 >= segments[i].endY)) && (segments[i].startX >= x1 && segments[i].endX <= x2))) {
            greySegments.push(_.cloneDeep(segments[i]));
            segments[i].marked = true;
            segments[i].wireFlag = false;
            selection.push([segments[i], i]);
        }
    }
}

/*
    Moves the selected items by dx, dy
*/
function moveSelection(dx, dy, moveConpointsAndWires = true) {
    selectionBox.updatePosition(selectionBox.x + dx, selectionBox.y + dy);
    for (let i = 0; i < selection.length; i++) {
        switch (selection[i][0].id.charAt(0)) {
            case 'o':
                outputs[selection[i][1]].alterPosition(dx, dy);
                break;
            case 'i':
                inputs[selection[i][1]].alterPosition(dx, dy);
                break;
            case 's':
                segDisplays[selection[i][1]].alterPosition(dx, dy);
                break;
            case 'l':
                labels[selection[i][1]].alterPosition(dx, dy);
                break;
            case 'd':
                diodes[selection[i][1]].alterPosition(dx, dy);
                break;
            case 'p':
                if (moveConpointsAndWires) {
                    conpoints[selection[i][1]].alterPosition(dx, dy);
                }
                break;
            case 'c':
                customs[selection[i][1]].alterPosition(dx, dy);
                break;
            case 'g':
                gates[selection[i][1]].alterPosition(dx, dy);
                break;
            case 'w':
                if (moveConpointsAndWires) {
                    if (selection[i][0].wireFlag) {
                        wires[selection[i][1]].alterPosition(dx, dy);
                    } else {
                        segments[selection[i][1]].alterPosition(dx, dy);
                    }
                }
                break;
            default:
        }
    }
}

/*
    Recalculates all wire segments and redoes the connection points
*/
function finishSelection() {
    /*segments = [];
    for (let i = 0; i < wires.length; i++) {
        if (wires[i].startX === wires[i].endX) {
            // Vertical wire, split in n vertical segments
            for (let j = 0; j < (wires[i].endY - wires[i].startY) / GRIDSIZE; j++) {
                segments.push(new Wire(1, wires[i].startX, (wires[i].startY + j * GRIDSIZE), false, transform));
            }
        } else if (wires[i].startY === wires[i].endY) {
            // Horizontal wire, split in n horizontal segments
            for (let j = 0; j < (wires[i].endX - wires[i].startX) / GRIDSIZE; j++) {
                segments.push(new Wire(0, wires[i].startX + j * GRIDSIZE, wires[i].startY, false, transform));
            }
        }
    }*/
    findLines();
    doConpoints();
}