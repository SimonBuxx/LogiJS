// File: input.js

function Input(x, y) {
    this.x = x; // X-Position
    this.y = y; // Y-Position

    this.w = GRIDSIZE; // Width of the putput
    this.h = GRIDSIZE; // Height of the output

    this.state = false; // Input state
    this.outputs = false; // equal to state

    this.framecount = -1;
    this.clock = false;
    this.speed = 30;

    this.highColor = color(HRED, HGREEN, HBLUE); // Color for high inputs
    this.lowColor = color(50, 50, 50);   // Color for low inputs (dark grey)

    this.isTop = false;
    this.lbl = '';
    this.marked = false;

    this.id = 'i' + Date.now() + Math.random();

    // ClickBox is used for output and global
    this.clickBox = new ClickBox(this.x - GRIDSIZE / 2, this.y - GRIDSIZE / 2, this.w, this.h, transform);
    this.updateClickBox();
}

Input.prototype.alterPosition = function (x1, y1) {
    this.x += x1;
    this.y += y1;
    this.updateClickBox();
};

Input.prototype.getData = function () {
    var data = {};
    data.x = JSON.stringify(this.x);
    data.y = JSON.stringify(this.y);
    if (this.isTop) {
        data.istop = JSON.stringify(true);
    }
    if (this.lbl !== '') {
        data.lbl = this.lbl;
    }
    if (this.framecount === -1) {
        data.framecount = JSON.stringify(-1);
    } else {
        data.framecount = JSON.stringify(0);
    }
    data.clock = JSON.stringify(this.clock);
    if (this.clock) {
        data.speed = JSON.stringify(this.speed);
    }
    return data;
};

Input.prototype.getIsClock = function () {
    return this.clock;
};

Input.prototype.setClock = function (clk) {
    this.clock = Boolean(clk);
};

/*
    Sets the input state
*/
Input.prototype.setState = function (s) {
    this.state = s;
    this.outputs = s;
};

Input.prototype.setIsTop = function (b) {
    this.isTop = b;
};

Input.prototype.setSpeed = function (s) {
    this.speed = s;
};

Input.prototype.resetFramecount = function () {
    this.framecount = this.speed;
    this.clock = true;
};

/*
    Toggles the state
*/
Input.prototype.toggle = function () {
    this.setState(!this.state);
};

Input.prototype.getOutput = function () {
    return this.state;
};

Input.prototype.mark = function (b) {
    this.marked = b;
};

/*
    Sets the coordinates of the output, rounded to grid size
*/
Input.prototype.setCoordinates = function (nx, ny) {
    this.x = Math.round(nx / GRIDSIZE) * GRIDSIZE - GRIDSIZE / 2;
    this.y = Math.round(ny / GRIDSIZE) * GRIDSIZE - GRIDSIZE / 2;
    // Check bounds
    /*if (this.x < 15) {
        this.x = 15;
    }
    if (this.y < 15) {
        this.y = 15;
    }*/
};

Input.prototype.updateClickBox = function () {
    this.clickBox.updatePosition(this.x + GRIDSIZE / 2, this.y + GRIDSIZE / 2);
    this.clickBox.setTransform(transform);
};

/*
    Checks if the mouse is inside the clickBox
*/
Input.prototype.mouseOver = function () {
    return this.clickBox.mouseOver();
};

/*
    Checks if a certain point is in the output
*/
Input.prototype.pointInOutput = function (dummy, px, py) {
    return this.clickBox.checkPoint(px, py);
};

/*
    Displays the input on the screen
*/
Input.prototype.show = function (order = 0) {
    stroke(0);
    strokeWeight(3);
    if (this.state) {
        fill(this.highColor);
    } else if (this.marked) {
        stroke(MRED, MGREEN, MBLUE);
        fill(150);
    } else {
        fill(this.lowColor);
    }
    // Draw the rectangle that represents the input
    rect(this.x, this.y, this.w, this.h);
    noStroke();
    if (this.state) {
        fill(HARED, HAGREEN, HABLUE);
    } else if (this.marked) {
        fill(170);
    } else {
        fill(LARED, LAGREEN, LABLUE);
    }
    triangle(this.x + 2, this.y + 2, this.x + GRIDSIZE - 2, this.y + 2, this.x + 2, this.y + GRIDSIZE - 2);
    noFill();
    if (this.marked) {
        stroke(MRED, MGREEN, MBLUE);
    } else {
        stroke(0);
    }
    rect(this.x, this.y, this.w, this.h);
    if (this.framecount >= 0 && !this.clock) {
        if (this.marked) {
            fill(MRED, MGREEN, MBLUE);
        } else {
            fill(0);
        }
        if (this.state) {
            strokeWeight(7);
        }
        rect(this.x + 10, this.y + 10, this.w / 3, this.h / 3);
    }

    if (this.clock) {
        if (this.marked) {
            stroke(MRED, MGREEN, MBLUE);
        } else {
            stroke(0);
        }
        strokeWeight(3);
        line(this.x + 15, this.y + 6, this.x + 15, this.y + 15);
        line(this.x + 15, this.y + 15, this.x + 22, this.y + 20);
    }

    if (order > 0) {
        noStroke();
        fill(255);
        textSize(20);
        textFont('ArcaMajora3');
        textAlign(LEFT, TOP);
        if (order.toString().length === 1) {
            text(order, this.x + 10, this.y + 7);
        } else {
            text(order, this.x + 4, this.y + 7);
        }
    }

    //this.clickBox.markClickBox();
};
