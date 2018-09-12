class CreatePreviewSymbol {
        constructor(component) {
                this.previewSymbol = component;
        }

        showPreview(){
                // Methods are executed by the referenced component itself
                this.previewSymbol.setCoordinates(mouseX / transform.zoom - transform.dx, mouseY / transform.zoom - transform.dy);
                this.previewSymbol.showPreview();
        }
}

