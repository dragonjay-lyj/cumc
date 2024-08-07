"use strict";
class ScreenPictureSelectionWeb extends GameScreen {
    static getInstance() {
        if (!this.tInstance) {
            this.tInstance = new ScreenPictureSelectionWeb();
        }
        return this.tInstance;
    }
    constructor() {
        super();
        this.buttonE621 = document.createElement("input");
        this.buttonBack = document.createElement("input");
        this.divScreen.classList.add("columnScreen");
        this.divScreen.appendChild(this.buttonE621);
        this.buttonE621.type = "button";
        this.buttonE621.value = "E621";
        this.divScreen.appendChild(this.buttonBack);
        this.buttonBack.type = "button";
        this.buttonBack.value = "Back";
    }
    back() {
        // Pressing the phone's back button triggers a click on the back button.
        this.buttonBack.click();
    }
}
// Self start.
ScreenPictureSelectionWeb.getInstance();
