// File: constants.js

const GRIDSIZE = 30;   // Standard grid size (plz don't change)
const WIRECBSIZE = 20; // Size of the wire ClickBoxes
const IOCBSIZE = 20;   // Size of the in-/outputs ClickBoxes

const HRED = 200,  HGREEN = 50,   HBLUE = 50;   // Color for high wires, in- and outputs (red)
const LRED = 0,    LGREEN = 0,    LBLUE = 0;    // Color for low wires (black)
const MRED = 169,  MGREEN = 8,    MBLUE = 28;   // Color for marked elements (darker red)
const YRED = 240,  YGREEN = 240,  YBLUE = 50;   // Color for yellow outputs
const GRED = 40,   GGREEN = 180,  GBLUE = 40;   // Color for green outputs
const BRED = 10,   BGREEN = 100,  BBLUE = 190;  // Color for blue outputs
const HARED = 209, HAGREEN = 71,  HABLUE = 71;  // Accent color for high in- and outputs (red)
const LARED = 70,  LAGREEN = 70,  LABLUE = 70;  // Accent color for low elements (dark grey)
const MARED = 200, MAGREEN = 50,  MABLUE = 50;  // Accent color for marked elements (red)
const YARED = 255, YAGREEN = 255, YABLUE = 83;  // Accent color for yellow outputs
const GARED = 78,  GAGREEN = 208, GABLUE = 69;  // Accent color for green outputs
const BARED = 63,  BAGREEN = 125, BABLUE = 218; // Accent color for blue outputs

// Array indizees for the param array
const GATENUM = 0; // Index of the gates
const OUTPNUM = 1; // Index of the outputs
const INPNUM  = 2; // Index of the inputs
const WIRENUM  = 3; // Index of the wires
const CPNUM   = 4; // Index of the conPoints
const CUSTNUM = 5; // Index of the customs
const DINUM   = 6; // Index of the diodes

const BUTCOUNT = 10; // Number of frames the button should be high

const HIST_LENGTH = 20; // Max number of undos possible