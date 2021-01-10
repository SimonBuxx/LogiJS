// File: undoredo.js

function undo() {
    let act = actionUndo.pop();
    console.log(act);
    if (act !== null) {
        switch (act.actionType) {
            case 'addGate':
                gates.splice(act.actionIndizes[0], 1);
                actionRedo.push(act);
                break;
            case 'addCust':
                let dep_ids = customs[act.actionIndizes[0]].getDependencyIDs();
                let indices_to_remove = [];
                for (let i = customs.length - 1; i >= 0; i--) {
                    if (dep_ids.includes(customs[i].id)) {
                        indices_to_remove.push(i);
                    }
                }
                indices_to_remove.sort((a, b) => b - a); // sort descending
                for (let i = 0; i < indices_to_remove.length; i++) {
                    customs.splice(indices_to_remove[i]);
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
                actionRedo.push(act);
                if (act.actionIndizes[9]) { // Undo pasting if the move action was done after pasting
                    undo();
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
            case 'pasteSel':
                //console.log('Undoing pasteSel');
                // TODO: remove inserted elements and delete custom references

                for (let i = act.actionIndizes[0] - 1; i >= 0; i--) {
                    customs.pop();
                }

                for (let i = act.actionObject[0].length - 1; i >= 0; i--) {
                    switch (act.actionObject[0][i].id.charAt(0)) {
                        case 'w':
                            wires.pop();
                            break;
                        case 'd':
                            diodes.pop();
                            break;
                        case 'g':
                            gates.pop();
                            break;
                        case 'i':
                            inputs.pop();
                            break;
                        case 'o':
                            outputs.pop();
                            break;
                        case 'l':
                            labels.pop();
                            break;
                        case 's':
                            segDisplays.pop();
                            break;
                        case 'c':
                            customs.pop();
                            break;
                        case 'p':
                            conpoints.pop();
                            break;
                        default:
                            console.error('An error occured while pasting');
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
                let dep_ids = customs[act.actionIndizes[0]].getDependencyIDs();
                let indices_to_remove = [];
                for (let i = customs.length - 1; i >= 0; i--) {
                    if (dep_ids.includes(customs[i].id)) {
                        indices_to_remove.push(i);
                    }
                }
                indices_to_remove.sort((a, b) => b - a); // sort descending
                for (let i = 0; i < indices_to_remove.length; i++) {
                    customs.splice(indices_to_remove[i]);
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
            case 'pasteSel':
                let newCustoms = 0;

                for (let i = act.actionObject[0].length - 1; i >= 0; i--) {
                    //console.log(act.actionObject[0][i].id);
                    switch (act.actionObject[0][i].id.charAt(0)) {
                        case 'w':
                            wires.push(_.cloneDeep(act.actionObject[0][i]));
                            break;
                        case 'd':
                            diodes.push(_.cloneDeep(act.actionObject[0][i]));
                            break;
                        case 'g':
                            gates.push(_.cloneDeep(act.actionObject[0][i]));
                            break;
                        case 'i':
                            inputs.push(_.cloneDeep(act.actionObject[0][i]));
                            break;
                        case 'o':
                            outputs.push(_.cloneDeep(act.actionObject[0][i]));
                            break;
                        case 'l':
                            labels.push(_.cloneDeep(act.actionObject[0][i]));
                            break;
                        case 's':
                            segDisplays.push(_.cloneDeep(act.actionObject[0][i]));
                            break;
                        case 'c':
                            customs.push(_.cloneDeep(act.actionObject[0][i]));
                            newCustoms++;
                            break;
                        case 'p':
                            conpoints.push(_.cloneDeep(act.actionObject[0][i]));
                            break;
                        default:
                            console.error('An error occured while pasting');
                    }
                }

                let head = customs.length;

                if (newCustoms > 0) {
                    for (i = newCustoms; i > 0; i--) { // For every newly created custom
                        loadCustomFile(customs[head - i].filename, head - i, head - i); // Load the custom's dependencies
                        customs[head - i].parsed = false;
                    }
                }
                unmarkAll();
                actionUndo.push(act);
                redo();
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
                        wires.splice(act.actionObject[0][i][1], 0, _.cloneDeep(act.actionObject[0][i][2]));
                    } else if (act.actionObject[0][i][0] === 'd') {
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
    //console.log(type);
    actionUndo.push(new Action(_.cloneDeep(type), _.cloneDeep(indizes), _.cloneDeep(objects)));
    actionRedo = [];
    if (actionUndo.length > HIST_LENGTH) {
        actionUndo.splice(0, 1);
    }
    updateUndoButtons();
}