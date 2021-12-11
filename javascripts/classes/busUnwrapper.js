// File: busUnwrapper.js

function BusUnwrapper(x, y, direction, outputCount) {
    this.x = x; // X-Position of the Gate (translated)
    this.y = y; // Y-Position

    this.direction = direction;     // Gate direction (0 = inputs left)
    this.outputCount = outputCount; // # of outputs

    this.w = 2 * GRIDSIZE; // Width of the gate
    this.h = 2 * GRIDSIZE + GRIDSIZE * (this.outputCount - 1); // Height of the gate

    this.highColor = color(HRED, HGREEN, HBLUE); // Color for high in-/outputs (red)
    this.lowColor = color(LRED, LGREEN, LBLUE);  // Color for low in-/outputs (black)

    this.inputs = Array(outputCount).fill(false); // BusUnwrapper accepts as many input bus bits as it has outputs
    this.ipset = false;
    this.outputs = [];    // Vector of the output state
    this.outputsInv = []; // true, if output is inverted

    this.textSize = 10;

    //this.id = '_' + Math.random().toString(36).substr(2, 9);
    this.id = 'u' + Date.now() + Math.random() + 'b';

    // The height (or length) of the gate, determined by the input/output count
    this.height = this.outputCount + 1;

    // These contain the ClickBoxes of the inputs and outputs and the global ClickBox
    this.inputClickBox = new ClickBox(0, 0, IOCBSIZE, IOCBSIZE, transform);
    this.outputClickBoxes = [];

    this.invertClickBox = new ClickBox(0, 0, IOCBSIZE, IOCBSIZE, transform);

    this.busInverted = false;

    this.marked = false;

    if (this.direction % 2 === 0) {
        this.gClickBox = new ClickBox(this.x, this.y + GRIDSIZE / 2, this.w, this.h - GRIDSIZE, transform);
    } else {
        this.gClickBox = new ClickBox(this.x + GRIDSIZE / 2, this.y, this.w - GRIDSIZE, this.h, transform);
    }

    // Initialize the outputs
    for (let i = 0; i < this.outputCount; i++) {
        this.outputs.push(false); // Set all outputs to low
        this.outputsInv.push(false); // Set all outputs to not inverted
        this.outputClickBoxes.push(new ClickBox(0, 0, IOCBSIZE, IOCBSIZE, transform)); // Create new clickBoxes for every output
    }

    this.setCoordinates(this.x, this.y);
    this.setDirection(direction); // Set the direction at the beginning
    this.updateClickBoxes();
}

BusUnwrapper.prototype.setInvertions = function (opinv) {
    this.outputsInv = opinv;
};

BusUnwrapper.prototype.getData = function () {
    let data = {};
    data.x = JSON.stringify(this.x);
    data.y = JSON.stringify(this.y);
    data.direction = JSON.stringify(this.direction);
    data.outputCount = JSON.stringify(this.outputCount);
    data.outputsInv = JSON.stringify(this.outputsInv);
    data.busInverted = JSON.stringify(this.busInverted);
    return data;
};

/*
    Sets the coordinates of the gate, rounded to grid size
*/
BusUnwrapper.prototype.setCoordinates = function (nx, ny) {
    this.x = Math.round((nx - GRIDSIZE / 2) / GRIDSIZE) * GRIDSIZE;
    this.y = Math.round((ny - GRIDSIZE / 2) / GRIDSIZE) * GRIDSIZE;
};

/*
     Swaps width and height
 */
BusUnwrapper.prototype.turn = function () {
    this.temp = this.h;
    this.h = this.w;
    this.w = this.temp;
};

/*
    Sets the direction of the gate
*/
BusUnwrapper.prototype.setDirection = function (dir) {
    this.dir = dir;
    if (this.dir % 2 !== 0) {
        this.turn();
    }
};

BusUnwrapper.prototype.alterPosition = function (x1, y1) {
    this.x += x1;
    this.y += y1;
    this.updateClickBoxes();
};

/*
    Sets input #i to state s
*/
BusUnwrapper.prototype.setInput = function (port = 0, s) {
    this.inputs = (this.busInverted) ? s.slice(s.length - this.outputCount, s.length).reverse() : s.slice(s.length - this.outputCount, s.length); // Set state
    this.ipset = true;
};

BusUnwrapper.prototype.invertInputBus = function () {
    this.busInverted = !this.busInverted;
}

/*
    Gives the output vector of the logic function
*/
BusUnwrapper.prototype.update = function () {
    for (let i = 0; i < this.outputCount; i++) {
        this.outputs[i] = this.inputs[i];
        if (this.outputsInv[i]) {
            this.outputs[i] = !this.outputs[i];
        }
    }
};

BusUnwrapper.prototype.shutdown = function () {
    for (let i = 0; i < this.outputCount; i++) {
        this.outputs[i] = false;
        this.inputs[i] = false;
    }
    this.ipset = false;
};

/*
    Gives the state of output i
*/
BusUnwrapper.prototype.getOutput = function (i) {
    return this.outputs[i];
};

/*
    Inverts the given output
*/
BusUnwrapper.prototype.invertOutput = function (output) {
    this.outputsInv[output] = !this.outputsInv[output]; // Invert isInverted-State
};

/*
    Updates the clickBoxes (once after creation)
*/
BusUnwrapper.prototype.updateClickBoxes = function () {
    switch (this.direction) {
        case 0:
            this.inputClickBox.updatePosition(this.x, this.y + (this.h) / this.height);
            this.invertClickBox.updatePosition(this.x + 10, this.y + this.h - GRIDSIZE / 2 - 10);
            break;
        case 1:
            this.inputClickBox.updatePosition(this.x + (this.w) / this.height, this.y);
            this.invertClickBox.updatePosition(this.x + this.w - GRIDSIZE / 2 - 10, this.y + 10);
            break;
        case 2:
            this.inputClickBox.updatePosition(this.x + this.w, this.y + (this.h) / this.height);
            this.invertClickBox.updatePosition(this.x + this.w - 10, this.y + this.h - GRIDSIZE / 2 - 10);
            break;
        case 3:
            this.inputClickBox.updatePosition(this.x + (this.w) / this.height, this.y + this.h);
            this.invertClickBox.updatePosition(this.x + this.w - GRIDSIZE / 2 - 10, this.y + this.h - 10);
            break;
    }

    this.inputClickBox.setTransform(transform);

    // Update output clickBoxes
    for (let i = 0; i < this.outputClickBoxes.length; i++) {
        switch (this.direction) {
            case 0: this.outputClickBoxes[i].updatePosition(this.x + this.w, this.y + (this.h * (i + 1)) / this.height); break;
            case 1: this.outputClickBoxes[i].updatePosition(this.x + (this.w * (i + 1)) / this.height, this.y + this.h); break;
            case 2: this.outputClickBoxes[i].updatePosition(this.x, this.y + (this.h * (i + 1)) / this.height); break;
            case 3: this.outputClickBoxes[i].updatePosition(this.x + (this.w * (i + 1)) / this.height, this.y); break;
        }

        this.outputClickBoxes[i].setTransform(transform);
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
BusUnwrapper.prototype.mouseOver = function () {
    return this.gClickBox.mouseOver();
};

/*
    Checks if the mouse is over input n*/
BusUnwrapper.prototype.mouseOverInput = function () {
    return this.inputClickBox.mouseOver();
};

/*
    Checks if the mouse is over output n
*/
BusUnwrapper.prototype.mouseOverOutput = function (n) {
    return this.outputClickBoxes[n].mouseOver();
};

BusUnwrapper.prototype.pointInInput = function (px, py) {
    return this.inputClickBox.checkPoint(px, py);
};

BusUnwrapper.prototype.pointInOutput = function (n, px, py) {
    return this.outputClickBoxes[n].checkPoint(px, py);
};

BusUnwrapper.prototype.mouseOverInvert = function () {
    return this.invertClickBox.mouseOver();
}

/*
    Draws the gate on the screen
*/
BusUnwrapper.prototype.show = function () {
    if ((this.x + transform.dx) * transform.zoom < 0 - this.w * transform.zoom || (this.y + transform.dy) * transform.zoom < 0 - this.h * transform.zoom ||
        (this.x + transform.dx) * transform.zoom > windowWidth || (this.y + transform.dy) * transform.zoom > windowHeight) {
        return;
    }

    fill(255);
    if (this.marked) {
        stroke(MRED, MGREEN, MBLUE);
    } else {
        stroke(0);
    }
    strokeWeight(3);

    if (this.direction % 2 === 0) {
        rect(this.x, this.y + GRIDSIZE / 2, this.w, this.h - GRIDSIZE); // Draw body
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
            text('↺', this.x + 5, this.y + this.h - GRIDSIZE / 2 - 3);
            break;
        case 1:
            text('↺', this.x + this.w - GRIDSIZE / 2 - 16, this.y + 18);
            break;
        case 2:
            text('↺', this.x + this.w - 16, this.y + this.h - GRIDSIZE / 2 - 3);
            break;
        case 3:
            text('↺', this.x + this.w - GRIDSIZE / 2 - 16, this.y + this.h - 3);
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
    if (this.outputCount % 2 !== 0 && this.direction % 2 === 0) {
        text("UNWRAP", this.x + this.w / 2, this.y + this.h / 2 - 15);
    } else {
        text("UNWRAP", this.x + this.w / 2, this.y + this.h / 2);
    }

    // Draw input
    textSize(12);

    switch (this.direction) {
        case 0: text(this.outputCount, this.x - 10, this.y + GRIDSIZE + 15); break;
        case 1: text(this.outputCount, this.x + GRIDSIZE + 15, this.y - 10); break;
        case 2: text(this.outputCount, this.x + this.w + 10, this.y + GRIDSIZE + 15); break;
        case 3: text(this.outputCount, this.x + GRIDSIZE + 15, this.y + this.h + 10); break;
        default:
    }

    if (this.ipset) {
        // Background lines to hide the bus behind the arrow
        //stroke(150);
        //strokeWeight(8);
        noStroke();
        fill(150);
        switch (this.direction) { 
            case 0: rect(this.x - 6, this.y + GRIDSIZE - 4, 5, 8); break;
            case 1: rect(this.x + GRIDSIZE - 4, this.y - 6, 8, 5); break;
            case 2: rect(this.x + this.w + 2, this.y + GRIDSIZE - 4, 5, 8); break;
            case 3: rect(this.x + GRIDSIZE - 4, this.y + this.h + 2, 8, 5); break;
            default:
        }
        noStroke();
        fill(0);
        switch (this.direction) {
            case 0: triangle(this.x - 9, this.y + GRIDSIZE - 8, this.x - 1, this.y + GRIDSIZE, this.x - 9, this.y + GRIDSIZE + 8); break;
            case 1: triangle(this.x + GRIDSIZE - 8, this.y - 9, this.x + GRIDSIZE, this.y - 1, this.x + GRIDSIZE + 8, this.y - 9); break;
            case 2: triangle(this.x + this.w + 10, this.y + GRIDSIZE - 8, this.x + this.w + 2, this.y + GRIDSIZE, this.x + this.w + 10, this.y + GRIDSIZE + 8); break;
            case 3: triangle(this.x + GRIDSIZE - 8, this.y + this.h + 10, this.x + GRIDSIZE, this.y + this.h + 2, this.x + GRIDSIZE + 8, this.y + this.h + 10); break;
            default:
        }
    } else {
        strokeWeight(6);
        if (this.marked) {
            stroke(MRED, MGREEN, MBLUE);
        } else {
            stroke(0);
        }
        switch (this.direction) {
            case 0: line(this.x - 5, this.y + GRIDSIZE, this.x - 2, this.y + GRIDSIZE); break;
            case 1: line(this.x + GRIDSIZE, this.y - 2, this.x + GRIDSIZE, this.y - 5); break;
            case 2: line(this.x + this.w + 3, this.y + GRIDSIZE, this.x + this.w + 6, this.y + GRIDSIZE); break;
            case 3: line(this.x + GRIDSIZE, this.y + this.h + 3, this.x + GRIDSIZE, this.y + this.h + 6); break;
            default:
        }
    }

    // Draw outputs
    for (let i = 1; i <= this.outputCount; i++) {

        strokeWeight(3);
        if (this.marked) {
            stroke(MRED, MGREEN, MBLUE);
        } else if (this.outputs[i - 1] === true) {
            stroke(this.highColor);
            strokeWeight(5);
        } else {
            stroke(this.lowColor);
        }

        switch (this.direction) {
            case 0: line(this.x + this.w, this.y + (this.h * i) / this.height, this.x + this.w + 6, this.y + (this.h * i) / this.height); break;
            case 1: line(this.x + (this.w * i) / this.height, this.y + this.h, this.x + (this.w * i) / this.height, this.y + this.h + 6); break;
            case 2: line(this.x - 6, this.y + (this.h * i) / this.height, this.x, this.y + (this.h * i) / this.height); break;
            case 3: line(this.x + (this.w * i) / this.height, this.y - 6, this.x + (this.w * i) / this.height, this.y); break;
        }

        fill(255);
        strokeWeight(2);

        // Draw output invertion circles
        if (this.outputsInv[i - 1]) {
            switch (this.direction) {
                case 0: ellipse(this.x + this.w + this.w / 20, this.y + (this.h * i) / this.height, 10, 10); break;
                case 1: ellipse(this.x + (this.w * i) / this.height, this.y + 6 + this.h - this.h / 20, 10, 10); break;
                case 2: ellipse(this.x - 6 + this.w / 20, this.y + (this.h * i) / this.height, 10, 10); break;
                case 3: ellipse(this.x + (this.w * i) / this.height, this.y - 6 + this.h / 20, 10, 10); break;
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
            exp = this.outputCount - i + 1;
        }

        // Draw output labels
        if (this.outputCount - exp < 10) {
            switch (this.direction) {
                case 0: text('2' + superscripts[this.outputCount - exp], this.x + this.w - 10, this.y + (this.h * i) / this.height); break;
                case 1: text('2' + superscripts[this.outputCount - exp], this.x + (this.w * i) / this.height, this.y + this.h - 10); break;
                case 2: text('2' + superscripts[this.outputCount - exp], this.x + 10, this.y + (this.h * i) / this.height); break;
                case 3: text('2' + superscripts[this.outputCount - exp], this.x + (this.w * i) / this.height, this.y + 10); break;
            }
        } else {
            switch (this.direction) {
                case 0: text('2' + superscripts[Math.floor((this.outputCount - exp) / 10)] + superscripts[this.outputCount - exp - Math.floor((this.outputCount - exp) / 10) * 10], this.x + this.w - 10, this.y + (this.h * i) / this.height); break;
                case 1: text('2' + superscripts[Math.floor((this.outputCount - exp) / 10)] + superscripts[this.outputCount - exp - Math.floor((this.outputCount - exp) / 10) * 10], this.x + (this.w * i) / this.height, this.y + this.h - 10); break;
                case 2: text('2' + superscripts[Math.floor((this.outputCount - exp) / 10)] + superscripts[this.outputCount - exp - Math.floor((this.outputCount - exp) / 10) * 10], this.x + 10, this.y + (this.h * i) / this.height); break;
                case 3: text('2' + superscripts[Math.floor((this.outputCount - exp) / 10)] + superscripts[this.outputCount - exp - Math.floor((this.outputCount - exp) / 10) * 10], this.x + (this.w * i) / this.height, this.y + 10); break;
            }
        }
    }

    // TEMP: Show clickboxes of in- and outputs
    /*this.inputClickBox.markClickBox();
    for (let i = 0; i < this.outputClickBoxes.length; i++) {
        this.outputClickBoxes[i].markClickBox();
    }
    this.gClickBox.markClickBox();*/
    //this.invertClickBox.markClickBox();
};