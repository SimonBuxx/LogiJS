// File: selectionHandling.js
// Contains functions for the selection feature

/*
    This is invoked when the selection area is drawn
    It selects all underlying items 
*/
function handleSelection(x1, y1, x2, y2) {
    sClickBox.updatePosition(x1 + (x2 - x1) / 2, y1 + (y2 - y1) / 2);
    sClickBox.updateSize(x2 - x1, y2 - y1);
    sClickBox.setTransform(transform);
    showSClickBox = true;
    selection = [];
    for (let i = 0; i < gates.length; i++) {
        if (gates[i].x >= x1 && gates[i].x <= x2 && gates[i].y >= y1 && gates[i].y <= y2) {
            gates[i].marked = true;
            selection.push(gates[i]);
        }
    }
    for (let i = 0; i < customs.length; i++) {
        if (customs[i].visible && (customs[i].x >= x1 && customs[i].x <= x2 && customs[i].y >= y1 && customs[i].y <= y2)) {
            customs[i].marked = true;
            selection.push(customs[i]);
        }
    }
    for (let i = 0; i < inputs.length; i++) {
        if (inputs[i].x >= x1 && inputs[i].x <= x2 && inputs[i].y >= y1 && inputs[i].y <= y2) {
            inputs[i].marked = true;
            selection.push(inputs[i]);
        }
    }
    for (let i = 0; i < outputs.length; i++) {
        if (outputs[i].x >= x1 && outputs[i].x <= x2 && outputs[i].y >= y1 && outputs[i].y <= y2) {
            outputs[i].marked = true;
            selection.push(outputs[i]);
        }
    }
    for (let i = 0; i < conpoints.length; i++) {
        if (conpoints[i].x >= x1 && conpoints[i].x <= x2 && conpoints[i].y >= y1 && conpoints[i].y <= y2) {
            conpoints[i].marked = true;
            selection.push(conpoints[i]);
        }
    }
    for (let i = 0; i < diodes.length; i++) {
        if (diodes[i].x >= x1 && diodes[i].x <= x2 && diodes[i].y >= y1 && diodes[i].y <= y2) {
            diodes[i].marked = true;
            selection.push(diodes[i]);
        }
    }
    for (let i = 0; i < labels.length; i++) {
        if (labels[i].x >= x1 && labels[i].x <= x2 && labels[i].y >= y1 && labels[i].y <= y2) {
            labels[i].marked = true;
            selection.push(labels[i]);
        }
    }
    let wireSelection = [];
    for (let i = 0; i < wires.length; i++) {
        if ((wires[i].direction === 0) && ((wires[i].startX >= x1 || x1 <= wires[i].endX) && (wires[i].startX <= x2 || x2 >= wires[i].endX)) && (wires[i].startY >= y1 && wires[i].endY <= y2)) {
            wires[i].marked = true;
            wireSelection.push(wires[i]);
        } else if ((wires[i].direction === 1) && ((wires[i].startY >= y1 || y1 <= wires[i].endY) && (wires[i].startY <= y2 || y2 >= wires[i].endY)) && (wires[i].startX >= x1 && wires[i].endX <= x2)) {
            wires[i].marked = true;
            wireSelection.push(wires[i]);
        }
    }
    let segSelection = [];
    for (let i = 0; i < wireSelection.length; i++) {
        if (wireSelection[i].x1 === wireSelection[i].x2) {
            // Vertical wire, split in n vertical segments | Assuming y1 < y2, can always be saved in that form
            for (let j = 0; j < (wireSelection[i].y2 - wireSelection[i].y1) / GRIDSIZE; j++) {
                segSelection.push(new WSeg(1, wireSelection[i].x1, wireSelection[i].y1 + j * GRIDSIZE,
                    false, transform));
            }
        } else if (wireSelection[i].y1 === wireSelection[i].y2) {
            // Horizontal wire, split in n horizontal segments | Assuming x1 < x2, can always be saved in that form
            for (let j = 0; j < (wireSelection[i].x2 - wireSelection[i].x1) / GRIDSIZE; j++) {
                segSelection.push(new WSeg(0, wireSelection[i].x1 + j * GRIDSIZE, wireSelection[i].y1,
                    false, transform));
            }
        }
    }
    selection = selection.concat(wireSelection);
    selection = selection.concat(segSelection);
}

/*
    Moves the selected items by dx, dy
*/
function moveSelection(dx, dy) {
    //if ((sClickBox.x - sClickBox.w / 2 > GRIDSIZE || dx >= 0) && (sClickBox.y - sClickBox.h / 2 > GRIDSIZE || dy >= 0)) {
        sClickBox.updatePosition(sClickBox.x + dx, sClickBox.y + dy);
        for (let i = 0; i < selection.length; i++) {
            selection[i].alterPosition(dx, dy);
        }
    //}
}

/*
    Recalculates all wire segments and redoes the connection points
*/
function finishSelection() {
    segments = [];
    for (let i = 0; i < wires.length; i++) {
        if (wires[i].startX === wires[i].endX) {
            // Vertical wire, split in n vertical segments
            for (let j = 0; j < (wires[i].endY - wires[i].startY) / GRIDSIZE; j++) {
                segments.push(new WSeg(1, wires[i].startX, (wires[i].startY + j * GRIDSIZE), false, transform));
            }
        } else if (wires[i].startY === wires[i].endY) {
            // Horizontal wire, split in n horizontal segments
            for (let j = 0; j < (wires[i].endX - wires[i].startX) / GRIDSIZE; j++) {
                segments.push(new WSeg(0, wires[i].startX + j * GRIDSIZE, wires[i].startY, false, transform));
            }
        }
    }
    doConpoints();
}