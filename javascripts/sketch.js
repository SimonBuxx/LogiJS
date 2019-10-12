// File: sketch.js

p5.disableFriendlyErrors = true; // jshint ignore:line

let gatesList = []; // List of gates (and, or, xor)
let outputsList = []; // List of outputs
let inputsList = []; // List of inputs (buttons, switches)
let wireSegmentsList = []; // List of fixed wire segments
let previewWireSegmentsList = []; // List of preview wire segments
let wireConnectionPointsList = []; // List of wire connection points
let diodesList = []; // List of diodes
let customObjectsList = []; // List of custom objects
let wiresList = []; // List of wires (aggregated wire segments)
let labelsList = []; // List of text labels
let segmentDisplaysList = []; // List of 7-segment displays

let segmentDisplayBits = 4; // Number of bits for new 7-segment displays
let counterOutputBitWidth = 4; // Output width of counter objects
let decoderInputBitWidth = 4; // Input width of decoder objects
let muxBitWidth = 1; // In/output width for (de-) multiplexers

let selectedElementsList = []; // List of all selected elements

let previewSegmentStartX = 0; // Start point (x, y) of the preview segments
let previewSegmentStartY = 0;

let wireGroupsList = []; // List of all logical wire groups

//let caption = []; // Name of the sketch, displayed on customs

let gridSize = GRIDSIZE; // Size of the grid

let controlMode = 'none'; // Possible modes: none, delete, addObject, select ...
let addType = 0; // Possible modes: none, and, output, input, ...
let wireMode = 'none'; // Possible modes: none, hold, preview, delete ...
let selectMode = 'start';

let gateInputCount = 2; // Input count for new gates
let gateDirection = 0;  // Direction for new gates
let newIsButton = false;
let newIsClock = false;

let customFile = '';

let actionUndoList = [];
let actionRedoList = [];

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
let lastMousePositionX = 0; 
var lastMousePositionY = 0; // last mouse position
let dragSpeed = 1;

let transform = new Transformation(0, 0, 1);

let sClickBox = new ClickBox(0, 0, 0, 0, transform);
let showSClickBox = false;

let simulationIsRunning = false;
let propMode = false;

let saveDialog = false;
let customDialog = false;
let maxCustCols = 0;
let muxCustRows = 0;
let custPage = 0;
let maxPage = 0;

let error = '';
let errordesc = '';

let syncFramerate = true;

let segIndizees = [];
let wireIndices = [];

let cachedFiles = [];
let cachedData = [];
let queue = [];
let next = 0;

let loading = false;
let loadFile = '';

let previewImg;

let showTooltip = true;
let negPreviewShown = false;
let diodePreviewShown = false;
let conpointPreviewShown = false;

// GUI Elements
let textInput, saveDialogText, saveButton, saveDialogButton, dashboardButton, cancelButton, descInput, loadButton, newButton, pageUpButton, pageDownButton;
let deleteButton, simButton, labelBasic, labelAdvanced, // Left hand side
    andButton, orButton, xorButton, inputButton, buttonButton, clockButton,
    outputButton, clockspeedSlider, undoButton, redoButton, propertiesButton, labelButton, segDisplayButton;
let counterButton, decoderButton, dFlipFlopButton, rsFlipFlopButton, reg4Button,
    muxButton, demuxButton, halfaddButton, fulladdButton, customButton;
let updater, sfcheckbox, gateInputSelect, labelGateInputs, directionSelect, bitSelect, labelDirection, labelBits, counterBitSelect, labelOutputWidth,
    decoderBitSelect, labelInputWidth, multiplexerBitSelect;
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
let socket;
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
    cnv.id('mainCanvas');

    // Prevents the input field from being focused when clicking in the canvas
    document.addEventListener('mousedown', function (event) {
        if (event.detail > 1) {
            event.preventDefault();
        }
    }, false);

    document.title = 'LogiJS: New Sketch';

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

    // Adds an rs-flipflop
    rsFlipFlopButton = createButton('RS-FlipFlop');
    rsFlipFlopButton.mousePressed(function () { setActive(rsFlipFlopButton, true); return importCustom('rs-flipflop.json'); });
    rsFlipFlopButton.elt.className = "buttonLeft";
    rsFlipFlopButton.parent(leftSideButtons);
    // Adds a d-flipflop
    dFlipFlopButton = createButton('D-FlipFlop');
    dFlipFlopButton.mousePressed(function () { setActive(dFlipFlopButton, true); return importCustom('d-flipflop.json'); });
    dFlipFlopButton.elt.className = "buttonLeft";
    dFlipFlopButton.parent(leftSideButtons);
    // Adds a counter
    counterButton = createButton('Counter');
    counterButton.mousePressed(function () { setActive(counterButton, true); return counterClicked(); });
    counterButton.elt.className = "buttonLeft";
    counterButton.parent(leftSideButtons);
    // Adds a decoder
    decoderButton = createButton('Decoder');
    decoderButton.mousePressed(function () { setActive(decoderButton, true); return decoderClicked(); });
    decoderButton.elt.className = "buttonLeft";
    decoderButton.parent(leftSideButtons);
    // Adds a multiplexer
    muxButton = createButton('Multiplexer');
    muxButton.mousePressed(function () { setActive(muxButton, true); return muxClicked(); });
    muxButton.elt.className = "buttonLeft";
    muxButton.parent(leftSideButtons);
    // Adds a demultiplexer
    demuxButton = createButton('Demultiplexer');
    demuxButton.mousePressed(function () { setActive(demuxButton, true); return demuxClicked(); });
    demuxButton.elt.className = "buttonLeft";
    demuxButton.parent(leftSideButtons);
    // Adds a register (4Bit)
    reg4Button = createButton('4Bit-Register');
    reg4Button.mousePressed(function () { setActive(reg4Button, true); return importCustom('4-register.json'); });
    reg4Button.elt.className = "buttonLeft";
    reg4Button.parent(leftSideButtons);
    // Adds a Half Adder
    halfaddButton = createButton('Half Adder');
    halfaddButton.mousePressed(function () { setActive(halfaddButton, true); return importCustom('half_add.json'); });
    halfaddButton.elt.className = "buttonLeft";
    halfaddButton.parent(leftSideButtons);

    // Adds a Full Adder
    fulladdButton = createButton('Full Adder');
    fulladdButton.mousePressed(function () { setActive(fulladdButton, true); return importCustom('full_add.json'); });
    fulladdButton.elt.className = "buttonLeft";
    fulladdButton.parent(leftSideButtons);

    customButton = createButton('Sketch Import');
    customButton.mousePressed(customClicked);
    customButton.elt.className = "buttonLeft";
    customButton.parent(leftSideButtons);
    if (getCookieValue('access_token') === '') {
        customButton.elt.disabled = true;
    }

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
    for (let i = 1; i <= 10; i++) {
        gateInputSelect.option(i);
    }
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

    // Adds text 'Output width'
    labelOutputWidth = createP('Output width');
    labelOutputWidth.hide();
    labelOutputWidth.elt.style.color = 'white';
    labelOutputWidth.elt.style.fontFamily = 'Open Sans';
    labelOutputWidth.elt.style.textAlign = 'center';
    labelOutputWidth.elt.style.margin = '3px 0px 0px 0px';
    labelOutputWidth.elt.className = 'label';
    labelOutputWidth.parent(leftSideButtons);

    // Adds text 'Input width'
    labelInputWidth = createP('Input width');
    labelInputWidth.hide();
    labelInputWidth.elt.style.color = 'white';
    labelInputWidth.elt.style.fontFamily = 'Open Sans';
    labelInputWidth.elt.style.textAlign = 'center';
    labelInputWidth.elt.style.margin = '3px 0px 0px 0px';
    labelInputWidth.elt.className = 'label';
    labelInputWidth.parent(leftSideButtons);


    bitSelect = createSelect();
    bitSelect.hide();
    for (let i = 1; i <= 8; i++) {
        bitSelect.option(i);
    }
    bitSelect.option('16');
    bitSelect.option('32');
    bitSelect.changed(newBitLength);
    bitSelect.elt.className = "selectLeft";
    bitSelect.parent(leftSideButtons);
    bitSelect.value('4');

    counterBitSelect = createSelect();
    counterBitSelect.hide();
    for (let i = 2; i <= 5; i++) {
        counterBitSelect.option(i);
    }
    counterBitSelect.changed(newCounterBitLength);
    counterBitSelect.elt.className = "selectLeft";
    counterBitSelect.parent(leftSideButtons);
    counterBitSelect.value('4');

    decoderBitSelect = createSelect();
    decoderBitSelect.hide();
    for (let i = 2; i <= 5; i++) {
        decoderBitSelect.option(i);
    }
    decoderBitSelect.changed(newDecoderBitLength);
    decoderBitSelect.elt.className = "selectLeft";
    decoderBitSelect.parent(leftSideButtons);
    decoderBitSelect.value('4');


    multiplexerBitSelect = createSelect();
    multiplexerBitSelect.hide();
    for (let i = 1; i <= 3; i++) {
        multiplexerBitSelect.option(i);
    }
    multiplexerBitSelect.changed(newMuxBitLength);
    multiplexerBitSelect.elt.className = "selectLeft";
    multiplexerBitSelect.parent(leftSideButtons);
    multiplexerBitSelect.value('1');

    sfcheckbox = createCheckbox('Sync Ticks', true);
    sfcheckbox.hide();
    sfcheckbox.changed(function () {
        syncFramerate = sfcheckbox.checked();
        if (!sfcheckbox.checked() && simulationIsRunning) {
            updater = setInterval(updateTick, 1);
        } else {
            clearInterval(updater);
        }
    });
    sfcheckbox.elt.style.color = 'white';
    sfcheckbox.elt.style.fontFamily = 'Open Sans';
    sfcheckbox.elt.style.textAlign = 'center';
    sfcheckbox.elt.style.margin = '10px 0 0 0';
    sfcheckbox.elt.className = 'checkbox';
    sfcheckbox.parent(leftSideButtons);

    // Adds text 'Clock speed'
    clockspeedLabel = createP('Clock speed:');
    clockspeedLabel.hide();
    clockspeedLabel.elt.style.color = 'white';
    clockspeedLabel.elt.style.fontFamily = 'Open Sans';
    clockspeedLabel.elt.style.textAlign = 'center';
    clockspeedLabel.elt.style.margin = '3px 0px 0px 0px';
    clockspeedLabel.position(windowWidth - 190, 180);

    // A slider for adjusting the clock speed
    clockspeedSlider = createSlider(1, 60, 30, 1);
    clockspeedSlider.hide();
    clockspeedSlider.changed(newClockspeed);
    clockspeedSlider.style('width', '180px');
    clockspeedSlider.style('margin', '5px');
    clockspeedSlider.elt.className = 'slider';
    clockspeedSlider.position(windowWidth - 195, 203);

    //Upper left

    // Activates the edit mode
    propertiesButton = createButton('<i class="fa fa-pen"></i> Edit');
    propertiesButton.position(152, 3);
    propertiesButton.mousePressed(function () {
        setActive(propertiesButton);
        setControlMode('none');
        setPropMode(true);
        previewSymbol = null;
    });
    propertiesButton.elt.className = "button active";


    // Activates the delete mode (objects and wires)
    deleteButton = createButton('<i class="far fa-trash-alt"></i> Delete');
    deleteButton.position(226, 3);
    deleteButton.mousePressed(deleteClicked);
    deleteButton.elt.className = "button";

    // Starts and stops the simulation
    simButton = createButton('<i class="fa fa-play"></i> Start');
    simButton.elt.style.width = '52px';
    simButton.position(316, 3);
    simButton.mousePressed(simClicked);
    simButton.elt.className = "button";

    // Undos the last action
    undoButton = createButton('<i class="fa fa-undo"></i> Undo');
    undoButton.position(396, 3);
    undoButton.mousePressed(() => {
        previewSymbol = null;
        undo();
    });
    undoButton.elt.disabled = true;
    undoButton.elt.className = "button";

    // Redos the last action
    redoButton = createButton('<i class="fa fa-redo"></i> Redo');
    redoButton.position(481, 3);
    redoButton.mousePressed(() => {
        previewSymbol = null;
        redo();
    });
    redoButton.elt.disabled = true;
    redoButton.elt.className = "button";

    // Activates the mode for area selecting
    selectButton = createButton('<i class="fas fa-object-group"></i> Select');
    selectButton.position(564, 3);
    selectButton.mousePressed(startSelect);
    selectButton.elt.className = "button";

    textInput = createInput('');
    textInput.attribute('placeholder', 'SKETCH NAME');
    textInput.position(windowWidth / 2 - 63, windowHeight / 2 - 104);
    textInput.elt.style.fontFamily = 'Open Sans';
    textInput.elt.className = "textInput saveInput";
    textInput.hide();

    descInput = createElement('textarea');
    descInput.attribute('placeholder', 'SKETCH DESCRIPTION');
    descInput.position(windowWidth / 2 - 43, windowHeight / 2 - 25);
    descInput.size(280, 153);
    descInput.elt.style.fontFamily = 'Open Sans';
    descInput.elt.style.fontSize = '15px';
    descInput.elt.className = "textInput descInput";
    if (getCookieValue('access_token') === '') {
        descInput.attribute('placeholder', 'SKETCH DESCRIPTION\n(LOG IN TO GIVE A DESCRIPTION)');
        descInput.elt.disabled = true;
    }
    descInput.hide();

    // Clears the canvas and resets the view
    newButton = createButton('New');
    newButton.position(windowWidth - 270, 3);
    newButton.elt.style.width = '40px';
    newButton.mousePressed(function () {
        if (newButton.html() === 'SURE?') {
            newButton.html('New');
            newClicked();
        } else {
            newButton.html('SURE?');
            setTimeout(function () { newButton.html('New'); }, 3000);
        }
    });
    newButton.elt.className = "button";

    // Button to save the sketch
    saveButton = createButton('Save');
    saveButton.position(windowWidth / 2 + 102, windowHeight / 2 + 150);
    saveButton.mousePressed(saveClicked);
    saveButton.elt.className = "btn btn-lg btn-red";
    saveButton.hide();

    cancelButton = createButton('Cancel');
    cancelButton.position(windowWidth / 2 - 53, windowHeight / 2 + 150);
    cancelButton.mousePressed(cancelClicked);
    cancelButton.elt.className = "btn btn-lg btn-red";
    cancelButton.hide();

    pageUpButton = createButton('Previous Page');
    pageUpButton.position(window.width - 545, window.height - 90);
    pageUpButton.elt.style.width = '200px';
    pageUpButton.style('padding-left', '10px');
    pageUpButton.style('padding-right', '10px');
    pageUpButton.mousePressed(function () {
        if (custPage <= 0) {
            return;
        } else {
            custPage--;
            closeCustomDialog();
            customClicked();
        }
    });
    pageUpButton.elt.className = "btn btn-lg btn-red";
    pageUpButton.hide();

    pageDownButton = createButton('Next Page');
    pageDownButton.position(window.width - 335, window.height - 90);
    //pageDownButton.elt.style.width = '200px';
    pageDownButton.style('padding-left', '10px');
    pageDownButton.style('padding-right', '10px');
    pageDownButton.mousePressed(function () {
        if (custPage >= maxPage) {
            return;
        } else {
            custPage++;
            closeCustomDialog();
            customClicked();
        }
    });
    pageDownButton.elt.className = "btn btn-lg btn-red";
    pageDownButton.hide();

    // Button to load a sketch
    loadButton = createButton('Load');
    loadButton.position(windowWidth - 138, 3);
    loadButton.mousePressed(loadClicked);
    loadButton.elt.className = "button";
    loadButton.hide();

    saveDialogButton = createButton('<i class="fas fa-save"></i> Save');
    saveDialogButton.position(windowWidth - 202, 3);
    saveDialogButton.mousePressed(saveDialogClicked);
    saveDialogButton.elt.className = "button";

    if (getCookieValue('access_token') !== '') {
        dashboardButton = createButton('<i class="fas fa-th"></i> Dashboard');
    } else {
        dashboardButton = createButton('<i class="fa fa-sign-in-alt"></i> Login');
    }
    dashboardButton.elt.style.width = '98px';
    dashboardButton.mousePressed(function () {
        if (dashboardButton.html() === 'SURE?') {
            window.location = '/dashboard';
        } else {
            dashboardButton.html('SURE?');
            setTimeout(function () { if (getCookieValue('access_token') !== '') { dashboardButton.html('<i class="fas fa-th"></i> Dashboard'); } else { dashboardButton.html('<i class="fa fa-sign-in-alt"></i> Login'); } }, 3000);
        }
    });
    dashboardButton.position(windowWidth - 124, 3);
    dashboardButton.elt.className = "button";

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
    propBoxLabel.position(windowWidth - 190, 30);
    propBoxLabel.style('font-size', '30px');

    saveDialogText = createP('Save Sketch');
    saveDialogText.hide();
    saveDialogText.elt.style.color = 'white';
    saveDialogText.elt.style.fontFamily = 'Open Sans';
    saveDialogText.elt.style.margin = '3px 0px 0px 0px';
    saveDialogText.position(windowWidth / 2 - 105, windowHeight / 2 - 160);
    saveDialogText.style('font-size', '36px');

    inputIsTopBox = createCheckbox('Pin input to the top', false);
    inputIsTopBox.hide();
    inputIsTopBox.position(windowWidth - 190, 90);
    inputIsTopBox.changed(newIsTopState);
    inputIsTopBox.elt.style.color = 'white';
    inputIsTopBox.elt.style.fontFamily = 'Open Sans';

    ipNameLabel = createP('Input name:');
    ipNameLabel.hide();
    ipNameLabel.elt.style.color = 'white';
    ipNameLabel.elt.style.fontFamily = 'Open Sans';
    ipNameLabel.elt.style.margin = '3px 0px 0px 0px';
    ipNameLabel.position(windowWidth - 190, 120);

    inputCaptionBox = createInput('');
    inputCaptionBox.elt.style.fontFamily = 'Open Sans';
    inputCaptionBox.hide();
    inputCaptionBox.size(170, 15);
    inputCaptionBox.position(windowWidth - 190, 150);
    inputCaptionBox.input(newInputCaption);
    inputCaptionBox.elt.className = "textInput";

    colNameLabel = createP('Color:');
    colNameLabel.hide();
    colNameLabel.elt.style.color = 'white';
    colNameLabel.elt.style.fontFamily = 'Open Sans';
    colNameLabel.elt.style.margin = '3px 0px 0px 0px';
    colNameLabel.position(windowWidth - 190, 90);

    opNameLabel = createP('Output name:');
    opNameLabel.hide();
    opNameLabel.elt.style.color = 'white';
    opNameLabel.elt.style.fontFamily = 'Open Sans';
    opNameLabel.elt.style.margin = '3px 0px 0px 0px';
    opNameLabel.position(windowWidth - 190, 120);

    labCaptLabel = createP('Label text:');
    labCaptLabel.hide();
    labCaptLabel.elt.style.color = 'white';
    labCaptLabel.elt.style.fontFamily = 'Open Sans';
    labCaptLabel.elt.style.margin = '3px 0px 0px 0px';
    labCaptLabel.position(windowWidth - 190, 90);

    outputCaptionBox = createInput('');
    outputCaptionBox.elt.style.fontFamily = 'Open Sans';
    outputCaptionBox.hide();
    outputCaptionBox.size(170, 15);
    outputCaptionBox.position(windowWidth - 190, 150);
    outputCaptionBox.elt.className = 'textInput';
    outputCaptionBox.input(newOutputCaption);

    outputColorBox = createSelect();
    outputColorBox.hide();
    outputColorBox.elt.style.fontFamily = 'Open Sans';
    outputColorBox.position(windowWidth - 140, 88);
    outputColorBox.size(100, 20);
    outputColorBox.option('red');
    outputColorBox.option('yellow');
    outputColorBox.option('green');
    outputColorBox.option('blue');
    outputColorBox.changed(newOutputColor);
    outputColorBox.elt.className = "selectLeft";

    labelTextBox = createElement('textarea');
    labelTextBox.elt.style.fontFamily = 'Open Sans';
    labelTextBox.elt.style.fontSize = '15px';
    labelTextBox.hide();
    labelTextBox.size(170, 200);
    labelTextBox.position(windowWidth - 190, 120);
    labelTextBox.input(labelChanged);

    frameRate(60); // Caps the framerate at 60 FPS

    setControlMode('none');
    setPropMode(true);

    //sets font-size for all label elements
    let guiLabels = document.getElementsByClassName('label');
    for (let i = 0; i < guiLabels.length; i++) {
        guiLabels[i].style.fontSize = "16px";
    }

    socket = io.connect();

    let loadfile = urlParam('sketch');
    if (loadfile !== '') {
        textInput.value(loadfile);
        setLoading(true);
        loadSketch(loadfile + '.json');
        socket.emit('getDescription', { file: loadfile, access_token: getCookieValue('access_token') });
        socket.on('sketchDescription', (data) => {
            try {
                let d = JSON.parse(data.data);
                if (data.success === true) {
                    descInput.value(d.desc);
                }
            } catch (e) {
                if (data.success === true) {
                    descInput.value(data.data);
                }
            }
            socket.off('sketchDescription');
        });
    }

    //Hide hints if there is a cookie 
    if ((getCookieValue("ClosedHint") === "true")) {
        showHints = false;
        closeTutorialButton.hide();
        nextStepButton.hide();
    }

    socket.on('demousererror', function () {
        error = 'Saving failed: No permissions!';
        errordesc = 'This is a demo account.';
        reDraw();
        setTimeout(function () { error = ''; errordesc = ''; reDraw(); }, 3000);
    });

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

function importCustom(filename) {
    hideAllOptions();
    if (controlMode === 'addObject' && addType === 10 && filename === customFile) {
        setControlMode('none');
        setActive(propertiesButton);
        setPropMode(true);
    } else {
        setControlMode('addObject');
        addType = 10; // custom
        directionSelect.show();
        labelDirection.show();
        customFile = filename;
    }
}

function customClicked() {
    customDialog = true;
    setUnactive();
    setLoading(true);
}

function counterClicked() {
    hideAllOptions();
    setControlMode('addObject');
    addType = 10;
    directionSelect.show();
    labelDirection.show();
    counterBitSelect.show();
    labelOutputWidth.show();
    customFile = counterOutputBitWidth + '-counter.json';
}

function decoderClicked() {
    hideAllOptions();
    setControlMode('addObject');
    addType = 10;
    directionSelect.show();
    labelDirection.show();
    decoderBitSelect.show();
    labelInputWidth.show();
    customFile = decoderInputBitWidth + '-decoder.json';
}

function muxClicked() {
    hideAllOptions();
    setControlMode('addObject');
    addType = 10;
    directionSelect.show();
    labelDirection.show();
    multiplexerBitSelect.show();
    labelInputWidth.show();
    customFile = muxBitWidth + '-mux.json';
}

function demuxClicked() {
    hideAllOptions();
    setControlMode('addObject');
    addType = 10;
    directionSelect.show();
    labelDirection.show();
    multiplexerBitSelect.show();
    labelInputWidth.show();
    customFile = muxBitWidth + '-demux.json';
}

// Triggered when a sketch should be saved
function saveClicked() {
    if (textInput.value().includes(' ')) {
        saveDialogText.position(windowWidth / 2 - 165, windowHeight / 2 - 160);
        saveDialogText.elt.style.color = 'red';
        saveDialogText.html('No spaces allowed!');
        setTimeout(function () {
            saveDialogText.elt.style.color = '#fff';
            saveDialogText.position(windowWidth / 2 - 105, windowHeight / 2 - 160);
            saveDialogText.html('Save Sketch');
        }, 3000);
        return;
    }
    saveSketch(textInput.value() + '.json', function (look) {
        console.log(look);
        document.title = 'LogiJS: ' + textInput.value();
        saveDialog = false;
        saveButton.hide();
        cancelButton.hide();
        textInput.hide();
        descInput.hide();
        saveDialogText.hide();
        setLoading(false);
        reDraw();
        look.desc = descInput.value();
        socket.emit('savePreview', { name: textInput.value(), img: previewImg, desc: JSON.stringify(look), access_token: getCookieValue('access_token') });
    });
    reDraw();
}

function cancelClicked() {
    if (saveDialog) {
        saveDialog = false;
        saveButton.hide();
        textInput.hide();
        descInput.hide();
        saveDialogText.hide();
        setLoading(false);
        cancelButton.hide();
        reDraw();
    } else if (customDialog) {
        closeCustomDialog();
    }
}

function closeCustomDialog() {
    customDialog = false;
    let gradients = document.getElementsByClassName('gradient');
    while (gradients[0]) {
        gradients[0].parentNode.removeChild(gradients[0]);
    }
    let captions = document.getElementsByClassName('capt');
    while (captions[0]) {
        captions[0].parentNode.removeChild(captions[0]);
    }
    let darker = document.getElementsByClassName('darker');
    while (darker[0]) {
        darker[0].parentNode.removeChild(darker[0]);
    }
    let base_layers = document.getElementsByClassName('base_layer');
    while (base_layers[0]) {
        base_layers[0].parentNode.removeChild(base_layers[0]);
    }
    let black_layers = document.getElementsByClassName('black_layer');
    while (black_layers[0]) {
        black_layers[0].parentNode.removeChild(black_layers[0]);
    }
    let top_layers = document.getElementsByClassName('top_layer');
    while (top_layers[0]) {
        top_layers[0].parentNode.removeChild(top_layers[0]);
    }
    let stay_blacks = document.getElementsByClassName('stay_black');
    while (stay_blacks[0]) {
        stay_blacks[0].parentNode.removeChild(stay_blacks[0]);
    }
    setLoading(false);
    pageUpButton.hide();
    pageDownButton.hide();
    cancelButton.hide();
}

// Triggered when a sketch should be loaded
function loadClicked() {
    selectMode = 'none';
    setControlMode('none');
    hidePropMenu();
    setActive(propertiesButton);
    setPropMode(true);
    showSClickBox = false;
    document.title = 'LogiJS: ' + textInput.value();
    loadSketch(textInput.value() + '.json');
    reDraw();
}

function saveDialogClicked() {
    endSimulation();
    saveDialog = true;
    saveButton.show();
    cancelButton.position(windowWidth / 2 - 53, windowHeight / 2 + 150);
    cancelButton.show();
    textInput.show();
    descInput.show();
    saveDialogText.show();
    previewImg = document.getElementById('mainCanvas').toDataURL('image/png');
    setLoading(true);
    reDraw();
}

// Resets the canvas and the view / transformation
function newClicked() {
    clearItems();
    clearActionStacks();
    hideAllOptions();
    closeCustomDialog();
    transform = new Transformation(0, 0, 1);
    gridSize = GRIDSIZE;
    gateInputCount = 2;
    gateInputSelect.value('2');
    gateDirection = 0;
    directionSelect.value('Right');
    loading = false;
    simButton.elt.disabled = false;
    saveButton.elt.disabled = false;
    endSimulation(); // End the simulation, if started
    setPropMode(false); // Restarting PropMode so that the menu hides
    setPropMode(true); // when new is clicked while it's open
    setControlMode('none'); // Clears the control mode
    wireMode = 'none';
    selectMode = 'none';
    showSClickBox = false;
    document.title = 'LogiJS: New Sketch';
    textInput.value('');
    textInput.attribute('placeholder', 'SKETCH NAME');
    findLines();
    previewSymbol = null;
    reDraw();
}

function hideAllOptions() {
    bitSelect.hide();
    labelBits.hide();
    directionSelect.hide();
    labelDirection.hide();
    gateInputSelect.hide();
    labelGateInputs.hide();
    counterBitSelect.hide();
    labelOutputWidth.hide();
    decoderBitSelect.hide();
    multiplexerBitSelect.hide();
    labelInputWidth.hide();
}

/*
    Deletes all items that are drawn on screen
    and also the wire segments that are no longer
    drawn individually
*/
function clearItems() {
    gatesList = [];
    outputsList = [];
    inputsList = [];
    wireSegmentsList = [];
    wireConnectionPointsList = [];
    customObjectsList = [];
    diodesList = [];
    labelsList = [];
    wiresList = [];
    segmentDisplaysList = [];
}

/*
    This clears the undo and redo stacks
*/
function clearActionStacks() {
    actionUndoList = [];
    actionRedoList = [];
}

function pushSelectAction(dx, dy, x1, y1, x2, y2) {
    if ((Math.abs(dx) >= GRIDSIZE || Math.abs(dy) >= GRIDSIZE) && selectedElementsList.length > 0) {
        pushUndoAction('moveSel', [dx, dy, x1, y1, x2, y2], _.cloneDeep(selectedElementsList));
    }
}

function setActive(btn, left) {
    setUnactive();
    hideAllOptions();
    if (left) {
        btn.elt.className = 'buttonLeft active';
    } else {
        btn.elt.className = 'button active';
    }
}

function isActive(btn) {
    return btn.elt.className.includes('active');
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
    counterButton.elt.className = 'buttonLeft';
    decoderButton.elt.className = 'buttonLeft';
    dFlipFlopButton.elt.className = 'buttonLeft';
    rsFlipFlopButton.elt.className = 'buttonLeft';
    reg4Button.elt.className = 'buttonLeft';
    muxButton.elt.className = 'buttonLeft';
    demuxButton.elt.className = 'buttonLeft';
    halfaddButton.elt.className = 'buttonLeft';
    fulladdButton.elt.className = 'buttonLeft';
    customButton.elt.className = 'buttonLeft';
}

function deleteClicked() {
    // If the button was clicked at the end of a select process
    if (controlMode === 'select' && selectMode === 'end') {
        setActive(propertiesButton);
        setPropMode(true); // The select process is finished, go back to prop mode
        controlMode = 'none';
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
        for (let i = 0; i < selectedElementsList.length; i++) {
            if (selectedElementsList[i] instanceof LogicGate) {
                delGates[0].push(selectedElementsList[i]);
                delGates[1].push(gatesList.indexOf(selectedElementsList[i]));
            } else if (selectedElementsList[i] instanceof CustomSketch) {
                for (const elem of selectedElementsList[i].responsibles) {
                    customObjectsList.splice(customObjectsList.indexOf(elem), 1);
                }
                delCustoms[0].push(selectedElementsList[i]);
                delCustoms[1].push(customObjectsList.indexOf(selectedElementsList[i]));
            }
            else if (selectedElementsList[i] instanceof Input) {
                delInputs[0].push(selectedElementsList[i]);
                delInputs[1].push(inputsList.indexOf(selectedElementsList[i]));
            }
            else if (selectedElementsList[i] instanceof Label) {
                delLabels[0].push(selectedElementsList[i]);
                delLabels[1].push(labelsList.indexOf(selectedElementsList[i]));
            }
            else if (selectedElementsList[i] instanceof Output) {
                delOutputs[0].push(selectedElementsList[i]);
                delOutputs[1].push(outputsList.indexOf(selectedElementsList[i]));
            }
            else if (selectedElementsList[i] instanceof SegmentDisplay) {
                delSegDisplays[0].push(selectedElementsList[i]);
                delSegDisplays[1].push(segmentDisplaysList.indexOf(selectedElementsList[i]));
            }
            // Filtering out wires and segments and pushing them into their arrays
            /*else if (selection[i] instanceof Wire) {
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
            }*/
        }
        for (let j = delGates[1].length - 1; j >= 0; j--) {
            gatesList.splice(delGates[1][j], 1);
        }
        for (let j = delCustoms[1].length - 1; j >= 0; j--) {
            customObjectsList.splice(delCustoms[1][j], 1);
        }
        for (let j = delInputs[1].length - 1; j >= 0; j--) {
            inputsList.splice(delInputs[1][j], 1);
        }
        for (let j = delLabels[1].length - 1; j >= 0; j--) {
            labelsList.splice(delLabels[1][j], 1);
        }
        for (let j = delOutputs[1].length - 1; j >= 0; j--) {
            outputsList.splice(delOutputs[1][j], 1);
        }
        /*for (let j = delWires[1].length - 1; j >= 0; j--) {
            //console.log('Deleting wire No. ' + delWires[1][j]);
            wires.splice(delWires[1][j], 1);
        }
        for (let j = delSegments[1].length - 1; j >= 0; j--) {
            //console.log('Deleting segment No. ' + delSegments[1][j]);
            segments.splice(delSegments[1][j], 1);
        }*/
        for (let j = delSegDisplays[1].length - 1; j >= 0; j--) {
            segmentDisplaysList.splice(delSegDisplays[1][j], 1);
        }
        previewWireSegmentsList = [];
        wireMode = 'none';
        lockElements = false;
        if (selectedElementsList.length > 0) {
            pushUndoAction('delSel', 0, [_.cloneDeep(delGates), _.cloneDeep(delCustoms), _.cloneDeep(diodesList), _.cloneDeep(delInputs), _.cloneDeep(delLabels), _.cloneDeep(delOutputs), _.cloneDeep(delWires), _.cloneDeep(delSegDisplays), _.cloneDeep(wireConnectionPointsList), _.cloneDeep(delSegments)]);
        }
        doConpoints();
    } else {
        if (controlMode === 'delete') {
            setControlMode('none');
            setActive(propertiesButton);
            setPropMode(true);
        } else {
            setActive(deleteButton);
            setControlMode('delete');
        }
    }
}

/*
    This triggers when a label text was altered
*/
function labelChanged() {
    labelsList[propLabel].alterText(labelTextBox.value()); // Alter the text of the selected label
}

function newGateInputNumber() {
    gateInputCount = parseInt(gateInputSelect.value());
    // Ensure that the correct preview gate is displayed when user selection changes
    switch(addType){
        case 1: previewSymbol = new CreatePreviewSymbol(new LogicGate(mouseX, mouseY, transform, gateDirection, gateInputCount, 1, 'and', '&'));
                    break;
        case 2:  previewSymbol = new CreatePreviewSymbol(new LogicGate(mouseX, mouseY, transform, gateDirection, gateInputCount, 1, 'or', '≥1'));
                    break;   
        case 3: previewSymbol = new CreatePreviewSymbol(new LogicGate(mouseX, mouseY, transform, gateDirection, gateInputCount, 1, 'xor', '=1'));
                    break;           
    }
    
}

function newBitLength() {
    segmentDisplayBits = parseInt(bitSelect.value());
    previewSymbol = new CreatePreviewSymbol(new SegmentDisplay(mouseX, mouseY, transform, segmentDisplayBits));
}

function newCounterBitLength() {
    counterOutputBitWidth = parseInt(counterBitSelect.value());
    customFile = counterOutputBitWidth + '-counter.json';
}

function newDecoderBitLength() {
    decoderInputBitWidth = parseInt(decoderBitSelect.value());
    customFile = decoderInputBitWidth + '-decoder.json';
}

function newMuxBitLength() {
    muxBitWidth = parseInt(multiplexerBitSelect.value());
    if (isActive(muxButton)) {
        customFile = muxBitWidth + '-mux.json';
    } else if (isActive(demuxButton)) {
        customFile = muxBitWidth + '-demux.json';
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
    switch(addType){
        case 1: previewSymbol = new CreatePreviewSymbol(new LogicGate(mouseX, mouseY, transform, gateDirection, gateInputCount, 1, 'and', '&'));
                    break;
        case 2:  previewSymbol = new CreatePreviewSymbol(new LogicGate(mouseX, mouseY, transform, gateDirection, gateInputCount, 1, 'or', '≥1'));
                    break;   
        case 3: previewSymbol = new CreatePreviewSymbol(new LogicGate(mouseX, mouseY, transform, gateDirection, gateInputCount, 1, 'xor', '=1'));
                    break;           
    }
}

function newClockspeed() {
    if (propInput >= 0) {
        if (inputsList[propInput].clock) {
            inputsList[propInput].speed = 60 - clockspeedSlider.value();
        }
    }
}

/* 
    Toggles the simulation
    Button label updated in the functions
*/
function simClicked() {
    previewSymbol = null;
    if (!simulationIsRunning) {
        reDraw();
        startSimulation();
    } else {
        endSimulation();
    }
}

/*
    Adding modes for gates, in/out, customs, etc.
*/
function andClicked(dontToggle = false) {
    hideAllOptions();
    if (controlMode === 'addObject' && addType === 1 && !dontToggle) {
        setControlMode('none');
        setActive(propertiesButton);
        previewSymbol = null;
        setPropMode(true);
    } else {
        setActive(andButton, true);
        setControlMode('addObject');
        addType = 1; // and
        gateInputSelect.show();
        labelGateInputs.show();
        directionSelect.show();
        labelDirection.show();
        previewSymbol = new CreatePreviewSymbol(new LogicGate(mouseX, mouseY, transform, gateDirection, gateInputCount, 1, 'and', '&'));
    }
}

function orClicked(dontToggle = false) {
    hideAllOptions();
    if (controlMode === 'addObject' && addType === 2 && !dontToggle) {
        setControlMode('none');
        setActive(propertiesButton);
        previewSymbol = null;
        setPropMode(true);
    } else {
        setActive(orButton, true);
        setControlMode('addObject');
        addType = 2; // or
        gateInputSelect.show();
        labelGateInputs.show();
        directionSelect.show();
        labelDirection.show();
        previewSymbol = new CreatePreviewSymbol(new LogicGate(mouseX, mouseY, transform, gateDirection, gateInputCount, 1, 'or', '≥1'));
    }
}

function xorClicked(dontToggle = false) {
    hideAllOptions();
    if (controlMode === 'addObject' && addType === 3 && !dontToggle) {
        setControlMode('none');
        setActive(propertiesButton);
        previewSymbol = null;
        setPropMode(true);
    } else {
        setActive(xorButton, true);
        setControlMode('addObject');
        addType = 3; // xor
        gateInputSelect.show();
        labelGateInputs.show();
        directionSelect.show();
        labelDirection.show();
        previewSymbol = new CreatePreviewSymbol(new LogicGate(mouseX, mouseY, transform, gateDirection, gateInputCount, 1, 'xor', '=1'));
    }
}

function inputClicked(dontToggle = false) {
    hideAllOptions();
    if (controlMode === 'addObject' && addType === 4 && !dontToggle) {
        setControlMode('none');
        setActive(propertiesButton);
        previewSymbol = null;
        setPropMode(true);
    } else {
        setActive(inputButton, true);
        newIsButton = false;
        newIsClock = false;
        setControlMode('addObject');
        addType = 4; // switch
        previewSymbol = new CreatePreviewSymbol(new Input(mouseX, mouseY, transform));
    }
}

function buttonClicked(dontToggle = false) {
    hideAllOptions();
    if (controlMode === 'addObject' && addType === 5 && !dontToggle) {
        setControlMode('none');
        setActive(propertiesButton);
        previewSymbol = null;
        setPropMode(true);
    } else {
        setActive(buttonButton, true);
        newIsButton = true;
        newIsClock = false;
        setControlMode('addObject');
        addType = 5; // button
        previewSymbol = new CreatePreviewSymbol(new Input(mouseX, mouseY, transform));
    }
}

function clockClicked(dontToggle = false) {
    hideAllOptions();
    if (controlMode === 'addObject' && addType === 6 && !dontToggle) {
        setControlMode('none');
        setActive(propertiesButton);
        previewSymbol = null;
        setPropMode(true);
    } else {
        setActive(clockButton, true);
        newIsButton = false;
        newIsClock = true;
        setControlMode('addObject');
        addType = 6; // clock
        previewSymbol = new CreatePreviewSymbol(new Input(mouseX, mouseY, transform));
    }
}

function outputClicked(dontToggle = false) {
    hideAllOptions();
    if (controlMode === 'addObject' && addType === 7 && !dontToggle) {
        setControlMode('none');
        setActive(propertiesButton);
        previewSymbol = null;
        setPropMode(true);
    } else {
        setActive(outputButton, true);
        setControlMode('addObject');
        addType = 7; // output
        previewSymbol = new CreatePreviewSymbol(new Output(mouseX, mouseY, transform, 0));
    }
}

function segDisplayClicked(dontToggle = false) {
    hideAllOptions();
    if (controlMode === 'addObject' && addType === 8 && !dontToggle) {
        setControlMode('none');
        setActive(propertiesButton);
        previewSymbol = null;
        setPropMode(true);
    } else {
        setActive(segDisplayButton, true);
        setControlMode('addObject');
        addType = 8; // segDisplay
        bitSelect.show();
        labelBits.show();
        previewSymbol = new CreatePreviewSymbol(new SegmentDisplay(mouseX, mouseY, transform, 4));
    }
}

// Starts the selection process
function startSelect() {
    previewSymbol = null;
    if (controlMode === 'select') {
        setControlMode('none');
        setActive(propertiesButton);
        setPropMode(true);
    } else {
        setActive(selectButton);
        setControlMode('select');
        selectMode = 'none';
    }
}

// Triggered when a label should be added
function labelButtonClicked(dontToggle = false) {
    hideAllOptions();
    if (controlMode === 'addObject' && addType === 9 && !dontToggle) {
        setControlMode('none');
        setActive(propertiesButton);
        previewSymbol = null;
        setPropMode(true);
    } else {
        setActive(labelButton, true);
        setControlMode('addObject');
        addType = 9; // label
        previewSymbol = new CreatePreviewSymbol(new Label(mouseX, mouseY, 'New label', transform));
    }
}

/*
    Sets the control mode, performing
    extra preparations for selecting
    when it's set to 'select'
*/
function setControlMode(mode) {
    if (controlMode === 'select') {
        selectMode = 'start';
        unmarkAll();
        showSClickBox = false;
    }
    if (mode === 'addObject' || mode === 'select' || mode === 'delete') {
        setPropMode(false);
        controlMode = mode;
    } else if (mode === 'none') {
        controlMode = mode;
    } else {
        console.log('Control mode not supported!');
    }
}

/*
    Adds a new gate with given type, input count and direction
*/
function addGate(type, inputs, direction) {
    for (let i = 0; i < gatesList.length; i++) {
        if ((gatesList[i].x === Math.round(((mouseX - GRIDSIZE / 2) / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE) &&
            (gatesList[i].y === Math.round(((mouseY - GRIDSIZE / 2) / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE)) {
            return;
        }
    }
    let newGate = null;
    switch (type) {
        case 1:
            newGate = new LogicGate(mouseX, mouseY, transform, direction, inputs, 1, 'and');
            newGate.setCoordinates(mouseX / transform.zoom - transform.dx, mouseY / transform.zoom - transform.dy);
            newGate.updateClickBoxes();
            gatesList.push(newGate);
            pushUndoAction('addGate', [], newGate);
            break;
        case 2:
            newGate = new LogicGate(mouseX, mouseY, transform, direction, inputs, 1, 'or');
            newGate.setCoordinates(mouseX / transform.zoom - transform.dx, mouseY / transform.zoom - transform.dy);
            newGate.updateClickBoxes();
            gatesList.push(newGate);
            pushUndoAction('addGate', [], newGate);
            break;
        case 3:
            newGate = new LogicGate(mouseX, mouseY, transform, direction, inputs, 1, 'xor');
            newGate.setCoordinates(mouseX / transform.zoom - transform.dx, mouseY / transform.zoom - transform.dy);
            newGate.updateClickBoxes();
            gatesList.push(newGate);
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
    for (let i = 0; i < customObjectsList.length; i++) {
        if (customObjectsList[i].visible) {
            if ((customObjectsList[i].x === Math.round(((mouseX - GRIDSIZE / 2) / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE) &&
                (customObjectsList[i].y === Math.round(((mouseY - GRIDSIZE / 2) / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE)) {
                return;
            }
        }
    }
    setLoading(true);
    let newCustom = new CustomSketch(mouseX, mouseY, transform, direction, file);
    newCustom.setCoordinates(mouseX / transform.zoom - transform.dx, mouseY / transform.zoom - transform.dy);
    customObjectsList.push(newCustom);
    loadCustomFile(newCustom.filename, customObjectsList.length - 1, customObjectsList.length - 1);
    pushUndoAction('addCust', [], newCustom);
}

/*
    Adds a new output (lamp)
*/
function addOutput() {
    for (var i = 0; i < outputsList.length; i++) {
        if ((outputsList[i].x === Math.round((mouseX / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE) &&
            (outputsList[i].y === Math.round((mouseY / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE)) {
            return;
        }
    }
    var newOutput = new Output(mouseX, mouseY, transform, 0);
    newOutput.setCoordinates(mouseX / transform.zoom - transform.dx, mouseY / transform.zoom - transform.dy);
    newOutput.updateClickBox();
    outputsList.push(newOutput);
    pushUndoAction('addOut', [], newOutput);
    reDraw();
}

/*
    Adds a new 7-segment display
*/
function addSegDisplay(bits) {
    for (var i = 0; i < segmentDisplaysList.length; i++) {
        if ((segmentDisplaysList[i].x === Math.round((mouseX / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE) &&
            (segmentDisplaysList[i].y === Math.round((mouseY / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE)) {
            return;
        }
    }
    var newDisplay = new SegmentDisplay(mouseX, mouseY, transform, bits);
    newDisplay.setCoordinates(mouseX / transform.zoom - transform.dx, mouseY / transform.zoom - transform.dy);
    newDisplay.updateClickBoxes();
    segmentDisplaysList.push(newDisplay);
    pushUndoAction('addSegDis', [], newDisplay);
    reDraw();
}

/*
    Adds a new input (switch, button or clock)
*/
function addInput() {
    for (var i = 0; i < inputsList.length; i++) {
        if ((inputsList[i].x === (Math.round((mouseX / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE) - GRIDSIZE / 2) &&
            (inputsList[i].y === (Math.round((mouseY / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE) - GRIDSIZE / 2)) {
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
    inputsList.push(newInput);
    pushUndoAction('addIn', [], newInput);
    reDraw();
}

/*
    Adds a new label
*/
function addLabel() {
    for (var i = 0; i < labelsList.length; i++) {
        if ((labelsList[i].x === (Math.round((mouseX / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE)) &&
            (labelsList[i].y === (Math.round((mouseY / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE))) {
            return;
        }
    }
    var newLabel = new Label(mouseX, mouseY, 'New label', transform);
    newLabel.setCoordinates(mouseX / transform.zoom - transform.dx, mouseY / transform.zoom - transform.dy);
    newLabel.updateClickBox();
    labelsList.push(newLabel);
    pushUndoAction('addLabel', [], newLabel);
    reDraw();
}

/*
    Deletes the given gate
*/
function deleteGate(gateNumber) {
    pushUndoAction('delGate', [], [gatesList.splice(gateNumber, 1), gateNumber]);
    reDraw();
}

/*
    Deletes the given custom
*/
function deleteCustom(customNumber) {
    for (let i = customObjectsList.length - 1; i >= 0; i--) {
        if (customObjectsList[i].pid === customObjectsList[customNumber].id) {
            customObjectsList.splice(i, 1);
        }
    }
    pushUndoAction('delCust', [], [customObjectsList.splice(customNumber, 1), customNumber]);
    reDraw();
}

/*
    Deletes the given output (lamp)
*/
function deleteOutput(outputNumber) {
    pushUndoAction('delOut', [], outputsList.splice(outputNumber, 1));
    reDraw();
}

/*
    Deletes the given input (switch)
*/
function deleteInput(inputNumber) {
    pushUndoAction('delIn', [], inputsList.splice(inputNumber, 1));
    reDraw();
}

/*
    Deletes the given diode
*/
function deleteDiode(diodeNumber) {
    if (diodesList[diodeNumber].cp) {
        let x = diodesList[diodeNumber].x;
        let y = diodesList[diodeNumber].y;
        pushUndoAction('delDi', [], diodesList.splice(diodeNumber, 1));
        createConpoint(x, y, false, -1);
    }
    else {
        pushUndoAction('delDi', [], diodesList.splice(diodeNumber, 1));
    }
    doConpoints(); // Conpoints under diodes should appear again
    reDraw();
}

/*
    Deletes the given label
*/
function deleteLabel(labelNumber) {
    pushUndoAction('delLabel', [], labelsList.splice(labelNumber, 1));
    reDraw();
}

/*
    Deletes the given 7-segment display
*/
function deleteSegDisplay(segDisNumber) {
    pushUndoAction('delSegDis', [], segmentDisplaysList.splice(segDisNumber, 1));
    reDraw();
}

/*
    Starts the simulation mode
    - Groups are created and objects are integrated
    - simRunning is set so that the sketch can't be altered
*/
function startSimulation() {
    if (!sfcheckbox.checked()) {
        updater = setInterval(updateTick, 0);
    }

    setSimButtonText('<i class="fa fa-stop"></i> Stop'); // Alter the caption of the Start/Stop button
    setControlMode('none');
    setUnactive();
    disableButtons(true);
    setPropMode(false);
    hideAllOptions();
    showSClickBox = false; // Hide the selection click box

    parseGroups();
    integrateElements();

    // Reset all clocks
    for (const elem of inputsList) {
        if (elem.getIsClock()) {
            elem.resetFramecount();
        }
    }

    // Tell all customs that the simulation started
    for (let i = 0; i < customObjectsList.length; i++) {
        customObjectsList[i].setSimRunning(true);
    }

    sfcheckbox.show();

    // Start the simulation and exit the properties mode
    simulationIsRunning = true;
    propMode = false;
}

/*
    Ends the simulation mode
    - Groups are deleted
    - Objects are set to low state
    - simRunning is cleared so that the sketch can be altered
*/
function endSimulation(reset = true) {
    clearInterval(updater); // Stop the unsynced simulation updater
    setSimButtonText('<i class="fa fa-play"></i> Start'); // Set the button caption to 'Start'
    if (reset) {
        setControlMode('none');
        setPropMode(true);
        setActive(propertiesButton);
    }
    disableButtons(false); // Enable all buttons
    updateUndoButtons();
    sfcheckbox.hide();

    wireGroupsList = []; // Reset the groups, as they are regenerated when starting again
    for (const elem of gatesList) {
        elem.shutdown(); // Tell all the gates to leave the simulation mode
    }
    for (const elem of customObjectsList) {
        elem.setSimRunning(false); // Shutdown all custom elements
    }
    for (const elem of segmentDisplaysList) {
        elem.shutdown();
    }
    // Set all item states to zero
    for (const elem of wireConnectionPointsList) {
        elem.state = false;
    }
    for (const elem of outputsList) {
        elem.state = false;
    }
    for (const elem of inputsList) {
        elem.setState(false);
    }
    for (const elem of diodesList) {
        elem.setState(false);
    }
    for (const elem of wiresList) {
        elem.state = false;
    }
    simulationIsRunning = false;
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
    redoButton.elt.disabled = (actionRedoList.length === 0);
    undoButton.elt.disabled = (actionUndoList.length === 0);
    if (loading) {
        redoButton.elt.disabled = true;
        undoButton.elt.disabled = true;
    }
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
    decoderButton.elt.disabled = status;
    counterButton.elt.disabled = status;
    muxButton.elt.disabled = status;
    demuxButton.elt.disabled = status;
    dFlipFlopButton.elt.disabled = status;
    rsFlipFlopButton.elt.disabled = status;
    halfaddButton.elt.disabled = status;
    fulladdButton.elt.disabled = status;
    if (getCookieValue('access_token') !== '') {
        customButton.elt.disabled = status;
    }
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
    if (simulationIsRunning) {
        updateTick(); // Updates the circuit logic
        reDraw(); // Redraw all elements of the sketch
    } else {
        if ((wireMode === 'preview' || wireMode === 'delete') && !mouseOverGUI()) {
            generateSegmentSet(previewSegmentStartX, previewSegmentStartY, Math.round((mouseX / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE,
                Math.round((mouseY / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE, false);
            reDraw();
        }

        if (controlMode === 'select') {
            reDraw();
        }

    }

    handleDragging();
}

/*
    Executes one update tick of the sketch logic
*/
function updateTick() {
    // Tell all gates to update
    for (const value of gatesList) {
        value.update();
    }

    // Tell all visible customs to update
    // (they will update all of their gates and customs by themselves)
    for (const value of customObjectsList) {
        if (value.visible) {
            value.update();
        }
    }

    // Update all wire groups
    updateGroups();

    // Update all connection points to adopt the state of their wire group
    for (const value of wireConnectionPointsList) {
        value.state = wireGroupsList[value.group].state;
    }

    // Update all self-toggling input elements (buttons and clocks)
    for (const value of inputsList) {
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
    for (const value of segmentDisplaysList) {
        value.update();
    }

    // Update the states of all diodes
    // They adopt the state of their group A (horizontal wire)
    // and if they are high, they pass that event to group B
    for (const value of diodesList) {
        value.state = wireGroupsList[value.gA].state;
        if (value.state) {
            wireGroupsList[value.gB].diodeHigh();
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

    // Display the preview wire segment set
    if (wireMode === 'preview' || wireMode === 'delete') {
        for (const elem of previewWireSegmentsList) { // Display preview segments
            elem.show(wireMode === 'delete');
        }
    }

    if (controlMode === 'select' && selectMode === 'start') {
        fill(0, 0, 0, 100); // Set the fill color to a semi-transparent black
        noStroke();
        selectEndX = Math.round(((mouseX + GRIDSIZE / 2) / transform.zoom - transform.dx - GRIDSIZE / 2) / GRIDSIZE) * GRIDSIZE + GRIDSIZE / 2;
        selectEndY = Math.round(((mouseY + GRIDSIZE / 2) / transform.zoom - transform.dy - GRIDSIZE / 2) / GRIDSIZE) * GRIDSIZE + GRIDSIZE / 2;
        rect(Math.min(selectStartX, selectEndX), Math.min(selectStartY, selectEndY),
            Math.abs(selectStartX - selectEndX), Math.abs(selectStartY - selectEndY));
    }
    //let t1 = performance.now();
    //console.log("took " + (t1 - t0) + " milliseconds.");

    // Reverse the scaling and translating to draw the stationary elements of the GUI
    scale(1 / transform.zoom);
    translate(-transform.zoom * transform.dx, -transform.zoom * transform.dy);

    // If the prop mode is active and an object was selected, show the config menu background
    if (propMode && propInput + propOutput + propLabel >= -2) {
        fill(50);
        rect(window.width - 203, 0, 203, window.height);
    }

    // If the tutorial should be shown, display it on screen
    if (showHints) {
        showTutorial();
    }

    if (loading && !saveDialog && !customDialog) {
        showMessage('Loading...', loadFile.split('.json')[0]);
    }

    if (error !== '') {
        showMessage(error, errordesc);
    }

    if (saveDialog) {
        stackBlurCanvasRGB('mainCanvas', 0, 0, window.width, window.height, 12);
        showSaveDialog();
        showPreviewImage();
    }

    if (customDialog) {
        stackBlurCanvasRGB('mainCanvas', 0, 0, window.width, window.height, 12);
        showCustomDialog();
        textFont('Gudea');
    }

    // Draw the zoom and framerate labels
    textSize(12);
    fill(0);
    noStroke();
    text(Math.round(transform.zoom * 100) + '%', 10, window.height - 20); // Zoom label
    text(Math.round(frameRate()), window.width - 20, window.height - 20); // Framerate label
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
            displayHint(650, hintPic19, 'Diodes', 'Diodes are components that join two crossing wires in the horizontal',
                'but not in the vertical direction. They can be used for diode matrices.');
            break;
        case 17:
            displayHint(550, hintPic20, 'Diodes', 'Please load the sketch called \'traffic\'. As you can see,',
                'there is an area with multiple diodes (little triangles) on it.');
            break;
        case 18:
            displayHint(750, hintPic21, 'Diodes', 'In edit mode, you can toggle diodes and connection points by clicking on them or on',
                'empty wire crossings. Start the simulation to see how they are used in this example!');
            break;
        case 19:
            displayHint(650, hintPic23, 'Custom components', 'You can name in- and outputs and set inputs to the top of the component',
                'by altering these settings in the properties menu of the sketch to import.');
            break;
        case 20:
            displayHint(450, hintPic24, 'Custom components', 'Inputs labeled with \'>\' will appear as',
                'clock inputs with an arrow drawn on them.');
            break;
        case 21:
            displayHint(600, hintPic25, 'Labels', 'You can add text labels using the \'Label\' button. The text can',
                'be changed in the properties menu after clicking on them.');
            break;
        case 22:
            displayHint(650, hintPic26, '\'New\' and \'Select\'', 'Click on \'New\' to start a new sketch. When clicking on \'Select\' you can',
                'select parts of your sketch to move them on the canvas or delete them.');
            break;
        case 23:
            displayHint(600, hintPic0, 'Thank you!', 'You\'ve reached the end of this little tutorial on LogiJS.',
                'We hope that you like our work and we value any feedback from you.');
            nextStepButton.hide();
            break;
        default:
            break;
    }
}

function showMessage(msg, subline = '') {
    fill(0, 0, 0, 80);
    noStroke();
    rect(0, 0, window.width, window.height);

    fill(200, 50, 50);
    noStroke();
    rect(window.width / 2 - 300, window.height / 2 - 75, 600, 150);
    stroke(0);
    strokeWeight(4);
    strokeCap(SQUARE);
    line(window.width / 2 - 300, window.height / 2 + 75, window.width / 2 + 300, window.height / 2 + 75);
    strokeCap(ROUND);
    fill(255);
    noStroke();
    textSize(30);
    textAlign(CENTER, CENTER);
    text(msg, window.width / 2, window.height / 2);
    textSize(20);
    text(subline, window.width / 2, window.height / 2 + 30);
}

function showSaveDialog() {
    fill('rgba(50, 50, 50, 0.95)');
    noStroke();
    rect(window.width / 2 - 365, window.height / 2 - 188, 580, 400);
}

function showCustomDialog() {
    maxCustCols = Math.floor((window.width - window.width / 4) / 240);
    maxCustRows = Math.floor((window.height - 180) / 240);
    pageUpButton.position(maxCustCols * 240 + 10, window.height - 90);
    pageDownButton.position(maxCustCols * 240 + 220, window.height - 90);
    fill('rgba(50, 50, 50, 0.95)');
    noStroke();
    rect(Math.round(window.width / 8), 90, window.width - Math.round(window.width / 4), window.height - 140);
    pageUpButton.show();
    pageDownButton.show();
    cancelButton.position(Math.round(window.width / 8) + 180, window.height - 90);
    cancelButton.show();
    socket.emit('getImportSketches', { access_token: getCookieValue('access_token') });
    socket.on('importSketches', (data) => {
        socket.off('importSketches');
        maxPage = Math.ceil(Math.ceil(data.sketches.length / maxCustCols) / maxCustRows) - 1;
        for (let i = 0; i < data.sketches.length; i++) {
            showCustomItem(i + 1, data.images[i], data.sketches[i], data.looks[i]);
        }
    });
}

function showCustomItem(place, img, caption, look) {
    let row = Math.ceil(place / maxCustCols - 1) - (custPage * maxCustRows);
    let x = ((place - 1) % maxCustCols) * 240 + Math.round(window.width / 8) + 40;
    let y = (row * 240) + 90 + 40;
    if (row >= maxCustRows || row < 0) {
        return;
    }
    if (img !== '') {
        let sketch_item = createDiv('');
        sketch_item.elt.className = 'sketch_item';
        let base_layer = createImg('data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==', function () {
            base_layer.position(x + 150, y + 30);
            base_layer.elt.className = 'base_layer';
            base_layer.parent(sketch_item);
        });
        let black_layer = createImg('data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==', function () {
            black_layer.position(x + 150, y + 30);
            if (look.hasOwnProperty('outputs')) {
                if (look.outputs > 0) {
                    black_layer.elt.className = 'black_layer';
                } else {
                    black_layer.elt.className = 'stay_black';
                }
            }
            black_layer.parent(sketch_item);
        });
        img = 'data:image/png;base64,' + img;
        let raw = new Image(200, 200);
        raw.src = img;
        raw.onload = function () {
            let normal_img = createImage(200, 200);
            normal_img.drawingContext.drawImage(raw, 0, 0);
            image(normal_img, x, y);
            if (look.hasOwnProperty('outputs')) {
                if (look.outputs > 0) {
                    showImportPreview(look, x, y);
                }
            }
        };
        let darker_img = createImg(img, function () {
            darker_img.position(x + 150, y + 30);
            darker_img.elt.className = 'darker ease_in';
            darker_img.parent(sketch_item);
        });
        if (look.hasOwnProperty('outputs')) {
            if (look.outputs > 0) {
                showImportPreview(look, x, y);
            }
        }
        let gradient = createImg('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAQAAAAHUWYVAAABV0lEQVR4Ae3YBxEAMRADMafwxxwU6RKFHd+XnpKDIIggCCIIggiCIIKwWk8NFoIggiCIIAgiCIIIgiD4dWIhCCIIggiCIILgOwQLEQRBBEEQQRBEEARBEEHwL8tCEEQQBBEEQRDEdwgWIgiCCIIggiAIggiCIH6dYCGCIIggCIIggiCID0MsRBAEEQRBEEQQfIdYCIIIgiCCIAiCCIIggiCIf1lYiCAI8idBBEEQQfAdYiEIIgiCIIggCCIIggiCXycWgiAIIgiCCIIggiCIIAhCDxaChVgIFmIhCOJkYSGC4GRhIRaChQiCk2UhCOJkYSFYiIUgiJOFhVgIFmIhWAiCOFlYiCA4WRaChVgIguBkWQgWYiEI4mRhIRaChSCIk4WFWAgWIghOloUgCE6WhWAhFoIgThYWYiFYCII4WViIhWAhguBkWQgWgoUIgpNlIViIhSDIFwafxgPUTiURLQAAAABJRU5ErkJggg==', function () {
            gradient.position(x + 150, y + 30);
            gradient.elt.className = 'gradient';
            gradient.parent(sketch_item);
        });
        let capt = createP(caption.slice(0, 25).toUpperCase());
        capt.style('font-family', 'Open Sans');
        capt.position(x + 160, y + 185);
        capt.style('color', 'white');
        capt.elt.className = 'capt';
        let top_layer = createImg('data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==', function () {
            top_layer.position(x + 150, y + 30);
            top_layer.elt.className = 'top_layer';
            top_layer.parent(sketch_item);
            if (look.outputs === 0) {
                top_layer.elt.style.cursor = 'not-allowed';
            } else {
                top_layer.mousePressed(function () {
                    setActive(customButton, true);
                    importCustom(caption + '.json');
                    closeCustomDialog();
                });
            }
        });
    }
}

function showPreviewImage() {
    let raw = new Image();
    raw.src = previewImg;
    raw.onload = function () {
        let img = createImage(raw.width, raw.height);
        img.drawingContext.drawImage(raw, 0, 0, window.height, window.height, 0, 0, window.height, window.height);
        img.resize(0, window.height / 1.5);
        img.resize(0, window.height / 3);
        img.resize(0, 200);
        image(img, window.width / 2 - 330, window.height / 2 - 99);
    };
}

/*
    Displays the given hint text (two lines + caption) and an image in a box in the bottom left corner
*/
function displayHint(width, img, caption, line1, line2) {
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

function showElements() {
    if (simulationIsRunning) {
        for (const elem of wireGroupsList) {
            elem.show();
        }
    } else {
        for (const elem of wiresList) {
            elem.show();
        }
    }

    if (gatesList.length > 0) {
        textFont('monospace');
        for (const elem of gatesList) {
            elem.show();
        }
    }

    if (customObjectsList.length > 0) {
        textFont('Open Sans');
        for (const elem of customObjectsList) {
            if (elem.visible) {
                elem.show();
            }
        }
    }

    for (const elem of wireConnectionPointsList) {
        elem.show();
    }

    for (const elem of outputsList) {
        elem.show();
    }

    for (const elem of inputsList) {
        elem.show();
    }

    for (const elem of diodesList) {
        elem.show();
    }

    if (segmentDisplaysList.length > 0) {
        textFont('PT Mono');
        for (const elem of segmentDisplaysList) {
            elem.show();
        }
    }

    textFont('Gudea');
    textSize(20);
    textAlign(LEFT, TOP);
    for (const elem of labelsList) {
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
    for (var i = 0; i < wireGroupsList.length; i++) {
        wireGroupsList[i].updateAll();
    }
}

/*
    Check if a key was pressed and act accordingly
*/
function keyPressed() {
    if (inputCaptionBox.elt === document.activeElement || outputCaptionBox.elt === document.activeElement || labelTextBox.elt === document.activeElement || loading) {
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
                setPropMode(false);
                hideAllOptions();
                simClicked();
                break;
            case CONTROL:
                startSelect();
                break;
            case 32: // Space
                if (controlMode !== 'delete') {
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

function setLoading(l) {
    loading = l;
    disableButtons(l);
    simButton.elt.disabled = l;
    saveDialogButton.elt.disabled = l;
    if (getCookieValue('access_token') !== '') {
        customButton.elt.disabled = l;
    }
    if (!l) {
        saveButton.elt.disabled = false;
    }
    closeTutorialButton.elt.disabled = l;
    nextStepButton.elt.disabled = l;
    updateUndoButtons();
    if (l) {
        undoButton.elt.disabled = true;
        redoButton.elt.disabled = true;
    }
    reDraw();
}

function showImportPreview(item, x, y) {
    let x1, x2, y1, y2;
    let w = Math.max((item.tops.length - 1), 0) * 30 + 60;
    let h = (Math.max(item.inputs - item.tops.length, item.outputs) + 1) * 30;
    let scaling = 1;
    if (h >= 120) {
        scaling = 120 / h;
        x += 180 - w * scaling;
        scale(scaling);
    } else {
        x += 180 - w;
    }
    y += 20 * scaling;
    stroke(0);
    strokeWeight(3);
    fill(255);
    textFont('Open Sans');

    // Draw the body
    if (item.tops.length === 0) {
        rect(x / scaling, (y / scaling) + GRIDSIZE / 2, w, h - GRIDSIZE);
    } else {
        rect(x / scaling, y / scaling, w, h);
    }

    noStroke();
    textAlign(CENTER, CENTER);
    fill(0);
    textSize(10);
    text(item.caption, (x / scaling) + w / 2, (y / scaling) + h / 2);
    textSize(14);
    let tops = 0;
    for (let i = 1; i <= item.inputs; i++) {
        stroke(0);
        strokeWeight(2);
        if (item.tops.includes(i - 1)) {
            tops++;
            x1 = (x / scaling) + (30 * tops);
            y1 = (y / scaling) - 6;
            x2 = (x / scaling) + (30 * tops);
            y2 = (y / scaling);
            if (item.inputLabels[i - 1] === ">") {
                line(x1, y2 + 14, x1 - 6, y2);
                line(x1, y2 + 14, x1 + 6, y2);
            } else {
                noStroke();
                text(item.inputLabels[i - 1], x1, y2 + 10);
            }
        } else {
            x1 = (x / scaling) - 6;
            y1 = (y / scaling) + (30 * (i - tops));
            x2 = (x / scaling);
            y2 = (y / scaling) + (30 * (i - tops));
            if (item.inputLabels[i - 1] === ">") {
                line(x2 + 14, y1, x2, y1 - 6);
                line(x2 + 14, y1, x2, y1 + 6);
            } else {
                noStroke();
                text(item.inputLabels[i - 1], x2 + 10, y1);
            }
        }
        stroke(0);
        strokeWeight(3);
        line(x1, y1, x2, y2);
    }

    for (let i = 1; i <= item.outputs; i++) {
        stroke(0);
        strokeWeight(3);
        x1 = (x / scaling) + w;
        y1 = (y / scaling) + (30 * i);
        x2 = (x / scaling) + w + 6;
        y2 = (y / scaling) + (30 * i);
        noStroke();
        text(item.outputLabels[i - 1], x1 - 10, y1);
        stroke(0);
        strokeWeight(3);
        line(x1, y1, x2, y2);
    }

    scale(1 / scaling);
    textAlign(LEFT, TOP);
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