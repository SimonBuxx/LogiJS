// File: undoredo.js

function undo() {
    let act = actionUndo.pop();
    if (act !== null) {
        switch (act.actionType) {
            case 'addGate':
                gates.pop();
                actionRedo.push(act);
                break;
            case 'addCust':
                let toDelete = null;
                for (let i = customs.length - 1; i >= 0; i--) {
                    if (customs[i].visible) {
                        toDelete = customs[i];
                        break;
                    }
                }
                for (let i = customs.length - 1; i >= 0; i--) {
                    if (customs[i].pid === toDelete.id) {
                        customs.splice(i, 1);
                    }
                }
                customs.splice(customs.indexOf(toDelete));
                actionRedo.push(act);
                break;
            case 'addOut':
                outputs.pop();
                actionRedo.push(act);
                break;
            case 'addIn':
                inputs.pop();
                actionRedo.push(act);
                break;
            case 'addSegDis':
                segDisplays.pop();
                actionRedo.push(act);
                break;
            case 'addDi':
                actionRedo.push(act);
                diodes.pop();
                doConpoints();
                break;
            case 'addCp':
                conpoints.pop();
                actionRedo.push(act);
                doConpoints();
                break;
            case 'addLabel':
                actionRedo.push(act);
                labels.pop();
                break;
            case 'invGIP':
                gates[act.actionIndizes[0]].invertInput(act.actionIndizes[1]);
                actionRedo.push(act);
                break;
            case 'invGOP':
                gates[act.actionIndizes[0]].invertOutput(act.actionIndizes[1]);
                actionRedo.push(act);
                break;
            case 'invCIP':
                customs[act.actionIndizes[0]].invertInput(act.actionIndizes[1]);
                actionRedo.push(act);
                break;
            case 'invCOP':
                customs[act.actionIndizes[0]].invertOutput(act.actionIndizes[1]);
                actionRedo.push(act);
                break;
            case 'invDIP':
                segDisplays[act.actionIndizes[0]].invertInput(act.actionIndizes[1]);
                actionRedo.push(act);
                break;
            case 'delGate':
                gates.splice(act.actionObject[1], 0, act.actionObject[0][0]);
                actionRedo.push(act);
                break;
            case 'delCust':
                customs.splice(act.actionObject[1], 0, act.actionObject[0][0]);
                customs[act.actionObject[1]].loaded = false;
                loadCustomFile(customs[act.actionObject[1]].filename, act.actionObject[1], act.actionObject[1]);
                actionRedo.push(act);
                break;
            case 'delOut':
                outputs.push(act.actionObject[0]);
                actionRedo.push(act);
                break;
            case 'delSegDis':
                segDisplays.push(act.actionObject[0]);
                actionRedo.push(act);
                break;
            case 'delIn':
                inputs.push(act.actionObject[0]);
                actionRedo.push(act);
                break;
            case 'delDi':
                diodes.push(act.actionObject[0]);
                actionRedo.push(act);
                doConpoints();
                break;
            case 'delCp':
                conpoints.push(act.actionObject[0]);
                actionRedo.push(act);
                doConpoints();
                break;    
            case 'delLabel':
                labels.push(act.actionObject[0]);
                actionRedo.push(act);
                break;
            case 'moveSel': // Broken
                ctrlMode = "select";
                handleSelection(act.actionIndizes[2], act.actionIndizes[3], act.actionIndizes[4], act.actionIndizes[5]);
                showSClickBox = false;
                moveSelection(-act.actionIndizes[0], -act.actionIndizes[1]);
                finishSelection();
                ctrlMode = "none";
                selection = [];
                unmarkAll();
                actionRedo.push(act);
                break;
            case 'delSel':
                for (let i = 0; i < act.actionObject[0][0].length; i++) {
                    gates.splice(act.actionObject[0][1][i], 0, act.actionObject[0][0][i]);
                }
                for (let i = 0; i < act.actionObject[1][0].length; i++) {
                    customs.splice(act.actionObject[1][1][i], 0, act.actionObject[1][0][i]);
                    customs[act.actionObject[1][1][i]].loaded = false;
                    loadCustomFile(customs[act.actionObject[1][1][i]].filename, act.actionObject[1][1][i], act.actionObject[1][1][i]);
                }
                diodes = act.actionObject[2].slice(0);
                for (let i = 0; i < act.actionObject[3][0].length; i++) {
                    inputs.splice(act.actionObject[3][1][i], 0, act.actionObject[3][0][i]);
                }
                for (let i = 0; i < act.actionObject[4][0].length; i++) {
                    labels.splice(act.actionObject[4][1][i], 0, act.actionObject[4][0][i]);
                }
                for (let i = 0; i < act.actionObject[5][0].length; i++) {
                    outputs.splice(act.actionObject[5][1][i], 0, act.actionObject[5][0][i]);
                }
                for (let i = 0; i < act.actionObject[6][0].length; i++) {
                    wires.splice(act.actionObject[6][1][i], 0, act.actionObject[6][0][i]);
                }
                for (let i = 0; i < act.actionObject[7][0].length; i++) {
                    segDisplays.splice(act.actionObject[7][1][i], 0, act.actionObject[7][0][i]);
                }
                conpoints = act.actionObject[8].slice(0);
                for (let i = 0; i < act.actionObject[9][0].length; i++) {
                    segments.splice(act.actionObject[9][1][i], 0, act.actionObject[9][0][i]);
                }
                doConpoints();
                act.actionObject[2] = diodes.slice(0);
                act.actionObject[8] = conpoints.slice(0);
                actionRedo.push(act);
                break;
            case 'reWire':
                actionRedo.push(new Action('reWire', 0, [segments.slice(0), conpoints.slice(0)]));
                conpoints = act.actionObject[1].slice(0);
                segments = act.actionObject[0].slice(0);
                doConpoints();
                findLines();
                break;
            default:
                break;
        }
    }
    redoButton.elt.disabled = (actionRedo.length === 0);
    undoButton.elt.disabled = (actionUndo.length === 0);
    reDraw();
}

function redo() {
    //console.log(wires);
    //console.log(segments);
    let act = actionRedo.pop();
    if (act !== null) {
        switch (act.actionType) {
            case 'addGate':
                gates.push(act.actionObject);
                actionUndo.push(act);
                break;
            case 'addCust':
                customs.push(act.actionObject);
                customs[customs.length - 1].loaded = false;
                loadCustomFile(customs[customs.length - 1].filename, customs.length - 1, customs.length - 1);
                actionUndo.push(act);
                break;
            case 'addOut':
                outputs.push(act.actionObject);
                actionUndo.push(act);
                break;
            case 'addIn':
                inputs.push(act.actionObject);
                actionUndo.push(act);
                break;
            case 'addSegDis':
                segDisplays.push(act.actionObject);
                actionUndo.push(act);
                break;
            case 'addDi':
                diodes.push(act.actionObject);
                actionUndo.push(act);
                doConpoints();
                break;
            case 'addCp':
                conpoints.push(act.actionObject);
                actionUndo.push(act);
                doConpoints();
                break;
            case 'addLabel':
                labels.push(act.actionObject);
                actionUndo.push(act);
                break;
            case 'delGate':
                gates.splice(act.actionObject[1], 1);
                actionUndo.push(act);
                break;
            case 'delCust':
                let toDelete = act.actionObject[0][0];
                for (let i = customs.length - 1; i >= 0; i--) {
                    if (customs[i].pid === toDelete.id) {
                        customs.splice(i, 1);
                    }
                }
                customs.splice(customs.indexOf(toDelete), 1);
                actionUndo.push(act);
                break;
            case 'delOut':
                outputs.pop();
                actionUndo.push(act);
                break;
            case 'delIn':
                inputs.pop();
                actionUndo.push(act);
                break;
            case 'delSegDis':
                segDisplays.pop();
                actionUndo.push(act);
                break;
            case 'delDi':
                actionUndo.push(act);
                let x = diodes[diodes.length - 1].x;
                let y = diodes[diodes.length - 1].y;
                if (diodes[diodes.length - 1].cp) {
                    diodes.pop();
                    createConpoint(x, y, false, -1);
                } else {
                    diodes.pop();
                }
                doConpoints();
                break;
            case 'delCp':
                conpoints.pop();
                actionUndo.push(act);
                doConpoints();
                break;
            case 'delLabel':
                labels.pop();
                actionUndo.push(act[0]);
                break;
            case 'invGIP':
                gates[act.actionIndizes[0]].invertInput(act.actionIndizes[1]);
                actionUndo.push(act);
                break;
            case 'invGOP':
                gates[act.actionIndizes[0]].invertOutput(act.actionIndizes[1]);
                actionUndo.push(act);
                break;
            case 'invCIP':
                customs[act.actionIndizes[0]].invertInput(act.actionIndizes[1]);
                actionUndo.push(act);
                break;
            case 'invCOP':
                customs[act.actionIndizes[0]].invertOutput(act.actionIndizes[1]);
                actionUndo.push(act);
                break;
            case 'invDIP':
                segDisplays[act.actionIndizes[0]].invertInput(act.actionIndizes[1]);
                actionUndo.push(act);
                break;
            case 'moveSel':
                ctrlMode = "select";
                handleSelection(act.actionIndizes[2] - act.actionIndizes[0], act.actionIndizes[3] - act.actionIndizes[1], act.actionIndizes[4] - act.actionIndizes[0], act.actionIndizes[5] - act.actionIndizes[1]);
                showSClickBox = false;
                moveSelection(act.actionIndizes[0], act.actionIndizes[1]);
                finishSelection();
                ctrlMode = "none";
                selection = [];
                unmarkAll();
                actionUndo.push(act);
                break;
            case 'delSel': // TODO
                /*for (let i = act.actionObject[0][1].length - 1; i >= 0; i--) {
                    gates.splice(act.actionObject[0][1][i], 1);
                }
                for (let i = act.actionObject[1][1].length - 1; i >= 0; i--) {
                    let toDelete = act.actionObject[1][0][i];
                    for (let j = customs.length - 1; j >= 0; j--) {
                        if (customs[j].pid === toDelete.id) {
                            customs.splice(j, 1);
                        }
                    }
                    customs.splice(customs.indexOf(toDelete), 1);
                }
                diodes = act.actionObject[2].slice(0);
                for (let i = act.actionObject[3][1].length - 1; i >= 0; i--) {
                    inputs.splice(act.actionObject[3][1][i], 1);
                }
                for (let i = act.actionObject[4][1].length - 1; i >= 0; i--) {
                    labels.splice(act.actionObject[4][1][i], 1);
                }
                for (let i = act.actionObject[5][1].length - 1; i >= 0; i--) {
                    outputs.splice(act.actionObject[5][1][i], 1);
                }*/
                //console.log(act.actionObject);
                //console.log(wires);
                for (let i = act.actionObject[6][1].length - 1; i >= 0; i--) {
                    //wires.splice(wires.indexOf(act.actionObject[6][0][0][0]), 1);
                    // Splitting the wires into individual segments
                    /*let segSelection = [];
                    if (act.actionObject[6][0][j].startX === act.actionObject[6][0][j].endX) {
                        // Vertical wire, split in n vertical segments | Assuming y1 < y2, can always be saved in that form
                        for (let k = 0; k < (act.actionObject[6][0][j].endY - act.actionObject[6][0][j].startY) / GRIDSIZE; k++) {
                            segSelection.push(new WSeg(1, act.actionObject[6][0][j].startX, act.actionObject[6][0][j].startY + k * GRIDSIZE,
                                false, transform));
                        }
                    } else if (act.actionObject[6][0][j].startY === act.actionObject[6][0][j].endY) {
                        // Horizontal wire, split in n horizontal segments | Assuming x1 < x2, can always be saved in that form
                        for (let k = 0; k < (act.actionObject[6][0][j].endX - act.actionObject[6][0][j].startX) / GRIDSIZE; k++) {
                            segSelection.push(new WSeg(0, act.actionObject[6][0][j].startX + k * GRIDSIZE, act.actionObject[6][0][j].startY,
                                false, transform));
                        }
                    }
                    // Pushing the individual segments and deleting them from the segments array
                    for (let k = 0; k < segSelection.length; k++) {
                        act.actionObject[6][0].push(segSelection[k]);
                        segments.splice(segments.indexOf(segSelection[k]), 1);
                    }*/
                    wires.splice(act.actionObject[6][1][i]);
                }
                //console.log(wires);
                /*for (let i = act.actionObject[7][1].length - 1; i >= 0; i--) {
                    segDisplays.splice(act.actionObject[7][1][i], 1);
                }
                conpoints = act.actionObject[8].slice(0);*/
                for (let i = act.actionObject[9][1].length - 1; i >= 0; i--) {
                    segments.splice(act.actionObject[9][1][i]);
                }
                //doConpoints();
                //act.actionObject[2] = diodes.slice(0);
                //act.actionObject[8] = conpoints.slice(0);
                actionUndo.push(act);
                break;
            case 'reWire':
                actionUndo.push(new Action('reWire', 0, [segments.slice(0), conpoints.slice(0)]));
                segments = act.actionObject[0].slice(0);
                doConpoints();
                findLines();
                break;
            default:
                break;
        }
    }
    redoButton.elt.disabled = (actionRedo.length === 0);
    undoButton.elt.disabled = (actionUndo.length === 0);
    reDraw();
}

function pushUndoAction(type, indizees, objects) {
    actionUndo.push(new Action(type, indizees, objects));
    actionRedo.pop();
    if (actionUndo.length > HIST_LENGTH) {
        actionUndo.splice(0, 1);
    }
    updateUndoButtons();
}