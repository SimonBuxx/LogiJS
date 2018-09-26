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
let segDisplays = [];

let segBits = 4; // Number of bits for the 7-segment displays

let selection = [];

let pwstartX = 0;
let pwstartY = 0;

let groups = [];

//let caption = []; // Name of the sketch, displayed on customs

let gridSize = GRIDSIZE; // Size of the grid

let ctrlMode = 'none'; // Possible modes: none, delete, addObject, select ...
let addType = 0; // Possible modes: none, and, output, input, ...
let wireMode = 'none'; // Possible modes: none, hold, preview, delete ...
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
let initX = 0;
let initY = 0;

// Variables for dragging
let lastX = 0; var lastY = 0; // last mouse position
let dragSpeed = 1;

let transform = new Transformation(0, 0, 1);

let sClickBox = new ClickBox(0, 0, 0, 0, transform);
let showSClickBox = false;

let simRunning = false;
let propMode = false;

let syncFramerate = true;

let segIndizees = [];
let wireIndizees = [];

let showTooltip = true;
let negPreviewShown = false;

// GUI Elements
let textInput, saveButton, loadButton, newButton; // Right hand side
let deleteButton, simButton, labelBasic, labelAdvanced, // Left hand side
    andButton, orButton, xorButton, inputButton, buttonButton, clockButton,
    outputButton, clockspeedSlider, undoButton, redoButton, propertiesButton, labelButton, segDisplayButton;
let counter4Button, counter2Button, decoder4Button, decoder2Button, dFlipFlopButton, rsFlipFlopButton, reg4Button,
    add4BitButton, mux1Button, mux2Button, mux3Button, demux1Button, demux2Button, demux3Button, halfaddButton, fulladdButton, ascustomButton;
let updater, sfcheckbox, gateInputSelect, labelGateInputs, directionSelect, bitSelect, labelDirection, labelBits;
// Elements for the properties menu
let inputIsTopBox, inputCaptionBox;
let outputCaptionBox, outputColorBox;
let ipNameLabel, propBoxLabel, opNameLabel, colNameLabel, labCaptLabel;
let propInput = -1;
let propOutput = -1;
let propLabel = -1;

let showHints = true;
let hintNum = 0;
let closeTutorialButton, nextStepButton;
let hintPic0, hintPic1, hintPic2, hintPic3, hintPic4, hintPic5,
    hintPic6, hintPic7, hintPic8, hintPic9, hintPic10, hintPic11,
    hintPic12, hintPic13, hintPic14, hintPic15, hintPic16, hintPic17,
    hintPic19, hintPic20, hintPic21, hintPic22, hintPic23, hintPic24,
    hintPic25, hintPic26;
// Hide right click menu
document.addEventListener('contextmenu', event => event.preventDefault());
let cnv; // Canvas variable

/*
    Executed before setup(), loads all hint images
*/
function preload() {
    if (!window.location.href.includes('.com')) {
        showHints = false;
        return;
    }
    hintPic0 = loadImage('images/hint0.png');
    hintPic1 = loadImage('images/hint1.png');
    hintPic2 = loadImage('images/hint2.png');
    hintPic3 = loadImage('images/hint3.png');
    hintPic4 = loadImage('images/hint4.png');
    hintPic5 = loadImage('images/hint5.png');
    hintPic6 = loadImage('images/hint6.png');
    hintPic7 = loadImage('images/hint7.png');
    hintPic8 = loadImage('images/hint8.png');
    hintPic9 = loadImage('images/hint9.png');
    hintPic10 = loadImage('images/hint10.png');
    hintPic11 = loadImage('images/hint11.png');
    hintPic12 = loadImage('images/hint12.png');
    hintPic13 = loadImage('images/hint13.png');
    hintPic14 = loadImage('images/hint14.png');
    hintPic15 = loadImage('images/hint15.png');
    hintPic16 = loadImage('images/hint16.png');
    hintPic17 = loadImage('images/hint17.png');
    hintPic19 = loadImage('images/hint19.png');
    hintPic20 = loadImage('images/hint20.png');
    hintPic21 = loadImage('images/hint21.png');
    hintPic22 = loadImage('images/hint22.png');
    hintPic23 = loadImage('images/hint23.png');
    hintPic24 = loadImage('images/hint24.png');
    hintPic25 = loadImage('images/hint25.png');
    hintPic26 = loadImage('images/hint26.png');
}

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


    //Div for the Left Side Buttons
    let leftSideButtons = createDiv(" ");
    leftSideButtons.elt.className = "scrollBoxLeft";
    let height = (windowHeight - 74 - 32 - 15);
    leftSideButtons.elt.style.height = height.toString() + "px";
    leftSideButtons.elt.style.margin = '55px 0px';

    // Adds text 'Basic'
    labelBasic = createP('Basic');
    labelBasic.elt.style.color = 'white';
    labelBasic.elt.style.fontFamily = 'Open Sans';
    labelBasic.elt.className = 'label';
    labelBasic.elt.style.textAlign = 'center';
    labelBasic.elt.style.margin = '3px 0px 0px 0px';
    labelBasic.parent(leftSideButtons);

    // Left Side Buttons
    // Adds and-gates
    andButton = createButton('And-Gate');
    andButton.mousePressed(function () { andClicked(false); });
    andButton.elt.className = "buttonLeft";
    andButton.parent(leftSideButtons);

    // Adds or-gates
    orButton = createButton('Or-Gate');
    orButton.mousePressed(function () { orClicked(false); });
    orButton.elt.className = "buttonLeft";
    orButton.parent(leftSideButtons);

    // Adds xor-gates
    xorButton = createButton('Xor-Gate');
    xorButton.mousePressed(function () { xorClicked(false); });
    xorButton.elt.className = "buttonLeft";
    xorButton.parent(leftSideButtons);

    // Adds switches
    inputButton = createButton('Switch');
    inputButton.mousePressed(function () { inputClicked(false); });
    inputButton.elt.className = "buttonLeft";
    inputButton.parent(leftSideButtons);

    // Adds buttons (short impulse)
    buttonButton = createButton('Button');
    buttonButton.mousePressed(function () { buttonClicked(false); });
    buttonButton.elt.className = "buttonLeft";
    buttonButton.parent(leftSideButtons);

    // Adds clocks (variable impulse)
    clockButton = createButton('Clock');
    clockButton.mousePressed(function () { clockClicked(false); });
    clockButton.elt.className = "buttonLeft";
    clockButton.parent(leftSideButtons);

    // Adds outputs (lamps)
    outputButton = createButton('Lamp');
    outputButton.mousePressed(function () { outputClicked(false); });
    outputButton.elt.className = "buttonLeft";
    outputButton.parent(leftSideButtons);

    // Adds 7-segment displays
    segDisplayButton = createButton('7-Segment');
    segDisplayButton.mousePressed(function () { segDisplayClicked(false); });
    segDisplayButton.elt.className = "buttonLeft";
    segDisplayButton.parent(leftSideButtons);

    // Adds labels
    labelButton = createButton('Label');
    labelButton.mousePressed(function () { labelButtonClicked(false); });
    labelButton.elt.className = "buttonLeft";
    labelButton.parent(leftSideButtons);

    // Adds text 'Advanced'
    labelAdvanced = createP('Advanced');
    labelAdvanced.elt.style.color = 'white';
    labelAdvanced.elt.style.fontFamily = 'Open Sans';
    labelAdvanced.elt.style.textAlign = 'center';
    labelAdvanced.elt.style.margin = '3px 0px 0px 0px';
    labelAdvanced.elt.className = 'label';
    labelAdvanced.parent(leftSideButtons);

    // Adds a counter (2Bit)
    counter2Button = createButton('2Bit-Counter');
    counter2Button.mousePressed(function () { setActive(counter2Button, true); return customClicked('2BitCounter.json'); });
    counter2Button.elt.className = "buttonLeft";
    counter2Button.parent(leftSideButtons);
    // Adds a counter (4Bit)
    counter4Button = createButton('4Bit-Counter');
    counter4Button.mousePressed(function () { setActive(counter4Button, true); return customClicked('4BitCounter.json'); });
    counter4Button.elt.className = "buttonLeft";
    counter4Button.parent(leftSideButtons);
    // Adds a decoder (2Bit)
    decoder2Button = createButton('2Bit-Decoder');
    decoder2Button.mousePressed(function () { setActive(decoder2Button, true); return customClicked('2BitDec.json'); });
    decoder2Button.elt.className = "buttonLeft";
    decoder2Button.parent(leftSideButtons);
    // Adds a decoder (4Bit)
    decoder4Button = createButton('4Bit-Decoder');
    decoder4Button.mousePressed(function () { setActive(decoder4Button, true); return customClicked('4BitDec.json'); });
    decoder4Button.elt.className = "buttonLeft";
    decoder4Button.parent(leftSideButtons);
    // Adds an adder (4Bit)
    add4BitButton = createButton('4Bit-Adder');
    add4BitButton.mousePressed(function () { setActive(add4BitButton, true); return customClicked('4BitNeu.json'); });
    add4BitButton.elt.className = "buttonLeft";
    add4BitButton.parent(leftSideButtons);
    // Adds a d-flipflop
    dFlipFlopButton = createButton('D-FlipFlop');
    dFlipFlopButton.mousePressed(function () { setActive(dFlipFlopButton, true); return customClicked('d-flipflop.json'); });
    dFlipFlopButton.elt.className = "buttonLeft";
    dFlipFlopButton.parent(leftSideButtons);
    // Adds an rs-flipflop
    rsFlipFlopButton = createButton('RS-FlipFlop');
    rsFlipFlopButton.mousePressed(function () { setActive(rsFlipFlopButton, true); return customClicked('rsNoWhobble.json'); });
    rsFlipFlopButton.elt.className = "buttonLeft";
    rsFlipFlopButton.parent(leftSideButtons);
    // Adds a register (4Bit)
    reg4Button = createButton('4Bit-Register');
    reg4Button.mousePressed(function () { setActive(reg4Button, true); return customClicked('4BitReg.json'); });
    reg4Button.elt.className = "buttonLeft";
    reg4Button.parent(leftSideButtons);
    // Adds a 1-multiplexer
    mux1Button = createButton('1-Multiplexer');
    mux1Button.mousePressed(function () { setActive(mux1Button, true); return customClicked('1-mux.json'); });
    mux1Button.elt.className = "buttonLeft";
    mux1Button.parent(leftSideButtons);
    // Adds a 2-multiplexer
    mux2Button = createButton('2-Multiplexer');
    mux2Button.mousePressed(function () { setActive(mux2Button, true); return customClicked('2-mux.json'); });
    mux2Button.elt.className = "buttonLeft";
    mux2Button.parent(leftSideButtons);
    // Adds a 3-multiplexer
    mux3Button = createButton('3-Multiplexer');
    mux3Button.mousePressed(function () { setActive(mux3Button, true); return customClicked('3-mux.json'); });
    mux3Button.elt.className = "buttonLeft";
    mux3Button.parent(leftSideButtons);
    // Adds a 1-demultiplexer
    demux1Button = createButton('1-Demultiplexer');
    demux1Button.mousePressed(function () { setActive(demux1Button, true); return customClicked('1-demux.json'); });
    demux1Button.elt.className = "buttonLeft";
    demux1Button.parent(leftSideButtons);
    // Adds a 2-demultiplexer
    demux2Button = createButton('2-Demultiplexer');
    demux2Button.mousePressed(function () { setActive(demux2Button, true); return customClicked('2-demux.json'); });
    demux2Button.elt.className = "buttonLeft";
    demux2Button.parent(leftSideButtons);
    // Adds a 3-demultiplexer
    demux3Button = createButton('3-Demultiplexer');
    demux3Button.mousePressed(function () { setActive(demux3Button, true); return customClicked('3-demux.json'); });
    demux3Button.elt.className = "buttonLeft";
    demux3Button.parent(leftSideButtons);
    // Adds a Half Adder
    halfaddButton = createButton('Half Adder');
    halfaddButton.mousePressed(function () { setActive(halfaddButton, true); return customClicked('halbadd.json'); });
    halfaddButton.elt.className = "buttonLeft";
    halfaddButton.parent(leftSideButtons);
    // Adds a Full Adder
    fulladdButton = createButton('Full Adder');
    fulladdButton.mousePressed(function () { setActive(fulladdButton, true); return customClicked('volladd.json'); });
    fulladdButton.elt.className = "buttonLeft";
    fulladdButton.parent(leftSideButtons);

    // Adds text 'Gate inputs'
    labelGateInputs = createP('Gate inputs');
    labelGateInputs.hide();
    labelGateInputs.elt.style.color = 'white';
    labelGateInputs.elt.style.fontFamily = 'Open Sans';
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
    labelDirection.elt.style.fontFamily = 'Open Sans';
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

    // Adds text 'Input width'
    labelBits = createP('Input width');
    labelBits.hide();
    labelBits.elt.style.color = 'white';
    labelBits.elt.style.fontFamily = 'Open Sans';
    labelBits.elt.style.textAlign = 'center';
    labelBits.elt.style.margin = '3px 0px 0px 0px';
    labelBits.elt.className = 'label';
    labelBits.parent(leftSideButtons);

    bitSelect = createSelect();
    bitSelect.hide();
    bitSelect.option('1');
    bitSelect.option('2');
    bitSelect.option('3');
    bitSelect.option('4');
    bitSelect.option('5');
    bitSelect.option('6');
    bitSelect.option('7');
    bitSelect.option('8');
    bitSelect.option('16');
    bitSelect.option('32');
    bitSelect.changed(newBitLength);
    bitSelect.elt.className = "selectLeft";
    bitSelect.parent(leftSideButtons);
    bitSelect.value('4');

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
    sfcheckbox.elt.style.fontFamily = 'Open Sans';
    sfcheckbox.elt.style.textAlign = 'center';
    sfcheckbox.elt.style.margin = '10px 0 0 0';
    //sfcheckbox.position(946, 4);
    sfcheckbox.elt.className = 'checkbox';
    sfcheckbox.parent(leftSideButtons);

    // Adds text 'Clock speed'
    clockspeedLabel = createP('Clock speed:');
    clockspeedLabel.hide();
    clockspeedLabel.elt.style.color = 'white';
    clockspeedLabel.elt.style.fontFamily = 'Open Sans';
    clockspeedLabel.elt.style.textAlign = 'center';
    clockspeedLabel.elt.style.margin = '3px 0px 0px 0px';
    clockspeedLabel.position(windowWidth - 200, windowHeight - 140);

    // A slider for adjusting the clock speed
    clockspeedSlider = createSlider(1, 60, 30, 1);
    clockspeedSlider.hide();
    clockspeedSlider.changed(newClockspeed);
    clockspeedSlider.style('width', '188px');
    clockspeedSlider.style('margin', '5px');
    clockspeedSlider.elt.className = 'slider';
    clockspeedSlider.position(windowWidth - 205, windowHeight - 115);

    //Upper left

    // Activates the edit mode
    propertiesButton = createButton('Edit');
    propertiesButton.position(152, 4);
    propertiesButton.mousePressed(function () {
        setActive(propertiesButton);
        setControlMode('none');
        setPropMode(true);
    });
    propertiesButton.elt.className = "button active";


    // Activates the delete mode (objects and wires)
    deleteButton = createButton('Delete');
    deleteButton.position(207, 4);
    deleteButton.mousePressed(deleteClicked);
    deleteButton.elt.className = "button";

    // Starts and stops the simulation
    simButton = createButton('Start');
    simButton.elt.style.width = '34px';
    simButton.position(280, 4);
    simButton.mousePressed(simClicked);
    simButton.elt.className = "button";

    // Undos the last action
    undoButton = createButton('Undo');
    undoButton.position(342, 4);
    undoButton.mousePressed(() => {
        undo();
    });
    undoButton.elt.disabled = true;
    undoButton.elt.className = "button";

    // Redos the last action
    redoButton = createButton('Redo');
    redoButton.position(408, 4);
    redoButton.mousePressed(() => {
        redo();
    });
    redoButton.elt.disabled = true;
    redoButton.elt.className = "button";

    // Activates the mode for area selecting
    selectButton = createButton('Select');
    selectButton.position(472, 4);
    selectButton.mousePressed(startSelect);
    selectButton.elt.className = "button";

    // Upper right
    // Input field for the file name
    textInput = createInput('');
    textInput.attribute('placeholder', 'New Sketch');
    textInput.size(200, 16);
    textInput.position(windowWidth - textInput.width - 206, 4);
    textInput.elt.style.fontFamily = 'Open Sans';
    textInput.elt.className = "textInput";

    // Clears the canvas and resets the view
    newButton = createButton('New');
    newButton.position(windowWidth - textInput.width - 265, 4);
    newButton.mousePressed(newClicked);
    newButton.elt.className = "button";

    // Button to save the sketch
    saveButton = createButton('Save');
    saveButton.position(windowWidth - 198, 4);
    saveButton.mousePressed(saveClicked);
    saveButton.elt.className = "button";

    // Button to load a sketch
    loadButton = createButton('Load');
    loadButton.position(windowWidth - 136, 4);
    loadButton.mousePressed(loadClicked);
    loadButton.elt.className = "button";

    // Button to import as custom
    ascustomButton = createButton('Import');
    ascustomButton.position(windowWidth - 73, 4);
    ascustomButton.mousePressed(function () { setActive(ascustomButton); return customClicked(textInput.value() + '.json'); });
    ascustomButton.elt.className = "button";

    // Button to close the hints
    closeTutorialButton = createButton('Close Tutorial');
    closeTutorialButton.position(370, windowHeight - 65);
    closeTutorialButton.mousePressed(function () {
        document.cookie = "ClosedHint=true";
        showHints = false;
        hintNum = 0;
        closeTutorialButton.hide();
        nextStepButton.hide();
    });
    closeTutorialButton.elt.className = "button";

    // Button to open the next hint
    nextStepButton = createButton('Next Step');
    nextStepButton.position(494, windowHeight - 65);
    nextStepButton.mousePressed(function () {
        hintNum++;
    });
    nextStepButton.elt.className = "button";
    if (!showHints) {
        closeTutorialButton.hide();
        nextStepButton.hide();
    }

    /*
        Elements for the properties mode
    */
    propBoxLabel = createP('Properties');
    propBoxLabel.hide();
    propBoxLabel.elt.style.color = 'white';
    propBoxLabel.elt.style.fontFamily = 'Open Sans';
    propBoxLabel.elt.style.margin = '3px 0px 0px 0px';
    propBoxLabel.position(windowWidth - 200, windowHeight - 300);
    propBoxLabel.style('font-size', '30px');

    inputIsTopBox = createCheckbox('Draw input on top of the custom element', false);
    inputIsTopBox.hide();
    inputIsTopBox.position(windowWidth - 200, windowHeight - 250);
    inputIsTopBox.changed(newIsTopState);
    inputIsTopBox.elt.style.color = 'white';
    inputIsTopBox.elt.style.fontFamily = 'Open Sans';

    ipNameLabel = createP('Input name:');
    ipNameLabel.hide();
    ipNameLabel.elt.style.color = 'white';
    ipNameLabel.elt.style.fontFamily = 'Open Sans';
    ipNameLabel.elt.style.margin = '3px 0px 0px 0px';
    ipNameLabel.position(windowWidth - 200, windowHeight - 200);

    inputCaptionBox = createInput('');
    inputCaptionBox.elt.style.fontFamily = 'Open Sans';
    inputCaptionBox.hide();
    inputCaptionBox.size(180, 15);
    inputCaptionBox.position(windowWidth - 200, windowHeight - 170);
    inputCaptionBox.input(newInputCaption);

    colNameLabel = createP('Lamp color:');
    colNameLabel.hide();
    colNameLabel.elt.style.color = 'white';
    colNameLabel.elt.style.fontFamily = 'Open Sans';
    colNameLabel.elt.style.margin = '3px 0px 0px 0px';
    colNameLabel.position(windowWidth - 200, windowHeight - 250);

    opNameLabel = createP('Output name:');
    opNameLabel.hide();
    opNameLabel.elt.style.color = 'white';
    opNameLabel.elt.style.fontFamily = 'Open Sans';
    opNameLabel.elt.style.margin = '3px 0px 0px 0px';
    opNameLabel.position(windowWidth - 200, windowHeight - 220);

    labCaptLabel = createP('Label caption:');
    labCaptLabel.hide();
    labCaptLabel.elt.style.color = 'white';
    labCaptLabel.elt.style.fontFamily = 'Open Sans';
    labCaptLabel.elt.style.margin = '3px 0px 0px 0px';
    labCaptLabel.position(windowWidth - 200, windowHeight - 250);

    outputCaptionBox = createInput('');
    outputCaptionBox.elt.style.fontFamily = 'Open Sans';
    outputCaptionBox.hide();
    outputCaptionBox.size(180, 15);
    outputCaptionBox.position(windowWidth - 200, windowHeight - 190);
    outputCaptionBox.input(newOutputCaption);

    outputColorBox = createSelect();
    outputColorBox.hide();
    outputColorBox.elt.style.fontFamily = 'Open Sans';
    outputColorBox.position(windowWidth - 110, windowHeight - 250);
    outputColorBox.size(70, 20);
    outputColorBox.option('red');
    outputColorBox.option('yellow');
    outputColorBox.option('green');
    outputColorBox.option('blue');
    outputColorBox.changed(newOutputColor);
    outputColorBox.elt.className = "selectLeft";

    labelTextBox = createInput('');
    labelTextBox.elt.style.fontFamily = 'Open Sans';
    labelTextBox.hide();
    labelTextBox.size(180, 20);
    labelTextBox.position(windowWidth - 200, windowHeight - 220);
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
    //Hide hints if there is a cookie 
    if ((getCookieValue("ClosedHint") === "true")) {
        showHints = false;
        closeTutorialButton.hide();
        nextStepButton.hide();
    }
    reDraw();
    setTimeout(reDraw, 100); // Redraw after 100ms in case fonts weren't loaded on first redraw
}

// Credits to https://stackoverflow.com/questions/2405355/how-to-pass-a-parameter-to-a-javascript-through-a-url-and-display-it-on-a-page (Mic)
function urlParam(name, w) {
    w = w || window;
    var rx = new RegExp('[\&|\?]' + name + '=([^\&\#]+)'),
        val = w.location.search.match(rx);
    return !val ? '' : val[1];
}

function customClicked(filename) {
    if (ctrlMode === 'addObject' && addType === 10 && filename === custFile) {
        setControlMode('none');
        setActive(propertiesButton);
    } else {
        setControlMode('addObject');
        addType = 10; // custom
        directionSelect.show();
        labelDirection.show();
        custFile = filename;
    }
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
    segDisplays = [];
}

/*
    This clears the undo and redo stacks
*/
function clearActionStacks() {
    actionUndo = [];
    actionRedo = [];
}

function pushSelectAction(dx, dy, x1, y1, x2, y2) {
    if ((Math.abs(dx) >= GRIDSIZE || Math.abs(dy) >= GRIDSIZE) && selection.length > 0) {
        pushUndoAction('moveSel', [dx, dy, x1, y1, x2, y2], selection);
    }
}

function setActive(btn, left) {
    setUnactive();
    if (left) {
        btn.elt.className = 'buttonLeft active';
    } else {
        btn.elt.className = 'button active';
    }
}

function setUnactive() {
    deleteButton.elt.className = 'button';
    andButton.elt.className = 'buttonLeft';
    orButton.elt.className = 'buttonLeft';
    xorButton.elt.className = 'buttonLeft';
    inputButton.elt.className = 'buttonLeft';
    buttonButton.elt.className = 'buttonLeft';
    clockButton.elt.className = 'buttonLeft';
    outputButton.elt.className = 'buttonLeft';
    propertiesButton.elt.className = 'button';
    labelButton.elt.className = 'buttonLeft';
    selectButton.elt.className = 'button';
    segDisplayButton.elt.className = 'buttonLeft';
    counter4Button.elt.className = 'buttonLeft';
    counter2Button.elt.className = 'buttonLeft';
    decoder4Button.elt.className = 'buttonLeft';
    decoder2Button.elt.className = 'buttonLeft';
    dFlipFlopButton.elt.className = 'buttonLeft';
    rsFlipFlopButton.elt.className = 'buttonLeft';
    reg4Button.elt.className = 'buttonLeft';
    add4BitButton.elt.className = 'buttonLeft';
    mux1Button.elt.className = 'buttonLeft';
    mux2Button.elt.className = 'buttonLeft';
    mux3Button.elt.className = 'buttonLeft';
    demux1Button.elt.className = 'buttonLeft';
    demux2Button.elt.className = 'buttonLeft';
    demux3Button.elt.className = 'buttonLeft';
    halfaddButton.elt.className = 'buttonLeft';
    fulladdButton.elt.className = 'buttonLeft';
    ascustomButton.elt.className = 'button';
}

function deleteClicked() {
    if (ctrlMode === 'select' && selectMode === 'end') {
        setActive(propertiesButton);
        ctrlMode = 'none';
        selectMode = 'end';
        showSClickBox = false;
        unmarkAll();
        let delGates = [[], []];
        let delCustoms = [[], []];
        let delInputs = [[], []];
        let delLabels = [[], []];
        let delOutputs = [[], []];
        let delWires = [[], []];
        let delSegments = [[], []];
        let delSegDisplays = [[], []];
        for (let i = 0; i < selection.length; i++) {
            if (selection[i] instanceof LogicGate) {
                delGates[0].push(selection[i]);
                delGates[1].push(gates.indexOf(selection[i]));
            } else if (selection[i] instanceof CustomSketch) {
                for (const elem of selection[i].responsibles) {
                    customs.splice(customs.indexOf(elem), 1);
                }
                delCustoms[0].push(selection[i]);
                delCustoms[1].push(customs.indexOf(selection[i]));
            }
            else if (selection[i] instanceof Input) {
                delInputs[0].push(selection[i]);
                delInputs[1].push(inputs.indexOf(selection[i]));
            }
            else if (selection[i] instanceof Label) {
                delLabels[0].push(selection[i]);
                delLabels[1].push(labels.indexOf(selection[i]));
            }
            else if (selection[i] instanceof Output) {
                delOutputs[0].push(selection[i]);
                delOutputs[1].push(outputs.indexOf(selection[i]));
            }
            // Filtering out wires and segments and pushing them into their arrays
            else if (selection[i] instanceof WSeg) {
                // The last selection[] element is the # of wires, therefore
                // all elements before that index are wires, the rest are segments
                if (i < selection[selection.length - 1]) {
                    delWires[0].push(selection[i]);
                    // Find the index of the wire and push it
                    delWires[1].push(wireIndizees.pop());
                } else {
                    delSegments[0].push(selection[i]);
                    delSegments[1].push(segIndizees.pop());
                }
            }
            else if (selection[i] instanceof SegmentDisplay) {
                delSegDisplays[0].push(selection[i]);
                delSegDisplays[1].push(segDisplays.indexOf(selection[i]));
            }
        }
        for (let j = delGates[1].length - 1; j >= 0; j--) {
            gates.splice(delGates[1][j], 1);
        }
        for (let j = delCustoms[1].length - 1; j >= 0; j--) {
            customs.splice(delCustoms[1][j], 1);
        }
        for (let j = delInputs[1].length - 1; j >= 0; j--) {
            inputs.splice(delInputs[1][j], 1);
        }
        for (let j = delLabels[1].length - 1; j >= 0; j--) {
            labels.splice(delLabels[1][j], 1);
        }
        for (let j = delOutputs[1].length - 1; j >= 0; j--) {
            outputs.splice(delOutputs[1][j], 1);
        }
        for (let j = delWires[1].length - 1; j >= 0; j--) {
            //console.log('Deleting wire No. ' + delWires[1][j]);
            wires.splice(delWires[1][j], 1);
        }
        for (let j = delSegments[1].length - 1; j >= 0; j--) {
            //console.log('Deleting segment No. ' + delSegments[1][j]);
            segments.splice(delSegments[1][j], 1);
        }
        for (let j = delSegDisplays[1].length - 1; j >= 0; j--) {
            segDisplays.splice(delSegDisplays[1][j], 1);
        }
        pwSegments = [];
        wireMode = 'none';
        lockElements = false;
        if (selection.length > 0) {
            pushUndoAction('delSel', 0, [delGates.slice(0), delCustoms.slice(0), diodes.slice(0), delInputs.slice(0), delLabels.slice(0), delOutputs.slice(0), delWires.slice(0), delSegDisplays.slice(0), conpoints.slice(0), delSegments.slice(0)]);
        }
        doConpoints();
    } else {
        if (ctrlMode === 'delete') {
            setControlMode('none');
            setActive(propertiesButton);
        } else {
            setActive(deleteButton);
            setControlMode('delete');
        }
    }
}

let cWires, cSegments, cConpoints;

function startCheck() {
    cWires = wires.slice(0);
    cSegments = segments.slice(0);
    cConpoints = conpoints.slice(0);
}

function endCheck() {
    console.log('State Checks: ');
    if (JSON.stringify(cWires) === JSON.stringify(wires)) {
        console.log('Wire state check passed');
    } else {
        console.error('Wire state check failed!');
    }
    if (JSON.stringify(cSegments) === JSON.stringify(segments)) {
        console.log('Segment state check passed');
    } else {
        console.error('Segment state check failed!');
    }
    if (JSON.stringify(cConpoints) === JSON.stringify(conpoints)) {
        console.log('Conpoint state check passed');
    } else {
        console.error('Conpoint state check failed!');
    }
}

/*
    This triggers when a label text was altered
*/
function labelChanged() {
    labels[propLabel].alterText(labelTextBox.value()); // Alter the text of the selected label
}

function newGateInputNumber() {
    gateInputCount = parseInt(gateInputSelect.value());
}

function newBitLength() {
    segBits = parseInt(bitSelect.value());
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
function andClicked(dontToggle = false) {
    if (ctrlMode === 'addObject' && addType === 1 && !dontToggle) {
        setControlMode('none');
        setActive(propertiesButton);
    } else {
        setActive(andButton, true);
        setControlMode('addObject');
        addType = 1; // and
        gateInputSelect.show();
        labelGateInputs.show();
        directionSelect.show();
        labelDirection.show();
    }
}

function orClicked(dontToggle = false) {
    if (ctrlMode === 'addObject' && addType === 2 && !dontToggle) {
        setControlMode('none');
        setActive(propertiesButton);
    } else {
        setActive(orButton, true);
        setControlMode('addObject');
        addType = 2; // or
        gateInputSelect.show();
        labelGateInputs.show();
        directionSelect.show();
        labelDirection.show();
    }
}

function xorClicked(dontToggle = false) {
    if (ctrlMode === 'addObject' && addType === 3 && !dontToggle) {
        setControlMode('none');
        setActive(propertiesButton);
    } else {
        setActive(xorButton, true);
        setControlMode('addObject');
        addType = 3; // xor
        gateInputSelect.show();
        labelGateInputs.show();
        directionSelect.show();
        labelDirection.show();
    }
}

function inputClicked(dontToggle = false) {
    if (ctrlMode === 'addObject' && addType === 4 && !dontToggle) {
        setControlMode('none');
        setActive(propertiesButton);
    } else {
        setActive(inputButton, true);
        newIsButton = false;
        newIsClock = false;
        setControlMode('addObject');
        addType = 4; // switch
    }
}

function buttonClicked(dontToggle = false) {
    if (ctrlMode === 'addObject' && addType === 5 && !dontToggle) {
        setControlMode('none');
        setActive(propertiesButton);
    } else {
        setActive(buttonButton, true);
        newIsButton = true;
        newIsClock = false;
        setControlMode('addObject');
        addType = 5; // button
    }
}

function clockClicked(dontToggle = false) {
    console.log(dontToggle);
    if (ctrlMode === 'addObject' && addType === 6 && !dontToggle) {
        setControlMode('none');
        setActive(propertiesButton);
    } else {
        setActive(clockButton, true);
        newIsButton = false;
        newIsClock = true;
        setControlMode('addObject');
        addType = 6; // clock
    }
}

function outputClicked(dontToggle = false) {
    if (ctrlMode === 'addObject' && addType === 7 && !dontToggle) {
        setControlMode('none');
        setActive(propertiesButton);
    } else {
        setActive(outputButton, true);
        setControlMode('addObject');
        addType = 7; // output
    }
}

function segDisplayClicked(dontToggle = false) {
    if (ctrlMode === 'addObject' && addType === 8 && !dontToggle) {
        setControlMode('none');
        setActive(propertiesButton);
    } else {
        setActive(segDisplayButton, true);
        setControlMode('addObject');
        addType = 8; // segDisplay
        bitSelect.show();
        labelBits.show();
    }
}

// Starts the selection process
function startSelect() {
    if (ctrlMode === 'select') {
        setControlMode('none');
        setActive(propertiesButton);
    } else {
        setActive(selectButton);
        setControlMode('select');
        selectMode = 'none';
    }
}

// Triggered when a label should be added
function labelButtonClicked(dontToggle = false) {
    if (ctrlMode === 'addObject' && addType === 9 && !dontToggle) {
        setControlMode('none');
        setActive(propertiesButton);
    } else {
        setActive(labelButton, true);
        setControlMode('addObject');
        addType = 9; // label
    }
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
    if (mode === 'addObject' || mode === 'select' || mode === 'delete') {
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
        case 1:
            newGate = new LogicGate(mouseX, mouseY, transform, direction, inputs, 1, 'and');
            newGate.setCoordinates(mouseX / transform.zoom - transform.dx, mouseY / transform.zoom - transform.dy);
            newGate.updateClickBoxes();
            gates.push(newGate);
            pushUndoAction('addGate', [], newGate);
            break;
        case 2:
            newGate = new LogicGate(mouseX, mouseY, transform, direction, inputs, 1, 'or');
            newGate.setCoordinates(mouseX / transform.zoom - transform.dx, mouseY / transform.zoom - transform.dy);
            newGate.updateClickBoxes();
            gates.push(newGate);
            pushUndoAction('addGate', [], newGate);
            break;
        case 3:
            newGate = new LogicGate(mouseX, mouseY, transform, direction, inputs, 1, 'xor');
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
    for (let i = 0; i < customs.length; i++) {
        if (customs[i].visible) {
            if ((customs[i].x === Math.round(((mouseX - GRIDSIZE / 2) / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE) &&
                (customs[i].y === Math.round(((mouseY - GRIDSIZE / 2) / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE)) {
                return;
            }
        }
    }
    let newCustom = new CustomSketch(mouseX, mouseY, transform, direction, file);
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
    Adds a new 7-segment display
*/
function addSegDisplay(bits) {
    for (var i = 0; i < segDisplays.length; i++) {
        if ((segDisplays[i].x === Math.round((mouseX / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE) &&
            (segDisplays[i].y === Math.round((mouseY / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE)) {
            return;
        }
    }
    var newDisplay = new SegmentDisplay(mouseX, mouseY, transform, bits);
    newDisplay.setCoordinates(mouseX / transform.zoom - transform.dx, mouseY / transform.zoom - transform.dy);
    newDisplay.updateClickBoxes();
    segDisplays.push(newDisplay);
    pushUndoAction('addSegDis', [], newDisplay);
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

function toggleDiode(restore) {
    for (var i = 0; i < diodes.length; i++) {
        if ((diodes[i].x === Math.round((mouseX / transform.zoom - transform.dx) / (GRIDSIZE / 2)) * (GRIDSIZE / 2)) &&
            (diodes[i].y === Math.round((mouseY / transform.zoom - transform.dy) / (GRIDSIZE / 2)) * (GRIDSIZE / 2))) {
            diodes[i].cp = true;
            deleteDiode(i);
            return;
        }
    }
    createDiode(Math.round((mouseX / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE,
        Math.round((mouseY / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE, false, restore);
    reDraw();
}

function toggleConpoint(undoable) {
    for (var i = 0; i < conpoints.length; i++) {
        if ((conpoints[i].x === Math.round((mouseX / transform.zoom - transform.dx) / (GRIDSIZE / 2)) * (GRIDSIZE / 2)) &&
            (conpoints[i].y === Math.round((mouseY / transform.zoom - transform.dy) / (GRIDSIZE / 2)) * (GRIDSIZE / 2))) {
            let cp = conpoints.splice(i, 1);
            let before = conpoints.slice(0);
            doConpoints();
            if (JSON.stringify(conpoints) === JSON.stringify(before) && undoable) {
                pushUndoAction('delCp', [], cp);
            }
            return;
        }
    }
    conpoints.push(new ConPoint(Math.round((mouseX / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE, Math.round((mouseY / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE, false, -1));
    let before = conpoints.slice(0);
    doConpoints();
    if ((JSON.stringify(conpoints) === JSON.stringify(before)) && undoable) {
        pushUndoAction('addCp', [], conpoints[conpoints.length - 1]);
    }
    reDraw();
}

function toggleDiodeAndConpoint() {
    if (isDiode(Math.round((mouseX / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE, Math.round((mouseY / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE) >= 0) {
        toggleDiode(false);
    } else {
        if (isConPoint(Math.round((mouseX / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE, Math.round((mouseY / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE) >= 0) {
            toggleConpoint(true);
        } else {
            toggleDiode(false);
        }
    }
    reDraw();
}

/*
    Deletes the given gate
*/
function deleteGate(gateNumber) {
    pushUndoAction('delGate', [], [gates.splice(gateNumber, 1), gateNumber]);
    reDraw();
}

/*
    Deletes the given custom
*/
function deleteCustom(customNumber) {
    for (let i = customs.length - 1; i >= 0; i--) {
        if (customs[i].pid === customs[customNumber].id) {
            customs.splice(i, 1);
        }
    }
    pushUndoAction('delCust', [], [customs.splice(customNumber, 1), customNumber]);
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
    if (diodes[diodeNumber].cp) {
        let x = diodes[diodeNumber].x;
        let y = diodes[diodeNumber].y;
        pushUndoAction('delDi', [], diodes.splice(diodeNumber, 1));
        createConpoint(x, y, false, -1);
    }
    else {
        pushUndoAction('delDi', [], diodes.splice(diodeNumber, 1));
    }
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
    Deletes the given 7-segment display
*/
function deleteSegDisplay(segDisNumber) {
    pushUndoAction('delSegDis', [], segDisplays.splice(segDisNumber, 1));
    reDraw();
}

/*
    Starts the simulation mode
    - Groups are created and objects are integrated
    - simRunning is set so that the sketch can't be altered
*/
function startSimulation() {
    // If the update cycle shouldn't be synced with the framerate,
    // update every 1ms (not a great solution)
    if (!sfcheckbox.checked()) {
        updater = setInterval(updateTick, 1);
    }
    setSimButtonText('Stop'); // Alter the caption of the Start/Stop button
    setControlMode('none');
    setUnactive();
    disableButtons(true);
    setPropMode(false);
    showSClickBox = false; // Hide the selection click box

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

    // Tell all customs that the simulation started
    for (const elem of customs) {
        elem.setSimRunning(true);
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
    setActive(propertiesButton);
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
    for (const elem of segDisplays) {
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
    inputButton.elt.disabled = status;
    outputButton.elt.disabled = status;
    segDisplayButton.elt.disabled = status;
    buttonButton.elt.disabled = status;
    clockButton.elt.disabled = status;
    deleteButton.elt.disabled = status;
    selectButton.elt.disabled = status;
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
    Executes in every frame, draws everything and updates the sketch logic
*/
function draw() {
    // If the simulation is running, update the sketch logic (if synced to framerate) and redraw the sketch and GUI
    if (simRunning) {
        updateTick();
        reDraw();
        handleDragging();
        return;
    }

    // If wire preview is active, generate a segment set and display the preview segments
    // When the mode is delete, mark the wire by drawing it in red
    if (wireMode === 'preview' || wireMode === 'delete') {
        reDraw(); // Necessary to hide the old segment set 
        scale(transform.zoom); // Scale and translate
        translate(transform.dx, transform.dy);

        if (!mouseOverGUI()) { // If the mouse is over a gui element, no wire should be drawn
            generateSegmentSet(pwstartX, pwstartY, Math.round((mouseX / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE,
                Math.round((mouseY / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE, false);
            for (const elem of pwSegments) { // Display preview segments
                elem.show(wireMode === 'delete');
            }
        }
        scale(1 / transform.zoom); // Reverse scaling and translating
        translate(-transform.zoom * transform.dx, -transform.zoom * transform.dy);
    }

    // If in select mode, handle the select logic
    if (ctrlMode === 'select') {
        reDraw();
        scale(transform.zoom); // Handle the offset from scaling and translating
        translate(transform.dx, transform.dy);
        fill(0, 0, 0, 100); // Set the fill color to a semi-transparent black
        noStroke();
        if (selectMode === 'start') {
            selectEndX = Math.round(((mouseX + GRIDSIZE / 2) / transform.zoom - transform.dx - GRIDSIZE / 2) / GRIDSIZE) * GRIDSIZE + GRIDSIZE / 2;
            selectEndY = Math.round(((mouseY + GRIDSIZE / 2) / transform.zoom - transform.dy - GRIDSIZE / 2) / GRIDSIZE) * GRIDSIZE + GRIDSIZE / 2;
            rect(Math.min(selectStartX, selectEndX), Math.min(selectStartY, selectEndY),
                Math.abs(selectStartX - selectEndX), Math.abs(selectStartY - selectEndY));
        }
        scale(1 / transform.zoom); // // Reverse scaling and translating
        translate(-transform.zoom * transform.dx, -transform.zoom * transform.dy);
    }

    // Execute the dragging logic
    handleDragging();
}

/*
    Executes one update tick of the sketch logic
*/
function updateTick() {
    // Tell all gates to update
    for (const value of gates) {
        value.update();
    }

    // Tell all visible customs to update
    // (they will update all of their gates and customs by themselves)
    for (const value of customs) {
        if (value.visible) {
            value.update();
        }
    }

    // Update all wire groups
    updateGroups();

    // Update all connection points to adopt the state of their wire group
    for (const value of conpoints) {
        value.state = groups[value.group].state;
    }

    // Update all self-toggling input elements (buttons and clocks)
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

    // Update all segments displays
    for (const value of segDisplays) {
        value.update();
    }

    // Update the states of all diodes
    // They adopt the state of their group A (horizontal wire)
    // and if they are high, they pass that event to group B
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
    // Set the background, scale and draw the grid
    background(150);
    scale(transform.zoom);
    drawGrid();

    // Handle the offset from dragging
    translate(transform.dx, transform.dy);

    // Draw all sketch elements on screen
    //let t0 = performance.now();
    showElements();
    //let t1 = performance.now();
    //console.log("took " + (t1 - t0) + " milliseconds.");

    // Reverse the scaling and translating to draw the stationary elements of the GUI
    scale(1 / transform.zoom);
    translate(-transform.zoom * transform.dx, -transform.zoom * transform.dy);

    // Draw the zoom and framerate labels
    textSize(12);
    fill(0);
    noStroke();
    text(Math.round(transform.zoom * 100) + '%', 10, window.height - 20); // Zoom label
    text(Math.round(frameRate()), window.width - 20, window.height - 20); // Framerate label

    // If the prop mode is active and an object was selected, show the config menu background in the bottom right corner
    // propInput, propOutput and propLabel are -1 when no element is selected. If one of them is > -1, the sum is >= -2
    if (propMode && propInput + propOutput + propLabel >= -2) {
        fill(50);
        rect(window.width - 215, window.height - 300, 220, 305, 5);
    }

    // If the tutorial should be shown, display it on screen
    if (showHints) {
        showTutorial();
    }

    /*if (showTooltip) {
        displayTooltipBar();
    }*/
}

/*
    Displays the hint with number hintNum in a box in the bottom left corner
*/
function showTutorial() {
    textFont('Gudea');
    switch (hintNum) {
        case 0:
            displayHint(450, hintPic0, 'Welcome!', 'If this is your first time using LogiJS,',
                'we suggest you to go through this quick tutorial.');
            break;
        case 1:
            displayHint(600, hintPic1, 'Navigation', 'You can drag the sketch area by dragging with the right',
                'mouse button pressed. To zoom in and out, use the mouse wheel.');
            break;
        case 2:
            displayHint(500, hintPic2, 'Basic components', 'You can add the standard gate types by clicking on',
                'the buttons on the left and then clicking on the canvas.');
            break;
        case 3:
            displayHint(450, hintPic3, 'Basic components', 'Placing in- and outputs is just as easy.',
                'Try adding switches and a lamp next to a gate!');
            break;
        case 4:
            displayHint(600, hintPic4, 'Connecting the dots', 'You can always add wires by simply dragging with the left',
                'mouse button pressed. Go ahead and connect your components!');
            break;
        case 5:
            displayHint(500, hintPic5, 'Starting the simulation', 'By clicking on the \'Start\' button in the top left corner,',
                'you can start the simulation. Clicking it again will stop it.');
            break;
        case 6:
            displayHint(500, hintPic6, 'Simulation mode', 'During simulation, you can left-click on the inputs',
                'you\'ve placed to see your logic circuit act accordingly.');
            break;
        case 7:
            displayHint(650, hintPic7, 'Deleting components', 'Click the \'Delete\' button in the top left corner. Now you can delete',
                'components by left-clicking on them. To delete wires, just drag over them.');
            break;
        case 8:
            displayHint(500, hintPic8, 'Undo and Redo', 'If you want to undo any change you\'ve made',
                'to the sketch, just use the \'Undo\' and \'Redo\' buttons.');
            break;
        case 9:
            displayHint(650, hintPic9, 'Switches, Buttons and Clocks', 'In contrast to the switch component you\'ve already used, buttons are ',
                'only activated for a short period of time when clicked on them.');
            break;
        case 10:
            displayHint(650, hintPic10, 'Switches, Buttons and Clocks', 'Clocks are switches that turn on and off automatically, you can change',
                'their speed in the properties menu that we\'ll show you in a bit.');
            break;
        case 11:
            displayHint(700, hintPic11, 'Additional settings', 'Some components have properties like input width and direction, that appear',
                'in the bottom left when clicking on the corresponding component button.');
            break;
        case 12:
            displayHint(700, hintPic12, 'Edit mode', 'By clicking \'Edit\' or using the escape key, you enter the edit mode. You can now',
                'invert in- and outputs of gates and custom components by clicking on them. ');
            break;
        case 13:
            displayHint(700, hintPic13, 'Edit mode', 'When clicking on in- or output components (eg. switches or lamps),',
                'you can change various properties of these components in the appearing menu.');
            break;
        case 14:
            displayHint(750, hintPic14, '7-Segment displays', 'These take a variable number of input bits and display their binary value in decimal',
                'form. You can change the bit width in the additional settings before placing them.');
            break;
        case 15:
            displayHint(750, hintPic15, 'Advanced components', 'These are more complex components that are each made out of another',
                'sketch. This list is just a selection of custom components that are pre-built by us.');
            break;
        case 16:
            displayHint(600, hintPic16, 'Loading and saving', 'To save a sketch, type in a name in the top right corner and hit save.',
                'You can then choose a folder on your hard drive to save it locally.');
            break;
        case 17:
            displayHint(400, hintPic17, 'Loading and saving', 'To load sketches, you must have a local',
                'LogiJS version on your computer. ');
            break;
        case 18:
            displayHint(700, hintPic16, 'Loading and saving', 'Make sure, your sketch file is in the \'sketches\' folder of your LogiJS version.',
                'Type the file name into the input field and hit \'Load\' or the enter key.');
            break;
        case 19:
            displayHint(650, hintPic19, 'Diodes', 'Diodes are components that join two crossing wires in the horizontal',
                'but not in the vertical direction. They can be used for diode matrices.');
            break;
        case 20:
            displayHint(550, hintPic20, 'Diodes', 'Please load the sketch called \'traffic\'. As you can see,',
                'there is an area with multiple diodes (little triangles) on it.');
            break;
        case 21:
            displayHint(750, hintPic21, 'Diodes', 'In edit mode, you can toggle diodes and connection points by clicking on them or on',
                'empty wire crossings. Start the simulation to see how they are used in this example!');
            break;
        case 22:
            displayHint(700, hintPic22, 'Custom components', 'If instead of hitting \'Load\' you click on \'Import\', your sketch will be',
                'imported as a custom component. Click anywhere on the sketch to place it.');
            break;
        case 23:
            displayHint(650, hintPic23, 'Custom components', 'You can name in- and outputs and set inputs to the top of the component',
                'by altering these settings in the properties menu of the sketch to import.');
            break;
        case 24:
            displayHint(450, hintPic24, 'Custom components', 'Inputs labeled with \'>\' will appear as',
                'clock inputs with an arrow drawn on them.');
            break;
        case 25:
            displayHint(600, hintPic25, 'Labels', 'You can add text labels using the \'Label\' button. The text can',
                'be changed in the properties menu after clicking on them.');
            break;
        case 26:
            displayHint(650, hintPic26, '\'New\' and \'Select\'', 'Click on \'New\' to start a new sketch. When clicking on \'Select\' you can',
                'select parts of your sketch to move them on the canvas or delete them.');
            break;
        case 27:
            displayHint(600, hintPic0, 'Thank you!', 'You\'ve reached the end of this little tutorial on LogiJS.',
                'We hope that you like our work and we value any feedback from you.');
            nextStepButton.hide();
            break;
        default:
            break;
    }
}

/*
    Displays the given hint text (two lines + caption) and an image in a box in the bottom left corner
*/
function displayHint(width, img, caption, line1, line2) {
    // Draw a red ellipse and a rectangle to form the box shape
    fill(200, 50, 50);
    stroke(50);
    strokeWeight(3);
    rect(20, window.height - 220, width + 200, 200);
    // Display the given image in the bottom left
    strokeWeight(6);
    rect(40, window.height - 200, 160, 160);
    image(img, 40, window.height - 200);
    // Set the text attributes and draw caption and text lines
    fill(255);
    noStroke();
    textSize(30);
    text(caption, 220, window.height - 190);
    textSize(20);
    text(line1, 220, window.height - 135);
    text(line2, 220, window.height - 105);
}

function displayTooltipBar() {
    fill(50, 50, 50);
    noStroke();
    rect(0, 0, window.width, 150);
}

function showElements() {
    if (simRunning) {
        for (const elem of groups) {
            elem.show();
        }
    } else {
        for (const elem of wires) {
            elem.show();
        }
    }
    //let t0 = performance.now();
    textFont('monospace');
    for (const elem of gates) {
        elem.show();
    }
    textFont('Open Sans');
    for (const elem of customs) {
        if (elem.visible) {
            elem.show();
        }
    }
    //let t1 = performance.now();
    //console.log('Drawing wires took ' + (t1 - t0) + ' milliseconds.');
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
    textFont('PT Mono');
    for (const elem of segDisplays) {
        elem.show();
    }
    textFont('Gudea');
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
    if (inputCaptionBox.elt === document.activeElement || outputCaptionBox.elt === document.activeElement || labelTextBox.elt === document.activeElement) {
        return;
    }
    if (textInput.elt !== document.activeElement) {
        if (keyCode >= 49 && keyCode <= 57) {
            gateInputCount = keyCode - 48;
            gateInputSelect.value(gateInputCount);
            return;
        }
        switch (keyCode) {
            case ESCAPE:
                setControlMode('none');
                setActive(propertiesButton);
                setPropMode(true);
                break;
            case RETURN:
                console.log(wires);
                console.log(segments);
                setPropMode(false);
                gateInputSelect.hide();
                labelGateInputs.hide();
                directionSelect.hide();
                labelDirection.hide();
                bitSelect.hide();
                labelBits.hide();
                simClicked();
                break;
            case CONTROL:
                startSelect();
                break;
            case 32: // Space
                if (ctrlMode !== 'delete') {
                    deleteClicked();
                } else {
                    setActive(propertiesButton);
                    setControlMode('none');
                    setPropMode(true);
                }
                break;
            case 48: // 0
                gateInputCount = 10;
                gateInputSelect.value('10');
                break;
            case RIGHT_ARROW:
                gateDirection = 0;
                directionSelect.value('Right');
                break;
            case DOWN_ARROW:
                gateDirection = 1;
                directionSelect.value('Down');
                break;
            case LEFT_ARROW:
                gateDirection = 2;
                directionSelect.value('Left');
                break;
            case UP_ARROW:
                gateDirection = 3;
                directionSelect.value('Up');
                break;
            default:
                break;
        }
    } else if (keyCode === RETURN) { // Load the sketch when the textInput is active
        loadClicked();
    }
}

function showNegationPreview(clickBox, isOutput, direction, isTop) {
    fill(150);
    stroke(0);
    strokeWeight(2 * transform.zoom);
    let offset;
    if (isOutput) {
        offset = 3;
    } else {
        offset = -3;
    }
    if (isTop) {
        direction += 1;
        if (direction > 3) {
            direction = 0;
        }
    }
    if (direction === 0) {
        ellipse((transform.zoom * (clickBox.x + transform.dx + offset)), (transform.zoom * (clickBox.y + transform.dy)), 10 * transform.zoom, 10 * transform.zoom);
    } else if (direction === 1) {
        ellipse((transform.zoom * (clickBox.x + transform.dx)), (transform.zoom * (clickBox.y + transform.dy + offset)), 10 * transform.zoom, 10 * transform.zoom);
    } else if (direction === 2) {
        ellipse((transform.zoom * (clickBox.x + transform.dx - offset)), (transform.zoom * (clickBox.y + transform.dy)), 10 * transform.zoom, 10 * transform.zoom);
    } else if (direction === 3) {
        ellipse((transform.zoom * (clickBox.x + transform.dx)), (transform.zoom * (clickBox.y + transform.dy - offset)), 10 * transform.zoom, 10 * transform.zoom);
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

function getCookieValue(a) {
    var b = document.cookie.match('(^|;)\\s*' + a + '\\s*=\\s*([^;]+)');
    return b ? b.pop() : '';
}