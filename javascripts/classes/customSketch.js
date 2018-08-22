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

    this.height = Math.max(this.outputCount + 1, this.inputCount + 1); // Height of the custom object in grid cells

    this.highColor = color(HRED, HGREEN, HBLUE); // Color for high in-/outputs (red)
    this.lowColor = color(LRED, LGREEN, LBLUE);  // Color for low in-/outputs (black)

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
    this.markColor = color(150, 30, 30); // Color the object appears in when marked

    this.gClickBox = new ClickBox(this.x, this.y, this.w, this.h, this.transform); // Global clickbox

    this.loaded = false; // True, if the sketch has been loaded from file
    this.visible = true; // True, if the object is visible and not part of another object

    this.simRunning = false; // True, when the simulation is running
    this.tops = 0;           // Number of inputs to draw on top of the object

    this.id = '_' + Math.random().toString(36).substr(2, 9);
    this.pid = null;
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
    let tops = 0;
    for (const elem of this.objects[INPNUM]) {
        if (elem.isTop) {
            tops++;
        }
    }
    this.tops = tops;
    if (this.direction % 2 === 0) {
        this.w = 2 * GRIDSIZE + Math.max(this.tops - 1, 0) * GRIDSIZE;
        this.h = 2 * GRIDSIZE + GRIDSIZE * Math.max(this.inputCount - 1 - this.tops, this.outputCount - 1);
    } else {
        this.w = 2 * GRIDSIZE + GRIDSIZE * Math.max(this.inputCount - 1 - this.tops, this.outputCount - 1);
        this.h = 2 * GRIDSIZE + Math.max(this.tops - 1, 0) * GRIDSIZE;
    }
    this.height = Math.max(this.inputCount - this.tops, this.outputCount) + 1;
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
    this.reSize();
    this.setCoordinates(this.x, this.y);
    this.reSize();
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
    Returns the filename for sketch.js to load the sketch
*/
CustomSketch.prototype.getFilename = function () {
    return this.filename;
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
    for (let i = 0; i < this.objects[SEGNUM].length; i++) {
        if (this.objects[SEGNUM][i].endX === x && this.objects[SEGNUM][i].endY === y) {
            if (i !== j) {
                indexList.push(i);
            }
        }
        if (this.objects[SEGNUM][i].startX === x && this.objects[SEGNUM][i].startY === y) {
            if (i !== j) {
                indexList.push(i);
            }
        }
    }
    return indexList;
};

/*
    Finds connected wires and orders them in groups of segments
*/
CustomSketch.prototype.parseGroups = function () {
    this.traced = [];
    this.groups = [];
    for (let i = 0; i < this.objects[SEGNUM].length; i++) {
        if (this.traced.indexOf(i) < 0) {
            this.exploreGroup(i);
        }
    }
    this.deleteInvalidConpoints();
};

/*
    Deletes all connection points that are not located at wire crossings
*/
CustomSketch.prototype.deleteInvalidConpoints = function () {
    for (let j = 0; j < this.objects[CPNUM].length; j++) {
        if (this.wirePoints(this.objects[CPNUM][j].x, this.objects[CPNUM][j].y, -1).length < 3) {
            this.objects[CPNUM].splice(j, 1);
        }
    }
};

/*
    Explores one part of the graph
    j: Start segment
*/

CustomSketch.prototype.exploreGroup = function (j) {
    this.groups.push(new Group());
    this.exGroup(j, this.groups.length - 1);
};

/*
    Recursive wire traversing algorithm
*/
CustomSketch.prototype.exGroup = function (j, g) {
    if (this.traced.indexOf(j) > 0) {
        return;
    }
    this.groups[g].addSegment(this.objects[SEGNUM][j]);
    this.traced.push(j);

    if (this.objects[SEGNUM][j].parentStart !== null) {
        if (this.objects[SEGNUM][j].startIO) {
            this.groups[g].addOutput(this.objects[SEGNUM][j].parentStart, this.objects[SEGNUM][j].start);
        } else {
            this.groups[g].addInput(this.objects[SEGNUM][j].parentStart, this.objects[SEGNUM][j].start);
        }
    }

    if (this.objects[SEGNUM][j].parentEnd !== null) {
        if (this.objects[SEGNUM][j].endIO) {
            this.groups[g].addOutput(this.objects[SEGNUM][j].parentEnd, this.objects[SEGNUM][j].end);
        } else {
            this.groups[g].addInput(this.objects[SEGNUM][j].parentEnd, this.objects[SEGNUM][j].end);
        }
    }

    let wp1 = this.wirePoints(this.objects[SEGNUM][j].startX, this.objects[SEGNUM][j].startY, j);
    let wp2 = this.wirePoints(this.objects[SEGNUM][j].endX, this.objects[SEGNUM][j].endY, j);

    // If there are 3 segments connecting
    if (wp1.length === 2) {
        if (this.isConPoint(this.objects[SEGNUM][j].startX, this.objects[SEGNUM][j].startY) >= 0) {
            this.objects[CPNUM][this.isConPoint(this.objects[SEGNUM][j].startX, this.objects[SEGNUM][j].startY)].setGroup(g);
        }
    } else if (wp1.length === 3) {
        if (this.isConPoint(this.objects[SEGNUM][j].startX, this.objects[SEGNUM][j].startY) < 0) {
            for (let k = 0; k < wp1.length; k++) {
                if (this.objects[SEGNUM][wp1[k]].direction === this.objects[SEGNUM][j].direction) { // If they have the same direction
                    let s = wp1[k];
                    wp1 = []; // Only explore in this segment
                    wp1.push(s);
                }
            }
        } else { // else explore every segment
            this.objects[CPNUM][this.isConPoint(this.objects[SEGNUM][j].startX, this.objects[SEGNUM][j].startY)].setGroup(g);
        }
    }

    // Same thing for the other direction
    if (wp2.length === 2) {
        if (this.isConPoint(this.objects[SEGNUM][j].endX, this.objects[SEGNUM][j].endY) >= 0) {
            this.objects[CPNUM][this.isConPoint(this.objects[SEGNUM][j].endX, this.objects[SEGNUM][j].endY)].setGroup(g);
        }
    } else if (wp2.length === 3) {
        if (this.isConPoint(this.objects[SEGNUM][j].endX, this.objects[SEGNUM][j].endY) < 0) {
            for (let k = 0; k < wp2.length; k++) {
                if (this.objects[SEGNUM][wp2[k]].direction === this.objects[SEGNUM][j].direction) { // If they have the same direction
                    let s = wp2[k];
                    wp2 = []; // Only explore in this segment
                    wp2.push(s);
                }
            }
        } else { // else explore every segment
            this.objects[CPNUM][this.isConPoint(this.objects[SEGNUM][j].endX, this.objects[SEGNUM][j].endY)].setGroup(g);
        }
    }

    // Trace the remaining segments recursivly
    for (let i = 0; i < wp1.length; i++) {
        if (this.traced.indexOf(wp1[i]) < 0) {
            this.exGroup(wp1[i], g);
        }
    }

    for (let i = 0; i < wp2.length; i++) {
        if (this.traced.indexOf(wp2[i]) < 0) {
            this.exGroup(wp2[i], g);
        }
    }
};

/*
    Integrates all sketch elements into the wire groups
*/
CustomSketch.prototype.integrateElement = function () {
    for (let h = 0; h < this.groups.length; h++) {
        for (let i = 0; i < this.groups[h].segments.length; i++) {
            for (let j = 0; j < this.objects[GATENUM].length; j++) {
                for (let k = 0; k < this.objects[GATENUM][j].outputCount; k++) {
                    if (this.objects[GATENUM][j].pointInOutput(k, this.groups[h].segments[i].startX, this.groups[h].segments[i].startY)) {
                        this.groups[h].segments[i].setStart(1, this.objects[GATENUM][j], k);
                    }
                    if (this.objects[GATENUM][j].pointInOutput(k, this.groups[h].segments[i].endX, this.groups[h].segments[i].endY)) {
                        this.groups[h].segments[i].setEnd(1, this.objects[GATENUM][j], k);
                    }
                }
                for (let k = 0; k < this.objects[GATENUM][j].inputCount; k++) {
                    if (this.objects[GATENUM][j].pointInInput(k, this.groups[h].segments[i].startX, this.groups[h].segments[i].startY)) {
                        this.groups[h].segments[i].setStart(0, this.objects[GATENUM][j], k);
                    }
                    if (this.objects[GATENUM][j].pointInInput(k, this.groups[h].segments[i].endX, this.groups[h].segments[i].endY)) {
                        this.groups[h].segments[i].setEnd(0, this.objects[GATENUM][j], k);
                    }
                }
            }
            for (let j = 0; j < this.objects[CUSTNUM].length; j++) {
                for (let k = 0; k < this.objects[CUSTNUM][j].outputCount; k++) {
                    if (this.objects[CUSTNUM][j].pointInOutput(k, this.groups[h].segments[i].startX, this.groups[h].segments[i].startY)) {
                        this.groups[h].segments[i].setStart(1, this.objects[CUSTNUM][j], k);
                    }
                    if (this.objects[CUSTNUM][j].pointInOutput(k, this.groups[h].segments[i].endX, this.groups[h].segments[i].endY)) {
                        this.groups[h].segments[i].setEnd(1, this.objects[CUSTNUM][j], k);
                    }
                }
                for (let k = 0; k < this.objects[CUSTNUM][j].inputCount; k++) {
                    if (this.objects[CUSTNUM][j].pointInInput(k, this.groups[h].segments[i].startX, this.groups[h].segments[i].startY)) {
                        this.groups[h].segments[i].setStart(0, this.objects[CUSTNUM][j], k);
                    }
                    if (this.objects[CUSTNUM][j].pointInInput(k, this.groups[h].segments[i].endX, this.groups[h].segments[i].endY)) {
                        this.groups[h].segments[i].setEnd(0, this.objects[CUSTNUM][j], k);
                    }
                }
            }
            for (let j = 0; j < this.objects[INPNUM].length; j++) {
                if (this.objects[INPNUM][j].pointInOutput(null, this.groups[h].segments[i].startX, this.groups[h].segments[i].startY)) {
                    this.groups[h].segments[i].setStart(1, this.objects[INPNUM][j], 0);
                }
                if (this.objects[INPNUM][j].pointInOutput(null, this.groups[h].segments[i].endX, this.groups[h].segments[i].endY)) {
                    this.groups[h].segments[i].setEnd(1, this.objects[INPNUM][j], 0);
                }
            }
            for (let j = 0; j < this.objects[OUTPNUM].length; j++) {
                if (this.objects[OUTPNUM][j].pointInInput(null, this.groups[h].segments[i].startX, this.groups[h].segments[i].startY)) {
                    this.groups[h].segments[i].setStart(0, this.objects[OUTPNUM][j], 0);
                }
                if (this.objects[OUTPNUM][j].pointInInput(null, this.groups[h].segments[i].endX, this.groups[h].segments[i].endY)) {
                    this.groups[h].segments[i].setEnd(0, this.objects[OUTPNUM][j], 0);
                }
            }
            for (let j = 0; j < this.objects[DINUM].length; j++) { // For all diodes
                if ((this.groups[h].segments[i].startX === this.objects[DINUM][j].x) && (this.groups[h].segments[i].startY === this.objects[DINUM][j].y)) { // If there's a diode in the segment start
                    if (this.groups[h].segments[i].startX === this.groups[h].segments[i].endX) { // if the segment is vertical
                        let s = this.segmentStartsIn(this.groups[h].segments[i].startX, this.groups[h].segments[i].startY); // Get the segment that starts in x,y or -1
                        let t = this.segmentEndsIn(this.groups[h].segments[i].startX, this.groups[h].segments[i].startY); // Get the segment that ends in x,y or -1
                        if (s >= 0) { // if a horizontal segment exists
                            if (this.objects[SEGNUM][s].startY === this.objects[SEGNUM][s].endY) { // If the segment is horizontal
                                this.objects[DINUM][j].setGroups(this.getGroup(this.objects[SEGNUM][s]), h); // Set the diode groups
                            }
                        } else if (t >= 0) {
                            if (this.objects[SEGNUM][t].startY === this.objects[SEGNUM][t].endY) { // If the segment is horizontal
                                this.objects[DINUM][j].setGroups(this.getGroup(this.objects[SEGNUM][t]), h); // Set the diode groups
                            }
                        }

                    } else if (this.groups[h].segments[i].startY === this.groups[h].segments[i].endY) { // if the segment is horizontal
                        let s = this.segmentStartsIn(this.groups[h].segments[i].startX, this.groups[h].segments[i].startY); // Get the segment that starts in x,y or -1
                        let t = this.segmentEndsIn(this.groups[h].segments[i].startX, this.groups[h].segments[i].startY); // Get the segment that ends in x,y or -1
                        if (s >= 0) {
                            if (this.objects[SEGNUM][s].startX === this.objects[SEGNUM][s].endX) { // If the segment is vertical
                                this.objects[DINUM][j].setGroups(h, this.getGroup(this.objects[SEGNUM][s])); // Set the diode groups
                            }
                        } else if (t >= 0) {
                            if (this.objects[SEGNUM][t].startX === this.objects[SEGNUM][t].endX) { // If the segment is vertical
                                this.objects[DINUM][j].setGroups(h, this.getGroup(this.objects[SEGNUM][t])); // Set the diode groups
                            }
                        }
                    }
                }
                if ((this.groups[h].segments[i].endX === this.objects[DINUM][j].x) && (this.groups[h].segments[i].endY === this.objects[DINUM][j].y)) { // If there's a diode in the segment end
                    if (this.groups[h].segments[i].startX === this.groups[h].segments[i].endX) { // if it's vertical
                        let s = this.segmentStartsIn(this.groups[h].segments[i].endX, this.groups[h].segments[i].endY); // Get the segment that starts in x,y or -1
                        let t = this.segmentEndsIn(this.groups[h].segments[i].endX, this.groups[h].segments[i].endY); // Get the segment that ends in x,y or -1
                        if (s >= 0) { // if a horizontal segment exists
                            if (this.objects[SEGNUM][s].startY === this.objects[SEGNUM][s].endY) { // If the segment is horizontal
                                this.objects[DINUM][j].setGroups(this.getGroup(this.objects[SEGNUM][s]), h); // Set the diode groups
                            }
                        } else if (t >= 0) {
                            if (this.objects[SEGNUM][t].startY === this.objects[SEGNUM][t].endY) { // If the segment is horizontal
                                this.objects[DINUM][j].setGroups(this.getGroup(this.objects[SEGNUM][t]), h); // Set the diode groups
                            }
                        }
                    } else if (this.groups[h].segments[i].startY === this.groups[h].segments[i].endY) { // if the segment is horizontal
                        let s = this.segmentStartsIn(this.groups[h].segments[i].endX, this.groups[h].segments[i].endY); // Get the segment that starts in x,y or -1
                        let t = this.segmentEndsIn(this.groups[h].segments[i].endX, this.groups[h].segments[i].endY); // Get the segment that ends in x,y or -1
                        if (s >= 0) {
                            if (this.objects[SEGNUM][s].startX === this.objects[SEGNUM][s].endX) { // If the segment is vertical
                                this.objects[DINUM][j].setGroups(h, this.getGroup(this.objects[SEGNUM][s])); // Set the diode groups
                            }
                        } else if (t >= 0) {
                            if (this.objects[SEGNUM][t].startX === this.objects[SEGNUM][t].endX) { // If the segment is vertical
                                this.objects[DINUM][j].setGroups(h, this.getGroup(this.objects[SEGNUM][t])); // Set the diode groups
                            }
                        }
                    }
                }
            }
        }
    }
};

/*
    Returns the group number, a given segment belongs to, or -1
*/
CustomSketch.prototype.getGroup = function (seg) {
    for (let i = 0; i < this.groups.length; i++) {
        for (let j = 0; j < this.groups[i].segments.length; j++) {
            if ((this.groups[i].segments[j].startX === seg.startX) && (this.groups[i].segments[j].startY === seg.startY) && (this.groups[i].segments[j].direction === seg.direction)) {
                return i;
            }
        }
    }
    return -1;
};

/*
    Returns the number of the segment starting in the given coordinates, or -1
*/
CustomSketch.prototype.segmentStartsIn = function (x, y) {
    for (let i = 0; i < this.objects[SEGNUM].length; i++) {
        if (this.objects[SEGNUM][i].startX === x && this.objects[SEGNUM][i].startY === y) {
            return i;
        }
    }
    return -1;
};

/*
    Returns the number of the segment ending in the given coordinates, or -1
*/
CustomSketch.prototype.segmentEndsIn = function (x, y) {
    for (let i = 0; i < this.objects[SEGNUM].length; i++) {
        if (this.objects[SEGNUM][i].endX === x && this.objects[SEGNUM][i].endY === y) {
            return i;
        }
    }
    return -1;
};

/*
    Sets the simRunning parameter
    simRunning should be equal to sketch.js' simRunning
*/
CustomSketch.prototype.setSimRunning = function (simRunning) {
    this.simRunning = simRunning;
    if (this.simRunning) {
        this.parseGroups();
        this.integrateElement();
        this.parseGroups();
    } else {
        this.groups = [];
        for (let i = 0; i < this.objects[GATENUM].length; i++) {
            this.objects[GATENUM][i].shutdown();
        }
        for (let i = 0; i < this.objects[CUSTNUM].length; i++) {
            this.objects[CUSTNUM][i].shutdown();
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
    }
    // Set all inputs to the corresponding input pins
    for (let i = 0; i < this.inputCount; i++) {
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
        //this.objects[OUTPNUM][i].show();
    }

    for (let i = 0; i < this.outputs.length; i++) {
        if (this.outputsInv[i]) {
            this.outputs[i] = !this.outputs[i];
        }
    }

    for (let i = 0; i < this.objects[DINUM].length; i++) {
        if (this.groups[this.objects[DINUM][i].gA].state) {
            this.groups[this.objects[DINUM][i].gB].diodeHigh();
        }
        this.objects[DINUM][i].state = this.groups[this.objects[DINUM][i].gA].state;
    }
};

/*
    Sets all in- and outputs to false
*/
CustomSketch.prototype.shutdown = function () {
    for (let i = 0; i < this.outputCount; i++) {
        this.outputs[i] = false;
    }
    for (let i = 0; i < this.inputCount; i++) {
        this.inputs[i] = false;
        this.ipset[i] = false;
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
                case 0: this.inputClickBoxes[i].updatePosition(this.x, this.y + (this.h * ((i - tops) + 1)) / this.height); break;
                case 1: this.inputClickBoxes[i].updatePosition(this.x + (this.w * ((i - tops) + 1)) / this.height, this.y); break;
                case 2: this.inputClickBoxes[i].updatePosition(this.x + this.w, this.y + (this.h * ((i - tops) + 1)) / this.height); break;
                case 3: this.inputClickBoxes[i].updatePosition(this.x + (this.w * ((i - tops) + 1)) / this.height, this.y + this.h); break;
            }
        } else {
            tops++;
            switch (this.direction) {
                case 0: this.inputClickBoxes[i].updatePosition(this.x + (this.h * tops) / this.height, this.y); break;
                case 1: this.inputClickBoxes[i].updatePosition(this.x + this.w, this.y + (this.w * tops) / this.height); break;
                case 2: this.inputClickBoxes[i].updatePosition(this.x + (this.h * tops) / this.height, this.y + this.h); break;
                case 3: this.inputClickBoxes[i].updatePosition(this.x, this.y + (this.w * tops) / this.height); break;
            }
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
        fill(this.markColor);
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
    //textSize(10);
    //text(this.id, this.x + this.w / 2, this.y);
    textSize(this.textSize);
    textAlign(CENTER, CENTER);
    fill(0);
    text(this.caption, this.x + this.w / 2, this.y + this.h / 2); // Draw text

    let tops = 0;
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

        if (!this.objects[INPNUM][i - 1].isTop) {
            switch (this.direction) {
                case 0:
                    x1 = this.x - 6;
                    y1 = this.y + (this.h * (i - tops)) / this.height;
                    x2 = this.x;
                    y2 = this.y + (this.h * (i - tops)) / this.height;
                    break;
                case 1:
                    x1 = this.x + (this.w * (i - tops)) / this.height;
                    y1 = this.y - 6;
                    x2 = this.x + (this.w * (i - tops)) / this.height;
                    y2 = this.y;
                    break;
                case 2:
                    x1 = this.x + this.w;
                    y1 = this.y + (this.h * (i - tops)) / this.height;
                    x2 = this.x + this.w + 6;
                    y2 = this.y + (this.h * (i - tops)) / this.height;
                    break;
                case 3:
                    x1 = this.x + (this.w * (i - tops)) / this.height;
                    y1 = this.y + this.h;
                    x2 = this.x + (this.w * (i - tops)) / this.height;
                    y2 = this.y + this.h + 6;
                    break;
                default:
                    console.log('Gate direction doesn\'t exist!');
            }
        } else {
            tops++;
            switch (this.direction) {
                case 0:
                    x1 = this.x + (this.h * tops) / this.height;
                    y1 = this.y - 6;
                    x2 = this.x + (this.h * tops) / this.height;
                    y2 = this.y;
                    break;
                case 1:
                    x1 = this.x + this.w + 6;
                    y1 = this.y + (this.w * tops) / this.height;
                    x2 = this.x + this.w;
                    y2 = this.y + (this.w * tops) / this.height;
                    break;
                case 2:
                    x1 = this.x + (this.h * tops) / this.height;
                    y1 = this.y + this.h;
                    x2 = this.x + (this.h * tops) / this.height;
                    y2 = this.y + this.h + 6;
                    break;
                case 3:
                    x1 = this.x;
                    y1 = this.y + (this.w * tops) / this.height;
                    x2 = this.x - 6;
                    y2 = this.y + (this.w * tops) / this.height;
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
                x1 = this.x + this.w;
                y1 = this.y + (this.h * i) / this.height;
                x2 = this.x + this.w + 6;
                y2 = this.y + (this.h * i) / this.height;
                break;
            case 1:
                x1 = this.x + (this.w * i) / this.height;
                y1 = this.y + this.h;
                x2 = this.x + (this.w * i) / this.height;
                y2 = this.y + this.h + 6;
                break;
            case 2:
                x1 = this.x - 6;
                y1 = this.y + (this.h * i) / this.height;
                x2 = this.x;
                y2 = this.y + (this.h * i) / this.height;
                break;
            case 3:
                x1 = this.x + (this.w * i) / this.height;
                y1 = this.y;
                x2 = this.x + (this.w * i) / this.height;
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