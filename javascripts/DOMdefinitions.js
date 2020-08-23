function createTopButtons() {
    // Activates the edit mode
    modifierModeButton = createButton('<i class="fa fa-pen icon"></i> Edit');
    modifierModeButton.mousePressed(function () {
        enterModifierMode();
    });
    modifierModeButton.elt.className = 'button active';
    modifierModeButton.mouseOver(function () {
        setHelpText('Draws wires and changes element properties');
    });
    modifierModeButton.mouseOut(function () {
        setHelpText('');
    });
    modifierModeButton.parent(topLeftButtons);

    // Activates the delete mode (objects and wires)
    deleteButton = createButton('<i class="far fa-trash-alt icon"></i> Delete');
    deleteButton.mousePressed(deleteClicked);
    deleteButton.elt.className = 'button';
    deleteButton.mouseOver(function () {
        setHelpText('Deletes wires and elements');
    });
    deleteButton.mouseOut(function () {
        setHelpText('');
    });
    deleteButton.parent(topLeftButtons);

    // Starts and stops the simulation
    simButton = createButton('<i class="fa fa-play icon"></i> Start');
    simButton.mousePressed(simClicked);
    simButton.elt.className = 'button';
    simButton.style('min-width', simButton.width + 10 + 'px');
    simButton.mouseOver(function () {
        setHelpText('Starts and stops the simulation');
    });
    simButton.mouseOut(function () {
        setHelpText('');
    });
    simButton.parent(topLeftButtons);

    // Undos the last action
    undoButton = createButton('<i class="fa fa-undo icon"></i> Undo');
    undoButton.mousePressed(() => {
        undo();
    });
    undoButton.elt.disabled = true;
    undoButton.elt.className = 'button';
    undoButton.parent(topLeftButtons);

    // Redos the last action
    redoButton = createButton('<i class="fa fa-redo icon"></i> Redo');
    redoButton.mousePressed(() => {
        redo();
    });
    redoButton.elt.disabled = true;
    redoButton.elt.className = 'button';
    redoButton.parent(topLeftButtons);

    // Activates the mode for area selecting
    selectButton = createButton('<i class="fas fa-object-group icon"></i> Select');
    selectButton.mousePressed(startSelect);
    selectButton.elt.style.cursor = 'default';
    selectButton.elt.className = 'button';
    selectButton.elt.title = 'Coming soon!';
    selectButton.parent(topLeftButtons);

    helpLabel = createP('<i class="fa fa-question-circle icon" style="color: rgb(200, 50, 50);"></i>');
    helpLabel.elt.className = 'label inlineLabel';
    helpLabel.parent(topLeftButtons);
    helpLabel.hide();

    sketchNameLabel = createP('Untitled Sketch');
    sketchNameLabel.elt.className = 'label inlineLabel sketchNameLabel';
    sketchNameLabel.parent(topRightButtons);
}

function createBasicElements() {
    // Adds text 'Basic'
    labelBasic = createP('Logic Gates<span style="color: #c83232">.</span>');
    labelBasic.elt.className = 'label';
    labelBasic.parent(leftSideButtons);

    // Adds and-gates
    andButton = createButton('');
    andButton.mousePressed(function () { andClicked(false); });
    andButton.elt.className = 'previewButton';
    andButton.elt.innerHTML = '<img class="preview" src="images/and-gate.png">';
    andButton.mouseOver(function () {
        setHelpText('AND Gate');
    });
    andButton.mouseOut(function () {
        setHelpText('');
    });
    andButton.parent(leftSideButtons);

    // Adds or-gates
    orButton = createButton('');
    orButton.mousePressed(function () { orClicked(false); });
    orButton.elt.className = 'previewButton';
    orButton.elt.innerHTML = '<img class="preview" src="images/or-gate.png">';
    orButton.mouseOver(function () {
        setHelpText('OR Gate');
    });
    orButton.mouseOut(function () {
        setHelpText('');
    });
    orButton.parent(leftSideButtons);

    // Adds xor-gates
    xorButton = createButton('');
    xorButton.mousePressed(function () { xorClicked(false); });
    xorButton.elt.className = 'previewButton';
    xorButton.elt.innerHTML = '<img class="preview" src="images/xor-gate.png">';
    xorButton.mouseOver(function () {
        setHelpText('XOR Gate');
    });
    xorButton.mouseOut(function () {
        setHelpText('');
    });
    xorButton.parent(leftSideButtons);

    // Adds not-gates
    notButton = createButton('');
    notButton.mousePressed(function () {
        setActive(notButton, true);
        setPreviewElement(true, {
            tops: [],
            inputLabels: [''],
            outputLabels: ['1'],
            caption: 'NOT',
            inputs: 1,
            outputs: 1
        });
        return importCustom('not-gate.json');
    });
    notButton.elt.className = 'previewButton';
    notButton.elt.innerHTML = '<img class="preview" src="images/not-gate.png">';
    notButton.mouseOver(function () {
        setHelpText('NOT Gate');
    });
    notButton.mouseOut(function () {
        setHelpText('');
    });
    notButton.parent(leftSideButtons);

    // Adds buffer gates
    bufferButton = createButton('');
    bufferButton.mousePressed(function () {
        setActive(bufferButton, true);
        setPreviewElement(true, {
            tops: [],
            inputLabels: [''],
            outputLabels: ['1'],
            caption: '',
            inputs: 1,
            outputs: 1
        });
        return importCustom('1-buffer.json');
    });
    bufferButton.elt.className = 'previewButton';
    bufferButton.elt.innerHTML = '<img class="preview" src="images/buffer.png">';
    bufferButton.mouseOver(function () {
        setHelpText('Buffer Gate');
    });
    bufferButton.mouseOut(function () {
        setHelpText('');
    });
    bufferButton.parent(leftSideButtons);

    labelInOut = createP('Inputs & Outputs<span style="color: #c83232">.</span>');
    labelInOut.elt.className = 'label';
    labelInOut.parent(leftSideButtons);

    // Adds switches
    inputButton = createButton('');
    inputButton.mousePressed(function () { inputClicked(false); });
    inputButton.elt.className = 'previewButton';
    inputButton.elt.innerHTML = '<img class="preview" src="images/switch.png">';
    inputButton.mouseOver(function () {
        setHelpText('Switch');
    });
    inputButton.mouseOut(function () {
        setHelpText('');
    });
    inputButton.parent(leftSideButtons);

    // Adds buttons (short impulse)
    buttonButton = createButton('');
    buttonButton.mousePressed(function () { buttonClicked(false); });
    buttonButton.elt.className = 'previewButton';
    buttonButton.elt.innerHTML = '<img class="preview" src="images/button.png">';
    buttonButton.mouseOver(function () {
        setHelpText('Button');
    });
    buttonButton.mouseOut(function () {
        setHelpText('');
    });
    buttonButton.parent(leftSideButtons);

    // Adds clocks (variable impulse)
    clockButton = createButton('');
    clockButton.mousePressed(function () { clockClicked(false); });
    clockButton.elt.className = 'previewButton';
    clockButton.elt.innerHTML = '<img class="preview" src="images/clock.png">';
    clockButton.mouseOver(function () {
        setHelpText('Clock');
    });
    clockButton.mouseOut(function () {
        setHelpText('');
    });
    clockButton.parent(leftSideButtons);

    // Adds outputs (lamps)
    outputButton = createButton('');
    outputButton.mousePressed(function () { outputClicked(false); });
    outputButton.elt.className = 'previewButton';
    outputButton.elt.innerHTML = '<img class="preview" src="images/output.png">';
    outputButton.mouseOver(function () {
        setHelpText('Lamp');
    });
    outputButton.mouseOut(function () {
        setHelpText('');
    });
    outputButton.parent(leftSideButtons);

    // Adds 7-segment displays
    segDisplayButton = createButton('');
    segDisplayButton.mousePressed(function () { segDisplayClicked(false); });
    segDisplayButton.elt.className = 'previewButton';
    segDisplayButton.elt.innerHTML = '<img class="preview" src="images/segments.png">';
    segDisplayButton.mouseOver(function () {
        setHelpText('7-Segment Display');
    });
    segDisplayButton.mouseOut(function () {
        setHelpText('');
    });
    segDisplayButton.parent(leftSideButtons);
}

function createAdvancedElements() {
    // Adds text 'Advanced Elements'
    labelAdvanced = createP('Memory<span style="color: #c83232">.</span>');
    labelAdvanced.elt.className = 'label';
    labelAdvanced.parent(leftSideButtons);

    // Adds an rs-flipflop
    rsFlipFlopButton = createButton('RS Flip-Flop');
    rsFlipFlopButton.mousePressed(function () {
        setActive(rsFlipFlopButton, true);
        setPreviewElement(true, {
            tops: [],
            inputLabels: ['S', 'R'],
            outputLabels: ['Q', 'Q̅'],
            caption: 'RS-FF',
            inputs: 2,
            outputs: 2
        });
        return importCustom('rs-flipflop.json');
    });
    rsFlipFlopButton.elt.className = 'previewButton';
    rsFlipFlopButton.elt.innerHTML = '<img class="preview" src="images/rs-flipflop.png">';
    rsFlipFlopButton.mouseOver(function () {
        setHelpText('RS Flip-Flop');
    });
    rsFlipFlopButton.mouseOut(function () {
        setHelpText('');
    });
    rsFlipFlopButton.parent(leftSideButtons);
    // Adds a d-flipflop
    dFlipFlopButton = createButton('D Flip-Flop');
    dFlipFlopButton.mousePressed(function () {
        setActive(dFlipFlopButton, true);
        setPreviewElement(true, {
            tops: [],
            inputLabels: ['D', '>'],
            outputLabels: ['Q', 'Q̅'],
            caption: 'D-FF',
            inputs: 2,
            outputs: 2
        });
        return importCustom('d-flipflop.json');
    });
    dFlipFlopButton.elt.className = 'previewButton';
    dFlipFlopButton.elt.innerHTML = '<img class="preview" src="images/d-flipflop.png">';
    dFlipFlopButton.mouseOver(function () {
        setHelpText('D Flip-Flop');
    });
    dFlipFlopButton.mouseOut(function () {
        setHelpText('');
    });
    dFlipFlopButton.parent(leftSideButtons);

    // Adds a register (4Bit)
    reg4Button = createButton('4Bit-Register');
    reg4Button.mousePressed(function () {
        setActive(reg4Button, true);
        setPreviewElement(true, {
            tops: [0, 1],
            inputLabels: ['L', '>', '2³', '2²', '2¹', '2º'],
            outputLabels: ['2³', '2²', '2¹', '2º'],
            caption: 'Register',
            inputs: 6,
            outputs: 4
        });
        return importCustom('4-register.json');
    });
    reg4Button.elt.className = 'previewButton';
    reg4Button.elt.innerHTML = '<img class="preview" src="images/register.png">';
    reg4Button.mouseOver(function () {
        setHelpText('4-bit Register');
    });
    reg4Button.mouseOut(function () {
        setHelpText('');
    });
    reg4Button.parent(leftSideButtons);

    labelConverter = createP('Converter<span style="color: #c83232">.</span>');
    labelConverter.elt.className = 'label';
    labelConverter.parent(leftSideButtons);

    // Adds a decoder
    decoderButton = createButton('Decoder');
    decoderButton.mousePressed(function () {
        setActive(decoderButton, true);
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
        return decoderClicked();
    });
    decoderButton.elt.className = 'previewButton';
    decoderButton.elt.innerHTML = '<img class="preview" src="images/decoder.png">';
    decoderButton.mouseOver(function () {
        setHelpText('Decoder');
    });
    decoderButton.mouseOut(function () {
        setHelpText('');
    });
    decoderButton.parent(leftSideButtons);
    // Adds a multiplexer
    muxButton = createButton('Multiplexer');
    muxButton.mousePressed(function () {
        setActive(muxButton, true);
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
        return muxClicked();
    });
    muxButton.elt.className = 'previewButton';
    muxButton.elt.innerHTML = '<img class="preview" src="images/mux.png">';
    muxButton.mouseOver(function () {
        setHelpText('Multiplexer');
    });
    muxButton.mouseOut(function () {
        setHelpText('');
    });
    muxButton.parent(leftSideButtons);
    // Adds a demultiplexer
    demuxButton = createButton('Demultiplexer');
    demuxButton.mousePressed(function () {
        setActive(demuxButton, true);
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
        return demuxClicked();
    });
    demuxButton.elt.className = 'previewButton';
    demuxButton.elt.innerHTML = '<img class="preview" src="images/demux.png">';
    demuxButton.mouseOver(function () {
        setHelpText('Demultiplexer');
    });
    demuxButton.mouseOut(function () {
        setHelpText('');
    });
    demuxButton.parent(leftSideButtons);


    labelAdder = createP('Adder<span style="color: #c83232">.</span>');
    labelAdder.elt.className = 'label';
    labelAdder.parent(leftSideButtons);

    // Adds a Half Adder
    halfaddButton = createButton('Half Adder');
    halfaddButton.mousePressed(function () {
        setActive(halfaddButton, true);
        setPreviewElement(true, {
            tops: [],
            inputLabels: ['A', 'B'],
            outputLabels: ['S', 'C'],
            caption: 'HA',
            inputs: 2,
            outputs: 2
        });
        return importCustom('half_add.json');
    });
    halfaddButton.elt.className = 'previewButton';
    halfaddButton.elt.innerHTML = '<img class="preview" src="images/halfadd.png">';
    halfaddButton.mouseOver(function () {
        setHelpText('Half Adder');
    });
    halfaddButton.mouseOut(function () {
        setHelpText('');
    });
    halfaddButton.parent(leftSideButtons);
    // Adds a Full Adder
    fulladdButton = createButton('Full Adder');
    fulladdButton.mousePressed(function () {
        setActive(fulladdButton, true);
        setPreviewElement(true, {
            tops: [],
            inputLabels: ['A', 'B', 'C'],
            outputLabels: ['S', 'C'],
            caption: 'FA',
            inputs: 3,
            outputs: 2
        });
        return importCustom('full_add.json');
    });
    fulladdButton.elt.className = 'previewButton';
    fulladdButton.elt.innerHTML = '<img class="preview" src="images/fulladd.png">';
    fulladdButton.mouseOver(function () {
        setHelpText('Full Adder');
    });
    fulladdButton.mouseOut(function () {
        setHelpText('');
    });
    fulladdButton.parent(leftSideButtons);

    labelVarious = createP('Various Elements<span style="color: #c83232">.</span>');
    labelVarious.elt.className = 'label';
    labelVarious.parent(leftSideButtons);

    // Adds a counter
    counterButton = createButton('Counter');
    counterButton.mousePressed(function () {
        setActive(counterButton, true);
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
        return counterClicked();
    });
    counterButton.elt.className = 'previewButton';
    counterButton.elt.innerHTML = '<img class="preview" src="images/counter.png">';
    counterButton.mouseOver(function () {
        setHelpText('Counter');
    });
    counterButton.mouseOut(function () {
        setHelpText('');
    });
    counterButton.parent(leftSideButtons);

    // Adds labels
    labelButton = createButton('');
    labelButton.mousePressed(function () { labelButtonClicked(false); });
    labelButton.elt.className = 'previewButton';
    labelButton.elt.innerHTML = '<img class="preview" src="images/label.png">';
    labelButton.mouseOver(function () {
        setHelpText('Text Label');
    });
    labelButton.mouseOut(function () {
        setHelpText('');
    });
    labelButton.parent(leftSideButtons);
}

function createCustomImportButton() {
    customButton = createButton('<i class="fa fa-microchip icon"></i> Custom Modules');
    customButton.mousePressed(function () {
        customClicked();
    });
    customButton.elt.className = 'buttonLeft';
    customButton.mouseOver(function () {
        setHelpText('Import your own sketches as custom modules');
    });
    customButton.mouseOut(function () {
        setHelpText('');
    });
    customButton.parent(leftSideContainer);
    if (getCookieValue('access_token') === '') {
        customButton.elt.disabled = true;
    }
}

function createElementOptions() {
    // Adds text 'Simulation'
    labelSimulation = createP('Simulation<span style="color: #c83232">.</span>');
    labelSimulation.elt.className = 'label simLabel';
    labelSimulation.elt.style.fontSize = '25px';
    labelSimulation.style('text-align', 'center');
    labelSimulation.parent(leftSideContainer);
    labelSimulation.hide();

    // Adds text 'Options'
    labelOptions = createP('Options<span style="color: #c83232">.</span>');
    labelOptions.elt.className = 'label';
    labelOptions.elt.style.fontSize = '25px';
    labelOptions.style('text-align', 'center');
    labelOptions.parent(leftSideContainer);
    labelOptions.hide();

    // Adds text 'Gate inputs'
    labelGateInputs = createP('Gate Inputs');
    labelGateInputs.hide();
    labelGateInputs.elt.className = 'optionLabel';
    labelGateInputs.parent(leftSideContainer);

    gateInputSelect = createSelect();
    gateInputSelect.hide();
    for (let i = 1; i <= 10; i++) {
        gateInputSelect.option(i);
    }
    gateInputSelect.changed(newGateInputNumber);
    gateInputSelect.elt.className = 'selectLeft';
    gateInputSelect.parent(leftSideContainer);
    gateInputSelect.value('2');
    gateInputSelect.mouseOver(function () {
        setHelpText('Define the number of gate inputs');
    });
    gateInputSelect.mouseOut(function () {
        setHelpText('');
    });

    // Adds text 'Direction'
    labelDirection = createP('Direction');
    labelDirection.hide();
    labelDirection.elt.className = 'optionLabel';
    labelDirection.parent(leftSideContainer);

    directionSelect = createSelect();
    directionSelect.hide();
    directionSelect.option('Right');
    directionSelect.option('Up');
    directionSelect.option('Left');
    directionSelect.option('Down');
    directionSelect.changed(newDirection);
    directionSelect.elt.className = 'selectLeft';
    directionSelect.parent(leftSideContainer);
    directionSelect.value('Right');
    directionSelect.mouseOver(function () {
        setHelpText('Define the direction of the element');
    });
    directionSelect.mouseOut(function () {
        setHelpText('');
    });

    // Adds text 'Input width'
    labelBits = createP('Input Width');
    labelBits.hide();
    labelBits.elt.className = 'optionLabel';
    labelBits.parent(leftSideContainer);

    // Adds text 'Output width'
    labelOutputWidth = createP('Output Width');
    labelOutputWidth.hide();
    labelOutputWidth.elt.className = 'optionLabel';
    labelOutputWidth.parent(leftSideContainer);

    // Adds text 'Input width'
    labelInputWidth = createP('Input Width');
    labelInputWidth.hide();
    labelInputWidth.elt.className = 'optionLabel';
    labelInputWidth.parent(leftSideContainer);

    bitSelect = createSelect();
    bitSelect.hide();
    for (let i = 1; i <= 8; i++) {
        bitSelect.option(i);
    }
    bitSelect.option('16');
    bitSelect.option('32');
    bitSelect.changed(newBitLength);
    bitSelect.elt.className = 'selectLeft';
    bitSelect.parent(leftSideContainer);
    bitSelect.value('4');
    bitSelect.mouseOver(function () {
        setHelpText('Define the number of input bits');
    });
    bitSelect.mouseOut(function () {
        setHelpText('');
    });

    counterBitSelect = createSelect();
    counterBitSelect.hide();
    for (let i = 2; i <= 5; i++) {
        counterBitSelect.option(i);
    }
    counterBitSelect.changed(newCounterBitLength);
    counterBitSelect.elt.className = 'selectLeft';
    counterBitSelect.parent(leftSideContainer);
    counterBitSelect.value('4');
    counterBitSelect.mouseOver(function () {
        setHelpText('Define the number of output bits');
    });
    counterBitSelect.mouseOut(function () {
        setHelpText('');
    });

    decoderBitSelect = createSelect();
    decoderBitSelect.hide();
    for (let i = 2; i <= 5; i++) {
        decoderBitSelect.option(i);
    }
    decoderBitSelect.changed(newDecoderBitLength);
    decoderBitSelect.elt.className = 'selectLeft';
    decoderBitSelect.parent(leftSideContainer);
    decoderBitSelect.value('2');
    decoderBitSelect.mouseOver(function () {
        setHelpText('Define the number of input bits');
    });
    decoderBitSelect.mouseOut(function () {
        setHelpText('');
    });

    multiplexerBitSelect = createSelect();
    multiplexerBitSelect.hide();
    for (let i = 1; i <= 3; i++) {
        multiplexerBitSelect.option(i);
    }
    multiplexerBitSelect.changed(newMuxBitLength);
    multiplexerBitSelect.elt.className = 'selectLeft';
    multiplexerBitSelect.parent(leftSideContainer);
    multiplexerBitSelect.value('1');
    multiplexerBitSelect.mouseOver(function () {
        setHelpText('Define the address width of the element');
    });
    multiplexerBitSelect.mouseOut(function () {
        setHelpText('');
    });

    sfcheckbox = createCheckbox('Sync ticks to frames', true);
    //document.getElementsByTagName('label')[0].innerHTML = 'Sync ticks to frames<span style="color: #c83232">.</span>';
    sfcheckbox.hide();
    sfcheckbox.changed(function () {
        syncFramerate = sfcheckbox.checked();
        if (!sfcheckbox.checked() && simRunning) {
            updater = setInterval(updateTick, 1);
            tickTimeLabel.elt.className = 'label disabledLabel';
            tickTimeMsLabel.elt.className = 'label msLabel disabledLabel';
            tickTimeSlider.elt.disabled = true;
            document.getElementsByClassName('tickTimeCB')[0].disabled = true;
            document.getElementsByClassName('tickTimeCB')[1].className = 'tickTimeCB disabledLabel';
        } else {
            clearInterval(updater);
            if (tickTime > 0) {
                tickTimeLabel.elt.className = 'label';
                tickTimeMsLabel.elt.className = 'label msLabel';
                tickTimeSlider.elt.disabled = false;
            }
            bpTickTimeCB.show();
            document.getElementsByClassName('tickTimeCB')[0].disabled = false;
            document.getElementsByClassName('tickTimeCB')[1].className = 'tickTimeCB';
        }
    });
    sfcheckbox.elt.className = 'checkbox';
    sfcheckbox.parent(leftSideContainer);
    sfcheckbox.mouseOver(function () {
        setHelpText('Synchronize the simulation speed with the frame rate');
    });
    sfcheckbox.mouseOut(function () {
        setHelpText('');
    });

    bpTickTimeCB = createCheckbox('Bypass min. tick time', true);
    //document.getElementsByTagName('label')[1].innerHTML = 'Bypass min. tick time<span style="color: #c83232">.</span>';
    document.getElementsByTagName('input')[1].className = 'tickTimeCB';
    document.getElementsByTagName('label')[1].className = 'tickTimeCB';
    bpTickTimeCB.hide();
    bpTickTimeCB.checked(false);
    bpTickTimeCB.changed(function () {
        if (bpTickTimeCB.checked()) {
            tickTime = 0;
            tickTimeLabel.elt.className = 'label disabledLabel';
            tickTimeMsLabel.elt.className = 'label msLabel disabledLabel';
            tickTimeSlider.elt.disabled = true;

        } else {
            newTickTime();
            tickTimeLabel.elt.className = 'label';
            tickTimeMsLabel.elt.className = 'label msLabel';
            tickTimeSlider.elt.disabled = false;
        }
    });
    bpTickTimeCB.elt.className = 'checkbox';
    bpTickTimeCB.parent(leftSideContainer);
    bpTickTimeCB.mouseOver(function () {
        setHelpText('Synchronize simulation without using a minimum time per tick');
    });
    bpTickTimeCB.mouseOut(function () {
        setHelpText('');
    });

    tickTimeLabel = createP('Minimum time per tick:');
    tickTimeLabel.hide();
    tickTimeLabel.elt.className = 'label';
    tickTimeLabel.parent(leftSideContainer);

    tickTimeSlider = createSlider(0, 100, 10, 1);
    tickTimeSlider.hide();
    tickTimeSlider.input(function () {
        newTickTime();
    });
    tickTimeSlider.elt.className = 'slider sliderLeft';
    tickTimeSlider.parent(leftSideContainer);
    tickTimeSlider.mouseOver(function () {
        setHelpText('Sets the minimum time per simulation tick');
    });
    tickTimeSlider.mouseOut(function () {
        setHelpText('');
    });

    tickTimeMsLabel = createP('10ms');
    tickTimeMsLabel.hide();
    tickTimeMsLabel.elt.className = 'label msLabel';
    tickTimeMsLabel.parent(leftSideContainer);
}

function createDialogElements() {
    moduleNameInput = createInput('');
    moduleNameInput.attribute('placeholder', 'Module Name');
    moduleNameInput.position(windowWidth / 2 - 238, windowHeight / 2 - 104);
    moduleNameInput.elt.style.fontFamily = 'ArcaMajora3';
    moduleNameInput.elt.className = 'textInput saveInput';
    moduleNameInput.size(180, 27);
    moduleNameInput.elt.onkeyup = function () {
        moduleNameChanged = true;
        reDraw();
    };
    moduleNameInput.hide();
    moduleNameInput.mouseOver(function () {
        setHelpText('This is the text written on the module');
    });
    moduleNameInput.mouseOut(function () {
        setHelpText('');
    });

    sketchNameInput = createInput('');
    sketchNameInput.attribute('placeholder', 'Sketch Name');
    sketchNameInput.position(windowWidth / 2 - 23, windowHeight / 2 - 104);
    sketchNameInput.elt.style.fontFamily = 'ArcaMajora3';
    sketchNameInput.elt.className = 'textInput saveInput';
    sketchNameInput.elt.onkeyup = function () {
        if (!moduleNameInput.elt.disabled && !moduleNameChanged) {
            moduleNameInput.value(sketchNameInput.value());
        }
        reDraw();
    };
    sketchNameInput.hide();
    sketchNameInput.mouseOver(function () {
        setHelpText('This is the file name of the sketch');
    });
    sketchNameInput.mouseOut(function () {
        setHelpText('');
    });

    descInput = createElement('textarea');
    descInput.attribute('placeholder', 'Sketch Description');
    descInput.position(windowWidth / 2 - 3, windowHeight / 2 - 30);
    descInput.size(280, 114);
    descInput.elt.style.fontFamily = 'ArcaMajora3';
    descInput.elt.style.fontSize = '18px';
    descInput.elt.className = 'textInput descInput';
    if (getCookieValue('access_token') === '') {
        descInput.attribute('placeholder', 'Sketch Description\n(Log in to give a description)');
        descInput.elt.disabled = true;
    }
    descInput.hide();
    descInput.mouseOver(function () {
        setHelpText('This is the description displayed in the dashboard');
    });
    descInput.mouseOut(function () {
        setHelpText('');
    });

    cancelButton = createButton('Cancel');
    cancelButton.position(windowWidth / 2 - 13, windowHeight / 2 + 110);
    cancelButton.mousePressed(cancelClicked);
    cancelButton.elt.className = 'btn btn-lg btn-red';
    cancelButton.hide();

    saveDialogText = createP('Save Sketch<span style="color: #c83232">.</span>');
    saveDialogText.hide();
    saveDialogText.elt.style.color = '#323232';
    saveDialogText.elt.style.fontFamily = 'ArcaMajora3';
    saveDialogText.elt.style.margin = '3px 0px 0px 0px';
    saveDialogText.position(windowWidth / 2 - 65, windowHeight / 2 - 160);
    saveDialogText.style('font-size', '36px');

    // Button to save the sketch
    if (getCookieValue('access_token') !== '') {
        saveButton = createButton('<i class="fas fa-save"></i> Save');
        saveButton.mouseOver(function () {
            setHelpText('Save this sketch to the dashboard');
        });
    } else {
        saveButton = createButton('<i class="fas fa-file-download"></i> Download');
        saveButton.mouseOver(function () {
            setHelpText('Download this sketch as a JSON file');
        });
    }
    saveButton.position(windowWidth / 2 + 142, windowHeight / 2 + 113);
    saveButton.mousePressed(saveClicked);
    saveButton.elt.className = 'btn btn-lg btn-red';
    saveButton.mouseOut(function () {
        setHelpText('');
    });
    saveButton.hide();
}

function createTopRightButtons() {
    saveDialogButton = createButton('<i class="fas fa-save icon"></i> Save');
    saveDialogButton.mousePressed(saveDialogClicked);
    saveDialogButton.elt.className = 'button';
    saveDialogButton.parent(topRightButtons);
    saveDialogButton.mouseOver(function () {
        setHelpText('Saves the sketch');
    });
    saveDialogButton.mouseOut(function () {
        setHelpText('');
    });

    if (getCookieValue('access_token') !== '') {
        dashboardButton = createButton('<i class="fas fa-th icon"></i> Dashboard');
        dashboardButton.style('min-width', dashboardButton.width + 20 + 'px');
        dashboardButton.mouseOver(function () {
            setHelpText('Get back to the dashboard');
        });
        dashboardButton.mouseOut(function () {
            setHelpText('');
        });
    } else {
        dashboardButton = createButton('<i class="fa fa-sign-in-alt icon"></i> Login');
        dashboardButton.style('min-width', dashboardButton.width + 5 + 'px');
        dashboardButton.mouseOver(function () {
            setHelpText('Log into your LogiJS account');
        });
        dashboardButton.mouseOut(function () {
            setHelpText('');
        });
    }
    dashboardButton.mousePressed(function () {
        if (dashboardButton.html() === 'SURE?') {
            window.location = '/dashboard';
        } else {
            dashboardButton.elt.className = "button active";
            dashboardButton.html('SURE?');
            setTimeout(function () { if (getCookieValue('access_token') !== '') { dashboardButton.html('<i class="fas fa-th icon"></i> Dashboard'); } else { dashboardButton.html('<i class="fa fa-sign-in-alt icon"></i> Login'); } dashboardButton.elt.className = "button"; }, 3000);
        }
    });
    dashboardButton.elt.className = 'button';
    dashboardButton.parent(topRightButtons);
}