// File: busSegmentDisplay.js

function BusSegmentDisplay(x, y, bits) {
    this.x = x; // X-Position
    this.y = y; // Y-Position
    this.inputCount = bits;
    this.digits = Math.pow(2, bits).toString().length;
    this.w = GRIDSIZE * Math.max(this.digits * 2 + 1, 3); // Width of the display
    this.h = GRIDSIZE * 3; // Height of the display
    this.marked = false;
    this.lowColor = color(50, 50, 50); // dark grey color
    this.highColor = color(HRED, HGREEN, HBLUE); // Color for high inputs (red)

    this.gClickBox = new ClickBox(this.x + GRIDSIZE / 2, this.y, this.w - GRIDSIZE, this.h, transform);
    this.inputClickBox = new ClickBox(0, 0, IOCBSIZE, IOCBSIZE, transform);

    this.inputs = Array(bits).fill(false);     // Vector of the input states
    this.ipset = false;   // set to true if an input bus was connected

    this.value = 0; // Decimal input value

    this.id = 's' + Date.now() + Math.random() + 'b';

    this.setCoordinates(this.x, this.y);
    this.updateClickBoxes();
}

BusSegmentDisplay.prototype.getData = function () {
    let data = {};
    data.x = JSON.stringify(this.x);
    data.y = JSON.stringify(this.y);
    data.inputCount = JSON.stringify(this.inputCount);
    data.busversion = true;
    return data;
};

/*
    Sets the coordinates of the display, rounded to grid size
*/
BusSegmentDisplay.prototype.setCoordinates = function (nx, ny) {
    this.x = Math.round((nx - GRIDSIZE / 2) / GRIDSIZE) * GRIDSIZE;
    this.y = Math.round((ny - GRIDSIZE / 2) / GRIDSIZE) * GRIDSIZE;
};

BusSegmentDisplay.prototype.alterPosition = function (x1, y1) {
    this.x += x1;
    this.y += y1;
    this.updateClickBoxes();
};

/*
   Sets the input vector to the given array s
*/
BusSegmentDisplay.prototype.setInput = function (i = 0, s) {

    this.inputs = s.slice(s.length - this.inputCount); // Set the input vector to the given array

    if (s.length < this.inputCount) { // If the array is shorter than the input vector, fill with false
        for (let i = 0; i < this.inputCount - s.length; i++) {
            this.inputs.splice(0, 0, false);
        }
    }
    this.ipset = true; // Mark that the state of this input is now well defined
};

/*
    Unsets all inputs and resets the displayed value
*/
BusSegmentDisplay.prototype.shutdown = function () {
    for (let i = 0; i < this.inputCount; i++) {
        this.inputs[i] = false;
        this.ipset[i] = false;
    }
    this.value = 0;
};

/*
    Updates the clickBoxes (once after creation)
*/
BusSegmentDisplay.prototype.updateClickBoxes = function () {
    this.inputClickBox.updatePosition(this.x + GRIDSIZE, this.y + this.h);
    this.inputClickBox.setTransform(transform);
    this.gClickBox.updatePosition(this.x + this.w / 2, this.y + this.h / 2);
    this.gClickBox.updateSize(this.w - GRIDSIZE, this.h);
    this.gClickBox.setTransform(transform);
};

/*
    Checks if the mouse is over the display
*/
BusSegmentDisplay.prototype.mouseOver = function () {
    return this.gClickBox.mouseOver();
};

/*
    Checks if the mouse is over the bus input 
*/
BusSegmentDisplay.prototype.mouseOverInput = function (n = 0) {
    return this.inputClickBox.mouseOver();
};

/*
    Checks if a given point (px, py) is at the bus input's position
*/
BusSegmentDisplay.prototype.pointInInput = function (n = 0, px, py) {
    return this.inputClickBox.checkPoint(px, py);
};

BusSegmentDisplay.prototype.update = function () {
    this.value = 0;
    for (let i = 0; i < this.inputCount; i++) {
        if (this.inputs[i]) {
            this.value += Math.pow(2, this.inputCount - i - 1);
        }
    }
};

/*
    Draws the element on the screen
*/
BusSegmentDisplay.prototype.show = function () {
    this.x1 = this.x + GRIDSIZE;
    this.y1 = this.y + this.h;
    this.x2 = this.x + GRIDSIZE;
    this.y2 = this.y + this.h + 6;

    stroke(150);
    strokeWeight(9);
    line(this.x1, this.y1, this.x2, this.y2 - 3);

    strokeWeight(3);

    fill(255);
    if (this.marked) {
        stroke(MRED, MGREEN, MBLUE);
    } else {
        stroke(0);
    }

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

    triangle(this.x1 - 8, this.y2 + 4, this.x1, this.y1 + 2, this.x1 + 8, this.y2 + 4);

    textSize(12);
    text(this.inputCount, this.x1 + 15, this.y1 + 10);

    textSize(10);
    textFont('Arial');

    text('[' + (this.inputCount - 1) + ':0]', this.x1, this.y1 - 10);

    //this.gClickBox.markClickBox();
};