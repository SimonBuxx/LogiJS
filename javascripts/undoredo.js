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
            case 'delLabel':
                labels.push(act.actionObject[0]);
                actionRedo.push(act);
                break;
            case 'moveSel':
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
                /*for (let i = 0; i < act.actionObject[1][0].length; i++) {
                    customs.splice(act.actionObject[1][1][i], 0, act.actionObject[1][0][i]);
                    loadCustomFile(act.actionObject[1][0][i].filename, act.actionObject[1][1][i]);
                    /*for (let i = 0; i < act.actionObject[0].responsibles.length; i++) {
                        customs.push(act.actionObject[0].responsibles[i]);
                    }
                }*/
                actionRedo.push(act);
                break;
            case 'reWire':
                actionRedo.push(new Action('reWire', 0, [segments.slice(0), conpoints.slice(0)]));
                conpoints = act.actionObject[1].slice(0);
                segments = act.actionObject[0].slice(0);
                doConpoints();
                findLines();
                break;
			case 'multiple':
				
				for(let i = act.actionObject[0] - 1; i >= 0; i--){
					undo();
				}
				actionRedo.push(act);
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
                diodes.pop();
                actionUndo.push(act[0]);
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
            case 'delSel':
                for (let i = act.actionObject[0][1].length - 1; i >= 0; i--) {
                    gates.splice(act.actionObject[0][1][i], 1);
                }
                /*let toDelete = null;
                for (let i = act.actionObject[1][1].length - 1; i >= 0; i--) {
                    /*for (let j = 0; j < customs.length; j++) {
                        if (customs[j].visible && (JSON.stringify(customs[j]) === JSON.stringify(act.actionObject[1][0][i]))) {
                            toDelete = customs[j];
                            console.log(j);
                            break;
                        }
                    }
                    toDelete = customs.indexOf(act.actionObject[1][0][i]);
                    console.log(toDelete);
                    console.log(customs[toDelete].responsibles);
                    for (const elem of customs[toDelete].responsibles) {
                        console.log(customs.indexOf(elem));
                        customs.splice(customs.indexOf(elem), 1);
                    }
                    customs.splice(customs.indexOf(act.actionObject[1][0][i]), 1);
                }*/
                actionUndo.push(act);
                break;
            case 'reWire':
                actionUndo.push(new Action('reWire', 0, [segments.slice(0), conpoints.slice(0)]));
                segments = act.actionObject[0].slice(0);
                doConpoints();
                findLines();
                break;
			case 'multiple':
				
				for(let i = act.actionObject[0] - 1; i >= 0; i--){
					redo();
				}
				actionUndo.push(act);
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
}