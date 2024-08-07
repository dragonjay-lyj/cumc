"use strict";
class OptionsSelector {
    static getInstance() {
        if (!this.tInstance) {
            this.tInstance = new OptionsSelector();
        }
        return this.tInstance;
    }
    constructor() {
        let that = this;
        function onClickButtonBack() {
            that.onClickButtonBack();
        }
        ScreenOptions.getInstance().buttonBack.addEventListener("click", onClickButtonBack);
    }
    onClickButtonBack() {
        // Change screen to Main Menu.
        ScreenOptions.getInstance().remove();
        ScreenMainMenu.getInstance().display();
    }
}
// Self start.
OptionsSelector.getInstance();
