// File: loadsave.js

function saveSketch(filename, callback) {
    // Create a new json object to store all elements in
    let json = {};
    // New elements should have the filename as their caption (for now)
    json.caption = filename.substring(0, filename.indexOf('.'));
    json.gates = [];
    json.outputs = [];
    json.inputs = [];
    json.segments = [];
    json.wires = [];
    json.conpoints = [];
    json.diodes = [];
    json.customs = [];
    json.labels = [];
    json.segDisplays = [];
    for (let i = 0; i < gates.length; i++) {
        json.gates.push(gates[i].getData());
    }
    for (let i = 0; i < outputs.length; i++) {
        json.outputs.push(outputs[i].getData());
    }
    for (let i = 0; i < inputs.length; i++) {
        json.inputs.push(inputs[i].getData());
    }
    for (let i = 0; i < wires.length; i++) {
        json.wires.push(wires[i].getData());
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
    for (let i = 0; i < customs.length; i++) {
        if (customs[i].visible) {
            json.customs.push(customs[i].getData());
        }
    }
    if (getCookieValue('access_token') !== '') {
        socket.emit('saveUserSketch', { file: filename, json: json, access_token: getCookieValue('access_token') });
    } else {
        saveJSON(json, filename); // Save the file as json (asks for directory...)
    }
    callback(getLookData(json));
}

function loadSketch(file) {
    next = 0;
    queue = [];
    loading = true;
    loadFile = file;
    document.title = 'LogiJS: ' + loadFile.split('.')[0];
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

function loadSketchFromJSON(data, file) {
    next = 0;
    queue = [];
    loading = true;
    loadFile = file;
    document.title = 'LogiJS: ' + file;
    load(data);
}

function fileNotFoundError() {
    // Change the site's title to the error message
    document.title = 'LogiJS: Sketch not found!';
    showMessage('Sketch not found!', 'Please use a local copy of LogiJS to open local files.');
    setTimeout(function () { setLoading(false); }, 3000);
}

function load(loadData) {
    gates = []; // Reset all elements and the view before loading
    outputs = [];
    inputs = [];
    segments = [];
    conpoints = [];
    customs = [];
    diodes = [];
    labels = [];
    segDisplays = [];
    transform = new Transformation(0, 0, 1);
    gridSize = GRIDSIZE;
    actionUndo = []; // Clear Undo / Redo stacks
    actionRedo = [];
    endSimulation(); // End ongoing simulations
    disableButtons(true);
    simButton.elt.disabled = true;
    saveButton.elt.disabled = true;
    // Load all gate parameters and create new gates based on that information
    for (let i = 0; i < loadData.gates.length; i++) {
        gates[i] = new LogicGate(JSON.parse(loadData.gates[i].x), JSON.parse(loadData.gates[i].y), transform, JSON.parse(loadData.gates[i].direction),
            JSON.parse(loadData.gates[i].inputCount), JSON.parse(loadData.gates[i].outputCount), JSON.parse(loadData.gates[i].logicFunction));
        gates[i].setInvertions(JSON.parse(loadData.gates[i].inputsInv), JSON.parse(loadData.gates[i].outputsInv));
        gates[i].setCoordinates(JSON.parse(loadData.gates[i].x) / transform.zoom - transform.dx, JSON.parse(loadData.gates[i].y) / transform.zoom - transform.dy);
        gates[i].updateClickBoxes();
    }
    for (let i = 0; i < loadData.outputs.length; i++) {
        outputs[i] = new Output(JSON.parse(loadData.outputs[i].x), JSON.parse(loadData.outputs[i].y), transform, JSON.parse(loadData.outputs[i].colr));
        if (loadData.outputs[i].hasOwnProperty("lbl")) {
            outputs[i].lbl = loadData.outputs[i].lbl;
        }
        outputs[i].setCoordinates(JSON.parse(loadData.outputs[i].x) / transform.zoom - transform.dx, JSON.parse(loadData.outputs[i].y) / transform.zoom - transform.dy);
        outputs[i].updateClickBox();
    }
    for (let i = 0; i < loadData.inputs.length; i++) {
        inputs[i] = new Input(JSON.parse(loadData.inputs[i].x), JSON.parse(loadData.inputs[i].y), transform);
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
                if (JSON.parse(loadData.wires[i].y1) !== JSON.parse(loadData.wires[i].y2)) { // For compability
                    // Vertical wire, split in n vertical segments | Assuming y1 < y2, can always be saved in that form
                    for (let j = 0; j < (JSON.parse(loadData.wires[i].y2) - JSON.parse(loadData.wires[i].y1)) / GRIDSIZE; j++) {
                        segments.push(new Wire(1, JSON.parse(loadData.wires[i].x1), (JSON.parse(loadData.wires[i].y1) + j * GRIDSIZE),
                            false, transform));
                    }
                }
            }
            if (loadData.wires[i].hasOwnProperty("x2")) {
                if (JSON.parse(loadData.wires[i].x1) !== JSON.parse(loadData.wires[i].x2)) { // For compability
                    // Horizontal wire, split in n horizontal segments | Assuming x1 < x2, can always be saved in that form
                    for (let j = 0; j < (JSON.parse(loadData.wires[i].x2) - JSON.parse(loadData.wires[i].x1)) / GRIDSIZE; j++) {
                        segments.push(new Wire(0, JSON.parse(loadData.wires[i].x1) + j * GRIDSIZE, (JSON.parse(loadData.wires[i].y1)),
                            false, transform));
                    }
                }
            }
        }
    }
    for (let i = 0; i < loadData.conpoints.length; i++) {
        conpoints[i] = new ConPoint(JSON.parse(loadData.conpoints[i].x), JSON.parse(loadData.conpoints[i].y), false, -1);
    }
    for (let i = 0; i < loadData.diodes.length; i++) {
        diodes[i] = new Diode(JSON.parse(loadData.diodes[i].x), JSON.parse(loadData.diodes[i].y), false, transform);
    }
    if (loadData.hasOwnProperty("labels")) {
        for (let i = 0; i < loadData.labels.length; i++) {
            labels[i] = new Label(JSON.parse(loadData.labels[i].x), JSON.parse(loadData.labels[i].y), loadData.labels[i].txt, transform);
        }
    }
    if (loadData.hasOwnProperty("segDisplays")) {
        for (let i = 0; i < loadData.segDisplays.length; i++) {
            segDisplays[i] = new SegmentDisplay(JSON.parse(loadData.segDisplays[i].x), JSON.parse(loadData.segDisplays[i].y), transform, JSON.parse(loadData.segDisplays[i].inputCount));
        }
    }
    for (let i = 0; i < loadData.customs.length; i++) {
        customs[i] = new CustomSketch(JSON.parse(loadData.customs[i].x), JSON.parse(loadData.customs[i].y), transform, JSON.parse(loadData.customs[i].direction), JSON.parse(loadData.customs[i].filename));
        customs[i].setInvertions(JSON.parse(loadData.customs[i].inputsInv), JSON.parse(loadData.customs[i].outputsInv));
        customs[i].setCoordinates(JSON.parse(loadData.customs[i].x) / transform.zoom - transform.dx, JSON.parse(loadData.customs[i].y) / transform.zoom - transform.dy);
    }
    loadCustomSketches(); // Load all custom sketches from file
    findLines();
    reDraw();
}

/*
    Loads the sketch with filename file into custom object # num
*/
function loadCustomFile(file, num, hlparent) {
    loadFile = file;
    if (cachedFiles.indexOf(file) >= 0) {
        setTimeout(function () {
            loadCallback(cachedData[cachedFiles.indexOf(file)], num, hlparent);
        }, 0);
    } else {
        loadJSON('sketches/' + file, function (loadData) {
            if (cachedFiles.indexOf(file) < 0) {
                cachedFiles.push(file);
                cachedData.push(loadData);
            }
            loadCallback(loadData, num, hlparent);
        }, function () {
            socket.emit('getUserSketch', { file: file.split('.')[0], access_token: getCookieValue('access_token') });
            socket.on('userSketchData', (data) => {
                let loadData = data.data;
                if (data.success === true) {
                    if (cachedFiles.indexOf(file) < 0) {
                        cachedFiles.push(file);
                        cachedData.push(loadData);
                    }
                    loadCallback(loadData, num, hlparent);
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
    let params = [[], [], [], [], [], [], []]; // [] x Number of different objects
    let trans = new Transformation(0, 0, 1);
    for (let i = 0; i < loadData.gates.length; i++) {
        params[GATENUM][i] = new LogicGate(JSON.parse(loadData.gates[i].x), JSON.parse(loadData.gates[i].y), trans, JSON.parse(loadData.gates[i].direction),
            JSON.parse(loadData.gates[i].inputCount), JSON.parse(loadData.gates[i].outputCount), JSON.parse(loadData.gates[i].logicFunction));
        params[GATENUM][i].setInvertions(JSON.parse(loadData.gates[i].inputsInv), JSON.parse(loadData.gates[i].outputsInv));
    }
    for (let i = 0; i < loadData.outputs.length; i++) {
        params[OUTPNUM][i] = new Output(JSON.parse(loadData.outputs[i].x), JSON.parse(loadData.outputs[i].y), trans, JSON.parse(loadData.outputs[i].colr));
        if (loadData.outputs[i].hasOwnProperty("lbl")) {
            params[OUTPNUM][i].lbl = loadData.outputs[i].lbl;
        }
    }
    for (let i = 0; i < loadData.inputs.length; i++) {
        params[INPNUM][i] = new Input(JSON.parse(loadData.inputs[i].x), JSON.parse(loadData.inputs[i].y), trans);
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
                params[SEGNUM][i] = new Wire(1, JSON.parse(loadData.wires[i].x1), JSON.parse(loadData.wires[i].y1), false, trans);
                params[SEGNUM][i].endX = JSON.parse(loadData.wires[i].x1);
                params[SEGNUM][i].endY = JSON.parse(loadData.wires[i].y2);
            } else if (loadData.wires[i].hasOwnProperty("x2") && JSON.parse(loadData.wires[i].x1) !== JSON.parse(loadData.wires[i].x2)) {
                params[SEGNUM][i] = new Wire(0, JSON.parse(loadData.wires[i].x1), JSON.parse(loadData.wires[i].y1), false, trans);
                params[SEGNUM][i].endX = JSON.parse(loadData.wires[i].x2);
                params[SEGNUM][i].endY = JSON.parse(loadData.wires[i].y1);
            }
        }
    } else {
        console.log('The file you are trying to load was built with an old version of LogiJS (pre-01/2018)!');
    }

    for (let i = 0; i < loadData.conpoints.length; i++) {
        params[CPNUM][i] = new ConPoint(JSON.parse(loadData.conpoints[i].x), JSON.parse(loadData.conpoints[i].y), false, -1);
    }
    for (let i = 0; i < loadData.diodes.length; i++) {
        params[DINUM][i] = new Diode(JSON.parse(loadData.diodes[i].x), JSON.parse(loadData.diodes[i].y), false, trans);
    }
    for (let i = 0; i < loadData.customs.length; i++) {
        customs.push(new CustomSketch(JSON.parse(loadData.customs[i].x), JSON.parse(loadData.customs[i].y), trans, JSON.parse(loadData.customs[i].direction), JSON.parse(loadData.customs[i].filename)));
        customs[customs.length - 1].setInvertions(JSON.parse(loadData.customs[i].inputsInv), JSON.parse(loadData.customs[i].outputsInv));
        customs[customs.length - 1].visible = false;
        customs[customs.length - 1].setParentID(customs[hlparent].id);
        customs[num].responsibles.push(customs[customs.length - 1]);
        queue.push([customs[customs.length - 1].filename, (customs.length - 1), num]);
        params[CUSTNUM][i] = customs[customs.length - 1];
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
        queue.push([customs[i].filename, i, i]);
    }
    if (queue.length > 0) {
        loadNext();
    } else {
        setLoading(false);
    }
}

function loadNext() {
    if (queue.length <= next) {
        setLoading(false);
    } else {
        loadCustomFile(queue[next][0], queue[next][1], queue[next][2]);
        next++;
    }
}

function loadCallback(loadData, num, hlparent) {
    loadCustom(loadData, num, hlparent);
    loadNext();
}

function getLookData(json) {
    let look = {};
    look.tops = [];
    look.inputLabels = [];
    look.outputLabels = [];
    look.caption = json.caption;
    look.inputs = json.inputs.length;
    look.outputs = json.outputs.length;
    for (let i = 0; i < json.inputs.length; i++) {
        if (json.inputs[i].istop) {
            look.tops.push(i);
        }
        if (json.inputs[i].hasOwnProperty('lbl')) {
            look.inputLabels.push(json.inputs[i].lbl);
        } else {
            look.inputLabels.push('');
        }
    }
    for (let i = 0; i < json.outputs.length; i++) {
        if (json.outputs[i].hasOwnProperty('lbl')) {
            look.outputLabels.push(json.outputs[i].lbl);
        } else {
            look.outputLabels.push('');
        }
    }
    return look;
}