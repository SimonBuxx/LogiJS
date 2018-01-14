// File: group.js

function Group() {
    this.inputGates = [];
    this.outputGates = [];
    this.inputPorts = [];
    this.outputPorts = [];
    this.outputStates = [];

    this.segments = [];
    this.conpoints = [];

    this.state = false;
    this.diodeState = false;
    this.dstateset = false;
}

Group.prototype.addSegment = function (s) {
    this.segments.push(s);
};

Group.prototype.addInput = function (gate, port) {
    this.inputGates.push(gate);
    this.inputPorts.push(port);
};

Group.prototype.addOutput = function (gate, port) {
    this.outputGates.push(gate);
    this.outputPorts.push(port);
};

Group.prototype.deleteGate = function (gate) {
    for (let i = 0; i < this.outputGates.length; i++) {
        console.log(this.outputGates[i].x + ' ' + gate.x + ' ' + this.outputGates[i].y + ' ' + gate.y);
        if (this.outputGates[i].x === gate.x && this.outputGates[i].y === gate.y) {
            this.outputGates.splice(i, 1);
            this.outputPorts.splice(i, 1);
            this.outputStates.splice(i, 1);
        }
    }
    for (let i = 0; i < this.inputGates.length; i++) {
        if (this.inputGates[i].x === gate.x && this.inputGates[i].y === gate.y) {
            this.inputGates.splice(i, 1);
            this.inputPorts.splice(i, 1);
        }
    }
    for (let i = 0; i < this.segments.length; i++) {
        if (this.segments[i].parentStart === gate) {
            this.segments[i].parentStart = null;
        }
        if (this.segments[i].parentEnd === gate) {
            this.segments[i].parentEnd = null;
        }

    }
};

Group.prototype.diodeHigh = function () {
    this.diodeState = true;
    this.dstateset = true;
};

Group.prototype.updateAll = function () {
    for (let j = 0; j < this.outputGates.length; j++) {
        this.outputStates[j] = this.outputGates[j].getOutput(this.outputPorts[j]);
    }

    this.state = false;
    for (let i = 0; i < this.outputStates.length; i++) {
        if (this.outputStates[i]) {
            for (let j = 0; j < this.outputGates.length; j++) {
                this.outputGates[j].outputs[this.outputPorts[j]] = true;
            }
            this.state = true;
        }
    }
    // If no input is true, take diodeState as state
    if (this.state === false && this.dstateset) {
        this.state = this.diodeState;
        this.dstateset = false;
    } else if (this.dstateset === false) {
        this.diodeState = false;
    }

    for (let j = 0; j < this.inputGates.length; j++) {
        this.inputGates[j].setInput(this.inputPorts[j], this.state);
    }

    this.propagateState();
};

Group.prototype.show = function () {
    for (let i = 0; i < this.segments.length; i++) {
        this.segments[i].show(false);
    }
};

Group.prototype.propagateState = function () {
    for (let i = 0; i < this.segments.length; i++) {
        this.segments[i].state = this.state;
    }
};

Group.prototype.findLines = function () {
    let seg = this.segments.slice(0);
    for (let i = 0; i < seg.length; i++) {
        for (let j = 0; j < seg.length; j++) {
            if (i !== j && seg[i] !== null && seg[j] !== null) {
                if (seg[i].direction === seg[j].direction) {
                    if (seg[i].endX === seg[j].startX && seg[i].endY === seg[j].startY) {
                        let w = new WSeg(seg[i].direction, seg[i].startX, seg[i].startY, false, seg[i].transform);
                        if (seg[i].parentStart !== null) {
                            w.setStart(seg[i].startIO, seg[i].parentStart, seg[i].start);
                        }
                        if (seg[j].parentStart !== null) {
                            w.setStart(seg[j].startIO, seg[j].parentStart, seg[j].start);
                        }
                        if (seg[i].parentEnd !== null) {
                            w.setEnd(seg[i].endIO, seg[i].parentEnd, seg[i].end);
                        }
                        if (seg[j].parentEnd !== null) {
                            w.setEnd(seg[j].endIO, seg[j].parentEnd, seg[j].end);
                        }
                        w.endX = seg[j].endX;
                        w.endY = seg[j].endY;
                        seg.push(w);
                        seg[i] = null;
                        seg[j] = null;
                    }
                }
            }
        }
    }
    for (let i = seg.length - 1; i >= 0; i--) {
        if (seg[i] === null) {
            seg.splice(i, 1);
        }
    }
    this.segments = seg;
};