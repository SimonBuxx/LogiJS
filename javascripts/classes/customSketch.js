// File: customSketch.js

function CustomSketch(x, y, transform, direction, file) {
    this.x = x; // X-Position of the Custom object
    this.y = y; // Y-Position

    this.transform = transform; // Transformation (Zoom and Translation)
    this.direction = direction; // Direction (0 = inputs left)
    this.inputCount = 0;        // Number of inputs
    this.outputCount = 0;       // Number of outputs

    this.w = 2 * GRIDSIZE;      // Width of the custom object in pixels
    this.h = 2 * GRIDSIZE + GRIDSIZE * Math.max(this.inputCount - 1, this.outputCount - 1); // Height in pixels

    this.gridHeight = Math.max(this.outputCount + 1, this.inputCount + 1); // Height of the custom object in grid cells

    this.objects = [];    // Contains all objects (gates, wires, etc.) the custom object consists of
    this.filename = file; // The name of the json file the custom object is loaded from

    this.inputs = [];     // Vector of the input states
    this.ipset = [];      // true, if the input state is set (if a wire is connected to the input)
    this.outputs = [];    // Vector of the output state
    this.inputsInv = [];  // true, if input is inverted
    this.outputsInv = []; // true, if output is inverted

    this.responsibles = []; // Contains all custom objects that are included in this custom
    // This custom object is responsible for a certain amount of other custom objects
    // that are managed by the main sketch

    // Variables for wire tracing (Wires are grouped as in sketch.js)
    this.traced = [];
    this.groups = [];

    this.caption = '';    // Caption of the custom object
    this.textSize = 10;   // Text size of the caption

    this.inputClickBoxes = []; // Clickboxes for inputs and outputs
    this.outputClickBoxes = [];

    this.marked = false; // True, if the object is marked in the selection mode

    this.gClickBox = new ClickBox(this.x, this.y, this.w, this.h, this.transform); // Global clickbox

    this.visible = true; // True, if the object is visible and not part of another object

    this.simRunning = false; // True, when the simulation is running
    this.tops = 0;           // Number of inputs to draw on top of the object

    this.id = 'c' + Date.now() + Math.random();
    this.pid = null;

    this.parsed = false; // true, if the components have been rendered once
}

/*
    Sets the invertion arrays, determing which in-/outputs are inverted
*/
CustomSketch.prototype.setInvertions = function (ipinv, opinv) {
    this.inputsInv = ipinv;
    this.outputsInv = opinv;
};

/*
    Returns all object data that has to be saved in the json file
*/
CustomSketch.prototype.getData = function () {
    let data = {};
    data.x = JSON.stringify(this.x);
    data.y = JSON.stringify(this.y);
    data.direction = JSON.stringify(this.direction);
    data.filename = JSON.stringify(this.filename);
    data.outputsInv = JSON.stringify(this.outputsInv);
    data.inputsInv = JSON.stringify(this.inputsInv);
    return data;
};

/*
    Sets the coordinates, rounded to grid size
*/
CustomSketch.prototype.setCoordinates = function (nx, ny) {
    this.x = Math.round((nx - GRIDSIZE / 2) / GRIDSIZE) * GRIDSIZE;
    this.y = Math.round((ny - GRIDSIZE / 2) / GRIDSIZE) * GRIDSIZE;
};

/*
    Updates width and height of the object and all clickboxes
*/

CustomSketch.prototype.reSize = function () {
    this.tops = 0;
    for (const elem of this.objects[INPNUM]) {
        if (elem.isTop) {
            this.tops++;
        }
    }
    if (this.direction % 2 === 0) {
        this.w = 2 * GRIDSIZE + Math.max(this.tops - 1, 0) * GRIDSIZE;
        this.h = 2 * GRIDSIZE + GRIDSIZE * Math.max(this.inputCount - 1 - this.tops, this.outputCount - 1);
    } else {
        this.w = 2 * GRIDSIZE + GRIDSIZE * Math.max(this.inputCount - 1 - this.tops, this.outputCount - 1);
        this.h = 2 * GRIDSIZE + Math.max(this.tops - 1, 0) * GRIDSIZE;
    }
    this.gridHeight = Math.max(this.inputCount - this.tops, this.outputCount) + 1;
    this.updateClickBoxes();
};

/*
    Sets input #i to state s
*/
CustomSketch.prototype.setInput = function (i, s) {
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
    Alters the position of the object
*/
CustomSketch.prototype.alterPosition = function (x1, y1) {
    this.x += x1;
    this.y += y1;
    this.setCoordinates(this.x, this.y);
    this.updateClickBoxes();
};

/*
    All objects (gates, wires, etc.) are stored as one multidimensional
    array, containing the objects loaded from file in sketch.js
*/
CustomSketch.prototype.setSketchParams = function (params) {
    this.objects = params;
    this.inputCount = this.objects[INPNUM].length;
    this.outputCount = this.objects[OUTPNUM].length;
    this.gClickBox = new ClickBox(this.x, this.y, this.w, this.h, this.transform);
    this.inputClickBoxes = [];
    this.outputClickBoxes = [];

    for (let i = 0; i < this.inputCount; i++) {
        this.inputs.push(false); // Set all inputs to low
        this.ipset.push(false);
        this.inputClickBoxes.push(new ClickBox(0, 0, IOCBSIZE, IOCBSIZE, this.transform)); // Create new clickBoxes for every input
    }

    // Initialize the outputs
    for (let i = 0; i < this.outputCount; i++) {
        this.outputs.push(false); // Set all outputs to low
        this.outputClickBoxes.push(new ClickBox(0, 0, IOCBSIZE, IOCBSIZE, this.transform)); // Create new clickBoxes for every output
    }

    this.reSize(); // Double resizing necessary
    this.setCoordinates(this.x, this.y);
    this.reSize();
};

/*
    Sets the caption of the object
*/
CustomSketch.prototype.setCaption = function (caption) {
    this.caption = caption;
};

/*
    Gives the state of output i
*/
CustomSketch.prototype.getOutput = function (i) {
    return this.outputs[i];
};

/*
    Connection point functionality should be maintained
    so that wire crossings are parsed correct
*/
CustomSketch.prototype.isConPoint = function (x, y) {
    for (let i = 0; i < this.objects[CPNUM].length; i++) {
        if (this.objects[CPNUM][i].x === x && this.objects[CPNUM][i].y === y) {
            return i;
        }
    }
    return -1;
};

/*
    Updates all groups of the sketch
*/
CustomSketch.prototype.updateGroups = function () {
    for (let i = 0; i < this.groups.length; i++) {
        this.groups[i].updateAll();
    }
};

/*
    Gives a list of all wires that have an end in x, y, except wire j
*/
CustomSketch.prototype.wirePoints = function (x, y, j) {
    let indexList = [];
    for (let i = 0; i < this.objects[WIRENUM].length; i++) {
        if (((this.objects[WIRENUM][i].direction === 0 && this.objects[WIRENUM][i].endX <= x && this.objects[WIRENUM][i].startX >= x && this.objects[WIRENUM][i].startY === y) ||
            (this.objects[WIRENUM][i].direction === 1 && this.objects[WIRENUM][i].endY <= y && this.objects[WIRENUM][i].startY >= y && this.objects[WIRENUM][i].startX === x) ||
            (this.objects[WIRENUM][i].direction === 0 && this.objects[WIRENUM][i].startX <= x && this.objects[WIRENUM][i].endX >= x && this.objects[WIRENUM][i].startY === y) ||
            (this.objects[WIRENUM][i].direction === 1 && this.objects[WIRENUM][i].startY <= y && this.objects[WIRENUM][i].endY >= y && this.objects[WIRENUM][i].startX === x)) &&
            (i !== j)) {
            indexList.push(i);
        }
    }
    return indexList;
};

CustomSketch.prototype.wireConnect = function (wire) {
    let indexList = [];
    for (let i = 0; i < this.objects[WIRENUM].length; i++) {
        if (wire.direction === 0 && this.objects[WIRENUM][i].direction === 1) {
            if ((this.objects[WIRENUM][i].startY <= wire.startY && this.objects[WIRENUM][i].endY === wire.startY && this.objects[WIRENUM][i].startX >= wire.startX && this.objects[WIRENUM][i].startX <= wire.endX) ||
                (this.objects[WIRENUM][i].startY === wire.startY && this.objects[WIRENUM][i].endY >= wire.startY && this.objects[WIRENUM][i].startX >= wire.startX && this.objects[WIRENUM][i].startX <= wire.endX) ||
                (this.objects[WIRENUM][i].startY <= wire.startY && this.objects[WIRENUM][i].endY >= wire.startY && this.objects[WIRENUM][i].startX >= wire.startX && this.objects[WIRENUM][i].startX === wire.endX) ||
                (this.objects[WIRENUM][i].startY <= wire.startY && this.objects[WIRENUM][i].endY >= wire.startY && this.objects[WIRENUM][i].startX === wire.startX && this.objects[WIRENUM][i].startX <= wire.endX)) {
                indexList.push(i);
            }
        } else if (wire.direction === 1 && this.objects[WIRENUM][i].direction === 0) {
            if ((wire.startY <= this.objects[WIRENUM][i].startY && wire.endY === this.objects[WIRENUM][i].startY && wire.startX >= this.objects[WIRENUM][i].startX && wire.startX <= this.objects[WIRENUM][i].endX) ||
                (wire.startY === this.objects[WIRENUM][i].startY && wire.endY >= this.objects[WIRENUM][i].startY && wire.startX >= this.objects[WIRENUM][i].startX && wire.startX <= this.objects[WIRENUM][i].endX) ||
                (wire.startY <= this.objects[WIRENUM][i].startY && wire.endY >= this.objects[WIRENUM][i].startY && wire.startX >= this.objects[WIRENUM][i].startX && wire.startX === this.objects[WIRENUM][i].endX) ||
                (wire.startY <= this.objects[WIRENUM][i].startY && wire.endY >= this.objects[WIRENUM][i].startY && wire.startX === this.objects[WIRENUM][i].startX && wire.startX <= this.objects[WIRENUM][i].endX)) {
                indexList.push(i);
            }
        }
    }
    return indexList;
};


CustomSketch.prototype.listConpoints = function (x1, y1, x2, y2) {
    let cps = [];
    if (y1 === y2) {
        for (let i = 0; i < this.objects[CPNUM].length; i++) {
            if (this.objects[CPNUM][i].x > x1 && this.objects[CPNUM][i].x < x2 && this.objects[CPNUM][i].y === y1) {
                cps.push(i);
            }
        }
    } else {
        for (let i = 0; i < this.objects[CPNUM].length; i++) {
            if (this.objects[CPNUM][i].y > y1 && this.objects[CPNUM][i].y < y2 && this.objects[CPNUM][i].x === x1) {
                cps.push(i);
            }
        }
    }
    return cps;
};

CustomSketch.prototype.wiresTrough = function (x, y, j) {
    let indexList = [];
    for (let i = 0; i < this.objects[WIRENUM].length; i++) {
        if (((this.objects[WIRENUM][i].direction === 0 && this.objects[WIRENUM][i].endX < x && this.objects[WIRENUM][i].startX > x && this.objects[WIRENUM][i].startY === y) ||
            (this.objects[WIRENUM][i].direction === 1 && this.objects[WIRENUM][i].endY < y && this.objects[WIRENUM][i].startY > y && this.objects[WIRENUM][i].startX === x) ||
            (this.objects[WIRENUM][i].direction === 0 && this.objects[WIRENUM][i].startX < x && this.objects[WIRENUM][i].endX > x && this.objects[WIRENUM][i].startY === y) ||
            (this.objects[WIRENUM][i].direction === 1 && this.objects[WIRENUM][i].startY < y && this.objects[WIRENUM][i].endY > y && this.objects[WIRENUM][i].startX === x)) &&
            (i !== j)) {
            indexList.push(i);
        }
    }
    return indexList;
};

CustomSketch.prototype.parseGroups = function () {
    this.traced = [];
    this.groups = [];
    for (let i = 0; i < this.objects[WIRENUM].length; i++) {
        if (this.traced.indexOf(i) < 0) { // If the segment wasn't included in a group yet
            this.exploreGroup(i); // Explore a new group starting at this segment
        }
    }
};

CustomSketch.prototype.exploreGroup = function (wire) {
    this.groups.push(new Group());
    this.exGroup(wire, this.groups.length - 1);
};

CustomSketch.prototype.exGroup = function (j, g) {
    this.objects[WIRENUM][j].setGroup(g);
    this.groups[g].addWire(this.objects[WIRENUM][j]);
    this.traced.push(j);

    let connected = this.wireConnect(this.objects[WIRENUM][j]); // Gives all connected wires (no full crossings)

    for (let elem of this.listConpoints(this.objects[WIRENUM][j].startX, this.objects[WIRENUM][j].startY, this.objects[WIRENUM][j].endX, this.objects[WIRENUM][j].endY)) {
        this.objects[CPNUM][elem].setGroup(g);
        let troughWire = this.wiresTrough(this.objects[CPNUM][elem].x, this.objects[CPNUM][elem].y, j);
        if (troughWire.length === 1) {
            connected.push(troughWire[0]);
        }
    }

    // Trace the remaining wires recursivly
    for (let i = 0; i < connected.length; i++) {
        if (this.traced.indexOf(connected[i]) < 0) {
            this.exGroup(connected[i], g);
        }
    }
};

/*
    Integrates all sketch elements into the wire groups
*/
CustomSketch.prototype.integrateElements = function () {
    for (let j = 0; j < this.objects[GATENUM].length; j++) {
        for (let k = 0; k < this.objects[GATENUM][j].outputCount; k++) {
            let outputWires = this.wirePoints(this.objects[GATENUM][j].outputClickBoxes[k].x, this.objects[GATENUM][j].outputClickBoxes[k].y, -1);
            if (outputWires.length > 0) {
                this.groups[this.objects[WIRENUM][outputWires[0]].group].addOutput(this.objects[GATENUM][j], k);
            }
        }
        for (let k = 0; k < this.objects[GATENUM][j].inputCount; k++) {
            let inputWires = this.wirePoints(this.objects[GATENUM][j].inputClickBoxes[k].x, this.objects[GATENUM][j].inputClickBoxes[k].y, -1);
            if (inputWires.length > 0) {
                this.groups[this.objects[WIRENUM][inputWires[0]].group].addInput(this.objects[GATENUM][j], k);
            }
        }
    }

    for (let j = 0; j < this.objects[CUSTNUM].length; j++) {
        for (let k = 0; k < this.objects[CUSTNUM][j].outputCount; k++) {
            let outputWires = this.wirePoints(this.objects[CUSTNUM][j].outputClickBoxes[k].x, this.objects[CUSTNUM][j].outputClickBoxes[k].y, -1);
            if (outputWires.length > 0) {
                this.groups[this.objects[WIRENUM][outputWires[0]].group].addOutput(this.objects[CUSTNUM][j], k);
            }
        }
        for (let k = 0; k < this.objects[CUSTNUM][j].inputCount; k++) {
            let inputWires = this.wirePoints(this.objects[CUSTNUM][j].inputClickBoxes[k].x, this.objects[CUSTNUM][j].inputClickBoxes[k].y, -1);
            if (inputWires.length > 0) {
                this.groups[this.objects[WIRENUM][inputWires[0]].group].addInput(this.objects[CUSTNUM][j], k);
            }
        }
    }

    for (let j = 0; j < this.objects[INPNUM].length; j++) {
        let outputWires = this.wirePoints(this.objects[INPNUM][j].clickBox.x, this.objects[INPNUM][j].clickBox.y, -1);
        if (outputWires.length > 0) {
            this.groups[this.objects[WIRENUM][outputWires[0]].group].addOutput(this.objects[INPNUM][j], 0);
        }
    }

    for (let j = 0; j < this.objects[OUTPNUM].length; j++) {
        let inputWires = this.wirePoints(this.objects[OUTPNUM][j].clickBox.x, this.objects[OUTPNUM][j].clickBox.y, -1);
        if (inputWires.length > 0) {
            this.groups[this.objects[WIRENUM][inputWires[0]].group].addInput(this.objects[OUTPNUM][j], 0);
        }
    }

    for (let j = 0; j < this.objects[DINUM].length; j++) {
        let diodeWires = this.wiresTrough(this.objects[DINUM][j].clickBox.x, this.objects[DINUM][j].clickBox.y, -1);
        if (diodeWires.length > 1) {
            if (this.objects[WIRENUM][diodeWires[0]].direction === 0 && this.objects[WIRENUM][diodeWires[1]].direction === 1) {
                this.objects[DINUM][j].setGroups(this.objects[WIRENUM][diodeWires[0]].group, this.objects[WIRENUM][diodeWires[1]].group);
            } else if (this.objects[WIRENUM][diodeWires[0]].direction === 1 && this.objects[WIRENUM][diodeWires[1]].direction === 0) {
                this.objects[DINUM][j].setGroups(this.objects[WIRENUM][diodeWires[1]].group, this.objects[WIRENUM][diodeWires[0]].group);
            }
        }
    }
};

/*
    Sets the simRunning parameter
    simRunning should be equal to sketch.js' simRunning
*/
CustomSketch.prototype.setSimRunning = function (simRunning) {
    this.simRunning = simRunning;
    if (this.simRunning && !this.parsed) {
        this.parsed = true;
        this.parseGroups();
        this.integrateElements();
    } else {
        for (let i = 0; i < this.objects[GATENUM].length; i++) {
            this.objects[GATENUM][i].shutdown();
        }
        for (let i = 0; i < this.objects[CUSTNUM].length; i++) {
            this.objects[CUSTNUM][i].setSimRunning(false);
        }
        for (let i = 0; i < this.objects[CPNUM].length; i++) {
            this.objects[CPNUM][i].state = false;
        }
        for (let i = 0; i < this.objects[OUTPNUM].length; i++) {
            this.objects[OUTPNUM][i].state = false;
        }
        for (let i = 0; i < this.objects[DINUM].length; i++) {
            this.objects[DINUM][i].state = false;
        }
        for (let i = 0; i < this.objects[INPNUM].length; i++) {
            this.objects[INPNUM][i].state = false;
            this.objects[INPNUM][i].outputs = false;
        }
        for (let i = 0; i < this.outputCount; i++) {
            this.outputs[i] = false;
        }
        for (let i = 0; i < this.inputCount; i++) {
            this.inputs[i] = false;
            this.ipset[i] = false;
        }
    }
};

/*
    Updates the logic of the custom object
*/
CustomSketch.prototype.update = function () {
    for (let i = 0; i < this.inputCount; i++) {
        if (!this.ipset[i]) {
            this.inputs[i] = this.inputsInv[i];
        }
        // Set all inputs to the corresponding input pins
        this.objects[INPNUM][i].setState(this.inputs[i]);
    }

    for (let i = 0; i < this.objects[GATENUM].length; i++) {
        this.objects[GATENUM][i].update(); // Update all gates
    }

    for (let i = 0; i < this.objects[CUSTNUM].length; i++) {
        this.objects[CUSTNUM][i].update(); // Update all customs
    }
    this.updateGroups();

    // Set all output pins to the corresponding outputs
    for (let i = 0; i < this.outputCount; i++) {
        this.outputs[i] = this.objects[OUTPNUM][i].state;
        if (this.outputsInv[i]) {
            this.outputs[i] = !this.outputs[i];
        }
    }

    for (let i = 0; i < this.objects[DINUM].length; i++) {
        if (this.groups[this.objects[DINUM][i].groupA].state) {
            this.groups[this.objects[DINUM][i].groupB].diodeHigh();
        }
        this.objects[DINUM][i].state = this.groups[this.objects[DINUM][i].groupA].state;
    }
};

/*
    Inverts the given input
*/
CustomSketch.prototype.invertInput = function (input) {
    this.inputsInv[input] = !this.inputsInv[input]; // Invert isInverted-State
};

/*
    Inverts the given output
*/
CustomSketch.prototype.invertOutput = function (output) {
    this.outputsInv[output] = !this.outputsInv[output]; // Invert isInverted-State
};

CustomSketch.prototype.setParentID = function (pid) {
    this.pid = pid;
};

/*
    Updates the clickBoxes (once after creation)
*/
CustomSketch.prototype.updateClickBoxes = function () {
    // Update input clickBoxes
    let tops = 0;
    for (let i = 0; i < this.inputClickBoxes.length; i++) {
        if (!this.objects[INPNUM][i].isTop) {
            switch (this.direction) {
                case 0: this.inputClickBoxes[i].updatePosition(this.x, this.y + (this.h * ((i - tops) + 1)) / this.gridHeight); break;
                case 1: this.inputClickBoxes[i].updatePosition(this.x + (this.w * ((i - tops) + 1)) / this.gridHeight, this.y); break;
                case 2: this.inputClickBoxes[i].updatePosition(this.x + this.w, this.y + (this.h * ((i - tops) + 1)) / this.gridHeight); break;
                case 3: this.inputClickBoxes[i].updatePosition(this.x + (this.w * ((i - tops) + 1)) / this.gridHeight, this.y + this.h); break;
            }
        } else {
            tops++;
            switch (this.direction) {
                case 0: this.inputClickBoxes[i].updatePosition(this.x + (this.h * tops) / this.gridHeight, this.y); break;
                case 1: this.inputClickBoxes[i].updatePosition(this.x + this.w, this.y + (this.w * tops) / this.gridHeight); break;
                case 2: this.inputClickBoxes[i].updatePosition(this.x + (this.h * tops) / this.gridHeight, this.y + this.h); break;
                case 3: this.inputClickBoxes[i].updatePosition(this.x, this.y + (this.w * tops) / this.gridHeight); break;
            }
        }
        this.inputClickBoxes[i].setTransform(this.transform);
    }

    // Update output clickBoxes
    for (let i = 0; i < this.outputClickBoxes.length; i++) {
        switch (this.direction) {
            case 0: this.outputClickBoxes[i].updatePosition(this.x + this.w, this.y + (this.h * (i + 1)) / this.gridHeight); break;
            case 1: this.outputClickBoxes[i].updatePosition(this.x + (this.w * (i + 1)) / this.gridHeight, this.y + this.h); break;
            case 2: this.outputClickBoxes[i].updatePosition(this.x, this.y + (this.h * (i + 1)) / this.gridHeight); break;
            case 3: this.outputClickBoxes[i].updatePosition(this.x + (this.w * (i + 1)) / this.gridHeight, this.y); break;
        }

        this.outputClickBoxes[i].setTransform(this.transform);
    }
    // Update position and size of the global clickbox of the custom object
    this.gClickBox.updatePosition(this.x + this.w / 2, this.y + this.h / 2);
    if (this.tops === 0) {
        if (this.direction % 2 === 0) {
            this.gClickBox.updateSize(this.w, this.h - GRIDSIZE);
        } else {
            this.gClickBox.updateSize(this.w - GRIDSIZE, this.h);
        }
    } else {
        this.gClickBox.updateSize(this.w, this.h);
    }
    this.gClickBox.setTransform(this.transform);
};

/*
    Checks if the mouse is over the gate
*/
CustomSketch.prototype.mouseOver = function () {
    return this.gClickBox.mouseOver();
};

/*
    Checks if the mouse is over input n
*/
CustomSketch.prototype.mouseOverInput = function (n) {
    return this.inputClickBoxes[n].mouseOver();
};

/*
    Checks if the mouse is over output n
*/
CustomSketch.prototype.mouseOverOutput = function (n) {
    return this.outputClickBoxes[n].mouseOver();
};

/*
    Determines if the given point is in the clickbox of input n
*/
CustomSketch.prototype.pointInInput = function (n, px, py) {
    return this.inputClickBoxes[n].checkPoint(px, py);
};

/*
    Determines if the given point is in the clickbox of output n
*/
CustomSketch.prototype.pointInOutput = function (n, px, py) {
    return this.outputClickBoxes[n].checkPoint(px, py);
};

/*
    Draws the custom object on the screen
*/
CustomSketch.prototype.show = function () {
    let x1, x2, y1, y2;
    stroke(0);
    strokeWeight(3);
    if (this.marked) {
        fill(MRED, MGREEN, MBLUE);
    } else {
        fill(255);
    }

    // Draw the body
    if (this.tops === 0) {
        if (this.direction % 2 === 0) {
            rect(this.x, this.y + GRIDSIZE / 2, this.w, this.h - GRIDSIZE);
        } else {
            rect(this.x + GRIDSIZE / 2, this.y, this.w - GRIDSIZE, this.h);
        }
    } else {
        rect(this.x, this.y, this.w, this.h);
    }

    noStroke();
    textSize(this.textSize);
    textAlign(CENTER, CENTER);
    fill(0);
    text(this.caption, this.x + this.w / 2, this.y + this.h / 2); // Draw text

    let tops = 0;
    // Draw inputs
    for (let i = 1; i <= this.inputCount; i++) {
        // Draw inputs
        if (this.marked) {
            stroke(MRED, MGREEN, MBLUE);
            strokeWeight(3);
        } else if (this.inputs[i - 1] === true) {
            stroke(HRED, HGREEN, HBLUE);
            strokeWeight(5);
        } else {
            stroke(LRED, LGREEN, LBLUE);
            strokeWeight(3);
        }

        if (!this.objects[INPNUM][i - 1].isTop) {
            switch (this.direction) {
                case 0:
                    x1 = this.x - 6;
                    y1 = this.y + (this.h * (i - tops)) / this.gridHeight;
                    x2 = this.x;
                    y2 = this.y + (this.h * (i - tops)) / this.gridHeight;
                    break;
                case 1:
                    x1 = this.x + (this.w * (i - tops)) / this.gridHeight;
                    y1 = this.y - 6;
                    x2 = this.x + (this.w * (i - tops)) / this.gridHeight;
                    y2 = this.y;
                    break;
                case 2:
                    x1 = this.x + this.w;
                    y1 = this.y + (this.h * (i - tops)) / this.gridHeight;
                    x2 = this.x + this.w + 6;
                    y2 = this.y + (this.h * (i - tops)) / this.gridHeight;
                    break;
                case 3:
                    x1 = this.x + (this.w * (i - tops)) / this.gridHeight;
                    y1 = this.y + this.h;
                    x2 = this.x + (this.w * (i - tops)) / this.gridHeight;
                    y2 = this.y + this.h + 6;
                    break;
                default:
                    console.log('Gate direction doesn\'t exist!');
            }
        } else {
            tops++;
            switch (this.direction) {
                case 0:
                    x1 = this.x + (this.h * tops) / this.gridHeight;
                    y1 = this.y - 6;
                    x2 = this.x + (this.h * tops) / this.gridHeight;
                    y2 = this.y;
                    break;
                case 1:
                    x1 = this.x + this.w + 6;
                    y1 = this.y + (this.w * tops) / this.gridHeight;
                    x2 = this.x + this.w;
                    y2 = this.y + (this.w * tops) / this.gridHeight;
                    break;
                case 2:
                    x1 = this.x + (this.h * tops) / this.gridHeight;
                    y1 = this.y + this.h;
                    x2 = this.x + (this.h * tops) / this.gridHeight;
                    y2 = this.y + this.h + 6;
                    break;
                case 3:
                    x1 = this.x;
                    y1 = this.y + (this.w * tops) / this.gridHeight;
                    x2 = this.x - 6;
                    y2 = this.y + (this.w * tops) / this.gridHeight;
                    break;
                default:
                    console.log('Gate direction doesn\'t exist!');
            }
        }
        line(x1, y1, x2, y2);

        fill(255);
        strokeWeight(2);

        if (this.inputsInv[i - 1]) {
            if (!this.objects[INPNUM][i - 1].isTop) {
                switch (this.direction) {
                    case 0: ellipse(x1 + 3, y1, 10, 10); break;
                    case 1: ellipse(x1, y1 + 3, 10, 10); break;
                    case 2: ellipse(x1 + 3, y1, 10, 10); break;
                    case 3: ellipse(x1, y1 + 3, 10, 10); break;
                }
            } else {
                switch (this.direction) {
                    case 0: ellipse(x1, y1 + 3, 10, 10); break;
                    case 1: ellipse(x1 - 3, y1, 10, 10); break;
                    case 2: ellipse(x1, y1 + 3, 10, 10); break;
                    case 3: ellipse(x1 - 3, y1, 10, 10); break;
                }
            }
        }

        fill(0);

        if (this.objects[INPNUM][i - 1].lbl === ">") {
            stroke(0);
            if (!this.objects[INPNUM][i - 1].isTop) {
                switch (this.direction) {
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
                switch (this.direction) {
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
        } else if (this.objects[INPNUM][i - 1].lbl !== '') {
            noStroke();
            textSize(14);
            if (!this.objects[INPNUM][i - 1].isTop) {
                switch (this.direction) {
                    case 0: text(this.objects[INPNUM][i - 1].lbl, x2 + 10, y1); break;
                    case 1: text(this.objects[INPNUM][i - 1].lbl, x1, y2 + 10); break;
                    case 2: text(this.objects[INPNUM][i - 1].lbl, x1 - 10, y1); break;
                    case 3: text(this.objects[INPNUM][i - 1].lbl, x1, y1 - 10); break;
                }
            } else {
                switch (this.direction) {
                    case 0: text(this.objects[INPNUM][i - 1].lbl, x1, y2 + 10); break;
                    case 1: text(this.objects[INPNUM][i - 1].lbl, x2 - 10, y1); break;
                    case 2: text(this.objects[INPNUM][i - 1].lbl, x1, y1 - 10); break;
                    case 3: text(this.objects[INPNUM][i - 1].lbl, x1 + 10, y1); break;
                }
            }
        }
    }

    // Draw outputs
    for (let i = 1; i <= this.outputCount; i++) {
        // Draw outputs
        if (this.marked) {
            stroke(MRED, MGREEN, MBLUE);
            strokeWeight(3);
        } else if (this.outputs[i - 1] === true) {
            stroke(HRED, HGREEN, HBLUE);
            strokeWeight(5);
        } else {
            stroke(LRED, LGREEN, LBLUE);
            strokeWeight(3);
        }

        switch (this.direction) {
            case 0:
                x1 = this.x + this.w;
                y1 = this.y + (this.h * i) / this.gridHeight;
                x2 = this.x + this.w + 6;
                y2 = this.y + (this.h * i) / this.gridHeight;
                break;
            case 1:
                x1 = this.x + (this.w * i) / this.gridHeight;
                y1 = this.y + this.h;
                x2 = this.x + (this.w * i) / this.gridHeight;
                y2 = this.y + this.h + 6;
                break;
            case 2:
                x1 = this.x - 6;
                y1 = this.y + (this.h * i) / this.gridHeight;
                x2 = this.x;
                y2 = this.y + (this.h * i) / this.gridHeight;
                break;
            case 3:
                x1 = this.x + (this.w * i) / this.gridHeight;
                y1 = this.y;
                x2 = this.x + (this.w * i) / this.gridHeight;
                y2 = this.y - 6;
                break;
            default:
                console.log('Gate direction doesn\'t exist!');
        }
        line(x1, y1, x2, y2);

        fill(255);
        strokeWeight(2);

        if (this.outputsInv[i - 1]) {
            switch (this.direction) {
                case 0: ellipse(x1 + 3, y1, 10, 10); break;
                case 1: ellipse(x1, y1 + 3, 10, 10); break;
                case 2: ellipse(x1 + 3, y1, 10, 10); break;
                case 3: ellipse(x1, y1 - 3, 10, 10); break;
            }
        }

        fill(0);
        noStroke();
        textSize(14);
        if (this.objects[OUTPNUM][i - 1].lbl !== "") {
            switch (this.direction) {
                case 0: text(this.objects[OUTPNUM][i - 1].lbl, x1 - 10, y1); break;
                case 1: text(this.objects[OUTPNUM][i - 1].lbl, x1, y1 - 10); break;
                case 2: text(this.objects[OUTPNUM][i - 1].lbl, x1 + 16, y1); break;
                case 3: text(this.objects[OUTPNUM][i - 1].lbl, x1, y1 + 10); break;
            }
        }
    }

    // Uncomment to show global clickbox
    // this.gClickBox.markClickBox();
    // Uncomment to show clickboxes of in- and outputs
    /*
    for (let i = 0; i < this.inputClickBoxes.length; i++) {
        this.inputClickBoxes[i].markClickBox();
    }
    for (let i = 0; i < this.outputClickBoxes.length; i++) {
        this.outputClickBoxes[i].markClickBox();
    }
    */
};