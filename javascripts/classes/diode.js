// File: diode.js

function Diode(x, y, state, transform) {
    this.x = x; // X position
    this.y = y; // Y position
    this.transform = transform;
    this.state = state; // State of the diode

    this.highColor = color(HRED, HGREEN, HBLUE); // Color for high
    this.lowColor = color(LRED, LGREEN, LBLUE);  // Color for low

    this.gA = -1; // Group A (Horizontal crossing)
    this.gB = -1; // Group B (Vertical Crossing)

    this.clickBox = new ClickBox(this.x, this.y, 20, 20, this.transform);

    this.marked = false;
    this.markColor = color(50, 100, 50);

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
        this.gA = a;
        this.gB = b;
    };

    /*
        Sets the coordinates of the diode, rounded to grid size
    */
    this.setCoordinates = function (nx, ny) {
        this.x = Math.round(nx / GRIDSIZE) * GRIDSIZE;
        this.y = Math.round(ny / GRIDSIZE) * GRIDSIZE;
        // Check bounds
        if (this.x < 0) {
            this.x = 0;
        }
        if (this.y < 0) {
            this.y = 0;
        }
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

    /*
        Checks if a certain point is in the diode
    */
    this.pointInDiode = function (dummy, px, py) {
        return this.clickBox.checkPoint(px, py);
    };

    this.show = function () {
        strokeWeight(0);
        if (this.marked) {
            fill(this.markColor);
        } else if (this.state) {
            fill(this.highColor);
        } else {
            fill(this.lowColor);
        }
        triangle(this.x, this.y + 10, this.x - 10, this.y - 1, this.x + 10, this.y - 1);
        //this.clickBox.markClickBox();
    };
}
