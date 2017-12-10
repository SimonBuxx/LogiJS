// File: output.js
// Name: Simon Buchholz
// Date: 28/10/17

class Output {
    constructor(x, y, transform, colr) {
        this.x = x; // X-Position
        this.y = y; // Y-Position
        this.w = GRIDSIZE; // Width of the putput
        this.h = GRIDSIZE; // Height of the output
        this.state = false; // Output state
        this.transform = transform;
        this.lbl = '';
        this.colr = colr; // 0 = red, 1 = yellow, 2 = green, 3 = blue
        this.highColor = color(HRED, HGREEN, HBLUE); // Color for high in-/outputs (red)
        this.lowColor = color(50, 50, 50); // Color for low in-/outputs (dark grey)
        // ClickBox is used for input and global
        this.clickBox = new ClickBox(this.x, this.y, this.w, this.h, this.transform);
        switch (this.colr) {
            case 0:
                this.highColor = color(HRED, HGREEN, HBLUE);
                break;
            case 1:
                this.highColor = color(YRED, YGREEN, YBLUE);
                break;
            case 2:
                this.highColor = color(GRED, GGREEN, GBLUE);
                break;
            case 3:
                this.highColor = color(BRED, BGREEN, BBLUE);
                break;
            default:
                this.highColor = color(HRED, HGREEN, HBLUE);
                console.log('Notice: Output color is invalid, setting to red');
                break;
        }
        this.updateClickBox();
    }
    /*
        Manually sets the output state
    */
    setInput(dummy, s) {
        this.state = s;
    }

    getData() {
        var data = {};
        data.x = JSON.stringify(this.x);
        data.y = JSON.stringify(this.y);
        data.colr = JSON.stringify(this.colr);
        return data;
    }

    /*
        Sets the coordinates of the output, rounded to grid size
    */
    setCoordinates(nx, ny) {
        this.x = Math.round(nx / GRIDSIZE) * GRIDSIZE;
        this.y = Math.round(ny / GRIDSIZE) * GRIDSIZE;
        // Check bounds
        if (this.x < 0)
            this.x = 0;
        if (this.y < 0)
            this.y = 0;
    }

    updateClickBox() {
        this.clickBox.updatePosition(this.x, this.y);
        this.clickBox.setTransform(this.transform);
    }

    /*
        Checks if the mouse is inside the clickBox
    */
    mouseOver() {
        return this.clickBox.mouseOver();
    }

    pointInInput(dummy, px, py) {
        return this.clickBox.checkPoint(px, py);
    }

    /*
        Displays the output on the screen
    */
    show() {
        stroke(0);
        strokeWeight(3);
        if (this.state) {
            fill(this.highColor);
        }
        else {
            fill(this.lowColor);
        }
        // Draw the circle that represents the output
        ellipse(this.x, this.y, this.w, this.h);
        //this.clickBox.markClickBox();
    }
}
