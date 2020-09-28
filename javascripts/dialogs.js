/*
    This function draws a popup message on the screen
*/

function showMessage(msg, subline = '') {
    noStroke();
    // Draw the message box
    fill(200, 50, 50);
    rect(window.width / 2 - 320, window.height / 2 - 5, 100, 100);
    if (currentTheme === 'dark') {
        fill(255);
    } else {
        fill(50, 50, 50);
    }
    rect(window.width / 2 + 220, window.height / 2 - 95, 100, 100);
    if (currentTheme === 'dark') {
        fill(50, 50, 50);
    } else {
        fill(255);
    }
    rect(window.width / 2 - 300, window.height / 2 - 75, 600, 150);
    // Display the message
    if (currentTheme === 'dark') {
        fill(255);
    } else {
        fill(50, 50, 50);
    }
    textSize(30);
    textFont('ArcaMajora3');
    textAlign(CENTER, CENTER);
    text(msg, window.width / 2, window.height / 2 - 20);
    textSize(20);
    fill(200, 50, 50);
    text(subline, window.width / 2, window.height / 2 + 30);
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
            showTour('Custom Modules<span style="color: #c83232">.</span>', 'If you‘re logged in, you can import circuits as custom modules using the <i class="fa fa-microchip icon" style="color: #c83232;"></i> Custom Modules dialog<span style="color: #c83232">.</span>');
            break;
        case 10:
            showTour('Custom Modules<span style="color: #c83232">.</span>', 'When you\'ve got at least one output, use <i class="fa fa-tools icon" style="color: #c83232;"></i> Module to edit the sketch\'s appearance as a custom module<span style="color: #c83232">.</span>');
            break;
        case 11:
            showTour('File Import<span style="color: #c83232">.</span>', 'Click on <i class="fa fa-file-upload icon" style="color: #c83232;"></i> Import to upload local JSON sketch files<span style="color: #c83232">.</span>');
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
    setActive(saveDialogButton, true);
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

function displayCustomDialog() {
    mainCanvas.elt.classList.add('dark-canvas');
    document.getElementById('custom-dialog').style.display = 'block';
    if (importSketchData.looks.length > 0) {
        PWp5.showImportPreview(importSketchData.looks[0], 0, 0);
    } else {
        PWp5.showEmptyGrid();
    }
    configureButtons('customdialog');
}

function closeCustomDialog() {
    showCustomDialog = false;
    document.getElementById('custom-dialog').style.display = 'none';

    configureButtons('edit');

    if (controlMode === 'modify') {
        setActive(modifierModeButton, true);
    }

    justClosedMenu = true;
    mainCanvas.elt.classList.remove('dark-canvas');
}

function custom_element_clicked(r) {
    if (r >= importSketchData.sketches.length || importSketchData.looks[r].outputs === 0) {
        return; // If the place should be greater than the number of available modules or the module has no outputs, return.
    }
    setActive(customButton, true); // Set the custom modules button as activated
    setPreviewElement(true, importSketchData.looks[r]); // Show a preview of the module at the users mouse position
    importCustom(importSketchData.sketches[r] + '.json'); // Import the module on mouse click
}

function custom_element_hovered(r) {
    if (importSketchData.looks.length <= r) {
        return;
    }
    PWp5.clear();
    if (importSketchData.looks[r].outputs > 0) {
        PWp5.showImportPreview(importSketchData.looks[r], 0, 0);
    } else {
        document.getElementsByClassName('preview-span')[r].innerHTML = '<i class="fa fa-exclamation-circle"></i> This Sketch has no Outputs';
        PWp5.showNoOutputs();
    }
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

function initPinConfigurator() {
    let configurator = document.getElementById('pin-inner');
    configurator.innerHTML = '';
    for (let i = 0; i < Math.max(inputs.length, outputs.length); i++) {
        let lbl = document.createElement('p');
        lbl.innerHTML = i + 1;
        lbl.classList.add('configuratorLabel');
        lbl.style.gridColumn = 1;
        configurator.appendChild(lbl);
        if (i < inputs.length) {
            let checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.classList.add('topCheckbox');
            checkbox.id = 'topCheckbox' + i;
            checkbox.value = '';
            checkbox.name = 'topCheckbox';
            checkbox.checked = inputs[i].isTop;
            checkbox.addEventListener('click', function () { // jshint ignore:line
                inputs[i].setIsTop(checkbox.checked);
                showModulePreviewer();
            });
            checkbox.addEventListener('mouseenter', function () { // jshint ignore:line
                setHelpText('Sets this input on top of the module');
            });
            checkbox.addEventListener('mouseleave', function () { // jshint ignore:line
                setHelpText('');
            });
            let newInput = document.createElement('input');
            newInput.classList.add('inputLabel');
            newInput.id = 'ipLabel' + i;
            newInput.style.gridColumn = 3;
            newInput.placeholder = 'None';
            newInput.value = inputs[i].lbl;
            newInput.onkeyup = function () { // jshint ignore:line
                inputs[i].lbl = newInput.value;
                showModulePreviewer();
            };
            newInput.addEventListener('mouseenter', function () { // jshint ignore:line
                setHelpText('The name of this input on the module');
            });
            newInput.addEventListener('mouseleave', function () { // jshint ignore:line
                setHelpText('');
            });
            configurator.appendChild(checkbox);
            configurator.appendChild(newInput);
        }
        if (i < outputs.length) {
            let newInput = document.createElement('input');
            newInput.classList.add('inputLabel');
            newInput.id = 'opLabel' + i;
            newInput.style.gridColumn = 4;
            newInput.placeholder = 'None';
            newInput.value = outputs[i].lbl;
            newInput.onkeyup = function () { // jshint ignore:line
                outputs[i].lbl = newInput.value;
                showModulePreviewer();

            };
            newInput.addEventListener('mouseenter', function () { // jshint ignore:line
                setHelpText('The name of this output on the module');
            });
            newInput.addEventListener('mouseleave', function () { // jshint ignore:line
                setHelpText('');
            });
            configurator.appendChild(newInput);
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