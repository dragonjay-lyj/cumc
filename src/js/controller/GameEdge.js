"use strict";
class GameEdge {
    static getInstance() {
        if (!this.tInstance) {
            this.tInstance = new GameEdge();
        }
        return this.tInstance;
    }
    constructor() {
        this.tTimerBar = undefined;
        this.tPictureList = new PictureList();
        this.tPictureShuffle = new PictureShuffle(this.tPictureList);
        let that = this;
        function onClickButtonBack() {
            that.onClickButtonBack();
        }
        function onClickButtonPause() {
            that.onClickButtonPause();
        }
        function onClickButtonResume() {
            that.onClickButtonResume();
        }
        ScreenEdge.getInstance().buttonBack.addEventListener("click", onClickButtonBack);
        ScreenEdge.getInstance().buttonPause.addEventListener("click", onClickButtonPause);
        ScreenEdge.getInstance().buttonResume.addEventListener("click", onClickButtonResume);
    }
    onClickButtonBack() {
        this.stop();
        // Change screen to Main Menu.
        ScreenEdge.getInstance().remove();
        ScreenMainMenu.getInstance().display();
    }
    onClickButtonPause() {
        if (this.tTimerBar) {
            this.tTimerBar.pause();
        }
        ScreenEdge.getInstance().showPauseMenu();
    }
    onClickButtonResume() {
        if (this.tTimerBar) {
            this.tTimerBar.resume();
        }
        ScreenEdge.getInstance().hidePauseMenu();
    }
    updateBar() {
        if (this.tTimerBar) {
            ScreenEdge.getInstance().setBarPercent(this.tTimerBar.getTimeLeft() / this.tTimerBar.getTimeTarget() * 100);
        }
    }
    setNextImage() {
        let nIndex = this.tPictureShuffle.getNext();
        if (nIndex >= 0) {
            ScreenEdge.getInstance().setImage(this.tPictureList.getPicture(nIndex));
        }
        else {
            // No image to display.
            ScreenEdge.getInstance().setImage("");
        }
    }
    nextStep() {
        this.setNextImage();
        this.tTimerBar = new CountdownTimer(this.updateBar.bind(this), this.nextStep.bind(this), 5000);
    }
    start(tPictureList) {
        // Make a copy of the provided PictureList.
        this.tPictureList = new PictureList(tPictureList);
        this.tPictureShuffle = new PictureShuffle(this.tPictureList);
        this.setNextImage();
        this.tTimerBar = new CountdownTimer(this.updateBar.bind(this), this.nextStep.bind(this), 5000);
    }
    stop() {
        if (this.tTimerBar) {
            this.tTimerBar.stop();
        }
    }
}
// Self start.
GameEdge.getInstance();
