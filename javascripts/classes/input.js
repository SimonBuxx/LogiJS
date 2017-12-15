// File: input.js
// Name: Simon Buchholz
// Date: 27/10/17

function Input(x, y, transform) {
    this.x = x; // X-Position
    this.y = y; // Y-Position

    this.w = GRIDSIZE; // Width of the putput
    this.h = GRIDSIZE; // Height of the output

    this.state = false; // Input state
    this.outputs = false; // equal to state

    this.framecount = -1;
    this.clock = false;

    this.transform = transform;

    this.highColor = color(HRED, HGREEN, HBLUE); // Color for high inputs (red)
    this.lowColor = color(50, 50, 50);   // Color for low inputs (dark grey)
    this.markColor = color(50, 100, 50);   // Color for marked inputs

    this.isTop = false;
    this.lbl = '';
    this.marked = false;

    // ClickBox is used for output and global
    this.clickBox = new ClickBox(this.x - GRIDSIZE / 2, this.y - GRIDSIZE / 2, this.w, this.h, this.transform);
    this.updateClickBox();
}

Input.prototype.getData = function () {
    var data = {};
    data.x = JSON.stringify(this.x);
    data.y = JSON.stringify(this.y);
    if (this.isTop) {
        data.istop = JSON.stringify(true);
    }
    if (this.lbl !== '') {
        data.lbl = this.lbl;
    }
    if (this.framecount == -1) {
        data.framecount = JSON.stringify(-1);
    } else {
        data.framecount = JSON.stringify(0);
    }
    data.clock = JSON.stringify(this.clock);
    return data;
};

Input.prototype.getIsClock = function () {
    return this.clock;
};

Input.prototype.setClock = function (clk) {
    this.clock = Boolean(clk);
};

/*
    Sets the input state
*/
Input.prototype.setState = function (s) {
    this.state = s;
    this.outputs = s;
};

Input.prototype.setIsTop = function (b) {
    this.isTop = b;
};

/*
    Toggles the state
*/
Input.prototype.toggle = function () {
    this.setState(!this.state);
};

Input.prototype.getOutput = function () {
    return this.state;
};

Input.prototype.mark = function (b) {
    this.marked = b;
}

/*
    Sets the coordinates of the output, rounded to grid size
*/
Input.prototype.setCoordinates = function (nx, ny) {
    this.x = Math.round(nx / GRIDSIZE) * GRIDSIZE - GRIDSIZE / 2;
    this.y = Math.round(ny / GRIDSIZE) * GRIDSIZE - GRIDSIZE / 2;
    // Check bounds
    if (this.x < 0) this.x = 0;
    if (this.y < 0) this.y = 0;
};

Input.prototype.updateClickBox = function () {
    this.clickBox.updatePosition(this.x + GRIDSIZE / 2, this.y + GRIDSIZE / 2);
    this.clickBox.setTransform(this.transform);
};

/*
    Checks if the mouse is inside the clickBox
*/
Input.prototype.mouseOver = function () {
    return this.clickBox.mouseOver();
};

/*
    Checks if a certain point is in the output
*/
Input.prototype.pointInOutput = function (dummy, px, py) {
    return this.clickBox.checkPoint(px, py);
};

/*
    Displays the input on the screen
*/
Input.prototype.show = function () {
    stroke(0);
    strokeWeight(3);
    if (this.state) {
        fill(this.highColor);
    } else {
        if (this.marked) {
            fill(this.markColor);
        } else {
            fill(this.lowColor);
        }
    }
    // Draw the rectangle that represents the input
    rect(this.x, this.y, this.w, this.h);

    if (this.framecount >= 0 && !this.clock) {
        fill(0);
        if (this.state) {
            strokeWeight(7);
        }
        rect(this.x + 10, this.y + 10, this.w / 3, this.h / 3);
    }

    //this.clickBox.markClickBox();
};
