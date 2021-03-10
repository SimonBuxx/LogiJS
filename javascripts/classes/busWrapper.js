// File: busWrapper.js

function BusWrapper(x, y, direction, inputCount) {
    this.x = x; // X-Position of the Gate (translated)
    this.y = y; // Y-Position

    this.direction = direction;     // Gate direction (0 = inputs left)
    this.inputCount = inputCount; // # of outputs

    this.w = 2 * GRIDSIZE; // Width of the gate
    this.h = 2 * GRIDSIZE + GRIDSIZE * (this.inputCount - 1); // Height of the gate

    this.highColor = color(HRED, HGREEN, HBLUE); // Color for high in-/outputs (red)
    this.lowColor = color(LRED, LGREEN, LBLUE);  // Color for low in-/outputs (black)

    this.inputs = [];
    this.ipset = [];
    this.outputs = Array(inputCount).fill(false); // Output bus state vector
    this.inputsInv = []; // true, if input is inverted

    this.busInverted = false;

    this.textSize = 10;

    //this.id = '_' + Math.random().toString(36).substr(2, 9);
    this.id = 'r' + Date.now() + Math.random() + 'b';

    // The height (or length) of the gate, determined by the input/output count
    this.height = this.inputCount + 1;

    // These contain the ClickBoxes of the inputs and outputs and the global ClickBox
    this.outputClickBox = new ClickBox(0, 0, IOCBSIZE, IOCBSIZE, transform);
    this.inputClickBoxes = [];

    this.invertClickBox = new ClickBox(0, 0, IOCBSIZE, IOCBSIZE, transform);

    this.marked = false;

    if (this.direction % 2 === 0) {
        this.gClickBox = new ClickBox(this.x, this.y + GRIDSIZE / 2, this.w, this.h - GRIDSIZE, transform);
    } else {
        this.gClickBox = new ClickBox(this.x + GRIDSIZE / 2, this.y, this.w - GRIDSIZE, this.h, transform);
    }

    // Initialize the outputs
    for (let i = 0; i < this.inputCount; i++) {
        this.inputs.push(false); // Set all outputs to low
        this.inputsInv.push(false); // Set all outputs to not inverted
        this.ipset.push(false);
        this.inputClickBoxes.push(new ClickBox(0, 0, 10, 10, transform)); // Create new clickBoxes for every output
    }

    this.setCoordinates(this.x, this.y);
    this.setDirection(direction); // Set the direction at the beginning
    this.updateClickBoxes();
}

BusWrapper.prototype.setInvertions = function (ipinv) {
    this.inputsInv = ipinv;
};

BusWrapper.prototype.getData = function () {
    let data = {};
    data.x = JSON.stringify(this.x);
    data.y = JSON.stringify(this.y);
    data.direction = JSON.stringify(this.direction);
    data.inputCount = JSON.stringify(this.inputCount);
    data.inputsInv = JSON.stringify(this.inputsInv);
    data.busInverted = JSON.stringify(this.busInverted);
    return data;
};

/*
    Sets the coordinates of the gate, rounded to grid size
*/
BusWrapper.prototype.setCoordinates = function (nx, ny) {
    this.x = Math.round((nx - GRIDSIZE / 2) / GRIDSIZE) * GRIDSIZE;
    this.y = Math.round((ny - GRIDSIZE / 2) / GRIDSIZE) * GRIDSIZE;
};

/*
     Swaps width and height
 */
BusWrapper.prototype.turn = function () {
    this.temp = this.h;
    this.h = this.w;
    this.w = this.temp;
};

/*
    Sets the direction of the gate
*/
BusWrapper.prototype.setDirection = function (dir) {
    this.dir = dir;
    if (this.dir % 2 !== 0) {
        this.turn();
    }
};

BusWrapper.prototype.alterPosition = function (x1, y1) {
    this.x += x1;
    this.y += y1;
    this.updateClickBoxes();
};

/*
    Sets input #i to state s
*/
BusWrapper.prototype.setInput = function (port = 0, s) {
    if (port < this.inputCount) {
        this.inputs[port] = s; // Set state
        this.ipset[port] = true;
        if (this.inputsInv[port]) {
            this.inputs[port] = !this.inputs[port];
        }
    } else {
        // Error
        console.log('Input ' + port + ' doesn\'t exist!');
    }
};

BusWrapper.prototype.invertOutputBus = function () {
    this.busInverted = !this.busInverted;
};

/*
    Gives the output vector of the logic function
*/
BusWrapper.prototype.update = function () {
    for (let i = 0; i < this.inputCount; i++) {
        if (!this.ipset[i]) {
            this.inputs[i] = this.inputsInv[i];
        }
        this.outputs[i] = this.inputs[i];
    }
};

BusWrapper.prototype.shutdown = function () {
    for (let i = 0; i < this.inputCount; i++) {
        this.inputs[i] = false;
        this.outputs[i] = false;
        this.ipset[i] = false;
    }
};

/*
    Gives the state of output i
*/
BusWrapper.prototype.getOutput = function (i = 0) {
    return (this.busInverted) ? this.outputs.reverse() : this.outputs;
};

/*
    Inverts the given output
*/
BusWrapper.prototype.invertInput = function (input) {
    this.inputsInv[input] = !this.inputsInv[input]; // Invert isInverted-State
};

/*
    Updates the clickBoxes (once after creation)
*/
BusWrapper.prototype.updateClickBoxes = function () {
    switch (this.direction) {
        case 0:
            this.outputClickBox.updatePosition(this.x + this.w, this.y + this.h / this.height);
            this.invertClickBox.updatePosition(this.x + this.w - 10, this.y + this.h - GRIDSIZE / 2 - 10);
            break;
        case 1:
            this.outputClickBox.updatePosition(this.x + GRIDSIZE, this.y + this.h);
            this.invertClickBox.updatePosition(this.x + this.w - GRIDSIZE / 2 - 10, this.y + this.h - 10);
            break;
        case 2:
            this.outputClickBox.updatePosition(this.x, this.y + this.h / this.height);
            this.invertClickBox.updatePosition(this.x + 10, this.y + this.h - GRIDSIZE / 2 - 10);
            break;
        case 3:
            this.outputClickBox.updatePosition(this.x + GRIDSIZE, this.y);
            this.invertClickBox.updatePosition(this.x + this.w - GRIDSIZE / 2 - 10, this.y + 10);
            break;
    }

    this.outputClickBox.setTransform(transform);

    // Update input clickBoxes
    for (let i = 0; i < this.inputClickBoxes.length; i++) {
        switch (this.direction) {
            case 0: this.inputClickBoxes[i].updatePosition(this.x, this.y + (this.h * (i + 1)) / this.height); break;
            case 1: this.inputClickBoxes[i].updatePosition(this.x + (this.w * (i + 1)) / this.height, this.y); break;
            case 2: this.inputClickBoxes[i].updatePosition(this.x + this.w, this.y + (this.h * (i + 1)) / this.height); break;
            case 3: this.inputClickBoxes[i].updatePosition(this.x + (this.w * (i + 1)) / this.height, this.y + this.h); break;
        }

        this.inputClickBoxes[i].setTransform(transform);
    }
    this.gClickBox.updatePosition(this.x + this.w / 2, this.y + this.h / 2);
    if (this.direction % 2 === 0) {
        this.gClickBox.updateSize(this.w, this.h - GRIDSIZE);
    } else {
        this.gClickBox.updateSize(this.w - GRIDSIZE, this.h);
    }
    this.gClickBox.setTransform(transform);
};

/*
    Checks if the mouse is over the gate
*/
BusWrapper.prototype.mouseOver = function () {
    return this.gClickBox.mouseOver();
};

/*
    Checks if the mouse is over output n*/
BusWrapper.prototype.mouseOverOutput = function () {
    return this.outputClickBox.mouseOver();
};

/*
    Checks if the mouse is over input n
*/
BusWrapper.prototype.mouseOverInput = function (n) {
    return this.inputClickBoxes[n].mouseOver();
};

BusWrapper.prototype.pointInOutput = function (px, py) {
    return this.outputClickBox.checkPoint(px, py);
};

BusWrapper.prototype.pointInInput = function (n, px, py) {
    return this.inputClickBoxes[n].checkPoint(px, py);
};

BusWrapper.prototype.mouseOverInvert = function () {
    return this.invertClickBox.mouseOver();
};

/*
    Draws the wrapper on the screen
*/
BusWrapper.prototype.show = function () {
    // If this element is not on screen, don't draw it
    if ((this.x + transform.dx) * transform.zoom < 0 - this.w * transform.zoom || (this.y + transform.dy) * transform.zoom < 0 - this.h * transform.zoom ||
        (this.x + transform.dx) * transform.zoom > windowWidth || (this.y + transform.dy) * transform.zoom > windowHeight) {
        return;
    }

    // Background lines to hide the bus behind the arrow
    stroke(150);
    strokeWeight(9);
    switch (this.direction) {
        case 0:
            line(this.x + this.w, this.y + GRIDSIZE, this.x + this.w + 4, this.y + GRIDSIZE);
            break;
        case 1:
            line(this.x + GRIDSIZE, this.y + this.h, this.x + GRIDSIZE, this.y + this.h + 4);
            break;
        case 2:
            line(this.x - 4, this.y + GRIDSIZE, this.x, this.y + GRIDSIZE);
            break;
        case 3:
            line(this.x + GRIDSIZE, this.y, this.x + GRIDSIZE, this.y - 4);
            break;
        default:
    }

    // Draw the element body
    fill(255);
    if (this.marked) {
        stroke(MRED, MGREEN, MBLUE);
    } else {
        stroke(0);
    }
    strokeWeight(3);

    if (this.direction % 2 === 0) {
        rect(this.x, this.y + GRIDSIZE / 2, this.w, this.h - GRIDSIZE);
    } else {
        rect(this.x + GRIDSIZE / 2, this.y, this.w - GRIDSIZE, this.h);
    }

    if (this.marked) {
        fill(MRED, MGREEN, MBLUE);
    } else {
        fill(0);
    }
    noStroke();
    textSize(14);
    textAlign(LEFT, BOTTOM);

    switch (this.direction) {
        case 0:
            text('↺', this.x + this.w - 16, this.y + this.h - GRIDSIZE / 2 - 3);
            break;
        case 1:
            text('↺', this.x + this.w - GRIDSIZE / 2 - 16, this.y + this.h - 3);
            break;
        case 2:
            text('↺', this.x + 5, this.y + this.h - GRIDSIZE / 2 - 3);
            break;
        case 3:
            text('↺', this.x + this.w - GRIDSIZE / 2 - 16, this.y + 18);
            break;
        default:
    }

    // Draw element caption
    noStroke();
    textSize(this.textSize);
    textAlign(CENTER, CENTER);
    if (this.marked) {
        fill(MRED, MGREEN, MBLUE);
    } else {
        fill(0);
    }
    if (this.inputCount % 2 !== 0 && this.direction % 2 === 0) {
        text("WRAP", this.x + this.w / 2, this.y + this.h / 2 - 15);
    } else {
        text("WRAP", this.x + this.w / 2, this.y + this.h / 2);
    }

    // Draw inputs
    for (let i = 1; i <= this.inputCount; i++) {
        strokeWeight(3);
        if (this.marked) {
            stroke(MRED, MGREEN, MBLUE);
        } else if (this.inputs[i - 1] === true) {
            stroke(this.highColor);
            strokeWeight(5);
        } else {
            stroke(this.lowColor);
        }

        // Draw input connector lines
        switch (this.direction) {
            case 0: line(this.x - 6, this.y + (this.h * i) / this.height, this.x, this.y + (this.h * i) / this.height); break;
            case 1: line(this.x + (this.w * i) / this.height, this.y - 6, this.x + (this.w * i) / this.height, this.y); break;
            case 2: line(this.x + this.w, this.y + (this.h * i) / this.height, this.x + this.w + 6, this.y + (this.h * i) / this.height); break;
            case 3: line(this.x + (this.w * i) / this.height, this.y + this.h, this.x + (this.w * i) / this.height, this.y + this.h + 6); break;
        }

        fill(255);
        strokeWeight(2);

        // Draw input invertion circles
        if (this.inputsInv[i - 1]) {
            switch (this.direction) {
                case 0: ellipse(this.x - 6 + this.w / 20, this.y + (this.h * i) / this.height, 10, 10); break;
                case 1: ellipse(this.x + (this.w * i) / this.height, this.y - 6 + this.h / 20, 10, 10); break;
                case 2: ellipse(this.x + this.w + this.w / 20, this.y + (this.h * i) / this.height, 10, 10); break;
                case 3: ellipse(this.x + (this.w * i) / this.height, this.y + 6 + this.h - this.h / 20, 10, 10); break;
            }
        }

        textSize(14);
        noStroke();
        if (this.marked) {
            fill(MRED, MGREEN, MBLUE);
        } else {
            fill(0);
        }

        let exp = i;
        if (this.busInverted) {
            exp = this.inputCount - i + 1;
        }

        // Draw input labels
        if (this.inputCount - exp < 10) {
            switch (this.direction) {
                case 0: text('2' + superscripts[this.inputCount - exp], this.x + 10, this.y + (this.h * i) / this.height); break;
                case 1: text('2' + superscripts[this.inputCount - exp], this.x + (this.w * i) / this.height, this.y + 10); break;
                case 2: text('2' + superscripts[this.inputCount - exp], this.x + this.w - 10, this.y + (this.h * i) / this.height); break;
                case 3: text('2' + superscripts[this.inputCount - exp], this.x + (this.w * i) / this.height, this.y + this.h - 10); break;
            }
        } else {
            switch (this.direction) {
                case 0: text('2' + superscripts[Math.floor((this.inputCount - exp) / 10)] + superscripts[this.inputCount - exp - Math.floor((this.inputCount - exp) / 10) * 10], this.x + 10, this.y + (this.h * i) / this.height); break;
                case 1: text('2' + superscripts[Math.floor((this.inputCount - exp) / 10)] + superscripts[this.inputCount - exp - Math.floor((this.inputCount - exp) / 10) * 10], this.x + (this.w * i) / this.height, this.y + 10); break;
                case 2: text('2' + superscripts[Math.floor((this.inputCount - exp) / 10)] + superscripts[this.inputCount - exp - Math.floor((this.inputCount - exp) / 10) * 10], this.x + this.w - 10, this.y + (this.h * i) / this.height); break;
                case 3: text('2' + superscripts[Math.floor((this.inputCount - exp) / 10)] + superscripts[this.inputCount - exp - Math.floor((this.inputCount - exp) / 10) * 10], this.x + (this.w * i) / this.height, this.y + this.h - 10); break;
            }
        }
    }

    // Draw output triangle

    noStroke();
    if (this.marked) {
        fill(MRED, MGREEN, MBLUE);
    } else {
        fill(0);
    }
    textSize(12);

    switch (this.direction) {
        case 0:
            triangle(this.x + this.w + 10, this.y + GRIDSIZE - 8, this.x + this.w + 2, this.y + GRIDSIZE, this.x + this.w + 10, this.y + GRIDSIZE + 8);
            text(this.inputCount, this.x + this.w + 10, this.y + GRIDSIZE + 15);
            break;
        case 1:
            triangle(this.x + GRIDSIZE - 8, this.y + this.h + 10, this.x + GRIDSIZE, this.y + this.h + 2, this.x + GRIDSIZE + 8, this.y + this.h + 10);
            text(this.inputCount, this.x + GRIDSIZE + 15, this.y + this.h + 10);
            break;
        case 2:
            triangle(this.x - 9, this.y + GRIDSIZE - 8, this.x - 1, this.y + GRIDSIZE, this.x - 9, this.y + GRIDSIZE + 8);
            text(this.inputCount, this.x - 10, this.y + GRIDSIZE + 15);
            break;
        case 3:
            triangle(this.x + GRIDSIZE - 8, this.y - 9, this.x + GRIDSIZE, this.y - 1, this.x + GRIDSIZE + 8, this.y - 9);
            text(this.inputCount, this.x + GRIDSIZE + 15, this.y - 10);
            break;
        default:
    }

    /*textSize(8);

    switch (this.direction) {
        case 0:
            text('M', this.x + this.w + 14, this.y + GRIDSIZE - 7);
            text('L', this.x + this.w + 14, this.y + GRIDSIZE + 8);
            break;
        case 1:
            break;
        case 2:
            break;
        case 3:
            break;
        default:
    }

    // TEMP: Show clickboxes of in- and outputs
    /*for (let i = 0; i < this.inputClickBoxes.length; i++) {
        this.inputClickBoxes[i].markClickBox();
    }
    this.outputClickBox.markClickBox();
    this.gClickBox.markClickBox();*/
    //this.invertClickBox.markClickBox();
};

/*
    Logic functions
*/