// File: sketch.js

p5.disableFriendlyErrors = true; // jshint ignore:line

let gates = []; // All normal gates (no inputs, outputs, etc.)
let outputs = []; // All outputs
let inputs = []; // All inputs
let segments = []; // All wire segments
let pwSegments = [];
let conpoints = [];
let diodes = [];
let customs = [];
let wires = [];
let labels = [];

let selection = [];

let pwstartX = 0;
let pwstartY = 0;

let groups = [];

//let caption = []; // Name of the sketch, displayed on customs

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

let sDragX1 = 0; // Variables for
let sDragX2 = 0; // selection dragging
let sDragY1 = 0;
let sDragY2 = 0;

// Variables for dragging
let lastX = 0; var lastY = 0; // last mouse position
let dragSpeed = 1.5;

let transform = new Transformation(0, 0, 1);

let sClickBox = new ClickBox(0, 0, 0, 0, transform);
let showSClickBox = false;

let simRunning = false;
let propMode = false;

let syncFramerate = true;

// GUI Elements
let textInput, saveButton, loadButton, newButton; // Right hand side
let wireButton, deleteButton, simButton, labelBasic, labelAdvanced, // Left hand side
    andButton, orButton, xorButton, inputButton, buttonButton, clockButton,
    outputButton, clockspeedSlider, undoButton, redoButton, diodeButton, crText, propertiesButton, labelButton;
let counter4Button, counter2Button, decoder4Button, decoder2Button, dFlipFlopButton, rsFlipFlopButton, reg4Button,
    add4BitButton, mux1Button, mux2Button, mux3Button, demux1Button, demux2Button, demux3Button, halfaddButton, fulladdButton, ascustomButton;
let updater, sfcheckbox;
// Elements for the properties menu
let inputIsTopBox, inputCaptionBox;
let outputCaptionBox, outputColorBox;
let propInput = -1;
let propOutput = -1;
let propLabel = -1;
// Hide right click menu
document.addEventListener('contextmenu', event => event.preventDefault());
let cnv; // Canvas variable

/*
    Sets up the canvas and caps the framerate
*/
function setup() { // jshint ignore:line
    // Creates the canvas in full window size
    cnv = createCanvas(windowWidth - 150, windowHeight - 60);
    //cnv.position(250, 150);
    cnv.style('margin-top','3.5em');
    cnv.style('margin-left','9.5em');

    // Prevents the input field from being focused when clicking in the canvas
    document.addEventListener('mousedown', function (event) {
        if (event.detail > 1) {
            event.preventDefault();
        }
    }, false);

    document.title = 'New Sketch - LogiJS';

    // Left Side Buttons
    // Adds and-gates
    andButton = createButton('And-Gate');
    andButton.position(5, 80);
    andButton.mousePressed(andClicked);
    andButton.elt.style.width = "117px";
    andButton.elt.className = "button";

    // Adds or-gates
    orButton = createButton('Or-Gate');
    orButton.position(5, 104);
    orButton.mousePressed(orClicked);
    orButton.elt.style.width = "117px";
    orButton.elt.className = "button";

    // Adds xor-gates
    xorButton = createButton('Xor-Gate');
    xorButton.position(5, 128);
    xorButton.mousePressed(xorClicked);
    xorButton.elt.style.width = "117px";
    xorButton.elt.className = "button";

    // Adds switches
    inputButton = createButton('Switch');
    inputButton.position(5, 152);
    inputButton.mousePressed(inputClicked);
    inputButton.elt.style.width = "117px";
    inputButton.elt.className = "button";

    // Adds buttons (short impulse)
    buttonButton = createButton('Button');
    buttonButton.position(5, 176);
    buttonButton.mousePressed(buttonClicked);
    buttonButton.elt.style.width = "117px";
    buttonButton.elt.className = "button";

    // Adds clocks (variable impulse)
    clockButton = createButton('Clock');
    clockButton.position(5, 200);
    clockButton.mousePressed(clockClicked);
    clockButton.elt.style.width = "117px";
    clockButton.elt.className = "button";

    // Adds outputs (lamps)
    outputButton = createButton('Lamp');
    outputButton.position(5, 224);
    outputButton.mousePressed(outputClicked);
    outputButton.elt.style.width = "117px";
    outputButton.elt.className = "button";

    // Adds a counter (2Bit)
    counter2Button = createButton('2Bit-Counter');
    counter2Button.position(5, 270);
    counter2Button.mousePressed(function () { return customClicked('2BitCounter.json'); });
    counter2Button.elt.style.width = "117px";
    counter2Button.elt.className = "button";

    // Adds a counter (4Bit)
    counter4Button = createButton('4Bit-Counter');
    counter4Button.position(5, 294);
    counter4Button.mousePressed(function () { return customClicked('4BitCounter.json'); });
    counter4Button.elt.style.width = "117px";
    counter4Button.elt.className = "button";

    // Adds a decoder (2Bit)
    decoder2Button = createButton('2Bit-Decoder');
    decoder2Button.position(5, 318);
    decoder2Button.mousePressed(function () { return customClicked('2BitDec.json'); });
    decoder2Button.elt.style.width = "117px";
    decoder2Button.elt.className = "button";

    // Adds a decoder (4Bit)
    decoder4Button = createButton('4Bit-Decoder');
    decoder4Button.position(5, 342);
    decoder4Button.mousePressed(function () { return customClicked('4BitDec.json'); });
    decoder4Button.elt.style.width = "117px";
    decoder4Button.elt.className = "button";

    // Adds an adder (4Bit)
    add4BitButton = createButton('4Bit-Adder');
    add4BitButton.position(5, 366);
    add4BitButton.mousePressed(function () { return customClicked('4BitNeu.json'); });
    add4BitButton.elt.style.width = "117px";
    add4BitButton.elt.className = "button";

    // Adds a d-flipflop
    dFlipFlopButton = createButton('D-FlipFlop');
    dFlipFlopButton.position(5, 390);
    dFlipFlopButton.mousePressed(function () { return customClicked('d-flipflop.json'); });
    dFlipFlopButton.elt.style.width = "117px";
    dFlipFlopButton.elt.className = "button";

    // Adds an rs-flipflop
    rsFlipFlopButton = createButton('RS-FlipFlop');
    rsFlipFlopButton.position(5, 414);
    rsFlipFlopButton.mousePressed(function () { return customClicked('rsNoWhobble.json'); });
    rsFlipFlopButton.elt.style.width = "117px";
    rsFlipFlopButton.elt.className = "button";

    // Adds a register (4Bit)
    reg4Button = createButton('4Bit-Register');
    reg4Button.position(5, 438);
    reg4Button.mousePressed(function () { return customClicked('4BitReg.json'); });
    reg4Button.elt.style.width = "117px";
    reg4Button.elt.className = "button";

    // Adds a 1-multiplexer
    mux1Button = createButton('1-Multiplexer');
    mux1Button.position(5, 462);
    mux1Button.mousePressed(function () { return customClicked('1-mux.json'); });
    mux1Button.elt.style.width = "117px";
    mux1Button.elt.className = "button";

    // Adds a 2-multiplexer
    mux2Button = createButton('2-Multiplexer');
    mux2Button.position(5, 486);
    mux2Button.mousePressed(function () { return customClicked('2-mux.json'); });
    mux2Button.elt.style.width = "117px";
    mux2Button.elt.className = "button";

    // Adds a 3-multiplexer
    mux3Button = createButton('3-Multiplexer');
    mux3Button.position(5, 510);
    mux3Button.mousePressed(function () { return customClicked('3-mux.json'); });
    mux3Button.elt.style.width = "117px";
    mux3Button.elt.className = "button";

    // Adds a 1-demultiplexer
    demux1Button = createButton('1-Demultiplexer');
    demux1Button.position(5, 534);
    demux1Button.mousePressed(function () { return customClicked('1-demux.json'); });
    demux1Button.elt.style.width = "117px";
    demux1Button.elt.className = "button";

    // Adds a 2-demultiplexer
    demux2Button = createButton('2-Demultiplexer');
    demux2Button.position(5, 558);
    demux2Button.mousePressed(function () { return customClicked('2-demux.json'); });
    demux2Button.elt.style.width = "117px";
    demux2Button.elt.className = "button";

    // Adds a 3-demultiplexer
    demux3Button = createButton('3-Demultiplexer');
    demux3Button.position(5, 582);
    demux3Button.mousePressed(function () { return customClicked('3-demux.json'); });
    demux3Button.elt.style.width = "117px";
    demux3Button.elt.className = "button";

    // Adds a Half Adder
    halfaddButton = createButton('Half Adder');
    halfaddButton.position(5, 606);
    halfaddButton.mousePressed(function () { return customClicked('halbadd.json'); });
    halfaddButton.elt.style.width = "117px";
    halfaddButton.elt.className = "button";

    // Adds a Full Adder
    fulladdButton = createButton('Full Adder');
    fulladdButton.position(5, 630);
    fulladdButton.mousePressed(function () { return customClicked('volladd.json'); });
    fulladdButton.elt.style.width = "117px";
    fulladdButton.elt.className = "button";

    //Upper left
    // Activates the wiring mode
    wireButton = createButton('');
    wireButton.style('background-image','url(Wiring.svg)');
    wireButton.style('background-size','3em');
    wireButton.style('background-repeat','no-repeat');
    wireButton.style('background-position','center');
    wireButton.style('height','3em');
    wireButton.style('width','2em');
    wireButton.position(0, 0);
    wireButton.style('margin-left','10.17em');
    wireButton.style('margin-top','0.45em');
    wireButton.mousePressed(wiringClicked);
    wireButton.elt.className = "button";
    wireButton.mouseOver(() => {
        wiringLabel = createP('Wiring');
        wiringLabel.position(mouseX,mouseY);
        wiringLabel.style('margin-left','7em');
        wiringLabel.style('margin-top','3.9em');
        wiringLabel.style('color','white');
        wiringLabel.style('');
        wiringLabel.style('background-color','black');
    });
    wireButton.mouseOut(() => {
        wiringLabel.remove();
    });

    // Activates the delete mode (objects and wires)
    deleteButton = createButton('');
    deleteButton.style('background-image','url(Delete.svg)');
    deleteButton.style('background-size','3em');
    deleteButton.style('background-repeat','no-repeat');
    deleteButton.style('background-position','center');
    deleteButton.style('height','3em');
    deleteButton.style('width','2em');
    deleteButton.position(0, 0);
    deleteButton.style('margin-left','13.8em');
    deleteButton.style('margin-top','0.45em');
    deleteButton.mousePressed(deleteClicked);
    deleteButton.elt.className = "button";
    deleteButton.mouseOver(() => {
        deleteHoverLabel = createP('Delete');
        deleteHoverLabel.style('position','absolute');
        deleteHoverLabel.position(mouseX,mouseY);
    });
    deleteButton.mouseOut(() => {
        deleteHoverLabel.remove();
    });

    // Starts and stops the simulation
    simButton = createButton('Start');
    simButton.elt.style.width = '34px';
    simButton.position(0, 0);
    simButton.style('margin-left','17.5em');
    simButton.style('margin-top','0.45em');
    simButton.mousePressed(simClicked);
    simButton.elt.className = "button";
    simButton.mouseOver(() => {
        simHoverLabel = createP('Start');
        simHoverLabel.style('color','blue');
        simHoverLabel.position(mouseX,mouseY);
    });
    simButton.mouseOut(() => {
        simHoverLabel.remove();
    });

    // Adds text before the Clockrate slider
    crText = createP('Clock rate: ');
    crText.elt.style.color = 'white';
    crText.elt.style.fontFamily = 'Arial';
    crText.elt.style.margin = 0;
    crText.position(0, 0);
    crText.style('margin-left','17em');
    crText.style('margin-top','2em');
    crText.elt.className = 'label';

    // A slider for adjusting the clock speed
    clockspeedSlider = createSlider(1, 60, 30, 1);
    clockspeedSlider.position(0, 0);
    clockspeedSlider.style('width', '80px');
    clockspeedSlider.style('margin', '0px');
    clockspeedSlider.style('margin-left','22.5em');
    clockspeedSlider.style('margin-top','1.9em');
    clockspeedSlider.elt.className = 'slider';

    // Undos the last action
    undoButton = createButton('Undo');
    undoButton.position(532, 4);
    undoButton.mousePressed(() => {
        undo();
    });
    undoButton.elt.disabled = true;
    undoButton.elt.className = "button";

    // Redos the last action
    redoButton = createButton('Redo');
    redoButton.position(598, 4);
    redoButton.mousePressed(() => {
        redo();
    });
    redoButton.elt.disabled = true;
    redoButton.elt.className = "button";

    // Activates the mode for area selecting
    selectButton = createButton('Select');
    selectButton.position(664, 4);
    selectButton.mousePressed(startSelect);
    selectButton.elt.className = "button";

    // Adds diodes (barricade in one direction)
    diodeButton = createButton('Toggle Diodes');
    diodeButton.position(736, 4);
    diodeButton.mousePressed(diodeClicked);
    //diodeButton.elt.style.width = "117px";
    diodeButton.elt.className = "button";

    // Adds labels
    labelButton = createButton('Label');
    labelButton.position(863, 4);
    labelButton.mousePressed(labelButtonClicked);
    labelButton.elt.className = "button";

    // Toggles the properties mode
    propertiesButton = createButton('Properties');
    propertiesButton.position(930, 4);
    propertiesButton.mousePressed(function () {
        ctrlMode = 'none';
        startPropMode();
    });
    propertiesButton.elt.className = "button";

    sfcheckbox = createCheckbox('Sync FPS', true);
    sfcheckbox.changed(function () {
        syncFramerate = sfcheckbox.checked();
        if (!sfcheckbox.checked() && simRunning) {
            updater = setInterval(updateTick, 1);
        } else {
            clearInterval(updater);
        }
    });
    sfcheckbox.elt.style.color = 'white';
    sfcheckbox.elt.style.fontFamily = 'Arial';
    sfcheckbox.position(1026, 4);
    sfcheckbox.elt.className = 'checkbox';

    // Upper right
    // Input field for the file name
    textInput = createInput('');
    textInput.attribute('placeholder','New Sketch');
    textInput.size(150, 15);
    textInput.position(windowWidth - textInput.width - 203, 4);

    // Clears the canvas and resets the view
    newButton = createButton('New');
    newButton.position(windowWidth - textInput.width - 262, 4);
    newButton.mousePressed(newClicked);
    newButton.elt.className = "button";

    // Button to save the sketch
    saveButton = createButton('Save');
    saveButton.position(windowWidth - 198, 4);
    saveButton.mousePressed(saveClicked);
    saveButton.elt.className = "button";

    // Button to load a sketch
    loadButton = createButton('Load');
    loadButton.position(windowWidth - 134, 4);
    loadButton.mousePressed(loadClicked);
    loadButton.elt.className = "button";

    // Button to import as custom
    ascustomButton = createButton('Import');
    ascustomButton.position(windowWidth - 70, 4);
    ascustomButton.mousePressed(function () { return customClicked(textInput.value() + '.json'); });
    ascustomButton.elt.className = "button";

    /*
        Elements for the properties mode
    */
    inputIsTopBox = createCheckbox('Set to top', false);
    inputIsTopBox.hide();
    inputIsTopBox.position(windowWidth - 110, 35);
    inputIsTopBox.changed(newIsTopState);
    inputIsTopBox.elt.style.color = 'white';
    inputIsTopBox.elt.style.fontFamily = 'Arial';

    inputCaptionBox = createInput('');
    inputCaptionBox.hide();
    inputCaptionBox.size(50, 15);
    inputCaptionBox.position(windowWidth - 75, 60);
    inputCaptionBox.input(newInputCaption);

    outputCaptionBox = createInput('');
    outputCaptionBox.hide();
    outputCaptionBox.size(50, 15);
    outputCaptionBox.position(windowWidth - 75, 60);
    outputCaptionBox.input(newOutputCaption);

    outputColorBox = createSelect();
    outputColorBox.hide();
    outputColorBox.position(windowWidth - 80, 35);
    outputColorBox.option('red');
    outputColorBox.option('yellow');
    outputColorBox.option('green');
    outputColorBox.option('blue');
    outputColorBox.changed(newOutputColor);

    // Adds text 'Basic' under the 'Wiring' button
    labelBasic = createP('Basic');
    labelBasic.elt.style.color = 'white';
    labelBasic.elt.style.fontFamily = 'Arial';
    labelBasic.elt.style.margin = 0;
    labelBasic.position(57, 59);
    labelBasic.elt.className = 'label';

    // Adds text 'Basic' under the 'Wiring' button
    labelAdvanced = createP('Advanced');
    labelAdvanced.elt.style.color = 'white';
    labelAdvanced.elt.style.fontFamily = 'Arial';
    labelAdvanced.elt.style.margin = 0;
    labelAdvanced.position(39, 250);
    labelAdvanced.elt.className = 'label';

    labelTextBox = createInput('');
    labelTextBox.hide();
    labelTextBox.size(115, 20);
    labelTextBox.position(windowWidth - 125, 60);
    labelTextBox.input(labelChanged);

    frameRate(60); // Caps the framerate at 60 FPS

    let loadfile = urlParam('sketch');
    if (loadfile !== "") {
        document.title = String(loadfile + ' - LogiJS');
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
    document.title = textInput.value() + ' - LogiJS';
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
    labels = [];
    actionUndo = [];
    actionRedo = [];
    transform = new Transformation(0, 0, 1);
    gridSize = GRIDSIZE;
    endSimulation(); // End the simulation, if started
    stopPropMode(); // Restarting PropMode so that the menu hides
    startPropMode(); // when new is clicked while it's open
    ctrlMode = 'none'; // Clear the control mode
    wireMode = 'none';
    document.title = 'New Sketch - LogiJS';
    textInput.value('New Sketch');
    findLines();
    reDraw();
}

function wiringClicked() {
    ctrlMode = 'addWire';
    wireMode = 'none';
}

function deleteClicked() {
    ctrlMode = 'delete';
}

function labelChanged() {
    labels[propLabel].alterText(labelTextBox.value());
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

function labelButtonClicked() {
    ctrlMode = 'addObject';
    addType = 'label';
}

/*
    Adds a new gate with given type, input count and direction
*/
function addGate(type, inputs, direction) {
    for (let i = 0; i < gates.length; i++) {
        if ((gates[i].x === Math.round(((mouseX - GRIDSIZE / 2) / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE) &&
            (gates[i].y === Math.round(((mouseY - GRIDSIZE / 2) / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE)) {
            return;
        }
    }
    let newGate = null;
    switch (type) {
        case 'and':
            newGate = new LogicGate(mouseX, mouseY, transform, direction, inputs, 1, 'and', '&');
            newGate.setCoordinates(mouseX / transform.zoom - transform.dx, mouseY / transform.zoom - transform.dy);
            newGate.updateClickBoxes();
            gates.push(newGate);
            pushUndoAction('addGate', [], newGate);
            break;
        case 'or':
            newGate = new LogicGate(mouseX, mouseY, transform, direction, inputs, 1, 'or', '≥1');
            newGate.setCoordinates(mouseX / transform.zoom - transform.dx, mouseY / transform.zoom - transform.dy);
            newGate.updateClickBoxes();
            gates.push(newGate);
            pushUndoAction('addGate', [], newGate);
            break;
        case 'xor':
            newGate = new LogicGate(mouseX, mouseY, transform, direction, inputs, 1, 'xor', '=1');
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
            if ((customs[i].x === Math.round(((mouseX - GRIDSIZE / 2) / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE) &&
                (customs[i].y === Math.round(((mouseY - GRIDSIZE / 2) / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE)) {
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
        if ((outputs[i].x === Math.round((mouseX / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE) &&
            (outputs[i].y === Math.round((mouseY / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE)) {
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
        if ((inputs[i].x === (Math.round((mouseX / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE) - GRIDSIZE / 2) &&
            (inputs[i].y === (Math.round((mouseY / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE) - GRIDSIZE / 2)) {
            return;
        }
    }
    var newInput = new Input(mouseX, mouseY, transform);
    newInput.setCoordinates(mouseX / transform.zoom - transform.dx, mouseY / transform.zoom - transform.dy);
    newInput.updateClickBox();
    if (newIsButton) {
        newInput.framecount = BUTCOUNT;
    } else if (newIsClock) {
        newInput.framecount = 60 - clockspeedSlider.value();
    } else {
        newInput.framecount = -1;
    }
    newInput.clock = newIsClock;
    inputs.push(newInput);
    pushUndoAction('addIn', [], newInput);
    reDraw();
}

function addLabel() {
    for (var i = 0; i < labels.length; i++) {
        if ((labels[i].x === (Math.round((mouseX / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE)) &&
            (labels[i].y === (Math.round((mouseY / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE))) {
            return;
        }
    }
    var newLabel = new Label(mouseX, mouseY, 'New label', transform);
    newLabel.setCoordinates(mouseX / transform.zoom - transform.dx, mouseY / transform.zoom - transform.dy);
    newLabel.updateClickBox();
    labels.push(newLabel);
    pushUndoAction('addLabel', [], newLabel);
    reDraw();
}

/*
    Adds a diode as a special type of ConPoints in the diodes array
    Caution: Also deletes diodes if existing => More like toggleDiode()
*/
function toggleDiode() {
    for (var i = 0; i < diodes.length; i++) {
        if ((diodes[i].x === Math.round((mouseX / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE) &&
            (diodes[i].y === Math.round((mouseY / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE)) {
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
    for (const elem of customs[customNumber].responsibles) {
        customs.splice(customs.indexOf(elem), 1);
    }
    pushUndoAction('delCust', [], customs.splice(customNumber, 1));
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
    Deletes the given diode
*/
function deleteDiode(diodeNumber) {
    pushUndoAction('delDi', [], diodes.splice(diodeNumber, 1));
    reDraw();
}

/*
    Deletes the given label
*/
function deleteLabel(labelNumber) {
    pushUndoAction('delLabel', [], labels.splice(labelNumber, 1));
    reDraw();
}

/*
    Starts the simulation mode
    - Groups are created and objects are integrated
    - simRunning is set so that the sketch can't be altered
*/
function startSimulation() {
    simButton.elt.innerHTML = 'Stop'; // Alter the caption of the Start/Stop buttons
    disableButtons(true);
    stopPropMode();
    showSClickBox = false;

    // Tell all customs that the simulation started
    for (let i = 0; i < customs.length; i++) {
        customs[i].setSimRunning(true);
    }

    // Parse all groups, integrate all elements and parse again (required for some reason)
    parseGroups();
    integrateElement();
    parseGroups();

    // Reduce the displayed wires for performance
    for (let i = 0; i < groups.length; i++) {
        groups[i].findLines();
    }

    simRunning = true;
    propMode = false;
    // If the update cycle shouldn't be synced with the framerate,
    // update every 10ms (may be too fast for slower machines, not a great solution)
    if (!sfcheckbox.checked()) {
        updater = setInterval(updateTick, 1);
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
    ctrlMode = 'none';
    startPropMode();
    disableButtons(false);
    // Enable the Undo/Redo buttons depending on if there
    // are steps to be undone or redone
    redoButton.elt.disabled = (actionRedo.length === 0);
    undoButton.elt.disabled = (actionUndo.length === 0);
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
    clearInterval(updater);
    reDraw();
}

function disableButtons(status) {
    undoButton.elt.disabled = status;
    redoButton.elt.disabled = status;
    andButton.elt.disabled = status;
    orButton.elt.disabled = status;
    xorButton.elt.disabled = status;
    wireButton.elt.disabled = status;
    inputButton.elt.disabled = status;
    outputButton.elt.disabled = status;
    buttonButton.elt.disabled = status;
    clockButton.elt.disabled = status;
    deleteButton.elt.disabled = status;
    selectButton.elt.disabled = status;
    diodeButton.elt.disabled = status;
    reg4Button.elt.disabled = status;
    decoder4Button.elt.disabled = status;
    decoder2Button.elt.disabled = status;
    counter2Button.elt.disabled = status;
    counter4Button.elt.disabled = status;
    mux1Button.elt.disabled = status;
    mux2Button.elt.disabled = status;
    mux3Button.elt.disabled = status;
    demux1Button.elt.disabled = status;
    demux2Button.elt.disabled = status;
    demux3Button.elt.disabled = status;
    dFlipFlopButton.elt.disabled = status;
    rsFlipFlopButton.elt.disabled = status;
    add4BitButton.elt.disabled = status;
    halfaddButton.elt.disabled = status;
    fulladdButton.elt.disabled = status;
    ascustomButton.elt.disabled = status;
    propertiesButton.elt.disabled = status;
    labelButton.elt.disabled = status;
    if (status) {
        labelBasic.elt.style.color = '#969696';
        labelAdvanced.elt.style.color = '#969696';
    } else {
        labelBasic.elt.style.color = 'white';
        labelAdvanced.elt.style.color = 'white';
    }
}

/*
    Executes in every frame, draws objects and stuff
*/
function draw() {
    if (simRunning) {
        if (sfcheckbox.checked()) {
            updateTick();
        }
        reDraw();
    }

    // If wire preview is active, generate a segment set and display the preview segments
    // When the mode is delete, mark the wire by drawing it in blue
    if (wireMode === 'preview' || wireMode === 'delete') {
        reDraw();
        scale(transform.zoom);
        translate(transform.dx, transform.dy); // Handle the offset from dragging and zooming
        if (!mouseOverGUI()) {
            generateSegmentSet(pwstartX, pwstartY, Math.round((mouseX / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE,
                Math.round((mouseY / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE, 0);
            // Display preview segments
            for (const elem of pwSegments) {
                elem.show(wireMode === 'delete');
            }
        }
        scale(1 / transform.zoom);
        translate(-transform.zoom * transform.dx, -transform.zoom * transform.dy);
    }

    // If an area should be selected, get the new end point and draw the transparent rectangle
    if (ctrlMode === 'select') {
        reDraw();
        scale(transform.zoom);
        translate(transform.dx, transform.dy); // Handle the offset from dragging and zooming
        fill(0, 0, 0, 100);
        strokeWeight(0);
        if (selectMode === 'start') {
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
                value.framecount = 60 - clockspeedSlider.value();
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
    background(150);
    scale(transform.zoom);
    drawGrid();
    translate(transform.dx, transform.dy); // Handle the offset from dragging and zooming
    //var t0 = performance.now();
    if (simRunning) {
        for (const elem of groups) {
            elem.show();
        }
    } else {
        for (const elem of wires) {
            elem.show();
        }
    }
    //var t1 = performance.now();
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
    for (const elem of conpoints) {
        elem.show();
    }
    for (const elem of outputs) {
        elem.show();
    }
    for (const elem of inputs) {
        elem.show();
    }
    for (const elem of diodes) {
        elem.show();
    }
    textSize(20);
    textAlign(LEFT, TOP);
    for (const elem of labels) {
        elem.show();
    }

    if (showSClickBox) {
        sClickBox.markClickBox();
    }

    // Draw the GUI at the end
    scale(1 / transform.zoom);
    translate(-transform.zoom * transform.dx, -transform.zoom * transform.dy); // Handle the offset from dragging and zooming
    fill(0);
    textSize(15); // Set text size to 15
    //textAlign(LEFT, TOP); // Align left for zoom label etc.
    stroke(0); // Set font parameters for zoom label etc.
    strokeWeight(1);

    // GUI Area
    text('Zoom: ' + Math.round(transform.zoom * 100) + '%', 10, 5); // Show zoom label
    //text('mouseX: ' + mouseX, 160, 60);
    //text('mouseY: ' + mouseY, 160, 80);
    //text('mouseX trans.: ' + Math.round((mouseX / transform.zoom - transform.dx)), 160, 100);
    //text('mouseY trans.: ' + Math.round((mouseY / transform.zoom - transform.dy)), 160, 120);
    text('FPS: ' + Math.round(frameRate()), 10, 25);

    strokeWeight(0);
    //rect(0, 0, windowWidth, 30);
    //rect(0, 30, 150, windowHeight);
    if (propMode && propInput + propOutput + propLabel >= -2) {
        rect(window.width - 130, 0, 130, 60);
    }
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
        if (segments[i].endX === x && segments[i].endY === y) {
            if (i !== j) {
                indexList.push(i);
            }
        }
        if (segments[i].startX === x && segments[i].startY === y) {
            if (i !== j) {
                indexList.push(i);
            }
        }
    }
    return indexList;
}

function startPropMode() {
    propMode = true;
    ctrlMode = 'none';
}

function stopPropMode() {
    propMode = false;
    hidePropMenu();
    unmarkAllTargets();
}

// Hides the PropMenu without quitting the PropMode
// Used, when the user clickes outside a valid target for PropMode
function hidePropMenu() {
    inputIsTopBox.hide();
    inputCaptionBox.hide();
    outputCaptionBox.hide();
    outputColorBox.hide();
    labelTextBox.hide();
}

function unmarkAllTargets() {
    for (const elem of inputs) {
        elem.mark(false);
    }
    for (const elem of outputs) {
        elem.mark(false);
    }
    for (const elem of labels) {
        elem.mark(false);
    }
    propInput = -1;
    propOutput = -1;
    propLabel = -1;
}

function unmarkAll() {
    for (const elem of inputs) {
        elem.mark(false);
    }
    for (const elem of outputs) {
        elem.mark(false);
    }
    for (const elem of labels) {
        elem.mark(false);
    }
    for (const elem of gates) {
        elem.marked = false;
    }
    for (const elem of customs) {
        elem.marked = false;
    }
    for (const elem of conpoints) {
        elem.marked = false;
    }
    for (const elem of diodes) {
        elem.marked = false;
    }
    for (const elem of wires) {
        elem.marked = false;
    }
}

function showInputPropMenu() {
    outputCaptionBox.hide();
    outputColorBox.hide();
    labelTextBox.hide();
    inputIsTopBox.show();
    inputCaptionBox.show();
    inputIsTopBox.checked(inputs[propInput].isTop);
    inputCaptionBox.value(inputs[propInput].lbl);
    propOutput = -1;
    propLabel = -1;
    for (const elem of outputs) {
        elem.mark(false);
    }
    for (const elem of labels) {
        elem.mark(false);
    }
}

function showLabelPropMenu() {
    outputCaptionBox.hide();
    outputColorBox.hide();
    inputIsTopBox.hide();
    inputCaptionBox.hide();
    labelTextBox.show();
    labelTextBox.value(labels[propLabel].txt);
    propOutput = -1;
    propInput = -1;
    for (const elem of outputs) {
        elem.mark(false);
    }
    for (const elem of inputs) {
        elem.mark(false);
    }
}

function showOutputPropMenu() {
    inputIsTopBox.hide();
    inputCaptionBox.hide();
    labelTextBox.hide();
    outputCaptionBox.show();
    outputColorBox.show();
    switch (outputs[propOutput].colr) {
        case 0:
            outputColorBox.value('red');
            break;
        case 1:
            outputColorBox.value('yellow');
            break;
        case 2:
            outputColorBox.value('green');
            break;
        case 3:
            outputColorBox.value('blue');
            break;
        default:
    }
    outputCaptionBox.value(outputs[propOutput].lbl);
    propInput = -1;
    propLabel = -1;
    for (const elem of inputs) {
        elem.mark(false);
    }
    for (const elem of labels) {
        elem.mark(false);
    }
}

function newIsTopState() {
    inputs[propInput].setIsTop(inputIsTopBox.checked());
}

function newInputCaption() {
    inputs[propInput].lbl = inputCaptionBox.value();
}

function newOutputCaption() {
    outputs[propOutput].lbl = outputCaptionBox.value();
}

function newOutputColor() {
    switch (outputColorBox.value()) {
        case 'red':
            outputs[propOutput].colr = 0;
            break;
        case 'yellow':
            outputs[propOutput].colr = 1;
            break;
        case 'green':
            outputs[propOutput].colr = 2;
            break;
        case 'blue':
            outputs[propOutput].colr = 3;
            break;
        default:
    }
    outputs[propOutput].updateColor();
}

function keyReleased() {
    if (textInput.elt !== document.activeElement) {
        switch (keyCode) {
            case 17: //ctrl	
                ctrlMode = 'none';
                break;
            default:

        }
    }
}
/*
    Check if a key was pressed and act accordingly
*/
function keyPressed() {
    if (textInput.elt !== document.activeElement) {
        switch (keyCode) {
            case ESCAPE:
                ctrlMode = 'none';
                startPropMode();
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
    } else if (keyCode === RETURN) {
        loadClicked();
    }
}

function handleSelection(x1, y1, x2, y2) {
    sClickBox.updatePosition(x1 + (x2 - x1) / 2, y1 + (y2 - y1) / 2);
    sClickBox.updateSize(x2 - x1, y2 - y1);
    sClickBox.setTransform(transform);
    showSClickBox = true;
    selection = [];
    for (let i = 0; i < gates.length; i++) {
        if (gates[i].x >= x1 && gates[i].x <= x2 && gates[i].y >= y1 && gates[i].y <= y2) {
            gates[i].marked = true;
            selection.push(gates[i]);
        }
    }
    for (let i = 0; i < customs.length; i++) {
        if (customs[i].visible && (customs[i].x >= x1 && customs[i].x <= x2 && customs[i].y >= y1 && customs[i].y <= y2)) {
            customs[i].marked = true;
            selection.push(customs[i]);
        }
    }
    for (let i = 0; i < inputs.length; i++) {
        if (inputs[i].x >= x1 && inputs[i].x <= x2 && inputs[i].y >= y1 && inputs[i].y <= y2) {
            inputs[i].marked = true;
            selection.push(inputs[i]);
        }
    }
    for (let i = 0; i < outputs.length; i++) {
        if (outputs[i].x >= x1 && outputs[i].x <= x2 && outputs[i].y >= y1 && outputs[i].y <= y2) {
            outputs[i].marked = true;
            selection.push(outputs[i]);
        }
    }
    for (let i = 0; i < conpoints.length; i++) {
        if (conpoints[i].x >= x1 && conpoints[i].x <= x2 && conpoints[i].y >= y1 && conpoints[i].y <= y2) {
            conpoints[i].marked = true;
            selection.push(conpoints[i]);
        }
    }
    for (let i = 0; i < diodes.length; i++) {
        if (diodes[i].x >= x1 && diodes[i].x <= x2 && diodes[i].y >= y1 && diodes[i].y <= y2) {
            diodes[i].marked = true;
            selection.push(diodes[i]);
        }
    }
    for (let i = 0; i < labels.length; i++) {
        if (labels[i].x >= x1 && labels[i].x <= x2 && labels[i].y >= y1 && labels[i].y <= y2) {
            labels[i].marked = true;
            selection.push(labels[i]);
        }
    }
    for (let i = 0; i < wires.length; i++) {
        if ((wires[i].direction === 0) && ((wires[i].startX >= x1 || x1 <= wires[i].endX) && (wires[i].startX <= x2 || x2 >= wires[i].endX)) && (wires[i].startY >= y1 && wires[i].endY <= y2)) {
            wires[i].marked = true;
            selection.push(wires[i]);
        } else if ((wires[i].direction === 1) && ((wires[i].startY >= y1 || y1 <= wires[i].endY) && (wires[i].startY <= y2 || y2 >= wires[i].endY)) && (wires[i].startX >= x1 && wires[i].endX <= x2)) {
            wires[i].marked = true;
            selection.push(wires[i]);
        }
    }
    segments = [];
    for (let i = 0; i < wires.length; i++) {
        if (wires[i].startX === wires[i].endX) {
            // Vertical wire, split in n vertical segments
            for (let j = 0; j < (wires[i].endY - wires[i].startY) / GRIDSIZE; j++) {
                segments.push(new WSeg(1, wires[i].startX, (wires[i].startY + j * GRIDSIZE), false, transform));
            }
        } else if (wires[i].startY === wires[i].endY) {
            // Horizontal wire, split in n horizontal segments
            for (let j = 0; j < (wires[i].endX - wires[i].startX) / GRIDSIZE; j++) {
                segments.push(new WSeg(0, wires[i].startX + j * GRIDSIZE, wires[i].startY, false, transform));
            }
        }
    }
    //findLines();
}

function moveSelection() {
    let deltaX = sDragX2 - sDragX1;
    let deltaY = sDragY2 - sDragY1;
    sClickBox.updatePosition(sClickBox.x + deltaX, sClickBox.y + deltaY);
    for (let i = 0; i < selection.length; i++) {
        selection[i].alterPosition(deltaX, deltaY);
    }
    segments = [];
    for (let i = 0; i < wires.length; i++) {
        if (wires[i].startX === wires[i].endX) {
            // Vertical wire, split in n vertical segments
            for (let j = 0; j < (wires[i].endY - wires[i].startY) / GRIDSIZE; j++) {
                segments.push(new WSeg(1, wires[i].startX, (wires[i].startY + j * GRIDSIZE), false, transform));
            }
        } else if (wires[i].startY === wires[i].endY) {
            // Horizontal wire, split in n horizontal segments
            for (let j = 0; j < (wires[i].endX - wires[i].startX) / GRIDSIZE; j++) {
                segments.push(new WSeg(0, wires[i].startX + j * GRIDSIZE, wires[i].startY, false, transform));
            }
        }
    }
    doConpoints();
}

/*
    Handles the dragging of the canvas
    by calculating dx and dy
*/
function handleDragging() {
    if (mouseIsPressed && mouseButton === RIGHT) {
        frameRate(60);
        if (lastX !== 0) {
            transform.dx += Math.round((mouseX - lastX) * dragSpeed);
            if (transform.dx > 0) {
                transform.dx = 0;
            }
        }
        if (lastY !== 0) {
            transform.dy += Math.round((mouseY - lastY) * dragSpeed);
            if (transform.dy > 0) {
                transform.dy = 0;
            }
        }
        lastX = mouseX;
        lastY = mouseY;
        if (!simRunning) {
            reDraw();
        }
    } else {
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
