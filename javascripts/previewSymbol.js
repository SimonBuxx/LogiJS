class CreatePreviewSymbol {
        constructor(component) {
                this.previewComponent = component;
        }
        
        showPreview() {
                // Methods are executed by the referenced component itself
                this.previewComponent.setCoordinates(mouseX / transform.zoom - transform.dx, mouseY / transform.zoom - transform.dy);
                this.previewComponent.showPreview();
        }
}


/*
this method didn't seem to work like 
previewSymbol = null;
in sketch.js, but why?

CreatePreviewSymbol.prototype.cancel = function(){
        this.previewComponent = null;
};
*/

