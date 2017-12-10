// File: sketch.js
// Name: Simon Buchholz
// Date: 28/10/17

// LESS IMPORTANT TODO POINTS:
// TODO: Delete element in front of Gate
// TODO: Fully implement selecting
// TODO: Redo GUI (without dom elements, better design!)

p5.disableFriendlyErrors = true;

let gates = []; // All normal gates (no inputs, outputs, etc.)
let outputs = []; // All outputs
let inputs = []; // All inputs
let segments = []; // All wire segments
let pwSegments = [];
let conpoints = [];
let diodes = [];
let customs = [];

let startDirection = 0;
let pwstartX = 0;
let pwstartY = 0;

// Variables for wire tracing
let traced = [];
let groups = [];

let caption = []; // Name of the sketch, displayed on customs

let gridSize = GRIDSIZE; // Size of the grid

let ctrlMode = 'none'; // Possible modes: none, delete, addObject, addWire, drag, select ...
let addType = 'none'; // Possilbe modes: none, gate, output, input, ...
let gateType = 'none'; // Possible modes: and, or, xor, ...
let wireMode = 'none'; // Possible modes: none, preview, delete ...
let selectMode = 'start';

let gateInputCount = 2; // Input count for new gates
let gateDirection = 0;  // Direction for new gates
let newIsButton = false;
let newIsClock = false;

let custFile = '';

let actionUndo = [];
let actionRedo = [];

let selectStartX = 0;
let selectStartY = 0;
let selectEndX = 0;
let selectEndY = 0;

// Variables for dragging
let lastX = 0; var lastY = 0; // last mouse position
let dragSpeed = 1.5;

// Variables for zooming
let maxZoom = 2.0;
let minZoom = 0.2;

let transform = new Transformation(0, 0, 1);

let lockElements = false; // For delete mode, ensures that wires can be deleted without
// accidentally deleting other elements

let simRunning = false;

let syncFramerate = true;

let redrawCounter = 0;

// GUI Elements
let textInput, saveButton, loadButton, newButton; // Right hand side
let wireButton, deleteButton, simButton, // Left hand side
    andButton, orButton, xorButton, inputButton, buttonButton, clockButton,
    outputButton, clockspeedSlider, undoButton, redoButton, diodeButton, crText;
let counter4Button, counter2Button, decoder4Button, decoder2Button, dFlipFlopButton, rsFlipFlopButton, reg4Button,
    add4BitButton, mux1Button, mux2Button, mux3Button, halfaddButton, fulladdbutton, ascustomButton;
let updater, sfcheckbox;
// Hide right click menu
document.addEventListener('contextmenu', event => event.preventDefault());
let cnv; // Canvas variable

/*
    Sets up the canvas and caps the framerate
*/
function setup() {
    // Creates the canvas in full window size
    cnv = createCanvas(windowWidth, windowHeight);

    
	
    // Prevents the input field from being focused during clicking in the canvas
    document.addEventListener('mousedown', function (event) {
        if (event.detail > 1) {
            event.preventDefault();
        }
    }, false);

	// Left Side Buttons
	// Activates the wiring mode
    wireButton = createButton('Wiring');
    wireButton.position(5, 4);
    wireButton.mousePressed(wiringClicked);
    wireButton.elt.style.width = "140px";
	
    // Adds and-gates
    andButton = createButton('And-Gate');
    andButton.position(5, 34);
    andButton.mousePressed(andClicked);
    andButton.elt.style.width = "140px";

    // Adds or-gates
    orButton = createButton('Or-Gate');
    orButton.position(5, 58);
    orButton.mousePressed(orClicked);
    orButton.elt.style.width = "140px";

    // Adds xor-gates
    xorButton = createButton('Xor-Gate');
    xorButton.position(5, 82);
    xorButton.mousePressed(xorClicked);
    xorButton.elt.style.width = "140px";

    // Adds switches
    inputButton = createButton('Switch');
    inputButton.position(5, 106);
    inputButton.mousePressed(inputClicked);
    inputButton.elt.style.width = "140px";

    // Adds buttons (short impulse)
    buttonButton = createButton('Button');
    buttonButton.position(5, 130);
    buttonButton.mousePressed(buttonClicked);
    buttonButton.elt.style.width = "140px";

    // Adds clocks (variable impulse)
    clockButton = createButton('Clock');
    clockButton.position(5, 154);
    clockButton.mousePressed(clockClicked);
    clockButton.elt.style.width = "140px";

    // Adds outputs (lamps)
    outputButton = createButton('Lamp');
    outputButton.position(5, 178);
    outputButton.mousePressed(outputClicked);
    outputButton.elt.style.width = "140px";
	
	 // Adds diodes (barricade in one direction); Under development
    diodeButton = createButton('Toggle Diodes');
    diodeButton.position(5, 202);
    diodeButton.mousePressed(diodeClicked);
    diodeButton.elt.style.width = "140px";
	
    // Adds a counter (2Bit)
    counter2Button = createButton('2Bit-Counter');
    counter2Button.position(5, 226);
    counter2Button.mousePressed(function () { return customClicked('2BitCounter.json') });
    counter2Button.elt.style.width = "140px";

    // Adds a counter (4Bit)
    counter4Button = createButton('4Bit-Counter');
    counter4Button.position(5, 250);
    counter4Button.mousePressed(function () { return customClicked('4BitCounter.json') });
    counter4Button.elt.style.width = "140px";

    // Adds a decoder (2Bit)
    decoder2Button = createButton('2Bit-Decoder');
    decoder2Button.position(5, 274);
    decoder2Button.mousePressed(function () { return customClicked('2BitDec.json') });
    decoder2Button.elt.style.width = "140px";

    // Adds a decoder (4Bit)
    decoder4Button = createButton('4Bit-Decoder');
    decoder4Button.position(5, 298);
    decoder4Button.mousePressed(function () { return customClicked('4BitDec.json') });
    decoder4Button.elt.style.width = "140px";

    // Adds an adder (4Bit)
    add4BitButton = createButton('4Bit-Adder');
    add4BitButton.position(5, 322);
    add4BitButton.mousePressed(function () { return customClicked('4BitNeu.json') });
    add4BitButton.elt.style.width = "140px";

    // Adds a d-flipflop
    dFlipFlopButton = createButton('D-FlipFlop');
    dFlipFlopButton.position(5, 346);
    dFlipFlopButton.mousePressed(function () { return customClicked('d-flipflop.json') });
    dFlipFlopButton.elt.style.width = "140px";

    // Adds an rs-flipflop
    rsFlipFlopButton = createButton('RS-FlipFlop');
    rsFlipFlopButton.position(5, 370);
    rsFlipFlopButton.mousePressed(function () { return customClicked('rsNoWhobble.json') });
    rsFlipFlopButton.elt.style.width = "140px";

    // Adds a register (4Bit)
    reg4Button = createButton('4Bit-Register');
    reg4Button.position(5, 394);
    reg4Button.mousePressed(function () { return customClicked('4BitReg.json') });
    reg4Button.elt.style.width = "140px";

    // Adds a 1-multiplexer
    mux1Button = createButton('1-Multiplexer');
    mux1Button.position(5, 418);
    mux1Button.mousePressed(function () { return customClicked('1-mux.json') });
    mux1Button.elt.style.width = "140px";

    // Adds a 2-multiplexer
    mux2Button = createButton('2-Multiplexer');
    mux2Button.position(5, 442);
    mux2Button.mousePressed(function () { return customClicked('2-mux.json') });
    mux2Button.elt.style.width = "140px";

    // Adds a 3-multiplexer
    mux3Button = createButton('3-Multiplexer');
    mux3Button.position(5, 466);
    mux3Button.mousePressed(function () { return customClicked('3-mux.json') });
    mux3Button.elt.style.width = "140px";
	
	// Adds a Half Adder
    halfaddButton = createButton('Half Adder');
    halfaddButton.position(5, 490);
    halfaddButton.mousePressed(function () { return customClicked('halbadd.json') });
    halfaddButton.elt.style.width = "140px";
	
	// Adds a Full Adder
    fulladdButton = createButton('Full Adder');
    fulladdButton.position(5, 514);
    fulladdButton.mousePressed(function () { return customClicked('volladd.json') });
    fulladdButton.elt.style.width = "140px";

	
	
	
	
	//Upper left
	// Activates the delete mode (objects and wires)
    deleteButton = createButton('Delete');
    deleteButton.position(150, 4);
    deleteButton.mousePressed(deleteClicked);

    // Starts and stops the simulation
    simButton = createButton('Start');
    simButton.position(210, 4);
    simButton.mousePressed(simClicked);
	
	// Adds text before the Clockrate slider
	crText = createP('Clock rate: ');
    crText.elt.style.color = 'white';
    crText.elt.style.fontFamily = 'Arial';
    crText.position(260, -16);
	
    // A slider for adjusting the clock speed
    clockspeedSlider = createSlider(2, 60, 30, 1);
    clockspeedSlider.position(360, 2);
    clockspeedSlider.style('width', '80px');
    // Alters the max fps based on the clock speed => Genius
    clockspeedSlider.changed(function () {
        if (simRunning && !syncFramerate) {
            frameRate(60 - clockspeedSlider.value() / 2);
        } else {
            frameRate(60);
        }
    });

    // Undos the last action
    undoButton = createButton('Undo');
    undoButton.position(450, 4);
    undoButton.mousePressed(() => { // ES6-Standard
        undo();
    })
    undoButton.elt.disabled = true;

    // Redos the last action
    redoButton = createButton('Redo');
    redoButton.position(503, 4);
    redoButton.mousePressed(() => {
        redo();
    })
    redoButton.elt.disabled = true;

    // Activates the mode for area selecting
    selectButton = createButton('Select');
    selectButton.position(556, 4);
    selectButton.mousePressed(startSelect);
	
	sfcheckbox = createCheckbox('Sync FPS', true);
    sfcheckbox.changed(function () {
        syncFramerate = !syncFramerate;
        if (simRunning) {
            if (!syncFramerate) {
                frameRate(60 - clockspeedSlider.value() / 2);
                updater = setInterval(updateTick, 2);
            } else {
                clearInterval(updater);
                frameRate(60);
            }
        }
    });
    sfcheckbox.elt.style.color = 'white';
    sfcheckbox.elt.style.fontFamily = 'Arial';
    sfcheckbox.position(610, 4);
	
	
	// Upper right
	// Input field for the file name
    textInput = createInput('New Sketch');
    textInput.size(300, 15);
    textInput.position(window.width - textInput.width - 161, 4);

	// Clears the canvas and resets the view
    newButton = createButton('New');
    newButton.position(window.width - textInput.width - 208, 4);
    newButton.mousePressed(newClicked);
	
	 // Button to save the sketch
    saveButton = createButton('Save');
    saveButton.position(window.width - 157, 4);
    saveButton.mousePressed(saveClicked);

    // Button to load a sketch
    loadButton = createButton('Load');
    loadButton.position(window.width - 107, 4);
    loadButton.mousePressed(loadClicked);

    // Button to import as custom
    ascustomButton = createButton('Import');
    ascustomButton.position(window.width - 57, 4);
    ascustomButton.mousePressed(function () { return customClicked(textInput.value() + '.json') });
	
    frameRate(60); // Caps the framerate at 60 FPS
	
    var loadfile = urlParam('sketch');
    if (loadfile != "") {
        console.log(`Loading ${loadfile}`);
        loadSketch(loadfile + '.json');
    }
    reDraw();
}

// Credits to https://stackoverflow.com/questions/2405355/how-to-pass-a-parameter-to-a-javascript-through-a-url-and-display-it-on-a-page (Mic)
function urlParam(name, w) {
    w = w || window;
    var rx = new RegExp('[\&|\?]' + name + '=([^\&\#]+)'),
        val = w.location.search.match(rx);
    return !val ? '' : val[1];
}

function customClicked(filename) {
    ctrlMode = 'addObject';
    addType = 'custom';
    custFile = filename;
}

// Triggered when a sketch should be saved
function saveClicked() {
    saveSketch(textInput.value() + '.json');
}

// Triggered when a sketch should be loaded
function loadClicked() {
    loadSketch(textInput.value() + '.json');
    reDraw();
}

// Resets the canvas and the view / transformation
function newClicked() {
    gates = [];
    outputs = [];
    inputs = [];
    segments = [];
    conpoints = [];
    customs = [];
    diodes = [];
    actionUndo = [];
    actionRedo = [];
    transform = new Transformation(0, 0, 1);
    gridSize = GRIDSIZE;
    endSimulation(); // End the simulation, if started
    ctrlMode = 'none'; // Clear the control mode
    wireMode = 'none';
    reDraw();
}

function wiringClicked() {
    ctrlMode = 'addWire';
    wireMode = 'none';
}

function deleteClicked() {
    ctrlMode = 'delete';
}

// Toggles the simulation
// Button label updated in functions
function simClicked() {
    if (!simRunning) {
        startSimulation();
    } else {
        endSimulation();
    }
}

/*
    Adding modes for gates, in/out, customs, etc.
*/

function andClicked() {
    ctrlMode = 'addObject';
    addType = 'gate';
    gateType = 'and';
}

function orClicked() {
    ctrlMode = 'addObject';
    addType = 'gate';
    gateType = 'or';
}

function xorClicked() {
    ctrlMode = 'addObject';
    addType = 'gate';
    gateType = 'xor';
}

function inputClicked() {
    newIsButton = false;
    newIsClock = false;
    ctrlMode = 'addObject';
    addType = 'input';
}

function buttonClicked() {
    newIsButton = true;
    newIsClock = false;
    ctrlMode = 'addObject';
    addType = 'input';
}

function clockClicked() {
    newIsButton = false;
    newIsClock = true;
    ctrlMode = 'addObject';
    addType = 'input';
}

function outputClicked() {
    ctrlMode = 'addObject';
    addType = 'output';
}

function diodeClicked() {
    ctrlMode = 'addObject';
    addType = 'diode';
}

// Starts the selection process
function startSelect() {
    ctrlMode = 'select';
    selectMode = 'none';
}

/*
    Adds a new gate with given type, input count and direction
*/
function addGate(type, inputs, direction) {
    for (var i = 0; i < gates.length; i++) {
        if ((gates[i].x == Math.round(((mouseX - GRIDSIZE / 2) / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE)
            && (gates[i].y == Math.round(((mouseY - GRIDSIZE / 2) / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE)) {
            return;
        }
    }
    switch (type) {
        case 'and':
            var newGate = new LogicGate(mouseX, mouseY, transform, direction, inputs, 1, 'and', '&');
            newGate.setCoordinates(mouseX / transform.zoom - transform.dx, mouseY / transform.zoom - transform.dy);
            newGate.updateClickBoxes();
            gates.push(newGate);
            pushUndoAction('addGate', [], newGate);
            break;
        case 'or':
            var newGate = new LogicGate(mouseX, mouseY, transform, direction, inputs, 1, 'or', '≥1');
            newGate.setCoordinates(mouseX / transform.zoom - transform.dx, mouseY / transform.zoom - transform.dy);
            newGate.updateClickBoxes();
            gates.push(newGate);
            pushUndoAction('addGate', [], newGate);
            break;
        case 'xor':
            var newGate = new LogicGate(mouseX, mouseY, transform, direction, inputs, 1, 'xor', '=1');
            newGate.setCoordinates(mouseX / transform.zoom - transform.dx, mouseY / transform.zoom - transform.dy);
            newGate.updateClickBoxes();
            gates.push(newGate);
            pushUndoAction('addGate', [], newGate);
            break;
        default:
            console.log('Gate type \'' + type + '\' not found!');
    }
    reDraw();
}

/*
    Adds a custom element and loads it file and sub-customs
*/
function addCustom(file, direction) {
    for (var i = 0; i < customs.length; i++) {
        if (customs[i].visible) {
            if ((customs[i].x == Math.round(((mouseX - GRIDSIZE / 2) / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE)
                && (customs[i].y == Math.round(((mouseY - GRIDSIZE / 2) / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE)) {
                return;
            }
        }
    }
    var newCustom = new CustomSketch(mouseX, mouseY, transform, direction, file);
    newCustom.setCoordinates(mouseX / transform.zoom - transform.dx, mouseY / transform.zoom - transform.dy);
    customs.push(newCustom);
    pushUndoAction('addCust', [], newCustom);
    loadCustomSketches();
}

/*
    Adds a new output (lamp)
*/
function addOutput() {
    for (var i = 0; i < outputs.length; i++) {
        if ((outputs[i].x == Math.round((mouseX / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE)
            && (outputs[i].y == Math.round((mouseY / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE)) {
            return;
        }
    }
    var newOutput = new Output(mouseX, mouseY, transform, 0);
    newOutput.setCoordinates(mouseX / transform.zoom - transform.dx, mouseY / transform.zoom - transform.dy);
    newOutput.updateClickBox();
    outputs.push(newOutput);
    pushUndoAction('addOut', [], newOutput);
    reDraw();
}

/*
    Adds a new input (switch)
*/
function addInput() {
    for (var i = 0; i < inputs.length; i++) {
        if ((inputs[i].x == (Math.round((mouseX / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE) - GRIDSIZE / 2)
            && (inputs[i].y == (Math.round((mouseY / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE) - GRIDSIZE / 2)) {
            return;
        }
    }
    var newInput = new Input(mouseX, mouseY, transform);
    newInput.setCoordinates(mouseX / transform.zoom - transform.dx, mouseY / transform.zoom - transform.dy);
    newInput.updateClickBox();
    if (newIsButton) {
        newInput.framecount = BUTCOUNT;
    } else if (newIsClock) {
        newInput.framecount = clockspeedSlider.value();
    } else {
        newInput.framecount = -1;
    }
    newInput.clock = newIsClock;
    inputs.push(newInput);
    pushUndoAction('addIn', [], newInput);
    reDraw();
}

/*
    Adds a diode as a special type of ConPoints in the diodes array
    Caution: Also deletes diodes if existing => More like toggleDiode()
*/
function toggleDiode() {
    for (var i = 0; i < diodes.length; i++) {
        if ((diodes[i].x == Math.round((mouseX / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE)
            && (diodes[i].y == Math.round((mouseY / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE)) {
            deleteDiode(i);
            return;
        }
    }
    createDiode(Math.round((mouseX / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE,
        Math.round((mouseY / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE, false);
    // Undo-Redo handling in createDiode()
    reDraw();
}

/*
    Deletes the given gate
*/
function deleteGate(gateNumber) {
    pushUndoAction('delGate', [], gates.splice(gateNumber, 1));
    reDraw();
}

/*
    Deletes the given custom
*/
function deleteCustom(customNumber) {
    console.log(customs);
    _.forEach(customs[customNumber].responsibles, function (value) { customs.splice(customs.indexOf(value), 1) });
    pushUndoAction('delCust', [], customs.splice(customNumber, 1));
    console.log(customs);
    reDraw();
}

/*
    Deletes the given output (lamp)
*/
function deleteOutput(outputNumber) {
    pushUndoAction('delOut', [], outputs.splice(outputNumber, 1));
    reDraw();
}

/*
    Deletes the given input (switch)
*/
function deleteInput(inputNumber) {
    pushUndoAction('delIn', [], inputs.splice(inputNumber, 1));
    reDraw();
}

/*
    Deletes the given diode (under development)
*/
function deleteDiode(diodeNumber) {
    pushUndoAction('delDi', [], diodes.splice(diodeNumber, 1));
    reDraw();
}

/*
    Starts the simulation mode
    - Groups are created and objects are integrated
    - simRunning is set so that the sketch can't be altered
*/
function startSimulation() {
    simButton.elt.innerHTML = 'Stop';
    undoButton.elt.disabled = true;
    redoButton.elt.disabled = true;
    andButton.elt.disabled = true;
    orButton.elt.disabled = true;
    xorButton.elt.disabled = true;
    wireButton.elt.disabled = true;
    inputButton.elt.disabled = true;
    outputButton.elt.disabled = true;
    buttonButton.elt.disabled = true;
    clockButton.elt.disabled = true;
    deleteButton.elt.disabled = true;
    selectButton.elt.disabled = true;
    diodeButton.elt.disabled = true;
    reg4Button.elt.disabled = true;
    decoder4Button.elt.disabled = true;
    decoder2Button.elt.disabled = true;
    counter2Button.elt.disabled = true;
    counter4Button.elt.disabled = true;
    mux1Button.elt.disabled = true;
    mux2Button.elt.disabled = true;
    mux3Button.elt.disabled = true;
    dFlipFlopButton.elt.disabled = true;
    rsFlipFlopButton.elt.disabled = true;
    add4BitButton.elt.disabled = true;
    halfaddButton.elt.disabled = true;
    fulladdButton.elt.disabled = true;
    ascustomButton.elt.disabled = true;
    for (let i = 0; i < customs.length; i++) {
        customs[i].setSimRunning(true);
    }
    parseGroups();
    integrateElement();
    parseGroups();
    let counter = 0;
    for (let i = 0; i < groups.length; i++) {
        groups[i].findLines();
        counter += groups[i].segments.length;
    }
    console.log('Before: ' + segments.length + ' segments displayed');
    console.log('Now: ' + counter + ' segments displayed');

    simRunning = true;
    if (!syncFramerate) {
        updater = setInterval(updateTick, 10);
    }
}

/*
    Ends the simulation mode
    - Groups are deleted
    - Objects are set to low state
    - simRunning is cleared so that the sketch can be altered
*/
function endSimulation() {
    simButton.elt.innerHTML = 'Start';
    redoButton.elt.disabled = (actionRedo.length === 0);
    undoButton.elt.disabled = (actionUndo.length === 0);
    andButton.elt.disabled = false;
    orButton.elt.disabled = false;
    xorButton.elt.disabled = false;
    wireButton.elt.disabled = false;
    inputButton.elt.disabled = false;
    outputButton.elt.disabled = false;
    buttonButton.elt.disabled = false;
    clockButton.elt.disabled = false;
    deleteButton.elt.disabled = false;
    selectButton.elt.disabled = false;
    diodeButton.elt.disabled = false;
    reg4Button.elt.disabled = false;
    decoder4Button.elt.disabled = false;
    decoder2Button.elt.disabled = false;
    counter2Button.elt.disabled = false;
    counter4Button.elt.disabled = false;
    mux1Button.elt.disabled = false;
    mux2Button.elt.disabled = false;
    mux3Button.elt.disabled = false;
    dFlipFlopButton.elt.disabled = false;
    rsFlipFlopButton.elt.disabled = false;
    add4BitButton.elt.disabled = false;
    halfaddButton.elt.disabled = false;
    fulladdButton.elt.disabled = false;
    ascustomButton.elt.disabled = false;
    groups = [];
    for (let i = 0; i < gates.length; i++) {
        gates[i].shutdown();
    }
    for (let i = 0; i < customs.length; i++) {
        customs[i].setSimRunning(false);
        customs[i].shutdown();
    }
    for (let i = 0; i < conpoints.length; i++) {
        conpoints[i].state = false;
    }
    for (let i = 0; i < outputs.length; i++) {
        outputs[i].state = false;
    }
    for (let i = 0; i < inputs.length; i++) {
        inputs[i].setState(false);
    }
    for (let i = 0; i < diodes.length; i++) {
        diodes[i].setState(false);
    }
    _.forEach(segments, function (value) {
        value.state = false;
    });
    simRunning = false;
    if (!syncFramerate) {
        clearInterval(updater);
    }
    reDraw();
}

/*
    Executes in every frame, draws objects and stuff
*/
function draw() {
    redrawCounter++;
    if (simRunning) {
        if (syncFramerate) {
            updateTick();
        }
        reDraw();
    }

    // If wire preview is active, generate a segment set and display the preview segments
    // When the mode is delete, mark the wire by drawing it in blue
    if (wireMode == 'preview' || wireMode == 'delete') {
        reDraw();
        scale(transform.zoom);
        translate(transform.dx, transform.dy); // Handle the offset from dragging and zooming
        if (!mouseOverGUI()) {
            generateSegmentSet(pwstartX, pwstartY, Math.round((mouseX / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE,
                Math.round((mouseY / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE, 0);
            // Display preview segments
            _.forEach(pwSegments, function (value) {
                value.show(wireMode === 'delete');
            });
        }
        scale(1 / transform.zoom);
        translate(-transform.zoom * transform.dx, -transform.zoom * transform.dy);
    }

    // If an area should be selected, get the new end point and draw the transparent rectangle
    if (ctrlMode == 'select') {
        reDraw();
        scale(transform.zoom);
        translate(transform.dx, transform.dy); // Handle the offset from dragging and zooming
        fill(0, 0, 0, 100);
        strokeWeight(0);
        if (selectMode == 'start') {
            selectEndX = Math.round(((mouseX + GRIDSIZE / 2) / transform.zoom - transform.dx - GRIDSIZE / 2) / GRIDSIZE) * GRIDSIZE + GRIDSIZE / 2;
            selectEndY = Math.round(((mouseY + GRIDSIZE / 2) / transform.zoom - transform.dy - GRIDSIZE / 2) / GRIDSIZE) * GRIDSIZE + GRIDSIZE / 2;
            rect(Math.min(selectStartX, selectEndX), Math.min(selectStartY, selectEndY),
                Math.abs(selectStartX - selectEndX), Math.abs(selectStartY - selectEndY));
        }
        scale(1 / transform.zoom);
        translate(-transform.zoom * transform.dx, -transform.zoom * transform.dy);
    }
    handleDragging();
}

function updateTick() {
    for (const value of gates) {
        value.update();
    }

    for (const value of customs) {
        if (value.visible) {
            value.update();
        }
    }
    updateGroups();

    for (const value of conpoints) {
        value.state = groups[value.group].state;
    }

    for (const value of inputs) {
        if (value.framecount === 0) {
            if (value.getIsClock()) {
                value.toggle();
                value.framecount = clockspeedSlider.value();
            } else {
                value.setState(false);
                value.framecount = BUTCOUNT;
            }
        } else if ((value.framecount > 0) && (value.state || value.getIsClock())) {
            value.framecount--;
        }
    }

    for (const value of diodes) {
        value.state = groups[value.gA].state;
        if (value.state) {
            groups[value.gB].diodeHigh();
        }
    }
}

function reDraw() {
    //console.log('----------------------NEW FRAME-------------------------');
    //var t0 = performance.now();
    background(150);
    scale(transform.zoom);
    drawGrid();
    translate(transform.dx, transform.dy); // Handle the offset from dragging and zooming
    //var t1 = performance.now();
    //console.log("Drawing the grid and scaling/translating took " + (t1 - t0) + " milliseconds.")

    //t0 = performance.now();
    if (simRunning) {
        for (const elem of groups) {
            elem.show();
        }
    } else {
        for (const elem of segments) {
            elem.show();
        }
    }
    //t1 = performance.now();
    //console.log("Drawing wires took " + (t1 - t0) + " milliseconds.")

    //t0 = performance.now();
    for (const elem of gates) {
        elem.show();
    }

    for (const elem of customs) {
        if (elem.visible) {
            elem.show();
        }
    }
    //t1 = performance.now();
    //console.log("Drawing gates and customs took " + (t1 - t0) + " milliseconds.")

    //t0 = performance.now();
    for (const elem of conpoints) {
        elem.show();
    }
    //t1 = performance.now();
    //console.log("Drawing conpoints took " + (t1 - t0) + " milliseconds.")

    //t0 = performance.now();
    for (const elem of outputs) {
        elem.show();
    }
    //t1 = performance.now();
    //console.log("Drawing outputs took " + (t1 - t0) + " milliseconds.")

    //t0 = performance.now();
    for (const elem of inputs) {
        elem.show();
    }
    //t1 = performance.now();
    //console.log("Drawing inputs took " + (t1 - t0) + " milliseconds.")

    //t0 = performance.now();
    for (const elem of diodes) {
        elem.show();
    }
    //t1 = performance.now();
    //console.log("Drawing diodes took " + (t1 - t0) + " milliseconds.")

    //t0 = performance.now();
    // Draw the GUI at the end
    scale(1 / transform.zoom);
    translate(-transform.zoom * transform.dx, -transform.zoom * transform.dy); // Handle the offset from dragging and zooming
    fill(0);
    textSize(15); // Set text size to 15
    textAlign(LEFT, CENTER); // Align left for zoom label etc.
    stroke(0); // Set font parameters for zoom label etc.
    strokeWeight(1);

    // GUI Area
    text('Zoom: ' + Math.round(transform.zoom * 100) + '%', 160, 40); // Show zoom label
    text('mouseX: ' + mouseX, 160, 60);
    text('mouseY: ' + mouseY, 160, 80);
    text('mouseX trans.: ' + Math.round((mouseX / transform.zoom - transform.dx)), 160, 100);
    text('mouseY trans.: ' + Math.round((mouseY / transform.zoom - transform.dy)), 160, 120);
    text('Framerate: ' + frameRate().toFixed(2), 160, 140);

    strokeWeight(0);
    rect(0, 0, windowWidth, 30);
    rect(0, 30, 150, windowHeight);
    t1 = performance.now();
    //console.log("Drawing the GUI took " + (t1 - t0) + " milliseconds.");
}

function updateGroups() {
    for (var i = 0; i < groups.length; i++) {
        groups[i].updateAll();
    }
}

/*
    Gives a list of all wires that have an end in x, y, except wire j
*/
function wirePoints(x, y, j) {
    var indexList = [];
    for (var i = 0; i < segments.length; i++) {
        if (segments[i].endX == x && segments[i].endY == y) {
            if (i != j) {
                indexList.push(i);
            }
        }
        if (segments[i].startX == x && segments[i].startY == y) {
            if (i != j) {
                indexList.push(i);
            }
        }
    }
    return indexList;
}

function keyReleased(){
	if (textInput.elt != document.activeElement) {
		switch (keyCode) {
			case 17: //ctrl	
				ctrlMode = 'none'
				break;
			default:
			
		}
	}
}
/*
    Check if a key was pressed and act accordingly
*/
function keyPressed() {
    if (textInput.elt != document.activeElement) {
        switch (keyCode) {
            case ESCAPE:
                ctrlMode = 'none';
                break;
			case 17: //ctrl	
				startSelect();
				break;
            case 49: // 1
                gateInputCount = 1;
                break;
            case 50: // 2
                gateInputCount = 2;
                break;
            case 51: // 3
                gateInputCount = 3;
                break;
            case 52: // 4
                gateInputCount = 4;
                break;
            case 53: // 5
                gateInputCount = 5;
                break;
            case 54: // 6
                gateInputCount = 6;
                break;
            case 55: // 7
                gateInputCount = 7;
                break;
            case 56: // 8
                gateInputCount = 8;
                break;
            case 57: // 9
                gateInputCount = 9;
                break;
            case 48: // 0
                gateInputCount = 10;
                break;
            case RIGHT_ARROW:
                gateDirection = 0;
                break;
            case DOWN_ARROW:
                gateDirection = 1;
                break;
            case LEFT_ARROW:
                gateDirection = 2;
                break;
            case UP_ARROW:
                gateDirection = 3;
                break;
            
            default:
        }
    }
}

function handleSelection(x1, y1, x2, y2) {
    // TODO: Implement selecting all elements in the given rectangle
    //       Giving options to delete or reposition the elements
}

/*
    Handles the dragging of the canvas
    by calculating dx and dy
*/
function handleDragging() {
    if (mouseIsPressed && mouseButton == RIGHT) {
        frameRate(60);
        if (lastX != 0) {
            transform.dx += Math.round((mouseX - lastX) * dragSpeed);
            if (transform.dx > 0) transform.dx = 0;
        }
        if (lastY != 0) {
            transform.dy += Math.round((mouseY - lastY) * dragSpeed);
            if (transform.dy > 0) transform.dy = 0;
        }
        lastX = mouseX;
        lastY = mouseY;
        if (!simRunning) {
            reDraw();
        }
    } else {
        if (simRunning & !syncFramerate) {
            frameRate(60 - clockspeedSlider.value() / 2);
        }
        lastX = 0;
        lastY = 0;
    }
}

/*
    Draws the underlying grid on the canvas
*/
function drawGrid() {
    var i = Math.round(transform.dx);
    var j = Math.round(transform.dy);
    stroke(100);
    strokeWeight(1);

    while (i < width / transform.zoom) {
        line(i, 0, i, height / transform.zoom);
        i += GRIDSIZE;
    }

    while (j < height / transform.zoom) {
        line(0, j, width / transform.zoom, j);
        j += GRIDSIZE;
    }
}