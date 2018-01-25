// File: wseg.js

function WSeg(dir, startX, startY, state, transform) {
    this.highColor = color(HRED, HGREEN, HBLUE); // Color for high
    this.lowColor = color(LRED, LGREEN, LBLUE);  // Color for low
    this.deleteColor = color(DRED, DGREEN, DBLUE);  // Color for delete

    this.state = state; // Wire state (0 low, 1 high);

    this.direction = dir; // 0 or 1, meaning horizontal or vertical
    this.transform = transform;

    this.startX = 0; // Start point of the segment
    this.startY = 0;

    this.endX = 0; // Calculated by getEndPoint()
    this.endY = 0;

    this.parentStart = null; // Start parent
    this.parentEnd = null; // End parent
    this.startIO = 0; // 0 for IP, 1 for OP
    this.endIO = 0;
    this.start = null; // In-/Output number
    this.end = null;  // One segment can have at max two Outputs or two Inputs connected

    this.marked = false;
    this.markColor = color(180, 200, 50);

    this.changePosition(startX, startY); // Initialize the start point
}

WSeg.prototype.getData = function () {
    var data = {};
    data.startX = JSON.stringify(this.startX);
    data.startY = JSON.stringify(this.startY);
    data.direction = JSON.stringify(this.direction);
    return data;
};

WSeg.prototype.getWireData = function () {
    var data = {};
    data.x1 = JSON.stringify(this.startX);
    data.y1 = JSON.stringify(this.startY);
    data.x2 = JSON.stringify(this.endX);
    data.y2 = JSON.stringify(this.endY);
    return data;
};

WSeg.prototype.alterPosition = function (x1, y1) {
    this.endX +=  x1;
    this.endY +=  y1;
    this.startX += x1;
    this.startY += y1;
};

WSeg.prototype.changePosition = function (newX, newY) {
    this.startX = Math.round(newX / GRIDSIZE) * GRIDSIZE;
    this.startY = Math.round(newY / GRIDSIZE) * GRIDSIZE;
    switch (this.direction) {
        case 0:
            this.endX = this.startX + GRIDSIZE;
            this.endY = this.startY;
            break;
        case 1:
            this.endY = this.startY + GRIDSIZE;
            this.endX = this.startX;
            break;
        default:
            console.log('No valid direction given!');
    }
};

WSeg.prototype.setState = function (s) {
    this.state = s;
};

WSeg.prototype.setStart = function (io, parent, port) {
    this.start = port;
    this.parentStart = parent;
    this.startIO = io;
};

WSeg.prototype.setEnd = function (io, parent, port) {
    this.end = port;
    this.parentEnd = parent;
    this.endIO = io;
};

WSeg.prototype.getOutput = function () {
    return this.state;
};

WSeg.prototype.show = function (del) {
    strokeWeight(3);
    if (this.state) {
        strokeWeight(4);
        stroke(this.highColor);
    } else if (del) {
        strokeWeight(4);
        stroke(this.deleteColor);
    } else {
        stroke(this.lowColor);
    }
    if (this.marked) {
        stroke(this.markColor);
    }
    line(this.startX, this.startY, this.endX, this.endY);
};