// File: sketch.js

let gates = []; // List of gates (and, or, xor)
let outputs = []; // List of outputs
let inputs = []; // List of inputs (buttons, switches)
let pwWireX = null;
let pwWireY = null;
let conpoints = []; // List of wire connection points
let diodes = []; // List of diodes
let customs = []; // List of custom objects
let wires = []; // List of wires
let labels = []; // List of text labels
let segDisplays = []; // List of 7-segment displays

let sevenSegmentBits = 4; // Number of bits for new 7-segment displays
let counterBitWidth = 4; // Output width of counter objects
let decoderBitWidth = 2; // Input width of decoder objects
let muxBitWidth = 1; // In/output width for (de-) multiplexers

let startDirection = 0; // Start direction for the current wire preview
let traced = []; // List of all traced wires (needed by parseGroups)

/*
    This is a list of all elements that are currently selected with the selection tool
*/
let selection = [];

let selectionConpoints = [];
let selectionWires = [];

/*
    These are the start coordinates for the wire preview elements
*/
let wirePreviewStartX = 0;
let wirePreviewStartY = 0;

/*
    This list contains all logical wire groups of the current sketch
*/
let groups = [];

/*
    Name that is displayed on the sketch's custom module
*/
let moduleCaption = []; // Name of the sketch, displayed on customs

/*
    Current size of the grid in pixels, scaled to the current zoom level
*/
let currentGridSize = GRIDSIZE;

/*
    The control mode represents the current state of the system.
    These are the different possible modes:
        - modify: the default modifier mode
        - delete: when this is active, elements can be deleted from sketch
        - addObject: when this is active, elements can be places on the sketch
        - select: this mode is to select parts of the sketch
*/
let controlMode = 'modify';

let addType = 0;
let wireMode = 'none'; // Possible modes: none, hold, preview, delete ...

/*
    This represents the current state of the selection process:
        - none: The selection process hasn't been started
        - start: The selection mode has been selected, but the user hasn't started dragging
        - drag: The user has pressed the left mouse button to drag
        - end: The user ended the selection process by releasing the mouse button
*/
let selectMode = 'none';

/*
    This is the input count for new gates
*/
let gateInputCount = 2;

/*
    This is the direction for new gates and custom modules
*/
let gateDirection = 0;

/*
    If this is true, the inputs that are placed will be buttons
*/
let newIsButton = false;

/*
    If this is true, the inputs that are placed will be clock elements
*/
let newIsClock = false;

/*
    The name of the custom module that is currently selected to be placed
*/
let custFile = '';

let actionUndo = [];
let actionRedo = [];

let selectStartX = 0;
let selectStartY = 0;
let selectEndX = 0;
let selectEndY = 0;

let sDragX1 = 0;
let sDragX2 = 0;
let sDragY1 = 0;
let sDragY2 = 0;
let initX = 0;
let initY = 0;

/*
    If these aren't zero, the canvas offset has changed
*/
let lastX = 0;
var lastY = 0;

/*
    This is the speed with that the canvas is dragged
    It's recalculated for every zoom level
*/
let dragSpeed = 1;

/*
    This objects contains the current zoom level as well as x and y offset
*/
let transform = new Transformation(0, 0, 1);

/*
    This ClickBox represents the selection box that is used to mark parts of the sketch
*/
let selectionBox = new ClickBox(0, 0, 0, 0, transform);

/*
    If this is true, the selectionBox is displayed on the canvas
*/
let showSelectionBox = false;

/*
    If this is true, the simulation has been started
*/
let simRunning = false;

/*
    If this is true, the save dialog is displayed
*/
let saveDialog = false;

/*
    If this variable is true, the custom module dialog is displayed
*/
let showCustomDialog = false;

let error = '';
let errordesc = '';

/*
    This object indicates if and what object preview should be drawn on screen.
*/

let previewData = {};

let importSketchData = {}; // Contains look and caption of all user sketches that can be imported

/*
    If this is deactivated, the simulation will run as fast as possible, not synced to the framerate.
*/
let syncFramerate = true;

let speedMultiplicator = 10;

let stopTicks = false;

let segIndices = [];
let wireIndices = [];

/*
    These arrays contain the data of custom modules that have already been loaded from server once.
*/
let cachedFiles = [];
let cachedData = [];

/*
    This array contains all custom modules that have yet to be loaded to complete the loading of the entire module.
    It contains file names and index positions in which module to load the data. When loading one module,
    new submodules will be added to the main queue.
*/
let customsToLoadQueue = [];

/*
    This is the index for the customsToLoadQueue that indicates which module will be loaded next
*/
let nextCustomToLoadIndex = 0;

/*
    This variable is true, when the system is loading a sketch or module. Prevents button clicking, canvas movements etc.
*/
let loading = false;

/*
    This contains the file name of the sketch or module that is currently being loaded.
*/
let loadFile = '';

let justClosedMenu = false;

/*
    This variable contains a preview of the sketch, a snapshot is taken every time, 'Save' is clicked.
*/
let previewImg;

/*
    This variable indicates whether the user changed the module name of the current sketch. If this is the case,
    it shouldn't be reset to the sketch name when editing it.
*/
let moduleNameChanged = false;

/*
    These variable is set if a negation, connection point or diode preview was added to the last drawn frame.
    In this case, the canvas will be redrawn with the next mouse movement.
*/
let removeOldPreview = false;

/*
    When an element is selected in modifier mode, it's number is saved in the respective variable.
    The other variables should be -1, indicating no element of this type is selected.
*/
let inputToModify = -1;
let outputToModify = -1;
let labelToModify = -1;

let swapInput = -1;
let swapOutput = -1;

let modifierMenuX, modifierMenuY;

let moduleOptions = false;

let sequencerAdjusted = false;
let clickedOutOfGUI = false;

/*
    These are the modifier elements and their descriptional labels.
*/
let inputIsTopBox, captionInput; // Input elements
let redButton, yellowButton, greenButton, blueButton; // Output elements
let labelTextBox; // Label elements

/*
    This is a select element that allows the user to alter the in- and output order.
    It's displayed in the modifier menu of in- and outputs.
*/
let sequencer;

let leftSideButtons, topLeftButtons, topRightButtons, topButtonsContainer;

let sketchNameInput, moduleNameInput, saveButton, saveDialogText;
let helpLabel, cancelButton, descInput;
let deleteButton, simButton, labelBasic, labelAdvanced, labelOptions, labelSimulation,
    andButton, orButton, xorButton, bufferButton, notButton, inputButton, buttonButton, clockButton,
    outputButton, clockspeedSlider, undoButton, redoButton, modifierModeButton, labelButton, segDisplayButton, moduleButton;

/*
    Right side elements
*/
let importButton, saveDialogButton, dashboardButton, topSketchInput;

let counterButton, decoderButton, dFlipFlopButton, rsFlipFlopButton, reg4Button,
    muxButton, demuxButton, halfaddButton, fulladdButton, customButton;

let gateInputSelect, labelGateInputs, directionSelect, bitSelect, labelDirection, labelBits, counterBitSelect, labelOutputWidth,
    decoderBitSelect, labelInputWidth, multiplexerBitSelect;

let tickTimeSlider, tickTimeLabel, bpTickTimeCB, tickTimeMsLabel, sfcheckbox, multiplicatorSlider, multiplicatorLabel;

/*
    This is the socket element used for socket communication with the server
*/
let socket;

/*
    This is the main HTML5 canvas variable for the sketch area
*/
let mainCanvas, pwCanvas;

let PWp5; // The p5 element for the preview canvas
let modulep5; // p5 element for the module canvas

let lastTickTime = 0;
let tickTime = 10;

let lastrfTime = 0;
let rfTime = 16;

let tourStep = 0;

/*
    Disable some error messages from p5
*/
p5.disableFriendlyErrors = true; // jshint ignore:line

/*
    This line prevents the browser default right-click menu from appearing.
*/
document.addEventListener('contextmenu', event => event.preventDefault());

/*
    Sets up the canvas and caps the framerate
*/
function setup() { // jshint ignore:line
    topButtonsContainer = document.getElementById('topButtonsContainer');

    //Div for the Top Left Buttons
    topLeftButtons = document.getElementById('topLeftButtons');

    //Div for the Top Right Buttons
    topRightButtons = document.getElementById('topRightButtons');

    mainCanvas = createCanvas(windowWidth - 240, windowHeight - 50);     // Creates the canvas in full window size
    mainCanvas.position(240, 50);
    mainCanvas.id('mainCanvas');

    initPreviewCanvas();
    initModuleCanvas();

    // Prevents the input field from being focused when clicking in the canvas
    document.addEventListener('mousedown', function (event) {
        if (event.detail > 1) {
            event.preventDefault();
        }
    }, false);

    document.title = 'LogiJS: New Sketch';

    leftSideContainer = createDiv('');
    //leftSideContainer.elt.style.height = (windowHeight - 74 - 32 - 15).toString() + 'px';
    leftSideContainer.elt.className = 'scrollContainerLeft';
    //leftSideContainer.elt.style.margin = '20px 0px';

    //Div for the Left Side Buttons
    leftSideButtons = createDiv('');
    leftSideButtons.elt.className = 'scrollBoxLeft';
    leftSideButtons.parent(leftSideContainer);
    leftSideButtons.elt.style.height = Math.min(500, windowHeight - 300) + 'px';

    createTopButtons();

    createBasicElements();
    createAdvancedElements();

    createCustomImportButton();
    createElementOptions();

    createDialogElements();

    createTopRightButtons();

    createModifierElements();

    frameRate(60); // Caps the framerate at 60 FPS

    enterModifierMode();

    socket = io.connect();
    loadURLSketch();

    socket.on('demousererror', function () {
        error = 'Saving failed: No permissions!';
        errordesc = 'This is a demo account.';
        reDraw();
        setTimeout(function () { error = ''; errordesc = ''; reDraw(); }, 3000);
    });

    socket.on('regexerror', function () {
        error = 'Saving failed: Forbidden characters!';
        errordesc = 'Please use only letters and numbers.';
        reDraw();
        setTimeout(function () { error = ''; errordesc = ''; reDraw(); }, 3000);
    });

    socket.on('nametoolongerror', function () {
        error = 'Saving failed: Sketch name too long!';
        errordesc = 'Please keep your file names shorter than 50 characters.';
        reDraw();
        setTimeout(function () { error = ''; errordesc = ''; reDraw(); }, 3000);
    });

    fetchImportData();

    reDraw();
    setTimeout(reDraw, 100); // Redraw after 100ms in case fonts weren't loaded on first redraw
    justClosedMenu = false;

    initTour();
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
    if (controlMode === 'addObject' && addType === 10 && filename === custFile) {
        enterModifierMode();
    } else {
        setControlMode('addObject');
        if (showCustomDialog) {
            addType = 11; // external custom
            closeCustomDialog();
        } else {
            addType = 10; // internal custom
        }
        labelDirection.show();
        labelDirection.style('display', 'inline-block');
        directionSelect.show();
        directionSelect.style('display', 'inline-block');
        labelOptions.show();
        custFile = filename;
    }
}

function customClicked() {
    if (showCustomDialog) {
        closeCustomDialog();
        return;
    }
    showCustomDialog = true;
    setPreviewElement(false, {}, 'none');
    setActive(customButton, true);
    setControlMode('modify');
    displayCustomDialog();
}

function counterClicked() {
    hideAllOptions();
    setControlMode('addObject');
    addType = 10;
    labelDirection.show();
    labelDirection.style('display', 'inline-block');
    directionSelect.show();
    directionSelect.style('display', 'inline-block');
    labelOutputWidth.show();
    labelOutputWidth.style('display', 'inline-block');
    counterBitSelect.show();
    counterBitSelect.style('display', 'inline-block');
    labelOptions.show();
    custFile = counterBitWidth + '-counter.json';
}

function decoderClicked() {
    hideAllOptions();
    setControlMode('addObject');
    addType = 10;
    labelDirection.show();
    labelDirection.style('display', 'inline-block');
    directionSelect.show();
    directionSelect.style('display', 'inline-block');
    labelInputWidth.show();
    labelInputWidth.style('display', 'inline-block');
    decoderBitSelect.show();
    decoderBitSelect.style('display', 'inline-block');
    labelOptions.show();
    custFile = decoderBitWidth + '-decoder.json';
}

function muxClicked() {
    hideAllOptions();
    setControlMode('addObject');
    addType = 10;
    labelDirection.show();
    labelDirection.style('display', 'inline-block');
    directionSelect.show();
    directionSelect.style('display', 'inline-block');
    labelInputWidth.show();
    labelInputWidth.style('display', 'inline-block');
    multiplexerBitSelect.show();
    multiplexerBitSelect.style('display', 'inline-block');
    labelOptions.show();
    custFile = muxBitWidth + '-mux.json';
}

function demuxClicked() {
    hideAllOptions();
    setControlMode('addObject');
    addType = 10;
    labelDirection.show();
    labelDirection.style('display', 'inline-block');
    directionSelect.show();
    directionSelect.style('display', 'inline-block');
    labelInputWidth.show();
    labelInputWidth.style('display', 'inline-block');
    multiplexerBitSelect.show();
    multiplexerBitSelect.style('display', 'inline-block');
    labelOptions.show();
    custFile = muxBitWidth + '-demux.json';
}

function importJSONClicked() {
    let files = document.getElementById('fileid').files;
    if (files.length <= 0) {
        return false;
    }

    let fr = new FileReader();

    fr.onload = function (e) {
        if (simRunning) {
            endSimulation();
            enterModifierMode();
        }
        let result = JSON.parse(e.target.result);
        let name = files.item(0).name.split('.')[0];
        loadSketchFromJSON(result, name);
        sketchNameInput.value = name;
    };

    fr.readAsText(files.item(0));
}

// Triggered when a sketch should be saved
function saveClicked() {
    filename = sketchNameInput.value;
    if (filename === '') {
        filename = 'untitled';
    }
    saveSketch(filename + '.json', function (look) {
        enterModifierMode();
        look.desc = descInput.value;
        document.title = 'LogiJS: ' + filename;
        socket.emit('savePreview', { name: filename, img: previewImg, desc: JSON.stringify(look), access_token: getCookieValue('access_token') });
    });
}

function cancelClicked() {
    enterModifierMode();
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
    labelOptions.hide();
    labelSimulation.hide();
}

/*
    Deletes all items that are drawn on screen
*/
function clearItems() {
    gates = [];
    outputs = [];
    inputs = [];
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

function pushMoveSelectionAction(dx, dy, x1, y1, x2, y2) {
    if ((Math.abs(dx) >= GRIDSIZE || Math.abs(dy) >= GRIDSIZE) && selection.length > 0) {
        pushUndoAction('moveSel', [dx, dy, x1, y1, x2, y2], [_.cloneDeep(selection), _.cloneDeep(selectionConpoints), _.cloneDeep(selectionWires)]);
    }
}

function setActive(btn, clear = true) {
    if (clear) {
        setUnactive();
    }
    hideAllOptions();
    btn.elt.className += ' active';
}

function isActive(btn) {
    return btn.elt.className.includes('active');
}

function setUnactive() {
    andButton.elt.className = 'previewButton';
    orButton.elt.className = 'previewButton';
    xorButton.elt.className = 'previewButton';
    bufferButton.elt.className = 'previewButton';
    notButton.elt.className = 'previewButton';
    inputButton.elt.className = 'previewButton';
    buttonButton.elt.className = 'previewButton';
    clockButton.elt.className = 'previewButton';
    outputButton.elt.className = 'previewButton';
    labelButton.elt.className = 'previewButton';
    segDisplayButton.elt.className = 'previewButton';
    counterButton.elt.className = 'previewButton';
    decoderButton.elt.className = 'previewButton';
    dFlipFlopButton.elt.className = 'previewButton';
    rsFlipFlopButton.elt.className = 'previewButton';
    reg4Button.elt.className = 'previewButton';
    muxButton.elt.className = 'previewButton';
    demuxButton.elt.className = 'previewButton';
    halfaddButton.elt.className = 'previewButton';
    fulladdButton.elt.className = 'previewButton';
    customButton.elt.className = 'buttonLeft';

    deleteButton.elt.className = 'button';
    selectButton.elt.className = 'button';
    modifierModeButton.elt.className = 'button';
    simButton.elt.className = 'button';
    saveDialogButton.elt.className = 'button';
    moduleButton.elt.className = 'button';
}

function deleteClicked() {
    // If the button was clicked at the end of a select process
    if (controlMode === 'select' && selectMode === 'end') {
        enterModifierMode();
        setControlMode('modify');
        unmarkAll();
        let delGates = [[], []];
        let delCustoms = [[], []];
        let delInputs = [[], []];
        let delLabels = [[], []];
        let delOutputs = [[], []];
        let delWires = [[], []];
        let delSegDisplays = [[], []];
        for (let i = 0; i < selection.length; i++) {
            error = 'This feature is coming soon!';
            errordesc = '';
            setTimeout(function () { error = ''; }, 3000); //jshint ignore:line
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
        for (let j = delSegDisplays[1].length - 1; j >= 0; j--) {
            segDisplays.splice(delSegDisplays[1][j], 1);
        }
        pwWireX = null;
        pwWireY = null;
        wireMode = 'none';
        lockElements = false;
        if (selection.length > 0) {
            pushUndoAction('delSel', 0, [_.cloneDeep(delGates), _.cloneDeep(delCustoms), _.cloneDeep(diodes), _.cloneDeep(delInputs), _.cloneDeep(delLabels), _.cloneDeep(delOutputs), _.cloneDeep(delWires), _.cloneDeep(delSegDisplays), _.cloneDeep(conpoints)]);
        }
        doConpoints();
    } else {
        if (controlMode === 'delete') {
            enterModifierMode();
        } else {
            setActive(deleteButton, true);
            setControlMode('delete');
        }
    }
}

/*
    This triggers when a label text was altered
*/
function labelChanged() {
    textFont('Gudea');
    textSize(20);
    labels[labelToModify].alterText(labelTextBox.value); // Alter the text of the selected label
    reDraw();
    positionModifierElements();
}

function newGateInputNumber() {
    gateInputCount = parseInt(gateInputSelect.value());
}

function newBitLength() {
    sevenSegmentBits = parseInt(bitSelect.value());
}

function newCounterBitLength() {
    counterBitWidth = parseInt(counterBitSelect.value());
    custFile = counterBitWidth + '-counter.json';
    if (isActive(counterButton)) {
        let opLabels = [];
        for (let i = 0; i < counterBitWidth; i++) {
            opLabels.push(i);
        }
        setPreviewElement(true, {
            tops: [],
            inputLabels: ['>'],
            outputLabels: opLabels,
            caption: 'Counter',
            inputs: 1,
            outputs: counterBitWidth
        });
    }
}

function newDecoderBitLength() {
    decoderBitWidth = parseInt(decoderBitSelect.value());
    custFile = decoderBitWidth + '-decoder.json';
    if (isActive(decoderButton)) {
        let opLabels = [];
        for (let i = 0; i < Math.pow(2, decoderBitWidth); i++) {
            opLabels.push(i);
        }
        let ipLabels = ['2⁴', '2³', '2²', '2¹', '2º'].slice(5 - decoderBitWidth, 5);
        setPreviewElement(true, {
            tops: [],
            inputLabels: ipLabels,
            outputLabels: opLabels,
            caption: 'Decoder',
            inputs: decoderBitWidth,
            outputs: Math.pow(2, decoderBitWidth)
        });
    }
}

function newMuxBitLength() {
    muxBitWidth = parseInt(multiplexerBitSelect.value());
    if (isActive(muxButton)) {
        let ipLabels = [];
        switch (muxBitWidth) {
            case 1:
                ipLabels.push('2º');
                break;
            case 2:
                ipLabels.push('2¹');
                ipLabels.push('2º');
                break;
            case 3:
                ipLabels.push('2²');
                ipLabels.push('2¹');
                ipLabels.push('2º');
                break;
        }
        for (let i = 0; i < Math.pow(2, muxBitWidth); i++) {
            ipLabels.push(i);
        }
        let tops = [];
        for (let i = 0; i < muxBitWidth; i++) {
            tops.push(i);
        }
        setPreviewElement(true, {
            tops: tops,
            inputLabels: ipLabels,
            outputLabels: [''],
            caption: 'MUX',
            inputs: Math.pow(2, muxBitWidth) + muxBitWidth,
            outputs: 1
        });
        custFile = muxBitWidth + '-mux.json';
    } else if (isActive(demuxButton)) {
        let ipLabels = [];
        switch (muxBitWidth) {
            case 1:
                ipLabels.push('2º');
                break;
            case 2:
                ipLabels.push('2¹');
                ipLabels.push('2º');
                break;
            case 3:
                ipLabels.push('2²');
                ipLabels.push('2¹');
                ipLabels.push('2º');
                break;
        }
        ipLabels.push('');
        let tops = [];
        for (let i = 0; i < muxBitWidth; i++) {
            tops.push(i);
        }
        let opLabels = [];
        for (let i = 0; i < Math.pow(2, muxBitWidth); i++) {
            opLabels.push(i);
        }
        setPreviewElement(true, {
            tops: tops,
            inputLabels: ipLabels,
            outputLabels: opLabels,
            caption: 'DEMUX',
            inputs: 1 + muxBitWidth,
            outputs: Math.pow(2, muxBitWidth)
        });
        custFile = muxBitWidth + '-demux.json';
    }
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
    if (inputToModify >= 0) {
        if (inputs[inputToModify].clock) {
            inputs[inputToModify].speed = 61 - clockspeedSlider.value;
            if (inputs[inputToModify].speed !== 1) {
                document.getElementById('cs-label').innerHTML = inputs[inputToModify].speed + ' ticks/toggle';
            } else {
                document.getElementById('cs-label').innerHTML = inputs[inputToModify].speed + ' tick/toggle';
            }
        }
    }
}

function newTickTime() {
    tickTime = tickTimeSlider.value();
    tickTimeMsLabel.elt.innerHTML = tickTimeSlider.value() + 'ms';
}

function newMultiplicator() {
    speedMultiplicator = multiplicatorSlider.value() * 10;
    if (simRunning) {
        stopTicks = true;
        setTimeout(function () {
            stopTicks = false;
            if (!syncFramerate) {
                for (let i = 0; i < speedMultiplicator; i++) {
                    updateTick();
                }
            }
        }, 20);
    }
    multiplicatorLabel.elt.innerHTML = multiplicatorSlider.value();
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
        enterModifierMode();
    }
}

/*
    Adding modes for gates, in/out, customs, etc.
*/
function andClicked(dontToggle = false) {
    hideAllOptions();
    if (controlMode === 'addObject' && addType === 1 && !dontToggle) {
        enterModifierMode();
    } else {
        setActive(andButton, true);
        setControlMode('addObject');
        addType = 1; // and
        setPreviewElement(false, {}, 'and');
        gateInputSelect.show();
        gateInputSelect.style('display', 'inline-block');
        labelGateInputs.show();
        labelGateInputs.style('display', 'inline-block');
        directionSelect.show();
        directionSelect.style('display', 'inline-block');
        labelDirection.show();
        labelDirection.style('display', 'inline-block');
        labelOptions.show();
    }
}

function orClicked(dontToggle = false) {
    hideAllOptions();
    if (controlMode === 'addObject' && addType === 2 && !dontToggle) {
        enterModifierMode();
    } else {
        setActive(orButton, true);
        setControlMode('addObject');
        addType = 2; // or
        setPreviewElement(false, {}, 'or');
        gateInputSelect.show();
        gateInputSelect.style('display', 'inline-block');
        labelGateInputs.show();
        labelGateInputs.style('display', 'inline-block');
        directionSelect.show();
        directionSelect.style('display', 'inline-block');
        labelDirection.show();
        labelDirection.style('display', 'inline-block');
        labelOptions.show();
    }
}

function xorClicked(dontToggle = false) {
    hideAllOptions();
    if (controlMode === 'addObject' && addType === 3 && !dontToggle) {
        enterModifierMode();
    } else {
        setActive(xorButton, true);
        setControlMode('addObject');
        addType = 3; // xor
        setPreviewElement(false, {}, 'xor');
        gateInputSelect.show();
        gateInputSelect.style('display', 'inline-block');
        labelGateInputs.show();
        labelGateInputs.style('display', 'inline-block');
        directionSelect.show();
        directionSelect.style('display', 'inline-block');
        labelDirection.show();
        labelDirection.style('display', 'inline-block');
        labelOptions.show();
    }
}

function inputClicked(dontToggle = false) {
    hideAllOptions();
    if (controlMode === 'addObject' && addType === 4 && !dontToggle) {
        enterModifierMode();
    } else {
        setActive(inputButton, true);
        newIsButton = false;
        newIsClock = false;
        setPreviewElement(false, {}, 'switch');
        setControlMode('addObject');
        addType = 4; // switch
    }
}

function buttonClicked(dontToggle = false) {
    hideAllOptions();
    if (controlMode === 'addObject' && addType === 5 && !dontToggle) {
        enterModifierMode();
    } else {
        setActive(buttonButton, true);
        newIsButton = true;
        newIsClock = false;
        setPreviewElement(false, {}, 'button');
        setControlMode('addObject');
        addType = 5; // button
    }
}

function clockClicked(dontToggle = false) {
    hideAllOptions();
    if (controlMode === 'addObject' && addType === 6 && !dontToggle) {
        enterModifierMode();
    } else {
        setActive(clockButton, true);
        newIsButton = false;
        newIsClock = true;
        setPreviewElement(false, {}, 'clock');
        setControlMode('addObject');
        addType = 6; // clock
    }
}

function outputClicked(dontToggle = false) {
    hideAllOptions();
    if (controlMode === 'addObject' && addType === 7 && !dontToggle) {
        enterModifierMode();
    } else {
        setActive(outputButton, true);
        setControlMode('addObject');
        addType = 7; // output
        setPreviewElement(false, {}, 'output');
    }
}

function segDisplayClicked(dontToggle = false) {
    hideAllOptions();
    if (controlMode === 'addObject' && addType === 8 && !dontToggle) {
        enterModifierMode();
    } else {
        setActive(segDisplayButton, true);
        setControlMode('addObject');
        addType = 8; // segDisplay
        setPreviewElement(false, {}, '7-segment');
        bitSelect.show();
        bitSelect.style('display', 'inline-block');
        labelBits.show();
        labelBits.style('display', 'inline-block');
        labelOptions.show();
    }
}

// Starts the selection process
function startSelect() {
    if (controlMode === 'select') {
        enterModifierMode();
    } else {
        setActive(selectButton, true);
        setControlMode('select');
        setSelectMode('none');
    }
}

// Triggered when a label should be added
function labelButtonClicked(dontToggle = false) {
    hideAllOptions();
    if (controlMode === 'addObject' && addType === 9 && !dontToggle) {
        enterModifierMode();
    } else {
        setActive(labelButton, true);
        setControlMode('addObject');
        addType = 9; // label
        setPreviewElement(false, {}, 'label');
    }
}

function setControlMode(mode) {
    if (controlMode === 'select') { // If the select mode is leaved, clean up
        setSelectMode('none');
    }
    if (mode === 'addObject' || mode === 'select' || mode === 'delete') {
        closeModifierMenu();
        controlMode = mode;
    } else if (mode === 'modify') {
        controlMode = 'modify';
    } else {
        console.log('Control mode not supported!');
    }
}

function setSelectMode(mode) {
    selectMode = mode;
    switch (selectMode) {
        case 'none':
            unmarkAll();
            selection = [];
            selectionConpoints = [];
            selectionWires = [];
            showSelectionBox = false;
            break;
        case 'start':
            showSelectionBox = false;
            break;
        case 'drag':
            showSelectionBox = true;
            break;
        case 'end':
            showSelectionBox = true;
            break;
        default:
    }
    reDraw();
}

function addWires() {
    let pushed = false; // True, when wires have been changed in any way

    // These are set true when a preview wire in that direction is 100% part of the existing wire
    let overlapOverAllX = false;
    let overlapOverAllY = false;

    let xIndex = -1;
    let yIndex = -1;

    let deletedIndices = [];

    let editLog = [];

    if (pwWireX !== null) {
        for (let i = 0; i < wires.length; i++) {
            let overlap = wireOverlap(pwWireX, wires[i]);
            if ((overlap[0] !== overlap[2] || overlap[1] !== overlap[3]) || (wires[i].direction === 0 && pwWireX.startY === wires[i].startY &&
                (pwWireX.startX == wires[i].endX || pwWireX.startX == wires[i].startX || pwWireX.endX == wires[i].startX || pwWireX.endX == wires[i].endX))) { //jshint ignore:line
                if (xIndex >= 0) {
                    let newWire = new Wire(0, Math.min(wires[xIndex].startX, wires[i].startX), wires[xIndex].startY, false, transform);
                    newWire.endX = Math.max(wires[xIndex].endX, wires[i].endX);
                    newWire.endY = wires[xIndex].startY;
                    if (newWire.startX !== wires[i].startX || newWire.endX !== wires[i].endX) {
                        editLog.push(['r', xIndex, wires[xIndex], newWire]);
                        wires.splice(xIndex, 1, newWire);
                        pushed = true;
                        deletedIndices.push(i);
                    } else {
                        overlapOverAllX = true;
                    }
                } else {
                    let newWire = new Wire(0, Math.min(pwWireX.startX, wires[i].startX), pwWireX.startY, false, transform);
                    newWire.endX = Math.max(pwWireX.endX, wires[i].endX);
                    newWire.endY = pwWireX.startY;
                    if (newWire.startX !== wires[i].startX || newWire.endX !== wires[i].endX) {
                        editLog.push(['r', i, wires[i], newWire]);
                        wires.splice(i, 1, newWire);
                        pushed = true;
                        xIndex = i;
                    } else {
                        overlapOverAllX = true;
                    }
                }
            }
        }

        if (xIndex < 0 && !overlapOverAllX) {
            let newWire = new Wire(0, pwWireX.startX, pwWireX.startY, false, transform);
            newWire.endX = pwWireX.endX;
            newWire.endY = pwWireX.startY;
            editLog.push(['a', wires.length, newWire]);
            wires.push(newWire);
            pushed = true;
        }
    }

    if (pwWireY !== null) {
        for (let i = 0; i < wires.length; i++) {
            let overlap = wireOverlap(pwWireY, wires[i]);
            // If there's an overlap or the wires are adjacent
            if ((overlap[0] !== overlap[2] || overlap[1] !== overlap[3]) || (wires[i].direction === 1 && pwWireY.startX === wires[i].startX &&
                (pwWireY.startY == wires[i].endY || pwWireY.startY == wires[i].startY || pwWireY.endY == wires[i].startY || pwWireY.endY == wires[i].endY))) { //jshint ignore:line
                if (yIndex >= 0) {
                    let newWire = new Wire(1, wires[yIndex].startX, Math.min(wires[yIndex].startY, wires[i].startY), false, transform);
                    newWire.endX = wires[yIndex].startX;
                    newWire.endY = Math.max(wires[yIndex].endY, wires[i].endY);
                    if (newWire.startY !== wires[i].startY || newWire.endY !== wires[i].endY) {
                        editLog.push(['r', yIndex, wires[yIndex], newWire]);
                        wires.splice(yIndex, 1, newWire);
                        pushed = true;
                        deletedIndices.push(i);
                    } else {
                        overlapOverAllY = true;
                    }
                } else {
                    let newWire = new Wire(1, pwWireY.startX, Math.min(pwWireY.startY, wires[i].startY), false, transform);
                    newWire.endX = pwWireY.startX;
                    newWire.endY = Math.max(pwWireY.endY, wires[i].endY);
                    if (newWire.startY !== wires[i].startY || newWire.endY !== wires[i].endY) {
                        editLog.push(['r', i, wires[i], newWire]);
                        wires.splice(i, 1, newWire);
                        pushed = true;
                        yIndex = i;
                    } else {
                        overlapOverAllY = true;
                    }
                }
            }
        }

        if (yIndex < 0 && !overlapOverAllY) {
            let newWire = new Wire(1, pwWireY.startX, pwWireY.startY, false, transform);
            newWire.endX = pwWireY.startX;
            newWire.endY = pwWireY.endY;
            editLog.push(['a', wires.length, newWire]);
            wires.push(newWire);
            pushed = true;
        }
    }

    for (let i = deletedIndices.length - 1; i >= 0; i--) {
        editLog.push(['d', deletedIndices[i], wires.splice(deletedIndices[i], 1)[0]]);
    }

    if (pushed) {
        let conpointsBefore = _.cloneDeep(conpoints);
        doConpoints();
        let conpointsAfter = _.cloneDeep(conpoints);
        pushUndoAction('addWire', [], [_.cloneDeep(editLog), conpointsBefore, conpointsAfter]); // push the action for undoing
        wireMode = 'hold';
    } else {
        wireMode = 'none';
    }

    lockElements = false;
    pwWireX = null;
    pwWireY = null;
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
            pushUndoAction('addGate', [gates.length - 1], [newGate]);
            break;
        case 2:
            newGate = new LogicGate(mouseX, mouseY, transform, direction, inputs, 1, 'or');
            newGate.setCoordinates(mouseX / transform.zoom - transform.dx, mouseY / transform.zoom - transform.dy);
            newGate.updateClickBoxes();
            gates.push(newGate);
            pushUndoAction('addGate', [gates.length - 1], [newGate]);
            break;
        case 3:
            newGate = new LogicGate(mouseX, mouseY, transform, direction, inputs, 1, 'xor');
            newGate.setCoordinates(mouseX / transform.zoom - transform.dx, mouseY / transform.zoom - transform.dy);
            newGate.updateClickBoxes();
            gates.push(newGate);
            pushUndoAction('addGate', [gates.length - 1], [newGate]);
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
    setLoading(true);
    let newCustom = new CustomSketch(mouseX, mouseY, transform, direction, file);
    newCustom.setCoordinates(mouseX / transform.zoom - transform.dx, mouseY / transform.zoom - transform.dy);
    customs.push(newCustom);
    loadCustomFile(newCustom.filename, customs.length - 1, customs.length - 1);
    pushUndoAction('addCust', [customs.length - 1], [newCustom]);
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
    moduleButton.elt.disabled = false;
    pushUndoAction('addOut', [outputs.length - 1], [newOutput]);
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
    pushUndoAction('addSegDis', [segDisplays.length - 1], [newDisplay]);
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
    pushUndoAction('addIn', [inputs.length - 1], [newInput]);
    moduleButton.elt.disabled = false;
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
    var newLabel = new Label(mouseX, mouseY, 'New Label', transform);
    newLabel.setCoordinates(mouseX / transform.zoom - transform.dx, mouseY / transform.zoom - transform.dy);
    newLabel.updateClickBox();
    labels.push(newLabel);
    pushUndoAction('addLabel', [labels.length - 1], [newLabel]);
    reDraw();
}

function deleteWires() {
    let deletedDiodesIndices = [];
    let deletedDiodes = [];

    let changes = false;

    let newWiresList = [];
    let replaceIndices = [];
    let deletedIndices = [];

    let editLog = [];

    if (pwWireX !== null) {
        for (let i = 0; i < wires.length; i++) {
            let overlap = wireOverlap(pwWireX, wires[i]);
            let newWires = removeFromWire(wires[i], overlap, i);
            if (newWires !== false) {
                deletedIndices.push(i);
                changes = true;
                if (newWires.length >= 1) {
                    newWiresList.push(newWires);
                    replaceIndices.push(i);
                }
            }
        }
    }

    if (pwWireY !== null) {
        for (let i = 0; i < wires.length; i++) {
            let overlap = wireOverlap(pwWireY, wires[i]);
            let newWires = removeFromWire(wires[i], overlap, i);
            if (newWires !== false) {
                deletedIndices.push(i);
                changes = true;
                if (newWires.length >= 1) {
                    newWiresList.push(newWires);
                    replaceIndices.push(i);
                }
            }
        }
    }

    let lengthBeforeDelete = wires.length;

    /*
        delete all wires that should be removed
    */
    for (let i = wires.length - 1; i >= 0; i--) {
        if (deletedIndices.indexOf(i) >= 0) {
            editLog.push(['d', i, wires.splice(i, 1)[0]]);
        }
    }

    /*
        Add all newly created wires
    */
    for (let i = lengthBeforeDelete - 1; i >= 0; i--) {
        if (deletedIndices.indexOf(i) >= 0) {
            if (replaceIndices.indexOf(i) >= 0) {
                let newWires = newWiresList.pop();
                for (let j = 0; j < newWires.length; j++) {
                    if (newWires[j].startX !== newWires[j].endX || newWires[j].startY !== newWires[j].endY) {
                        editLog.push(['a', i + j, newWires[j]]);
                        wires.splice(i + j, 0, newWires[j]);
                    }
                }
            }
        }
    }

    /*
        Note all indices of diodes that are placed on the preview wires
    */
    if (pwWireX !== null) {
        deletedDiodesIndices = deletedDiodesIndices.concat(diodesOnWire(pwWireX));
    }

    if (pwWireY !== null) {
        deletedDiodesIndices = deletedDiodesIndices.concat(diodesOnWire(pwWireY));
    }


    if (changes) { // only push an undo action when changes have been made to the wires
        deletedDiodesIndices.sort(function (a, b) { // sort the diode indices to remove them in the right order
            return a - b;
        });
        deletedDiodesIndices = _.uniq(deletedDiodesIndices); // Remove duplicate indices in case a diode is on both wires
        for (let i = deletedDiodesIndices.length - 1; i >= 0; i--) {
            deletedDiodes.push(diodes.splice(deletedDiodesIndices[i], 1)); // remove the diodes and save them in an array
        }
        deletedDiodes.reverse();
        let conpointsBefore = _.cloneDeep(conpoints);
        doConpoints();
        let conpointsAfter = _.cloneDeep(conpoints);
        pushUndoAction('delWire', [deletedDiodesIndices], [editLog, conpointsBefore, conpointsAfter, deletedDiodes]);
    }

    pwWireX = null; // reset the preview wires
    pwWireY = null;
    wireMode = 'none';
    lockElements = false;
}

/*
    Deletes the given gate
*/
function deleteGate(gateNumber) {
    pushUndoAction('delGate', [gateNumber], gates.splice(gateNumber, 1));
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
    pushUndoAction('delCust', [customNumber], customs.splice(customNumber, 1));
    reDraw();
}

/*
    Deletes the given output (lamp)
*/
function deleteOutput(outputNumber) {
    pushUndoAction('delOut', [outputNumber], outputs.splice(outputNumber, 1));
    moduleButton.elt.disabled = (outputs.length === 0);
    reDraw();
}

/*
    Deletes the given input (switch)
*/
function deleteInput(inputNumber) {
    pushUndoAction('delIn', [inputNumber], inputs.splice(inputNumber, 1));
    moduleButton.elt.disabled = (outputs.length === 0);
    reDraw();
}

/*
    Deletes the given label
*/
function deleteLabel(labelNumber) {
    pushUndoAction('delLabel', [labelNumber], labels.splice(labelNumber, 1));
    reDraw();
}

/*
    Deletes the given 7-segment display
*/
function deleteSegDisplay(segDisNumber) {
    pushUndoAction('delSegDis', [segDisNumber], segDisplays.splice(segDisNumber, 1));
    reDraw();
}

/*
    Starts the simulation mode
    - Groups are created and objects are integrated
    - simRunning is set so that the sketch can't be altered
*/
function startSimulation() {
    setSimButtonText('<i class="fa fa-stop icon"></i> Stop'); // Alter the caption of the Start/Stop button

    // Go to modify mode to hide previews etc.
    setControlMode('modify');

    // Configure the DOMs for simulation mode
    setActive(simButton, true);
    configureButtons('simulation');
    hideAllOptions();
    leftSideButtons.hide();
    customButton.hide();

    // Parse all wire groups and attach the components
    parseGroups();
    integrateElements();

    // Reset all clocks
    for (const elem of inputs) {
        if (elem.getIsClock()) {
            elem.resetFramecount();
        }
    }

    // Tell all customs that the simulation started
    for (let i = 0; i < customs.length; i++) {
        customs[i].setSimRunning(true);
    }

    labelSimulation.show();

    // Show the frame sync checkbox
    sfcheckbox.show();

    tickTimeLabel.show();
    tickTimeMsLabel.show();
    tickTimeSlider.show();
    bpTickTimeCB.show();
    multiplicatorSlider.show();
    multiplicatorLabel.show();
    multDescLabel.show();
    multDescLabel.style('display', 'inline-block');

    // Start the simulation and exit the modifier mode
    simRunning = true;
    closeModifierMenu();
    newMultiplicator();
}

/*
    Ends the simulation mode
    - Groups are deleted
    - Objects are set to low state
    - simRunning is cleared so that the sketch can be altered
*/
function endSimulation() {
    setSimButtonText('<i class="fa fa-play icon"></i> Start'); // Set the button caption to 'Start'
    configureButtons('edit');
    stopTicks = true;
    setTimeout(function () { // wait until all updateTick functions have terminated
        // Hide the checkbox
        labelSimulation.hide();
        sfcheckbox.hide();

        // Hide the tick time slider
        tickTimeLabel.hide();
        tickTimeMsLabel.hide();
        tickTimeSlider.hide();
        multiplicatorSlider.hide();
        multiplicatorLabel.hide();
        multDescLabel.hide();

        bpTickTimeCB.hide();

        leftSideButtons.show();
        customButton.show();

        groups = []; // Reset the groups, as they are regenerated when starting again
        for (const elem of gates) {
            elem.shutdown(); // Tell all the gates to leave the simulation mode
        }
        for (const elem of customs) {
            elem.setSimRunning(false); // Shutdown all custom elements
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
        for (const elem of wires) {
            elem.setState(false);
        }

        simRunning = false;
        reDraw();
    }, 20);
}

function setSimButtonText(text) {
    simButton.elt.innerHTML = text;
}

/*
    Enables/Disables the undo and redo buttons
    depending on the state of the stack
*/
function updateUndoButtons() {
    if (loading) {
        redoButton.elt.disabled = true;
        undoButton.elt.disabled = true;
    } else {
        redoButton.elt.disabled = (actionRedo.length === 0);
        undoButton.elt.disabled = (actionUndo.length === 0);
    }
}

function configureButtons(mode) {
    let toolbox, modifiers, simulation, customimport, savedialog, jsonimport, moduleimport;
    if (mode === 'edit') {
        toolbox = false;
        modifiers = false;
        savedialog = false;
        simulation = false;
        customimport = false;
        jsonimport = false;
        moduleimport = false;
    } else if (mode === 'simulation') {
        toolbox = true;
        modifiers = true;
        savedialog = false;
        simulation = false;
        customimport = true;
        jsonimport = false;
        moduleimport = true;
    } else if (mode === 'savedialog') {
        toolbox = true;
        modifiers = true;
        savedialog = false;
        simulation = true;
        customimport = true;
        jsonimport = true;
        moduleimport = true;
    } else if (mode === 'customdialog') {
        toolbox = true;
        modifiers = true;
        savedialog = true;
        simulation = true;
        customimport = false;
        jsonimport = true;
        moduleimport = true;
    } else if (mode === 'loading') {
        toolbox = true;
        modifiers = true;
        savedialog = true;
        simulation = true;
        customimport = true;
        jsonimport = true;
        moduleimport = true;
    } else if (mode === 'moduleOptions') {
        toolbox = true;
        modifiers = true;
        savedialog = true;
        simulation = true;
        customimport = true;
        jsonimport = true;
        moduleimport = false;
    } else {
        toolbox = false;
        modifiers = false;
        savedialog = false;
        simulation = false;
        customimport = false;
        jsonimport = false;
        moduleimport = false;
    }
    andButton.elt.disabled = toolbox;
    orButton.elt.disabled = toolbox;
    xorButton.elt.disabled = toolbox;
    bufferButton.elt.disabled = toolbox;
    notButton.elt.disabled = toolbox;
    inputButton.elt.disabled = toolbox;
    outputButton.elt.disabled = toolbox;
    segDisplayButton.elt.disabled = toolbox;
    labelButton.elt.disabled = toolbox;
    buttonButton.elt.disabled = toolbox;
    clockButton.elt.disabled = toolbox;

    reg4Button.elt.disabled = toolbox;
    decoderButton.elt.disabled = toolbox;
    counterButton.elt.disabled = toolbox;
    muxButton.elt.disabled = toolbox;
    demuxButton.elt.disabled = toolbox;
    dFlipFlopButton.elt.disabled = toolbox;
    rsFlipFlopButton.elt.disabled = toolbox;
    halfaddButton.elt.disabled = toolbox;
    fulladdButton.elt.disabled = toolbox;

    customButton.elt.disabled = (customimport || (getCookieValue('access_token') === ''));

    modifierModeButton.elt.disabled = modifiers;
    deleteButton.elt.disabled = modifiers;
    selectButton.elt.disabled = true;
    if (!modifiers) {
        updateUndoButtons();
    } else {
        undoButton.elt.disabled = true;
        redoButton.elt.disabled = true;
    }
    simButton.elt.disabled = simulation;
    saveDialogButton.elt.disabled = savedialog;
    importButton.elt.disabled = jsonimport;
    moduleButton.elt.disabled = moduleimport || (outputs.length === 0);
}

function draw() {
    let curTime = performance.now();
    if (simRunning) {
        if (syncFramerate && curTime - lastTickTime >= tickTime) {
            updateTick(false);
            lastTickTime = curTime;
        }
        reDraw();
    } else {
        if ((wireMode === 'preview' || wireMode === 'delete') && !mouseOverGUI() && !elementMenuShown()) {
            generatePreviewWires(wirePreviewStartX, wirePreviewStartY, Math.round((mouseX / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE,
                Math.round((mouseY / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE);
            reDraw();
        } else if (controlMode === 'select' || controlMode === 'addObject' && !mouseIsPressed && !elementMenuShown()) {
            reDraw();
        }
    }
    handleDragging();
}

/*
    Executes one update tick of the sketch logic
*/
function updateTick(rec = true) {
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
        value.state = groups[value.groupA].state;
        if (value.state) {
            groups[value.groupB].diodeHigh();
        }
    }

    if (simRunning && !stopTicks && rec) {
        setTimeout(updateTick, 20);
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
    showElements();

    // Display the preview wire segment set
    if (wireMode === 'preview' || wireMode === 'delete') {
        if (pwWireX !== null) {
            pwWireX.show(wireMode === 'delete');
        }

        if (pwWireY !== null) {
            pwWireY.show(wireMode === 'delete');
        }
    }

    /*if (controlMode === 'select' && selectMode === 'start') {
        fill(0, 0, 0, 100); // Set the fill color to a semi-transparent black
        noStroke();
        selectEndX = Math.round(((mouseX + GRIDSIZE / 2) / transform.zoom - transform.dx - GRIDSIZE / 2) / GRIDSIZE) * GRIDSIZE + GRIDSIZE / 2;
        selectEndY = Math.round(((mouseY + GRIDSIZE / 2) / transform.zoom - transform.dy - GRIDSIZE / 2) / GRIDSIZE) * GRIDSIZE + GRIDSIZE / 2;
        rect(Math.min(selectStartX, selectEndX), Math.min(selectStartY, selectEndY),
            Math.abs(selectStartX - selectEndX), Math.abs(selectStartY - selectEndY));
    }*/

    // Reverse the scaling and translating to draw the stationary elements of the GUI
    scale(1 / transform.zoom);
    translate(-transform.zoom * transform.dx, -transform.zoom * transform.dy);

    if (loading) {
        showMessage('Loading Sketch...', loadFile.split('.json')[0]);
    }

    if (error.length > 0) {
        showMessage(error, errordesc);
    }

    // Draw the zoom and framerate labels
    textFont('ArcaMajora3');
    textAlign(LEFT, TOP);
    textSize(12);
    fill(0);
    noStroke();
    text(Math.round(transform.zoom * 100) + '%', 10, window.height - 20); // Zoom label
    text(Math.round(frameRate()), window.width - 20, window.height - 20); // Framerate label

    if (moduleOptions) {
        textSize(20);
        text('Click on the in- and outputs to swap them!', 30, 30);
    }
}

function fetchImportData() {
    socket.emit('getImportSketches', { access_token: getCookieValue('access_token') });
    socket.on('importSketches', (data) => {
        socket.off('importSketches');
        importSketchData = data;
    });
}

/*
    This function displays all compoments of the sketch as well as preview elements
*/
function showElements() {
    if (simRunning) {
        for (const elem of groups) {
            elem.show();
        }
    } else {
        if (selection.length > 0) {
            for (const elem of wires) {
                elem.show();
            }
            for (const elem of selection) {
                elem[0].show();
            }
        } else {
            for (let i = 0; i < wires.length; i++) {
                wires[i].show(false, i);
            }
        }
    }

    textFont('Consolas');
    if (gates.length > 0) {
        for (const elem of gates) {
            elem.show();
        }
    }

    if (customs.length > 0) {
        textFont('Arial');
        for (const elem of customs) {
            if (elem.visible) {
                elem.show();
            }
        }
    }

    for (const elem of conpoints) {
        elem.show();
    }
    if (moduleOptions) {
        for (let i = 0; i < outputs.length; i++) {
            outputs[i].show(i + 1);
        }
        for (let i = 0; i < inputs.length; i++) {
            inputs[i].show(i + 1);
        }
    } else {
        for (let i = 0; i < outputs.length; i++) {
            outputs[i].show();
        }
        for (let i = 0; i < inputs.length; i++) {
            inputs[i].show();
        }
    }
    for (const elem of diodes) {
        elem.show();
    }

    if (segDisplays.length > 0) {
        textFont('PT Mono');
        for (const elem of segDisplays) {
            elem.show();
        }
    }

    textFont('Gudea');
    textSize(20);
    textAlign(LEFT, TOP);
    for (const elem of labels) {
        elem.show();
    }

    if (controlMode === 'addObject') {
        textFont('Consolas');
        showElementPreview();
    }

    if (showSelectionBox) {
        selectionBox.markClickBox();
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
    Check if a key was pressed and act accordingly
*/
function keyPressed() {
    if ((saveDialog || moduleOptions) && keyCode === ESCAPE) {
        enterModifierMode();
    }
    if (captionInput.elt === document.activeElement || labelTextBox === document.activeElement || loading || saveDialog || moduleOptions) {
        return;
    }
    if (sketchNameInput !== document.activeElement) {
        if (keyCode >= 49 && keyCode <= 57) {
            gateInputCount = keyCode - 48;
            gateInputSelect.value(gateInputCount);
            return;
        }
        switch (keyCode) {
            case ESCAPE:
                enterModifierMode();
                reDraw();
                break;
            case RETURN:
                closeModifierMenu();
                hideAllOptions();
                simClicked();
                break;
            case CONTROL:
                //startSelect();
                //console.log(wires.length);
                // Uncomment to make screenshots
                //let img  = canvas.toDataURL("image/png");
                //document.write('<img src="'+img+'"/>');
                break;
            case 32: // Space
                if (simRunning) {
                    return;
                }
                if (controlMode !== 'delete') {
                    deleteClicked();
                } else {
                    enterModifierMode();
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
    }
}

function setHelpText(str) {
    if (str !== '') {
        helpLabel.elt.innerHTML = '<i class="fa fa-question-circle icon" style="color: rgb(200, 50, 50);"></i> ' + str;
        helpLabel.style('display', 'inline-block');
    } else {
        helpLabel.hide();
    }
}

function setLoading(l) {
    loading = l;
    if (loading) {
        configureButtons('loading');
    } else {
        configureButtons('edit');
    }
    reDraw();
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