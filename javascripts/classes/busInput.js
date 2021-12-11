// File: busInput.js

function BusInput(x, y, busWidth, custPos = 0) {
    this.x = x; // X-Position (translated)
    this.y = y; // Y-Position

    this.busWidth = busWidth;

    this.w = GRIDSIZE;
    this.h = GRIDSIZE;

    this.highColor = color(HRED, HGREEN, HBLUE);
    this.lowColor = color(50, 50, 50);   // Color for low inputs (dark grey)

    this.outputs = [];    // Vector of the output state

    this.custPosition = custPos; // Designated bus position on a custom element

    //this.id = '_' + Math.random().toString(36).substr(2, 9);
    this.id = 'bi' + Date.now() + Math.random() + 'b';

    this.isTop = false;
    this.lbl = '';
    this.marked = false;

    // Initialize the outputs
    for (let i = 0; i < this.busWidth; i++) {
        this.outputs.push(false); // Set all outputs to low
    }

    this.clickBox = new ClickBox(this.x - GRIDSIZE / 2, this.y - GRIDSIZE / 2, this.w, this.h, transform);
    this.updateClickBox();
}

BusInput.prototype.alterPosition = function (x1, y1) {
    this.x += x1;
    this.y += y1;
    this.updateClickBox();
};

BusInput.prototype.getData = function () {
    var data = {};
    data.x = JSON.stringify(this.x);
    data.y = JSON.stringify(this.y);
    if (this.isTop) {
        data.istop = JSON.stringify(true);
    }
    if (this.lbl !== '') {
        data.lbl = this.lbl;
    }
    data.busWidth = this.busWidth;
    data.pos = this.custPosition;
    return data;
};

/*
    Sets the input state
*/
BusInput.prototype.setState = function (s) {
    this.setFalse();
    s = Array(Math.max(0, this.busWidth - s.length)).fill(false).concat(s).slice(0, this.busWidth);
    for (let i = 0; i < this.busWidth; i++) {
        this.outputs[i] = s[i];
    }
};

BusInput.prototype.setIsTop = function (b) {
    this.isTop = b;
};


BusInput.prototype.getOutput = function () {
    return this.outputs;
};

BusInput.prototype.mark = function (b) {
    this.marked = b;
};

BusInput.prototype.setFalse = function () {
    this.outputs = Array(this.busWidth).fill(false);
};

/*
    Sets the coordinates of the output, rounded to grid size
*/
BusInput.prototype.setCoordinates = function (nx, ny) {
    this.x = Math.round(nx / GRIDSIZE) * GRIDSIZE - GRIDSIZE / 2;
    this.y = Math.round(ny / GRIDSIZE) * GRIDSIZE - GRIDSIZE / 2;
};

BusInput.prototype.updateClickBox = function () {
    this.clickBox.updatePosition(this.x + GRIDSIZE / 2, this.y + GRIDSIZE / 2);
    this.clickBox.setTransform(transform);
};

/*
    Checks if the mouse is inside the clickBox
*/
BusInput.prototype.mouseOver = function () {
    return this.clickBox.mouseOver();
};

/*
    Checks if a certain point is in the output
*/
BusInput.prototype.pointInOutput = function (dummy, px, py) {
    return this.clickBox.checkPoint(px, py);
};

/*
    Displays the input on the screen
*/
BusInput.prototype.show = function (order = 0) {
    stroke(0);
    strokeWeight(3);
    if (this.marked) {
        stroke(MRED, MGREEN, MBLUE);
        fill(150);
    } else {
        fill(this.lowColor);
    }
    // Draw the rectangle that represents the input
    rect(this.x, this.y, this.w, this.h);
    noStroke();
    if (this.marked) {
        fill(170);
    } else {
        fill(LARED, LAGREEN, LABLUE);
    }
    triangle(this.x + 2, this.y + 2, this.x + GRIDSIZE - 2, this.y + 2, this.x + 2, this.y + GRIDSIZE - 2);

    if (this.marked) {
        fill(MRED, MGREEN, MBLUE);
    } else {
        fill(0);
    }
    textFont('Arial');
    textSize(10);
    textAlign(LEFT, TOP);
    text(this.busWidth, this.x + 4, this.y + 4);

    noFill();
    if (this.marked) {
        stroke(MRED, MGREEN, MBLUE);
    } else {
        stroke(0);
    }
    rect(this.x, this.y, this.w, this.h);

        if (this.marked) {
            stroke(MRED, MGREEN, MBLUE);
        } else {
            stroke(0);
        }
        strokeWeight(3);
        line(this.x + 8, this.y + 22, this.x + 22, this.y + 8);

    if (order > 0) {
        noStroke();
        fill(255);
        textSize(20);
        textFont('ArcaMajora3');
        //textAlign(LEFT, TOP);
        if (order.toString().length === 1) {
            text(order, this.x + 10, this.y + 7);
        } else {
            text(order, this.x + 4, this.y + 7);
        }
    }

    //this.clickBox.markClickBox();
};
