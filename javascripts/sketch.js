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
let busses = [];
let busWrappers = [];
let busUnwrappers = [];
let decoders = [];

let sevenSegmentBits = 4; // Number of bits for new 7-segment displays
let counterBitWidth = 2; // Output width of counter objects
let decoderBitWidth = 2; // Input width of decoder objects
let muxBitWidth = 1; // In/output width for (de-) multiplexers

let startDirection = 0; // Start direction for the current wire preview
let traced = []; // List of all traced wires (needed by parseGroups)

let superscripts = ['º', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];

let selWireIndizes = [];
let selDiodeIndizes = [];
let selGatesIndizes = [];
let selInputsIndizes = [];
let selOutputsIndizes = [];
let selLabelIndizes = [];
let selSegDisplayIndizes = [];
let selCustomIndizes = [];
let selConpointIndizes = [];
let selBusWrappersIndizes = [];
let selBusUnwrappersIndizes = [];
let selDecodersIndizes = [];

let copiedElements = [];
let selectionIsCopied = false;

let copiedOffsetStartX = 0;
let copiedOffsetStartY = 0;
let copiedOffsetWidth = 0;
let copiedOffsetHeight = 0;

/*
    These are the start coordinates for the wire preview elements
*/
let wirePreviewStartX = 0;
let wirePreviewStartY = 0;

/*
    This list contains all logical wire groups of the current sketch
*/
let groups = [];

let busGroups = [];

let busInsert = false;

let busWrapperWidth = 2;

let busVersions = false;
let useInputBus = false;
let useOutputBus = false;

/*
    Current size of the grid in pixels, scaled to the current zoom level
*/
let currentGridSize = GRIDSIZE;

let isScrolling, showHelpTimeout;

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

let inputType = 'switch'; // Type of newly placed inputs

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

/*
    Position of the select box before dragging
*/
let selectionStartPosX = 0;
let selectionStartPosY = 0;

let selectionLog = [];
let deleteLog = [];
let busLog = [];

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

let screenshotDialog = false;

let linkDialog = false;

let screenshotImg;

let customDialog;

let messageHider;

/*
    This object indicates if and what object preview should be drawn on screen.
*/

let previewData = {};

let importSketchData = {}; // Contains look and caption of all user sketches that can be imported

/*
    If this is deactivated, the simulation will run as fast as possible, not synced to the framerate.
*/
let syncFramerate = true;

let speedMultiplier = 10;

let stopTicks = false;

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
let redrawNextFrame = false;

let clickedOutOfGUI = false;
let dropdownClicked = false;

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

let moduleOptions = false; // This indicates if the module configurator is open

/*
    DOM element definitions
*/

let logoImage; // The logo image in the top left corner (DOM element)

let redButton, yellowButton, greenButton, blueButton; // Output elements
let labelTextBox; // Label elements
let clockspeedSlider; // Clock elements

let toolbox, topLeftButtons, topRightButtons, topButtonsContainer, leftSideContainer; // Element containers

let copySelectButton, deleteSelectButton; // These appear when a sketch part is selected

let sketchNameInput, descInput; // Save dialog elements
let moduleNameInput; // Module configurator elements
let helpLabel; // Help text label

let editButton, deleteButton, simButton, undoButton, redoButton, selectButton, moduleButton; // Tool buttons
let topSketchInput, importButton, saveButton, downloadButton, dashboardButton, screenshotButton, shareLinkButton; // Right side elements

let andButton, orButton, xorButton, bufferButton, notButton, switchButton, buttonButton, clockButton, outputButton, labelButton, displayButton; // Standard element buttons
let counterButton, decoderButton, dFlipFlopButton, rsFlipFlopButton, jkFlipFlopButton, rsClockedButton, tFlipFlopButton,
    registerButton, muxButton, demuxButton, unwrapperButton, halfaddButton, fulladdButton, customButton; // Advanced element buttons
let labelOptions, labelSimulation, labelGateInputs, labelDirection, labelDisplay, labelOutputWidth,
    labelInputWidth, tickTimeLabel, tickTimeMsLabel, multiplierValueLabel, busCheckboxLabel, inBusCheckboxLabel, outBusCheckboxLabel; // Left side labels

let gateInputSelect, directionSelect, displaySelect, counterBitSelect, decoderBitSelect, multiplexerBitSelect,
    wrapperWidthSelect, busCheckbox, inBusCheckbox, outBusCheckbox; // Options elements

let tickTimeSlider, bypassCheckbox, bypassLabel, syncFPSCheckbox, syncFPSLabel, multiplierSlider, multiplierLabel; // Simulation options elements

/*
    This is the socket element used for socket communication with the server
*/
let socket;

/*
    This is the main HTML5 canvas variable for the sketch area
*/
let mainCanvas;

let PWp5; // The p5 element for the preview canvas in the customs dialog
let modulep5; // p5 element for the module canvas in the module configurator

let lastTickTime = 0;
let tickTime = 10;

let tourStep = 0;

let idMatchRef = null;

let updateNo = 1;

/*
    Disable some error messages from p5
*/
p5.disableFriendlyErrors = true; // jshint ignore:line

/*
    This line prevents the browser default right-click menu from appearing.
*/
document.addEventListener('contextmenu', function (event) { if (event.target.id !== 'screenshot') { event.preventDefault(); } }, false);

function preload() {
    customDialog = new CustomDialog();
}

/*
    Sets up the canvas and caps the framerate
*/
function setup() { // jshint ignore:line
    mainCanvas = createCanvas(windowWidth - 240, windowHeight - 50);     // Creates the canvas in full window size
    mainCanvas.position(240, 50);
    mainCanvas.id('mainCanvas');

    initPreviewCanvas();
    initModuleCanvas();

    document.title = 'LogiJS: Untitled Sketch';

    if (localStorage.getItem('showupdate') !== 'update' + updateNo) {
        document.getElementById('update-dialog').style.display = 'inline-block';
    }

    linkElementsFromDOM();
    addElementHelpTexts();

    frameRate(60); // Caps the framerate at 60 FPS

    enterModifierMode();

    socket = io.connect(); // Initialize socket connection to the server

    loadURLSketch();

    socket.on('demousererror', function () {
        showMessage('Saving failed<span style="color: #c83232">.</span>', 'This is a demo account<span style="color: #c83232">.</span>');
    });

    socket.on('regexerror', function () {
        showMessage('Saving failed<span style="color: #c83232">.</span>', 'Please use only letters and numbers<span style="color: #c83232">.</span>');
    });

    socket.on('nametoolongerror', function () {
        showMessage('Saving failed<span style="color: #c83232">.</span>', 'The sketch name must be shorter than 50 characters<span style="color: #c83232">.</span>');
    });

    socket.on('createdLink', function (data) {
        linkDialog = true;
        setHelpText('');
        mainCanvas.elt.classList.add('dark-canvas');
        document.getElementById('link-dialog').style.display = 'block';
        document.getElementById('link-input').value = window.location.href.split('editor')[0] + 'editor?link=' + data.filename;
    });

    fetchImportData();

    reDraw();
    setTimeout(reDraw, 200); // Redraw after 200ms in case fonts weren't loaded on first redraw

    moduleButton.disabled = (outputs.length === 0); // If there are outputs, enable module configuration

    initTour(); // Show the tour if the variable has been passed
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
        if (customDialog.isVisible) {
            addType = 11; // external custom
            customDialog.hide();
        } else {
            addType = 10; // internal custom
        }
        labelDirection.style.display = 'inline-block';
        directionSelect.style.display = 'inline-block';
        labelOptions.style.display = 'block';
        custFile = filename;
    }
}

function customClicked() {
    if (customDialog.isVisible) {
        customDialog.hide();
        configureButtons('edit');
        mainCanvas.elt.classList.remove('dark-canvas');
    } else {
        setControlMode('modify');
        setPreviewElement(false, {}, 'none');
        setUnactive();
        hideAllOptions();
        customButton.classList.add('active');
        mainCanvas.elt.classList.add('dark-canvas');
        customDialog.display();
        configureButtons('customdialog');
    }
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

function closeScreenshotClicked() {
    document.getElementById('screenshot-dialog').style.display = 'none';
    mainCanvas.elt.classList.remove('dark-canvas');
    screenshotDialog = false;
    if (!simRunning) {
        enterModifierMode();
    } else {
        simButton.classList.add('active');
        configureButtons('simulation');
    }
}

function copyLinkClicked() {
    document.getElementById('link-input').select();
    document.execCommand('copy');
    setHelpText('Link copied to Clipboard', 'info-circle');
    setTimeout(function () { setHelpText(''); }, 3000);
}

function hideAllOptions() {
    displaySelect.style.display = 'none';
    labelDisplay.style.display = 'none';
    directionSelect.style.display = 'none';
    labelDirection.style.display = 'none';
    gateInputSelect.style.display = 'none';
    labelGateInputs.style.display = 'none';
    counterBitSelect.style.display = 'none';
    labelOutputWidth.style.display = 'none';
    decoderBitSelect.style.display = 'none';
    multiplexerBitSelect.style.display = 'none';
    wrapperWidthSelect.style.display = 'none';
    busCheckbox.style.display = 'none';
    busCheckboxLabel.style.display = 'none';
    inBusCheckbox.style.display = 'none';
    inBusCheckboxLabel.style.display = 'none';
    outBusCheckbox.style.display = 'none';
    outBusCheckboxLabel.style.display = 'none';
    labelInputWidth.style.display = 'none';
    labelOptions.style.display = 'none';
    labelSimulation.style.display = 'none';
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

function setUnactive() {
    andButton.classList.remove('active');
    orButton.classList.remove('active');
    xorButton.classList.remove('active');
    bufferButton.classList.remove('active');
    notButton.classList.remove('active');
    switchButton.classList.remove('active');
    buttonButton.classList.remove('active');
    clockButton.classList.remove('active');
    outputButton.classList.remove('active');
    labelButton.classList.remove('active');
    displayButton.classList.remove('active');
    counterButton.classList.remove('active');
    decoderButton.classList.remove('active');
    wrapperButton.classList.remove('active');
    unwrapperButton.classList.remove('active');
    dFlipFlopButton.classList.remove('active');
    rsFlipFlopButton.classList.remove('active');
    jkFlipFlopButton.classList.remove('active');
    rsClockedButton.classList.remove('active');
    tFlipFlopButton.classList.remove('active');
    registerButton.classList.remove('active');
    muxButton.classList.remove('active');
    demuxButton.classList.remove('active');
    halfaddButton.classList.remove('active');
    fulladdButton.classList.remove('active');
    customButton.classList.remove('active');

    deleteButton.classList.remove('active');
    selectButton.classList.remove('active');
    moduleButton.classList.remove('active');
    editButton.classList.remove('active');
    simButton.classList.remove('active');
    saveButton.classList.remove('active');
}

function deleteClicked() {
    if (controlMode === 'delete') {
        enterModifierMode();
    } else {
        setUnactive();
        hideAllOptions();
        deleteButton.classList.add('active');
        setControlMode('delete');
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
    gateInputCount = parseInt(gateInputSelect.value);
}

function newDisplayBitLength() {
    sevenSegmentBits = parseInt(displaySelect.value);
}

function newCounterBitLength() {
    counterBitWidth = parseInt(counterBitSelect.value);
    custFile = counterBitWidth + '-counter.json';
    if (counterButton.className.includes('active')) {
        let opLabels = [];
        for (let i = 0; i < counterBitWidth; i++) {
            opLabels.push('2' + superscripts[counterBitWidth - i - 1]);
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
    decoderBitWidth = parseInt(decoderBitSelect.value);
    custFile = decoderBitWidth + '-decoder.json';
    if (decoderButton.className.includes('active')) {
        if (!useInputBus && !useOutputBus) {
            setPreviewElement(false, {}, 'decoder');
        } else if (useInputBus && !useOutputBus) {
            setPreviewElement(false, {}, 'decoder-in');
        } else if (!useInputBus && useOutputBus) {
            setPreviewElement(false, {}, 'decoder-out');
        } else {
            setPreviewElement(false, {}, 'decoder-in-out');
        }
    }
}

function newBusWrapperWidth() {
    busWrapperWidth = parseInt(wrapperWidthSelect.value);
    if (addType === 12) {
        busUnwrapperClicked();
    } else if (addType === 13) {
        busWrapperClicked();
    }
}

function useBusChanged() {
    busVersions = busCheckbox.checked;
    useInputBus = inBusCheckbox.checked;
    useOutputBus = outBusCheckbox.checked;
    if (addType === 14) { // Decoder
        if (!useInputBus && !useOutputBus) {
            setPreviewElement(false, {}, 'decoder');
        } else if (useInputBus && !useOutputBus) {
            setPreviewElement(false, {}, 'decoder-in');
        } else if (!useInputBus && useOutputBus) {
            setPreviewElement(false, {}, 'decoder-out');
        } else {
            setPreviewElement(false, {}, 'decoder-in-out');
        }
    } else if (addType === 8) { // 7-segment display
        if (!busVersions) {
            setPreviewElement(false, {}, '7-segment');
        } else {
            setPreviewElement(false, {}, '7-segment-bus');
        }
    }
}

function newMuxBitLength() {
    muxBitWidth = parseInt(multiplexerBitSelect.value);
    if (muxButton.className.includes('active')) {
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
    } else if (demuxButton.className.includes('active')) {
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
    switch (directionSelect.value) {
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
    tickTime = tickTimeSlider.value;
    tickTimeMsLabel.innerHTML = tickTimeSlider.value + 'ms';
}

function newMultiplier() {
    speedMultiplier = multiplierSlider.value * 10;
    if (simRunning) {
        stopTicks = true;
        setTimeout(function () {
            stopTicks = false;
            if (!syncFramerate) {
                for (let i = 0; i < speedMultiplier; i++) {
                    updateTick();
                }
            }
        }, 100);
    }
}

function updateMultiplierLabel() {
    multiplierValueLabel.innerHTML = multiplierSlider.value;
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
        setUnactive();
        andButton.classList.add('active');
        setControlMode('addObject');
        addType = 1; // and
        setPreviewElement(false, {}, 'and');
        gateInputSelect.style.display = 'inline-block';
        labelGateInputs.style.display = 'inline-block';
        directionSelect.style.display = 'inline-block';
        labelDirection.style.display = 'inline-block';
        labelOptions.style.display = 'block';
    }
}

function orClicked(dontToggle = false) {
    hideAllOptions();
    if (controlMode === 'addObject' && addType === 2 && !dontToggle) {
        enterModifierMode();
    } else {
        setUnactive();
        orButton.classList.add('active');
        setControlMode('addObject');
        addType = 2; // or
        setPreviewElement(false, {}, 'or');
        gateInputSelect.style.display = 'inline-block';
        labelGateInputs.style.display = 'inline-block';
        directionSelect.style.display = 'inline-block';
        labelDirection.style.display = 'inline-block';
        labelOptions.style.display = 'block';
    }
}

function xorClicked(dontToggle = false) {
    hideAllOptions();
    if (controlMode === 'addObject' && addType === 3 && !dontToggle) {
        enterModifierMode();
    } else {
        setUnactive();
        xorButton.classList.add('active');
        setControlMode('addObject');
        addType = 3; // xor
        setPreviewElement(false, {}, 'xor');
        gateInputSelect.style.display = 'inline-block';
        labelGateInputs.style.display = 'inline-block';
        directionSelect.style.display = 'inline-block';
        labelDirection.style.display = 'inline-block';
        labelOptions.style.display = 'block';
    }
}

function switchClicked(dontToggle = false) {
    hideAllOptions();
    if (controlMode === 'addObject' && addType === 4 && !dontToggle) {
        enterModifierMode();
    } else {
        setUnactive();
        switchButton.classList.add('active');
        inputType = 'switch';
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
        setUnactive();
        buttonButton.classList.add('active');
        inputType = 'button';
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
        setUnactive();
        clockButton.classList.add('active');
        inputType = 'clock';
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
        setUnactive();
        outputButton.classList.add('active');
        setControlMode('addObject');
        addType = 7; // output
        setPreviewElement(false, {}, 'output');
    }
}

function displayClicked(dontToggle = false) {
    hideAllOptions();
    if (controlMode === 'addObject' && addType === 8 && !dontToggle) {
        enterModifierMode();
    } else {
        setUnactive();
        displayButton.classList.add('active');
        setControlMode('addObject');
        addType = 8; // segDisplay
        if (!busVersions) {
            setPreviewElement(false, {}, '7-segment');
        } else {
            setPreviewElement(false, {}, '7-segment-bus');
        }
        displaySelect.style.display = 'inline-block';
        labelDisplay.style.display = 'inline-block';
        labelOptions.style.display = 'block';
        busCheckbox.style.display = 'inline-block';
        busCheckboxLabel.style.display = 'inline-block';
    }
}

// Starts the selection process
function startSelect() {
    if (controlMode === 'select') {
        enterModifierMode();
    } else {
        configureButtons('select');
        setUnactive();
        hideAllOptions();
        selectButton.classList.add('active');
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
        setUnactive();
        labelButton.classList.add('active');
        setControlMode('addObject');
        addType = 9; // label
        setPreviewElement(false, {}, 'label');
    }
}

function setControlMode(mode) {
    if (controlMode === 'select') { // If the select mode is leaved, clean up
        setSelectMode('none');
        document.getElementsByClassName('switch-field')[0].style.display = 'none';
    }
    if (mode === 'addObject' || mode === 'select' || mode === 'delete') {
        closeModifierMenu();
        controlMode = mode;
        document.getElementsByClassName('switch-field')[0].style.display = 'none';
    } else if (mode === 'modify') {
        controlMode = 'modify';
        document.getElementsByClassName('switch-field')[0].style.display = 'flex';
    } else {
        console.log('Control mode not supported!');
    }
    if (mode === 'addObject') {
        document.getElementsByClassName('switch-field')[0].style.display = 'none';
        toolbox.style.height = '380px';
    } else {
        toolbox.style.height = 'min(495px, 100vh - 300px)';
    }
}

function setSelectMode(mode) {
    selectMode = mode;
    switch (selectMode) {
        case 'none':
            unmarkAll();
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
                    let newWire = new Wire(0, Math.min(wires[xIndex].startX, wires[i].startX), wires[xIndex].startY);
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
                    let newWire = new Wire(0, Math.min(pwWireX.startX, wires[i].startX), pwWireX.startY);
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
            let newWire = new Wire(0, pwWireX.startX, pwWireX.startY);
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
                    let newWire = new Wire(1, wires[yIndex].startX, Math.min(wires[yIndex].startY, wires[i].startY));
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
                    let newWire = new Wire(1, pwWireY.startX, Math.min(pwWireY.startY, wires[i].startY));
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
            let newWire = new Wire(1, pwWireY.startX, pwWireY.startY);
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

function addBusses() {
    let pushed = false; // True, when wires have been changed in any way

    // These are set true when a preview wire in that direction is 100% part of the existing wire
    let overlapOverAllX = false;
    let overlapOverAllY = false;

    let xIndex = -1;
    let yIndex = -1;

    let deletedIndices = [];

    let editLog = [];

    if (pwWireX !== null) {
        for (let i = 0; i < busses.length; i++) {
            let overlap = wireOverlap(pwWireX, busses[i]);
            if ((overlap[0] !== overlap[2] || overlap[1] !== overlap[3]) || (busses[i].direction === 0 && pwWireX.startY === busses[i].startY &&
                (pwWireX.startX == busses[i].endX || pwWireX.startX == busses[i].startX || pwWireX.endX == busses[i].startX || pwWireX.endX == busses[i].endX))) { //jshint ignore:line
                if (xIndex >= 0) {
                    let newWire = new Bus(0, Math.min(busses[xIndex].startX, busses[i].startX), busses[xIndex].startY);
                    newWire.endX = Math.max(busses[xIndex].endX, busses[i].endX);
                    newWire.endY = busses[xIndex].startY;
                    if (newWire.startX !== busses[i].startX || newWire.endX !== busses[i].endX) {
                        editLog.push(['r', xIndex, busses[xIndex], newWire]);
                        busses.splice(xIndex, 1, newWire);
                        pushed = true;
                        deletedIndices.push(i);
                    } else {
                        overlapOverAllX = true;
                    }
                } else {
                    let newWire = new Bus(0, Math.min(pwWireX.startX, busses[i].startX), pwWireX.startY);
                    newWire.endX = Math.max(pwWireX.endX, busses[i].endX);
                    newWire.endY = pwWireX.startY;
                    if (newWire.startX !== busses[i].startX || newWire.endX !== busses[i].endX) {
                        editLog.push(['r', i, busses[i], newWire]);
                        busses.splice(i, 1, newWire);
                        pushed = true;
                        xIndex = i;
                    } else {
                        overlapOverAllX = true;
                    }
                }
            }
        }

        if (xIndex < 0 && !overlapOverAllX) {
            let newWire = new Bus(0, pwWireX.startX, pwWireX.startY);
            newWire.endX = pwWireX.endX;
            newWire.endY = pwWireX.startY;
            editLog.push(['a', busses.length, newWire]);
            busses.push(newWire);
            pushed = true;
        }
    }

    if (pwWireY !== null) {
        for (let i = 0; i < busses.length; i++) {
            let overlap = wireOverlap(pwWireY, busses[i]);
            // If there's an overlap or the busses are adjacent
            if ((overlap[0] !== overlap[2] || overlap[1] !== overlap[3]) || (busses[i].direction === 1 && pwWireY.startX === busses[i].startX &&
                (pwWireY.startY == busses[i].endY || pwWireY.startY == busses[i].startY || pwWireY.endY == busses[i].startY || pwWireY.endY == busses[i].endY))) { //jshint ignore:line
                if (yIndex >= 0) {
                    let newWire = new Bus(1, busses[yIndex].startX, Math.min(busses[yIndex].startY, busses[i].startY));
                    newWire.endX = busses[yIndex].startX;
                    newWire.endY = Math.max(busses[yIndex].endY, busses[i].endY);
                    if (newWire.startY !== busses[i].startY || newWire.endY !== busses[i].endY) {
                        editLog.push(['r', yIndex, busses[yIndex], newWire]);
                        busses.splice(yIndex, 1, newWire);
                        pushed = true;
                        deletedIndices.push(i);
                    } else {
                        overlapOverAllY = true;
                    }
                } else {
                    let newWire = new Bus(1, pwWireY.startX, Math.min(pwWireY.startY, busses[i].startY));
                    newWire.endX = pwWireY.startX;
                    newWire.endY = Math.max(pwWireY.endY, busses[i].endY);
                    if (newWire.startY !== busses[i].startY || newWire.endY !== busses[i].endY) {
                        editLog.push(['r', i, busses[i], newWire]);
                        busses.splice(i, 1, newWire);
                        pushed = true;
                        yIndex = i;
                    } else {
                        overlapOverAllY = true;
                    }
                }
            }
        }

        if (yIndex < 0 && !overlapOverAllY) {
            let newWire = new Bus(1, pwWireY.startX, pwWireY.startY);
            newWire.endX = pwWireY.startX;
            newWire.endY = pwWireY.endY;
            editLog.push(['a', busses.length, newWire]);
            busses.push(newWire);
            pushed = true;
        }
    }

    for (let i = deletedIndices.length - 1; i >= 0; i--) {
        editLog.push(['d', deletedIndices[i], busses.splice(deletedIndices[i], 1)[0]]);
    }

    if (pushed) {
        let conpointsBefore = _.cloneDeep(conpoints);
        doConpoints();
        let conpointsAfter = _.cloneDeep(conpoints);
        pushUndoAction('addBus', [], [_.cloneDeep(editLog), conpointsBefore, conpointsAfter]); // push the action for undoing
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
            newGate = new LogicGate(mouseX, mouseY, direction, inputs, 1, 'and');
            newGate.setCoordinates(mouseX / transform.zoom - transform.dx, mouseY / transform.zoom - transform.dy);
            newGate.updateClickBoxes();
            gates.push(newGate);
            pushUndoAction('addGate', [gates.length - 1], [newGate]);
            break;
        case 2:
            newGate = new LogicGate(mouseX, mouseY, direction, inputs, 1, 'or');
            newGate.setCoordinates(mouseX / transform.zoom - transform.dx, mouseY / transform.zoom - transform.dy);
            newGate.updateClickBoxes();
            gates.push(newGate);
            pushUndoAction('addGate', [gates.length - 1], [newGate]);
            break;
        case 3:
            newGate = new LogicGate(mouseX, mouseY, direction, inputs, 1, 'xor');
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
    let newCustom = new CustomSketch(mouseX, mouseY, direction, file);
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
    var newOutput = new Output(mouseX, mouseY, 0);
    newOutput.setCoordinates(mouseX / transform.zoom - transform.dx, mouseY / transform.zoom - transform.dy);
    newOutput.updateClickBox();
    outputs.push(newOutput);
    moduleButton.disabled = false;
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
    var newDisplay = new SegmentDisplay(mouseX, mouseY, bits, busVersions);
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
    var newInput = new Input(mouseX, mouseY);
    newInput.setCoordinates(mouseX / transform.zoom - transform.dx, mouseY / transform.zoom - transform.dy);
    newInput.updateClickBox();
    if (inputType === 'button') {
        newInput.framecount = BUTCOUNT;
    } else if (inputType === 'clock') {
        newInput.resetFramecount();
    } else {
        newInput.framecount = -1;
    }
    newInput.clock = (inputType === 'clock');
    inputs.push(newInput);
    pushUndoAction('addIn', [inputs.length - 1], [newInput]);
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
    var newLabel = new Label(mouseX, mouseY, '');
    newLabel.setCoordinates(mouseX / transform.zoom - transform.dx, mouseY / transform.zoom - transform.dy);
    newLabel.updateClickBox();
    labels.push(newLabel);
    pushUndoAction('addLabel', [labels.length - 1], [newLabel]);
    reDraw();
}

/*
    Adds a bus wrapper
*/
function addBusWrapper(bits, direction) {
    for (var i = 0; i < busWrappers.length; i++) {
        if ((busWrappers[i].x === Math.round((mouseX / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE) &&
            (busWrappers[i].y === Math.round((mouseY / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE)) {
            return;
        }
    }
    var newElement = new BusWrapper(mouseX, mouseY, direction, bits);
    newElement.setCoordinates(mouseX / transform.zoom - transform.dx, mouseY / transform.zoom - transform.dy);
    newElement.updateClickBoxes();
    busWrappers.push(newElement);
    pushUndoAction('addBusWrapper', [busWrappers.length - 1], [newElement]);
    reDraw();
}

/*
    Adds a bus unwrapper
*/
function addBusUnwrapper(bits, direction) {
    for (var i = 0; i < busUnwrappers.length; i++) {
        if ((busUnwrappers[i].x === Math.round((mouseX / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE) &&
            (busUnwrappers[i].y === Math.round((mouseY / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE)) {
            return;
        }
    }
    var newElement = new BusUnwrapper(mouseX, mouseY, direction, bits);
    newElement.setCoordinates(mouseX / transform.zoom - transform.dx, mouseY / transform.zoom - transform.dy);
    newElement.updateClickBoxes();
    busUnwrappers.push(newElement);
    pushUndoAction('addBusUnwrapper', [busUnwrappers.length - 1], [newElement]);
    reDraw();
}

function addDecoder(bits, direction) {
    for (var i = 0; i < decoders.length; i++) {
        if ((decoders[i].x === Math.round((mouseX / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE) &&
            (decoders[i].y === Math.round((mouseY / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE)) {
            return;
        }
    }
    var newElement = new Decoder(mouseX, mouseY, direction, bits, useInputBus, useOutputBus);
    newElement.setCoordinates(mouseX / transform.zoom - transform.dx, mouseY / transform.zoom - transform.dy);
    newElement.updateClickBoxes();
    decoders.push(newElement);
    pushUndoAction('addDecoder', [decoders.length - 1], [newElement]);
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
    for (let i = 0; i < lengthBeforeDelete; i++) {
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
}

function deleteBusses() {
    let changes = false;

    let newBussesList = [];
    let replaceIndices = [];
    let deletedIndices = [];

    let editLog = [];

    if (pwWireX !== null) {
        for (let i = 0; i < busses.length; i++) {
            let overlap = wireOverlap(pwWireX, busses[i]);
            let newBusses = removeFromBus(busses[i], overlap, i);
            if (newBusses !== false) {
                deletedIndices.push(i);
                changes = true;
                if (newBusses.length >= 1) {
                    newBussesList.push(newBusses);
                    replaceIndices.push(i);
                }
            }
        }
    }

    if (pwWireY !== null) {
        for (let i = 0; i < busses.length; i++) {
            let overlap = wireOverlap(pwWireY, busses[i]);
            let newBusses = removeFromBus(busses[i], overlap, i);
            if (newBusses !== false) {
                deletedIndices.push(i);
                changes = true;
                if (newBusses.length >= 1) {
                    newBussesList.push(newBusses);
                    replaceIndices.push(i);
                }
            }
        }
    }

    let lengthBeforeDelete = busses.length;

    /*
        delete all busses that should be removed
    */
    for (let i = busses.length - 1; i >= 0; i--) {
        if (deletedIndices.indexOf(i) >= 0) {
            editLog.push(['d', i, busses.splice(i, 1)[0]]);
        }
    }

    /*
        Add all newly created busses
    */
    for (let i = 0; i < lengthBeforeDelete; i++) {
        if (deletedIndices.indexOf(i) >= 0) {
            if (replaceIndices.indexOf(i) >= 0) {
                let newBusses = newBussesList.pop();
                for (let j = 0; j < newBusses.length; j++) {
                    if (newBusses[j].startX !== newBusses[j].endX || newBusses[j].startY !== newBusses[j].endY) {
                        editLog.push(['a', i + j, newBusses[j]]);
                        busses.splice(i + j, 0, newBusses[j]);
                    }
                }
            }
        }
    }

    if (changes) { // only push an undo action when changes have been made to the busses
        let conpointsBefore = _.cloneDeep(conpoints);
        doConpoints();
        let conpointsAfter = _.cloneDeep(conpoints);
        pushUndoAction('delBus', [], [editLog, conpointsBefore, conpointsAfter]);
    }
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
    let dep_ids = customs[customNumber].getDependencyIDs();
    let indices_to_remove = [];
    for (let i = customs.length - 1; i >= 0; i--) {
        if (dep_ids.includes(customs[i].id)) {
            indices_to_remove.push(i);
        }
    }
    indices_to_remove.sort((a, b) => b - a); // sort descending
    for (let i = 0; i < indices_to_remove.length; i++) {
        customs.splice(indices_to_remove[i], 1);
    }
    pushUndoAction('delCust', [customNumber], customs.splice(customNumber, 1));
    reDraw();
}

/*
    Deletes the given output (lamp)
*/
function deleteOutput(outputNumber) {
    pushUndoAction('delOut', [outputNumber], outputs.splice(outputNumber, 1));
    moduleButton.disabled = (outputs.length === 0);
    reDraw();
}

/*
    Deletes the given input (switch)
*/
function deleteInput(inputNumber) {
    pushUndoAction('delIn', [inputNumber], inputs.splice(inputNumber, 1));
    moduleButton.disabled = (outputs.length === 0);
    reDraw();
}

/*
    Deletes the given label
*/
function deleteLabel(labelNumber) {
    pushUndoAction('delLabel', [labelNumber], labels.splice(labelNumber, 1));
    reDraw();
}

function deleteBusWrapper(wrapperNumber) {
    pushUndoAction('delBusWrapper', [wrapperNumber], busWrappers.splice(wrapperNumber, 1));
    reDraw();
}

function deleteBusUnwrapper(unwrapperNumber) {
    pushUndoAction('delBusUnwrapper', [unwrapperNumber], busUnwrappers.splice(unwrapperNumber, 1));
    reDraw();
}

function deleteDecoder(decoderNumber) {
    pushUndoAction('delDecoder', [decoderNumber], decoders.splice(decoderNumber, 1));
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
    setUnactive();
    simButton.classList.add('active');
    configureButtons('simulation');
    hideAllOptions();
    toolbox.style.display = 'none';
    customButton.style.display = 'none';
    document.getElementsByClassName('switch-field')[0].style.display = 'none';

    // Parse all wire groups and attach the components
    parseGroups();
    integrateElements();
    parseBusGroups();
    integrateBusElements();

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

    labelSimulation.style.display = 'block';

    syncFPSCheckbox.style.display = 'inline-block';
    syncFPSLabel.style.display = 'inline-block';

    tickTimeLabel.style.display = 'block';
    tickTimeMsLabel.style.display = 'inline-block';
    tickTimeSlider.style.display = 'inline-block';
    bypassCheckbox.style.display = 'inline-block';
    bypassLabel.style.display = 'inline-block';
    multiplierLabel.style.display = 'inline-block';
    multiplierSlider.style.display = 'inline-block';
    multiplierValueLabel.style.display = 'inline-block';

    // Start the simulation and exit the modifier mode
    simRunning = true;
    closeModifierMenu();
    newMultiplier();
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
        labelSimulation.style.display = 'none';
        syncFPSCheckbox.style.display = 'none';
        syncFPSLabel.style.display = 'none';

        tickTimeLabel.style.display = 'none';
        tickTimeMsLabel.style.display = 'none';
        tickTimeSlider.style.display = 'none';
        multiplierSlider.style.display = 'none';
        multiplierValueLabel.style.display = 'none';
        multiplierLabel.style.display = 'none';

        bypassCheckbox.style.display = 'none';
        bypassLabel.style.display = 'none';

        toolbox.style.display = 'inline-block';
        customButton.style.display = 'block';
        document.getElementsByClassName('switch-field')[0].style.display = 'flex';

        groups = []; // Reset the groups, as they are regenerated when starting again
        busGroups = [];
        for (const elem of gates) {
            elem.shutdown(); // Tell all the gates to leave the simulation mode
        }
        for (const elem of customs) {
            elem.setSimRunning(false); // Shutdown all custom elements
        }
        for (const elem of busWrappers) {
            elem.shutdown(); // Shutdown all bus unwrappers
        }
        for (const elem of busUnwrappers) {
            elem.shutdown(); // Shutdown all bus unwrappers
        }
        for (const elem of segDisplays) {
            elem.shutdown();
        }
        for (const elem of decoders) {
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
        for (const elem of busses) {
            elem.busWidthSet = false;
            elem.showBusMarker = false;
        }

        simRunning = false;
        reDraw();
    }, 20);
}

function setSimButtonText(text) {
    simButton.innerHTML = text;
}

/*
    Enables/Disables the undo and redo buttons
    depending on the state of the stack
*/
function updateUndoButtons() {
    if (loading) {
        redoButton.disabled = true;
        undoButton.disabled = true;
    } else {
        redoButton.disabled = (actionRedo.length === 0);
        undoButton.disabled = (actionUndo.length === 0);
    }
}

function configureButtons(mode) {
    let tools, modifiers, simulation, customimport, savedialog, jsonimport, moduleimport, select, shareLink, screenshot;
    if (mode === 'edit') {
        tools = false;
        modifiers = false;
        savedialog = false;
        simulation = false;
        customimport = false;
        jsonimport = false;
        moduleimport = false;
        select = false;
        shareLink = false;
        screenshot = false;
    } else if (mode === 'simulation') {
        tools = true;
        modifiers = true;
        savedialog = false;
        simulation = false;
        customimport = true;
        jsonimport = false;
        moduleimport = true;
        select = true;
        shareLink = false;
        screenshot = false;
    } else if (mode === 'savedialog') {
        tools = true;
        modifiers = true;
        savedialog = false;
        simulation = true;
        customimport = true;
        jsonimport = true;
        moduleimport = true;
        select = true;
        shareLink = true;
        screenshot = true;
    } else if (mode === 'customdialog') {
        tools = true;
        modifiers = true;
        savedialog = true;
        simulation = true;
        customimport = false;
        jsonimport = true;
        moduleimport = true;
        select = true;
        shareLink = true;
        screenshot = true;
    } else if (mode === 'loading') {
        tools = true;
        modifiers = true;
        savedialog = true;
        simulation = true;
        customimport = true;
        jsonimport = true;
        moduleimport = true;
        select = true;
        shareLink = true;
        screenshot = true;
    } else if (mode === 'moduleOptions') {
        tools = true;
        modifiers = true;
        savedialog = true;
        simulation = true;
        customimport = true;
        jsonimport = true;
        moduleimport = false;
        select = true;
        shareLink = true;
        screenshot = true;
    } else if (mode === 'select') {
        tools = true;
        modifiers = true;
        savedialog = true;
        simulation = true;
        customimport = true;
        jsonimport = true;
        moduleimport = true;
        select = false;
        shareLink = true;
        screenshot = true;
    } else if (mode === 'screenshot') {
        tools = true;
        modifiers = true;
        savedialog = true;
        simulation = true;
        customimport = true;
        jsonimport = true;
        moduleimport = true;
        select = true;
        shareLink = true;
        screenshot = true;
    } else if (mode === 'shareLink') {
        tools = true;
        modifiers = true;
        savedialog = true;
        simulation = true;
        customimport = true;
        jsonimport = true;
        moduleimport = true;
        select = true;
        shareLink = true;
        screenshot = true;
    } else {
        tools = false;
        modifiers = false;
        savedialog = false;
        simulation = false;
        customimport = false;
        jsonimport = false;
        moduleimport = false;
        select = false;
        shareLink = false;
        screenshot = false;
    }
    andButton.disabled = tools;
    orButton.disabled = tools;
    xorButton.disabled = tools;
    bufferButton.disabled = tools;
    notButton.disabled = tools;
    switchButton.disabled = tools;
    outputButton.disabled = tools;
    displayButton.disabled = tools;
    labelButton.disabled = tools;
    buttonButton.disabled = tools;
    clockButton.disabled = tools;

    registerButton.disabled = tools;
    decoderButton.disabled = tools;
    counterButton.disabled = tools;
    muxButton.disabled = tools;
    demuxButton.disabled = tools;
    dFlipFlopButton.disabled = tools;
    jkFlipFlopButton.disabled = tools;
    wrapperButton.disabled = tools;
    unwrapperButton.disabled = tools;
    rsClockedButton.disabled = tools;
    tFlipFlopButton.disabled = tools;
    rsFlipFlopButton.disabled = tools;
    halfaddButton.disabled = tools;
    fulladdButton.disabled = tools;

    customButton.disabled = (customimport || (getCookieValue('access_token') === ''));

    editButton.disabled = modifiers;
    deleteButton.disabled = modifiers;
    selectButton.disabled = select;
    if (!modifiers) {
        updateUndoButtons();
    } else {
        undoButton.disabled = true;
        redoButton.disabled = true;
    }
    simButton.disabled = simulation;
    saveButton.disabled = savedialog;
    importButton.disabled = jsonimport;
    moduleButton.disabled = moduleimport || (outputs.length === 0);
    shareLinkButton.disabled = shareLink;
    screenshotButton.disabled = screenshot;
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

    for (const value of busWrappers) {
        value.update();
    }

    for (const value of busUnwrappers) {
        value.update();
    }

    for (const value of decoders) {
        value.update();
    }

    // Update all wire groups
    updateGroups();

    updateBusGroups();

    // Update all connection points to adopt the state of their wire group
    for (const value of conpoints) {
        if (!value.isBusConpoint) {
            value.state = groups[value.group].state;
        }
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

    if (controlMode === 'select' && selectMode === 'start') {
        fill(0, 50); // Set the fill color to a semi-transparent black
        noStroke();
        selectEndX = Math.round(((mouseX + GRIDSIZE / 2) / transform.zoom - transform.dx - GRIDSIZE / 2) / GRIDSIZE) * GRIDSIZE + GRIDSIZE / 2;
        selectEndY = Math.round(((mouseY + GRIDSIZE / 2) / transform.zoom - transform.dy - GRIDSIZE / 2) / GRIDSIZE) * GRIDSIZE + GRIDSIZE / 2;
        rect(Math.min(selectStartX, selectEndX), Math.min(selectStartY, selectEndY),
            Math.abs(selectStartX - selectEndX), Math.abs(selectStartY - selectEndY));
    }

    // Reverse the scaling and translating to draw the stationary elements of the GUI
    scale(1 / transform.zoom);
    translate(-transform.zoom * transform.dx, -transform.zoom * transform.dy);

    /*textFont('ArcaMajora3');
    textAlign(LEFT, TOP);
    textSize(12);
    noStroke();
    fill(0);
    text(Math.round(frameRate()), window.width - 20, window.height - 20); // Framerate label*/
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
        for (const elem of busGroups) {
            elem.show();
        }
    } else {
        for (let i = 0; i < wires.length; i++) {
            wires[i].show(false, i);
        }
        for (let i = 0; i < busses.length; i++) {
            busses[i].show(false, i);
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

    if (busWrappers.length > 0) {
        textFont('Arial');
        for (const elem of busWrappers) {
            elem.show();
        }
    }

    if (busUnwrappers.length > 0) {
        textFont('Arial');
        for (const elem of busUnwrappers) {
            elem.show();
        }
    }

    if (decoders.length > 0) {
        textFont('Arial');
        for (const elem of decoders) {
            elem.show();
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

    if (controlMode === 'addObject' && !dropdownClicked) {
        textFont('Consolas');
        showElementPreview();
    }

    if (showSelectionBox) {
        selectionBox.markClickBox(true);
    }

    if (frameRate() < 20) {
        setHelpText('Low Frame Rate!', 'exclamation-circle');
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

function updateBusGroups() {
    for (var i = 0; i < busGroups.length; i++) {
        busGroups[i].updateAll();
    }
}

/*
    Check if a key was pressed and act accordingly
*/
function keyPressed() {
    if (linkDialog && keyCode === ESCAPE) {
        hideLinkDialog();
        return;
    }

    if (screenshotDialog && keyCode === ESCAPE) {
        closeScreenshotClicked();
        return;
    }

    if ((saveDialog || moduleOptions) && keyCode === ESCAPE) {
        enterModifierMode();
    }

    if (labelTextBox === document.activeElement || loading || saveDialog || linkDialog || moduleOptions || topSketchInput === document.activeElement) {
        return; // Prevent shortcuts when a text input is active etc.
    }

    if (simRunning && keyCode === ESCAPE) {
        simClicked();
        return;
    }

    if (sketchNameInput !== document.activeElement) {
        if (keyCode >= 49 && keyCode <= 57) {
            gateInputCount = keyCode - 48;
            gateInputSelect.value = gateInputCount;
            return false;
        }
        switch (keyCode) {
            case ESCAPE:
                enterModifierMode();
                reDraw();
                break;
            case RETURN:
                if (!simButton.disabled) {
                    simClicked();
                }
                return false;
            case CONTROL:
                // Uncomment to make screenshots
                //let img  = canvas.toDataURL("image/png");
                //document.write('<img src="'+img+'"/>');
                //console.log(customs);
                //idMatchRef = _.cloneDeep(wires);
                //busGroups[0].states = [false, true, false, true];
                //busGroups[0].states = [true, true, false, false, true, false, true, false];
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
            case 66: // B / Switch between bus and wire
                if (busInsert) {
                    busInsert = false;
                    document.getElementById('radio-one').checked = true;
                    document.getElementById('radio-two').checked = false;
                } else {
                    busInsert = true;
                    document.getElementById('radio-one').checked = false;
                    document.getElementById('radio-two').checked = true;
                }
                break;
            case 86: // V
                if (controlMode === 'modify') {
                    pasteSelection();
                }
                break;
            case 67: // C
                if (document.getElementById('select-tools').style.display === 'block') {
                    copySelection();
                }
                break;
            case 80: // P
                if (!screenshotButton.disabled) {
                    screenshotClicked();
                }
                break;
            case 73: // I
                if (!importButton.disabled) {
                    importButtonClicked();
                }
                break;
            case 83: // S
                if (!selectButton.disabled) {
                    startSelect();
                }
                break;
            case 68: // D
                if (!deleteButton.disabled) {
                    deleteClicked();
                } else if (document.getElementById('select-tools').style.display === 'block') {
                    deleteSelection();
                }
                break;
            case 90: // Z
                if (!undoButton.disabled) {
                    undoClicked();
                }
                break;
            case 89: // Y
                if (!redoButton.disabled) {
                    redoClicked();
                }
                break;
            case 48: // 0
                gateInputCount = 10;
                gateInputSelect.value = 10;
                break;
            case RIGHT_ARROW:
                gateDirection = 0;
                directionSelect.value = 'Right';
                break;
            case DOWN_ARROW:
                gateDirection = 1;
                directionSelect.value = 'Down';
                break;
            case LEFT_ARROW:
                gateDirection = 2;
                directionSelect.value = 'Left';
                break;
            case UP_ARROW:
                gateDirection = 3;
                directionSelect.value = 'Up';
                break;
            default:
                break;
        }
    }
}

function setHelpText(str, icon = 'question-circle') {
    if (str !== '') {
        helpLabel.innerHTML = '<i class="fa fa-' + icon + ' icon" style="color: #c83232;"></i> ' + str;
        if (document.getElementById('helpLabelContainer').style.opacity === '0') {
            showHelpTimeout = setTimeout(function () {
                document.getElementById('helpLabelContainer').style.opacity = '1';
                document.getElementById('zoomLabelContainer').style.bottom = '60px';
            }, 500);
        }
    } else {
        window.clearTimeout(showHelpTimeout);
        document.getElementById('helpLabelContainer').style.opacity = '0';
        document.getElementById('zoomLabelContainer').style.bottom = '0px';
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

function idMatch(a, b) {
    if (a.length !== b.length) {
        console.log('ID match failed (unequal length)');
        return false;
    }
    for (let i = 0; i < a.length; i++) {
        if (a[i].x !== b[i].x || a[i].y !== b[i].y) {
            console.log('ID match failed (unequal position at pos ' + i + ')');
            console.log(a);
            console.log(b);
            return false;
        }
    }
    console.log('ID match passed');
    return true;
}