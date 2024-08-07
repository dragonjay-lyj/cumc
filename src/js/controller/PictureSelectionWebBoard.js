"use strict";
class PictureSelectionWebBoard {
    static getInstance() {
        if (!this.tInstance) {
            this.tInstance = new PictureSelectionWebBoard();
        }
        return this.tInstance;
    }
    constructor() {
        this.tPictureList = new PictureList();
        let that = this;
        function onClickButtonBack() {
            that.onClickButtonBack();
        }
        function onClickButtonConfirm() {
            that.onClickButtonConfirm();
        }
        function onClickButtonLoadSearch() {
            that.onClickButtonLoadSearch();
        }
        ScreenPictureSelectionWebBoard.getInstance().buttonBack.addEventListener("click", onClickButtonBack);
        ScreenPictureSelectionWebBoard.getInstance().buttonConfirm.addEventListener("click", onClickButtonConfirm);
        ScreenPictureSelectionWebBoard.getInstance().buttonLoadSearch.addEventListener("click", onClickButtonLoadSearch);
    }
    onClickButtonBack() {
        // Change screen to Picture Selection.
        ScreenPictureSelectionWebBoard.getInstance().remove();
        ScreenPictureSelection.getInstance().display();
    }
    onClickButtonConfirm() {
        // Send the Picture List and go back.
        PictureSelection.getInstance().setPictureList(this.tPictureList);
        this.onClickButtonBack();
    }
    onClickButtonLoadSearch() {
        let strSearchQuery = ScreenPictureSelectionWebBoard.getInstance().inputSearchQuery.value;
        let strTagsBlacklist = ScreenPictureSelectionWebBoard.getInstance().inputTagsBlacklist.value;
        let nPicturesToGet = 20;
        strSearchQuery = strSearchQuery.trim();
        strTagsBlacklist = strTagsBlacklist.trim();
        let arrStrTags = [];
        let arrStrTagsBlacklist = [];
        if (strSearchQuery !== "") {
            arrStrTags = strSearchQuery.split(" ");
        }
        if (strTagsBlacklist !== "") {
            arrStrTagsBlacklist = strTagsBlacklist.split(" ");
            // Append a "-" to each tag in the blacklist.
            for (let nIndex = 0; nIndex < arrStrTagsBlacklist.length; ++nIndex) {
                arrStrTagsBlacklist[nIndex] = `-${arrStrTagsBlacklist[nIndex]}`;
            }
        }
        // Merge all tags.
        arrStrTags = arrStrTags.concat(arrStrTagsBlacklist);
        PictureLoaderE621.getPictures(arrStrTags, nPicturesToGet, this.onPicturesLoaded.bind(this));
    }
    onPicturesLoaded(tPictureList) {
        this.tPictureList = new PictureList(tPictureList);
        ScreenPictureSelectionWebBoard.getInstance().setPicturesNumber(this.tPictureList.getLength());
    }
}
// Self start.
PictureSelectionWebBoard.getInstance();
