// File: previews.js
// Contains functions to display the preview objects

function setPreviewElement(isCustom, customData, type = 'custom') {
    previewData = {
        isCustom: isCustom,
        customData: customData,
        type: type
    };
}

function showElementPreview() {
    if (wireMode === 'preview' || loading) {
        return;
    }
    let mx = Math.round((mouseX / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE;
    let my = Math.round((mouseY / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE;
    let x1, x2, y1, y2;
    if (previewData.isCustom) {
        mx = Math.round((mouseX / transform.zoom - transform.dx - GRIDSIZE / 2) / GRIDSIZE) * GRIDSIZE;
        my = Math.round((mouseY / transform.zoom - transform.dy - GRIDSIZE / 2) / GRIDSIZE) * GRIDSIZE;
        let item = previewData.customData;
        let w, h;

        if (gateDirection % 2 === 0) {
            w = Math.max((item.tops.length - 1), 0) * 30 + 60;
            h = (Math.max(item.inputs - item.tops.length, item.outputs) + 1) * 30;
        } else {
            h = Math.max((item.tops.length - 1), 0) * 30 + 60;
            w = (Math.max(item.inputs - item.tops.length, item.outputs) + 1) * 30;
        }

        let gridHeight = (Math.max(item.inputs - item.tops.length, item.outputs) + 1);

        stroke(0);
        strokeWeight(3);
        fill(255);
        textFont('Arial');

        // Draw the body
        if (item.tops.length === 0) {
            if (gateDirection % 2 === 0) {
                rect(mx, my + GRIDSIZE / 2, w, h - GRIDSIZE);
            } else {
                rect(mx + GRIDSIZE / 2, my, w - GRIDSIZE, h);
            }
        } else {
            rect(mx, my, w, h);
        }

        noStroke();
        textAlign(CENTER, CENTER);
        fill(0);
        textSize(10);
        if (Math.max(item.inputs - item.tops.length, item.outputs) % 2 !== 0 && textWidth(item.caption) >= w - 30 && Math.max(item.inputs - item.tops.length, item.outputs) >= 2 && gateDirection % 2 === 0) {
            text(item.caption, mx + w / 2, my + h / 2 - 15);
        } else {
            text(item.caption, mx + w / 2, my + h / 2);
        }
        textSize(14);

        let tops = 0;
        // Draw inputs
        for (let i = 1; i <= item.inputs; i++) {
            stroke(LRED, LGREEN, LBLUE);
            strokeWeight(3);

            if (!item.tops.includes(i - 1)) {
                switch (gateDirection) {
                    case 0:
                        x1 = mx - 6;
                        y1 = my + (h * (i - tops)) / gridHeight;
                        x2 = mx;
                        y2 = my + (h * (i - tops)) / gridHeight;
                        break;
                    case 1:
                        x1 = mx + (w * (i - tops)) / gridHeight;
                        y1 = my - 6;
                        x2 = mx + (w * (i - tops)) / gridHeight;
                        y2 = my;
                        break;
                    case 2:
                        x1 = mx + w;
                        y1 = my + (h * (i - tops)) / gridHeight;
                        x2 = mx + w + 6;
                        y2 = my + (h * (i - tops)) / gridHeight;
                        break;
                    case 3:
                        x1 = mx + (w * (i - tops)) / gridHeight;
                        y1 = my + h;
                        x2 = mx + (w * (i - tops)) / gridHeight;
                        y2 = my + h + 6;
                        break;
                    default:
                        console.log('Gate direction doesn\'t exist!');
                }
            } else {
                tops++;
                switch (gateDirection) {
                    case 0:
                        x1 = mx + (h * tops) / gridHeight;
                        y1 = my - 6;
                        x2 = mx + (h * tops) / gridHeight;
                        y2 = my;
                        break;
                    case 1:
                        x1 = mx + w + 6;
                        y1 = my + (w * tops) / gridHeight;
                        x2 = mx + w;
                        y2 = my + (w * tops) / gridHeight;
                        break;
                    case 2:
                        x1 = mx + (h * tops) / gridHeight;
                        y1 = my + h;
                        x2 = mx + (h * tops) / gridHeight;
                        y2 = my + h + 6;
                        break;
                    case 3:
                        x1 = mx;
                        y1 = my + (w * tops) / gridHeight;
                        x2 = mx - 6;
                        y2 = my + (w * tops) / gridHeight;
                        break;
                    default:
                        console.log('Gate direction doesn\'t exist!');
                }
            }
            line(x1, y1, x2, y2);

            fill(0);

            if (item.inputLabels[i - 1] === ">") {
                stroke(0);
                strokeWeight(2);
                if (!item.tops.includes(i - 1)) {
                    switch (gateDirection) {
                        case 0:
                            line(x2 + 14, y1, x2, y1 - 6);
                            line(x2 + 14, y1, x2, y1 + 6);
                            break;
                        case 1:
                            line(x1, y2 + 14, x1 - 6, y2);
                            line(x1, y2 + 14, x1 + 6, y2);
                            break;
                        case 2:
                            line(x1 - 14, y1, x1, y1 - 6);
                            line(x1 - 14, y1, x1, y1 + 6);
                            break;
                        case 3:
                            line(x1, y1 - 14, x1 - 6, y1);
                            line(x1, y1 - 14, x1 + 6, y1);
                            break;
                    }
                } else {
                    switch (gateDirection) {
                        case 0:
                            line(x1, y2 + 14, x1 - 6, y2);
                            line(x1, y2 + 14, x1 + 6, y2);
                            break;
                        case 1:
                            line(x2 - 14, y1, x2, y1 - 6);
                            line(x2 - 14, y1, x2, y1 + 6);
                            break;
                        case 2:
                            line(x1, y1 - 14, x1 - 6, y1);
                            line(x1, y1 - 14, x1 + 6, y1);
                            break;
                        case 3:
                            line(x1 + 14, y1, x1, y1 - 6);
                            line(x1 + 14, y1, x1, y1 + 6);
                            break;
                    }
                }
            } else if (item.inputLabels[i - 1] !== '') {
                noStroke();
                textSize(14);
                if (!item.tops.includes(i - 1)) {
                    switch (gateDirection) {
                        case 0: text(item.inputLabels[i - 1], x2 + 10, y1); break;
                        case 1: text(item.inputLabels[i - 1], x1, y2 + 10); break;
                        case 2: text(item.inputLabels[i - 1], x1 - 10, y1); break;
                        case 3: text(item.inputLabels[i - 1], x1, y1 - 10); break;
                    }
                } else {
                    switch (gateDirection) {
                        case 0: text(item.inputLabels[i - 1], x1, y2 + 10); break;
                        case 1: text(item.inputLabels[i - 1], x2 - 10, y1); break;
                        case 2: text(item.inputLabels[i - 1], x1, y1 - 10); break;
                        case 3: text(item.inputLabels[i - 1], x1 + 10, y1); break;
                    }
                }
            }
        }

        for (let i = 1; i <= item.outputs; i++) {
            stroke(LRED, LGREEN, LBLUE);
            strokeWeight(3);

            switch (gateDirection) {
                case 0:
                    x1 = mx + w;
                    y1 = my + (h * i) / (Math.max(item.inputs - item.tops.length, item.outputs) + 1);
                    x2 = mx + w + 6;
                    y2 = my + (h * i) / (Math.max(item.inputs - item.tops.length, item.outputs) + 1);
                    break;
                case 1:
                    x1 = mx + (w * i) / (Math.max(item.inputs - item.tops.length, item.outputs) + 1);
                    y1 = my + h;
                    x2 = mx + (w * i) / (Math.max(item.inputs - item.tops.length, item.outputs) + 1);
                    y2 = my + h + 6;
                    break;
                case 2:
                    x1 = mx - 6;
                    y1 = my + (h * i) / (Math.max(item.inputs - item.tops.length, item.outputs) + 1);
                    x2 = mx;
                    y2 = my + (h * i) / (Math.max(item.inputs - item.tops.length, item.outputs) + 1);
                    break;
                case 3:
                    x1 = mx + (w * i) / (Math.max(item.inputs - item.tops.length, item.outputs) + 1);
                    y1 = my;
                    x2 = mx + (w * i) / (Math.max(item.inputs - item.tops.length, item.outputs) + 1);
                    y2 = my - 6;
                    break;
                default:
                    console.log('Gate direction doesn\'t exist!');
            }
            line(x1, y1, x2, y2);

            fill(0);
            noStroke();
            textSize(14);
            if (item.outputLabels[i - 1] !== "") {
                switch (gateDirection) {
                    case 0: text(item.outputLabels[i - 1], x1 - 10, y1); break;
                    case 1: text(item.outputLabels[i - 1], x1, y1 - 10); break;
                    case 2: text(item.outputLabels[i - 1], x1 + 16, y1); break;
                    case 3: text(item.outputLabels[i - 1], x1, y1 + 10); break;
                }
            }
        }
        textAlign(LEFT, TOP);
    } else {
        switch (previewData.type) {
            case 'and':
            case 'or':
            case 'xor':
                mx = Math.round((mouseX / transform.zoom - transform.dx - GRIDSIZE / 2) / GRIDSIZE) * GRIDSIZE;
                my = Math.round((mouseY / transform.zoom - transform.dy - GRIDSIZE / 2) / GRIDSIZE) * GRIDSIZE;
                let gateWidth = 0;
                let gateHeight = 0;

                stroke(0);
                fill(255);
                strokeWeight(3);

                if (gateDirection % 2 === 0) {
                    gateWidth = 2 * GRIDSIZE;
                    gateHeight = (gateInputCount + 1) * GRIDSIZE;
                    rect(mx, my + GRIDSIZE / 2, gateWidth, gateHeight - GRIDSIZE); // Draw body
                } else {
                    gateWidth = (gateInputCount + 1) * GRIDSIZE;
                    gateHeight = 2 * GRIDSIZE;
                    rect(mx + GRIDSIZE / 2, my, gateWidth - GRIDSIZE, gateHeight);
                }

                noStroke();
                textSize(40);
                textAlign(CENTER, CENTER);
                fill(0);
                if (previewData.type === 'and') {
                    text('&', mx + gateWidth / 2, my + gateHeight / 2 + 2);
                } else if (previewData.type === 'or') {
                    text('≥1', mx + gateWidth / 2, my + gateHeight / 2 + 2);
                } else if (previewData.type === 'xor') {
                    text('=1', mx + gateWidth / 2, my + gateHeight / 2 + 2);
                }

                // Draw inputs
                for (let i = 1; i <= gateInputCount; i++) {
                    // Draw inputs
                    stroke(0);
                    strokeWeight(3);

                    switch (gateDirection) {
                        case 0:
                            x1 = mx - gateWidth / 10;
                            y1 = my + (gateHeight * i) / (gateInputCount + 1);
                            x2 = mx;
                            y2 = my + (gateHeight * i) / (gateInputCount + 1);
                            break;
                        case 1:
                            x1 = mx + (gateWidth * i) / (gateInputCount + 1);
                            y1 = my - gateHeight / 10;
                            x2 = mx + (gateWidth * i) / (gateInputCount + 1);
                            y2 = my;
                            break;
                        case 2:
                            x1 = mx + gateWidth;
                            y1 = my + (gateHeight * i) / (gateInputCount + 1);
                            x2 = mx + gateWidth + gateWidth / 10;
                            y2 = my + (gateHeight * i) / (gateInputCount + 1);
                            break;
                        case 3:
                            x1 = mx + (gateWidth * i) / (gateInputCount + 1);
                            y1 = my + gateHeight;
                            x2 = mx + (gateWidth * i) / (gateInputCount + 1);
                            y2 = my + gateHeight + gateHeight / 10;
                            break;
                        default:
                            console.log('Gate direction doesn\'t exist!');
                    }
                    line(x1, y1, x2, y2);
                }
                stroke(0);
                strokeWeight(3);

                switch (gateDirection) {
                    case 0:
                        x1 = mx + gateWidth;
                        y1 = my + gateHeight / (gateInputCount + 1);
                        x2 = mx + gateWidth + gateWidth / 10;
                        y2 = my + gateHeight / (gateInputCount + 1);
                        break;
                    case 1:
                        x1 = mx + gateWidth / (gateInputCount + 1);
                        y1 = my + gateHeight;
                        x2 = mx + gateWidth / (gateInputCount + 1);
                        y2 = my + gateHeight + gateHeight / 10;
                        break;
                    case 2:
                        x1 = mx - gateWidth / 10;
                        y1 = my + gateHeight / (gateInputCount + 1);
                        x2 = mx;
                        y2 = my + gateHeight / (gateInputCount + 1);
                        break;
                    case 3:
                        x1 = mx + gateWidth / (gateInputCount + 1);
                        y1 = my;
                        x2 = mx + gateWidth / (gateInputCount + 1);
                        y2 = my - gateHeight / 10;
                        break;
                    default:
                        console.log('Gate direction doesn\'t exist!');
                }
                line(x1, y1, x2, y2);
                break;
            case 'switch':
            case 'button':
            case 'clock':
                mx = Math.round((mouseX / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE - GRIDSIZE / 2;
                my = Math.round((mouseY / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE - GRIDSIZE / 2;
                stroke(0);
                strokeWeight(3);
                fill(50);
                // Draw the rectangle that represents the input
                rect(mx, my, GRIDSIZE, GRIDSIZE);
                noStroke();
                fill(LARED, LAGREEN, LABLUE);
                triangle(mx + 2, my + 2, mx + GRIDSIZE - 2, my + 2, mx + 2, my + GRIDSIZE - 2);
                noFill();
                stroke(0);
                rect(mx, my, GRIDSIZE, GRIDSIZE);

                if (previewData.type === 'button') {
                    fill(0);
                    rect(mx + 10, my + 10, GRIDSIZE / 3, GRIDSIZE / 3);
                }

                if (previewData.type === 'clock') {
                    stroke(0);
                    strokeWeight(3);
                    line(mx + 15, my + 6, mx + 15, my + 15);
                    line(mx + 15, my + 15, mx + 22, my + 20);
                }
                break;
            case 'output':
                stroke(0);
                strokeWeight(3);
                fill(50);
                ellipse(mx, my, GRIDSIZE, GRIDSIZE);
                fill(LARED, LAGREEN, LABLUE);
                arc(mx, my, GRIDSIZE, GRIDSIZE, HALF_PI + QUARTER_PI, PI + HALF_PI + QUARTER_PI, OPEN);
                break;
            case '7-segment':
                textFont('PT Mono');
                mx = Math.round((mouseX / transform.zoom - transform.dx - GRIDSIZE / 2) / GRIDSIZE) * GRIDSIZE;
                my = Math.round((mouseY / transform.zoom - transform.dy - GRIDSIZE / 2) / GRIDSIZE) * GRIDSIZE;
                stroke(0);
                fill(255);
                strokeWeight(3);

                rect(mx + GRIDSIZE / 2, my, GRIDSIZE * Math.max(Math.max((sevenSegmentBits + 1), Math.pow(2, sevenSegmentBits).toString().length * 2), 3) - GRIDSIZE, GRIDSIZE * 3); // Draw body

                noStroke();
                textSize(80);
                textAlign(CENTER, CENTER);
                fill(0);
                let txt = '';
                for (let i = 0; i < Math.pow(2, sevenSegmentBits).toString().length; i++) {
                    txt += '0';
                }
                text(txt, mx + GRIDSIZE * Math.max(Math.max((sevenSegmentBits + 1), Math.pow(2, sevenSegmentBits).toString().length * 2), 3) / 2, my + (GRIDSIZE * 3) / 2 - 3);

                // Draw inputs
                for (let i = 1; i <= sevenSegmentBits; i++) {
                    // Draw inputs
                    stroke(0);
                    strokeWeight(3);

                    x1 = mx + (GRIDSIZE * i);
                    y1 = my + GRIDSIZE * 3;
                    x2 = mx + (GRIDSIZE * i);
                    y2 = my + GRIDSIZE * 3 + 6;
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
                break;
            case 'label':
                textFont('Gudea');
                textSize(20);
                textAlign(LEFT, TOP);
                strokeWeight(3);
                noStroke();
                fill(150, 200);
                rect(mx - 15, my - 15, GRIDSIZE * 5, GRIDSIZE);
                noStroke();
                fill(50);
                rect(mx, my - 15, 3, 30);
                fill(0);
                text('New Label', mx + 15, my - 9, GRIDSIZE * 5, GRIDSIZE);
                break;
        }
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

function initPreviewCanvas() {
    let pwSketch = function (p) {
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

            p.textFont('ArcaMajora3');
            p.noStroke();
            p.fill(200, 50, 50);
            p.textSize(18);
            p.text('No sketch selected.', 18, 107);
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
    node.setAttribute('id', 'preview-canvas');
    PWp5 = new p5(pwSketch, node);
    window.document.getElementById('canvas-container').appendChild(node);
}

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