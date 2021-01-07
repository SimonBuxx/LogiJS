// File: wire.js

function Wire(dir, startX, startY, state) {
    this.highColor = color(HRED, HGREEN, HBLUE); // Color for high
    this.lowColor = color(LRED, LGREEN, LBLUE);  // Color for low

    this.state = state; // Wire state (false low, true high);

    this.direction = dir; // 0 or 1, meaning horizontal or vertical

    this.startX = 0; // Start point of the segment
    this.startY = 0;

    this.endX = 0;
    this.endY = 0;

    this.parents = [];
    this.IOs = [];
    this.ports = [];

    this.marked = false;

    this.group = -1;

    this.id = 'w' + Date.now() + Math.random();

    this.changePosition(startX, startY); // Initialize the start point
}

Wire.prototype.getData = function () {
    var data = {};
    data.x1 = JSON.stringify(this.startX);
    data.y1 = JSON.stringify(this.startY);
    if (this.startX !== this.endX) {
        data.x2 = JSON.stringify(this.endX);
    } else {
        data.y2 = JSON.stringify(this.endY);
    }
    return data;
};

Wire.prototype.alterPosition = function (x1, y1) {
    this.endX += x1;
    this.endY += y1;
    this.startX += x1;
    this.startY += y1;
};

Wire.prototype.changePosition = function (newX, newY) {
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

Wire.prototype.setState = function (s) {
    this.state = s;
};

Wire.prototype.setGroup = function (g) {
    this.group = g;
};

Wire.prototype.addParent = function (io, parent, port) {
    this.ports.push(port);
    this.parents.push(parent);
    this.IOs.push(io);
};

Wire.prototype.getOutput = function () {
    return this.state;
};

Wire.prototype.show = function (del = false, num='') {
    if (this.state || del) {
        strokeWeight(5);
    } else {
        strokeWeight(3);
    }
    if (this.state) {
        stroke(this.highColor);
    } else if (this.marked || del) {
        stroke(MRED, MGREEN, MBLUE);
    } else {
        stroke(this.lowColor);
    }
    line(this.startX, this.startY, this.endX, this.endY);
    /*noStroke();
    fill(0);
    if (this.direction === 0) {
        text(num, Math.min(this.startX, this.endX) + 10, this.startY - 15);
    } else {
        text(num, this.startX + 10, Math.min(this.startY, this.endY) + 15);
    }*/
};