/*
    This function draws a popup message on the screen
*/

function showMessage(msg, subline = '') {
    // Darken the background
    fill(0, 0, 0, 80);
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
    // Draw the save dialog background
    fill(255);
    noStroke();
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

function showCustomDialogElements() {
    // Position some buttons
    pageUpButton.position(Math.round(window.width / 8) + customDialogColumns * 220 + 260, customDialogRows * 220 - 10);
    pageDownButton.position(Math.round(window.width / 8) + customDialogColumns * 220 + 260, customDialogRows * 220 + 50);
    cancelButton.position(Math.round(window.width / 8) + customDialogColumns * 220 + 260, customDialogRows * 220 + 110);

    cancelButton.style('width', '155px');
    
    cancelButton.show();
    customDialogText.show();
    pageDownButton.show();
    pageUpButton.show();

    pageDownButton.elt.disabled = !(customDialogPages > 0 && customDialogPage < customDialogPages);
    pageUpButton.elt.disabled = (customDialogPage <= 0);
}

function hideCustomDialogElements() {
    pageUpButton.hide();
    pageDownButton.hide();
    cancelButton.hide();
    customDialogText.hide();
}

function displayCustomDialog() {
    // Draw the custom dialog background
    fill(255);
    noStroke();
    rect(Math.round(window.width / 8), 50, customDialogColumns * 220 + 220, customDialogRows * 220 + 90, 10);
    
    // Show all custom items
    for (let i = 0; i < importSketchData.sketches.length; i++) {
        showCustomItem(i + 1, importSketchData.images[i], importSketchData.sketches[i], importSketchData.looks[i]);
    }

    showCustomDialogElements();
    configureButtons('customdialog');
}

function closeCustomDialog() {
    showCustomDialog = false;
    hideCustomDialogElements();

    configureButtons('edit');

    if (controlMode === 'modify') {
        setActive(modifierModeButton, true);
    }

    justClosedMenu = true;
}

/*
    Shows the specified custom item on screen
*/
function showCustomItem(place, img, caption, look) {
    let row = Math.ceil(place / customDialogColumns - 1) - (customDialogPage * customDialogRows);
    let x = ((place - 1) % customDialogColumns) * 220 + Math.round(window.width / 8) + 40;
    let y = (row * 220) + 140;
    if (row >= customDialogRows || row < 0) {
        return;
    }
    if (img !== '') {
        img = 'data:image/png;base64,' + img;
        let raw = new Image(200, 200);
        raw.src = img;
        img = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAQAAAAHUWYVAAABV0lEQVR4Ae3YBxEAMRADMafwxxwU6RKFHd+XnpKDIIggCCIIggiCIIKwWk8NFoIggiCIIAgiCIIIgiD4dWIhCCIIggiCIILgOwQLEQRBBEEQQRBEEARBEEHwL8tCEEQQBBEEQRDEdwgWIgiCCIIggiAIggiCIH6dYCGCIIggCIIggiCID0MsRBAEEQRBEEQQfIdYCIIIgiCCIAiCCIIggiCIf1lYiCAI8idBBEEQQfAdYiEIIgiCIIggCCIIggiCXycWgiAIIgiCCIIggiCIIAhCDxaChVgIFmIhCOJkYSGC4GRhIRaChQiCk2UhCOJkYSFYiIUgiJOFhVgIFmIhWAiCOFlYiCA4WRaChVgIguBkWQgWYiEI4mRhIRaChSCIk4WFWAgWIghOloUgCE6WhWAhFoIgThYWYiFYCII4WViIhWAhguBkWQgWgoUIgpNlIViIhSDIFwafxgPUTiURLQAAAABJRU5ErkJggg==';
        let gradientRaw = new Image(200, 200);
        gradientRaw.src = img;
        raw.onload = function () {
            let normal_img = createImage(200, 200);
            normal_img.drawingContext.drawImage(raw, 0, 0);
            //normal_img.drawingContext.drawImage(gradientRaw, 0, 0);
            image(normal_img, x, y);
            if (look.hasOwnProperty('outputs')) {
                if (look.outputs > 0) {
                    showImportPreview(look, x, y);
                } else {
                    textFont('Open Sans');
                    textSize(18);
                    strokeWeight(5);
                    stroke(200, 50, 50);
                    fill(255);
                    translate(x + 70, y + 55);
                    rotate(radians(45));
                    text('No outputs!', 0, 0);
                    rotate(radians(-45));
                    translate(-x - 70, -y - 55);
                }
            }
            textFont('ArcaMajora3');
            fill(0, 0, 0, 0);
            strokeWeight(10);
            stroke(255);
            rect(x, y, 200, 200, 10);
            noStroke();
            fill(255);
            textSize(20);

            text(caption, x + 10, y + 170);
        };
    }
}

/*
    This is executed when the user clicks on an item in the custom dialog
    row, col: row and column of the item the user clicked on
*/
function importItemClicked(row, col) {
    let place = customDialogColumns * row + col + customDialogPage * customDialogColumns * customDialogRows; // Calculate the array position of the custom module
    if (place >= importSketchData.sketches.length || importSketchData.looks[place].outputs === 0) {
        return; // If the place should be greater than the number of available modules or the module has no outputs, return.
    }
    setActive(customButton, true); // Set the custom modules button as activated
    setPreviewElement(true, importSketchData.looks[place]); // Show a preview of the module at the users mouse position
    importCustom(importSketchData.sketches[place] + '.json'); // Import the module on mouse click
}