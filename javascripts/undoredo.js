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
                let toDelete = -1;
                for (let i = customs.length - 1; i >= 0; i--) {
                    if (customs[i].visible) {
                        toDelete = i;
                        break;
                    }
                }
                for (let i = customs.length - 1; i >= 0; i--) {
                    if (customs[i].pid === customs[toDelete].id) {
                        customs.splice(i, 1);
                    }
                }
                customs.splice(toDelete, 1);
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
                setLoading(true);
                customs[act.actionObject[1]].parsed = false;
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
            case 'moveSel':
                ctrlMode = "select";
                showSClickBox = false;
                selection = _.cloneDeep(act.actionObject);
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
                diodes = _.cloneDeep(act.actionObject[2]);
                conpoints = _.cloneDeep(act.actionObject[8]);
                /*for (let i = 0; i < act.actionObject[9][0].length; i++) {
                    segments.splice(act.actionObject[9][1][i], 0, act.actionObject[9][0][i]);
                }*/
                doConpoints();
                actionRedo.push(act);
                break;
            case 'reWire':
                actionRedo.push(new Action('reWire', 0, [_.cloneDeep(segments), _.cloneDeep(wires), _.cloneDeep(conpoints)]));
                conpoints = _.cloneDeep(act.actionObject[2]);
                wires = _.cloneDeep(act.actionObject[1]);
                segments = _.cloneDeep(act.actionObject[0]);
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
                gates.push(act.actionObject);
                actionUndo.push(act);
                break;
            case 'addCust':
                customs.push(act.actionObject);
                setLoading(true);
                customs[customs.length - 1].parsed = false;
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
                showSClickBox = false;
                selection = _.cloneDeep(act.actionObject);
                moveSelection(act.actionIndizes[0], act.actionIndizes[1]);
                finishSelection();
                ctrlMode = "none";
                selection = [];
                unmarkAll();
                actionUndo.push(act);
                break;
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
                diodes = act.actionObject[2].slice(0);
                conpoints = act.actionObject[8].slice(0);
                /*for (let i = 0; i < act.actionObject[9][0].length; i++) {
                    segments.splice(act.actionObject[9][1][i], 0, act.actionObject[9][0][i]);
                }*/
                doConpoints();
                actionUndo.push(act);
                break;
            case 'reWire':
                actionUndo.push(new Action('reWire', 0, [_.cloneDeep(segments), _.cloneDeep(wires), _.cloneDeep(conpoints)]));
                wires = _.cloneDeep(act.actionObject[1]);
                conpoints = _.cloneDeep(act.actionObject[2]);
                segments = _.cloneDeep(act.actionObject[0]);
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