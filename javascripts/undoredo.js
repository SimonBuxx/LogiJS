// File: undoredo.js

function undo(noRedoPush = false) {
    let act = actionUndo.pop();
    if (act !== null) {
        switch (act.actionType) {
            case 'addGate':
                gates.splice(act.actionIndizes[0], 1);
                actionRedo.push(act);
                break;
            case 'addCust':
                for (let i = customs.length - 1; i >= 0; i--) {
                    if (customs[i].pid === customs[act.actionIndizes[0]].id) {
                        customs.splice(i, 1);
                    }
                }
                customs.splice(act.actionIndizes[0], 1);
                actionRedo.push(act);
                break;
            case 'addOut':
                outputs.splice(act.actionIndizes[0], 1);
                actionRedo.push(act);
                break;
            case 'addIn':
                inputs.splice(act.actionIndizes[0], 1);
                actionRedo.push(act);
                break;
            case 'addSegDis':
                segDisplays.splice(act.actionIndizes[0], 1);
                actionRedo.push(act);
                break;
            case 'addDi':
                diodes.splice(act.actionIndizes[0], 1);
                actionRedo.push(act);
                break;
            case 'addLabel':
                labels.splice(act.actionIndizes[0], 1);
                actionRedo.push(act);
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
                gates.splice(act.actionIndizes[0], 0, _.cloneDeep(act.actionObject[0]));
                actionRedo.push(act);
                break;
            case 'delCust':
                customs.splice(act.actionIndizes[0], 0, _.cloneDeep(act.actionObject[0]));
                setLoading(true);
                customs[act.actionIndizes[0]].parsed = false;
                loadCustomFile(customs[act.actionIndizes[0]].filename, act.actionIndizes[0], act.actionIndizes[0]);
                actionRedo.push(act);
                break;
            case 'delOut':
                outputs.splice(act.actionIndizes[0], 0, _.cloneDeep(act.actionObject[0]));
                actionRedo.push(act);
                break;
            case 'delSegDis':
                segDisplays.splice(act.actionIndizes[0], 0, _.cloneDeep(act.actionObject[0]));
                actionRedo.push(act);
                break;
            case 'delIn':
                inputs.splice(act.actionIndizes[0], 0, _.cloneDeep(act.actionObject[0]));
                actionRedo.push(act);
                break;
            case 'delDi':
                diodes.splice(act.actionIndizes[0], 0, _.cloneDeep(act.actionObject[0]));
                actionRedo.push(act);
                break;
            case 'delCp':
                actionRedo.push(act);
                conpoints.splice(act.actionIndizes[0], 0, _.cloneDeep(act.actionObject[0]));
                break;
            case 'delLabel':
                labels.splice(act.actionIndizes[0], 0, _.cloneDeep(act.actionObject[0]));
                actionRedo.push(act);
                break;
            case 'swiDi':
                diodes.splice(act.actionIndizes[0], 0, _.cloneDeep(act.actionObject[0][0]));
                conpoints.splice(act.actionIndizes[1], 1);
                actionRedo.push(act);
                break;
            case 'moveSel':
                conpoints = _.cloneDeep(act.actionObject[1]);
                diodes = _.cloneDeep(act.actionObject[3]);

                let retrievedWires = [];
                let retrievedIndizes = [];

                for (let i = act.actionObject[0].length - 1; i >= 0; i--) { // Iterate backwards over all selectionLog entries
                    if (act.actionObject[0][i][0] === 'aWire') {
                        wires.splice(act.actionObject[0][i][1], 1);
                        if (!retrievedIndizes.includes(act.actionObject[0][i][3])) {
                            retrievedWires.push([act.actionObject[0][i][3], act.actionObject[0][i][2]]);
                            retrievedIndizes.push(act.actionObject[0][i][3]);
                        }
                    } else if (act.actionObject[0][i][0] === 'dWire') {
                        wires.splice(act.actionObject[0][i][1], 0, _.cloneDeep(act.actionObject[0][i][2]));
                    } else if (act.actionObject[0][i][0] === 'rWire') {
                        wires.splice(act.actionObject[0][i][1], 1, _.cloneDeep(act.actionObject[0][i][2]));
                        if (!retrievedIndizes.includes(act.actionObject[0][i][5])) {
                            retrievedWires.push([act.actionObject[0][i][5], act.actionObject[0][i][4]]);
                            retrievedIndizes.push(act.actionObject[0][i][5]);
                        }
                    }
                }

                retrievedIndizes = _.cloneDeep(retrievedIndizes);
                retrievedWires = _.cloneDeep(retrievedWires);

                for (let i = 0; i < retrievedWires.length; i++) {
                    wires.splice(retrievedWires[i][0], 0, retrievedWires[i][1]);
                }

                for (let i = act.actionObject[0].length - 1; i >= 0; i--) { // Iterate backwards over all selectionLog entries
                    if (act.actionObject[0][i][0] === 'mWire') { // All wires are retrieved at this point
                        wires[act.actionObject[0][i][1]].alterPosition(-act.actionIndizes[0], -act.actionIndizes[1]);
                    }
                }

                for (let i = 0; i < act.actionIndizes[2].length; i++) {
                    gates[act.actionIndizes[2][i]].alterPosition(-act.actionIndizes[0], -act.actionIndizes[1]);
                }

                for (let i = 0; i < act.actionIndizes[3].length; i++) {
                    inputs[act.actionIndizes[3][i]].alterPosition(-act.actionIndizes[0], -act.actionIndizes[1]);
                }

                for (let i = 0; i < act.actionIndizes[4].length; i++) {
                    outputs[act.actionIndizes[4][i]].alterPosition(-act.actionIndizes[0], -act.actionIndizes[1]);
                }

                for (let i = 0; i < act.actionIndizes[5].length; i++) {
                    labels[act.actionIndizes[5][i]].alterPosition(-act.actionIndizes[0], -act.actionIndizes[1]);
                }

                for (let i = 0; i < act.actionIndizes[6].length; i++) {
                    segDisplays[act.actionIndizes[6][i]].alterPosition(-act.actionIndizes[0], -act.actionIndizes[1]);
                }

                for (let i = 0; i < act.actionIndizes[7].length; i++) {
                    customs[act.actionIndizes[7][i]].alterPosition(-act.actionIndizes[0], -act.actionIndizes[1]);
                }
                if (!noRedoPush) {
                    actionRedo.push(act);
                }
                break;
            case 'delSel':
                conpoints = _.cloneDeep(act.actionObject[1]);
                diodes = _.cloneDeep(act.actionObject[3]);

                for (let i = act.actionObject[0].length - 1; i >= 0; i--) {
                    if (act.actionObject[0][i][0] === 'wire') {
                        wires.splice(act.actionObject[0][i][1], 0, _.cloneDeep(act.actionObject[0][i][2]));
                    }
                    if (act.actionObject[0][i][0] === 'gate') {
                        gates.splice(act.actionObject[0][i][1], 0, _.cloneDeep(act.actionObject[0][i][2]));
                    }
                    if (act.actionObject[0][i][0] === 'input') {
                        inputs.splice(act.actionObject[0][i][1], 0, _.cloneDeep(act.actionObject[0][i][2]));
                    }
                    if (act.actionObject[0][i][0] === 'output') {
                        outputs.splice(act.actionObject[0][i][1], 0, _.cloneDeep(act.actionObject[0][i][2]));
                    }
                    if (act.actionObject[0][i][0] === 'label') {
                        labels.splice(act.actionObject[0][i][1], 0, _.cloneDeep(act.actionObject[0][i][2]));
                    }
                    if (act.actionObject[0][i][0] === 'segDisplay') {
                        segDisplays.splice(act.actionObject[0][i][1], 0, _.cloneDeep(act.actionObject[0][i][2]));
                    }
                    if (act.actionObject[0][i][0] === 'custom') {
                        customs[act.actionObject[0][i][1]].visible = true;
                    }
                }
                actionRedo.push(act);
                break;
            case 'addWire':
                conpoints = _.cloneDeep(act.actionObject[1]);
                for (let i = act.actionObject[0].length - 1; i >= 0; i--) {
                    if (act.actionObject[0][i][0] === 'a') {
                        wires.splice(act.actionObject[0][i][1], 1);
                    } else if (act.actionObject[0][i][0] === 'd') {
                        wires.splice(act.actionObject[0][i][1], 0, _.cloneDeep(act.actionObject[0][i][2]));
                    } else if (act.actionObject[0][i][0] === 'r') {
                        wires.splice(act.actionObject[0][i][1], 1, _.cloneDeep(act.actionObject[0][i][2]));
                    }
                }
                actionRedo.push(act);
                break;
            case 'delWire':
                conpoints = _.cloneDeep(act.actionObject[1]);
                for (let i = act.actionObject[0].length - 1; i >= 0; i--) {
                    if (act.actionObject[0][i][0] === 'a') {
                        wires.splice(act.actionObject[0][i][1], 1);
                    } else if (act.actionObject[0][i][0] === 'd') {
                        wires.splice(act.actionObject[0][i][1], 0, _.cloneDeep(act.actionObject[0][i][2]));
                    }
                }
                for (let i = 0; i < act.actionIndizes[0].length; i++) {
                    diodes.splice(act.actionIndizes[0][i], 0, _.cloneDeep(act.actionObject[3][i][0]));
                }
                actionRedo.push(act);
                break;
            default:
                break;
        }
    }
    updateUndoButtons();
    reDraw();
}

function redo() {
    let act = actionRedo.pop();
    if (act !== null) {
        switch (act.actionType) {
            case 'addGate':
                gates.splice(act.actionIndizes[0], 0, _.cloneDeep(act.actionObject[0]));
                actionUndo.push(act);
                break;
            case 'addCust':
                customs.splice(act.actionIndizes[0], 0, _.cloneDeep(act.actionObject[0]));
                setLoading(true);
                customs[act.actionIndizes[0]].parsed = false;
                loadCustomFile(customs[act.actionIndizes[0]].filename, act.actionIndizes[0], act.actionIndizes[0]);
                actionUndo.push(act);
                break;
            case 'addOut':
                outputs.splice(act.actionIndizes[0], 0, _.cloneDeep(act.actionObject[0]));
                actionUndo.push(act);
                break;
            case 'addIn':
                inputs.splice(act.actionIndizes[0], 0, _.cloneDeep(act.actionObject[0]));
                actionUndo.push(act);
                break;
            case 'addSegDis':
                segDisplays.splice(act.actionIndizes[0], 0, _.cloneDeep(act.actionObject[0]));
                actionUndo.push(act);
                break;
            case 'addDi':
                diodes.splice(act.actionIndizes[0], 0, _.cloneDeep(act.actionObject[0]));
                actionUndo.push(act);
                break;
            case 'addLabel':
                labels.splice(act.actionIndizes[0], 0, _.cloneDeep(act.actionObject[0]));
                actionUndo.push(act);
                break;
            case 'delGate':
                gates.splice(act.actionIndizes[0], 1);
                actionUndo.push(act);
                break;
            case 'delCust':
                for (let i = customs.length - 1; i >= 0; i--) {
                    if (customs[i].pid === act.actionObject[0].id) {
                        customs.splice(i, 1);
                    }
                }
                customs.splice(act.actionIndizes[0], 1);
                actionUndo.push(act);
                break;
            case 'delOut':
                outputs.splice(act.actionIndizes[0], 1);
                actionUndo.push(act);
                break;
            case 'delIn':
                inputs.splice(act.actionIndizes[0], 1);
                actionUndo.push(act);
                break;
            case 'delSegDis':
                segDisplays.splice(act.actionIndizes[0], 1);
                actionUndo.push(act);
                break;
            case 'delDi':
                diodes.splice(act.actionIndizes[0], 1);
                actionUndo.push(act);
                break;
            case 'delCp':
                conpoints.splice(act.actionIndizes[0], 1);
                actionUndo.push(act);
                break;
            case 'delLabel':
                labels.splice(act.actionIndizes[0], 1);
                actionUndo.push(act);
                break;
            case 'swiDi':
                diodes.splice(act.actionIndizes[0], 1);
                conpoints.splice(act.actionIndizes[1], 0, _.cloneDeep(act.actionObject[1]));
                actionUndo.push(act);
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
                conpoints = _.cloneDeep(act.actionObject[2]);
                diodes = _.cloneDeep(act.actionObject[4]);

                let retrievedIndizes = [];

                for (let i = 0; i < act.actionObject[0].length; i++) {
                    if (act.actionObject[0][i][0] === 'mWire') {
                        wires[act.actionObject[0][i][1]].alterPosition(act.actionIndizes[0], act.actionIndizes[1]);
                    } else if (act.actionObject[0][i][0] === 'aWire') {
                        if (!retrievedIndizes.includes(act.actionObject[0][i][3])) {
                            retrievedIndizes.push(act.actionObject[0][i][3]);
                        }
                    } else if (act.actionObject[0][i][0] === 'rWire') {
                        if (!retrievedIndizes.includes(act.actionObject[0][i][5])) {
                            retrievedIndizes.push(act.actionObject[0][i][5]);
                        }
                    }
                }

                retrievedIndizes = _.cloneDeep(retrievedIndizes);

                for (let i = 0; i < retrievedIndizes.length; i++) {
                    wires.splice(retrievedIndizes[i], 1);
                }

                for (let i = 0; i < act.actionObject[0].length; i++) {
                    if (act.actionObject[0][i][0] === 'aWire') {
                        wires.splice(act.actionObject[0][i][1], 0, _.cloneDeep(act.actionObject[0][i][2]));
                    } else if (act.actionObject[0][i][0] === 'dWire') {
                        wires.splice(act.actionObject[0][i][1], 1);
                    } else if (act.actionObject[0][i][0] === 'rWire') {
                        wires.splice(act.actionObject[0][i][1], 1, _.cloneDeep(act.actionObject[0][i][3]));
                    }
                }

                for (let i = 0; i < act.actionIndizes[2].length; i++) {
                    gates[act.actionIndizes[2][i]].alterPosition(act.actionIndizes[0], act.actionIndizes[1]);
                }

                for (let i = 0; i < act.actionIndizes[3].length; i++) {
                    inputs[act.actionIndizes[3][i]].alterPosition(act.actionIndizes[0], act.actionIndizes[1]);
                }

                for (let i = 0; i < act.actionIndizes[4].length; i++) {
                    outputs[act.actionIndizes[4][i]].alterPosition(act.actionIndizes[0], act.actionIndizes[1]);
                }

                for (let i = 0; i < act.actionIndizes[5].length; i++) {
                    labels[act.actionIndizes[5][i]].alterPosition(act.actionIndizes[0], act.actionIndizes[1]);
                }

                for (let i = 0; i < act.actionIndizes[6].length; i++) {
                    segDisplays[act.actionIndizes[6][i]].alterPosition(act.actionIndizes[0], act.actionIndizes[1]);
                }

                for (let i = 0; i < act.actionIndizes[7].length; i++) {
                    customs[act.actionIndizes[7][i]].alterPosition(act.actionIndizes[0], act.actionIndizes[1]);
                }

                actionUndo.push(act);
                break;
            case 'delSel':
                conpoints = _.cloneDeep(act.actionObject[2]);
                diodes = _.cloneDeep(act.actionObject[4]);

                for (let i = 0; i < act.actionObject[0].length; i++) {
                    if (act.actionObject[0][i][0] === 'wire') {
                        wires.splice(act.actionObject[0][i][1], 1);
                    }
                    if (act.actionObject[0][i][0] === 'gate') {
                        gates.splice(act.actionObject[0][i][1], 1);
                    }
                    if (act.actionObject[0][i][0] === 'input') {
                        inputs.splice(act.actionObject[0][i][1], 1);
                    }
                    if (act.actionObject[0][i][0] === 'output') {
                        outputs.splice(act.actionObject[0][i][1], 1);
                    }
                    if (act.actionObject[0][i][0] === 'label') {
                        labels.splice(act.actionObject[0][i][1], 1);
                    }
                    if (act.actionObject[0][i][0] === 'segDisplay') {
                        segDisplays.splice(act.actionObject[0][i][1], 1);
                    }
                    if (act.actionObject[0][i][0] === 'custom') {
                        customs[act.actionObject[0][i][1]].visible = false;
                    }
                }
                actionUndo.push(act);
                break;
            case 'addWire':
                conpoints = _.cloneDeep(act.actionObject[2]);
                for (let i = 0; i < act.actionObject[0].length; i++) {
                    if (act.actionObject[0][i][0] === 'a') {
                        wires.splice(act.actionObject[0][i][1], 0, _.cloneDeep(act.actionObject[0][i][2]));
                    } else if (act.actionObject[0][i][0] === 'd') {
                        wires.splice(act.actionObject[0][i][1], 1);
                    } else if (act.actionObject[0][i][0] === 'r') {
                        wires.splice(act.actionObject[0][i][1], 1, _.cloneDeep(act.actionObject[0][i][3]));
                    }
                }
                actionUndo.push(act);
                break;
            case 'delWire':
                conpoints = _.cloneDeep(act.actionObject[2]);
                for (let i = 0; i < act.actionObject[0].length; i++) {
                    if (act.actionObject[0][i][0] === 'a') {
                        console.log('redoing add');
                        wires.splice(act.actionObject[0][i][1], 0, _.cloneDeep(act.actionObject[0][i][2]));
                    } else if (act.actionObject[0][i][0] === 'd') {
                        console.log('redoing delete');
                        wires.splice(act.actionObject[0][i][1], 1);
                    }
                }
                for (let i = act.actionIndizes[0].length - 1; i >= 0; i--) {
                    diodes.splice(act.actionIndizes[0][i], 1);
                }
                actionUndo.push(act);
                break;
            default:
                break;
        }
    }
    updateUndoButtons();
    reDraw();
}

function pushUndoAction(type, indizes, objects) {
    actionUndo.push(new Action(_.cloneDeep(type), _.cloneDeep(indizes), _.cloneDeep(objects)));
    actionRedo = [];
    if (actionUndo.length > HIST_LENGTH) {
        actionUndo.splice(0, 1);
    }
    updateUndoButtons();
}