// File: undoredo.js

function undo() {
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
                gates.splice(act.actionIndizes[0], 0, act.actionObject[0]);
                actionRedo.push(act);
                break;
            case 'delCust':
                customs.splice(act.actionIndizes[0], 0, act.actionObject[0]);
                setLoading(true);
                customs[act.actionIndizes[0]].parsed = false;
                loadCustomFile(customs[act.actionIndizes[0]].filename, act.actionIndizes[0], act.actionIndizes[0]);
                actionRedo.push(act);
                break;
            case 'delOut':
                outputs.splice(act.actionIndizes[0], 0, act.actionObject[0]);
                actionRedo.push(act);
                break;
            case 'delSegDis':
                segDisplays.splice(act.actionIndizes[0], 0, act.actionObject[0]);
                actionRedo.push(act);
                break;
            case 'delIn':
                inputs.splice(act.actionIndizes[0], 0, act.actionObject[0]);
                actionRedo.push(act);
                break;
            case 'delDi':
                diodes.splice(act.actionIndizes[0], 0, act.actionObject[0]);
                actionRedo.push(act);
                break;
            case 'delCp':
                actionRedo.push(act);
                conpoints.splice(act.actionIndizes[0], 0, act.actionObject[0]);
                break;
            case 'delLabel':
                labels.splice(act.actionIndizes[0], 0, act.actionObject[0]);
                actionRedo.push(act);
                break;
            case 'swiDi':
                diodes.splice(act.actionIndizes[0], 0, act.actionObject[0][0]);
                conpoints.splice(act.actionIndizes[1], 1);
                actionRedo.push(act);
                break;
            case 'moveSel':
                setControlMode('select');
                selection = _.cloneDeep(act.actionObject[0]);
                conpoints = _.cloneDeep(act.actionObject[1]);
                wires = _.cloneDeep(act.actionObject[2]);
                moveSelection(-act.actionIndizes[0], -act.actionIndizes[1], false);
                finishSelection();
                setControlMode('modify');
                setSelectMode('none');
                actionRedo.push(act);
                break;
            /*
            case 'delSel':
                for (let i = 0; i < act.actionObject[0][0].length; i++) {
                    gates.splice(act.actionObject[0][1][i], 0, act.actionObject[0][0][i]);
                }
                if (act.actionObject[1][0].length >= 1) {
                    setLoading(true);
                }
                for (let i = 0; i < act.actionObject[1][0].length; i++) {
                    customs.splice(act.actionObject[1][1][i], 0, act.actionObject[1][0][i]);
                    customs[act.actionObject[1][1][i]].parsed = false;
                    loadCustomFile(customs[act.actionObject[1][1][i]].filename, act.actionObject[1][1][i], act.actionObject[1][1][i]);
                }
                for (let i = 0; i < act.actionObject[3][0].length; i++) {
                    inputs.splice(act.actionObject[3][1][i], 0, act.actionObject[3][0][i]);
                }
                for (let i = 0; i < act.actionObject[4][0].length; i++) {
                    labels.splice(act.actionObject[4][1][i], 0, act.actionObject[4][0][i]);
                }
                for (let i = 0; i < act.actionObject[5][0].length; i++) {
                    outputs.splice(act.actionObject[5][1][i], 0, act.actionObject[5][0][i]);
                }
                for (let i = 0; i < act.actionObject[7][0].length; i++) {
                    segDisplays.splice(act.actionObject[7][1][i], 0, act.actionObject[7][0][i]);
                }
                /*for (let i = 0; i < act.actionObject[6][0].length; i++) {
                    wires.splice(act.actionObject[6][1][i], 0, act.actionObject[6][0][i]);
                }*/
            //diodes = _.cloneDeep(act.actionObject[2]);
            //conpoints = _.cloneDeep(act.actionObject[8]);
            /*for (let i = 0; i < act.actionObject[9][0].length; i++) {
                segments.splice(act.actionObject[9][1][i], 0, act.actionObject[9][0][i]);
            }*/
            //doConpoints();
            //actionRedo.push(act);
            //break;
            case 'addWire':
                conpoints = act.actionObject[1];
                for (let i = act.actionObject[0].length - 1; i >= 0; i--) {
                    if (act.actionObject[0][i][0] === 'a') {
                        wires.splice(act.actionObject[0][i][1], 1);
                    } else if (act.actionObject[0][i][0] === 'd') {
                        wires.splice(act.actionObject[0][i][1], 0, act.actionObject[0][i][2]);
                    } else if (act.actionObject[0][i][0] === 'r') {
                        wires.splice(act.actionObject[0][i][1], 1, act.actionObject[0][i][2]);
                    } 
                }
                actionRedo.push(act);
                break;
            case 'delWire':
                conpoints = act.actionObject[1];
                for (let i = act.actionObject[0].length - 1; i >= 0; i--) {
                    if (act.actionObject[0][i][0] === 'a') {
                        wires.splice(act.actionObject[0][i][1], 1);
                    } else if (act.actionObject[0][i][0] === 'd') {
                        wires.splice(act.actionObject[0][i][1], 0, act.actionObject[0][i][2]);
                    }
                }
                for (let i = 0; i < act.actionIndizes[0].length; i++) {
                    diodes.splice(act.actionIndizes[0][i], 0, act.actionObject[3][i][0]);
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
                gates.splice(act.actionIndizes[0], 0, act.actionObject[0]);
                actionUndo.push(act);
                break;
            case 'addCust':
                customs.splice(act.actionIndizes[0], 0, act.actionObject[0]);
                setLoading(true);
                customs[act.actionIndizes[0]].parsed = false;
                loadCustomFile(customs[act.actionIndizes[0]].filename, act.actionIndizes[0], act.actionIndizes[0]);
                actionUndo.push(act);
                break;
            case 'addOut':
                outputs.splice(act.actionIndizes[0], 0, act.actionObject[0]);
                actionUndo.push(act);
                break;
            case 'addIn':
                inputs.splice(act.actionIndizes[0], 0, act.actionObject[0]);
                actionUndo.push(act);
                break;
            case 'addSegDis':
                segDisplays.splice(act.actionIndizes[0], 0, act.actionObject[0]);
                actionUndo.push(act);
                break;
            case 'addDi':
                diodes.splice(act.actionIndizes[0], 0, act.actionObject[0]);
                actionUndo.push(act);
                break;
            case 'addLabel':
                labels.splice(act.actionIndizes[0], 0, act.actionObject[0]);
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
                conpoints.splice(act.actionIndizes[1], 0, act.actionObject[1]);
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
                setControlMode('select');
                selection = _.cloneDeep(act.actionObject[0]);
                conpoints = _.cloneDeep(act.actionObject[1]);
                wires = _.cloneDeep(act.actionObject[2]);
                moveSelection(act.actionIndizes[0], act.actionIndizes[1], true);
                finishSelection();
                setControlMode('modify');
                setSelectMode('none');
                actionUndo.push(act);
                break;
            /*
            case 'delSel': // TODO
                for (let i = act.actionObject[0][0].length - 1; i >= 0; i--) {
                    gates.splice(act.actionObject[0][1][i], 1);
                }
                for (let i = act.actionObject[1][0].length - 1; i >= 0; i--) {
                    let toDelete = act.actionObject[1][0][i];
                    for (let j = customs.length - 1; j >= 0; j--) {
                        if (customs[j].pid === toDelete.id) {
                            customs.splice(j, 1);
                        }
                    }
                    customs.splice(customs.indexOf(toDelete), 1);
                }
                for (let i = act.actionObject[3][0].length - 1; i >= 0; i--) {
                    inputs.splice(act.actionObject[3][1][i], 1);
                }
                for (let i = act.actionObject[4][0].length - 1; i >= 0; i--) {
                    labels.splice(act.actionObject[4][1][i], 1);
                }
                for (let i = act.actionObject[5][0].length - 1; i >= 0; i--) {
                    outputs.splice(act.actionObject[5][1][i], 1);
                }
                for (let i = act.actionObject[7][0].length - 1; i >= 0; i--) {
                    segDisplays.splice(act.actionObject[7][1][i], 1);
                }
                /*for (let i = 0; i < act.actionObject[6][0].length; i++) {
                    wires.splice(act.actionObject[6][1][i], 0, act.actionObject[6][0][i]);
                }*/
            //diodes = act.actionObject[2].slice(0);
            //conpoints = act.actionObject[8].slice(0);
            /*for (let i = 0; i < act.actionObject[9][0].length; i++) {
                segments.splice(act.actionObject[9][1][i], 0, act.actionObject[9][0][i]);
            }*/
            //doConpoints();
            //actionUndo.push(act);
            //break;
            case 'addWire':
                conpoints = act.actionObject[2];
                for (let i = 0; i < act.actionObject[0].length; i++) {
                    if (act.actionObject[0][i][0] === 'a') {
                        wires.splice(act.actionObject[0][i][1], 0, act.actionObject[0][i][2]);
                    } else if (act.actionObject[0][i][0] === 'd') {
                        wires.splice(act.actionObject[0][i][1], 1);
                    } else if (act.actionObject[0][i][0] === 'r') {
                        wires.splice(act.actionObject[0][i][1], 1, act.actionObject[0][i][3]);
                    } 
                }
                actionUndo.push(act);
                break;
            case 'delWire':
                conpoints = act.actionObject[2];
                for (let i = 0; i < act.actionObject[0].length; i++) {
                    if (act.actionObject[0][i][0] === 'a') {
                        console.log('redoing add');
                        wires.splice(act.actionObject[0][i][1], 0, act.actionObject[0][i][2]);
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

function pushUndoAction(type, indizees, objects) {
    actionUndo.push(new Action(type, indizees, objects));
    actionRedo.pop();
    if (actionUndo.length > HIST_LENGTH) {
        actionUndo.splice(0, 1);
    }
    updateUndoButtons();
}