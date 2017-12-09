// File: conpoints.js
// Name: Simon Buchholz
// Date: 24/8/17

function ConPoint(x, y, state, g) {
    this.x = x;
    this.y = y;
    this.state = state;
    this.group = g;

    this.highColor = color(HRED, HGREEN, HBLUE); // Color for high
    this.lowColor = color(LRED, LGREEN, LBLUE);  // Color for low
}

ConPoint.prototype.getData = function () {
    var data = {};
    data.x = JSON.stringify(this.x);
    data.y = JSON.stringify(this.y);
    return data;
};

ConPoint.prototype.setGroup = function (ng) {
    this.group = ng;
};

ConPoint.prototype.show = function () {
    if (this.state) {
        strokeWeight(0);
        fill(this.highColor);
        rect(this.x - 3, this.y - 3, 6, 6);
    } else {
        strokeWeight(0);
        fill(this.lowColor);
        rect(this.x - 2, this.y - 2, 4, 4);
    }
};
