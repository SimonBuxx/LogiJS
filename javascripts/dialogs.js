/*
    This function draws a popup message on the screen
*/

function showMessage(msg, subline = '', autoHide = true) {
    document.getElementById('message-caption').innerHTML = msg;
    document.getElementById('message-text').innerHTML = subline;
    document.getElementById('message-dialog').style.display = 'block';
    if (autoHide) {
        window.clearTimeout(messageHider);
        messageHider = setTimeout(function () { document.getElementById('message-dialog').style.display = 'none'; }, 3000);
    } else {
        window.clearTimeout(messageHider);
    }
}

function showTour(headline, text, welcome = false) {
    document.getElementById('tour-dialog').style.display = 'block';
    document.getElementById('tour-headline').innerHTML = headline;
    document.getElementById('tour-text').innerHTML = text;
    if (welcome) {
        document.getElementById('tour-welcome').style.display = 'block';
    } else {
        document.getElementById('tour-welcome').style.display = 'none';
    }
}

function hideTour() {
    mainCanvas.elt.classList.remove('dark-canvas');
    document.getElementById('tour-dialog').style.display = 'none';
}

function initTour() {
    let tour = urlParam('tour');
    if (tour === 'true') {
        advanceTour();
    }
}

function advanceTour() {
    switch (tourStep) {
        case 0:
            mainCanvas.elt.classList.add('dark-canvas');
            showTour('', '', true);
            break;
        case 1:
            document.getElementById('tour-button').innerHTML = 'Continue';
            showTour('', 'In this short tutorial, you will learn the basics on how to use LogiJS<span style="color: #c83232">.</span>');
            break;
        case 2:
            showTour('The Toolbox<span style="color: #c83232">.</span>', 'The area on the left contains all components that you‘ll need to build basic logic circuits from scratch<span style="color: #c83232">.</span>');
            break;
        case 3:
            showTour('Edit Mode<span style="color: #c83232">.</span>', 'Click on <i class="fa fa-pen icon" style="color: #c83232;"></i> Edit above to add wires and modify sketch components<span style="color: #c83232">.</span>');
            break;
        case 4:
            showTour('Edit Mode<span style="color: #c83232">.</span>', 'Try changing a clock\'s speed or an output\'s color by clicking on the components!');
            break;
        case 5:
            showTour('Edit Mode<span style="color: #c83232">.</span>', 'You can also add diodes on wire intersections while in edit mode by clicking on them<span style="color: #c83232">.</span>');
            break;
        case 6:
            showTour('Delete Mode<span style="color: #c83232">.</span>', 'Click on <i class="fa fa-trash-alt icon" style="color: #c83232;"></i> Delete to remove wires and other components<span style="color: #c83232">.</span>');
            break;
        case 7:
            showTour('Delete Mode<span style="color: #c83232">.</span>', 'You can remove wires by dragging over the sketch, just like when placing them<span style="color: #c83232">.</span>');
            break;
        case 8:
            showTour('Simulation<span style="color: #c83232">.</span>', 'Click the <i class="fa fa-play icon" style="color: #c83232;"></i> Start button to bring your circuit to life<span style="color: #c83232">.</span>');
            break;
        case 9:
            showTour('Custom Modules<span style="color: #c83232">.</span>', 'If you‘re logged in, you can import circuits as custom modules using the <i class="fa fa-paste icon" style="color: #c83232;"></i> Custom Modules dialog<span style="color: #c83232">.</span>');
            break;
        case 10:
            showTour('Custom Modules<span style="color: #c83232">.</span>', 'When you\'ve got at least one output, use <i class="fa fa-tools icon" style="color: #c83232;"></i> Module to edit the sketch\'s appearance as a custom module<span style="color: #c83232">.</span>');
            break;
        case 11:
            showTour('File Import<span style="color: #c83232">.</span>', 'Click on <i class="fa fa-file-upload icon" style="color: #c83232;"></i> Import JSON in <i class="fas fa-chevron-down icon" style="color: #c83232;"></i> Tools to upload local JSON sketch files<span style="color: #c83232">.</span>');
            break;
        case 12:
            document.getElementById('tour-button').innerHTML = 'Finish';
            showTour('', 'That\'s it for this introduction. Thank you for using LogiJS<span style="color: #c83232">.</span>');
            break;
        default:
            hideTour();
    }
    tourStep++;
}

function saveDialogClicked() {
    // The sketch may be saved during simulation, therefore stop it before saving
    if (simRunning) {
        endSimulation();
    }
    if (saveDialog) {
        enterModifierMode();
        return;
    }
    // If there is a modifier menu displayed, close it
    if (elementMenuShown()) {
        closeModifierMenu();
        unmarkPropTargets();
    }
    enterModifierMode();
    saveDialog = true;
    setUnactive();
    hideAllOptions();
    saveButton.classList.add('active');
    // Take a picture before redrawing
    previewImg = document.getElementById('mainCanvas').toDataURL('image/png');
    document.getElementById('preview-image').src = previewImg;

    showSaveDialog();
}

function showSaveDialog() {
    mainCanvas.elt.classList.add('dark-canvas');
    // Draw the save dialog background
    document.getElementById('save-dialog').style.display = 'block';
    configureButtons('savedialog');

    // If the module name was changed by hand, don't update it to be the sketch file name
    moduleNameChanged = (moduleNameInput.value !== sketchNameInput.value && (moduleNameInput.value !== ''));
    // If there are no outputs in the sketch, disable the module name input
    moduleNameInput.disabled = (outputs.length <= 0);

    // Update the module name 
    if (outputs.length <= 0) {
        moduleNameInput.value = '';
    } else if (!moduleNameChanged) {
        moduleNameInput.value = sketchNameInput.value;
    }
}

function closeSaveDialog() {
    saveDialog = false;
    document.getElementById('save-dialog').style.display = 'none';
    justClosedMenu = true;
    mainCanvas.elt.classList.remove('dark-canvas');
}

function showModuleOptions() {
    moduleOptions = true;
    configureButtons('moduleOptions');
    document.getElementById('module-overlay').style.display = 'block';
    showModulePreviewer();
    initPinConfigurator();
    showPinConfigurator();
    reDraw();
}

function hideModuleOptions() {
    moduleOptions = false;
    document.getElementById('module-overlay').style.display = 'none';
    hideModulePreviewer();
    hidePinConfigurator();
}

function showPinConfigurator() {
    document.getElementById('pin-configurator').style.display = 'block';
}

function hidePinConfigurator() {
    document.getElementById('pin-configurator').style.display = 'none';
}

/*function integrateBusInputs() {
    console.log('integrating bus inputs');
    let overhead = 0;
    for (let i = 0; i < busInputs.length; i++) {
        if (busInputs[i].custPosition > inputs.length + busInputs.length) {
            console.log('integrity violation');
            for (let j = 0; j < busInputs.length; j++) {
                if (busInputs[j].custPosition < busInputs[i].custPosition) {
                    overhead = Math.max(overhead, busInputs[j].custPosition);
                }
                console.log('moving input from ' + busInputs[i].custPosition + ' to ' + Math.max(inputs.length, overhead + 1));
                console.log('(There are ' + inputs.length + ' inputs)');
                busInputs[i].custPosition = Math.max(inputs.length, overhead + 1);
            }

        }
    }
}

/*
    Removes gaps in the input order (custPos)
*/
function trimInputOrder() {
    let trimmedInputs = _.cloneDeep(inputs);
    let trimmedBusInputs = _.cloneDeep(busInputs);

    let trimError = false;

    for (let i = 0; i <= trimmedInputs.length + trimmedBusInputs.length - 1; i++) {
        let posTaken = false;
        let nextCustPos = inCustPosBound + 1; // The smallest custPos > i
        let nextElement = -1; // Position of the element with custPos = nextCustPos
        let isBusInput = false; // True, if nextELement is in the busInputs array

        // Check for both inputs and bus inputs, whether there is an element at position i 
        // and if not, find the location of the element with the smallest custPos > i
        for (let j = 0; j < trimmedInputs.length; j++) {
            console.log(j, i, trimmedInputs[j].custPosition, nextCustPos);
            if (trimmedInputs[j].custPosition === i) {
                posTaken = true;
                break;
            } else if ((trimmedInputs[j].custPosition > i) && (trimmedInputs[j].custPosition < nextCustPos)) {
                nextCustPos = trimmedInputs[j].custPosition;
                nextElement = j;
                isBusInput = false;
                console.log(nextElement);
                console.log('isBusInput = false');
            }
        }
        if (!posTaken) {
            for (let j = 0; j < trimmedBusInputs.length; j++) {
                if (trimmedBusInputs[j].custPosition === i) {
                    posTaken = true;
                    break;
                } else if ((trimmedBusInputs[j].custPosition > i) && (trimmedBusInputs[j].custPosition < nextCustPos)) {
                    nextCustPos = trimmedBusInputs[j].custPosition;
                    nextElement = j;
                    isBusInput = true;
                    console.log('isBusInput = true');
                }
            }
        }

        if (nextElement === -1 && !posTaken) {
            trimError = true;
        }

        console.log('Scan for ' + i + ': ');
        if (posTaken) {
            console.log('   There is an input at this position.');
        } else {
            console.log('   There is no input at this position.');
            console.log('   Next position found: ' + nextCustPos);
            (isBusInput) ? console.log('    This is a bus input, no. ' + nextElement) : console.log('   This is a regular input, no. ' + nextElement);
        }


        // If there is no element at position i, reassign the custPos of the next biggest element to i
        if (!posTaken && !trimError) {
            if (isBusInput) {
                console.log('   Reassigning bus input from ' + trimmedBusInputs[nextElement].custPosition + '...');
                trimmedBusInputs[nextElement].custPosition = i;
            } else {
                console.log('   Reassigning regular input from ' + trimmedInputs[nextElement].custPosition + '...');
                trimmedInputs[nextElement].custPosition = i;
            }
        }
    }

    if (trimError) {
        for (let i = 0; i < trimmedInputs.length; i++) {
            trimmedInputs[i].custPosition = i;
        }
        for (let i = 0; i < trimmedBusInputs.length; i++) {
            trimmedBusInputs[i].custPosition = trimmedInputs.length + i;
        }
        console.log('There was an error during order trimming, using insertion order');
    }

    return [trimmedInputs, trimmedBusInputs];

    //inCustPosBound = inputs.length + busInputs.length - 1;
}

function initPinConfigurator() {
    let configurator = document.getElementById('pin-inner');
    configurator.innerHTML = '';

    let numberOfInputs = -1;
    let numberOfOutputs = 0;
    let addedInput = false;
    for (let i = 0; i < Math.max(inCustPosBound + 1, outputs.length); i++) {
        let input = null;
        addedInput = false;

        if (i <= inCustPosBound) {
            let checkbox, newInput; // DOM elements

            let potentialInputs = inputs.filter(e => e.custPosition === i);
            if (potentialInputs.length > 0) {
                input = potentialInputs[0];
                numberOfInputs++;
            } else {
                potentialInputs = busInputs.filter(e => e.custPosition === i);
                if (potentialInputs.length > 0) {
                    input = potentialInputs[0];
                    numberOfInputs++;
                }
            }
            if (input !== null) {
                checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.classList.add('topCheckbox');
                checkbox.id = 'topCheckbox' + numberOfInputs;
                checkbox.value = '';
                checkbox.name = 'topCheckbox';
                checkbox.checked = input.isTop;
                checkbox.style.gridColumn = 2;
                checkbox.addEventListener('click', function () { // jshint ignore:line
                    input.setIsTop(checkbox.checked);
                    showModulePreviewer();
                });
                checkbox.addEventListener('mouseenter', function () { // jshint ignore:line
                    setHelpText('Sets this input on top of the module');
                });
                checkbox.addEventListener('mouseleave', function () { // jshint ignore:line
                    setHelpText('Click on the in- and outputs to swap them!');
                });

                newInput = document.createElement('input');
                newInput.classList.add('inputLabel');
                newInput.id = 'ipLabel' + numberOfInputs;
                newInput.style.gridColumn = 3;
                newInput.placeholder = 'None' + numberOfInputs;
                newInput.value = input.lbl;
                newInput.onkeyup = function () { // jshint ignore:line
                    input.lbl = newInput.value;
                    showModulePreviewer();
                };
                newInput.addEventListener('mouseenter', function () { // jshint ignore:line
                    setHelpText('The name of this input on the module');
                });
                newInput.addEventListener('mouseleave', function () { // jshint ignore:line
                    setHelpText('Click on the in- and outputs to swap them!');
                });

                configurator.appendChild(checkbox);
                configurator.appendChild(newInput);
                addedInput = true;
            }
        }
        if (numberOfOutputs < outputs.length && (addedInput || (numberOfOutputs >= inputs.length + busInputs.length))) {
            let newInput = document.createElement('input');
            newInput.classList.add('inputLabel');
            newInput.id = 'opLabel' + numberOfOutputs;
            newInput.style.gridColumn = 4;
            newInput.placeholder = 'None' + numberOfOutputs;
            newInput.value = outputs[numberOfOutputs].lbl;
            newInput.onkeyup = function () { // jshint ignore:line
                outputs[numberOfOutputs].lbl = newInput.value;
                showModulePreviewer();

            };
            newInput.addEventListener('mouseenter', function () { // jshint ignore:line
                setHelpText('The name of this output on the module');
            });
            newInput.addEventListener('mouseleave', function () { // jshint ignore:line
                setHelpText('Click on the in- and outputs to swap them!');
            });
            configurator.appendChild(newInput);
            numberOfOutputs++;
        }
    }

    let counterLabel;
    for (let i = 0; i < Math.max(inputs.length + busInputs.length, outputs.length); i++) {
        counterLabel = document.createElement('p');
        counterLabel.innerHTML = i + 1;
        counterLabel.classList.add('configuratorLabel');
        counterLabel.style.gridColumn = 1;
        if (i < inputs.length + busInputs.length) {
            configurator.insertBefore(counterLabel, document.getElementById('topCheckbox' + i));
        } else {
            configurator.insertBefore(counterLabel, document.getElementById('opLabel' + i));
        }
    }

}

function showModulePreviewer() {
    document.getElementById('module-previewer').style.display = 'block';
    let look = getThisLook();
    if (look.outputs > 0) {
        modulep5.showImportPreview(look, 0, 0);
    } else {
        modulep5.showEmptyGrid();
    }
}

function hideModulePreviewer() {
    document.getElementById('module-previewer').style.display = 'none';
}

function hideLinkDialog() {
    linkDialog = false;
    setHelpText('');
    mainCanvas.elt.classList.remove('dark-canvas');
    document.getElementById('link-dialog').style.display = 'none';
    if (!simRunning) {
        enterModifierMode();
    } else {
        simButton.classList.add('active');
        configureButtons('simulation');
    }
}