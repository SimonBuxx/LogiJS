// File: label.js

function Label(x, y, txt, transform) {
    this.x = x; // X position
    this.y = y; // Y position
    this.h = 20;
    this.w = 0;
    this.transform = transform;
    this.txt = txt; // Label text
    this.lines = [];
    this.marked = false;

    this.id = 'l' + Date.now() + Math.random();

    this.clickBox = new ClickBox(this.x, this.y, this.w, this.h, this.transform);

    this.getData = function () {
        var data = {};
        data.x = JSON.stringify(this.x);
        data.y = JSON.stringify(this.y);
        data.txt = this.txt;
        return data;
    };

    /*
        Sets the coordinates of the label, rounded to grid size
    */
    this.setCoordinates = function (nx, ny) {
        this.x = Math.round(nx / GRIDSIZE) * GRIDSIZE;
        this.y = Math.round(ny / GRIDSIZE) * GRIDSIZE;
    };

    this.setCoordinates(x, y);

    this.mark = function (marked) {
        this.marked = marked;
    };

    this.alterPosition = function (x1, y1) {
        this.x += x1;
        this.y += y1;
        this.updateClickBox();
    };

    this.updateClickBox = function () {
        this.clickBox.updatePosition(this.x + this.w / 2 - 15, this.y + this.h / 2 - 10);
        this.clickBox.updateSize(this.w, this.h + 10);
        this.clickBox.setTransform(this.transform);
    };

    this.alterText = function (txt) {
        this.txt = txt;
        //this.lines = txt.split('\n');
        this.lines = txt.split('\n').filter(e => e !== '');
        textSize(20);
        this.w = Math.ceil((textWidth(this.lines.reduce(function (a, b) { return a.length > b.length ? a : b; })) + 10) / 30 + 1) * 30;
        this.h = 30 * this.lines.length - 10;
        this.updateClickBox();
    };

    this.alterText(txt);

    /*
        Checks if the mouse is inside the clickBox
    */
    this.mouseOver = function () {
        return this.clickBox.mouseOver();
    };

    this.show = function () {
        strokeWeight(3);
        stroke(140);
        if (this.marked) {
            fill(MRED, MGREEN, MBLUE);
            stroke(0);
        } else {
            fill(150, 200);
        }
        rect(this.x - 15, this.y - 15, this.w, this.h + 10);
        noStroke();
        fill(0);
        rect(this.x - 5, this.y - 5, 10, 10);
        for (let i = 0; i < this.lines.length; i++) {
            text(this.lines[i], this.x + 15, this.y - 11 + i * 30, this.w, this.h);
        }
        //text(this.txt, this.x + 15, this.y - 11, this.w, this.h);
        //this.clickBox.markClickBox();
    };
}
