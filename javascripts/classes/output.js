// File: output.js

function Output(x, y, transform, colr) {
    this.x = x; // X-Position
    this.y = y; // Y-Position
    this.w = GRIDSIZE; // Width of the putput
    this.h = GRIDSIZE; // Height of the output
    this.state = false; // Output state
    this.transform = transform;
    this.lbl = '';
    this.colr = colr; // 0 = red, 1 = yellow, 2 = green, 3 = blue
    this.marked = false;
    this.alpha = 255;
    this.highColor = color(HRED, HGREEN, HBLUE); // Color for high outputs (red)
    this.lowColor = color(50, 50, 50, this.alpha); // Color for low outputs (dark grey)
    this.markColor = color(0, 100, 50);   // Color for marked inputs

    // ClickBox is used for input and global
    this.clickBox = new ClickBox(this.x, this.y, this.w, this.h, this.transform);

    this.updateColor();
    this.updateClickBox();
}

/*
    Manually sets the output state
*/
Output.prototype.setInput = function (dummy, s) {
    this.state = s;
};

Output.prototype.getData = function () {
    var data = {};
    data.x = JSON.stringify(this.x);
    data.y = JSON.stringify(this.y);
    data.colr = JSON.stringify(this.colr);
    if (this.lbl !== '') {
        console.log('adding label');
        data.lbl = this.lbl;
    }
    return data;
};

/*
    Sets the coordinates of the output, rounded to grid size
*/
Output.prototype.setCoordinates = function (nx, ny) {
    this.x = Math.round(nx / GRIDSIZE) * GRIDSIZE;
    this.y = Math.round(ny / GRIDSIZE) * GRIDSIZE;
    // Check bounds
    /*if (this.x < 30) {
        this.x = 30;
    }
    if (this.y < 30) {
        this.y = 30;
    }*/
};

Output.prototype.updateClickBox = function () {
    this.clickBox.updatePosition(this.x, this.y);
    this.clickBox.setTransform(this.transform);
};

Output.prototype.alterPosition = function (x1, y1) {
    this.x += x1;
    this.y += y1;
    this.updateClickBox();
};

/*
    Checks if the mouse is inside the clickBox
*/
Output.prototype.mouseOver = function () {
    return this.clickBox.mouseOver();
};

Output.prototype.pointInInput = function (dummy, px, py) {
    return this.clickBox.checkPoint(px, py);
};

Output.prototype.mark = function (b) {
    this.marked = b;
};

Output.prototype.updateColor = function () {
    switch (this.colr) {
        case 0:
            this.highColor = color(HRED, HGREEN, HBLUE);
            break;
        case 1:
            this.highColor = color(YRED, YGREEN, YBLUE);
            break;
        case 2:
            this.highColor = color(GRED, GGREEN, GBLUE);
            break;
        case 3:
            this.highColor = color(BRED, BGREEN, BBLUE);
            break;
        default:
            this.highColor = color(HRED, HGREEN, HBLUE);
            console.log('Notice: Output color is invalid, setting to red');
            break;
    }
};

/*
    Displays the output on the screen
*/
Output.prototype.show = function () {
    stroke(0);
    strokeWeight(3);
    if (this.state) {
        fill(this.highColor);
    } else if (this.marked) {
        fill(this.markColor);
    } else {
        fill(this.lowColor);
    }
    // Makes preview symbol more transparent
    if (previewSymbol !== null && !this.state && !this.marked && !mouseIsPressed){
        fill(50, 50, 50, this.alpha);
    }
    // Draw the circle that represents the output
    ellipse(this.x, this.y, this.w, this.h);
    //this.clickBox.markClickBox();
};
