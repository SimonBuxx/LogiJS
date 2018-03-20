// File: logicGate.js

function LogicGate(x, y, transform, direction, inputCount, outputCount, logicFunction, caption) {
    this.x = x; // X-Position of the Gate (translated)
    this.y = y; // Y-Position

    this.transform = transform;     // Transformation (Zoom and Translation)
    this.direction = direction;     // Gate direction (0 = inputs left)
    this.inputCount = inputCount;   // # of inputs
    this.outputCount = outputCount; // # of outputs
    this.alpha = 255;

    this.w = 2 * GRIDSIZE; // Width of the gate
    this.h = 2 * GRIDSIZE + GRIDSIZE * Math.max(this.inputCount - 1, this.outputCount - 1); // Height of the gate

    this.logicFunction = logicFunction;  // Applied logic function

    this.highColor = color(HRED, HGREEN, HBLUE); // Color for high in-/outputs (red)
    this.lowColor = color(LRED, LGREEN, LBLUE);  // Color for low in-/outputs (black)

    this.caption = caption; // Caption of the logic gate
    this.textSize = 40;   // Text size of the caption

    this.inputs = [];     // Vector of the input states
    this.ipset = [];      // set to true if the input was set
    this.outputs = [];    // Vector of the output state
    this.inputsInv = [];  // true, if input is inverted
    this.outputsInv = []; // true, if output is inverted

    // The height (or length) of the gate, determined by the input/output count
    this.height = Math.max(this.outputCount + 1, this.inputCount + 1);

    // These contain the ClickBoxes of the inputs and outputs and the global ClickBox
    this.inputClickBoxes = [];
    this.outputClickBoxes = [];

    this.marked = false;
    this.markColor = color(0, 100, 50);   // Color for marked gates

    if (this.direction % 2 === 0) {
        this.gClickBox = new ClickBox(this.x, this.y + GRIDSIZE / 2, this.w, this.h - GRIDSIZE, this.transform);
    } else {
        this.gClickBox = new ClickBox(this.x + GRIDSIZE / 2, this.y, this.w - GRIDSIZE, this.h, this.transform);
    }

    // Initialize the inputs
    for (let i = 0; i < this.inputCount; i++) {
        this.inputs.push(false); // Set all inputs to low
        this.ipset.push(false);
        this.inputsInv.push(false); // Set all inputs to not inverted
        this.inputClickBoxes.push(new ClickBox(0, 0, IOCBSIZE, IOCBSIZE, this.transform)); // Create new clickBoxes for every input
    }

    // Initialize the outputs
    for (let i = 0; i < this.outputCount; i++) {
        this.outputs.push(false); // Set all outputs to low
        this.outputsInv.push(false); // Set all outputs to not inverted
        this.outputClickBoxes.push(new ClickBox(0, 0, IOCBSIZE, IOCBSIZE, this.transform)); // Create new clickBoxes for every output
    }

    this.setCoordinates(this.x, this.y);
    this.setDirection(direction); // Set the direction at the beginning
    this.updateClickBoxes();
}

LogicGate.prototype.setInvertions = function (ipinv, opinv) {
    this.inputsInv = ipinv;
    this.outputsInv = opinv;
};

LogicGate.prototype.getData = function () {
    let data = {};
    data.x = JSON.stringify(this.x);
    data.y = JSON.stringify(this.y);
    data.direction = JSON.stringify(this.direction);
    data.inputCount = JSON.stringify(this.inputCount);
    data.outputCount = JSON.stringify(this.outputCount);
    data.logicFunction = JSON.stringify(this.logicFunction);
    data.caption = JSON.stringify(this.caption);
    data.outputsInv = JSON.stringify(this.outputsInv);
    data.inputsInv = JSON.stringify(this.inputsInv);
    return data;
};

/*
    Sets the coordinates of the gate, rounded to grid size
*/
LogicGate.prototype.setCoordinates = function (nx, ny) {
    this.x = Math.round((nx - GRIDSIZE / 2) / GRIDSIZE) * GRIDSIZE;
    this.y = Math.round((ny - GRIDSIZE / 2) / GRIDSIZE) * GRIDSIZE;
    // Check bounds
    /*if (this.x < 0) {
        this.x = 0;
    }
    if (this.y < 0) {
        this.y = 0;
    }*/
};

/*
     Swaps width and height
 */
LogicGate.prototype.turn = function () {
    this.temp = this.h;
    this.h = this.w;
    this.w = this.temp;
};

/*
    Sets the direction of the gate
*/
LogicGate.prototype.setDirection = function (dir) {
    this.dir = dir;
    // Turn the brick if dir is 1 or 3
    if (this.dir % 2 !== 0) {
        this.turn();
        // Turn the clickBoxes
        for (let i = 0; i < this.inputClickBoxes.length; i++) {
            this.inputClickBoxes[i].turn();
        }
        for (let i = 0; i < this.outputClickBoxes.length; i++) {
            this.outputClickBoxes[i].turn();
        }
        this.gClickBox.turn();
        this.gClickBox.updatePosition(this.x + GRIDSIZE / 2, this.y);
        this.gClickBox.updateSize(this.w - GRIDSIZE, this.h - GRIDSIZE);
    }
};

LogicGate.prototype.alterPosition = function (x1, y1) {
    this.x += x1;
    this.y += y1;
    this.updateClickBoxes();
};

/*
    Sets input #i to state s
*/
LogicGate.prototype.setInput = function (i, s) {
    if (i < this.inputCount) {
        this.inputs[i] = s; // Set state
        this.ipset[i] = true;
        if (this.inputsInv[i]) {
            this.inputs[i] = !this.inputs[i];
        }
    } else {
        // Error
        console.log('Input ' + i + ' doesn\'t exist!');
    }
};

/*
    Gives the output vector of the logic function
*/
LogicGate.prototype.update = function () {
    for (let i = 0; i < this.inputCount; i++) {
        if (!this.ipset[i]) {
            this.inputs[i] = this.inputsInv[i];
        }
    }
    switch (this.logicFunction) {
        case 'and':
            this.outputs = this.and(this.inputs);
            break;
        case 'or':
            this.outputs = this.or(this.inputs);
            break;
        case 'xor':
            this.outputs = this.xor(this.inputs);
            break;
        default:
            console.log('Invalid logic function!');
    }
    for (let i = 0; i < this.outputCount; i++) {
        if (this.outputsInv[i]) {
            this.outputs[i] = !this.outputs[i];
        }
    }
};

LogicGate.prototype.shutdown = function () {
    for (let i = 0; i < this.outputCount; i++) {
        this.outputs[i] = false;
    }
    for (let i = 0; i < this.inputCount; i++) {
        this.inputs[i] = false;
        this.ipset[i] = false;
    }
};

/*
    Gives the state of output i
*/
LogicGate.prototype.getOutput = function (i) {
    return this.outputs[i];
};

/*
    Inverts the given input
*/
LogicGate.prototype.invertInput = function (input) {
    this.inputsInv[input] = !this.inputsInv[input]; // Invert isInverted-State
};

/*
    Inverts the given output
*/
LogicGate.prototype.invertOutput = function (output) {
    this.outputsInv[output] = !this.outputsInv[output]; // Invert isInverted-State
};

/*
    Updates the clickBoxes (once after creation)
*/
LogicGate.prototype.updateClickBoxes = function () {
    // Update input clickBoxes
    for (let i = 0; i < this.inputClickBoxes.length; i++) {
        switch (this.direction) {
            case 0: this.inputClickBoxes[i].updatePosition(this.x, this.y + (this.h * (i + 1)) / this.height); break;
            case 1: this.inputClickBoxes[i].updatePosition(this.x + (this.w * (i + 1)) / this.height, this.y); break;
            case 2: this.inputClickBoxes[i].updatePosition(this.x + this.w, this.y + (this.h * (i + 1)) / this.height); break;
            case 3: this.inputClickBoxes[i].updatePosition(this.x + (this.w * (i + 1)) / this.height, this.y + this.h); break;
        }

        this.inputClickBoxes[i].setTransform(this.transform);
    }

    // Update output clickBoxes
    for (let i = 0; i < this.outputClickBoxes.length; i++) {
        switch (this.direction) {
            case 0: this.outputClickBoxes[i].updatePosition(this.x + this.w, this.y + (this.h * (i + 1)) / this.height); break;
            case 1: this.outputClickBoxes[i].updatePosition(this.x + (this.w * (i + 1)) / this.height, this.y + this.h); break;
            case 2: this.outputClickBoxes[i].updatePosition(this.x, this.y + (this.h * (i + 1)) / this.height); break;
            case 3: this.outputClickBoxes[i].updatePosition(this.x + (this.w * (i + 1)) / this.height, this.y); break;
        }

        this.outputClickBoxes[i].setTransform(this.transform);
    }
    this.gClickBox.updatePosition(this.x + this.w / 2, this.y + this.h / 2);
    if (this.direction % 2 === 0) {
        this.gClickBox.updateSize(this.w, this.h - GRIDSIZE);
    } else {
        this.gClickBox.updateSize(this.h, this.w - GRIDSIZE);
    }
    this.gClickBox.setTransform(this.transform);
};

/*
    Checks if the mouse is over the gate
*/
LogicGate.prototype.mouseOver = function () {
    return this.gClickBox.mouseOver();
};

/*
    Checks if the mouse is over input n*/
LogicGate.prototype.mouseOverInput = function (n) {
    return this.inputClickBoxes[n].mouseOver();
};

/*
    Checks if the mouse is over output n
*/
LogicGate.prototype.mouseOverOutput = function (n) {
    return this.outputClickBoxes[n].mouseOver();
};

LogicGate.prototype.pointInInput = function (n, px, py) {
    return this.inputClickBoxes[n].checkPoint(px, py);
};

LogicGate.prototype.pointInOutput = function (n, px, py) {
    return this.outputClickBoxes[n].checkPoint(px, py);
};

/*
    Draws the gate on the screen
*/
LogicGate.prototype.show = function () {
    stroke(0);
    if (this.marked) {
        fill(this.markColor);
    } else {
        fill(255, this.alpha);
    }
    strokeWeight(3);

    

    if (this.direction % 2 === 0) {
        rect(this.x, this.y + GRIDSIZE / 2, this.w, this.h - GRIDSIZE); //  Draw body
    } else {
        rect(this.x + GRIDSIZE / 2, this.y, this.w - GRIDSIZE, this.h);
    }

    noStroke();
    textSize(this.textSize);
    textAlign(CENTER, CENTER);
    fill(0);
    text(this.caption, this.x + this.w / 2, this.y + this.h / 2); // Draw text

    // Draw inputs
    for (let i = 1; i <= this.inputCount; i++) {
        // Draw inputs
        if (this.marked) {
            stroke(this.markColor);
            strokeWeight(3);
        } else if (this.inputs[i - 1] === true) {
            stroke(this.highColor);
            strokeWeight(5);
        } else {
            stroke(this.lowColor);
            strokeWeight(3);
        }

        switch (this.direction) {
            case 0:
                this.x1 = this.x - this.w / 10;
                this.y1 = this.y + (this.h * i) / this.height;
                this.x2 = this.x;
                this.y2 = this.y + (this.h * i) / this.height;
                break;
            case 1:
                this.x1 = this.x + (this.w * i) / this.height;
                this.y1 = this.y - this.h / 10;
                this.x2 = this.x + (this.w * i) / this.height;
                this.y2 = this.y;
                break;
            case 2:
                this.x1 = this.x + this.w;
                this.y1 = this.y + (this.h * i) / this.height;
                this.x2 = this.x + this.w + this.w / 10;
                this.y2 = this.y + (this.h * i) / this.height;
                break;
            case 3:
                this.x1 = this.x + (this.w * i) / this.height;
                this.y1 = this.y + this.h;
                this.x2 = this.x + (this.w * i) / this.height;
                this.y2 = this.y + this.h + this.h / 10;
                break;
            default:
                console.log('Gate direction doesn\'t exist!');
        }
        line(this.x1, this.y1, this.x2, this.y2);

        fill(255);
        strokeWeight(2);

        if (this.inputsInv[i - 1]) {
            switch (this.direction) {
                case 0: ellipse(this.x1 + this.w / 20, this.y1, 10, 10); break;
                case 1: ellipse(this.x1, this.y1 + this.h / 20, 10, 10); break;
                case 2: ellipse(this.x1 + this.w / 20, this.y1, 10, 10); break;
                case 3: ellipse(this.x1, this.y1 + this.h / 20, 10, 10); break;
            }
        }
    }

    // Draw outputs
    for (let i = 1; i <= this.outputCount; i++) {
        // Draw outputs
        if (this.marked) {
            stroke(this.markColor);
            strokeWeight(3);
        } else if (this.outputs[i - 1] === true) {
            stroke(this.highColor);
            strokeWeight(5);
        } else {
            stroke(this.lowColor);
            strokeWeight(3);
        }

        switch (this.direction) {
            case 0:
                this.x1 = this.x + this.w;
                this.y1 = this.y + (this.h * i) / this.height;
                this.x2 = this.x + this.w + this.w / 10;
                this.y2 = this.y + (this.h * i) / this.height;
                break;
            case 1:
                this.x1 = this.x + (this.w * i) / this.height;
                this.y1 = this.y + this.h;
                this.x2 = this.x + (this.w * i) / this.height;
                this.y2 = this.y + this.h + this.h / 10;
                break;
            case 2:
                this.x1 = this.x - this.w / 10;
                this.y1 = this.y + (this.h * i) / this.height;
                this.x2 = this.x;
                this.y2 = this.y + (this.h * i) / this.height;
                break;
            case 3:
                this.x1 = this.x + (this.w * i) / this.height;
                this.y1 = this.y;
                this.x2 = this.x + (this.w * i) / this.height;
                this.y2 = this.y - this.h / 10;
                break;
            default:
                console.log('Gate direction doesn\'t exist!');
        }
        line(this.x1, this.y1, this.x2, this.y2);

        fill(255);
        strokeWeight(2);

        if (this.outputsInv[i - 1]) {
            switch (this.direction) {
                case 0: ellipse(this.x1 + this.w / 20, this.y1, 10, 10); break;
                case 1: ellipse(this.x1, this.y1 + this.h / 20, 10, 10); break;
                case 2: ellipse(this.x1 + this.w / 20, this.y1, 10, 10); break;
                case 3: ellipse(this.x1, this.y1 - this.h / 20, 10, 10); break;
            }
        }
    }

    // TEMP: Show clickboxes of in- and outputs
    /*for (let i = 0; i < this.inputClickBoxes.length; i++) {
        this.inputClickBoxes[i].markClickBox();
    }
    for (let i = 0; i < this.outputClickBoxes.length; i++) {
        this.outputClickBoxes[i].markClickBox();
    }*/
    //this.gClickBox.markClickBox();
};

/*
    Logic functions
*/

LogicGate.prototype.and = function (inputs) {
    return [Math.min.apply(null, inputs) > 0];
};

LogicGate.prototype.or = function (inputs) {
    return [Math.max.apply(null, inputs) > 0];
};

LogicGate.prototype.xor = function (inputs) {
    let result = [];
    let counter = 0;
    for (let i = 0; i < inputs.length; i++) {
        if (inputs[i] === true) {
            counter++;
        }
    }
    result.push(counter === 1);
    return result;
};
