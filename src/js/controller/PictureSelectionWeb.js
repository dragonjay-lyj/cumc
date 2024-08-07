"use strict";
class PictureSelectionWeb {
    static getInstance() {
        if (!this.tInstance) {
            this.tInstance = new PictureSelectionWeb();
        }
        return this.tInstance;
    }
    constructor() {
        let that = this;
        function onClickButtonBack() {
            that.onClickButtonBack();
        }
        function onClickButtonE621() {
            that.onClickButtonE621();
        }
        ScreenPictureSelectionWeb.getInstance().buttonBack.addEventListener("click", onClickButtonBack);
        ScreenPictureSelectionWeb.getInstance().buttonE621.addEventListener("click", onClickButtonE621);
    }
    onClickButtonBack() {
        // Change screen to Picture Selection.
        ScreenPictureSelectionWeb.getInstance().remove();
        ScreenPictureSelection.getInstance().display();
    }
    onClickButtonE621() {
        // Change screen to E621 Web Picture Selection.
        ScreenPictureSelectionWeb.getInstance().remove();
        ScreenPictureSelectionWebBoard.getInstance().display();
    }
}
// Self start.
PictureSelectionWeb.getInstance();
