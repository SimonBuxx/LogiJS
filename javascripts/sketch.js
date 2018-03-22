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

let ctrlMode = 'none'; // Possible modes: none, delete, addObject, addWire, select ...
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
let initX = -1;
let initY = -1;

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
    outputButton, clockspeedSlider, undoButton, redoButton, diodeButton, propertiesButton, labelButton;
let counter4Button, counter2Button, decoder4Button, decoder2Button, dFlipFlopButton, rsFlipFlopButton, reg4Button,
    add4BitButton, mux1Button, mux2Button, mux3Button, demux1Button, demux2Button, demux3Button, halfaddButton, fulladdButton, ascustomButton;
let updater, sfcheckbox, gateInputSelect, labelGateInputs, directionSelect, labelDirection;
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
    cnv = createCanvas(windowWidth - 150, windowHeight - 30);
    cnv.position(150, 30);

    // Prevents the input field from being focused when clicking in the canvas
    document.addEventListener('mousedown', function (event) {
        if (event.detail > 1) {
            event.preventDefault();
        }
    }, false);

    document.title = 'New Sketch - LogiJS';
    console.log(windowWidth);
    console.log(windowHeight);


    //Div for the Left Side Buttons
    let leftSideButtons = createDiv(" ");
    leftSideButtons.elt.className = "scrollBoxLeft";
    let height = (windowHeight - 74 - 32 - 15);
    leftSideButtons.elt.style.height = height.toString() + "px";
    leftSideButtons.elt.style.margin = '55px 0px';

    // Adds text 'Basic'
    labelBasic = createP('Basic');
    labelBasic.elt.style.color = 'white';
    labelBasic.elt.style.fontFamily = 'Arial';
    labelBasic.elt.className = 'label';
    labelBasic.elt.style.textAlign = 'center';
    labelBasic.elt.style.margin = '3px 0px 0px 0px';
    labelBasic.parent(leftSideButtons);

    // Left Side Buttons
    // Adds and-gates
    andButton = createButton('And-Gate');
    andButton.mousePressed(andClicked);
    andButton.elt.className = "buttonLeft";
    andButton.parent(leftSideButtons);

    // Adds or-gates
    orButton = createButton('Or-Gate');
    orButton.mousePressed(orClicked);
    orButton.elt.className = "buttonLeft";
    orButton.parent(leftSideButtons);

    // Adds xor-gates
    xorButton = createButton('Xor-Gate');
    xorButton.mousePressed(xorClicked);
    xorButton.elt.className = "buttonLeft";
    xorButton.parent(leftSideButtons);

    // Adds switches
    inputButton = createButton('Switch');
    inputButton.mousePressed(inputClicked);
    inputButton.elt.className = "buttonLeft";
    inputButton.parent(leftSideButtons);

    // Adds buttons (short impulse)
    buttonButton = createButton('Button');
    buttonButton.mousePressed(buttonClicked);
    buttonButton.elt.className = "buttonLeft";
    buttonButton.parent(leftSideButtons);

    // Adds clocks (variable impulse)
    clockButton = createButton('Clock');
    clockButton.mousePressed(clockClicked);
    clockButton.elt.className = "buttonLeft";
    clockButton.parent(leftSideButtons);

    // Adds outputs (lamps)
    outputButton = createButton('Lamp');
    outputButton.mousePressed(outputClicked);
    outputButton.elt.className = "buttonLeft";
    outputButton.parent(leftSideButtons);

    // Adds text 'Advanced'
    labelAdvanced = createP('Advanced');
    labelAdvanced.elt.style.color = 'white';
    labelAdvanced.elt.style.fontFamily = 'Arial';
    labelAdvanced.elt.style.textAlign = 'center';
    labelAdvanced.elt.style.margin = '3px 0px 0px 0px';
    labelAdvanced.elt.className = 'label';
    labelAdvanced.parent(leftSideButtons);

    // Adds a counter (2Bit)
    counter2Button = createButton('2Bit-Counter');
    counter2Button.mousePressed(function () { return customClicked('2BitCounter.json'); });
    counter2Button.elt.className = "buttonLeft";
    counter2Button.parent(leftSideButtons);
    // Adds a counter (4Bit)
    counter4Button = createButton('4Bit-Counter');
    counter4Button.mousePressed(function () { return customClicked('4BitCounter.json'); });
    counter4Button.elt.className = "buttonLeft";
    counter4Button.parent(leftSideButtons);
    // Adds a decoder (2Bit)
    decoder2Button = createButton('2Bit-Decoder');
    decoder2Button.mousePressed(function () { return customClicked('2BitDec.json'); });
    decoder2Button.elt.className = "buttonLeft";
    decoder2Button.parent(leftSideButtons);
    // Adds a decoder (4Bit)
    decoder4Button = createButton('4Bit-Decoder');
    decoder4Button.mousePressed(function () { return customClicked('4BitDec.json'); });
    decoder4Button.elt.className = "buttonLeft";
    decoder4Button.parent(leftSideButtons);
    // Adds an adder (4Bit)
    add4BitButton = createButton('4Bit-Adder');
    add4BitButton.mousePressed(function () { return customClicked('4BitNeu.json'); });
    add4BitButton.elt.className = "buttonLeft";
    add4BitButton.parent(leftSideButtons);
    // Adds a d-flipflop
    dFlipFlopButton = createButton('D-FlipFlop');
    dFlipFlopButton.mousePressed(function () { return customClicked('d-flipflop.json'); });
    dFlipFlopButton.elt.className = "buttonLeft";
    dFlipFlopButton.parent(leftSideButtons);
    // Adds an rs-flipflop
    rsFlipFlopButton = createButton('RS-FlipFlop');
    rsFlipFlopButton.mousePressed(function () { return customClicked('rsNoWhobble.json'); });
    rsFlipFlopButton.elt.className = "buttonLeft";
    rsFlipFlopButton.parent(leftSideButtons);
    // Adds a register (4Bit)
    reg4Button = createButton('4Bit-Register');
    reg4Button.mousePressed(function () { return customClicked('4BitReg.json'); });
    reg4Button.elt.className = "buttonLeft";
    reg4Button.parent(leftSideButtons);
    // Adds a 1-multiplexer
    mux1Button = createButton('1-Multiplexer');
    mux1Button.mousePressed(function () { return customClicked('1-mux.json'); });
    mux1Button.elt.className = "buttonLeft";
    mux1Button.parent(leftSideButtons);
    // Adds a 2-multiplexer
    mux2Button = createButton('2-Multiplexer');
    mux2Button.mousePressed(function () { return customClicked('2-mux.json'); });
    mux2Button.elt.className = "buttonLeft";
    mux2Button.parent(leftSideButtons);
    // Adds a 3-multiplexer
    mux3Button = createButton('3-Multiplexer');
    mux3Button.mousePressed(function () { return customClicked('3-mux.json'); });
    mux3Button.elt.className = "buttonLeft";
    mux3Button.parent(leftSideButtons);
    // Adds a 1-demultiplexer
    demux1Button = createButton('1-Demultiplexer');
    demux1Button.mousePressed(function () { return customClicked('1-demux.json'); });
    demux1Button.elt.className = "buttonLeft";
    demux1Button.parent(leftSideButtons);
    // Adds a 2-demultiplexer
    demux2Button = createButton('2-Demultiplexer');
    demux2Button.mousePressed(function () { return customClicked('2-demux.json'); });
    demux2Button.elt.className = "buttonLeft";
    demux2Button.parent(leftSideButtons);
    // Adds a 3-demultiplexer
    demux3Button = createButton('3-Demultiplexer');
    demux3Button.mousePressed(function () { return customClicked('3-demux.json'); });
    demux3Button.elt.className = "buttonLeft";
    demux3Button.parent(leftSideButtons);
    // Adds a Half Adder
    halfaddButton = createButton('Half Adder');
    halfaddButton.mousePressed(function () { return customClicked('halbadd.json'); });
    halfaddButton.elt.className = "buttonLeft";
    halfaddButton.parent(leftSideButtons);
    // Adds a Full Adder
    fulladdButton = createButton('Full Adder');
    fulladdButton.mousePressed(function () { return customClicked('volladd.json'); });
    fulladdButton.elt.className = "buttonLeft";
    fulladdButton.parent(leftSideButtons);

    // Adds text 'Gate inputs'
    labelGateInputs = createP('Gate inputs');
    labelGateInputs.hide();
    labelGateInputs.elt.style.color = 'white';
    labelGateInputs.elt.style.fontFamily = 'Arial';
    labelGateInputs.elt.style.textAlign = 'center';
    labelGateInputs.elt.style.margin = '3px 0px 0px 0px';
    labelGateInputs.elt.className = 'label';
    labelGateInputs.parent(leftSideButtons);

    gateInputSelect = createSelect();
    gateInputSelect.hide();
    gateInputSelect.option('1');
    gateInputSelect.option('2');
    gateInputSelect.option('3');
    gateInputSelect.option('4');
    gateInputSelect.option('5');
    gateInputSelect.option('6');
    gateInputSelect.option('7');
    gateInputSelect.option('8');
    gateInputSelect.option('9');
    gateInputSelect.option('10');
    gateInputSelect.changed(newGateInputNumber);
    gateInputSelect.elt.className = "selectLeft";
    gateInputSelect.parent(leftSideButtons);
    gateInputSelect.value('2');

    // Adds text 'Direction'
    labelDirection = createP('Direction');
    labelDirection.hide();
    labelDirection.elt.style.color = 'white';
    labelDirection.elt.style.fontFamily = 'Arial';
    labelDirection.elt.style.textAlign = 'center';
    labelDirection.elt.style.margin = '3px 0px 0px 0px';
    labelDirection.elt.className = 'label';
    labelDirection.parent(leftSideButtons);

    directionSelect = createSelect();
    directionSelect.hide();
    directionSelect.option('Right');
    directionSelect.option('Up');
    directionSelect.option('Left');
    directionSelect.option('Down');
    directionSelect.changed(newDirection);
    directionSelect.elt.className = "selectLeft";
    directionSelect.parent(leftSideButtons);
    directionSelect.value('Right');

    sfcheckbox = createCheckbox('Sync Ticks', true);
    sfcheckbox.hide();
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
    sfcheckbox.elt.style.textAlign = 'center';
    sfcheckbox.elt.style.margin = '10px 0 0 0';
    //sfcheckbox.position(946, 4);
    sfcheckbox.elt.className = 'checkbox';
    sfcheckbox.parent(leftSideButtons);

    // Adds text 'Clock speed'
    clockspeedLabel = createP('Clock speed');
    clockspeedLabel.hide();
    clockspeedLabel.elt.style.color = 'white';
    clockspeedLabel.elt.style.fontFamily = 'Arial';
    clockspeedLabel.elt.style.textAlign = 'center';
    clockspeedLabel.elt.style.margin = '3px 0px 0px 0px';
    clockspeedLabel.elt.className = 'label';
    clockspeedLabel.parent(leftSideButtons);

    // A slider for adjusting the clock speed
    clockspeedSlider = createSlider(1, 60, 30, 1);
    clockspeedSlider.hide();
    clockspeedSlider.changed(newClockspeed);
    clockspeedSlider.style('width', '141px');
    clockspeedSlider.style('margin', '5px');
    clockspeedSlider.elt.className = 'slider';
    clockspeedSlider.parent(leftSideButtons);

    //Upper left
    // Activates the wiring mode
    wireButton = createButton('Wiring');
    wireButton.position(153, 4);
    wireButton.mousePressed(wiringClicked);
    //wireButton.elt.style.width = "117px";
    wireButton.elt.className = "button";

    // Activates the delete mode (objects and wires)
    deleteButton = createButton('Delete');
    deleteButton.position(226, 4);
    deleteButton.mousePressed(deleteClicked);
    deleteButton.elt.className = "button";

    // Starts and stops the simulation
    simButton = createButton('Start');
    simButton.elt.style.width = '34px';
    simButton.position(299, 4);
    simButton.mousePressed(simClicked);
    simButton.elt.className = "button";

    // Undos the last action
    undoButton = createButton('Undo');
    undoButton.position(362, 4);
    undoButton.mousePressed(() => {
        undo();
    });
    undoButton.elt.disabled = true;
    undoButton.elt.className = "button";

    // Redos the last action
    redoButton = createButton('Redo');
    redoButton.position(427, 4);
    redoButton.mousePressed(() => {
        redo();
    });
    redoButton.elt.disabled = true;
    redoButton.elt.className = "button";

    // Activates the mode for area selecting
    selectButton = createButton('Select');
    selectButton.position(493, 4);
    selectButton.mousePressed(startSelect);
    selectButton.elt.className = "button";

    // Adds diodes (barricade in one direction)
    diodeButton = createButton('Diodes');
    diodeButton.position(565, 4);
    diodeButton.mousePressed(diodeClicked);
    //diodeButton.elt.style.width = "117px";
    diodeButton.elt.className = "button";

    // Adds labels
    labelButton = createButton('Label');
    labelButton.position(642, 4);
    labelButton.mousePressed(labelButtonClicked);
    labelButton.elt.className = "button";

    // Toggles the properties mode
    propertiesButton = createButton('Properties');
    propertiesButton.position(709, 4);
    propertiesButton.mousePressed(function () {
        setControlMode('none');
        setPropMode(true);
        previewSymbol = null;
        reDraw();
    });
    propertiesButton.elt.className = "button";

    // Upper right
    // Input field for the file name
    textInput = createInput('');
    textInput.attribute('placeholder', 'New Sketch');
    textInput.size(200, 15);
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
    ascustomButton.mousePressed(function () { 
        previewSymbol = null;
        return customClicked(textInput.value() + '.json'); 
    });
    ascustomButton.elt.className = "button";

    /*
        Elements for the properties mode
    */
    inputIsTopBox = createCheckbox('Set to top', false);
    inputIsTopBox.hide();
    inputIsTopBox.position(windowWidth - 180, 35);
    inputIsTopBox.changed(newIsTopState);
    inputIsTopBox.elt.style.color = 'white';
    inputIsTopBox.elt.style.fontFamily = 'Arial';

    inputCaptionBox = createInput('');
    inputCaptionBox.hide();
    inputCaptionBox.size(160, 15);
    inputCaptionBox.position(windowWidth - 180, 60);
    inputCaptionBox.input(newInputCaption);

    outputCaptionBox = createInput('');
    outputCaptionBox.hide();
    outputCaptionBox.size(160, 15);
    outputCaptionBox.position(windowWidth - 180, 60);
    outputCaptionBox.input(newOutputCaption);

    outputColorBox = createSelect();
    outputColorBox.hide();
    outputColorBox.position(windowWidth - 180, 35);
    outputColorBox.size(168, 20);
    outputColorBox.option('red');
    outputColorBox.option('yellow');
    outputColorBox.option('green');
    outputColorBox.option('blue');
    outputColorBox.changed(newOutputColor);

    labelTextBox = createInput('');
    labelTextBox.hide();
    labelTextBox.size(185, 20);
    labelTextBox.position(windowWidth - 195, 45);
    labelTextBox.input(labelChanged);


    frameRate(60); // Caps the framerate at 60 FPS

    //sets font-size for all label elements
    let guiLabels = document.getElementsByClassName('label');
    for (let i = 0; i < guiLabels.length; i++) {
        guiLabels[i].style.fontSize = "16px";
    }

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
    setControlMode('addObject');
    addType = 'custom';
    directionSelect.show();
    labelDirection.show();
    custFile = filename;
}

// Triggered when a sketch should be saved
function saveClicked() {
    selectMode = 'none';
    showSClickBox = false;
    previewSymbol = null;
    saveSketch(textInput.value() + '.json');
    document.title = textInput.value() + ' - LogiJS';
}

// Triggered when a sketch should be loaded
function loadClicked() {
    selectMode = 'none';
    showSClickBox = false;
    previewSymbol = null;
    loadSketch(textInput.value() + '.json');
    reDraw();
}

// Resets the canvas and the view / transformation
function newClicked() {
    clearItems();
    clearActionStacks();
    transform = new Transformation(0, 0, 1);
    gridSize = GRIDSIZE;
    gateInputCount = 2;
    gateInputSelect.value('2');
    gateDirection = 0;
    directionSelect.value('Right');
    endSimulation(); // End the simulation, if started
    setPropMode(false); // Restarting PropMode so that the menu hides
    setPropMode(true); // when new is clicked while it's open
    setControlMode('none'); // Clears the control mode
    wireMode = 'none';
    selectMode = 'none';
    showSClickBox = false;
    document.title = 'New Sketch - LogiJS';
    textInput.value('');
    textInput.attribute('placeholder', 'New Sketch');
    findLines();
    previewSymbol = null;
    reDraw();
}

/*
    Deletes all items that are drawn on screen
    and also the wire segments that are no longer
    drawn individually
*/
function clearItems() {
    gates = [];
    outputs = [];
    inputs = [];
    segments = [];
    conpoints = [];
    customs = [];
    diodes = [];
    labels = [];
    wires = [];
}

/*
    This clears the undo and redo stacks
*/
function clearActionStacks() {
    actionUndo = [];
    actionRedo = [];
}

function pushSelectAction(dx, dy) {
    pushUndoAction('moveSel', [dx, dy], selection);
}

/*
    Triggered when the wiring button is clicked
*/
function wiringClicked() {
    setControlMode('addWire'); // Activates wire adding, leaving all other modes
    wireMode = 'none'; // Resets the wiring mode
    previewSymbol = null;
    reDraw();
}

function deleteClicked() {
    // TODO: Implement deleting of the selection (with one undo/redo event)
    //if (ctrlMode === 'select' && selectMode === 'end') {
    /*for (let i = 0; i < selection.length; i++) {
        for (let j = gates.length - 1; j >= 0; j--) {
            if (JSON.stringify(gates[j]) === JSON.stringify(selection[i])) {
                deleteGate(j);
            }
        }
        for (let j = customs.length - 1; j >= 0; j--) {
            if (JSON.stringify(customs[j]) === JSON.stringify(selection[i])) {
                deleteCustom(j);
            }
        }
        for (let j = diodes.length - 1; j >= 0; j--) {
            if (JSON.stringify(diodes[j]) === JSON.stringify(selection[i])) {
                deleteDiode(j);
            }
        }
        for (let j = inputs.length - 1; j >= 0; j--) {
            if (JSON.stringify(inputs[j]) === JSON.stringify(selection[i])) {
                inputs.splice(j, 1);
            }
        }
        for (let j = labels.length - 1; j >= 0; j--) {
            if (JSON.stringify(labels[j]) === JSON.stringify(selection[i])) {
                labels.splice(j, 1);
            }
        }
        for (let j = outputs.length - 1; j >= 0; j--) {
            if (JSON.stringify(outputs[j]) === JSON.stringify(selection[i])) {
                outputs.splice(j, 1);
            }
        }
        for (let j = wires.length - 1; j >= 0; j--) {
            if (JSON.stringify(wires[j]) === JSON.stringify(selection[i])) {
                wires.splice(j, 1);
            }
        }
        finishSelection();*/
    //    }
    //} else {
    setControlMode('delete');
    previewSymbol = null;
    reDraw();
    //}
}

/*
    This triggeres when a label text was altered
*/
function labelChanged() {
    labels[propLabel].alterText(labelTextBox.value()); // Alter the text of the selected label
}

function newGateInputNumber() {
    gateInputCount = parseInt(gateInputSelect.value());
    // Ensure that the correct preview gate is displayed when user selection changes
    switch(gateType){
        case 'and': previewSymbol = new LogicGate(mouseX, mouseY, transform, gateDirection, gateInputCount, 1, 'and', '&');
                    previewSymbol.alpha = 100;
                    break;
        case 'or':  previewSymbol = new LogicGate(mouseX, mouseY, transform, gateDirection, gateInputCount, 1, 'or', '≥1');
                    previewSymbol.alpha = 100;
                    break;   
        case 'xor': previewSymbol = new LogicGate(mouseX, mouseY, transform, gateDirection, gateInputCount, 1, 'xor', '=1');
                    previewSymbol.alpha = 100;
                    break;           
    }
    
}

function newDirection() {
    switch (directionSelect.value()) {
        case 'Right': gateDirection = 0; break;
        case 'Up': gateDirection = 3; break;
        case 'Left': gateDirection = 2; break;
        case 'Down': gateDirection = 1; break;
    }
    // Ensure that the correct preview gate is displayed when user selection changes
    switch(gateType){
        case 'and': previewSymbol = new LogicGate(mouseX, mouseY, transform, gateDirection, gateInputCount, 1, 'and', '&');
                    previewSymbol.alpha = 100;
                    break;
        case 'or':  previewSymbol = new LogicGate(mouseX, mouseY, transform, gateDirection, gateInputCount, 1, 'or', '≥1');
                    previewSymbol.alpha = 100;
                    break;   
        case 'xor': previewSymbol = new LogicGate(mouseX, mouseY, transform, gateDirection, gateInputCount, 1, 'xor', '=1');
                    previewSymbol.alpha = 100;
                    break;           
    }
}

function newClockspeed() {
    if (propInput >= 0) {
        if (inputs[propInput].clock) {
            inputs[propInput].speed = 60 - clockspeedSlider.value();
        }
    }
}

/* 
    Toggles the simulation
    Button label updated in the functions
*/
function simClicked() {
    if (!simRunning) {
        previewSymbol = null;
        reDraw();
        startSimulation();
    } else {
        endSimulation();
    }
}

/*
    Adding modes for gates, in/out, customs, etc.
*/
function andClicked() {
    setControlMode('addObject');
    addType = 'gate';
    gateType = 'and';
    gateInputSelect.show();
    labelGateInputs.show();
    directionSelect.show();
    labelDirection.show();
    previewSymbol = new LogicGate(mouseX, mouseY, transform, gateDirection, gateInputCount, 1, 'and', '&');
    previewSymbol.alpha = 100;
}

function orClicked() {
    setControlMode('addObject');
    addType = 'gate';
    gateType = 'or';
    gateInputSelect.show();
    labelGateInputs.show();
    directionSelect.show();
    labelDirection.show();
    previewSymbol = new LogicGate(mouseX, mouseY, transform, gateDirection, gateInputCount, 1, 'or', '≥1');
    previewSymbol.alpha = 100;
}

function xorClicked() {
    setControlMode('addObject');
    addType = 'gate';
    gateType = 'xor';
    gateInputSelect.show();
    labelGateInputs.show();
    directionSelect.show();
    labelDirection.show();
    previewSymbol = new LogicGate(mouseX, mouseY, transform, gateDirection, gateInputCount, 1, 'xor', '=1');
    previewSymbol.alpha = 100;
}

function inputClicked() {
    newIsButton = false;
    newIsClock = false;
    setControlMode('addObject');
    addType = 'input';
    previewSymbol = new Input(mouseX, mouseY, transform);
    previewSymbol.alpha = 100;
}

function buttonClicked() {
    newIsButton = true;
    newIsClock = false;
    setControlMode('addObject');
    addType = 'input';
    previewSymbol = new Input(mouseX, mouseY, transform);
    previewSymbol.alpha = 100;
}

function clockClicked() {
    newIsButton = false;
    newIsClock = true;
    setControlMode('addObject');
    addType = 'input';
    previewSymbol = new Input(mouseX, mouseY, transform);
    previewSymbol.alpha = 100;
}

function outputClicked() {
    setControlMode('addObject');
    addType = 'output';
    previewSymbol = new Output(mouseX, mouseY, transform, 0);
    previewSymbol.alpha = 100;
}

// diodeClick is toggling the diodes,
// not only adding them
function diodeClicked() {
    setControlMode('addObject');
    addType = 'diode';
    previewSymbol = null;
    reDraw();
}

// Starts the selection process
function startSelect() {
    setControlMode('select');
    selectMode = 'none';
    previewSymbol = null;
    reDraw();
}

// Triggered when a label should be added
function labelButtonClicked() {
    setControlMode('addObject');
    addType = 'label';
    previewSymbol = null;
    reDraw();
}

/*
    Sets the control mode, performing
    extra preparations for selecting
    when it's set to 'select'
*/
function setControlMode(mode) {
    if (ctrlMode === 'select') {
        selectMode = 'start';
        unmarkAll();
        showSClickBox = false;
    }
    if (mode === 'addObject' || mode === 'addWire' || mode === 'select' || mode === 'delete') {
        setPropMode(false);
        ctrlMode = mode;
    } else if (mode === 'none') {
        ctrlMode = mode;
    } else {
        console.log('Control mode not supported!');
    }
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
    Adds a new input (switch, button or clock)
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
        newInput.resetFramecount();
    } else {
        newInput.framecount = -1;
    }
    newInput.clock = newIsClock;
    inputs.push(newInput);
    pushUndoAction('addIn', [], newInput);
    reDraw();
}

/*
    Adds a new label
*/
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
    previewSymbol = null;
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
    doConpoints(); // Conpoints under diodes should appear again
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
    // If the update cycle shouldn't be synced with the framerate,
    // update every 10ms (may be too fast for slower machines, not a great solution)
    if (!sfcheckbox.checked()) {
        updater = setInterval(updateTick, 1);
    }
    setSimButtonText('Stop'); // Alter the caption of the Start/Stop button
    setControlMode('none');
    disableButtons(true);
    setPropMode(false);
    showSClickBox = false; // Hide the selection click box

    // Tell all customs that the simulation started
    for (const elem of customs) {
        elem.setSimRunning(true);
    }

    // Parse all groups, integrate all elements and parse again (this is required)
    parseGroups();
    integrateElement();
    parseGroups();

    // Reduce the displayed wires for performance
    for (const elem of groups) {
        elem.findLines();
    }

    // Reset all clocks
    for (const elem of inputs) {
        if (elem.getIsClock()) {
            elem.resetFramecount();
        }
    }

    sfcheckbox.show();

    // Start the simulation and exit the properties mode
    simRunning = true;
    propMode = false;
}

/*
    Ends the simulation mode
    - Groups are deleted
    - Objects are set to low state
    - simRunning is cleared so that the sketch can be altered
*/
function endSimulation() {
    clearInterval(updater); // Stop the unsynced simulation updater
    setSimButtonText('Start'); // Set the button caption to 'Start'
    setControlMode('none');
    setPropMode(true);
    disableButtons(false); // Enable all buttons
    updateUndoButtons();
    sfcheckbox.hide();

    groups = []; // Reset the groups, as they are regenerated when starting again
    for (const elem of gates) {
        elem.shutdown(); // Tell all the gates to leave the simulation mode
    }
    for (const elem of customs) {
        elem.setSimRunning(false); // Shutdown all custom elements
        elem.shutdown();
    }
    // Set all item states to zero
    for (const elem of conpoints) {
        elem.state = false;
    }
    for (const elem of outputs) {
        elem.state = false;
    }
    for (const elem of inputs) {
        elem.setState(false);
    }
    for (const elem of diodes) {
        elem.setState(false);
    }
    for (const elem of segments) {
        elem.state = false;
    }
    simRunning = false;
    reDraw();
}

function setSimButtonText(text) {
    simButton.elt.innerHTML = text;
}

/*
    Enables/Disables the undo and redo buttons
    depending on the state of the stack
*/
function updateUndoButtons() {
    redoButton.elt.disabled = (actionRedo.length === 0);
    undoButton.elt.disabled = (actionUndo.length === 0);
}

/*
    Enables or disables all buttons that should not be
    clickable during simulation
    Also alters the color of the labels on the left
*/
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
    // Sets the colors of the labels
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
        // Update the simulation logic if it's synced to the framerate
        if (sfcheckbox.checked()) {
            updateTick();
        }
        reDraw(); // Redraw the canvas in every frame when the simulation runs
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
                value.resetFramecount();
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

/*
    Redraws all items on the screen, partly translated and scaled
*/
function reDraw() {
    background(150); // Sets the background to light grey
    scale(transform.zoom); // Scales the canvas to the current zoom factor
    drawGrid(); // Draws the grid, a bit darker than the background
    translate(transform.dx, transform.dy); // Handles the offset from dragging and zooming

    showElements(); // Draws all sketch elements on screen

    scale(1 / transform.zoom);
    translate(-transform.zoom * transform.dx, -transform.zoom * transform.dy); // Reverses the offset from dragging and zooming
    // Here, all GUI objects are drawn, that are not sensitive to zoom and/or offset
    textSize(12); // Set text size and color for the zoom and fps labels
    fill(0);
    strokeWeight(0);
    text(Math.round(transform.zoom * 100) + '%', 10, window.height - 20); // Show zoom label
    text(Math.round(frameRate()), window.width - 20, window.height - 20); // Show fps label

    // If the prop mode is active and an object was selected, show the menu background in the top right corner
    if (propMode && propInput + propOutput + propLabel >= -2) {
        strokeWeight(0); // The prop menu background is dark grey without border
        fill(50); // DOM elements are shown seperatly
        rect(window.width - 200, -5, 205, 65, 5);
    }
}

function showElements() {
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
    for (const elem of gates) {
        elem.show();
    }

    if(previewSymbol !== null){
        previewSymbol.show();
    }

    for (const elem of customs) {
        if (elem.visible) {
            elem.show();
        }
    }
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
}

/*
    Updates all group states
*/
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

/*
    Check if a key was pressed and act accordingly
*/
function keyPressed() {
    if (textInput.elt !== document.activeElement) {
        switch (keyCode) {
            case ESCAPE:
                setControlMode('none');
                setPropMode(true);
                break;
            default:
        }
    } else if (keyCode === RETURN) { // Load the sketch when the textInput is active
        loadClicked();
    }
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
        }
        if (lastY !== 0) {
            transform.dy += Math.round((mouseY - lastY) * dragSpeed);
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
    stroke(140); // Grid lines are a bit darker than the background
    strokeWeight(3); // Grid lines are three pixels wide
    for (let i = Math.round(transform.dx % GRIDSIZE); i < width / transform.zoom; i += GRIDSIZE) { // Vertical lines
        line(i, 0, i, height / transform.zoom);
    }
    for (let j = Math.round(transform.dy % GRIDSIZE); j < height / transform.zoom; j += GRIDSIZE) { // Horizontal lines
        line(0, j, width / transform.zoom, j);
    }
}