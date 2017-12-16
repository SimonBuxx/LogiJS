## Welcome to LogiJS!
This is a project that I'm working on in my spare time. It is a logic circuit editor written in JavaScript that focuses on 
ease of use and a streamlined design. Please notice that, although this project has become far more than I've imagined,
this is not a professionally developed piece of software. I've crushed a lot of bugs by now, but there might be some left.
Also, the performance can be bad when handling larger files or using slower machines.
#### If you find any bugs or have ideas for improvement, please let me know!
This project is still in active development, therefore th GUI is very rudimentary and some options,
like the number of inputs on gates and the direction of gates, are only editable with the keyboard. This will be changed in the
future, so that every action can be done with the mouse.

## Tutorial
### The Basics
If you want to use LogiJS for the first time, please let me tell you the basics on how to use it. We start simple.
When you're opening the page, you see a grey canvas with a grid in front of you. This is the area where you'll develop
your sketches. It can be zoomed with the mouse wheel and moved by dragging with the right mouse button. Go ahead, try it!

Now on to the basic elements: In boolean logic, there are three basic types of logic gates: And, Or and Xor (exclusive or). 
You can place them by first clicking one of the buttons "And-Gate", "Or-Gate" or "Xor-Gate" on the left hand side and
then clicking anywhere on the screen. That's it. 

To make use of your new gate, place two switches and a lamp somewhere next to it. This process is analogue to placing a gate.
After you placed these input and output elements, we need to connect them to the ports of the gate. To do this, you click the
button labeled "Wiring" in the top left corner. Now, you can place wires by dragging with the left mouse button. In one drag,
you can place a wire with not more than one corner.
### Delete, Undo and Redo
Let's suppose, you've made a mistake. You have two ways to correct it: The first option is to click on the button labeled "Delete".
You can then delete objects by clicking on them or drag with the left mouse button to delete wires. Deleting wires is as easy
as placing them, just draw the blue "anti-wire" onto the wire you want to delete. After releasing the mouse, the wire below is gone.

The second option to correct mistakes is to use the "Undo" and "Redo" buttons. These are located in th top bar of the GUI.
You can undo and redo as many steps as you want and they disable automatically if there's nothing to undo or redo. You can
also undo or redo when you deleted something you want to restore.
### Starting the Simulation
To simulate your sketch, you simply click the "Start" button at the top of the screen. You are now in the simulation mode.
In this mode, you can click on input elements and see how the status of the sketch changes. Please go ahead and click on one
of the switches. You'll notice that the switch now has a red color and the wire linked to it as well. Depending on the gate you
choose, it will process the inputs and change it's output accordingly. To exit the simulation, hit the button again, that has changed
it's label to "Stop". Congratulations, you just ran your first simulation in LogiJS.
### About Switch, Button and Clock
Maybe you have noticed by now that there are two more inputs in the list on the left: The button and the clock. These are based on the
switch but have different properties. The button is an input that is activated just a few milliseconds when you release the mouse.
This can be useful when running a simulation one clock tick at a time. The clock is a bit more complex: It is essentially a switch
that goes on and off by itself. You can alter the clock rate by dragging the slider on the top of the screen. But don't go faster
than your creation can handle or else, over-clocking issues will start to happen. Additionally, you can determine if the update cycle
of the sketch should be synced to the frame rate or not. You can change this with the checkbox in the top bar.
### Other Elements
All the other buttons you see on the left, besides the "Toggle Diodes" button, can be used to add elements that aren't basic objects
but are custom elements made out of multiple elements that can even contain other custom elements! They can be placed just like
all other elements, but in the background, a sketch is rendered for every custom element. Take a moment to play around with them!
I'll tell you how to create your own custom elements later.
### Diodes
Diodes are elements that join two crossing wires in the horizontal but not in the vertical direction. They can be very handy to build
a diode matrix. I'll show you what I mean by that: Please click in the edit box in the top right corner and remove it's content.
Then, type the word "traffic". After that, click on the "Load" button.

You just loaded a sketch that I created. This sketch contains a counter, a decoder, some basic elements and wires. It can be used
to simulate a traffic light for cars and one for pedestrians. Go ahead and start the simulation! If it's going too fast, drag the 
clock rate slider all the way to the right and make sure the synced framerate mode is active. You will now see the lamps light up
in different colors.

The controlling of the lamps happens in the diode matrix, the part with the little triangles on top of the wire crossings.
The whole thing works as follows: The counter is a binary two bit counter that increments its output with every clock tick. 
After reaching the three (11 in binary), it falls back to zero. This number is then taken as the input for the decoder that
activates only the line with the corresponding number. This is where the diodes come into play: If there is a diode placed
at a crossing, the vertical line gets activated. If not, it remains in low state. By setting the diodes on different crossings,
the states of the vertical wires can be "programmed" for every step.

You can place and delete diodes by clicking the "Toggle Diodes" button and clicking on any diode or wire crossing to toggle it.
Please end the simulation, if it's still running and play around with this feature. It is pretty powerful as it allows the
programming of whole CPUs to implement complex algorithms.
### Loading and saving sketches
You can save your sketch at any time by entering a name for it in the edit box and clicking the "Save" button. This will open a save
dialog. In this, select the "sketches" folder inside your LogiJS folder. Unfortunately, it is not yet possible to load own sketches
on the https://logijs.netlify.com website but you can load them when you have a copy on your own computer.

To load a sketch, enter its name into the edit box and click on "Load". The sketch will appear, deleting your current sketch canvas. 
Please notice that most browsers, including Google Chrome and Mozilla Firefox, don't allow you to load local files. You can either
use a browser that does, for example Microsoft Edge, or host the LogiJS folder in a local server, for example via XAMPP
or a NodeJS script. So if nothing happens when you're trying to load your sketch, you know what to do.
### Creating and importing Custom Elements
LogiJS supports the creation of custom elements. The process of creating them is pretty simple: You just save your sketch and instead
of loading it, click the "Import" button. Okay, maybe there are one or two things to do in preparation. I'll show you now how to
determine the order of in- and outputs on the custom element, how to place inputs on top of the element and how to label
in- and outputs.

When importing a sketch as an element, all input elements (switches, buttons and clocks) are linked to one input pin on the element.
The same happens to all outputs (lamps). Inputs loose their specific functionality, all the element's inputs will propagate exactly
what is propagated to them. The order of the pins on the element is determined by the order of the creation of the in- and outputs
in the underlying sketch. To prepare a sketch for import, it's a good idea to delete all in- and outputs and create them again in the
order they should be in on the element. This is a bit inconvenient, but that's how it is at the moment.

To set inputs on top of the element and give labels to inputs and outputs, click on the properties button in the top bar.
After that, you can click on any in- or output and change it's properties. A little menu will appear in the top right corner.
In this, inputs have a "Set to top" option and both elements
have an input box to enter the text that should be displayed on the custom element at that pin. You should limit this label
to two or three characters as there isn't much space on the elements. As an exercise, try to save and import the "traffic" example, 
using labels for the pins. You can set the clock input on top if you like. Hint: When you label an input with ">", it will be
replaced with a triangle on the element, indicating that this is the clock input.
### Changing properties and inverting in- and outputs
An important feature about gates is to invert their pins. You can do that by clicking "Properties" and clicking on any in- or output
pin. This also works for custom elements. In the properties mode, you can also change the color of the output lamps to red, yellow,
green or blue. When you add other objects, click on "Delete" or start the simulation, this mode will be left. You can also enter the
properties mode with the escape key.
### The "New" and "Select" Buttons
With the "New" button, you can create a new sketch, deleting all of the previous sketch and resetting the view. The "Select" button
is not yet implemented but will be used in the future to select parts of a sketch and copy, delete or move it. Right now, you can
draw a rectangle with it, but there's now functionality.
### Changing number of inputs and rotating gates
Right now, these features are only accessible with the keyboard. Hitting the numbers 1 to 0 will change the number of inputs of each
new gate to this value (0 for 10). Rotating gates and custom elements can be done with the arrow keys. Right is the default direction.
As with the input number, this affects all new gates and custom elements.
### Warning
This software is under development and not thought to be used for any real life scenarios. For education purposes, it should be stable
enough, but I can't guarantee for anything. LogiJS is not professionally built, therefore not using a linter or any testing procedure.

## Closing word
If you've read this tutorial, thank you so much. It means a lot to me when people are actually using and testing the software.
If you have any ideas or found a bug, don't hesitate to create an issue. In case you're interested, LogiJS is built with p5.js
(https://p5js.org). Please feel free to contact me to tell me about your experience with LogiJS.

Best regards,
Simon
