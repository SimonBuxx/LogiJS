// File: segmentDisplay.js

function SegmentDisplay(x, y, transform, bits) {
    this.x = x; // X-Position
    this.y = y; // Y-Position
    this.inputCount = bits;
    this.digits = Math.pow(2, bits).toString().length;
    this.w = GRIDSIZE * Math.max(Math.max((bits + 1), this.digits * 2), 3); // Width of the display
    this.h = GRIDSIZE * 3; // Height of the display
    this.transform = transform;
    this.marked = false;
    this.lowColor = color(50, 50, 50); // dark grey color
    this.highColor = color(HRED, HGREEN, HBLUE); // Color for high inputs (red)

    this.gClickBox = new ClickBox(this.x + GRIDSIZE / 2, this.y, this.w - GRIDSIZE, this.h, this.transform);
    this.inputClickBoxes = [];

    this.inputs = [];     // Vector of the input states
    this.ipset = [];      // set to true if the input was set
    this.inputsInv = [];  // true, if input is inverted

    this.value = 0; // Decimal input value

    this.id = 's' + Date.now() + Math.random();

    // Initialize the inputs
    for (let i = 0; i < this.inputCount; i++) {
        this.inputs.push(false); // Set all inputs to low
        this.ipset.push(false);
        this.inputsInv.push(false); // Set all inputs to not inverted
        this.inputClickBoxes.push(new ClickBox(0, 0, IOCBSIZE, IOCBSIZE, this.transform)); // Create new clickBoxes for every input
    }

    this.setCoordinates(this.x, this.y);
    this.updateClickBoxes();
}

SegmentDisplay.prototype.setInvertions = function (ipinv) {
    this.inputsInv = ipinv;
};

SegmentDisplay.prototype.getData = function () {
    let data = {};
    data.x = JSON.stringify(this.x);
    data.y = JSON.stringify(this.y);
    data.inputCount = JSON.stringify(this.inputCount);
    data.inputsInv = JSON.stringify(this.inputsInv);
    return data;
};

/*
    Sets the coordinates of the display, rounded to grid size
*/
SegmentDisplay.prototype.setCoordinates = function (nx, ny) {
    this.x = Math.round((nx - GRIDSIZE / 2) / GRIDSIZE) * GRIDSIZE;
    this.y = Math.round((ny - GRIDSIZE / 2) / GRIDSIZE) * GRIDSIZE;
};

SegmentDisplay.prototype.alterPosition = function (x1, y1) {
    this.x += x1;
    this.y += y1;
    this.updateClickBoxes();
};

/*
    Sets input #i to state s
*/
SegmentDisplay.prototype.setInput = function (i, s) {
    if (i < this.inputCount) {
        this.inputs[i] = s; // Set state
        this.ipset[i] = true;
        if (this.inputsInv[i]) {
            this.inputs[i] = !this.inputs[i];
        }
    } else {
        // Error
        console.log('Input ' + i + ' doesn\'t exist!');
    }
};

/*
    Inverts the given input
*/
SegmentDisplay.prototype.invertInput = function (input) {
    this.inputsInv[input] = !this.inputsInv[input]; // Invert isInverted-State
};

SegmentDisplay.prototype.shutdown = function () {
    for (let i = 0; i < this.inputCount; i++) {
        this.inputs[i] = false;
        this.ipset[i] = false;
    }
    this.value = 0;
};

/*
    Updates the clickBoxes (once after creation)
*/
SegmentDisplay.prototype.updateClickBoxes = function () {
    // Update input clickBoxes
    for (let i = 0; i < this.inputClickBoxes.length; i++) {
        this.inputClickBoxes[i].updatePosition(this.x + GRIDSIZE * (i + 1), this.y + this.h);
        this.inputClickBoxes[i].setTransform(this.transform);
    }
    this.gClickBox.updatePosition(this.x + this.w / 2, this.y + this.h / 2);
    this.gClickBox.updateSize(this.w - GRIDSIZE, this.h);
    this.gClickBox.setTransform(this.transform);
};

/*
    Checks if the mouse is over the display
*/
SegmentDisplay.prototype.mouseOver = function () {
    return this.gClickBox.mouseOver();
};

/*
    Checks if the mouse is over input n*/
SegmentDisplay.prototype.mouseOverInput = function (n) {
    return this.inputClickBoxes[n].mouseOver();
};

SegmentDisplay.prototype.pointInInput = function (n, px, py) {
    return this.inputClickBoxes[n].checkPoint(px, py);
};

SegmentDisplay.prototype.update = function () {
    this.value = 0;
    for (let i = 0; i < this.inputCount; i++) {
        if (this.inputs[i]) {
            this.value += Math.pow(2, this.inputCount - i - 1);
        }
    }
};

/*
Draws the gate on the screen
*/
SegmentDisplay.prototype.show = function () {
    stroke(0);
    if (this.marked) {
        fill(MRED, MGREEN, MBLUE);
    } else {
        fill(255, 255);
    }
    strokeWeight(3);
    
    if(previewSymbol !== null && !mouseIsPressed && !this.marked){
        fill(255, this.alpha);   
    }

    rect(this.x + GRIDSIZE / 2, this.y, this.w - GRIDSIZE, this.h); // Draw body
    
    noStroke();
    textSize(80);
    textAlign(CENTER, CENTER);
    fill(0);
    let txt = '';
    for (let i = 0; i < this.digits - this.value.toString().length; i++) {
        txt += '0';
    }
    txt += this.value.toString();
    text(txt, this.x + this.w / 2, this.y + this.h / 2);
    
    // Draw inputs
    for (let i = 1; i <= this.inputCount; i++) {
        // Draw inputs
        if (this.marked) {
            stroke(MRED, MGREEN, MBLUE);
            strokeWeight(3);
        } else if (this.inputs[i - 1]) {
            stroke(this.highColor);
            strokeWeight(5);
        } else {
            stroke(0);
            strokeWeight(3);
        }
        
        this.x1 = this.x + (GRIDSIZE * i);
        this.y1 = this.y + this.h;
        this.x2 = this.x + (GRIDSIZE * i);
        this.y2 = this.y + this.h + 6;
        line(this.x1, this.y1, this.x2, this.y2);
        
        fill(255);
        strokeWeight(2);
        
        if (this.inputsInv[i - 1]) {
            ellipse(this.x1, this.y1 + this.h / 20 - 1.5, 10, 10);
        }
    }
    
    
    // TEMP: Show clickboxes of inputs
    /*for (let i = 0; i < this.inputClickBoxes.length; i++) {
        this.inputClickBoxes[i].markClickBox();
    }*/
    //this.gClickBox.markClickBox();
};

SegmentDisplay.prototype.showPreview = function () {
    stroke(0);
    strokeWeight(3);

    fill(255, 100);   
    rect(this.x + GRIDSIZE / 2, this.y, this.w - GRIDSIZE, this.h); // Draw body
    
    noStroke();
    textSize(80);
    textAlign(CENTER, CENTER);
    fill(0);
    let txt = '';
    for (let i = 0; i < this.digits - this.value.toString().length; i++) {
        txt += '0';
    }
    txt += this.value.toString();
    text(txt, this.x + this.w / 2, this.y + this.h / 2);
    
    // Draw inputs
    for (let i = 1; i <= this.inputCount; i++) {
        // Draw inputs
        stroke(0);
        strokeWeight(3);
        
        this.x1 = this.x + (GRIDSIZE * i);
        this.y1 = this.y + this.h;
        this.x2 = this.x + (GRIDSIZE * i);
        this.y2 = this.y + this.h + 6;
        line(this.x1, this.y1, this.x2, this.y2);
        
        fill(255);
        strokeWeight(2);
    }
};