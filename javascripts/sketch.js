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
let wireButton, deleteButton, simButton, labelBasic, labelAdvanced, commandDiv, // Left hand side
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
    // Create container (as parent) for whole GUI
    guiContainer = createDiv('');
    guiContainer.addClass('guiContainer');

    // Creates the canvas in full window size
    cnv = createCanvas(windowWidth, windowHeight);
    cnv.parent(guiContainer);
    cnv.addClass('guiContainer canvas');

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
    halfaddButton.elt.style.width = "117px";
    halfaddButton.elt.className = "button";
    
    // Adds a Full Adder
    fulladdButton = createButton('Full Adder');
    fulladdButton.mousePressed(function () { return customClicked('volladd.json'); });
    fulladdButton.elt.style.width = "117px";
    fulladdButton.elt.className = "button";
    
    //Toolbar container (root)
    commandDiv = createDiv('');
    commandDiv.parent(guiContainer);
    commandDiv.style('width','63rem');
    commandDiv.addClass('guiContainer toolbar-flexbox');

    // Simulation container in toolbar
    simContainer = createDiv('');
    simContainer.parent(commandDiv);
    simContainer.addClass('simContainer');

    // Upper container in simulation container
    upperSimContainer = createDiv('');
    upperSimContainer.parent(simContainer);
    upperSimContainer.addClass('upperSimContainer');

    // Lower container in simulation container
    lowerSimContainer = createDiv('');
    lowerSimContainer.parent(simContainer);
    lowerSimContainer.addClass('lowerSimContainer');

    // Starts and stops the simulation
    simButton = createDiv('');
    simButton.parent(upperSimContainer);
    simButton.style('background-image','url(Start.svg)');
    simButton.style('background-size','1.3rem');
    simButton.addClass('simContainer-startButton');
    simButton.mousePressed(simClicked);
    // Mouse hover (code below) commented out for now
    /*simButton.mouseOver(() => {
    });
    simButton.mouseOut(() => {
    });
    */

    // Checkbox next to start button to sync 
    // clock rate
   sfcheckbox = createCheckbox('Sync Ticks', true);
   sfcheckbox.parent(upperSimContainer);
   sfcheckbox.changed(function () {
       syncFramerate = sfcheckbox.checked();
       if (!sfcheckbox.checked() && simRunning) {
           updater = setInterval(updateTick, 1);
       } else {
           clearInterval(updater);
       }
   });
   sfcheckbox.addClass('sfCheckBox');

   // Adds text before the Clockrate slider
   crText = createDiv('Clock:');
   crText.parent(lowerSimContainer);
   crText.addClass('clockSpeedText');
   crText.style('line-height','1.8rem');
   crText.style('padding-left','0.5rem');

   // A slider for adjusting the clock speed
   clockspeedSlider = createSlider(1, 60, 30, 1);
   clockspeedSlider.parent(lowerSimContainer);
   clockspeedSlider.elt.className = 'slider';

   // Section of all the buttons next to the 
   // simulation container starts here 

    // Activates the wiring mode   
    wireButton = createDiv('Wiring');
    wireButton.parent(commandDiv);
    wireButton.style('background-image','url(Wiring.svg)');
    wireButton.style('border-left','1px solid darkgrey');
    wireButton.style('padding-left','0.5rem');
    wireButton.addClass('toolbar-button');
    wireButton.mouseOver(() => {
        
    });
    wireButton.mousePressed(wiringClicked);
    //  Mouse hover (code below) commented out for now 
    /*
    wireButton.mouseOver(() => {
        wiringLabel = rect(mouseX,mouseY,mouseX+15,mouseY+15);
        });
    wireButton.mouseOut(() => {
        ctrlMode = 'delete';
        mouseClicked();
    });
    */
   
   // Delete button
   deleteButton = createDiv('Delete');
   deleteButton.parent(commandDiv);
   deleteButton.style('background-image','url(Delete.svg)');
   deleteButton.addClass('toolbar-button');
   deleteButton.mouseOver(() => {
        
   });
   
   // Undos the last action
   undoButton = createDiv('Undo');
   undoButton.parent(commandDiv);
   undoButton.style('background-image','url(Undo.svg)');
   undoButton.addClass('toolbar-startButton');
   undoButton.mouseOver(() => {
       
    });
   undoButton.mouseOut(() => {
   });
   undoButton.mousePressed(() => {
       undo();
   });

   // Redos the last action
   redoButton = createDiv('Redo');
   redoButton.parent(commandDiv);
   redoButton.style('background-image','url(Redo.svg)');
   redoButton.addClass('toolbar-startButton');
   redoButton.mousePressed(() => {
       redo();
   });
   
   // Activates the mode for area selecting
   selectButton = createDiv('Select');
   selectButton.parent(commandDiv);
   selectButton.style('background-image','url(Select.svg)');
   selectButton.mousePressed(startSelect);
   selectButton.addClass('toolbar-startButton');
   selectButton.style('background-size','2.5rem');

   // Adds diodes (barricade in one direction)
   diodeButton = createDiv('Toggle Diodes');
   diodeButton.parent(commandDiv);
   diodeButton.style('background-image','url(ToggleDiodes.svg)');
   diodeButton.mousePressed(diodeClicked);
   diodeButton.addClass('toolbar-toggleButton');

    // Adds labels
    labelButton = createDiv('Label');
    labelButton.parent(commandDiv);
    labelButton.style('background-image','url(Label.svg)');
    labelButton.mousePressed(labelButtonClicked);
    labelButton.addClass('toolbar-button');
    labelButton.style('background-size','2rem');

    // Toggles the properties mode
    propertiesButton = createDiv('Properties');
    propertiesButton.parent(commandDiv);
    propertiesButton.mousePressed(function () {
        setControlMode('none');
        setPropMode(true);
    });
    propertiesButton.style('background-image','url(Properties.svg)');
    propertiesButton.addClass('toolbar-button');
    propertiesButton.style('width','5rem');
    propertiesButton.style('padding-right','0.5rem');
    propertiesButton.style('border-right','1px solid darkgrey');

    // Clears the canvas and resets the view
    newButton = createDiv('New');
    newButton.parent(commandDiv);
    newButton.style('background-image','url(New.svg)');
    newButton.mousePressed(newClicked);
    newButton.addClass('toolbar-button');
    newButton.style('background-size','1.5rem');
    
    // Contains search bar, load and save button as their parent
    searchSaveLoadContainer = createDiv('');
    searchSaveLoadContainer.parent(commandDiv);
    searchSaveLoadContainer.addClass('simContainer');
    searchSaveLoadContainer.style('width','10rem');

    // Container for upper input field
    upperInputSaveLoadContainer = createDiv('');
    upperInputSaveLoadContainer.parent(searchSaveLoadContainer);
    upperInputSaveLoadContainer.addClass('upperSimContainer');

    // Container to wrap input field, so input field positioning
    // is controllable via this parent
    inputContainer = createDiv('');
    inputContainer.parent(upperInputSaveLoadContainer);
    inputContainer.addClass('inputContainer');
    
    // Upper right
    // Input field for the file name
    textInput = createInput('');
    textInput.parent(inputContainer);
    textInput.attribute('placeholder','Circuit name');

    // Container for save and load button
    saveLoadContainer = createDiv('');
    saveLoadContainer.parent(searchSaveLoadContainer);
    saveLoadContainer.addClass('lowerSimContainer');

    // Button to save the sketch
    saveButton = createDiv('Save');
    saveButton.parent(saveLoadContainer);
    saveButton.mousePressed(saveClicked);
    saveButton.addClass('simContainer-startButton');
    saveButton.style('width','50%');
    saveButton.style('text-align','center');
    saveButton.style('line-height','1.8rem');

    // Button to load a sketch
    loadButton = createDiv('Load');
    loadButton.parent(saveLoadContainer);
    loadButton.mousePressed(loadClicked);
    loadButton.addClass('simContainer-startButton');
    loadButton.style('width','50%');
    loadButton.style('font-size','1rem');
    loadButton.style('text-align','center');
    loadButton.style('line-height','1.8rem');

    // Button to import as custom
    ascustomButton = createDiv('Import');
    ascustomButton.parent(commandDiv);
    ascustomButton.mousePressed(function () { 
        return customClicked(textInput.value() + '.json'); 
    });
    ascustomButton.addClass('toolbar-startButton');
    ascustomButton.style('background-image','url(Import.svg)');
    ascustomButton.style('background-size','1.8rem');

    // Parent container for basic components (child of guiContainer)
    // shall contain description 'Basic' and a scrollable
    // set of basic components like button, lamp, switch, etc...
    basicContainer = createDiv('');
    basicContainer.parent(guiContainer);
    basicContainer.addClass('guiContainer basicContainer');

    // Description 'Basic' in basicContainer
    basicContainerText = createP('Basic');
    basicContainerText.parent(basicContainer);
    basicContainerText.addClass('basicContainerText');

    // Container to hold the basic components like button, lamp and so on
    basicButtonContainer = createDiv('');
    basicButtonContainer.parent(basicContainer);
    basicButtonContainer.addClass('basicButtonContainer');

    // <Test buttons in basicButtonContainer>
    
    andGate = createDiv('');
    andGate.parent(basicButtonContainer);
    andGate.style('background-image','url(And-Gate.svg)');
    andGate.mousePressed(labelButtonClicked);
    andGate.addClass('toolbar-button');
    andGate.style('height','4rem');
    andGate.style('background-size','3rem');
    andGate.style('background-position','center');

    orGate = createDiv('');
    orGate.parent(basicButtonContainer);
    orGate.style('background-image','url(Or-Gate.svg)');
    orGate.mousePressed(labelButtonClicked);
    orGate.addClass('toolbar-button');
    orGate.style('height','4rem');
    orGate.style('background-size','3rem');
    orGate.style('background-position','center');

    xorGate = createDiv('');
    xorGate.parent(basicButtonContainer);
    xorGate.style('background-image','url(Xor-Gate.svg)');
    xorGate.mousePressed(labelButtonClicked);
    xorGate.addClass('toolbar-button');
    xorGate.style('height','4rem');
    xorGate.style('background-size','3rem');
    xorGate.style('background-position','center');

    labelButton5 = createDiv('Label4');
    labelButton5.parent(basicButtonContainer);
    labelButton5.style('background-image','url(Label.svg)');
    labelButton5.mousePressed(labelButtonClicked);
    labelButton5.addClass('toolbar-button');
    labelButton5.style('height','4rem');
    labelButton5.style('background-size','2rem');

    labelButton6 = createDiv('Label5');
    labelButton6.parent(basicButtonContainer);
    labelButton6.style('background-image','url(Label.svg)');
    labelButton6.mousePressed(labelButtonClicked);
    labelButton6.addClass('toolbar-button');
    labelButton6.style('height','4rem');
    labelButton6.style('background-size','2rem');

    // </Test buttons in basicButtonContainer>




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
    saveSketch(textInput.value() + '.json');
    document.title = textInput.value() + ' - LogiJS';
}

// Triggered when a sketch should be loaded
function loadClicked() {
    selectMode = 'none';
    showSClickBox = false;
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
}

function newDirection() {
    switch (directionSelect.value()) {
        case 'Right': gateDirection = 0; break;
        case 'Up': gateDirection = 3; break;
        case 'Left': gateDirection = 2; break;
        case 'Down': gateDirection = 1; break;
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
}

function orClicked() {
    setControlMode('addObject');
    addType = 'gate';
    gateType = 'or';
    gateInputSelect.show();
    labelGateInputs.show();
    directionSelect.show();
    labelDirection.show();
}

function xorClicked() {
    setControlMode('addObject');
    addType = 'gate';
    gateType = 'xor';
    gateInputSelect.show();
    labelGateInputs.show();
    directionSelect.show();
    labelDirection.show();
}

function inputClicked() {
    newIsButton = false;
    newIsClock = false;
    setControlMode('addObject');
    addType = 'input';
}

function buttonClicked() {
    newIsButton = true;
    newIsClock = false;
    setControlMode('addObject');
    addType = 'input';
}

function clockClicked() {
    newIsButton = false;
    newIsClock = true;
    setControlMode('addObject');
    addType = 'input';
}

function outputClicked() {
    setControlMode('addObject');
    addType = 'output';
}

// diodeClick is toggling the diodes,
// not only adding them
function diodeClicked() {
    setControlMode('addObject');
    addType = 'diode';
}

// Starts the selection process
function startSelect() {
    setControlMode('select');
    selectMode = 'none';
}

// Triggered when a label should be added
function labelButtonClicked() {
    setControlMode('addObject');
    addType = 'label';
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
    simButton.style('background-image','url(Pause.svg)'); // Alter the icon of the Start/Stop button
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
    simButton.style('background-image','url(Start.svg)'); // Set the button caption to 'Start'
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

/*
function setSimButtonText(text) {
    simButton.elt.innerHTML = text;
}
*/

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
    stroke(140); // Grid lines are a bit darker than the background
    strokeWeight(3); // Grid lines are three pixels wide
    for (let i = Math.round(transform.dx); i < width / transform.zoom; i += GRIDSIZE) { // Vertical lines
        line(i, transform.dy, i, height / transform.zoom);
    }
    for (let j = Math.round(transform.dy); j < height / transform.zoom; j += GRIDSIZE) { // Horizontal lines
        line(0, j, width / transform.zoom, j);
    }
}