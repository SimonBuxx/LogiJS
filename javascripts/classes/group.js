// File: group.js

function Group() {
    this.inputGates = [];
    this.outputGates = [];
    this.inputPorts = [];
    this.outputPorts = [];
    this.outputStates = [];

    this.segments = [];

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

/*
    This is evoked when a diode associated with this group is high
*/
Group.prototype.diodeHigh = function () {
    this.diodeState = true;
    this.dstateset = true;
};

Group.prototype.updateAll = function () {
    this.state = false;
    // Get all states of the gate outputs
    for (let j = 0; j < this.outputGates.length; j++) {
        //this.outputStates[j] = this.outputGates[j].getOutput(this.outputPorts[j]);
        if (this.outputGates[j].getOutput(this.outputPorts[j])) {
            this.state = true;
            for (let j = 0; j < this.outputGates.length; j++) {
                this.outputGates[j].outputs[this.outputPorts[j]] = true;
            }
            break;
        }
    }

    // If no input is true, take diodeState as state
    if (!this.state && this.dstateset) {
        this.state = this.diodeState;
        this.dstateset = false;
    } else if (!this.dstateset) {
        this.diodeState = false;
    }

    // Propagate the state to all inputs
    for (let j = 0; j < this.inputGates.length; j++) {
        this.inputGates[j].setInput(this.inputPorts[j], this.state);
    }

    if (this.segments[0].state !== this.state) {
        this.propagateState(); // Propagate the state to all segments/wires
    }
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