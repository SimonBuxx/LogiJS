function CustomDialog() {
    this.isVisible = false;
    this.domElement = document.getElementById('custom-dialog');

    this.setVisible = function (visible) {
        this.isVisible = visible;
    };

    this.display = function () {
        this.isVisible = true;
        this.domElement.style.display = 'block';
        if (importSketchData.looks.length > 0) {
            PWp5.showImportPreview(importSketchData.looks[0], 0, 0);
        } else {
            PWp5.showEmptyGrid();
        }
    };

    this.hide = function () {
        this.isVisible = false;
        this.domElement.style.display = 'none';

        if (controlMode === 'modify') {
            setUnactive();
            hideAllOptions();
            editButton.classList.add('active');
        }

        justClosedMenu = true;
    };

    this.elementClicked = function (pos) {
        if (pos >= importSketchData.sketches.length || importSketchData.looks[pos].outputs === 0) {
            return; // If the place should be greater than the number of available modules or the module has no outputs, return.
        }
        setUnactive();
        hideAllOptions();
        customButton.classList.add('active');
        setPreviewElement(true, importSketchData.looks[pos]); // Show a preview of the module at the users mouse position
        importCustom(importSketchData.sketches[pos] + '.json'); // Import the module on mouse click
    };

    this.elementHovered = function (pos) {
        if (importSketchData.looks.length <= pos) {
            return;
        }
        PWp5.clear();
        if (importSketchData.looks[pos].outputs > 0) {
            PWp5.showImportPreview(importSketchData.looks[pos], 0, 0);
        } else {
            document.getElementsByClassName('preview-span')[pos].innerHTML = '<span class="no-outputs"><i class="fa fa-times-circle"></i> This Sketch has no Outputs</span>';
            PWp5.showNoOutputs();
        }
    };
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