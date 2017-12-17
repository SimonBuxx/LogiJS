// File: undoredo.js

function undo() {
    var act = actionUndo.pop();
    if (act != null) {
        switch (act.actionType) {
            case 'addGate':
                gates.pop();
                actionRedo.push(act);
                break;
            case 'addCust':
                for (var i = customs.length - 1; i >= 0; i--) {
                    if (customs[i].visible) {
                        customs.splice(i);
                        break;
                    }
                }
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
            case 'addDi':
                actionRedo.push(act);
                diodes.pop();
                doConpoints();
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
            case 'delGate':
                gates.push(act.actionObject[0]);
                actionRedo.push(act);
                break;
            case 'delCust':
                customs.push(act.actionObject[0]);
                for (var i = 0; i < act.actionObject[0].responsibles.length; i++) {
                    customs.push(act.actionObject[0].responsibles[i]);
                }
                actionRedo.push(act);
                break;
            case 'delOut':
                outputs.push(act.actionObject[0]);
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
            case 'reWire':
                actionRedo.push(new Action('reWire', 0, [segments.slice(0), conpoints.slice(0)]));
                conpoints = act.actionObject[1];
                segments = act.actionObject[0].slice(0);
                doConpoints();
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
    var act = actionRedo.pop();
    if (act != null) {
        switch (act.actionType) {
            case 'addGate':
                gates.push(act.actionObject);
                actionUndo.push(act);
                break;
            case 'addCust':
                customs.push(act.actionObject);
                loadCustomFile(customs[customs.length - 1].filename, customs.length - 1);
                for (var i = 0; i < act.actionObject.responsibles.length; i++) {
                    customs.push(act.actionObject.responsibles[i]);
                }
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
            case 'addDi':
                diodes.push(act.actionObject);
                actionUndo.push(act);
                doConpoints();
                break;
            case 'delGate':
                gates.pop();
                actionUndo.push(act);
                break;
            case 'delCust':
                for (var i = customs.length - 1; i >= 0; i--) {
                    if (customs[i].visible) {
                        customs.splice(i);
                        break;
                    }
                }
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
            case 'delDi':
                diodes.pop();
                actionUndo.push(act[0]);
                doConpoints();
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
            case 'reWire':
                actionUndo.push(new Action('reWire', 0, [segments.slice(0), conpoints.slice(0)]));
                segments = act.actionObject[0].slice(0);
                doConpoints();
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
    //redoButton.elt.disabled = (actionRedo.length === 0);
    //undoButton.elt.disabled = (actionUndo.length === 0);
}