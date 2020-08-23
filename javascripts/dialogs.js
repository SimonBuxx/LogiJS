/*
    This function draws a popup message on the screen
*/

function showMessage(msg, subline = '') {
    // Darken the background
    fill('rgba(0, 0, 0, 0.5)');
    noStroke();
    rect(0, 0, window.width, window.height); 
    // Draw the message box
    fill(255);
    rect(window.width / 2 - 300, window.height / 2 - 75, 600, 150, 10);
    // Display the message
    fill(50);
    textSize(30);
    textFont('ArcaMajora3');
    textAlign(CENTER, CENTER);
    text(msg, window.width / 2, window.height / 2 - 20);
    textSize(20);
    fill(200, 50, 50);
    text(subline, window.width / 2, window.height / 2 + 30);
}

function saveDialogClicked() {
    // The sketch may be saved during simulation, therefore stop it before saving
    if (simRunning) {
        endSimulation();
    }
    // If there is a modifier menu displayed, close it
    if (modifierMenuDisplayed()) {
        closeModifierMenu();
        unmarkPropTargets();
    }
    enterModifierMode();
    saveDialog = true;
    // Take a picture before redrawing
    previewImg = document.getElementById('mainCanvas').toDataURL('image/png');

    reDraw();
}

function showSaveDialog() {
    fill('rgba(0, 0, 0, 0.5)');
    noStroke();
    rect(0, 0, window.width, window.height);
    // Draw the save dialog background
    fill(255);
    noStroke();
    //stroke(0);
    //strokeWeight(3);
    rect(window.width / 2 - 355, window.height / 2 - 208, 565, 375, 10);
    
    showSaveDialogElements();
    configureButtons('savedialog');

    // If the module name was changed by hand, don't update it to be the sketch file name
    moduleNameChanged = (moduleNameInput.value() !== sketchNameInput.value()) && (moduleNameInput.value() !== '');
    // If there are no outputs in the sketch, disable the module name input
    moduleNameInput.elt.disabled = (outputs.length <= 0);

    // Update the module name 
    if (outputs.length <= 0) {
        moduleNameInput.value('');
    } else if (!moduleNameChanged) {
        moduleNameInput.value(sketchNameInput.value());
    }
    showPreviewImage();
}


function closeSaveDialog() {
    saveDialog = false;
    hideSaveDialogElements();
    configureButtons('edit');
    justClosedMenu = true;
}

function showSaveDialogElements() {
    saveButton.show();
    cancelButton.show();
    sketchNameInput.show();
    moduleNameInput.show();
    descInput.show();
    saveDialogText.show();
    // Reposition the cancel button, that is also used in other dialogs
    cancelButton.position(windowWidth / 2 - 13, windowHeight / 2 + 113);
    cancelButton.style('width', '145px');
}

function hideSaveDialogElements() {
    saveButton.hide();
    cancelButton.hide();
    sketchNameInput.hide();
    moduleNameInput.hide();
    descInput.hide();
    saveDialogText.hide();
}

function displayCustomDialog() {
    fill('rgba(0, 0, 0, 0.5)');
    noStroke();
    rect(0, 0, window.width, window.height);
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
    reDraw();
}

function custom_element_clicked(r) {
    if (r >= importSketchData.sketches.length || importSketchData.looks[r].outputs === 0) {
        closeCustomDialog();
        showMessage('This sketch has no output elements!', 'Only sketches that contain outputs can be imported.');
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
        PWp5.showNoOutputs();
    }
}