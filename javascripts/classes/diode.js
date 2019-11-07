// File: diode.js

function Diode(x, y, state, transform) {
    this.x = x; // X position
    this.y = y; // Y position
    this.transform = transform;
    this.state = state; // State of the diode

    this.highColor = color(HRED, HGREEN, HBLUE); // Color for high
    this.lowColor = color(LRED, LGREEN, LBLUE);  // Color for low

    this.groupA = -1; // Group A (Horizontal crossing)
    this.groupB = -1; // Group B (Vertical Crossing)

    this.clickBox = new ClickBox(this.x, this.y, 20, 20, this.transform);

    this.marked = false;

    this.id = 'd' + Date.now() + Math.random();

    this.getData = function () {
        var data = {};
        data.x = JSON.stringify(this.x);
        data.y = JSON.stringify(this.y);
        return data;
    };

    this.alterPosition = function (x1, y1) {
        this.x += x1;
        this.y += y1;
        this.updateClickBox();
    };

    /*
        Sets the state of the diode
    */
    this.setState = function (s) {
        this.state = s;
    };

    this.setGroups = function (a, b) {
        this.groupA = a;
        this.groupB = b;
    };

    /*
        Sets the coordinates of the diode, rounded to grid size
    */
    this.setCoordinates = function (nx, ny) {
        this.x = Math.round(nx / GRIDSIZE) * GRIDSIZE;
        this.y = Math.round(ny / GRIDSIZE) * GRIDSIZE;
    };

    this.updateClickBox = function () {
        this.clickBox.updatePosition(this.x, this.y);
        this.clickBox.setTransform(this.transform);
    };

    this.updateClickBox();

    /*
        Checks if the mouse is inside the clickBox
    */
    this.mouseOver = function () {
        return this.clickBox.mouseOver();
    };

    this.show = function () {
        noStroke();
        if (this.marked) {
            fill(MRED, MGREEN, MBLUE);
        } else if (this.state) {
            fill(this.highColor);
        } else {
            fill(this.lowColor);
        }
        triangle(this.x, this.y + 11, this.x - 11, this.y, this.x + 11, this.y);
        //this.clickBox.markClickBox();
    };
}
