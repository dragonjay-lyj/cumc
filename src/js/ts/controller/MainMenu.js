"use strict";
class MainMenu {
    static getInstance() {
        if (!this.tInstance) {
            this.tInstance = new MainMenu();
        }
        return this.tInstance;
    }
    constructor() {
        let that = this;
        function onClickButtonStory() {
            that.onClickButtonStory();
        }
        function onClickButtonQuick() {
            that.onClickButtonQuick();
        }
        function onClickButtonOptions() {
            that.onClickButtonOptions();
        }
        ScreenMainMenu.getInstance().buttonStory.addEventListener("click", onClickButtonStory);
        ScreenMainMenu.getInstance().buttonQuick.addEventListener("click", onClickButtonQuick);
        ScreenMainMenu.getInstance().buttonOptions.addEventListener("click", onClickButtonOptions);
    }
    onClickButtonStory() {
        NotifMessage.displayError("未执行。");
    }
    onClickButtonQuick() {
        // Change screen to Game screen.
        ScreenMainMenu.getInstance().remove();
        ScreenPictureSelection.getInstance().display();
    }
    onClickButtonOptions() {
        // Change screen to Options screen.
        ScreenMainMenu.getInstance().remove();
        ScreenOptions.getInstance().display();
    }
}
// Self start.
MainMenu.getInstance();
