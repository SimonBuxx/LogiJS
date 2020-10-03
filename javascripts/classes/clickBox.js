// File: clickBox.js

function ClickBox(x, y, w, h, transform) {
    this.x = x;
    this.y = y;

    this.w = w;
    this.h = h;
    this.transform = transform;

    /*
        Sets the transformation of the clickBox
    */
    this.setTransform = function (transform) {
        this.transform = transform;
    };

    /*
        Swaps width and height
    */
    this.turn = function () {
        this.temp = this.h;
        this.h = this.w;
        this.w = this.temp;
    };

    /*
        Updates the position of the clickBox
    */
    this.updatePosition = function (nx, ny) {
        this.x = nx;
        this.y = ny;
    };

    this.updateSize = function (nw, nh) {
        this.w = nw;
        this.h = nh;
    };

    /*
        Draws a rect around the clickBox (debugging purposes)
    */
    this.markClickBox = function (select = false) {
        if (select) {
            noStroke();
            if (currentTheme === 'dark') {
                fill(50);
                stroke(50);
            } else {
                fill(255);
                stroke(255);
            }
            strokeWeight(3);
            rect(this.x + this.w / 2 - (200 / this.transform.zoom), this.y - this.h / 2 - (50 / this.transform.zoom), 200 / this.transform.zoom, 50 / this.transform.zoom);
        }
        stroke(50);
        fill(0, 30);
        rect(this.x - this.w / 2, this.y - this.h / 2, this.w, this.h);
    };

    // Returns if the mouse is in a gridSize sized area around x, y
    this.mouseOver = function (selectOffset = false) {
        if (!selectOffset) {
            return (((mouseX / this.transform.zoom - this.transform.dx) >= (this.x - this.w / 2)) &&
                ((mouseX / this.transform.zoom - this.transform.dx) <= (this.x + this.w / 2)) &&
                ((mouseY / this.transform.zoom - this.transform.dy) >= (this.y - this.h / 2)) &&
                ((mouseY / this.transform.zoom - this.transform.dy) <= (this.y + this.h / 2)));
        } else {
            return (((mouseX / this.transform.zoom - this.transform.dx) >= (this.x - this.w / 2)) &&
                ((mouseX / this.transform.zoom - this.transform.dx) <= (this.x + this.w / 2)) &&
                ((mouseY / this.transform.zoom - this.transform.dy) >= (this.y - this.h / 2 - (50 / this.transform.zoom))) &&
                ((mouseY / this.transform.zoom - this.transform.dy) <= (this.y + this.h / 2)));
        }
    };

    /*
        Checks if one point (possibly != mouseX/Y) is inside the ClickBox
    */
    this.checkPoint = function(px, py) {
        return ((px >= (this.x - this.w / 2)) && (px <= (this.x + this.w / 2)) &&
             (py >= (this.y - this.h / 2)) && (py <= (this.y + this.h / 2)));
    };
}