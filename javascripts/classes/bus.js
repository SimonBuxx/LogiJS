// File: bus.js

function Bus(dir, startX, startY) {
    this.highColor = color(HRED, HGREEN, HBLUE); // Color for high
    this.lowColor = color(LRED, LGREEN, LBLUE);  // Color for low
    this.markedColor = color(MRED, MGREEN, MBLUE);  // Color for marked

    this.direction = dir; // 0 or 1, meaning horizontal or vertical

    this.startX = 0; // Start point of the segment
    this.startY = 0;

    this.endX = 0;
    this.endY = 0;

    this.busWidth = 0; // number of wires contained
    this.busWidthSet = false;
    this.showBusMarker = false; // Show the diagonal line and bus width

    this.textDistance = 12; // Distance of the bus width label to the bus
    this.textSize = 15;

    this.marked = false;

    this.group = -1;

    this.id = 'b' + Date.now() + Math.random();

    this.changePosition(startX, startY); // Initialize the start point

    this.states = Array(this.busWidth).fill(false); // create an array for the wire states
}

Bus.prototype.getData = function () {
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

Bus.prototype.alterPosition = function (x1, y1) {
    this.endX += x1;
    this.endY += y1;
    this.startX += x1;
    this.startY += y1;
};

Bus.prototype.changePosition = function (newX, newY) {
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

Bus.prototype.setStates = function (s) {
    this.states = s;
};

Bus.prototype.setBusWidth = function (newWidth) {
    this.busWidth = newWidth;
    this.busWidthSet = true;
}

Bus.prototype.setGroup = function (g) {
    this.group = g;
};

Bus.prototype.getOutput = function () {
    return this.states;
};

Bus.prototype.show = function (del = false, num='') {
    strokeWeight(6);
    if (this.marked || del) {
        stroke(this.markedColor);
    } else {
        stroke(this.lowColor);
    }

    line(this.startX, this.startY, this.endX, this.endY); // Draw the bus line
    
    if (this.showBusMarker) {
        strokeWeight(3);
        if (this.direction === 0) {
            line(this.startX + Math.abs((this.endX - this.startX) / 2) - 10, this.startY + 10, this.startX + Math.abs((this.endX - this.startX) / 2) + 10, this.endY - 10);
        } else {
            line(this.startX - 10, this.startY + Math.abs((this.endY - this.startY) / 2) + 10, this.endX + 10, this.startY + Math.abs((this.endY - this.startY) / 2) - 10);
        }
        if (this.busWidthSet) {
            noStroke();
            fill(0);
            textSize(this.textSize);
            textAlign(CENTER, CENTER);
            if (this.direction === 0) {
                text(this.busWidth, this.startX + Math.abs((this.endX - this.startX) / 2) - 5, this.startY - this.textDistance);
            } else {
                text(this.busWidth, this.startX + this.textDistance + 2, this.startY + Math.abs((this.endY - this.startY) / 2) + 5);
            }
        }
    }
   
    /*noStroke();
    fill(0);
    if (this.direction === 0) {
        text(num, Math.min(this.startX, this.endX) + 10, this.startY - 15);
    } else {
        text(num, this.startX + 10, Math.min(this.startY, this.endY) + 15);
    }*/
};