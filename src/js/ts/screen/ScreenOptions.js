"use strict";
class ScreenOptions extends GameScreen {
    static getInstance() {
        if (!this.tInstance) {
            this.tInstance = new ScreenOptions();
        }
        return this.tInstance;
    }
    constructor() {
        super();
        this.buttonBack = document.createElement("input");
        this.divScreen.classList.add("columnScreen");
        this.buttonBack.type = "button";
        this.buttonBack.value = "Back";
        this.divScreen.appendChild(this.buttonBack);
    }
    back() {
        // Pressing the phone's back button triggers a click on the back button.
        this.buttonBack.click();
    }
}
// Self start.
ScreenOptions.getInstance();
