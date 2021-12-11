// File: segmentDisplay.js

function SegmentDisplay(x, y, bits, useBusInput = false) {
    this.x = x; // X-Position
    this.y = y; // Y-Position
    this.inputCount = bits;
    this.digits = Math.pow(2, bits).toString().length;

    this.useBusInput = useBusInput;

    if (this.useBusInput) {
        this.w = GRIDSIZE * Math.max(this.digits * 2 + 1, 3);
    } else {
        this.w = GRIDSIZE * Math.max(Math.max((bits + 1), this.digits * 2), 3);
    }

    this.h = GRIDSIZE * 3; // Height of the display
    this.marked = false;
    this.lowColor = color(50, 50, 50); // dark grey color
    this.highColor = color(HRED, HGREEN, HBLUE); // Color for high inputs (red)

    this.gClickBox = new ClickBox(this.x + GRIDSIZE / 2, this.y, this.w - GRIDSIZE, this.h, transform);
    this.inputClickBoxes = [];
    this.busInputClickBox = new ClickBox(0, 0, IOCBSIZE, IOCBSIZE, transform);
    this.invertClickBox = new ClickBox(0, 0, IOCBSIZE, IOCBSIZE, transform);

    this.inputs = Array(bits).fill(false);     // Vector of the input states
    this.ipset = Array(bits).fill(false);      // set to true if the input was set
    this.busInputSet = false;
    this.inputsInv = Array(bits).fill(false);  // true, if input is inverted

    this.value = 0; // Decimal input value

    this.busInverted = false;

    this.id = 's' + Date.now() + Math.random();

    for (let i = 0; i < this.inputCount; i++) {
        this.inputClickBoxes.push(new ClickBox(0, 0, IOCBSIZE, IOCBSIZE, transform)); // Create new clickBoxes for every input
    }

    this.setCoordinates(this.x, this.y);
    this.updateClickBoxes();
}

SegmentDisplay.prototype.setInvertions = function (ipinv) {
    this.inputsInv = ipinv;
};

SegmentDisplay.prototype.getData = function () {
    let data = {};
    data.x = JSON.stringify(this.x);
    data.y = JSON.stringify(this.y);
    data.inputCount = JSON.stringify(this.inputCount);
    data.inputsInv = JSON.stringify(this.inputsInv);
    data.busversion = JSON.stringify(this.useBusInput);
    return data;
};

/*
    Sets the coordinates of the display, rounded to grid size
*/
SegmentDisplay.prototype.setCoordinates = function (nx, ny) {
    this.x = Math.round((nx - GRIDSIZE / 2) / GRIDSIZE) * GRIDSIZE;
    this.y = Math.round((ny - GRIDSIZE / 2) / GRIDSIZE) * GRIDSIZE;
};

SegmentDisplay.prototype.alterPosition = function (x1, y1) {
    this.x += x1;
    this.y += y1;
    this.updateClickBoxes();
};

/*
    Sets input #i to state s
*/
SegmentDisplay.prototype.setInput = function (i = 0, s) {
    if (this.useBusInput) {
        this.inputs = s.slice(s.length - this.inputCount); // Set the input vector to the given array

        if (s.length < this.inputCount) { // If the array is shorter than the input vector, fill with false
            for (let i = 0; i < this.inputCount - s.length; i++) {
                this.inputs.splice(0, 0, false);
            }
        }

        this.busInputSet = true; // Mark that the state of this input is now well defined
    } else {
        if (i < this.inputCount) {
            this.inputs[i] = s; // Set state of this input
            this.ipset[i] = true; // Mark that the state of this input is now well defined

            if (this.inputsInv[i]) {
                this.inputs[i] = !this.inputs[i];
            }
        }
    }
};

/*
    Inverts the given input
*/
SegmentDisplay.prototype.invertInput = function (input) {
    if (!this.useBusInput) {
        this.inputsInv[input] = !this.inputsInv[input]; // Invert isInverted-State
    } else {
        console.log('Cannot invert the input of a bus display!');
    }
};

SegmentDisplay.prototype.shutdown = function () {
    for (let i = 0; i < this.inputCount; i++) {
        this.inputs[i] = false;
        this.ipset[i] = false;
    }
    this.value = 0;
    this.busInputSet = false;
};

/*
    Updates the clickBoxes (once after creation)
*/
SegmentDisplay.prototype.updateClickBoxes = function () {
    // Update input clickBoxes
    for (let i = 0; i < this.inputClickBoxes.length; i++) {
        this.inputClickBoxes[i].updatePosition(this.x + GRIDSIZE * (i + 1), this.y + this.h);
        this.inputClickBoxes[i].setTransform(transform);
    }

    this.busInputClickBox.updatePosition(this.x + GRIDSIZE, this.y + this.h);
    this.busInputClickBox.setTransform(transform);

    this.invertClickBox.updatePosition(this.x + this.w - GRIDSIZE / 2 - 10, this.y + this.h - 10);

    this.gClickBox.updatePosition(this.x + this.w / 2, this.y + this.h / 2);
    this.gClickBox.updateSize(this.w - GRIDSIZE, this.h);
    this.gClickBox.setTransform(transform);
};

SegmentDisplay.prototype.invertInputBus = function () {
    this.busInverted = !this.busInverted;
};

/*
    Checks if the mouse is over the display
*/
SegmentDisplay.prototype.mouseOver = function () {
    return this.gClickBox.mouseOver();
};

/*
    Checks if the mouse is over input n
*/
SegmentDisplay.prototype.mouseOverInput = function (n = 0) {
    if (!this.useBusInput) {
        return this.inputClickBoxes[n].mouseOver();
    } else {
        return this.busInputClickBox.mouseOver();
    }
};

SegmentDisplay.prototype.mouseOverInvert = function () {
    return this.invertClickBox.mouseOver();
};

SegmentDisplay.prototype.pointInInput = function (n = 0, px, py) {
    if (!this.useBusInput) {
        return this.inputClickBoxes[n].checkPoint(px, py);
    } else {
        return this.busInputClickBox.checkPoint(px, py);
    }

};

SegmentDisplay.prototype.update = function () {
    this.value = 0;

    if (!this.useBusInput) {
        for (let i = 0; i < this.inputCount; i++) {
            if (!this.ipset[i]) {
                this.inputs[i] = this.inputsInv[i];
            }
        }
    } else {
        if (this.busInverted) {
            this.inputs = (this.busInverted) ? this.inputs.slice(this.inputs.length - this.inputCount, this.inputs.length).reverse() : this.inputs.slice(this.inputs.length - this.inputCount, this.inputs.length);
        }
    }

    // Calculate the display value from the input vector
    for (let i = 0; i < this.inputCount; i++) {
        if (this.inputs[i]) {
            this.value += Math.pow(2, this.inputCount - i - 1);
        }
    }
};

/*
    Draws the gate on the screen
*/
SegmentDisplay.prototype.show = function () {
    this.x1 = this.x + GRIDSIZE;
    this.y1 = this.y + this.h;
    this.x2 = this.x + GRIDSIZE;
    this.y2 = this.y + this.h + 6;

    if (this.useBusInput && this.busInputSet) {
        stroke(150);
        strokeWeight(9);
        line(this.x1, this.y1, this.x2, this.y2 - 3); // Draw the bus input background
    }

    fill(255);
    if (this.marked) {
        stroke(MRED, MGREEN, MBLUE);
    } else {
        stroke(0);
    }
    strokeWeight(3);

    rect(this.x + GRIDSIZE / 2, this.y, this.w - GRIDSIZE, this.h); // Draw body

    noStroke();
    textSize(80);
    textAlign(CENTER, CENTER);
    textFont('PT Mono');

    if (this.marked) {
        fill(MRED, MGREEN, MBLUE);
    } else {
        fill(0);
    }

    let txt = '';
    for (let i = 0; i < this.digits - this.value.toString().length; i++) {
        txt += '0';
    }
    txt += this.value.toString();
    text(txt, this.x + this.w / 2, this.y + this.h / 2 - 3);

    textFont('Arial');

    if (!this.useBusInput) {
        // Draw inputs
        for (let i = 1; i <= this.inputCount; i++) {
            // Draw inputs
            if (this.marked) {
                stroke(MRED, MGREEN, MBLUE);
                strokeWeight(3);
            } else if (this.inputs[i - 1]) {
                stroke(this.highColor);
                strokeWeight(5);
            } else {
                stroke(0);
                strokeWeight(3);
            }

            this.x1 = this.x + (GRIDSIZE * i);
            this.y1 = this.y + this.h;
            this.x2 = this.x + (GRIDSIZE * i);
            this.y2 = this.y + this.h + 6;
            line(this.x1, this.y1, this.x2, this.y2);

            fill(255);
            strokeWeight(2);

            if (this.inputsInv[i - 1]) {
                ellipse(this.x1, this.y1 + this.h / 20 - 1.5, 10, 10);
            }

            if (this.marked) {
                fill(MRED, MGREEN, MBLUE);
            } else {
                fill(0);
            }
            noStroke();
            textSize(14);

            if (this.inputCount - i < 10) {
                text('2' + superscripts[this.inputCount - i], this.x1, this.y1 - 10);
            } else {
                text('2' + superscripts[Math.floor((this.inputCount - i) / 10)] + superscripts[this.inputCount - i - Math.floor((this.inputCount - i) / 10) * 10], this.x1, this.y1 - 10);
            }
        }
    } else {
        if (!this.busInputSet) {
            if (this.marked) {
                stroke(MRED, MGREEN, MBLUE);
            } else {
                stroke(0);
            }
            strokeWeight(6);
            line(this.x1, this.y1 + 3, this.x1, this.y1 + 6);
        } else {
            triangle(this.x1 - 8, this.y2 + 4, this.x1, this.y1 + 2, this.x1 + 8, this.y2 + 4);
        }

        noStroke();
        textSize(12);
        text(this.inputCount, this.x1 + 15, this.y1 + 10);

        textSize(10);
        if (this.busInverted) {
            text('[0:' + (this.inputCount - 1) + ']', this.x1, this.y1 - 10);
        } else {
            text('[' + (this.inputCount - 1) + ':0]', this.x1, this.y1 - 10);
        }

        textSize(14);
        textAlign(LEFT, BOTTOM);

        text('↺', this.x + this.w - GRIDSIZE / 2 - 16, this.y + this.h - 3);
    }

    // TEMP: Show clickboxes of inputs
    /*for (let i = 0; i < this.inputClickBoxes.length; i++) {
        this.inputClickBoxes[i].markClickBox();
    }*/
    //this.gClickBox.markClickBox();
};