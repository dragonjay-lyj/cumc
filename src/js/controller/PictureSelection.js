"use strict";
class PictureSelection {
    static getInstance() {
        if (!this.tInstance) {
            this.tInstance = new PictureSelection();
        }
        return this.tInstance;
    }
    constructor() {
        this.tPictureList = new PictureList();
        let that = this;
        function onClickButtonBack() {
            that.onClickButtonBack();
        }
        function onClickButtonStart() {
            that.onClickButtonStart();
        }
        function onClickButtonList() {
            that.onClickButtonList();
        }
        function onClickButtonLocal() {
            that.onClickButtonLocal();
        }
        function onClickButtonSearch() {
            that.onClickButtonSearch();
        }
        function onClickButtonClear() {
            that.onClickButtonClear();
        }
        ScreenPictureSelection.getInstance().buttonBack.addEventListener("click", onClickButtonBack);
        ScreenPictureSelection.getInstance().buttonStart.addEventListener("click", onClickButtonStart);
        ScreenPictureSelection.getInstance().buttonList.addEventListener("click", onClickButtonList);
        ScreenPictureSelection.getInstance().buttonLocal.addEventListener("click", onClickButtonLocal);
        ScreenPictureSelection.getInstance().buttonSearch.addEventListener("click", onClickButtonSearch);
        ScreenPictureSelection.getInstance().buttonClear.addEventListener("click", onClickButtonClear);
    }
    onClickButtonBack() {
        // Change screen to Main Menu.
        ScreenPictureSelection.getInstance().remove();
        ScreenMainMenu.getInstance().display();
    }
    onClickButtonStart() {
        // Change screen to Game screen.
        ScreenPictureSelection.getInstance().remove();
        ScreenEdge.getInstance().display();
        GameEdge.getInstance().start(this.tPictureList);
    }
    onClickButtonList() {
        NotifMessage.displayError("未执行。");
        return;
        // Change screen to List selection screen.
        ScreenPictureSelection.getInstance().remove();
        // TODO
    }
    onClickButtonLocal() {
        // Local pictures unavailable if not using Electron.
        if (typeof electronApi === "undefined") {
            NotifMessage.displayError("该平台不提供本地图片功能。");
            return;
        }
        // Change screen to Local pictures selection screen.
        ScreenPictureSelection.getInstance().remove();
        ScreenPictureSelectionLocal.getInstance().display();
    }
    onClickButtonSearch() {
        // Change screen to picture search screen.
        ScreenPictureSelection.getInstance().remove();
        ScreenPictureSelectionWeb.getInstance().display();
    }
    onClickButtonClear() {
        // Reset list of picture to be used in game.
        this.tPictureList = new PictureList();
        ScreenPictureSelection.getInstance().setPicturesNumber(0);
    }
    setPictureList(tPictureList) {
        this.tPictureList = new PictureList(tPictureList);
        ScreenPictureSelection.getInstance().setPicturesNumber(this.tPictureList.getLength());
    }
}
// Self start.
PictureSelection.getInstance();
