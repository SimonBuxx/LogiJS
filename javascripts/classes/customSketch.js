// File: customSketch.js

function CustomSketch(x, y, direction, file) {
    this.x = x; // X-Position of the Custom object
    this.y = y; // Y-Position

    this.direction = direction; // Direction (0 = inputs left)
    this.inputCount = 0;        // Number of inputs
    this.outputCount = 0;       // Number of outputs

    this.w = 2 * GRIDSIZE;      // Width of the custom object in pixels
    this.h = 2 * GRIDSIZE + GRIDSIZE * Math.max(this.inputCount - 1, this.outputCount - 1); // Height in pixels

    this.gridHeight = Math.max(this.outputCount + 1, this.inputCount + 1); // Height of the custom object in grid cells

    this.objects = [];    // Contains all objects (gates, wires, etc.) the custom object consists of
    this.filename = file; // The name of the json file the custom object is loaded from

    this.inputs = [];     // Vector of the input states
    this.ipBusWidths = [];
    this.inputLabels = [];
    this.ipset = [];      // true, if the input state is set (if a wire is connected to the input)
    this.istop = [];
    this.outputs = [];    // Vector of the output state
    this.inputsInv = [];  // true, if input is inverted
    this.outputsInv = []; // true, if output is inverted

    this.responsibles = []; // Contains all custom objects that are included in this custom
    // This custom object is responsible for a certain amount of other custom objects
    // that are managed by the main sketch

    // Variables for wire tracing (Wires are grouped as in sketch.js)
    this.traced = [];
    this.groups = [];
    this.busGroups = [];

    this.caption = '';    // Caption of the custom object
    this.textSize = 10;   // Text size of the caption

    this.inputClickBoxes = []; // Clickboxes for inputs and outputs
    this.outputClickBoxes = [];

    this.marked = false; // True, if the object is marked in the selection mode

    this.gClickBox = new ClickBox(this.x, this.y, this.w, this.h, transform); // Global clickbox

    this.visible = true; // True, if the object is visible and not part of another object

    this.simRunning = false; // True, when the simulation is running
    this.tops = 0;           // Number of inputs to draw on top of the object

    this.id = 'c' + Date.now() + Math.random();
    this.pid = null;

    this.parsed = false; // true, if the components have been rendered once

    this.initialized = false;
}

CustomSketch.prototype.getDependencyIDs = function () {
    let ids = [];
    for (let i = 0; i < this.responsibles.length; i++) {
        ids.push(this.responsibles[i].id);
        ids = ids.concat(this.responsibles[i].getDependencyIDs());
    }
    return ids;
};

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
    for (const elem of this.objects[BUSINNUM]) {
        if (elem.isTop) {
            this.tops++;
        }
    }
    if (this.direction % 2 === 0) {
        this.w = 2 * GRIDSIZE + Math.max(this.tops - 1, 0) * GRIDSIZE;
        this.h = 2 * GRIDSIZE + GRIDSIZE * Math.max(this.inputCount + this.objects[BUSINNUM].length - 1 - this.tops, this.outputCount - 1);
    } else {
        this.w = 2 * GRIDSIZE + GRIDSIZE * Math.max(this.inputCount + this.objects[BUSINNUM].length - 1 - this.tops, this.outputCount - 1);
        this.h = 2 * GRIDSIZE + Math.max(this.tops - 1, 0) * GRIDSIZE;
    }
    this.gridHeight = Math.max(this.inputCount + this.objects[BUSINNUM].length - this.tops, this.outputCount) + 1;
    this.updateClickBoxes();
};

/*
    Sets input #i to state or state vector s
*/
CustomSketch.prototype.setInput = function (i, s) {
    if (i < this.inputCount + this.objects[BUSINNUM].length) {
        if (this.ipBusWidths[i] === 0) {
            this.inputs[i] = s; // Set state
            if (this.inputsInv[i]) {
                this.inputs[i] = !this.inputs[i];
            }
        } else {
            this.inputs[i] = s.slice(s.length - this.ipBusWidths[i], s.length);
        }
        this.ipset[i] = true;

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
    this.outputs = [];
    this.inputCount = this.objects[INPNUM].length;
    this.outputCount = this.objects[OUTPNUM].length;
    this.gClickBox = new ClickBox(this.x, this.y, this.w, this.h, transform);
    this.outputClickBoxes = [];

    this.resetInputs();

    // Initialize the outputs
    for (let i = 0; i < this.outputCount; i++) {
        this.outputs.push(false); // Set all outputs to low
        this.outputClickBoxes.push(new ClickBox(0, 0, IOCBSIZE, IOCBSIZE, transform)); // Create new clickBoxes for every output
    }

    this.reSize(); // Double resizing necessary
    this.setCoordinates(this.x, this.y);
    this.reSize();

    this.initialized = true;
};

CustomSketch.prototype.resetInputs = function () {
    this.inputs = [];
    this.ipBusWidths = [];
    this.ipset = [];
    this.istop = [];
    this.inputClickBoxes = [];
    this.inputLabels = [];

    /*for (let i = 0; i < this.inputCount; i++) {
        this.inputs.push(false); // Set all inputs to low
        this.ipset.push(false);
        this.inputClickBoxes.push(new ClickBox(0, 0, IOCBSIZE, IOCBSIZE, transform)); // Create new clickBoxes for every input
        this.istop.push(this.objects[INPNUM][i].isTop);
        this.inputLabels.push(this.objects[INPNUM][i].lbl);
    }*/

    //this.ipBusWidths = Array(this.inputCount).fill(0);

    // New concept: push inputs and bus inputs in the same loop, according to their custPos
    // Step 1: Order inputs and bus inputs after custPos (in their arrays)
    // Step 2: In loop over full length: if nextInput.custPos === i => push input, if nextBusInput.custPos = i => push bus input

    this.objects[INPNUM].sort(function (a, b) {return a.custPosition - b.custPosition});
    this.objects[BUSINNUM].sort(function (a, b) {return a.custPosition - b.custPosition});

    let nextInput = 0, nextBusInput = 0;
    for (let i = 0; i < this.inputCount + this.objects[BUSINNUM].length; i++) {
        console.log('Looking for input #' + i);
        this.ipset.push(false);
        this.inputClickBoxes.push(new ClickBox(0, 0, IOCBSIZE, IOCBSIZE, transform));
        if (this.inputCount > nextInput && this.objects[INPNUM][nextInput].custPosition === i) {
            console.log('   Found input #' + i + ', a regular input. Next regular input: ' + (nextInput + 1));
            this.inputs.push(false);
            this.ipBusWidths.push(0);
            this.istop.push(this.objects[INPNUM][nextInput].isTop);
            this.inputLabels.push(this.objects[INPNUM][nextInput].lbl);
            nextInput++;
        } else if ((this.objects[BUSINNUM].length > nextBusInput && this.objects[BUSINNUM][nextBusInput].custPosition === i)) {
            console.log('   Found input #' + i + ', a bus input. Next bus input: ' + (nextBusInput + 1));
            this.inputs.push(Array(this.objects[BUSINNUM][nextBusInput].busWidth).fill(false));
            this.ipBusWidths.push(this.objects[BUSINNUM][nextBusInput].busWidth);
            this.istop.push(this.objects[BUSINNUM][nextBusInput].isTop);
            this.inputLabels.push(this.objects[BUSINNUM][nextBusInput].lbl);
            nextBusInput++;
        } else {
            console.log('   Next input not found!');
        }
    }

    console.log(this.inputs);
    console.log(this.ipset);
    console.log(this.ipBusWidths);

    /*

    // Inserting bus inputs in reverse order (to resolve custPosition ties)
    for (let i = this.objects[BUSINNUM].length - 1; i >= 0; i--) {
        // Add the bus input state vector to the input states at the designated position
        this.inputs.splice(this.objects[BUSINNUM][i].custPosition, 0, Array(this.objects[BUSINNUM][i].busWidth).fill(false));
        this.ipBusWidths.splice(this.objects[BUSINNUM][i].custPosition, 0, this.objects[BUSINNUM][i].busWidth);
        this.ipset.splice(this.objects[BUSINNUM][i].custPosition, 0, false);
        //this.inputsInv.splice(this.objects[BUSINNUM][i].custPosition, 0, false);
        this.istop.splice(this.objects[BUSINNUM][i].custPosition, 0, this.objects[BUSINNUM][i].isTop);
        this.inputClickBoxes.splice(this.objects[BUSINNUM][i].custPosition, 0, new ClickBox(0, 0, IOCBSIZE, IOCBSIZE, transform));
        this.inputLabels.splice(this.objects[BUSINNUM][i].custPosition, 0, this.objects[BUSINNUM][i].lbl);
    }

    */
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

CustomSketch.prototype.updateBusGroups = function () {
    for (let i = 0; i < this.busGroups.length; i++) {
        this.busGroups[i].updateAll();
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

CustomSketch.prototype.busPoints = function (x, y, j) {
    let indexList = [];
    for (let i = 0; i < this.objects[BUSNUM].length; i++) {
        if (((this.objects[BUSNUM][i].direction === 0 && this.objects[BUSNUM][i].endX <= x && this.objects[BUSNUM][i].startX >= x && this.objects[BUSNUM][i].startY === y) ||
            (this.objects[BUSNUM][i].direction === 1 && this.objects[BUSNUM][i].endY <= y && this.objects[BUSNUM][i].startY >= y && this.objects[BUSNUM][i].startX === x) ||
            (this.objects[BUSNUM][i].direction === 0 && this.objects[BUSNUM][i].startX <= x && this.objects[BUSNUM][i].endX >= x && this.objects[BUSNUM][i].startY === y) ||
            (this.objects[BUSNUM][i].direction === 1 && this.objects[BUSNUM][i].startY <= y && this.objects[BUSNUM][i].endY >= y && this.objects[BUSNUM][i].startX === x)) &&
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

CustomSketch.prototype.busConnect = function (bus) {
    let indexList = [];
    for (let i = 0; i < this.objects[BUSNUM].length; i++) {
        if (bus.direction === 0 && this.objects[BUSNUM][i].direction === 1) {
            if ((this.objects[BUSNUM][i].startY <= bus.startY && this.objects[BUSNUM][i].endY === bus.startY && this.objects[BUSNUM][i].startX >= bus.startX && this.objects[BUSNUM][i].startX <= bus.endX) ||
                (this.objects[BUSNUM][i].startY === bus.startY && this.objects[BUSNUM][i].endY >= bus.startY && this.objects[BUSNUM][i].startX >= bus.startX && this.objects[BUSNUM][i].startX <= bus.endX) ||
                (this.objects[BUSNUM][i].startY <= bus.startY && this.objects[BUSNUM][i].endY >= bus.startY && this.objects[BUSNUM][i].startX >= bus.startX && this.objects[BUSNUM][i].startX === bus.endX) ||
                (this.objects[BUSNUM][i].startY <= bus.startY && this.objects[BUSNUM][i].endY >= bus.startY && this.objects[BUSNUM][i].startX === bus.startX && this.objects[BUSNUM][i].startX <= bus.endX)) {
                indexList.push(i);
            }
        } else if (bus.direction === 1 && this.objects[BUSNUM][i].direction === 0) {
            if ((bus.startY <= this.objects[BUSNUM][i].startY && bus.endY === this.objects[BUSNUM][i].startY && bus.startX >= this.objects[BUSNUM][i].startX && bus.startX <= this.objects[BUSNUM][i].endX) ||
                (bus.startY === this.objects[BUSNUM][i].startY && bus.endY >= this.objects[BUSNUM][i].startY && bus.startX >= this.objects[BUSNUM][i].startX && bus.startX <= this.objects[BUSNUM][i].endX) ||
                (bus.startY <= this.objects[BUSNUM][i].startY && bus.endY >= this.objects[BUSNUM][i].startY && bus.startX >= this.objects[BUSNUM][i].startX && bus.startX === this.objects[BUSNUM][i].endX) ||
                (bus.startY <= this.objects[BUSNUM][i].startY && bus.endY >= this.objects[BUSNUM][i].startY && bus.startX === this.objects[BUSNUM][i].startX && bus.startX <= this.objects[BUSNUM][i].endX)) {
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

CustomSketch.prototype.bussesTrough = function (x, y, j) {
    let indexList = [];
    for (let i = 0; i < this.objects[BUSNUM].length; i++) {
        if (((this.objects[BUSNUM][i].direction === 0 && this.objects[BUSNUM][i].endX < x && this.objects[BUSNUM][i].startX > x && this.objects[BUSNUM][i].startY === y) ||
            (this.objects[BUSNUM][i].direction === 1 && this.objects[BUSNUM][i].endY < y && this.objects[BUSNUM][i].startY > y && this.objects[BUSNUM][i].startX === x) ||
            (this.objects[BUSNUM][i].direction === 0 && this.objects[BUSNUM][i].startX < x && this.objects[BUSNUM][i].endX > x && this.objects[BUSNUM][i].startY === y) ||
            (this.objects[BUSNUM][i].direction === 1 && this.objects[BUSNUM][i].startY < y && this.objects[BUSNUM][i].endY > y && this.objects[BUSNUM][i].startX === x)) &&
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

CustomSketch.prototype.parseBusGroups = function () {
    this.traced = [];
    this.busGroups = [];

    for (let i = 0; i < this.objects[BUSNUM].length; i++) {
        if (this.traced.indexOf(i) < 0) { // If the segment wasn't included in a group yet
            this.exploreBusGroup(i); // Explore a new group starting at this segment
        }
    }
};

CustomSketch.prototype.exploreGroup = function (wire) {
    this.groups.push(new Group());
    this.exGroup(wire, this.groups.length - 1);
};

CustomSketch.prototype.exploreBusGroup = function (bus) {
    this.busGroups.push(new BusGroup());
    this.exBusGroup(bus, this.busGroups.length - 1);
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


CustomSketch.prototype.exBusGroup = function (j, g) {
    this.objects[BUSNUM][j].setGroup(g);
    this.busGroups[g].addBus(this.objects[BUSNUM][j]);
    this.traced.push(j);

    let connected = this.busConnect(this.objects[BUSNUM][j]);

    for (let elem of this.listConpoints(this.objects[BUSNUM][j].startX, this.objects[BUSNUM][j].startY, this.objects[BUSNUM][j].endX, this.objects[BUSNUM][j].endY)) {
        this.objects[CPNUM][elem].setGroup(g);
        let troughWire = this.bussesTrough(this.objects[CPNUM][elem].x, this.objects[CPNUM][elem].y, j);
        if (troughWire.length === 1) {
            connected.push(troughWire[0]);
        }
    }

    // Trace the remaining wires recursivly
    for (let i = 0; i < connected.length; i++) {
        if (this.traced.indexOf(connected[i]) < 0) {
            this.exBusGroup(connected[i], g);
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
        for (let k = 0; k < this.objects[CUSTNUM][j].inputCount + this.objects[CUSTNUM][j].objects[BUSINNUM].length; k++) {
            if (this.objects[CUSTNUM][j].ipBusWidths[k] === 0) {
                let inputWires = this.wirePoints(this.objects[CUSTNUM][j].inputClickBoxes[k].x, this.objects[CUSTNUM][j].inputClickBoxes[k].y, -1);
                if (inputWires.length > 0) {
                    this.groups[this.objects[WIRENUM][inputWires[0]].group].addInput(this.objects[CUSTNUM][j], k);
                }
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

    for (let j = 0; j < this.objects[DECNUM].length; j++) {
        if (!this.objects[DECNUM][j].useOutBus) {
            // Connect the output wires as usual
            for (let k = 0; k < Math.pow(2, this.objects[DECNUM][j].inputCount); k++) {
                let outputWires = this.wirePoints(this.objects[DECNUM][j].outputClickBoxes[k].x, this.objects[DECNUM][j].outputClickBoxes[k].y, -1);
                if (outputWires.length > 0) {
                    this.groups[this.objects[WIRENUM][outputWires[0]].group].addOutput(this.objects[DECNUM][j], k);
                }
            }
        } else {
            // This is a bus output component, find a connected bus group
        }

        if (!this.objects[DECNUM][j].useInBus) {
            // Connect the input wires as usual
            for (let k = 0; k < this.objects[DECNUM][j].inputCount; k++) {
                let inputWires = this.wirePoints(this.objects[DECNUM][j].inputClickBoxes[k].x, this.objects[DECNUM][j].inputClickBoxes[k].y, -1);
                if (inputWires.length > 0) {
                    this.groups[this.objects[WIRENUM][inputWires[0]].group].addInput(this.objects[DECNUM][j], k);
                }
            }
        } else {
            // This is a bus input component, find a connected bus group
        }
    }

    for (let j = 0; j < this.objects[WRAPNUM].length; j++) {
        for (let k = 0; k < this.objects[WRAPNUM][j].inputCount; k++) {
            let inputWires = this.wirePoints(this.objects[WRAPNUM][j].inputClickBoxes[k].x, this.objects[WRAPNUM][j].inputClickBoxes[k].y, -1);
            if (inputWires.length > 0) {
                this.groups[this.objects[WIRENUM][inputWires[0]].group].addInput(this.objects[WRAPNUM][j], k);
            }
        }
    }

    for (let j = 0; j < this.objects[UNWRAPNUM].length; j++) {
        for (let k = 0; k < this.objects[UNWRAPNUM][j].outputCount; k++) {
            let outputWires = this.wirePoints(this.objects[UNWRAPNUM][j].outputClickBoxes[k].x, this.objects[UNWRAPNUM][j].outputClickBoxes[k].y, -1);
            if (outputWires.length > 0) {
                this.groups[this.objects[WIRENUM][outputWires[0]].group].addOutput(this.objects[UNWRAPNUM][j], k);
            }
        }
    }
};

CustomSketch.prototype.integrateBusElements = function () {
    for (let j = 0; j < this.objects[CUSTNUM].length; j++) {
        /*for (let k = 0; k < this.objects[CUSTNUM][j].outputCount; k++) {
            let outputWires = this.wirePoints(this.objects[CUSTNUM][j].outputClickBoxes[k].x, this.objects[CUSTNUM][j].outputClickBoxes[k].y, -1);
            if (outputWires.length > 0) {
                this.groups[this.objects[WIRENUM][outputWires[0]].group].addOutput(this.objects[CUSTNUM][j], k);
            }
        }*/
        for (let k = 0; k < this.objects[CUSTNUM][j].inputCount + this.objects[CUSTNUM][j].objects[BUSINNUM].length; k++) {
            if (this.objects[CUSTNUM][j].ipBusWidths[k] > 0) {
                let inputBusses = this.busPoints(this.objects[CUSTNUM][j].inputClickBoxes[k].x, this.objects[CUSTNUM][j].inputClickBoxes[k].y, -1);
                if (inputBusses.length > 0) {
                    this.busGroups[this.objects[BUSNUM][inputBusses[0]].group].addInput(this.objects[CUSTNUM][j], k);
                    if (this.objects[CUSTNUM][j].ipBusWidths[k] > this.busGroups[this.objects[BUSNUM][inputBusses[0]].group].busWidth) {
                        this.busGroups[this.objects[BUSNUM][inputBusses[0]].group].updateBusWidth(this.objects[CUSTNUM][j].ipBusWidths[k]);
                    }
                }
            }

        }
    }

    for (let j = 0; j < this.objects[DECNUM].length; j++) {
        /*if (this.objects[DECNUM][j].useOutBus) {
            // Connect the output wires as usual
            for (let k = 0; k < Math.pow(2, this.objects[DECNUM][j].inputCount); k++) {
                let outputWires = this.wirePoints(this.objects[DECNUM][j].outputClickBoxes[k].x, this.objects[DECNUM][j].outputClickBoxes[k].y, -1);
                if (outputWires.length > 0) {
                    this.groups[this.objects[WIRENUM][outputWires[0]].group].addOutput(this.objects[DECNUM][j], k);
                }
            }
        } else {
            // This is a bus output component, find a connected bus group
        }*/

        if (this.objects[DECNUM][j].useInBus) {
            let inputBusses = this.busPoints(this.objects[DECNUM][j].inputClickBox.x, this.objects[DECNUM][j].inputClickBox.y, -1);
            if (inputBusses.length > 0) {
                this.busGroups[this.objects[BUSNUM][inputBusses[0]].group].addInput(this.objects[DECNUM][j], 0);
                if (this.objects[DECNUM][j].inputCount > this.busGroups[this.objects[BUSNUM][inputBusses[0]].group].busWidth) {
                    this.busGroups[this.objects[BUSNUM][inputBusses[0]].group].updateBusWidth(this.objects[DECNUM][j].inputCount);
                }
            }
        } else {
            // This is a bus input component, find a connected bus group
        }
    }

    for (let j = 0; j < this.objects[BUSINNUM].length; j++) {
        let outputBusses = this.busPoints(this.objects[BUSINNUM][j].clickBox.x, this.objects[BUSINNUM][j].clickBox.y, -1);
        if (outputBusses.length > 0) {
            this.busGroups[this.objects[BUSNUM][outputBusses[0]].group].addOutput(this.objects[BUSINNUM][j], 0);
            if (this.objects[BUSINNUM][j].busWidth > this.busGroups[this.objects[BUSNUM][outputBusses[0]].group].busWidth) {
                this.busGroups[this.objects[BUSNUM][outputBusses[0]].group].updateBusWidth(this.objects[BUSINNUM][j].busWidth);
            }
        }
    }

    for (let j = 0; j < this.objects[WRAPNUM].length; j++) {
        let inputBusses = this.busPoints(this.objects[WRAPNUM][j].outputClickBox.x, this.objects[WRAPNUM][j].outputClickBox.y, -1);
        if (inputBusses.length > 0) {
            this.busGroups[this.objects[BUSNUM][inputBusses[0]].group].addOutput(this.objects[WRAPNUM][j], 0);
            if (this.objects[WRAPNUM][j].inputCount > this.busGroups[this.objects[BUSNUM][inputBusses[0]].group].busWidth) {
                this.busGroups[this.objects[BUSNUM][inputBusses[0]].group].updateBusWidth(this.objects[WRAPNUM][j].inputCount);
            }
        }
    }

    for (let j = 0; j < this.objects[UNWRAPNUM].length; j++) {
        let outputBusses = this.busPoints(this.objects[UNWRAPNUM][j].inputClickBox.x, this.objects[UNWRAPNUM][j].inputClickBox.y, -1);
        if (outputBusses.length > 0) {
            this.busGroups[this.objects[BUSNUM][outputBusses[0]].group].addInput(this.objects[UNWRAPNUM][j], 0);
            if (this.objects[UNWRAPNUM][j].outputCount > this.busGroups[this.objects[BUSNUM][outputBusses[0]].group].busWidth) {
                this.busGroups[this.objects[BUSNUM][outputBusses[0]].group].updateBusWidth(this.objects[UNWRAPNUM][j].outputCount);
            }
        }
    }

    for (let i = 0; i < this.busGroups.length; i++) {
        this.busGroups[i].updateBusWidth();
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
        this.parseBusGroups();
        this.integrateBusElements();
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
        for (let i = 0; i < this.objects[DECNUM].length; i++) {
            this.objects[DECNUM][i].shutdown();
        }
        for (let i = 0; i < this.objects[BUSINNUM].length; i++) {
            this.objects[BUSINNUM][i].setFalse();
        }
        for (let i = 0; i < this.objects[WRAPNUM].length; i++) {
            this.objects[WRAPNUM][i].shutdown();
        }
        for (let i = 0; i < this.objects[UNWRAPNUM].length; i++) {
            this.objects[UNWRAPNUM][i].shutdown();
        }
        for (let i = 0; i < this.outputCount; i++) {
            this.outputs[i] = false;
        }
        this.resetInputs();
        this.updateClickBoxes();
    }
};

/*
    Updates the logic of the custom object
*/
CustomSketch.prototype.update = function () {
    for (let i = 0; i < this.inputCount + this.objects[BUSINNUM].length; i++) {
        if (this.ipBusWidths[i] === 0) {
            if (!this.ipset[i]) {
                this.inputs[i] = this.inputsInv[i];
            }
            // Set all inputs to the corresponding input pins
            this.objects[INPNUM][i - this.ipBusWidths.slice(0, i).filter(value => value > 0).length].setState(this.inputs[i]);
        } else {
            this.objects[BUSINNUM][i - this.ipBusWidths.slice(0, i).filter(value => value === 0).length].setState(this.inputs[i]);
        }
    }

    for (let i = 0; i < this.objects[GATENUM].length; i++) {
        this.objects[GATENUM][i].update(); // Update all gates
    }

    for (let i = 0; i < this.objects[DECNUM].length; i++) {
        this.objects[DECNUM][i].update(); // Update all gates
    }

    for (let i = 0; i < this.objects[WRAPNUM].length; i++) {
        this.objects[WRAPNUM][i].update(); // Update all gates
    }

    for (let i = 0; i < this.objects[UNWRAPNUM].length; i++) {
        this.objects[UNWRAPNUM][i].update(); // Update all gates
    }

    for (let i = 0; i < this.objects[CUSTNUM].length; i++) {
        this.objects[CUSTNUM][i].update(); // Update all customs
    }
    this.updateGroups();
    this.updateBusGroups();

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
    console.log('inverting');
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
        if (!this.istop[i]) {
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
        this.inputClickBoxes[i].setTransform(transform);
    }

    // Update output clickBoxes
    for (let i = 0; i < this.outputClickBoxes.length; i++) {
        switch (this.direction) {
            case 0: this.outputClickBoxes[i].updatePosition(this.x + this.w, this.y + (this.h * (i + 1)) / this.gridHeight); break;
            case 1: this.outputClickBoxes[i].updatePosition(this.x + (this.w * (i + 1)) / this.gridHeight, this.y + this.h); break;
            case 2: this.outputClickBoxes[i].updatePosition(this.x, this.y + (this.h * (i + 1)) / this.gridHeight); break;
            case 3: this.outputClickBoxes[i].updatePosition(this.x + (this.w * (i + 1)) / this.gridHeight, this.y); break;
        }

        this.outputClickBoxes[i].setTransform(transform);
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
    this.gClickBox.setTransform(transform);
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
    if (!this.initialized) {
        return;
    }
    let x1, x2, y1, y2;
    fill(255);
    strokeWeight(3);
    if (this.marked) {
        stroke(MRED, MGREEN, MBLUE);
    } else {
        stroke(0);
    }

    // Draw the body
    if (this.tops === 0) {
        if (this.direction % 2 === 0) {
            if (this.h - GRIDSIZE === 0) {
                return;
            }
            rect(this.x, this.y + GRIDSIZE / 2, this.w, this.h - GRIDSIZE);
        } else {
            if (this.w - GRIDSIZE === 0) {
                return;
            }
            rect(this.x + GRIDSIZE / 2, this.y, this.w - GRIDSIZE, this.h);
        }
    } else {
        if (this.h === 0 || this.w === 0) {
            return;
        }
        rect(this.x, this.y, this.w, this.h);
    }

    noStroke();
    textSize(this.textSize);
    textAlign(CENTER, CENTER);
    if (this.marked) {
        fill(MRED, MGREEN, MBLUE);
    } else {
        fill(0);
    }
    if (Math.max(this.inputs.length - this.tops, this.outputs.length) % 2 !== 0 /*&& textWidth(this.caption) >= this.w - 30*/ && Math.max(this.inputs.length - this.tops, this.outputs.length) >= 2 && this.direction % 2 === 0) {
        text(this.caption, this.x + this.w / 2, this.y + this.h / 2 - 15);
    } else {
        text(this.caption, this.x + this.w / 2, this.y + this.h / 2);
    }

    let tops = 0;
    // Draw inputs
    for (let i = 1; i <= this.inputCount + this.objects[BUSINNUM].length; i++) {
        if (this.ipBusWidths[i - 1] === 0) {
            // Draw inputs
            if (this.marked) {
                stroke(MRED, MGREEN, MBLUE);
                strokeWeight(3);
            } else if (this.inputs[i - 1]) {
                stroke(HRED, HGREEN, HBLUE);
                strokeWeight(5);
            } else {
                stroke(LRED, LGREEN, LBLUE);
                strokeWeight(3);
            }
        } else if (this.ipBusWidths[i - 1] > 0) {
            strokeWeight(6);
            if (this.marked) {
                stroke(MRED, MGREEN, MBLUE);
            } else {
                stroke(LRED, LGREEN, LBLUE);
            }
            if (this.ipset[i - 1]) {
                if (!this.istop[i - 1]) {
                    noStroke();
                    fill(150);
                    switch (this.direction) {
                        case 0: rect(this.x - 6, this.y + GRIDSIZE * (i - tops) - 4, 5, 8); break;
                        case 1: rect(this.x + GRIDSIZE * (i - tops) - 4, this.y - 6, 8, 5); break;
                        case 2: rect(this.x + this.w + 2, this.y + GRIDSIZE * (i - tops) - 4, 5, 8); break;
                        case 3: rect(this.x + GRIDSIZE * (i - tops) - 4, this.y + this.h + 2, 8, 5); break;
                        default:
                    }
                    if (this.marked) {
                        fill(MRED, MGREEN, MBLUE);
                    } else {
                        fill(0);
                    }
                    noStroke();
                    switch (this.direction) {
                        case 0: triangle(this.x - 9, this.y + GRIDSIZE * (i - tops) - 8, this.x - 1, this.y + GRIDSIZE * (i - tops), this.x - 9, this.y + GRIDSIZE * (i - tops) + 8); break;
                        case 1: triangle(this.x + GRIDSIZE * (i - tops) - 8, this.y - 9, this.x + GRIDSIZE * (i - tops), this.y - 1, this.x + GRIDSIZE * (i - tops) + 8, this.y - 9); break;
                        case 2: triangle(this.x + this.w + 10, this.y + GRIDSIZE * (i - tops) - 8, this.x + this.w + 2, this.y + GRIDSIZE * (i - tops), this.x + this.w + 10, this.y + GRIDSIZE * (i - tops) + 8); break;
                        case 3: triangle(this.x + GRIDSIZE * (i - tops) - 8, this.y + this.h + 10, this.x + GRIDSIZE * (i - tops), this.y + this.h + 2, this.x + GRIDSIZE * (i - tops) + 8, this.y + this.h + 10); break;
                        default:
                    }
                } else {
                    tops++;
                    noStroke();
                    fill(150);
                    switch (this.direction) {
                        case 0: rect(this.x + GRIDSIZE * tops - 4, this.y - 6, 8, 5); break;
                        case 1: rect(this.x + this.w + 2, this.y + GRIDSIZE * tops - 4, 5, 8); break;
                        case 2: rect(this.x + GRIDSIZE * tops - 4, this.y + this.h + 2, 8, 5); break;
                        case 3: rect(this.x - 6, this.y + GRIDSIZE * tops - 4, 5, 8); break;
                        default:
                    }
                    if (this.marked) {
                        fill(MRED, MGREEN, MBLUE);
                    } else {
                        fill(0);
                    }
                    noStroke();
                    switch (this.direction) {
                        case 0: triangle(this.x + GRIDSIZE * tops - 8, this.y - 9, this.x + GRIDSIZE * tops, this.y - 1, this.x + GRIDSIZE * tops + 8, this.y - 9); break;
                        case 1: triangle(this.x + this.w + 10, this.y + GRIDSIZE * tops - 8, this.x + this.w + 2, this.y + GRIDSIZE * tops, this.x + this.w + 10, this.y + GRIDSIZE * tops + 8); break;
                        case 2: triangle(this.x + GRIDSIZE * tops - 8, this.y + this.h + 10, this.x + GRIDSIZE * tops, this.y + this.h + 2, this.x + GRIDSIZE * tops + 8, this.y + this.h + 10); break;
                        case 3: triangle(this.x - 9, this.y + GRIDSIZE * tops - 8, this.x - 1, this.y + GRIDSIZE * tops, this.x - 9, this.y + GRIDSIZE * tops + 8); break;
                        default:
                    }
                }
            } else {
                if (!this.istop[i - 1]) {
                    switch (this.direction) {
                        case 0:
                            x1 = this.x - 5;
                            y1 = this.y + (this.h * (i - tops)) / this.gridHeight;
                            x2 = this.x - 2;
                            y2 = this.y + (this.h * (i - tops)) / this.gridHeight;
                            break;
                        case 1:
                            x1 = this.x + (this.w * (i - tops)) / this.gridHeight;
                            y1 = this.y - 5;
                            x2 = this.x + (this.w * (i - tops)) / this.gridHeight;
                            y2 = this.y - 2;
                            break;
                        case 2:
                            x1 = this.x + this.w + 3;
                            y1 = this.y + (this.h * (i - tops)) / this.gridHeight;
                            x2 = this.x + this.w + 6;
                            y2 = this.y + (this.h * (i - tops)) / this.gridHeight;
                            break;
                        case 3:
                            x1 = this.x + (this.w * (i - tops)) / this.gridHeight;
                            y1 = this.y + this.h + 3;
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
                            y1 = this.y - 5;
                            x2 = this.x + (this.h * tops) / this.gridHeight;
                            y2 = this.y - 2;
                            break;
                        case 1:
                            x1 = this.x + this.w + 6;
                            y1 = this.y + (this.w * tops) / this.gridHeight;
                            x2 = this.x + this.w + 2;
                            y2 = this.y + (this.w * tops) / this.gridHeight;
                            break;
                        case 2:
                            x1 = this.x + (this.h * tops) / this.gridHeight;
                            y1 = this.y + this.h + 2;
                            x2 = this.x + (this.h * tops) / this.gridHeight;
                            y2 = this.y + this.h + 6;
                            break;
                        case 3:
                            x1 = this.x - 2;
                            y1 = this.y + (this.w * tops) / this.gridHeight;
                            x2 = this.x - 5;
                            y2 = this.y + (this.w * tops) / this.gridHeight;
                            break;
                        default:
                            console.log('Gate direction doesn\'t exist!');
                    }
                }
                line(x1, y1, x2, y2);
            }
        }

        if (this.ipBusWidths[i - 1] === 0) {
            if (!this.istop[i - 1]) {
                switch (this.direction) {
                    case 0: line(this.x - 6, this.y + (this.h * (i - tops)) / this.gridHeight, this.x, this.y + (this.h * (i - tops)) / this.gridHeight); break;
                    case 1: line(this.x + (this.w * (i - tops)) / this.gridHeight, this.y - 6, this.x + (this.w * (i - tops)) / this.gridHeight, this.y); break;
                    case 2: line(this.x + this.w, this.y + (this.h * (i - tops)) / this.gridHeight, this.x + this.w + 6, this.y + (this.h * (i - tops)) / this.gridHeight); break;
                    case 3: line(this.x + (this.w * (i - tops)) / this.gridHeight, this.y + this.h, this.x + (this.w * (i - tops)) / this.gridHeight, this.y + this.h + 6); break;
                    default:
                        console.log('Gate direction doesn\'t exist!');
                }
            } else {
                tops++;
                switch (this.direction) {
                    case 0: line(this.x + (this.h * tops) / this.gridHeight, this.y - 6, this.x + (this.h * tops) / this.gridHeight, this.y); break;
                    case 1: line(this.x + this.w + 6, this.y + (this.w * tops) / this.gridHeight, this.x + this.w, this.y + (this.w * tops) / this.gridHeight); break;
                    case 2: line(this.x + (this.h * tops) / this.gridHeight, this.y + this.h, this.x + (this.h * tops) / this.gridHeight, this.y + this.h + 6); break;
                    case 3: line(this.x, this.y + (this.w * tops) / this.gridHeight, this.x - 6, this.y + (this.w * tops) / this.gridHeight); break;
                    default:
                        console.log('Gate direction doesn\'t exist!');
                }
            }
        }

        fill(255);
        strokeWeight(2);

        if (this.inputsInv[i - 1]) {
            if (!this.istop[i - 1]) {
                switch (this.direction) {
                    case 0: ellipse(this.x - 3, this.y + (this.h * (i - tops)) / this.gridHeight, 10, 10); break;
                    case 1: ellipse(this.x + (this.w * (i - tops)) / this.gridHeight, this.y - 3, 10, 10); break;
                    case 2: ellipse(this.x + this.w + 3, this.y + (this.h * (i - tops)) / this.gridHeight, 10, 10); break;
                    case 3: ellipse(this.x + (this.w * (i - tops)) / this.gridHeight, this.y + this.h + 3, 10, 10); break;
                }
            } else {
                switch (this.direction) {
                    case 0: ellipse(this.x + (this.h * tops) / this.gridHeight, this.y - 3, 10, 10); break;
                    case 1: ellipse(this.x + this.w + 3, this.y + (this.w * tops) / this.gridHeight, 10, 10); break;
                    case 2: ellipse(this.x + (this.h * tops) / this.gridHeight, this.y + this.h + 3, 10, 10); break;
                    case 3: ellipse(this.x - 3, this.y + (this.w * tops) / this.gridHeight, 10, 10); break;
                }
            }
        }

        if (this.marked) {
            fill(MRED, MGREEN, MBLUE);
        } else {
            fill(0);
        }

        if (this.inputLabels[i - 1] === '>') {
            if (this.marked) {
                stroke(MRED, MGREEN, MBLUE);
            } else {
                stroke(0);
            }
            if (!this.istop[i - 1]) {
                switch (this.direction) {
                    case 0:
                        line(this.x + 14, this.y + (this.h * (i - tops)) / this.gridHeight, this.x, this.y + (this.h * (i - tops)) / this.gridHeight - 6);
                        line(this.x + 14, this.y + (this.h * (i - tops)) / this.gridHeight, this.x, this.y + (this.h * (i - tops)) / this.gridHeight + 6);
                        break;
                    case 1:
                        line(this.x + (this.w * (i - tops)) / this.gridHeight, this.y + 14, this.x + (this.w * (i - tops)) / this.gridHeight - 6, this.y);
                        line(this.x + (this.w * (i - tops)) / this.gridHeight, this.y + 14, this.x + (this.w * (i - tops)) / this.gridHeight + 6, this.y);
                        break;
                    case 2:
                        line(this.x + this.w - 14, this.y + (this.h * (i - tops)) / this.gridHeight, this.x + this.w, this.y + (this.h * (i - tops)) / this.gridHeight - 6);
                        line(this.x + this.w - 14, this.y + (this.h * (i - tops)) / this.gridHeight, this.x + this.w, this.y + (this.h * (i - tops)) / this.gridHeight + 6);
                        break;
                    case 3:
                        line(this.x + (this.w * (i - tops)) / this.gridHeight, this.y + this.h - 14, this.x + (this.w * (i - tops)) / this.gridHeight - 6, this.y + this.h);
                        line(this.x + (this.w * (i - tops)) / this.gridHeight, this.y + this.h - 14, this.x + (this.w * (i - tops)) / this.gridHeight + 6, this.y + this.h);
                        break;
                }
            } else {
                switch (this.direction) {
                    case 0:
                        line(this.x + (this.h * tops) / this.gridHeight, this.y + 14, this.x + (this.h * tops) / this.gridHeight - 6, this.y);
                        line(this.x + (this.h * tops) / this.gridHeight, this.y + 14, this.x + (this.h * tops) / this.gridHeight + 6, this.y);
                        break;
                    case 1:
                        line(this.x + this.w - 14, this.y + (this.w * tops) / this.gridHeight, this.x + this.w, this.y + (this.w * tops) / this.gridHeight - 6);
                        line(this.x + this.w - 14, this.y + (this.w * tops) / this.gridHeight, this.x + this.w, this.y + (this.w * tops) / this.gridHeight + 6);
                        break;
                    case 2:
                        line(this.x + (this.h * tops) / this.gridHeight, this.y + this.h - 14, this.x + (this.h * tops) / this.gridHeight - 6, this.y + this.h);
                        line(this.x + (this.h * tops) / this.gridHeight, this.y + this.h - 14, this.x + (this.h * tops) / this.gridHeight + 6, this.y + this.h);
                        break;
                    case 3:
                        line(this.x + 14, this.y + (this.w * tops) / this.gridHeight, this.x, this.y + (this.w * tops) / this.gridHeight - 6);
                        line(this.x + 14, this.y + (this.w * tops) / this.gridHeight, this.x, this.y + (this.w * tops) / this.gridHeight + 6);
                        break;
                }
            }
        } else {
            noStroke();
            textSize(14);

            let label = this.inputLabels[i - 1];
            let xOffset = 10;
            if (this.inputLabels[i - 1] === '' && this.ipBusWidths[i - 1] > 0) {
                label = '[' + (this.ipBusWidths[i - 1] - 1) + ':0]';
                textSize(10);
                xOffset = 15;
            }

            if (!this.istop[i - 1]) {
                switch (this.direction) {
                    case 0: text(label, this.x + xOffset, this.y + (this.h * (i - tops)) / this.gridHeight); break;
                    case 1: text(label, this.x + (this.w * (i - tops)) / this.gridHeight, this.y + 10); break;
                    case 2: text(label, this.x + this.w - xOffset, this.y + (this.h * (i - tops)) / this.gridHeight); break;
                    case 3: text(label, this.x + (this.w * (i - tops)) / this.gridHeight, this.y + this.h - 10); break;
                }
            } else {
                switch (this.direction) {
                    case 0: text(label, this.x + (this.h * tops) / this.gridHeight, this.y + 10); break;
                    case 1: text(label, this.x + this.w - xOffset, this.y + (this.w * tops) / this.gridHeight); break;
                    case 2: text(label, this.x + (this.h * tops) / this.gridHeight, this.y + this.h - 10); break;
                    case 3: text(label, this.x + xOffset, this.y + (this.w * tops) / this.gridHeight); break;
                }
            }
        }

        textSize(12);

        if (this.ipBusWidths[i - 1] > 0) {
            if (!this.istop[i - 1]) {
                switch (this.direction) {
                    case 0: text(this.ipBusWidths[i - 1], this.x - 10, this.y + GRIDSIZE * (i - tops) + 15); break;
                    case 1: text(this.ipBusWidths[i - 1], this.x + GRIDSIZE * (i - tops) + 15, this.y - 10); break;
                    case 2: text(this.ipBusWidths[i - 1], this.x + this.w + 10, this.y + GRIDSIZE * (i - tops) + 15); break;
                    case 3: text(this.ipBusWidths[i - 1], this.x + GRIDSIZE * (i - tops) + 15, this.y + this.h + 10); break;
                }
            } else {
                switch (this.direction) {
                    case 0: text(this.ipBusWidths[i - 1], this.x + GRIDSIZE * tops + 15, this.y - 10); break;
                    case 1: text(this.ipBusWidths[i - 1], this.x + this.w + 10, this.y + GRIDSIZE * tops + 15); break;
                    case 2: text(this.ipBusWidths[i - 1], this.x + GRIDSIZE * tops + 15, this.y + this.h + 10); break;
                    case 3: text(this.ipBusWidths[i - 1], this.x - 10, this.y + GRIDSIZE * tops + 15); break;
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

        if (this.marked) {
            fill(MRED, MGREEN, MBLUE);
        } else {
            fill(0);
        }
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
    /*for (let i = 0; i < this.inputClickBoxes.length; i++) {
        this.inputClickBoxes[i].markClickBox();
    }
    for (let i = 0; i < this.outputClickBoxes.length; i++) {
        this.outputClickBoxes[i].markClickBox();
    }*/
};