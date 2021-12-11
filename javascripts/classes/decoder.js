// File: decoder.js

function Decoder(x, y, direction, inputCount, useInputBus, useOutputBus) {
    this.x = x; // X-Position of the Gate (translated)
    this.y = y; // Y-Position

    this.direction = direction;     // Gate direction (0 = inputs left)
    this.inputCount = inputCount; // # of inputs
    this.outputCount = Math.pow(2, this.inputCount);

    this.highColor = color(HRED, HGREEN, HBLUE); // Color for high in-/outputs (red)
    this.lowColor = color(LRED, LGREEN, LBLUE);  // Color for low in-/outputs (black)

    this.inputs = Array(inputCount).fill(false);
    this.ipset = Array(inputCount).fill(false);
    this.inBusSet = false;
    this.outputs = Array(this.outputCount).fill(false); // Output bus state vector
    this.inputsInv = Array(inputCount).fill(false); // true, if input is inverted
    this.outputsInv = Array(this.outputCount).fill(false);

    this.useInBus = useInputBus;
    this.useOutBus = useOutputBus;

    this.w = 2 * GRIDSIZE; // Width of the gate
    if (!this.useOutBus) {
        this.h = 2 * GRIDSIZE + GRIDSIZE * (this.outputCount - 1);
        this.height = this.outputCount + 1;
    } else if (!this.useInBus) {
        this.h = 2 * GRIDSIZE + GRIDSIZE * (this.inputCount - 1);
        this.height = this.inputCount + 1;
    } else {
        this.h = 3 * GRIDSIZE;
        this.height = 3;
    }

    this.inBusInverted = false;
    this.outBusInverted = true;

    this.textSize = 10;

    this.id = 'e' + Date.now() + Math.random();


    // These contain the ClickBoxes of the inputs and outputs and the global ClickBox
    this.outputClickBox = new ClickBox(0, 0, IOCBSIZE, IOCBSIZE, transform);
    this.inputClickBox = new ClickBox(0, 0, IOCBSIZE, IOCBSIZE, transform);
    this.outputClickBoxes = [];
    this.inputClickBoxes = [];

    this.invertInputClickBox = new ClickBox(0, 0, IOCBSIZE, IOCBSIZE, transform);
    this.invertOutputClickBox = new ClickBox(0, 0, IOCBSIZE, IOCBSIZE, transform);

    this.marked = false;

    if (this.direction % 2 === 0) {
        this.gClickBox = new ClickBox(this.x, this.y + GRIDSIZE / 2, this.w, this.h - GRIDSIZE, transform);
    } else {
        this.gClickBox = new ClickBox(this.x + GRIDSIZE / 2, this.y, this.w - GRIDSIZE, this.h, transform);
    }

    // Initialize the outputs
    for (let i = 0; i < this.inputCount; i++) {
        this.inputClickBoxes.push(new ClickBox(0, 0, 10, 10, transform)); // Create new clickBoxes for every input
    }
    for (let i = 0; i < this.outputCount; i++) {
        this.outputClickBoxes.push(new ClickBox(0, 0, 10, 10, transform));
    }

    this.setCoordinates(this.x, this.y);
    this.setDirection(direction); // Set the direction at the beginning
    this.updateClickBoxes();
}

Decoder.prototype.setInvertions = function (ipinv, opinv) {
    this.inputsInv = ipinv;
    this.outputsInv = opinv;
};

Decoder.prototype.getData = function () {
    let data = {};
    data.x = JSON.stringify(this.x);
    data.y = JSON.stringify(this.y);
    data.direction = JSON.stringify(this.direction);
    data.inputCount = JSON.stringify(this.inputCount);
    data.inputsInv = JSON.stringify(this.inputsInv);
    data.outputsInv = JSON.stringify(this.outputsInv);
    data.useInputBus = JSON.stringify(this.useInBus);
    data.useOutputBus = JSON.stringify(this.useOutBus);
    data.inBusInverted = JSON.stringify(this.inBusInverted);
    data.outBusInverted = JSON.stringify(this.outBusInverted);
    return data;
};

/*
    Sets the coordinates of the gate, rounded to grid size
*/
Decoder.prototype.setCoordinates = function (nx, ny) {
    this.x = Math.round((nx - GRIDSIZE / 2) / GRIDSIZE) * GRIDSIZE;
    this.y = Math.round((ny - GRIDSIZE / 2) / GRIDSIZE) * GRIDSIZE;
};

/*
     Swaps width and height
 */
Decoder.prototype.turn = function () {
    this.temp = this.h;
    this.h = this.w;
    this.w = this.temp;
};

/*
    Sets the direction of the gate
*/
Decoder.prototype.setDirection = function (dir) {
    this.dir = dir;
    if (this.dir % 2 !== 0) {
        this.turn();
    }
};

Decoder.prototype.alterPosition = function (x1, y1) {
    this.x += x1;
    this.y += y1;
    this.updateClickBoxes();
};

/*
    Sets input #i to state s
*/
Decoder.prototype.setInput = function (port = 0, s) {
    if (!this.useInBus) {
        if (port < this.inputCount) {
            this.inputs[port] = s; // Set state
            this.ipset[port] = true;
            if (this.inputsInv[port]) {
                this.inputs[port] = !this.inputs[port];
            }
        } else {
            // Error
            console.log('Input ' + port + ' doesn\'t exist!');
        }
    } else {
        this.inputs = (this.inBusInverted) ? s.slice(s.length - this.inputCount, s.length).reverse() : s.slice(s.length - this.inputCount, s.length); // Set state
        this.inBusSet = true;
    }

};

Decoder.prototype.invertInputBus = function () {
    this.inBusInverted = !this.inBusInverted;
};

Decoder.prototype.invertOutputBus = function () {
    this.outBusInverted = !this.outBusInverted;
};

/*
    Gives the output vector of the logic function
*/
Decoder.prototype.update = function () {
    let value = 0;
    for (let i = 0; i < this.inputCount; i++) {
        if (!this.useInBus) {
            if (!this.ipset[i]) {
                this.inputs[i] = this.inputsInv[i];
            }
        }

        if (this.inputs[i]) {
            value += Math.pow(2, this.inputCount - i - 1);
        }
    }
    this.outputs = Array(this.outputCount).fill(false);
    this.outputs[value] = true;
    for (let i = 0; i < this.outputCount; i++) {
        this.outputs[i] = (i === value);
        if (!this.useOutBus) {
            if (this.outputsInv[i]) {
                this.outputs[i] = !this.outputs[i];
            }
        }
    }

};

Decoder.prototype.shutdown = function () {
    for (let i = 0; i < this.inputCount; i++) {
        this.inputs[i] = false;
        this.ipset[i] = false;
    }
    for (let i = 0; i < this.outputCount; i++) {
        this.outputs[i] = false;
    }
    this.inBusSet = false;
};

/*
    Gives the state of output i
*/
Decoder.prototype.getOutput = function (i = 0) {
    if (this.useOutBus) {
        return (this.outBusInverted) ? this.outputs.reverse() : this.outputs;
    } else {
        return this.outputs[i];
    }
};

/*
    Inverts the given output
*/
Decoder.prototype.invertInput = function (input) {
    if (!this.useInBus) {
        this.inputsInv[input] = !this.inputsInv[input]; // Invert isInverted-State
    } else {
        console.log('Cannot invert bus input bits!');
    }
};

Decoder.prototype.invertOutput = function (output) {
    if (!this.useOutBus) {
        this.outputsInv[output] = !this.outputsInv[output]; // Invert isInverted-State
    } else {
        console.log('Cannot invert bus output bits!');
    }
};

/*
    Updates the clickBoxes (once after creation)
*/
Decoder.prototype.updateClickBoxes = function () {
    switch (this.direction) {
        case 0:
            this.inputClickBox.updatePosition(this.x, this.y + (this.h) / this.height);
            this.outputClickBox.updatePosition(this.x + this.w, this.y + this.h / this.height);
            this.invertInputClickBox.updatePosition(this.x + 10, this.y + this.h - GRIDSIZE / 2 - 10);
            this.invertOutputClickBox.updatePosition(this.x + this.w - 10, this.y + this.h - GRIDSIZE / 2 - 10);
            break;
        case 1:
            this.inputClickBox.updatePosition(this.x + (this.w) / this.height, this.y);
            this.outputClickBox.updatePosition(this.x + GRIDSIZE, this.y + this.h);
            this.invertInputClickBox.updatePosition(this.x + this.w - GRIDSIZE / 2 - 10, this.y + 10);
            this.invertOutputClickBox.updatePosition(this.x + this.w - GRIDSIZE / 2 - 10, this.y + this.h - 10);
            break;
        case 2:
            this.inputClickBox.updatePosition(this.x + this.w, this.y + (this.h) / this.height);
            this.outputClickBox.updatePosition(this.x, this.y + this.h / this.height);
            this.invertInputClickBox.updatePosition(this.x + this.w - 10, this.y + this.h - GRIDSIZE / 2 - 10);
            this.invertOutputClickBox.updatePosition(this.x + 10, this.y + this.h - GRIDSIZE / 2 - 10);
            break;
        case 3:
            this.inputClickBox.updatePosition(this.x + (this.w) / this.height, this.y + this.h);
            this.outputClickBox.updatePosition(this.x + GRIDSIZE, this.y);
            this.invertInputClickBox.updatePosition(this.x + this.w - GRIDSIZE / 2 - 10, this.y + this.h - 10);
            this.invertOutputClickBox.updatePosition(this.x + this.w - GRIDSIZE / 2 - 10, this.y + 10);
            break;
    }

    for (let i = 0; i < this.inputClickBoxes.length; i++) {
        switch (this.direction) {
            case 0: this.inputClickBoxes[i].updatePosition(this.x, this.y + (this.h * (i + 1)) / this.height); break;
            case 1: this.inputClickBoxes[i].updatePosition(this.x + (this.w * (i + 1)) / this.height, this.y); break;
            case 2: this.inputClickBoxes[i].updatePosition(this.x + this.w, this.y + (this.h * (i + 1)) / this.height); break;
            case 3: this.inputClickBoxes[i].updatePosition(this.x + (this.w * (i + 1)) / this.height, this.y + this.h); break;
        }

        this.inputClickBoxes[i].setTransform(transform);
    }

    for (let i = 0; i < this.outputClickBoxes.length; i++) {
        switch (this.direction) {
            case 0: this.outputClickBoxes[i].updatePosition(this.x + this.w, this.y + (this.h * (i + 1)) / this.height); break;
            case 1: this.outputClickBoxes[i].updatePosition(this.x + (this.w * (i + 1)) / this.height, this.y + this.h); break;
            case 2: this.outputClickBoxes[i].updatePosition(this.x, this.y + (this.h * (i + 1)) / this.height); break;
            case 3: this.outputClickBoxes[i].updatePosition(this.x + (this.w * (i + 1)) / this.height, this.y); break;
        }

        this.outputClickBoxes[i].setTransform(transform);
    }

    this.inputClickBox.setTransform(transform);
    this.outputClickBox.setTransform(transform);

    this.gClickBox.updatePosition(this.x + this.w / 2, this.y + this.h / 2);
    if (this.direction % 2 === 0) {
        this.gClickBox.updateSize(this.w, this.h - GRIDSIZE);
    } else {
        this.gClickBox.updateSize(this.w - GRIDSIZE, this.h);
    }
    this.gClickBox.setTransform(transform);
};

/*
    Checks if the mouse is over the gate
*/
Decoder.prototype.mouseOver = function () {
    return this.gClickBox.mouseOver();
};

/*
    Checks if the mouse is over output n*/
Decoder.prototype.mouseOverOutput = function (n = 0) {
    if (this.useOutBus) {
        return this.outputClickBox.mouseOver();
    } else {
        return this.outputClickBoxes[n].mouseOver();
    }
};

/*
    Checks if the mouse is over input n
*/
Decoder.prototype.mouseOverInput = function (n = 0) {
    if (this.useInBus) {
        return this.inputClickBox.mouseOver();
    } else {
        return this.inputClickBoxes[n].mouseOver();
    }
};

Decoder.prototype.pointInOutput = function (n, px, py) {
    if (this.useOutBus) {
        return this.outputClickBox.checkPoint(px, py);
    } else {
        return this.outputClickBoxes[n].checkPoint(px, py);
    }
};

Decoder.prototype.pointInInput = function (n, px, py) {
    if (this.useInBus) {
        return this.inputClickBox.checkPoint(px, py);
    } else {
        return this.inputClickBoxes[n].checkPoint(px, py);
    }
};

Decoder.prototype.mouseOverInputInvert = function () {
    return this.invertInputClickBox.mouseOver();
};

Decoder.prototype.mouseOverOutputInvert = function () {
    return this.invertOutputClickBox.mouseOver();
};

/*
    Draws the wrapper on the screen
*/
Decoder.prototype.show = function () {
    // If this element is not on screen, don't draw it
    if ((this.x + transform.dx) * transform.zoom < 0 - this.w * transform.zoom || (this.y + transform.dy) * transform.zoom < 0 - this.h * transform.zoom ||
        (this.x + transform.dx) * transform.zoom > windowWidth || (this.y + transform.dy) * transform.zoom > windowHeight) {
        return;
    }

    if (this.useInBus || this.useOutBus) {
        stroke(150);
        strokeWeight(9);
    }

    if (this.useInBus && this.inBusSet) {
        // Background lines to hide the bus behind the arrow
        switch (this.direction) {
            case 0:
                line(this.x - 4, this.y + GRIDSIZE, this.x, this.y + GRIDSIZE);
                break;
            case 1:
                line(this.x + GRIDSIZE, this.y, this.x + GRIDSIZE, this.y - 4);
                break;
            case 2:
                line(this.x + this.w, this.y + GRIDSIZE, this.x + this.w + 4, this.y + GRIDSIZE);
                break;
            case 3:
                line(this.x + GRIDSIZE, this.y + this.h, this.x + GRIDSIZE, this.y + this.h + 4);
                break;
            default:
        }
    }

    // Draw the element body
    fill(255);
    if (this.marked) {
        stroke(MRED, MGREEN, MBLUE);
    } else {
        stroke(0);
    }
    strokeWeight(3);

    if (this.direction % 2 === 0) {
        rect(this.x, this.y + GRIDSIZE / 2, this.w, this.h - GRIDSIZE);
    } else {
        rect(this.x + GRIDSIZE / 2, this.y, this.w - GRIDSIZE, this.h);
    }

    if (this.marked) {
        fill(MRED, MGREEN, MBLUE);
    } else {
        fill(0);
    }
    noStroke();
    textSize(14);
    textAlign(LEFT, BOTTOM);

    if (this.useInBus) {
        switch (this.direction) {
            case 0:
                text('↺', this.x + 5, this.y + this.h - GRIDSIZE / 2 - 3);
                break;
            case 1:
                text('↺', this.x + this.w - GRIDSIZE / 2 - 16, this.y + 18);
                break;
            case 2:
                text('↺', this.x + this.w - 16, this.y + this.h - GRIDSIZE / 2 - 3);
                break;
            case 3:
                text('↺', this.x + this.w - GRIDSIZE / 2 - 16, this.y + this.h - 3);
                break;
            default:
        }
    }

    if (this.useOutBus) {
        switch (this.direction) {
            case 0:
                text('↺', this.x + this.w - 16, this.y + this.h - GRIDSIZE / 2 - 3);
                break;
            case 1:
                text('↺', this.x + this.w - GRIDSIZE / 2 - 16, this.y + this.h - 3);
                break;
            case 2:
                text('↺', this.x + 5, this.y + this.h - GRIDSIZE / 2 - 3);
                break;
            case 3:
                text('↺', this.x + this.w - GRIDSIZE / 2 - 16, this.y + 18);
                break;
            default:
        }
    }

    // Draw element caption
    textSize(this.textSize);
    textAlign(CENTER, CENTER);
    if (((!this.useOutBus && this.outputCount % 2 !== 0) || (this.useOutBus && !this.useInBus && this.inputCount % 2)) && this.direction % 2 === 0) {
        text("Decoder", this.x + this.w / 2, this.y + this.h / 2 - 15);
    } else {
        text("Decoder", this.x + this.w / 2, this.y + this.h / 2);
    }

    if (this.marked) {
        stroke(MRED, MGREEN, MBLUE);
        fill(MRED, MGREEN, MBLUE);
    } else {
        fill(0);
    }

    textSize(14);

    if (!this.useInBus) {
        // Draw inputs
        for (let i = 1; i <= this.inputCount; i++) {
            if (this.inputs[i - 1] && !this.marked) {
                stroke(this.highColor);
                strokeWeight(5);
            } else if (!this.marked) {
                stroke(this.lowColor);
                strokeWeight(3);
            }

            // Draw input connector lines
            switch (this.direction) {
                case 0: line(this.x - 6, this.y + (this.h * i) / this.height, this.x, this.y + (this.h * i) / this.height); break;
                case 1: line(this.x + (this.w * i) / this.height, this.y - 6, this.x + (this.w * i) / this.height, this.y); break;
                case 2: line(this.x + this.w, this.y + (this.h * i) / this.height, this.x + this.w + 6, this.y + (this.h * i) / this.height); break;
                case 3: line(this.x + (this.w * i) / this.height, this.y + this.h, this.x + (this.w * i) / this.height, this.y + this.h + 6); break;
            }

            noStroke();

            // Draw input labels
            switch (this.direction) {
                case 0: text('2' + superscripts[this.inputCount - i], this.x + 10, this.y + (this.h * i) / this.height); break;
                case 1: text('2' + superscripts[this.inputCount - i], this.x + (this.w * i) / this.height, this.y + 10); break;
                case 2: text('2' + superscripts[this.inputCount - i], this.x + this.w - 10, this.y + (this.h * i) / this.height); break;
                case 3: text('2' + superscripts[this.inputCount - i], this.x + (this.w * i) / this.height, this.y + this.h - 10); break;
            }
        }

        fill(255);
        strokeWeight(2);

        for (let i = 1; i <= this.inputCount; i++) {
            if (this.outputs[i - 1] && !this.marked) {
                stroke(this.highColor);
            } else {
                stroke(this.lowColor);
            }
            // Draw input invertion circles
            if (this.inputsInv[i - 1]) {
                switch (this.direction) {
                    case 0: ellipse(this.x - 6 + this.w / 20, this.y + (this.h * i) / this.height, 10, 10); break;
                    case 1: ellipse(this.x + (this.w * i) / this.height, this.y - 6 + this.h / 20, 10, 10); break;
                    case 2: ellipse(this.x + this.w + this.w / 20, this.y + (this.h * i) / this.height, 10, 10); break;
                    case 3: ellipse(this.x + (this.w * i) / this.height, this.y + 6 + this.h - this.h / 20, 10, 10); break;
                }
            }
        }

    } else {
        noStroke();
        if (!this.marked) {
            fill(0);
        } else {
            fill(MRED, MGREEN, MBLUE);
        }
        textSize(12);
        
        switch (this.direction) {
            case 0: text(this.inputCount, this.x - 10, this.y + GRIDSIZE + 15); break;
            case 1: text(this.inputCount, this.x + GRIDSIZE + 15, this.y - 10); break;
            case 2: text(this.inputCount, this.x + this.w + 10, this.y + GRIDSIZE + 15); break;
            case 3: text(this.inputCount, this.x + GRIDSIZE + 15, this.y + this.h + 10); break;
            default:
        }

        if (this.inBusSet) {
            switch (this.direction) {
                case 0: triangle(this.x - 9, this.y + GRIDSIZE - 8, this.x - 1, this.y + GRIDSIZE, this.x - 9, this.y + GRIDSIZE + 8); break;
                case 1: triangle(this.x + GRIDSIZE - 8, this.y - 9, this.x + GRIDSIZE, this.y - 1, this.x + GRIDSIZE + 8, this.y - 9); break;
                case 2: triangle(this.x + this.w + 10, this.y + GRIDSIZE - 8, this.x + this.w + 2, this.y + GRIDSIZE, this.x + this.w + 10, this.y + GRIDSIZE + 8); break;
                case 3: triangle(this.x + GRIDSIZE - 8, this.y + this.h + 10, this.x + GRIDSIZE, this.y + this.h + 2, this.x + GRIDSIZE + 8, this.y + this.h + 10); break;
                default:
            }
        } else {
            strokeWeight(6);
            if (this.marked) {
                stroke(MRED, MGREEN, MBLUE);
            } else {
                stroke(0);
            }
            switch (this.direction) {
                case 0: line(this.x - 5, this.y + this.h / this.height, this.x - 2, this.y + this.h / this.height); break;
                case 1: line(this.x + this.w / this.height, this.y - 5, this.x + this.w / this.height, this.y - 2); break;
                case 2: line(this.x + this.w + 3, this.y + this.h / this.height, this.x + this.w + 6, this.y + this.h / this.height); break;
                case 3: line(this.x + this.w / this.height, this.y + this.h + 3, this.x + this.w / this.height, this.y + this.h + 6); break;
            }
        }

        noStroke();
        textSize(10);
        let up = this.inputCount - 1;
        let down = 0;

        if (this.inBusInverted) {
            down = up;
            up = 0;
        }

        switch (this.direction) {
            case 0:
                text('[' + up + ':' + down + ']', this.x + 15, this.y + GRIDSIZE);
                break;
            case 1:
                text('[' + up + ':' + down + ']', this.x + GRIDSIZE, this.y + 10);
                break;
            case 2:
                text('[' + up + ':' + down + ']', this.x + this.w - 15, this.y + GRIDSIZE);
                break;
            case 3:
                text('[' + up + ':' + down + ']', this.x + GRIDSIZE, this.y + this.h - 10);
                break;
            default:
        }
    }

    if (!this.useOutBus) {
        // Draw outputs

        if (this.marked) {
            stroke(MRED, MGREEN, MBLUE);
            fill(MRED, MGREEN, MBLUE);
        } else {
            fill(0);
        }
        
        textSize(14);

        for (let i = 1; i <= this.outputCount; i++) {

            strokeWeight(3);
            if (this.outputs[i - 1] && !this.marked) {
                stroke(this.highColor);
                strokeWeight(5);
            } else if (!this.marked) {
                stroke(this.lowColor);
            }

            switch (this.direction) {
                case 0: line(this.x + this.w, this.y + (this.h * i) / this.height, this.x + this.w + 6, this.y + (this.h * i) / this.height); break;
                case 1: line(this.x + (this.w * i) / this.height, this.y + this.h, this.x + (this.w * i) / this.height, this.y + this.h + 6); break;
                case 2: line(this.x - 6, this.y + (this.h * i) / this.height, this.x, this.y + (this.h * i) / this.height); break;
                case 3: line(this.x + (this.w * i) / this.height, this.y - 6, this.x + (this.w * i) / this.height, this.y); break;
            }

            noStroke();

            let exp = i;
            if (this.busInverted) {
                exp = this.outputCount - i + 1;
            }

            // Draw output labels
            switch (this.direction) {
                case 0: text(i - 1, this.x + this.w - 10, this.y + (this.h * i) / this.height); break;
                case 1: text(i - 1, this.x + (this.w * i) / this.height, this.y + this.h - 10); break;
                case 2: text(i - 1, this.x + 10, this.y + (this.h * i) / this.height); break;
                case 3: text(i - 1, this.x + (this.w * i) / this.height, this.y + 10); break;
            }
        }

        fill(255);
        strokeWeight(2);

        for (let i = 1; i <= this.outputCount; i++) {
            if (this.outputs[i - 1] && !this.marked) {
                stroke(this.highColor);
            } else {
                stroke(this.lowColor);
            }
            // Draw output invertion circles
            if (this.outputsInv[i - 1]) {
                switch (this.direction) {
                    case 0: ellipse(this.x + this.w + this.w / 20, this.y + (this.h * i) / this.height, 10, 10); break;
                    case 1: ellipse(this.x + (this.w * i) / this.height, this.y + 6 + this.h - this.h / 20, 10, 10); break;
                    case 2: ellipse(this.x - 6 + this.w / 20, this.y + (this.h * i) / this.height, 10, 10); break;
                    case 3: ellipse(this.x + (this.w * i) / this.height, this.y - 6 + this.h / 20, 10, 10); break;
                }
            }
        }

    } else {
        if (!this.marked) {
            fill(0);
        } else {
            fill(MRED, MGREEN, MBLUE);
        }
        noStroke();
        textSize(12);
        switch (this.direction) {
            case 0: text(this.outputCount, this.x + this.w + 10, this.y + GRIDSIZE + 15); break;
            case 1: text(this.outputCount, this.x + GRIDSIZE + 15, this.y + this.h + 10); break;
            case 2: text(this.outputCount, this.x - 10, this.y + GRIDSIZE + 15); break;
            case 3: text(this.outputCount, this.x + GRIDSIZE + 15, this.y - 10); break;
            default:
        }

        textSize(10);
        let up = this.outputCount - 1;
        let down = 0;

        if (this.outBusInverted) {
            down = up;
            up = 0;
        }

        switch (this.direction) {
            case 0:
                text('[' + up + ':' + down + ']', this.x + this.w - 15, this.y + GRIDSIZE);
                break;
            case 1:
                text('[' + up + ':' + down + ']', this.x + GRIDSIZE, this.y + this.h - 10);
                break;
            case 2:
                text('[' + up + ':' + down + ']', this.x + 15, this.y + GRIDSIZE);
                break;
            case 3:
                text('[' + up + ':' + down + ']', this.x + GRIDSIZE, this.y + 10);
                break;
            default:
        }

        stroke(0);
        strokeWeight(6);
        switch (this.direction) {
            case 0: line(this.x + this.w + 3, this.y + this.h / this.height, this.x + this.w + 6, this.y + this.h / this.height); break;
            case 1: line(this.x + this.w / this.height, this.y + this.h + 3, this.x + this.w / this.height, this.y + this.h + 6); break;
            case 2: line(this.x - 5, this.y + this.h / this.height, this.x - 2, this.y + this.h / this.height); break;
            case 3: line(this.x + this.w / this.height, this.y - 5, this.x + this.w / this.height, this.y - 2); break;
        }

    }

    // TEMP: Show clickboxes of in- and outputs
    /*for (let i = 0; i < this.inputClickBoxes.length; i++) {
        this.inputClickBoxes[i].markClickBox();
    }
    this.outputClickBox.markClickBox();
    this.gClickBox.markClickBox();*/
};