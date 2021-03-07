// File: conpoint.js

function ConPoint(x, y, state, g, isBusConpoint = false) {
    this.x = x;
    this.y = y;
    this.state = state;
    this.group = g;
    this.isBusConpoint = isBusConpoint;

    this.highColor = color(HRED, HGREEN, HBLUE); // Color for high
    this.lowColor = color(LRED, LGREEN, LBLUE);  // Color for low

    this.marked = false;
    this.markColor = color(MRED, MGREEN, MBLUE);

    this.id = 'p' + Date.now() + Math.random();
}

ConPoint.prototype.getData = function () {
    let data = {};
    data.x = JSON.stringify(this.x);
    data.y = JSON.stringify(this.y);
    return data;
};

ConPoint.prototype.alterPosition = function (x1, y1) {
    this.x += x1;
    this.y += y1;
};

ConPoint.prototype.setGroup = function (ng) {
    this.group = ng;
};

ConPoint.prototype.show = function () {
    strokeWeight(0);
    if (this.marked) {
        fill(this.markColor);
    } else if (this.state) {
        fill(this.highColor);
    } else {
        fill(this.lowColor);
    }
    if (!this.isBusConpoint) {
        rect(this.x - 3, this.y - 3, 7, 7);
    } else {
        rect(this.x - 5, this.y - 5, 10, 10);
    }
};
