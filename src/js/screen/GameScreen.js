"use strict";
class GameScreen {
    constructor() {
        this.divScreen = document.createElement("div");
        this.divScreen.classList.add("screen");
    }
    display() {
        GameScreen.currentScreen = this;
        GameScreen.divScreenContainer.appendChild(this.divScreen);
    }
    remove() {
        this.divScreen.remove();
    }
    back() {
        // Default behaviour, prompt to exit the app.
        let popup = new Popup("你确定要退出吗？");
        popup.addOption("是的", () => { navigator.app.exitApp(); });
        popup.addOption("不");
    }
}
GameScreen.divScreenContainer = document.createElement("div");
// Initialise UI.
GameScreen.divScreenContainer.id = "divScreenContainer";
GameScreen.divScreenContainer.classList.add("scrollableScreen");
// Mobile back button listener.
document.addEventListener("backbutton", function () {
    // Go back to the previous Screen.
    GameScreen.currentScreen.back();
}, false);
