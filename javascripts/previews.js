// File: previews.js
// Contains functions to display the preview objects

function setDecoderPreview() {
    let inputBusWidth, outputBusWidth;
    let inputLabels = [];
    let outputLabels = [];

    if (!useInputBus) {
        inputBusWidth = Array(decoderBitWidth).fill(0);

        // Define the input labels (bit width is < 10, so there's no problem with the superscripts)
        for (let i = 0; i < decoderBitWidth; i++) {
            inputLabels.push('2' + superscripts[decoderBitWidth - i - 1]);
        }
    } else {
        inputLabels = Array(decoderBitWidth).fill('');
        inputBusWidth = [decoderBitWidth];
    }

    if (!useOutputBus) {
        outputBusWidth = Array(Math.pow(2, decoderBitWidth)).fill(0);

        // Define the output labels
        for (let i = 0; i < Math.pow(2, decoderBitWidth); i++) {
            outputLabels.push(i);
        }
    } else {
        outputLabels = Array(Math.pow(2, decoderBitWidth)).fill('');
        outputBusWidth = [Math.pow(2, decoderBitWidth)];
    }

    previewFeatures = {
        type: 'module',
        inputBusWidth: inputBusWidth, // > 0 if the input is a bus
        outputBusWidth: outputBusWidth,
        inputIsTop: Array(decoderBitWidth).fill(false),
        inputLabels: inputLabels,
        outputLabels: outputLabels,
        caption: 'Decoder',
        inputInverter: useInputBus,
        outputInverter: useOutputBus,
        minHeight: 2
    }
}

function setBusWrapperPreview() {
    let inputLabels = [];

    for (let i = 0; i < busWrapperWidth; i++) {
        if (busWrapperWidth - i - 1 < 10) {
            inputLabels.push('2' + superscripts[busWrapperWidth - i - 1]);
        } else {
            inputLabels.push('2' + superscripts[Math.floor((busWrapperWidth - i - 1) / 10)] + superscripts[busWrapperWidth - i - 1 - Math.floor((busWrapperWidth - i - 1) / 10) * 10]);
        }
    }

    previewFeatures = {
        type: 'module',
        inputBusWidth: Array(busWrapperWidth).fill(0),
        outputBusWidth: [busWrapperWidth],
        inputIsTop: Array(busWrapperWidth).fill(false),
        inputLabels: inputLabels,
        outputLabels: [' '],
        caption: 'WRAP',
        inputInverter: false,
        outputInverter: true,
        minHeight: 2
    }
}

function setBusUnwrapperPreview() {
    let outputLabels = [];

    for (let i = 0; i < busWrapperWidth; i++) {
        if (busWrapperWidth - i - 1 < 10) {
            outputLabels.push('2' + superscripts[busWrapperWidth - i - 1]);
        } else {
            outputLabels.push('2' + superscripts[Math.floor((busWrapperWidth - i - 1) / 10)] + superscripts[busWrapperWidth - i - 1 - Math.floor((busWrapperWidth - i - 1) / 10) * 10]);
        }
    }

    previewFeatures = {
        type: 'module',
        inputBusWidth: [busWrapperWidth],
        outputBusWidth: Array(busWrapperWidth).fill(0),
        inputIsTop: [false],
        inputLabels: [' '],
        outputLabels: outputLabels,
        caption: 'UNWRAP',
        inputInverter: true,
        outputInverter: false,
        minHeight: 2
    }
}

function showModulePreview() {
    // Calculate the position of the top left module corner
    let mX = Math.round((mouseX / transform.zoom - transform.dx - GRIDSIZE / 2) / GRIDSIZE) * GRIDSIZE;
    let mY = Math.round((mouseY / transform.zoom - transform.dy - GRIDSIZE / 2) / GRIDSIZE) * GRIDSIZE;

    switch (previewFeatures.type) {
        case 'module':
        case 'and':
        case 'or':
        case 'xor':
            let tops = previewFeatures.inputIsTop.filter(Boolean).length;

            // Calculate module width and height
            let mW, mH;
            if (gateDirection % 2 === 0) {
                mW = Math.max((tops + 1), 2) * GRIDSIZE;
                mH = (Math.max(previewFeatures.inputBusWidth.length - tops, previewFeatures.outputBusWidth.length, previewFeatures.minHeight) + 1) * GRIDSIZE;
            } else {
                mW = (Math.max(previewFeatures.inputBusWidth.length - tops, previewFeatures.outputBusWidth.length, previewFeatures.minHeight) + 1) * GRIDSIZE;
                mH = Math.max((tops + 1), 2) * GRIDSIZE;
            }

            let heightOnGrid = Math.max(previewFeatures.inputBusWidth.length - tops, previewFeatures.outputBusWidth.length, previewFeatures.minHeight) + 1;

            let drawnTops = 0;

            fill(255);
            stroke(0);
            strokeWeight(3);
            textFont('Arial');
            textAlign(CENTER, CENTER);

            if (tops === 0) {
                if (gateDirection % 2 === 0) {
                    rect(mX, mY + GRIDSIZE / 2, mW, mH - GRIDSIZE);
                } else {
                    rect(mX + GRIDSIZE / 2, mY, mW - GRIDSIZE, mH);
                }
            } else {
                rect(mX, mY, mW, mH);
            }

            fill(0);

            // Draw all discrete inputs
            for (let i = 1; i <= previewFeatures.inputBusWidth.length; i++) {
                if (previewFeatures.inputBusWidth[i - 1] === 0) { // If this is a normal input
                    if (!previewFeatures.inputIsTop[i - 1]) {
                        switch (gateDirection) {
                            case 0: line(mX - 6, mY + (mH * (i - drawnTops)) / heightOnGrid, mX, mY + (mH * (i - drawnTops)) / heightOnGrid); break;
                            case 1: line(mX + (mW * (i - drawnTops)) / heightOnGrid, mY - 6, mX + (mW * (i - drawnTops)) / heightOnGrid, mY); break;
                            case 2: line(mX + mW, mY + (mH * (i - drawnTops)) / heightOnGrid, mX + mW + 6, mY + (mH * (i - drawnTops)) / heightOnGrid); break;
                            case 3: line(mX + (mW * (i - drawnTops)) / heightOnGrid, mY + mH, mX + (mW * (i - drawnTops)) / heightOnGrid, mY + mH + 6); break;
                        }
                    } else {
                        drawnTops++;
                        switch (gateDirection) {
                            case 0: line(mX + (mH * drawnTops) / heightOnGrid, mY - 6, mX + (mH * drawnTops) / heightOnGrid, mY); break;
                            case 1: line(mX + mW + 6, mY + (mW * drawnTops) / heightOnGrid, mX + mW, mY + (mW * drawnTops) / heightOnGrid); break;
                            case 2: line(mX + (mH * drawnTops) / heightOnGrid, mY + mH, mX + (mH * drawnTops) / heightOnGrid, mY + mH + 6); break;
                            case 3: line(mX, mY + (mW * drawnTops) / heightOnGrid, mX - 6, mY + (mW * drawnTops) / heightOnGrid); break;
                        }
                    }
                }
            }

            // Draw all discrete outputs
            for (let i = 1; i <= previewFeatures.outputBusWidth.length; i++) {
                if (previewFeatures.outputBusWidth[i - 1] === 0) {
                    switch (gateDirection) {
                        case 0: line(mX + mW, mY + (mH * i) / heightOnGrid, mX + mW + 6, mY + (mH * i) / heightOnGrid); break;
                        case 1: line(mX + (mW * i) / heightOnGrid, mY + mH, mX + (mW * i) / heightOnGrid, mY + mH + 6); break;
                        case 2: line(mX - 6, mY + (mH * i) / heightOnGrid, mX, mY + (mH * i) / heightOnGrid); break;
                        case 3: line(mX + (mW * i) / heightOnGrid, mY - 6, mX + (mW * i) / heightOnGrid, mY); break;
                    }
                }
            }

            noStroke();
            textSize(12);

            drawnTops = 0;
            // Draw all bus inputs
            for (let i = 1; i <= previewFeatures.inputBusWidth.length; i++) {
                if (previewFeatures.inputIsTop[i - 1]) {
                    drawnTops++;
                }
                if (previewFeatures.inputBusWidth[i - 1] > 0) { // If this is a bus input
                    switch (gateDirection) {
                        case 0:
                            triangle(mX - 9, mY + GRIDSIZE * (i - drawnTops) - 8, mX - 1, mY + GRIDSIZE * (i - drawnTops), mX - 9, mY + GRIDSIZE * (i - drawnTops) + 8);
                            text(previewFeatures.inputBusWidth[i - 1], mX - 10, mY + GRIDSIZE * (i - drawnTops) + 15);
                            break;
                        case 1:
                            triangle(mX + GRIDSIZE * (i - drawnTops) - 8, mY - 9, mX + GRIDSIZE * (i - drawnTops), mY - 1, mX + GRIDSIZE * (i - drawnTops) + 8, mY - 9);
                            text(previewFeatures.inputBusWidth[i - 1], mX + GRIDSIZE * (i - drawnTops) + 15, mY - 10);
                            break;
                        case 2:
                            triangle(mX + mW + 10, mY + GRIDSIZE * (i - drawnTops) - 8, mX + mW + 2, mY + GRIDSIZE * (i - drawnTops), mX + mW + 10, mY + GRIDSIZE * (i - drawnTops) + 8);
                            text(previewFeatures.inputBusWidth[i - 1], mX + mW + 10, mY + GRIDSIZE * (i - drawnTops) + 15);
                            break;
                        case 3:
                            triangle(mX + GRIDSIZE * (i - drawnTops) - 8, mY + mH + 10, mX + GRIDSIZE * (i - drawnTops), mY + mH + 2, mX + GRIDSIZE * (i - drawnTops) + 8, mY + mH + 10);
                            text(previewFeatures.inputBusWidth[i - 1], mX + GRIDSIZE * (i - drawnTops) + 15, mY + mH + 10);
                            break;
                    }
                }
            }

            // Draw all bus outputs
            for (let i = 1; i <= previewFeatures.outputBusWidth.length; i++) {
                if (previewFeatures.outputBusWidth[i - 1] > 0) { // If this is a bus input
                    switch (gateDirection) {
                        case 0:
                            triangle(mX + mW + 10, mY + GRIDSIZE * i - 8, mX + mW + 2, mY + GRIDSIZE * i, mX + mW + 10, mY + GRIDSIZE * i + 8);
                            text(previewFeatures.outputBusWidth[i - 1], mX + mW + 10, mY + GRIDSIZE * i + 15);
                            break;
                        case 1:
                            triangle(mX + GRIDSIZE * i - 8, mY + mH + 10, mX + GRIDSIZE * i, mY + mH + 2, mX + GRIDSIZE * i + 8, mY + mH + 10);
                            text(previewFeatures.outputBusWidth[i - 1], mX + GRIDSIZE * i + 15, mY + mH + 10);
                            break;
                        case 2:
                            triangle(mX - 9, mY + GRIDSIZE * i - 8, mX - 1, mY + GRIDSIZE * i, mX - 9, mY + GRIDSIZE * i + 8);
                            text(previewFeatures.outputBusWidth[i - 1], mX - 10, mY + GRIDSIZE * i + 15);
                            break;
                        case 3:
                            triangle(mX + GRIDSIZE * i - 8, mY - 9, mX + GRIDSIZE * i, mY - 1, mX + GRIDSIZE * i + 8, mY - 9);
                            text(previewFeatures.outputBusWidth[i - 1], mX + GRIDSIZE * i + 15, mY - 10);
                            break;
                    }
                }
            }

            stroke(0);
            strokeWeight(2);

            drawnTops = 0;

            for (let i = 1; i <= previewFeatures.inputBusWidth.length; i++) {
                if (previewFeatures.inputIsTop[i - 1]) {
                    drawnTops++;
                }
                if (previewFeatures.inputLabels[i - 1] === '>') {
                    if (!previewFeatures.inputIsTop[i - 1]) {
                        switch (gateDirection) {
                            case 0:
                                line(mX + 14, mY + (i - drawnTops) * GRIDSIZE, mX, mY + (i - drawnTops) * GRIDSIZE - 6);
                                line(mX + 14, mY + (i - drawnTops) * GRIDSIZE, mX, mY + (i - drawnTops) * GRIDSIZE + 6);
                                break;
                            case 1:
                                line(mX + (i - drawnTops) * GRIDSIZE, mY + 14, mX + (i - drawnTops) * GRIDSIZE - 6, mY);
                                line(mX + (i - drawnTops) * GRIDSIZE, mY + 14, mX + (i - drawnTops) * GRIDSIZE + 6, mY);
                                break;
                            case 2:
                                line(mX + mW - 14, mY + (i - drawnTops) * GRIDSIZE, mX + mW, mY + (i - drawnTops) * GRIDSIZE - 6);
                                line(mX + mW - 14, mY + (i - drawnTops) * GRIDSIZE, mX + mW, mY + (i - drawnTops) * GRIDSIZE + 6);
                                break;
                            case 3:
                                line(mX + (i - drawnTops) * GRIDSIZE, mY + mH - 14, mX + (i - drawnTops) * GRIDSIZE - 6, mY + mH);
                                line(mX + (i - drawnTops) * GRIDSIZE, mY + mH - 14, mX + (i - drawnTops) * GRIDSIZE + 6, mY + mH);
                                break;
                        }
                    } else {
                        let topPlace = previewFeatures.inputIsTop.slice(0, i - 1).filter(Boolean).length + 1;
                        switch (gateDirection) {
                            case 0:
                                line(mX + topPlace * GRIDSIZE, mY + 14, mX + topPlace * GRIDSIZE - 6, mY);
                                line(mX + topPlace * GRIDSIZE, mY + 14, mX + topPlace * GRIDSIZE + 6, mY);
                                break;
                            case 1:
                                line(mX + mW - 14, mY + topPlace * GRIDSIZE, mX + mW, mY + topPlace * GRIDSIZE - 6);
                                line(mX + mW - 14, mY + topPlace * GRIDSIZE, mX + mW, mY + topPlace * GRIDSIZE + 6);
                                break;
                            case 2:
                                line(mX + topPlace * GRIDSIZE, mY + mH - 14, mX + topPlace * GRIDSIZE - 6, mY + mH);
                                line(mX + topPlace * GRIDSIZE, mY + mH - 14, mX + topPlace * GRIDSIZE + 6, mY + mH);
                                break;
                            case 3:
                                line(mX + 14, mY + topPlace * GRIDSIZE, mX, mY + topPlace * GRIDSIZE - 6);
                                line(mX + 14, mY + topPlace * GRIDSIZE, mX, mY + topPlace * GRIDSIZE + 6);
                                break;
                        }
                    }
                }
            }

            noStroke();
            textSize(10);

            if (Math.max(previewFeatures.inputBusWidth.length - tops, previewFeatures.outputBusWidth.length) % 2 !== 0
                && textWidth(previewFeatures.caption) >= mW - 30
                && Math.max(previewFeatures.inputBusWidth.length - tops, previewFeatures.outputBusWidth.length) >= 2
                && gateDirection % 2 === 0) {
                text(previewFeatures.caption, mX + mW / 2, mY + mH / 2 - 15);
            } else {
                text(previewFeatures.caption, mX + mW / 2, mY + mH / 2);
            }

            drawnTops = 0;

            for (let i = 1; i <= previewFeatures.inputBusWidth.length; i++) {
                if (previewFeatures.inputIsTop[i - 1]) {
                    drawnTops++;
                }
                if (previewFeatures.inputBusWidth[i - 1] > 0 && previewFeatures.inputLabels[i - 1] === '') { // If this is a bus input
                    switch (gateDirection) {
                        case 0:
                            text('[' + (previewFeatures.inputBusWidth[i - 1] - 1) + ':0]', mX + 15, mY + (i - drawnTops) * GRIDSIZE);
                            break;
                        case 1:
                            text('[' + (previewFeatures.inputBusWidth[i - 1] - 1) + ':0]', mX + (i - drawnTops) * GRIDSIZE, mY + 10);
                            break;
                        case 2:
                            text('[' + (previewFeatures.inputBusWidth[i - 1] - 1) + ':0]', mX + mW - 15, mY + (i - drawnTops) * GRIDSIZE);
                            break;
                        case 3:
                            text('[' + (previewFeatures.inputBusWidth[i - 1] - 1) + ':0]', mX + (i - drawnTops) * GRIDSIZE, mY + mH - 10);
                            break;
                        default:
                    }
                }
            }

            for (let i = 1; i <= previewFeatures.outputBusWidth.length; i++) {
                if (previewFeatures.outputBusWidth[i - 1] > 0 && previewFeatures.outputLabels[i - 1] === '') { // If this is a bus output
                    switch (gateDirection) {
                        case 0:
                            text('[' + (previewFeatures.outputBusWidth[i - 1] - 1) + ':0]', mX + mW - 15, mY + i * GRIDSIZE);
                            break;
                        case 1:
                            text('[' + (previewFeatures.outputBusWidth[i - 1] - 1) + ':0]', mX + i * GRIDSIZE, mY + mH - 10);
                            break;
                        case 2:
                            text('[' + (previewFeatures.outputBusWidth[i - 1] - 1) + ':0]', mX + 15, mY + i * GRIDSIZE);
                            break;
                        case 3:
                            text('[' + (previewFeatures.outputBusWidth[i - 1] - 1) + ':0]', mX + i * GRIDSIZE, mY + 10);
                            break;
                        default:
                    }
                }
            }

            textSize(14);

            drawnTops = 0;

            for (let i = 1; i <= previewFeatures.inputBusWidth.length; i++) {
                if (previewFeatures.inputIsTop[i - 1]) {
                    drawnTops++;
                }
                if (previewFeatures.inputLabels[i - 1] !== '' && previewFeatures.inputLabels[i - 1] !== '>') {
                    if (!previewFeatures.inputIsTop[i - 1]) {
                        switch (gateDirection) {
                            case 0: text(previewFeatures.inputLabels[i - 1], mX + 10, mY + (GRIDSIZE * (i - drawnTops))); break;
                            case 1: text(previewFeatures.inputLabels[i - 1], mX + (GRIDSIZE * (i - drawnTops)), mY + 10); break;
                            case 2: text(previewFeatures.inputLabels[i - 1], mX + mW - 10, mY + (GRIDSIZE * (i - drawnTops))); break;
                            case 3: text(previewFeatures.inputLabels[i - 1], mX + (GRIDSIZE * (i - drawnTops)), mY + mH - 10); break;
                        }
                    } else {
                        switch (gateDirection) {
                            case 0: text(previewFeatures.inputLabels[i - 1], mX + (GRIDSIZE * drawnTops), mY + 10); break;
                            case 1: text(previewFeatures.inputLabels[i - 1], mX + mW - 10, mY + (GRIDSIZE * drawnTops)); break;
                            case 2: text(previewFeatures.inputLabels[i - 1], mX + (GRIDSIZE * drawnTops), mY + mH - 10); break;
                            case 3: text(previewFeatures.inputLabels[i - 1], mX + 10, mY + (GRIDSIZE * drawnTops)); break;
                        }
                    }
                }
            }

            for (let i = 1; i <= previewFeatures.outputBusWidth.length; i++) {
                if (previewFeatures.outputLabels[i - 1] !== '') {
                    switch (gateDirection) {
                        case 0: text(previewFeatures.outputLabels[i - 1], mX + mW - 10, mY + (GRIDSIZE * i)); break;
                        case 1: text(previewFeatures.outputLabels[i - 1], mX + (GRIDSIZE * i), mY + mH - 10); break;
                        case 2: text(previewFeatures.outputLabels[i - 1], mX + 10, mY + (GRIDSIZE * i)); break;
                        case 3: text(previewFeatures.outputLabels[i - 1], mX + (GRIDSIZE * i), mY + 10); break;
                    }
                }
            }

            let gateWidth = 2 * GRIDSIZE;
            let gateHeight = (previewFeatures.inputBusWidth.length + 1) * GRIDSIZE;
            if (gateDirection % 2 !== 0) {
                gateWidth = (previewFeatures.inputBusWidth.length + 1) * GRIDSIZE;
                gateHeight = 2 * GRIDSIZE;
            }

            textFont('Consolas');

            if (previewFeatures.type === 'and') {
                textSize(40);
                text('&', mX + gateWidth / 2, mY + gateHeight / 2 + 2);
            } else if (previewFeatures.type === 'or') {
                textSize(40);
                text('≥1', mX + gateWidth / 2, mY + gateHeight / 2 + 2);
            } else if (previewFeatures.type === 'xor') {
                textSize(40);
                text('=1', mX + gateWidth / 2, mY + gateHeight / 2 + 2);
            }

            let vertical_offset = 0;
            if (tops === 0) {
                vertical_offset = GRIDSIZE / 2;
            }

            textAlign(LEFT, BOTTOM);

            if (previewFeatures.inputInverter) {
                switch (gateDirection) {
                    case 0: text('↺', mX + 5, mY + mH - vertical_offset - 3); break;
                    case 1: text('↺', mX + mW - vertical_offset - 16, mY + 18); break;
                    case 2: text('↺', mX + mW - 16, mY + mH - vertical_offset - 3); break;
                    case 3: text('↺', mX + mW - vertical_offset - 16, mY + mH - 3); break;
                    default:
                }
            }

            if (previewFeatures.outputInverter) {
                switch (gateDirection) {
                    case 0: text('↺', mX + mW - 16, mY + mH - vertical_offset - 3); break;
                    case 1: text('↺', mX + mW - vertical_offset - 16, mY + mH - 3); break;
                    case 2: text('↺', mX + 5, mY + mH - vertical_offset - 3); break;
                    case 3: text('↺', mX + mW - vertical_offset - 16, mY + 18); break;
                    default:
                }
            }

            break;
        case 'switch':
        case 'button':
        case 'clock':
            mX = Math.round((mouseX / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE - GRIDSIZE / 2;
            mY = Math.round((mouseY / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE - GRIDSIZE / 2;
            stroke(0);
            strokeWeight(3);
            fill(50);
            // Draw the rectangle that represents the input
            rect(mX, mY, GRIDSIZE, GRIDSIZE);
            noStroke();
            fill(LARED, LAGREEN, LABLUE);
            triangle(mX + 2, mY + 2, mX + GRIDSIZE - 2, mY + 2, mX + 2, mY + GRIDSIZE - 2);
            noFill();
            stroke(0);
            rect(mX, mY, GRIDSIZE, GRIDSIZE);

            if (previewFeatures.type === 'button') {
                fill(0);
                rect(mX + 10, mY + 10, GRIDSIZE / 3, GRIDSIZE / 3);
            }

            if (previewFeatures.type === 'clock') {
                stroke(0);
                strokeWeight(3);
                line(mX + 15, mY + 6, mX + 15, mY + 15);
                line(mX + 15, mY + 15, mX + 22, mY + 20);
            }
            break;
        case 'output':
            mX = Math.round((mouseX / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE;
            mY = Math.round((mouseY / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE;
            stroke(0);
            strokeWeight(3);
            fill(50);
            ellipse(mX, mY, GRIDSIZE, GRIDSIZE);
            fill(LARED, LAGREEN, LABLUE);
            arc(mX, mY, GRIDSIZE, GRIDSIZE, HALF_PI + QUARTER_PI, PI + HALF_PI + QUARTER_PI, OPEN);
            break;
        case 'output':
            break;
        case 'label':
            mX = Math.round((mouseX / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE;
            mY = Math.round((mouseY / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE;
            textFont('Gudea');
            textSize(20);
            textAlign(LEFT, TOP);
            strokeWeight(3);
            noStroke();
            fill(150, 200);
            rect(mX - 15, mY - 15, GRIDSIZE * 4 + GRIDSIZE / 2, GRIDSIZE);
            noStroke();
            fill(50);
            rect(mX, mY - 15, 3, 30);
            fill(0);
            text('New Label', mX + 15, mY - 9, GRIDSIZE * 5, GRIDSIZE);
            break;
        case 'display':
            textFont('PT Mono');
            mX = Math.round((mouseX / transform.zoom - transform.dx - GRIDSIZE / 2) / GRIDSIZE) * GRIDSIZE;
            mY = Math.round((mouseY / transform.zoom - transform.dy - GRIDSIZE / 2) / GRIDSIZE) * GRIDSIZE;
            stroke(0);
            fill(255);
            strokeWeight(3);

            if (previewFeatures.inputBusWidth[0] === 0) {
                rect(mX + GRIDSIZE / 2, mY, GRIDSIZE * Math.max(Math.max((sevenSegmentBits + 1), Math.pow(2, sevenSegmentBits).toString().length * 2), 3) - GRIDSIZE, GRIDSIZE * 3); // Draw body
            } else {
                rect(mX + GRIDSIZE / 2, mY, GRIDSIZE * Math.max(Math.pow(2, sevenSegmentBits).toString().length * 2 + 1, 3) - GRIDSIZE, GRIDSIZE * 3); // Draw body
            }
            noStroke();
            textSize(80);
            textAlign(CENTER, CENTER);
            fill(0);
            let txt = '';
            for (let i = 0; i < Math.pow(2, sevenSegmentBits).toString().length; i++) {
                txt += '0';
            }
            if (previewFeatures.inputBusWidth[0] > 0) {
                text(txt, mX + GRIDSIZE * Math.max(Math.pow(2, sevenSegmentBits).toString().length * 2 + 1, 3) / 2, mY + (GRIDSIZE * 3) / 2 - 3);
            } else {
                text(txt, mX + GRIDSIZE * Math.max(Math.max((sevenSegmentBits + 1), Math.pow(2, sevenSegmentBits).toString().length * 2), 3) / 2, mY + (GRIDSIZE * 3) / 2 - 3);
            }

            if (previewFeatures.inputBusWidth[0] === 0) {
                // Draw inputs
                for (let i = 1; i <= sevenSegmentBits; i++) {
                    // Draw inputs
                    stroke(0);
                    strokeWeight(3);

                    x1 = mX + (GRIDSIZE * i);
                    y1 = mY + GRIDSIZE * 3;
                    x2 = mX + (GRIDSIZE * i);
                    y2 = mY + GRIDSIZE * 3 + 6;
                    line(x1, y1, x2, y2);

                    noStroke();
                    textSize(14);
                    textFont('Arial');

                    if (sevenSegmentBits - i < 10) {
                        text('2' + superscripts[sevenSegmentBits - i], x1, y1 - 10);
                    } else {
                        text('2' + superscripts[Math.floor((sevenSegmentBits - i) / 10)] + superscripts[sevenSegmentBits - i - Math.floor((sevenSegmentBits - i) / 10) * 10], x1, y1 - 10);
                    }
                }
            } else {
                fill(0);
                noStroke();
                textFont('Arial');

                triangle(mX + GRIDSIZE - 8, mY + GRIDSIZE * 3 + 10, mX + GRIDSIZE, mY + GRIDSIZE * 3 + 2, mX + GRIDSIZE + 8, mY + GRIDSIZE * 3 + 10);
                textSize(12);
                text(sevenSegmentBits, mX + GRIDSIZE + 15, mY + GRIDSIZE * 3 + 10);

                textSize(10);

                text('[' + (sevenSegmentBits - 1) + ':0]', mX + GRIDSIZE, mY + GRIDSIZE * 3 - 10);

                textSize(14);
                textAlign(LEFT, BOTTOM);
                text('↺', mX + GRIDSIZE * Math.max(Math.pow(2, sevenSegmentBits).toString().length * 2 + 1, 3) - GRIDSIZE / 2 - 16, mY + GRIDSIZE * 3 - 3);
            }
            break;
        default:
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
    Initializes the canvas that displays the module peview in the module workspace
*/
function initModuleCanvas() {
    let moduleSketch = function (p) {
        p.setup = function () {
            p.createCanvas(200, 200);
        };

        p.showNoOutputs = function () {
            p.background(150);

            for (let i = 0; i < 7; i++) {
                p.stroke(140);
                p.strokeWeight(3);
                p.line(0, i * 30, 200, i * 30);
            }

            for (let i = 0; i < 7; i++) {
                p.stroke(140);
                p.strokeWeight(3);
                p.line(i * 30, 0, i * 30, 200);
            }
        };

        p.showEmptyGrid = function () {
            p.background(150);

            for (let i = 0; i < 7; i++) {
                p.stroke(140);
                p.strokeWeight(3);
                p.line(0, i * 30, 200, i * 30);
            }

            for (let i = 0; i < 7; i++) {
                p.stroke(140);
                p.strokeWeight(3);
                p.line(i * 30, 0, i * 30, 200);
            }
        };

        p.showImportPreview = function (item, x, y) {
            let x1, x2, y1, y2;
            let w = Math.max((item.tops.length - 1), 0) * 30 + 60;
            let h = (Math.max(item.inputs - item.tops.length, item.outputs) + 1) * 30;
            let scaling = 1;
            if (h >= 150) {
                scaling = 150 / h;
                p.scale(scaling);
            }

            p.background(150);

            for (let i = 0; i < 7 / scaling; i++) {
                p.stroke(140);
                p.strokeWeight(3);
                p.line(0, i * 30, 200 / scaling, i * 30);
            }

            for (let i = 0; i < 7 / scaling; i++) {
                p.stroke(140);
                p.strokeWeight(3);
                p.line(i * 30, 0, i * 30, 200 / scaling);
            }

            x += Math.round(((200 - w * scaling) / 2) / (30 * scaling)) * 30 * scaling;
            y += Math.round(((200 - h * scaling) / 2) / (30 * scaling)) * 30 * scaling;
            p.stroke(0);
            p.strokeWeight(3);
            p.fill(255);
            p.textFont('Arial');

            // Draw the body
            if (item.tops.length === 0) {
                p.rect(x / scaling, (y / scaling) + GRIDSIZE / 2, w, h - GRIDSIZE);
            } else {
                p.rect(x / scaling, y / scaling, w, h);
            }

            p.noStroke();
            p.textAlign(CENTER, CENTER);
            p.fill(0);
            p.textSize(10);
            if (Math.max(item.inputs - item.tops.length, item.outputs) % 2 !== 0 && p.textWidth(item.caption) >= w - 30 && Math.max(item.inputs - item.tops.length, item.outputs) >= 2) {
                p.text(item.caption, (x / scaling) + w / 2, (y / scaling) + h / 2 - 15);
            } else {
                p.text(item.caption, (x / scaling) + w / 2, (y / scaling) + h / 2);
            }
            p.textSize(14);
            let tops = 0;
            for (let i = 1; i <= item.inputs; i++) {
                p.stroke(0);
                p.strokeWeight(2);
                if (item.tops.includes(i - 1)) {
                    tops++;
                    x1 = (x / scaling) + (30 * tops);
                    y1 = (y / scaling) - 6;
                    x2 = (x / scaling) + (30 * tops);
                    y2 = (y / scaling);
                    if (item.inputLabels[i - 1] === ">") {
                        p.line(x1, y2 + 14, x1 - 6, y2);
                        p.line(x1, y2 + 14, x1 + 6, y2);
                    } else {
                        p.noStroke();
                        p.text(item.inputLabels[i - 1], x1, y2 + 10);
                    }
                } else {
                    x1 = (x / scaling) - 6;
                    y1 = (y / scaling) + (30 * (i - tops));
                    x2 = (x / scaling);
                    y2 = (y / scaling) + (30 * (i - tops));
                    if (item.inputLabels[i - 1] === ">") {
                        p.line(x2 + 14, y1, x2, y1 - 6);
                        p.line(x2 + 14, y1, x2, y1 + 6);
                    } else {
                        p.noStroke();
                        p.text(item.inputLabels[i - 1], x2 + 10, y1);
                    }
                }
                p.stroke(0);
                p.strokeWeight(3);
                p.line(x1, y1, x2, y2);
            }

            for (let i = 1; i <= item.outputs; i++) {
                p.stroke(0);
                p.strokeWeight(3);
                x1 = (x / scaling) + w;
                y1 = (y / scaling) + (30 * i);
                x2 = (x / scaling) + w + 6;
                y2 = (y / scaling) + (30 * i);
                p.noStroke();
                p.text(item.outputLabels[i - 1], x1 - 10, y1);
                p.stroke(0);
                p.strokeWeight(3);
                p.line(x1, y1, x2, y2);
            }

            p.scale(1 / scaling);
            p.textAlign(LEFT, TOP);
        };
    };

    let node = document.createElement('div');
    node.setAttribute('id', 'module-canvas');
    modulep5 = new p5(moduleSketch, node);
    window.document.getElementById('module-container').appendChild(node);
}