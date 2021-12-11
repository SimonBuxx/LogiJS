// File: loadsave.js

function buildJSON() {
    // Create a new json object to store all elements in
    let json = {};
    json.caption = moduleNameInput.value;
    json.gates = [];
    json.outputs = [];
    json.inputs = [];
    json.wires = [];
    json.busses = [];
    json.conpoints = [];
    json.diodes = [];
    json.customs = [];
    json.labels = [];
    json.segDisplays = [];
    json.busWrappers = [];
    json.busUnwrappers = [];
    json.busInputs = [];
    json.decoders = [];

    // Trim gaps in the input order
    let trimmedInputs, trimmedBusInputs;
    [trimmedInputs, trimmedBusInputs] = trimInputOrder();

    for (let i = 0; i < gates.length; i++) {
        json.gates.push(gates[i].getData());
    }
    for (let i = 0; i < outputs.length; i++) {
        json.outputs.push(outputs[i].getData());
    }
    for (let i = 0; i < inputs.length; i++) {
        json.inputs.push(trimmedInputs[i].getData());
    }
    for (let i = 0; i < wires.length; i++) {
        json.wires.push(wires[i].getData());
    }
    for (let i = 0; i < busses.length; i++) {
        json.busses.push(busses[i].getData());
    }
    for (let i = 0; i < conpoints.length; i++) {
        json.conpoints.push(conpoints[i].getData());
    }
    for (let i = 0; i < diodes.length; i++) {
        json.diodes.push(diodes[i].getData());
    }
    for (let i = 0; i < labels.length; i++) {
        json.labels.push(labels[i].getData());
    }
    for (let i = 0; i < segDisplays.length; i++) {
        json.segDisplays.push(segDisplays[i].getData());
    }
    for (let i = 0; i < busWrappers.length; i++) {
        json.busWrappers.push(busWrappers[i].getData());
    }
    for (let i = 0; i < busUnwrappers.length; i++) {
        json.busUnwrappers.push(busUnwrappers[i].getData());
    }
    for (let i = 0; i < busInputs.length; i++) {
        json.busInputs.push(trimmedBusInputs[i].getData());
    }
    for (let i = 0; i < decoders.length; i++) {
        json.decoders.push(decoders[i].getData());
    }
    for (let i = 0; i < customs.length; i++) {
        if (customs[i].visible) {
            json.customs.push(customs[i].getData());
        }
    }
    return json;
}

function saveSketch(filename, callback) {
    let json = buildJSON();
    sketchNameInput.value = filename.split('.')[0];
    topSketchInput.value = filename.split('.')[0];
    socket.emit('saveUserSketch', { file: filename, json: json, access_token: getCookieValue('access_token') });
    callback(getLookData(json));
}

function downloadSketch() {
    let filename = sketchNameInput.value;
    if (filename === '') {
        filename = 'untitled';
    }
    let json = buildJSON();
    saveJSON(json, filename + '.json'); // Save the file as json (asks for directory...)
    enterModifierMode();
    document.title = 'LogiJS: ' + filename;
}

function loadSketch(file) {
    nextCustomToLoadIndex = 0;
    customsToLoadQueue = [];
    loading = true;
    loadFile = file;
    document.title = 'LogiJS: ' + loadFile.split('.')[0];
    showMessage('Loading Sketch<span style="color: #c83232">.</span>', loadFile.split('.json')[0]);
    loadJSON('sketches/' + file, load, function () {
        socket.emit('getUserSketch', { file: file.split('.')[0], access_token: getCookieValue('access_token') });
        socket.on('userSketchData', (data) => {
            if (data.success === true) {
                load(data.data);
            } else {
                fileNotFoundError();
            }
            socket.off('userSketchData');
        });
    });
}

function loadFromLink(file) {
    nextCustomToLoadIndex = 0;
    customsToLoadQueue = [];
    loading = true;
    loadFile = file;
    showMessage('Loading Sketch<span style="color: #c83232">.</span>', loadFile.split('.json')[0]);
    loadJSON('sharedSketches/' + file, load, function () {
        fileNotFoundError();
    });
}

function loadSketchFromJSON(data, file) {
    nextCustomToLoadIndex = 0;
    customsToLoadQueue = [];
    setLoading(true);
    loadFile = file;
    document.title = 'LogiJS: ' + file;
    showMessage('Loading Sketch<span style="color: #c83232">.</span>', loadFile.split('.json')[0]);
    load(data);
}

function fileNotFoundError() {
    // Change the site's title to the error message
    document.title = 'LogiJS: Sketch not found';
    screenshotButton.disabled = true;
    mainCanvas.elt.classList.add('dark-canvas');
    showMessage('Sketch not found<span style="color: #c83232">.</span>', 'Couldn\'t find this sketch in any location<span style="color: #c83232">.</span>', false);
}

function load(loadData) {
    gates = []; // Reset all elements and the view before loading
    outputs = [];
    inputs = [];
    wires = [];
    busses = [];
    conpoints = [];
    customs = [];
    diodes = [];
    labels = [];
    segDisplays = [];
    busWrappers = [];
    busUnwrappers = [];
    busInputs = [];
    decoders = [];
    transform = new Transformation(0, 0, 1);
    currentGridSize = GRIDSIZE;
    actionUndo = []; // Clear Undo / Redo stacks
    actionRedo = [];
    moduleNameInput.value = loadData.caption;
    // Load all gate parameters and create new gates based on that information
    for (let i = 0; i < loadData.gates.length; i++) {
        gates[i] = new LogicGate(JSON.parse(loadData.gates[i].x), JSON.parse(loadData.gates[i].y), JSON.parse(loadData.gates[i].direction),
            JSON.parse(loadData.gates[i].inputCount), JSON.parse(loadData.gates[i].outputCount), JSON.parse(loadData.gates[i].logicFunction));
        gates[i].setInvertions(JSON.parse(loadData.gates[i].inputsInv), JSON.parse(loadData.gates[i].outputsInv));
        gates[i].setCoordinates(JSON.parse(loadData.gates[i].x) / transform.zoom - transform.dx, JSON.parse(loadData.gates[i].y) / transform.zoom - transform.dy); // Unnötig?
        gates[i].updateClickBoxes(); // Unnötig?
    }
    for (let i = 0; i < loadData.outputs.length; i++) {
        outputs[i] = new Output(JSON.parse(loadData.outputs[i].x), JSON.parse(loadData.outputs[i].y), JSON.parse(loadData.outputs[i].colr));
        if (loadData.outputs[i].hasOwnProperty("lbl")) {
            outputs[i].lbl = loadData.outputs[i].lbl;
        }
        outputs[i].setCoordinates(JSON.parse(loadData.outputs[i].x) / transform.zoom - transform.dx, JSON.parse(loadData.outputs[i].y) / transform.zoom - transform.dy);
        outputs[i].updateClickBox();
    }
    for (let i = 0; i < loadData.inputs.length; i++) {
        if (loadData.inputs[i].hasOwnProperty("pos")) {
            inputs[i] = new Input(JSON.parse(loadData.inputs[i].x), JSON.parse(loadData.inputs[i].y), JSON.parse(loadData.inputs[i].pos));
        } else {
            inputs[i] = new Input(JSON.parse(loadData.inputs[i].x), JSON.parse(loadData.inputs[i].y), ++inCustPosBound);
        }
        inputs[i].setClock(loadData.inputs[i].clock === "true");
        inputs[i].framecount = parseInt(loadData.inputs[i].framecount);
        if (loadData.inputs[i].hasOwnProperty("istop")) {
            inputs[i].isTop = true;
        }
        if (loadData.inputs[i].hasOwnProperty("speed")) {
            inputs[i].speed = JSON.parse(loadData.inputs[i].speed);
        }
        if (loadData.inputs[i].hasOwnProperty("lbl")) {
            inputs[i].lbl = loadData.inputs[i].lbl;
        }
        inputs[i].setCoordinates(JSON.parse(loadData.inputs[i].x) / transform.zoom - transform.dx, JSON.parse(loadData.inputs[i].y) / transform.zoom - transform.dy);
        inputs[i].updateClickBox();
    }
    if (loadData.hasOwnProperty("wires")) {
        for (let i = 0; i < loadData.wires.length; i++) {
            if (loadData.wires[i].hasOwnProperty("y2")) {
                let w = new Wire(1, parseInt(loadData.wires[i].x1), parseInt(loadData.wires[i].y1));
                w.endX = parseInt(loadData.wires[i].x1);
                w.endY = parseInt(loadData.wires[i].y2);
                wires.push(w);
            }
            if (loadData.wires[i].hasOwnProperty("x2")) {
                let w = new Wire(0, parseInt(loadData.wires[i].x1), parseInt(loadData.wires[i].y1));
                w.endX = parseInt(loadData.wires[i].x2);
                w.endY = parseInt(loadData.wires[i].y1);
                wires.push(w);
            }
        }
    }
    if (loadData.hasOwnProperty("busses")) {
        for (let i = 0; i < loadData.busses.length; i++) {
            if (loadData.busses[i].hasOwnProperty("y2")) {
                let w = new Bus(1, parseInt(loadData.busses[i].x1), parseInt(loadData.busses[i].y1));
                w.endX = parseInt(loadData.busses[i].x1);
                w.endY = parseInt(loadData.busses[i].y2);
                busses.push(w);
            }
            if (loadData.busses[i].hasOwnProperty("x2")) {
                let w = new Bus(0, parseInt(loadData.busses[i].x1), parseInt(loadData.busses[i].y1));
                w.endX = parseInt(loadData.busses[i].x2);
                w.endY = parseInt(loadData.busses[i].y1);
                busses.push(w);
            }
        }
    }
    for (let i = 0; i < loadData.conpoints.length; i++) {
        conpoints[i] = new ConPoint(JSON.parse(loadData.conpoints[i].x), JSON.parse(loadData.conpoints[i].y), false, -1);
    }
    deleteInvalidConpoints();
    for (let i = 0; i < loadData.diodes.length; i++) {
        diodes[i] = new Diode(JSON.parse(loadData.diodes[i].x), JSON.parse(loadData.diodes[i].y), false);
    }
    if (loadData.hasOwnProperty("labels")) {
        for (let i = 0; i < loadData.labels.length; i++) {
            labels[i] = new Label(JSON.parse(loadData.labels[i].x), JSON.parse(loadData.labels[i].y), loadData.labels[i].txt);
        }
    }
    if (loadData.hasOwnProperty("segDisplays")) {
        for (let i = 0; i < loadData.segDisplays.length; i++) {
            if (loadData.segDisplays[i].hasOwnProperty("busversion")) {
                segDisplays[i] = new SegmentDisplay(JSON.parse(loadData.segDisplays[i].x), JSON.parse(loadData.segDisplays[i].y), JSON.parse(loadData.segDisplays[i].inputCount), JSON.parse(loadData.segDisplays[i].busversion));
                if (loadData.segDisplays[i].hasOwnProperty("inputsInv")) {
                    segDisplays[i].setInvertions(JSON.parse(loadData.segDisplays[i].inputsInv)); // Set input invertions
                }
            } else {
                segDisplays[i] = new SegmentDisplay(JSON.parse(loadData.segDisplays[i].x), JSON.parse(loadData.segDisplays[i].y), JSON.parse(loadData.segDisplays[i].inputCount), false);
                segDisplays[i].setInvertions(JSON.parse(loadData.segDisplays[i].inputsInv)); // Set input invertions
            }
        }
    }
    if (loadData.hasOwnProperty("busWrappers")) {
        for (let i = 0; i < loadData.busWrappers.length; i++) {
            busWrappers[i] = new BusWrapper(JSON.parse(loadData.busWrappers[i].x), JSON.parse(loadData.busWrappers[i].y),
                JSON.parse(loadData.busWrappers[i].direction), JSON.parse(loadData.busWrappers[i].inputCount));
            busWrappers[i].setInvertions(JSON.parse(loadData.busWrappers[i].inputsInv));
            busWrappers[i].busInverted = JSON.parse(loadData.busWrappers[i].busInverted);
        }
    }
    if (loadData.hasOwnProperty("busUnwrappers")) {
        for (let i = 0; i < loadData.busUnwrappers.length; i++) {
            busUnwrappers[i] = new BusUnwrapper(JSON.parse(loadData.busUnwrappers[i].x), JSON.parse(loadData.busUnwrappers[i].y),
                JSON.parse(loadData.busUnwrappers[i].direction), JSON.parse(loadData.busUnwrappers[i].outputCount));
            busUnwrappers[i].setInvertions(JSON.parse(loadData.busUnwrappers[i].outputsInv));
            busUnwrappers[i].busInverted = JSON.parse(loadData.busUnwrappers[i].busInverted);
        }
    }
    if (loadData.hasOwnProperty("busInputs")) {
        for (let i = 0; i < loadData.busInputs.length; i++) {
            if (loadData.busInputs[i].hasOwnProperty("pos")) {
                busInputs[i] = new BusInput(JSON.parse(loadData.busInputs[i].x), JSON.parse(loadData.busInputs[i].y),
                    JSON.parse(loadData.busInputs[i].busWidth), JSON.parse(loadData.busInputs[i].pos));
            } else {
                busInputs[i] = new BusInput(JSON.parse(loadData.busInputs[i].x), JSON.parse(loadData.busInputs[i].y),
                    JSON.parse(loadData.busInputs[i].busWidth), ++inCustPosBound);
            }
            if (loadData.busInputs[i].hasOwnProperty("istop")) {
                busInputs[i].isTop = true;
            }
            if (loadData.busInputs[i].hasOwnProperty("lbl")) {
                busInputs[i].lbl = loadData.busInputs[i].lbl;
            }
            busInputs[i].setCoordinates(JSON.parse(loadData.busInputs[i].x) / transform.zoom - transform.dx, JSON.parse(loadData.busInputs[i].y) / transform.zoom - transform.dy);
            busInputs[i].updateClickBox();
        }
    }
    if (loadData.hasOwnProperty("decoders")) {
        for (let i = 0; i < loadData.decoders.length; i++) {
            decoders[i] = new Decoder(JSON.parse(loadData.decoders[i].x), JSON.parse(loadData.decoders[i].y),
                JSON.parse(loadData.decoders[i].direction), JSON.parse(loadData.decoders[i].inputCount),
                JSON.parse(loadData.decoders[i].useInputBus), JSON.parse(loadData.decoders[i].useOutputBus)),
                decoders[i].setInvertions(JSON.parse(loadData.decoders[i].inputsInv), JSON.parse(loadData.decoders[i].outputsInv));
            decoders[i].inBusInverted = JSON.parse(loadData.decoders[i].inBusInverted);
            decoders[i].outBusInverted = JSON.parse(loadData.decoders[i].inBusInverted);
        }
    }
    for (let i = 0; i < loadData.customs.length; i++) {
        customs[i] = new CustomSketch(JSON.parse(loadData.customs[i].x), JSON.parse(loadData.customs[i].y), JSON.parse(loadData.customs[i].direction), JSON.parse(loadData.customs[i].filename));
        customs[i].setInvertions(JSON.parse(loadData.customs[i].inputsInv), JSON.parse(loadData.customs[i].outputsInv));
        customs[i].setCoordinates(JSON.parse(loadData.customs[i].x) / transform.zoom - transform.dx, JSON.parse(loadData.customs[i].y) / transform.zoom - transform.dy);
    }

    inCustPosBound = inputs.length + busInputs.length - 1;

    loadCustomSketches(); // Load all custom sketches from file
    reDraw();
}

/*
    Loads the sketch with filename file into custom object # num
*/
function loadCustomFile(file, num, hlparent, afterLoadingCallback = function () { }) {
    loadFile = file;
    showMessage('Loading Dependencies<span style="color: #c83232">.</span>', loadFile.split('.json')[0]);
    if (cachedFiles.indexOf(file) >= 0) {
        setTimeout(function () {
            loadCallback(cachedData[cachedFiles.indexOf(file)], num, hlparent, afterLoadingCallback);
        }, 0);
    } else {
        loadJSON('sketches/' + file, function (loadData) {
            if (cachedFiles.indexOf(file) < 0) {
                cachedFiles.push(file);
                cachedData.push(loadData);
            }
            loadCallback(loadData, num, hlparent, afterLoadingCallback);
        }, function () {
            socket.emit('getUserSketch', { file: file.split('.')[0], access_token: getCookieValue('access_token') });
            socket.on('userSketchData', (data) => {
                let loadData = data.data;
                if (data.success === true) {
                    if (cachedFiles.indexOf(file) < 0) {
                        cachedFiles.push(file);
                        cachedData.push(loadData);
                    }
                    loadCallback(loadData, num, hlparent, afterLoadingCallback);
                } else {
                    showMessage('Loading failed<span style="color: #c83232">.</span>', 'Dependency ' + loadFile.split('.json')[0] + ' not found<span style="color: #c83232">.</span>', false);
                }
                socket.off('userSketchData');
            });
        });
    }
}

/*
    Invoked by loadCustomFile when the json is fully loaded
*/
function loadCustom(loadData, num, hlparent) {
    let params = [[], [], [], [], [], [], [], [], [], [], [], []]; // [] x Number of different objects
    for (let i = 0; i < loadData.gates.length; i++) {
        params[GATENUM][i] = new LogicGate(JSON.parse(loadData.gates[i].x), JSON.parse(loadData.gates[i].y), JSON.parse(loadData.gates[i].direction),
            JSON.parse(loadData.gates[i].inputCount), JSON.parse(loadData.gates[i].outputCount), JSON.parse(loadData.gates[i].logicFunction));
        params[GATENUM][i].setInvertions(JSON.parse(loadData.gates[i].inputsInv), JSON.parse(loadData.gates[i].outputsInv));
    }
    for (let i = 0; i < loadData.outputs.length; i++) {
        params[OUTPNUM][i] = new Output(JSON.parse(loadData.outputs[i].x), JSON.parse(loadData.outputs[i].y), JSON.parse(loadData.outputs[i].colr));
        if (loadData.outputs[i].hasOwnProperty("lbl")) {
            params[OUTPNUM][i].lbl = loadData.outputs[i].lbl;
        }
    }
    for (let i = 0; i < loadData.inputs.length; i++) {
        if (loadData.inputs[i].hasOwnProperty("pos")) {
            params[INPNUM][i] = new Input(JSON.parse(loadData.inputs[i].x), JSON.parse(loadData.inputs[i].y), JSON.parse(loadData.inputs[i].pos));
        } else {
            // If there is no custPos defined, use the array position
            // customSketch will then keep the array order when sorting for custPos
            params[INPNUM][i] = new Input(JSON.parse(loadData.inputs[i].x), JSON.parse(loadData.inputs[i].y), i);
        }
        if (loadData.inputs[i].hasOwnProperty("lbl")) {
            params[INPNUM][i].lbl = loadData.inputs[i].lbl;
        }
        params[INPNUM][i].setClock(loadData.inputs[i].clock === 'true');
        params[INPNUM][i].framecount = loadData.inputs[i].framecount;
        if (loadData.inputs[i].hasOwnProperty("istop")) {
            params[INPNUM][i].isTop = true;
        }
        if (loadData.inputs[i].hasOwnProperty("speed")) {
            params[INPNUM][i].speed = JSON.parse(loadData.inputs[i].speed);
        }
    }

    if (loadData.hasOwnProperty("wires")) {
        for (let i = 0; i < loadData.wires.length; i++) {
            if (loadData.wires[i].hasOwnProperty("y2") && JSON.parse(loadData.wires[i].y1) !== JSON.parse(loadData.wires[i].y2)) {
                params[WIRENUM][i] = new Wire(1, JSON.parse(loadData.wires[i].x1), JSON.parse(loadData.wires[i].y1));
                params[WIRENUM][i].endX = JSON.parse(loadData.wires[i].x1);
                params[WIRENUM][i].endY = JSON.parse(loadData.wires[i].y2);
            } else if (loadData.wires[i].hasOwnProperty("x2") && JSON.parse(loadData.wires[i].x1) !== JSON.parse(loadData.wires[i].x2)) {
                params[WIRENUM][i] = new Wire(0, JSON.parse(loadData.wires[i].x1), JSON.parse(loadData.wires[i].y1));
                params[WIRENUM][i].endX = JSON.parse(loadData.wires[i].x2);
                params[WIRENUM][i].endY = JSON.parse(loadData.wires[i].y1);
            }
        }
    } else {
        console.log('The file you are trying to load was built with an old version of LogiJS (pre-01/2018)!');
    }

    if (loadData.hasOwnProperty("busses")) {
        for (let i = 0; i < loadData.busses.length; i++) {
            if (loadData.busses[i].hasOwnProperty("y2") && JSON.parse(loadData.busses[i].y1) !== JSON.parse(loadData.busses[i].y2)) {
                params[BUSNUM][i] = new Bus(1, JSON.parse(loadData.busses[i].x1), JSON.parse(loadData.busses[i].y1));
                params[BUSNUM][i].endX = JSON.parse(loadData.busses[i].x1);
                params[BUSNUM][i].endY = JSON.parse(loadData.busses[i].y2);
            } else if (loadData.busses[i].hasOwnProperty("x2") && JSON.parse(loadData.busses[i].x1) !== JSON.parse(loadData.busses[i].x2)) {
                params[BUSNUM][i] = new Bus(0, JSON.parse(loadData.busses[i].x1), JSON.parse(loadData.busses[i].y1));
                params[BUSNUM][i].endX = JSON.parse(loadData.busses[i].x2);
                params[BUSNUM][i].endY = JSON.parse(loadData.busses[i].y1);
            }
        }
    } else {
        params[BUSNUM] = [];
    }

    if (loadData.hasOwnProperty("busInputs")) {
        for (let i = 0; i < loadData.busInputs.length; i++) {
            if (loadData.busInputs[i].hasOwnProperty("pos")) {
                params[BUSINNUM][i] = new BusInput(JSON.parse(loadData.busInputs[i].x), JSON.parse(loadData.busInputs[i].y),
                    JSON.parse(loadData.busInputs[i].busWidth), JSON.parse(loadData.busInputs[i].pos));
            } else {
                params[BUSINNUM][i] = new BusInput(JSON.parse(loadData.busInputs[i].x), JSON.parse(loadData.busInputs[i].y),
                    JSON.parse(loadData.busInputs[i].busWidth), i);
            }
            if (loadData.busInputs[i].hasOwnProperty("lbl")) {
                params[BUSINNUM][i].lbl = loadData.busInputs[i].lbl;
            }
            /*if (loadData.busInputs[i].hasOwnProperty("pos")) {
                params[BUSINNUM][i].custPosition = loadData.busInputs[i].pos;
            }*/
            if (loadData.busInputs[i].hasOwnProperty("istop")) {
                params[BUSINNUM][i].isTop = true;
            }
        }
    }

    if (loadData.hasOwnProperty("busUnwrappers")) {
        for (let i = 0; i < loadData.busUnwrappers.length; i++) {
            params[UNWRAPNUM][i] = new BusUnwrapper(JSON.parse(loadData.busUnwrappers[i].x), JSON.parse(loadData.busUnwrappers[i].y),
                JSON.parse(loadData.busUnwrappers[i].direction), JSON.parse(loadData.busUnwrappers[i].outputCount));
            params[UNWRAPNUM][i].setInvertions(JSON.parse(loadData.busUnwrappers[i].outputsInv));
            params[UNWRAPNUM][i].busInverted = JSON.parse(loadData.busUnwrappers[i].busInverted);
        }
    }

    if (loadData.hasOwnProperty("busWrappers")) {
        for (let i = 0; i < loadData.busWrappers.length; i++) {
            params[WRAPNUM][i] = new BusWrapper(JSON.parse(loadData.busWrappers[i].x), JSON.parse(loadData.busWrappers[i].y),
                JSON.parse(loadData.busWrappers[i].direction), JSON.parse(loadData.busWrappers[i].inputCount));
            params[WRAPNUM][i].setInvertions(JSON.parse(loadData.busWrappers[i].inputsInv));
            params[WRAPNUM][i].busInverted = JSON.parse(loadData.busWrappers[i].busInverted);
        }
    }

    for (let i = 0; i < loadData.conpoints.length; i++) {
        params[CPNUM][i] = new ConPoint(JSON.parse(loadData.conpoints[i].x), JSON.parse(loadData.conpoints[i].y), false, -1);
    }
    for (let i = 0; i < loadData.diodes.length; i++) {
        params[DINUM][i] = new Diode(JSON.parse(loadData.diodes[i].x), JSON.parse(loadData.diodes[i].y), false);
    }
    for (let i = 0; i < loadData.customs.length; i++) {
        customs.push(new CustomSketch(JSON.parse(loadData.customs[i].x), JSON.parse(loadData.customs[i].y), JSON.parse(loadData.customs[i].direction), JSON.parse(loadData.customs[i].filename)));
        customs[customs.length - 1].setInvertions(JSON.parse(loadData.customs[i].inputsInv), JSON.parse(loadData.customs[i].outputsInv));
        customs[customs.length - 1].visible = false;
        customs[customs.length - 1].setParentID(customs[hlparent].id);
        customs[num].responsibles.push(customs[customs.length - 1]);
        customsToLoadQueue.push([customs[customs.length - 1].filename, (customs.length - 1), num]);
        params[CUSTNUM][i] = customs[customs.length - 1];
    }

    if (loadData.hasOwnProperty("decoders")) {
        for (let i = 0; i < loadData.decoders.length; i++) {
            params[DECNUM][i] = new Decoder(JSON.parse(loadData.decoders[i].x), JSON.parse(loadData.decoders[i].y), JSON.parse(loadData.decoders[i].direction),
                JSON.parse(loadData.decoders[i].inputCount), JSON.parse(loadData.decoders[i].useInputBus), JSON.parse(loadData.decoders[i].useOutputBus));
            params[DECNUM][i].setInvertions(JSON.parse(loadData.decoders[i].inputsInv), JSON.parse(loadData.decoders[i].outputsInv));
            params[DECNUM][i].inBusInverted = JSON.parse(loadData.decoders[i].inBusInverted);
            params[DECNUM][i].outBusInverted = JSON.parse(loadData.decoders[i].inBusInverted);
        }
    }

    customs[num].setSketchParams(params);
    customs[num].setCaption(loadData.caption);

    reDraw();
}

/*
    Loads the sketches of all customs (visible and invisible)
*/
function loadCustomSketches() {
    for (let i = 0; i < customs.length; i++) {
        customsToLoadQueue.push([customs[i].filename, i, i]);
    }
    if (customsToLoadQueue.length > 0) {
        loadNext(function () { });
    } else {
        setLoading(false);
        document.getElementById('message-dialog').style.display = 'none';
    }
}

function loadNext(afterLoadingCallback) {
    if (customsToLoadQueue.length <= nextCustomToLoadIndex) {
        setLoading(false);
        document.getElementById('message-dialog').style.display = 'none';
        afterLoadingCallback();
    } else {
        loadCustomFile(customsToLoadQueue[nextCustomToLoadIndex][0], customsToLoadQueue[nextCustomToLoadIndex][1], customsToLoadQueue[nextCustomToLoadIndex][2], afterLoadingCallback);
        nextCustomToLoadIndex++;
    }
}

function loadCallback(loadData, num, hlparent, afterLoadingCallback) {
    loadCustom(loadData, num, hlparent);
    loadNext(afterLoadingCallback);
}

function getLookData(json) {
    let look = {};
    look.tops = [];
    look.inBusWidths = [];
    look.inputLabels = [];
    look.outputLabels = [];
    look.caption = json.caption;
    look.inputs = json.inputs.length + json.busInputs.length;
    look.outputs = json.outputs.length;

    for (let i = 0; i < look.inputs; i++) {
        for (let j = 0; j < json.inputs.length; j++) {
            if (json.inputs[j].pos === i) {
                look.tops.push(json.inputs[j].istop === 'true');
                if (json.inputs[j].hasOwnProperty('lbl')) {
                    look.inputLabels.push(json.inputs[j].lbl);
                } else {
                    look.inputLabels.push('');
                }
                look.inBusWidths.push(0);
            }
        }
        for (let j = 0; j < json.busInputs.length; j++) {
            if (json.busInputs[j].pos === i) {
                look.tops.push(json.busInputs[j].istop === 'true');
                if (json.busInputs[j].hasOwnProperty('lbl')) {
                    look.inputLabels.push(json.busInputs[j].lbl);
                } else {
                    look.inputLabels.push('');
                }
                look.inBusWidths.push(json.busInputs[j].busWidth);
            }
        }
    }


    /*for (let i = 0; i < json.inputs.length; i++) {                  // Nächste Baustelle: anstatt splice kombinieren ähnlich in customsketch/resetinputs!
        look.tops.push(json.inputs[i].hasOwnProperty('istop'));
        if (json.inputs[i].hasOwnProperty('lbl')) {
            look.inputLabels.push(json.inputs[i].lbl);
        } else {
            look.inputLabels.push('');
        }
        look.inBusWidths.push(0);
    }
    for (let i = json.busInputs.length - 1; i >= 0; i--) {
        look.tops.splice(json.busInputs[i].pos, 0, json.busInputs[i].hasOwnProperty('istop'));
        if (json.busInputs[i].hasOwnProperty('lbl')) {
            look.inputLabels.splice(json.busInputs[i].pos, 0, json.busInputs[i].lbl);
        } else {
            look.inputLabels.splice(json.busInputs[i].pos, 0, '');
        }
        look.inBusWidths.splice(json.busInputs[i].pos, 0, json.busInputs[i].busWidth);
    }*/
    for (let i = 0; i < json.outputs.length; i++) {
        if (json.outputs[i].hasOwnProperty('lbl')) {
            look.outputLabels.push(json.outputs[i].lbl);
        } else {
            look.outputLabels.push('');
        }
    }
    return look;
}

function getThisLook() {
    let look = {};
    look.tops = [];
    look.inBusWidths = [];
    look.inputLabels = [];
    look.outputLabels = [];
    look.caption = moduleNameInput.value;
    look.inputs = inputs.length + busInputs.length;
    look.outputs = outputs.length;

    for (let i = 0; i <= inCustPosBound; i++) {
        for (let j = 0; j < inputs.length; j++) {
            if (inputs[j].custPosition === i) {
                look.tops.push(inputs[j].istop === 'true');
                look.inputLabels.push(inputs[j].lbl);
                look.inBusWidths.push(0);
            }
        }
        for (let j = 0; j < busInputs.length; j++) {
            if (busInputs[j].custPosition === i) {
                look.tops.push(busInputs[j].istop === 'true');
                look.inputLabels.push(busInputs[j].lbl);
                look.inBusWidths.push(busInputs[j].busWidth);
            }
        }
    }

    /*for (let i = 0; i < inputs.length; i++) {
        look.tops.push(inputs[i].isTop);
        look.inputLabels.push(inputs[i].lbl);
        look.inBusWidths.push(0);
    }
    for (let i = busInputs.length - 1; i >= 0; i--) {
        look.tops.splice(busInputs[i].custPosition, 0, busInputs[i].isTop);    // <---------- REDO
        look.inputLabels.splice(busInputs[i].custPosition, 0, busInputs[i].lbl);
        look.inBusWidths.splice(busInputs[i].custPosition, 0, busInputs[i].busWidth);
    }*/
    for (let i = 0; i < outputs.length; i++) {
        look.outputLabels.push(outputs[i].lbl);
    }
    return look;
}

function loadURLSketch() {
    let loadfile = urlParam('sketch');
    let loadLink = urlParam('link');
    if (loadfile !== '') {
        showMessage('Loading Sketch<span style="color: #c83232">.</span>', loadFile);
        if (loadfile.indexOf('lib') === 0) {
            sketchNameInput.value = loadfile.substring(10);
            topSketchInput.value = loadfile.substring(10);
        } else {
            sketchNameInput.value = loadfile;
            topSketchInput.value = loadfile;
        }
        setLoading(true);
        loadSketch(loadfile + '.json');
        socket.emit('getDescription', { file: loadfile, access_token: getCookieValue('access_token') });
        socket.on('sketchDescription', (data) => {
            try {
                let d = JSON.parse(data.data);
                if (data.success === true) {
                    descInput.value = d.desc;
                    moduleNameInput.value = d.caption;
                }
            } catch (e) {
                if (data.success === true) {
                    descInput.value = data.data;
                }
            }
            socket.off('sketchDescription');
        });
    } else if (loadLink !== '') {
        showMessage('Loading Sketch<span style="color: #c83232">.</span>', loadLink);
        setLoading(true);
        loadFromLink(loadLink + '.json');
    }
}