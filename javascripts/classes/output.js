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
    this.highColor = color(HRED, HGREEN, HBLUE); // Color for high outputs
    this.accentColor = color(HARED, HAGREEN, HABLUE);
    //this.lowColor = color(LRED, LGREEN, LBLUE); // Color for low outputs
    //this.markColor = color(MRED, MGREEN, MBLUE);   // Color for marked outputs

    this.id = 'o' + Date.now() + Math.random();

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
            this.accentColor = color(HARED, HAGREEN, HABLUE);
            break;
        case 1:
            this.highColor = color(YRED, YGREEN, YBLUE);
            this.accentColor = color(YARED, YAGREEN, YABLUE);
            break;
        case 2:
            this.highColor = color(GRED, GGREEN, GBLUE);
            this.accentColor = color(GARED, GAGREEN, GABLUE);
            break;
        case 3:
            this.highColor = color(BRED, BGREEN, BBLUE);
            this.accentColor = color(BARED, BAGREEN, BABLUE);
            break;
        default:
            this.highColor = color(HRED, HGREEN, HBLUE);
            this.accentColor = color(HARED, HAGREEN, HABLUE);
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
        fill(MRED, MGREEN, MBLUE);
    } else {
        fill(50);
    }
    // Draw the circle that represents the output
    ellipse(this.x, this.y, this.w, this.h);
    if (this.state) {
        fill(this.accentColor);
    } else if (this.marked) {
        fill(MARED, MAGREEN, MABLUE);
    } else {
        fill(LARED, LAGREEN, LABLUE);
    }
    arc(this.x, this.y, GRIDSIZE, GRIDSIZE, HALF_PI + QUARTER_PI, PI + HALF_PI + QUARTER_PI, OPEN);
    /*if (!this.state) {
        stroke(200);
    } else {
        stroke(255);
    }*/
    //strokeWeight(3);
    //noFill();
    //arc(this.x, this.y, 20, 20, PI, PI + HALF_PI);
    //this.clickBox.markClickBox();
};

Output.prototype.showPreview = function () {
    stroke(0);
    strokeWeight(3);
    fill(50, 50, 50, 100);
    
    // Draw the circle that represents the output
    ellipse(this.x, this.y, this.w, this.h);
};
