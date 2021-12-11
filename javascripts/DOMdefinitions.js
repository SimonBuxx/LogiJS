// File: DOMdefinitions.js
// Contains methods to link the DOM elements

function linkElementsFromDOM() {
    topButtonsContainer = document.getElementById('topButtonsContainer');
    topLeftButtons = document.getElementById('topLeftButtons');
    topRightButtons = document.getElementById('topRightButtons');

    leftSideContainer = document.getElementById('leftSideContainer');
    toolbox = document.getElementById('toolbox');

    logoImage = document.getElementById('logo');

    editButton = document.getElementById('edit-button');
    deleteButton = document.getElementById('delete-button');
    simButton = document.getElementById('sim-button');
    undoButton = document.getElementById('undo-button');
    redoButton = document.getElementById('redo-button');
    selectButton = document.getElementById('select-button');
    moduleButton = document.getElementById('module-button');

    copySelectButton = document.getElementById('copy-select-button');
    deleteSelectButton = document.getElementById('delete-select-button');

    helpLabel = document.getElementById('help-label');

    clockspeedSlider = document.getElementById('cs-slider');
    labelTextBox = document.getElementById('label-textbox');
    redButton = document.getElementById('redButton');
    yellowButton = document.getElementById('yellowButton');
    greenButton = document.getElementById('greenButton');
    blueButton = document.getElementById('blueButton');

    moduleNameInput = document.getElementById('module-input');
    sketchNameInput = document.getElementById('sketchname-2');
    topSketchInput = document.getElementById('sketchname-1');
    descInput = document.getElementById('desc-input');

    moduleNameInput.onkeyup = function () {
        moduleNameChanged = true;
        showModulePreviewer(); // Update previewer
    };

    sketchNameInput.onkeyup = function () {
        if (!moduleNameInput.disabled && !moduleNameChanged) {
            moduleNameInput.value = sketchNameInput.value;
        }
        topSketchInput.value = sketchNameInput.value;
        reDraw();
    };

    topSketchInput.onkeyup = function () {
        if (!moduleNameInput.disabled && !moduleNameChanged) {
            moduleNameInput.value = topSketchInput.value;
        }
        sketchNameInput.value = topSketchInput.value;
        reDraw();
    };

    customButton = document.getElementById('custom-button');
    customButton.disabled = (getCookieValue('access_token') === '');

    importButton = document.getElementById('import-button');
    screenshotButton = document.getElementById('screenshot-button');
    shareLinkButton = document.getElementById('share-link-button');

    saveButton = document.getElementById('save-sketch-button');
    if (getCookieValue('access_token') !== '') {
        saveButton.style.display = 'inline-block';
    }

    downloadButton = document.getElementById('download-button');

    dashboardButton = document.getElementById('dashboard-login-button');
    if (getCookieValue('access_token') !== '') {
        dashboardButton.innerHTML = '<i class="fas fa-th icon"></i> Dashboard';
        dashboardButton.classList.add('dashboard-button');
    }

    andButton = document.getElementById('and-button');
    orButton = document.getElementById('or-button');
    xorButton = document.getElementById('xor-button');
    notButton = document.getElementById('not-button');
    bufferButton = document.getElementById('buffer-button');
    switchButton = document.getElementById('switch-button');
    buttonButton = document.getElementById('button-button');
    clockButton = document.getElementById('clock-button');
    outputButton = document.getElementById('output-button');
    displayButton = document.getElementById('display-button');

    rsFlipFlopButton = document.getElementById('rs-flipflop-button');
    dFlipFlopButton = document.getElementById('d-flipflop-button');
    jkFlipFlopButton = document.getElementById('jk-flipflop-button');
    rsClockedButton = document.getElementById('rs-clocked-button');
    tFlipFlopButton = document.getElementById('t-flipflop-button');
    registerButton = document.getElementById('register-button');
    decoderButton = document.getElementById('decoder-button');
    muxButton = document.getElementById('mux-button');
    demuxButton = document.getElementById('demux-button');
    wrapperButton = document.getElementById('wrapper-button');
    unwrapperButton = document.getElementById('unwrapper-button');
    busInputButton = document.getElementById('bus-input-button');
    halfaddButton = document.getElementById('halfadd-button');
    fulladdButton = document.getElementById('fulladd-button');
    counterButton = document.getElementById('counter-button');
    labelButton = document.getElementById('label-button');
    if (currentTheme === 'dark') {
        labelButton.innerHTML = '<img class="preview" src="images/label_white.png">';
    }

    labelSimulation = document.getElementById('sim-label');
    labelOptions = document.getElementById('options-label');

    labelGateInputs = document.getElementById('gate-inputs-label');
    gateInputSelect = document.getElementById('gate-inputs-select');

    labelDirection = document.getElementById('direction-label');
    directionSelect = document.getElementById('direction-select');

    labelDisplay = document.getElementById('display-label');
    displaySelect = document.getElementById('display-select');

    labelOutputWidth = document.getElementById('output-width-label');
    counterBitSelect = document.getElementById('counter-select');

    labelInputWidth = document.getElementById('input-width-label');
    decoderBitSelect = document.getElementById('decoder-select');
    multiplexerBitSelect = document.getElementById('mux-select');
    wrapperWidthSelect = document.getElementById('wrapper-width-select');
    busCheckbox = document.getElementById('bus-checkbox');
    busCheckboxLabel = document.getElementById('bus-checkbox-label');
    inBusCheckbox = document.getElementById('in-bus-checkbox');
    inBusCheckboxLabel = document.getElementById('in-bus-checkbox-label');
    outBusCheckbox = document.getElementById('out-bus-checkbox');
    outBusCheckboxLabel = document.getElementById('out-bus-checkbox-label');

    syncFPSCheckbox = document.getElementById('syncFPSCheckbox');
    syncFPSLabel = document.getElementById('syncFPSLabel');

    bypassCheckbox = document.getElementById('bypassCheckbox');
    bypassLabel = document.getElementById('bypassLabel');

    tickTimeLabel = document.getElementById('ticktime-label');
    tickTimeSlider = document.getElementById('ticktime-slider');
    tickTimeMsLabel = document.getElementById('ticktime-ms');

    multiplierLabel = document.getElementById('multiplier-label');
    multiplierSlider = document.getElementById('multiplier-slider');
    multiplierValueLabel = document.getElementById('multiplier-value-label');
}

function addElementHelpTexts() {
    addHelpText(logoImage, 'Go to start page');

    addHelpText(editButton, 'Draw wires and change element properties <span style="color: #c83232">[Esc]</span>');
    addHelpText(deleteButton, 'Delete wires and elements <span style="color: #c83232">[D]</span>');
    addHelpText(simButton, 'Start and stop the simulation <span style="color: #c83232">[⏎]</span>');
    addHelpText(selectButton, 'Select an area to move, copy or delete <span style="color: #c83232">[S]</span>');
    addHelpText(moduleButton, 'Configure this Sketch as a Custom Module');

    addHelpText(topSketchInput, 'This is the file name of the Sketch');
    addHelpText(importButton, 'Import a JSON file (Clears the current sketch!) <span style="color: #c83232">[I]</span>');
    addHelpText(screenshotButton, 'Take a screenshot of the sketch <span style="color: #c83232">[P]</span>');
    addHelpText(document.getElementById('darkmode-button'), 'Toggle between dark and light mode');
    addHelpText(shareLinkButton, 'Create a link to a copy of this sketch');
    if (getCookieValue('access_token') !== '') {
        addHelpText(saveButton, 'Save this sketch to your dashboard');
        addHelpText(dashboardButton, 'Get back to the dashboard');
    } else {
        addHelpText(downloadButton, 'Download as JSON');
        addHelpText(dashboardButton, 'Log into your LogiJS account');
    }

    addHelpText(clockspeedSlider, 'Sets the toggle speed of this clock element');
    addHelpText(labelTextBox, 'Edit the text of this label');
    addHelpText(redButton, 'Set the output color to red');
    addHelpText(yellowButton, 'Set the output color to yellow');
    addHelpText(greenButton, 'Set the output color to green');
    addHelpText(blueButton, 'Set the output color to blue');

    addHelpText(copySelectButton, 'Copy this sketch part <span style="color: #c83232">[C]</span>');
    addHelpText(deleteSelectButton, 'Delete this sketch part <span style="color: #c83232">[D]</span>');

    addHelpText(descInput, 'This is the description displayed in the dashboard');
    addHelpText(moduleNameInput, 'This is the text written on the module');
    addHelpText(sketchNameInput, 'This is the file name of the sketch');
    addHelpText(document.getElementById('save-button'), 'Save this sketch to the dashboard');

    addHelpText(document.getElementById('copy-link-button'), 'Copy this link to clipboard');

    addHelpText(andButton, 'AND Gate');
    addHelpText(orButton, 'OR Gate');
    addHelpText(xorButton, 'XOR Gate');
    addHelpText(notButton, 'NOT Gate');
    addHelpText(bufferButton, 'Buffer Gate');
    addHelpText(switchButton, 'Switch');
    addHelpText(buttonButton, 'Button');
    addHelpText(clockButton, 'Clock');
    addHelpText(outputButton, 'Lamp');
    addHelpText(displayButton, '7-Segment Display');
    addHelpText(rsFlipFlopButton, 'RS Flip-Flop');
    addHelpText(dFlipFlopButton, 'D Flip-Flop');
    addHelpText(jkFlipFlopButton, 'JK Flip-Flop');
    addHelpText(rsClockedButton, 'Clocked RS Flip-Flop');
    addHelpText(tFlipFlopButton, 'T Flip-Flop');
    addHelpText(registerButton, '4-Bit Register');
    addHelpText(decoderButton, 'Decoder');
    addHelpText(muxButton, 'Multiplexer');
    addHelpText(demuxButton, 'Demultiplexer');
    addHelpText(wrapperButton, 'Bus Wrapper: Creates a bus from multiple inputs');
    addHelpText(unwrapperButton, 'Bus Unwrapper: Creates multiple inputs from a bus');
    addHelpText(busInputButton, 'Bus Input: Provide a bus input for higher level modules');
    addHelpText(halfaddButton, 'Half Adder');
    addHelpText(fulladdButton, 'Full Adder');
    addHelpText(counterButton, 'Counter');
    addHelpText(labelButton, 'Text Label');

    addHelpText(gateInputSelect, 'Define the number of gate inputs');
    addHelpText(directionSelect, 'Define the direction of the element');
    addHelpText(displaySelect, 'Define the number of input bits');
    addHelpText(counterBitSelect, 'Define the number of output bits');
    addHelpText(decoderBitSelect, 'Define the number of input bits');
    addHelpText(multiplexerBitSelect, 'Define the address width of the element');
    addHelpText(wrapperWidthSelect, 'Define the bus width for the wrappers and dewrappers');
    addHelpText(busCheckbox, 'Use the bus version of this module');
    addHelpText(busCheckboxLabel, 'Use the bus version of this module');
    addHelpText(inBusCheckbox, 'Provide a bus input instead of discrete inputs');
    addHelpText(inBusCheckboxLabel, 'Provide a bus input instead of discrete inputs');
    addHelpText(outBusCheckbox, 'Provide a bus output instead of discrete outputs');
    addHelpText(outBusCheckboxLabel, 'Provide a bus output instead of discrete outputs');

    addHelpText(syncFPSCheckbox, 'Sync the simulation speed with the frame rate');
    addHelpText(syncFPSLabel, 'Sync the simulation speed with the frame rate');
    addHelpText(bypassCheckbox, 'Simulate with full frame rate speed');
    addHelpText(bypassLabel, 'Simulate with full frame rate speed');
    addHelpText(tickTimeSlider, 'Set the minimum time per simulation tick');
    addHelpText(multiplierSlider, 'Speed up the simulation at higher CPU cost');

    addHelpText(customButton, 'Import your own sketches as custom modules');

    addHelpText(document.getElementById('wire-label'), 'Add single wires <span style="color: #c83232">[B]</span>');
    addHelpText(document.getElementById('bus-label'), 'Add busses for multiple bit transfer <span style="color: #c83232">[B]</span>');
}

function addHelpText(element, text) {
    element.addEventListener('mouseenter', function () {
        setHelpText(text);
    });
    element.addEventListener('mouseleave', function () {
        if (!moduleOptions) {
            setHelpText('');
        } else {
            setHelpText('Click on the in- and outputs to swap them!');
        }
    });
}

/*
    On-click functions
*/

function undoClicked() {
    undo();
    moduleButton.disabled = (outputs.length === 0);
}

function redoClicked() {
    redo();
    moduleButton.disabled = (outputs.length === 0);
}

function moduleClicked() {
    if (!moduleOptions) {
        enterModifierMode();
        showModuleOptions();
        hideAllOptions();
        setUnactive();
        moduleButton.classList.add('active');
        setHelpText('Click on the in- and outputs to swap them!');
    } else {
        hideModuleOptions();
        enterModifierMode();
        setHelpText('');
    }
}

function notClicked() {
    setUnactive();
    hideAllOptions();
    notButton.classList.add('active');
    previewFeatures = {
        type: 'module',
        inputBusWidth: [0],
        outputBusWidth: [0],
        inputIsTop: [false],
        inputLabels: [''],
        outputLabels: ['1'],
        caption: 'NOT',
        inputInverter: false,
        outputInverter: false,
        minHeight: 1
    }
    return importCustom('not-gate.json');
}

function bufferClicked() {
    setUnactive();
    hideAllOptions();
    bufferButton.classList.add('active');
    previewFeatures = {
        type: 'module',
        inputBusWidth: [0],
        outputBusWidth: [0],
        inputIsTop: [false],
        inputLabels: [''],
        outputLabels: ['1'],
        caption: '',
        inputInverter: false,
        outputInverter: false,
        minHeight: 1
    }
    return importCustom('1-buffer.json');
}

function rsFlipFlopClicked() {
    setUnactive();
    hideAllOptions();
    rsFlipFlopButton.classList.add('active');
    previewFeatures = {
        type: 'module',
        inputBusWidth: [0, 0],
        outputBusWidth: [0, 0],
        inputIsTop: [false, false],
        inputLabels: ['S', 'R'],
        outputLabels: ['Q', 'Q̅'],
        caption: 'RS-FF',
        inputInverter: false,
        outputInverter: false,
        minHeight: 2
    }
    return importCustom('rs-flipflop.json');
}

function dFlipFlopClicked() {
    setUnactive();
    hideAllOptions();
    dFlipFlopButton.classList.add('active');
    previewFeatures = {
        type: 'module',
        inputBusWidth: [0, 0],
        outputBusWidth: [0, 0],
        inputIsTop: [false, false],
        inputLabels: ['D', '>'],
        outputLabels: ['Q', 'Q̅'],
        caption: 'D-FF',
        inputInverter: false,
        outputInverter: false,
        minHeight: 2
    }
    return importCustom('d-flipflop.json');
}

function jkFlipFlopClicked() {
    setUnactive();
    hideAllOptions();
    jkFlipFlopButton.classList.add('active');
    previewFeatures = {
        type: 'module',
        inputBusWidth: [0, 0, 0],
        outputBusWidth: [0, 0],
        inputIsTop: [false, false],
        inputLabels: ['J', '>', 'K'],
        outputLabels: ['Q', 'Q̅'],
        caption: 'JK-FF',
        inputInverter: false,
        outputInverter: false,
        minHeight: 3
    }
    return importCustom('jk-flipflop.json');
}

function rsClockedClicked() {
    setUnactive();
    hideAllOptions();
    rsClockedButton.classList.add('active');
    previewFeatures = {
        type: 'module',
        inputBusWidth: [0, 0, 0],
        outputBusWidth: [0, 0],
        inputIsTop: [false, false],
        inputLabels: ['S', '>', 'R'],
        outputLabels: ['Q', 'Q̅'],
        caption: 'RS-FF',
        inputInverter: false,
        outputInverter: false,
        minHeight: 3
    }
    return importCustom('rs-clocked.json');
}

function tFlipFlopClicked() {
    setUnactive();
    hideAllOptions();
    tFlipFlopButton.classList.add('active');
    previewFeatures = {
        type: 'module',
        inputBusWidth: [0, 0],
        outputBusWidth: [0, 0],
        inputIsTop: [false, false],
        inputLabels: ['T', '>'],
        outputLabels: ['Q', 'Q̅'],
        caption: 'T-FF',
        inputInverter: false,
        outputInverter: false,
        minHeight: 2
    }
    return importCustom('t-flipflop.json');
}

function registerClicked() {
    setUnactive();
    hideAllOptions();
    registerButton.classList.add('active');
    previewFeatures = {
        type: 'module',
        inputBusWidth: [0, 0, 0, 0, 0, 0],
        outputBusWidth: [0, 0, 0, 0],
        inputIsTop: [true, true, false, false, false, false],
        inputLabels: ['L', '>', '2³', '2²', '2¹', '2º'],
        outputLabels: ['2³', '2²', '2¹', '2º'],
        caption: 'Register',
        inputInverter: false,
        outputInverter: false,
        minHeight: 2
    }
    return importCustom('4-register.json');
}

function decoderClicked() {
    setUnactive();
    hideAllOptions();
    decoderButton.classList.add('active');

    setDecoderPreview();

    setControlMode('addObject');
    addType = 14;
    labelDirection.style.display = 'inline-block';
    directionSelect.style.display = 'inline-block';
    labelInputWidth.style.display = 'inline-block';
    decoderBitSelect.style.display = 'inline-block';
    labelOptions.style.display = 'block';
    inBusCheckbox.style.display = 'inline-block';
    inBusCheckboxLabel.style.display = 'inline-block';
    outBusCheckbox.style.display = 'inline-block';
    outBusCheckboxLabel.style.display = 'inline-block';
}

function muxClicked() {
    setUnactive();
    hideAllOptions();
    muxButton.classList.add('active');
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

    previewFeatures = {
        type: 'module',
        inputBusWidth: Array(Math.pow(2, muxBitWidth) + muxBitWidth).fill(0),
        outputBusWidth: [0],
        inputIsTop: Array(muxBitWidth).fill(true).concat(Array(Math.pow(2, muxBitWidth)).fill(false)),
        inputLabels: ipLabels,
        outputLabels: [''],
        caption: 'MUX',
        inputInverter: false,
        outputInverter: false,
        minHeight: 2
    }

    setControlMode('addObject');
    addType = 10;
    labelDirection.style.display = 'inline-block';
    directionSelect.style.display = 'inline-block';
    labelInputWidth.style.display = 'inline-block';
    multiplexerBitSelect.style.display = 'inline-block';
    labelOptions.style.display = 'block';
    custFile = muxBitWidth + '-mux.json';
}

function demuxClicked() {
    setUnactive();
    hideAllOptions();
    demuxButton.classList.add('active');
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
    let opLabels = [];
    for (let i = 0; i < Math.pow(2, muxBitWidth); i++) {
        opLabels.push(i);
    }

    previewFeatures = {
        type: 'module',
        inputBusWidth: Array(muxBitWidth + 1).fill(0),
        outputBusWidth: Array(Math.pow(2, muxBitWidth)).fill(0),
        inputIsTop: Array(muxBitWidth).fill(true).concat([false]),
        inputLabels: ipLabels,
        outputLabels: opLabels,
        caption: 'DEMUX',
        inputInverter: false,
        outputInverter: false,
        minHeight: 2
    }

    setControlMode('addObject');
    addType = 10;
    labelDirection.style.display = 'inline-block';
    directionSelect.style.display = 'inline-block';
    labelInputWidth.style.display = 'inline-block';
    multiplexerBitSelect.style.display = 'inline-block';
    labelOptions.style.display = 'block';
    custFile = muxBitWidth + '-demux.json';
}

function busUnwrapperClicked() {
    setUnactive();
    hideAllOptions();
    unwrapperButton.classList.add('active');
    setBusUnwrapperPreview();
    setControlMode('addObject');
    addType = 12;
    labelDirection.style.display = 'inline-block';
    directionSelect.style.display = 'inline-block';
    labelOutputWidth.style.display = 'inline-block';
    wrapperWidthSelect.style.display = 'inline-block';
    labelOptions.style.display = 'block';
}

function busWrapperClicked() {
    setUnactive();
    hideAllOptions();
    wrapperButton.classList.add('active');
    setBusWrapperPreview();
    setControlMode('addObject');
    addType = 13;
    labelDirection.style.display = 'inline-block';
    directionSelect.style.display = 'inline-block';
    labelInputWidth.style.display = 'inline-block';
    wrapperWidthSelect.style.display = 'inline-block';
    labelOptions.style.display = 'block';
}

function halfaddClicked() {
    setUnactive();
    hideAllOptions();
    halfaddButton.classList.add('active');
    previewFeatures = {
        type: 'module',
        inputBusWidth: [0, 0],
        outputBusWidth: [0, 0],
        inputIsTop: [false, false],
        inputLabels: ['A', 'B'],
        outputLabels: ['C', 'S'],
        caption: 'HA',
        inputInverter: false,
        outputInverter: false,
        minHeight: 2
    }
    return importCustom('half_add.json');
}

function fulladdClicked() {
    setUnactive();
    hideAllOptions();
    fulladdButton.classList.add('active');
    previewFeatures = {
        type: 'module',
        inputBusWidth: [0, 0, 0],
        outputBusWidth: [0, 0],
        inputIsTop: [false, false, false],
        inputLabels: ['A', 'B', 'C'],
        outputLabels: ['C', 'S'],
        caption: 'FA',
        inputInverter: false,
        outputInverter: false,
        minHeight: 2
    }
    return importCustom('full_add.json');
}

function counterClicked() {
    setUnactive();
    hideAllOptions();
    counterButton.classList.add('active');
    let opLabels = [];
    for (let i = 0; i < counterBitWidth; i++) {
        opLabels.push('2' + superscripts[counterBitWidth - i - 1]);
    }

    previewFeatures = {
        type: 'module',
        inputBusWidth: [0],
        outputBusWidth: Array(counterBitWidth).fill(0),
        inputIsTop: [false],
        inputLabels: ['>'],
        outputLabels: opLabels,
        caption: 'Counter',
        inputInverter: false,
        outputInverter: false,
        minHeight: 2
    }

    setControlMode('addObject');
    addType = 10;
    labelDirection.style.display = 'inline-block';
    directionSelect.style.display = 'inline-block';
    labelOutputWidth.style.display = 'inline-block';
    counterBitSelect.style.display = 'inline-block';
    labelOptions.style.display = 'block';
    custFile = counterBitWidth + '-counter.json';
}

function syncFramerateCheckBoxChanged() {
    syncFramerate = syncFPSCheckbox.checked;
    if (!syncFramerate && simRunning) {
        tickTimeLabel.classList.add('disabledLabel');
        tickTimeMsLabel.classList.add('disabledLabel');
        multiplierValueLabel.classList.remove('disabledLabel');
        multiplierLabel.classList.remove('disabledLabel');
        tickTimeSlider.disabled = true;
        multiplierSlider.disabled = false;

        bypassCheckbox.disabled = true;
        bypassLabel.classList.add('disabledLabel');

        newMultiplier();
    } else {
        if (tickTime > 0) {
            tickTimeLabel.classList.remove('disabledLabel');
            tickTimeMsLabel.classList.remove('disabledLabel');
            tickTimeSlider.disabled = false;
        }
        multiplierSlider.disabled = true;
        multiplierValueLabel.classList.add('disabledLabel');
        multiplierLabel.classList.add('disabledLabel');
        bypassCheckbox.style.display = 'inline-block';
        bypassLabel.style.display = 'inline-block';
        bypassCheckbox.disabled = false;
        bypassLabel.classList.remove('disabledLabel');
        stopTicks = true;
    }
}

function bypassTickTimeChanged() {
    if (bypassCheckbox.checked) {
        tickTime = 0;
        tickTimeLabel.classList.add('disabledLabel');
        tickTimeMsLabel.classList.add('disabledLabel');
        tickTimeSlider.disabled = true;

    } else {
        newTickTime();
        tickTimeLabel.classList.remove('disabledLabel');
        tickTimeMsLabel.classList.remove('disabledLabel');
        tickTimeSlider.disabled = false;
    }
}

function screenshotClicked() {
    dropdownClicked = true;
    screenshotDialog = true;
    setHelpText('');
    setControlMode('modify');
    setUnactive();
    hideAllOptions();
    configureButtons('screenshot');
    reDraw();
    loadImage('images/alt_logo.png', logoImage => {
        image(logoImage, window.width - 200, window.height - 100);
        screenshotImg = canvas.toDataURL("image/png");
        document.getElementById('screenshot').src = screenshotImg;
        mainCanvas.elt.classList.add('dark-canvas');
        document.getElementById('screenshot-dialog').style.display = 'block';
        dropdownClicked = false;
        reDraw();
    });
}

function screenshotNewTab() {
    let newtab = window.open();
    newtab.document.write('<!DOCTYPE html><html><head></head><body style="margin: 0; background: #323232;"><img style="display: block; position: absolute; top: 25px; left: 120px;" src="' + screenshotImg + '"/></body></html>');
    newtab.document.location = '#';
    newtab.document.title = 'LogiJS: Screenshot';
}

function importButtonClicked() {
    dropdownClicked = true;
    document.getElementById('fileid').click();
}

function dashboardButtonClicked() {
    if (dashboardButton.innerHTML === 'SURE?') {
        window.location = '/dashboard';
    } else {
        dashboardButton.classList.add('active');
        dashboardButton.innerHTML = 'SURE?';
        setTimeout(function () { if (getCookieValue('access_token') !== '') { dashboardButton.innerHTML = '<i class="fas fa-th icon"></i> Dashboard'; } else { dashboardButton.innerHTML = '<i class="fa fa-sign-in-alt icon"></i> Login'; } dashboardButton.classList.remove('active'); }, 3000);
    }
}

function shareLinkClicked() {
    dropdownClicked = true;
    configureButtons('shareLink');

    let json = buildJSON();
    socket.emit('createLink', { json: json });

    setTimeout(function () { dropdownClicked = false; }, 100); // Allow elements to be placed again after 100ms
}

/*
    This function is triggered when the dark/light mode button in the dropdown menu is clicked
*/
function darkmodeClicked() {
    dropdownClicked = true; // Prevent elements from being placed underneath the dropdown menu
    if (currentTheme === 'light') {
        currentTheme = 'dark'; // Set the new theme for editor-internal use
        document.documentElement.classList.add('dark-theme'); // Apply dark theme css
        document.getElementById('logo').src = 'images/alt_logo.png';
        labelButton.innerHTML = '<img class="preview" src="images/label_white.png">';
        document.getElementById('darkmode-button').innerHTML = '<i class="fas fa-sun icon"></i> Light Mode';
    } else {
        currentTheme = 'light';
        document.documentElement.classList.remove('dark-theme'); // Remove dark theme css
        document.getElementById('logo').src = 'images/alt_logo_dark.png';
        labelButton.innerHTML = '<img class="preview" src="images/label.png">';
        document.getElementById('darkmode-button').innerHTML = '<i class="fas fa-moon icon"></i> Dark Mode';
    }
    localStorage.setItem('theme', currentTheme); // Save the current theme to sync it with the rest of the site
    setTimeout(function () { dropdownClicked = false; }, 100); // Allow elements to be placed again after 100ms
}

function closeUpdateDialog() {
    localStorage.setItem('showupdate', 'update' + updateNo);
    document.getElementById('update-dialog').style.display = 'none';
}