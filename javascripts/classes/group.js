// File: group.js

function Group() {
    this.inputGates = [];
    this.outputGates = [];
    this.inputPorts = [];
    this.outputPorts = [];
    this.outputStates = [];

    this.wires = [];

    this.state = false;
    this.diodeState = false;
    this.dstateset = false;
}

Group.prototype.addWire = function (s) {
    this.wires.push(s);
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

    if (this.wires[0].state !== this.state) {
        this.propagateState(); // Propagate the state to all wires
    }
};

Group.prototype.show = function () {
    for (let i = 0; i < this.wires.length; i++) {
        this.wires[i].show(false);
    }
};

Group.prototype.propagateState = function () {
    for (let i = 0; i < this.wires.length; i++) {
        this.wires[i].state = this.state;
    }
};