// File: busGroup.js

function BusGroup() {
    this.inputGates = [];
    this.outputGates = [];
    this.inputPorts = [];
    this.outputPorts = [];

    this.busses = [];
    this.busWidth = 0;

    this.states = Array(this.busWidth).fill(false);
}

BusGroup.prototype.addBus = function (s) {
    this.busses.push(s);
};

/*
    Add a module input to the bus group
    module: the module containing the input
    port: the module's input bus port
*/
BusGroup.prototype.addInput = function (module, port) {
    this.inputGates.push(module);
    this.inputPorts.push(port);
};

/*
    Add a module output to the bus group
    module: the module containing the output
    port: the module's output bus port
*/
BusGroup.prototype.addOutput = function (gate, port) {
    this.outputGates.push(gate);
    this.outputPorts.push(port);
};

/*
    Sets this group's bus width to the given width
*/
BusGroup.prototype.updateBusWidth = function(newWidth=this.busWidth) {
    this.busWidth = newWidth;
    this.states = Array(this.busWidth).fill(false); // Reinitialize the states array

    // Determine the longest bus and only show the bus markers on that bus
    let longest = 0;
    let longestLength = 0;
    for (let i = 0; i < this.busses.length; i++) {
        if (this.busses[i].direction === 0) {
            let busLength = Math.abs(this.busses[i].endX - this.busses[i].startX);
            if (busLength > longestLength) {
                longest = i;
                longestLength = busLength;
            }
        } else {
            let busLength = Math.abs(this.busses[i].endY - this.busses[i].startY);
            if (busLength > longestLength) {
                longest = i;
                longestLength = busLength;
            }
        }
        this.busses[i].setBusWidth(this.busWidth);
        this.busses[i].showBusMarker = false;
    }
    if (this.busses.length > 0) {
        this.busses[longest].showBusMarker = true;
    }
}

BusGroup.prototype.updateAll = function () {
    let allOutputs = [];
    for (let j = 0; j < this.outputGates.length; j++) { // For all connected elements
        let output = this.outputGates[j].getOutput(this.outputPorts[j]);
        allOutputs.push(Array(this.busWidth - output.length).fill(false).concat(output)); // get the output vector
    }

    for (let i = 0; i < this.busWidth; i++) { // For every signal, OR it with the current bus state
        let bitState = false;
        for (let j = 0; j < allOutputs.length; j++) {
            if (allOutputs[j].length > i) {
                bitState = bitState || allOutputs[j][i];
            }
        }
        this.states[i] = bitState;
    }
    
    // Propagate the state to all inputs
    for (let j = 0; j < this.inputGates.length; j++) {
        this.inputGates[j].setInput(this.inputPorts[j], this.states);
    }

    if (this.busses[0].states !== this.states) {
        this.propagateState();
    }
};

BusGroup.prototype.show = function () {
    for (let i = 0; i < this.busses.length; i++) {
        this.busses[i].show(false);
    }
};

BusGroup.prototype.propagateState = function () {
    for (let i = 0; i < this.busses.length; i++) {
        this.busses[i].states = this.states;
    }
};