"use strict";
class ScreenPictureSelectionWebBoard extends GameScreen {
    static getInstance() {
        if (!this.tInstance) {
            this.tInstance = new ScreenPictureSelectionWebBoard();
        }
        return this.tInstance;
    }
    constructor() {
        super();
        this.divTop = document.createElement("div");
        this.labelPictureStatus = document.createElement("label");
        this.inputSearchQuery = document.createElement("input");
        this.inputTagsBlacklist = document.createElement("input");
        this.buttonLoadSearch = document.createElement("input");
        this.buttonConfirm = document.createElement("input");
        this.buttonBack = document.createElement("input");
        this.divScreen.classList.add("columnScreen");
        // Top part is the search inputs.
        this.divScreen.appendChild(this.divTop);
        this.divTop.classList.add("columnScreen");
        this.divTop.style.setProperty("flex-grow", "1");
        let divSearchQuery = document.createElement("div");
        this.divTop.appendChild(divSearchQuery);
        let labelSearchQuery = document.createElement("label");
        divSearchQuery.appendChild(labelSearchQuery);
        labelSearchQuery.style.setProperty("padding", "0px 10px");
        labelSearchQuery.textContent = "Search query";
        divSearchQuery.appendChild(this.inputSearchQuery);
        let divTagsBlacklist = document.createElement("div");
        this.divTop.appendChild(divTagsBlacklist);
        let labelTagsBlacklist = document.createElement("label");
        divTagsBlacklist.appendChild(labelTagsBlacklist);
        labelTagsBlacklist.style.setProperty("padding", "0px 10px");
        labelTagsBlacklist.textContent = "Tags blacklist";
        divTagsBlacklist.appendChild(this.inputTagsBlacklist);
        // Bottom part is the load, confirm and back buttons.
        // Load search.
        let divBottomBrowse = document.createElement("div");
        this.divScreen.appendChild(divBottomBrowse);
        divBottomBrowse.style.setProperty("padding-top", "50px");
        divBottomBrowse.appendChild(this.buttonLoadSearch);
        this.buttonLoadSearch.type = "button";
        this.buttonLoadSearch.value = "Load search";
        divBottomBrowse.appendChild(this.labelPictureStatus);
        this.labelPictureStatus.textContent = "Pictures selected: 0";
        this.labelPictureStatus.style.setProperty("margin-left", "50px");
        // Confirm and back.
        let divBottomExit = document.createElement("div");
        this.divScreen.appendChild(divBottomExit);
        divBottomExit.classList.add("rowScreen");
        divBottomExit.style.setProperty("padding", "50px 0px");
        divBottomExit.appendChild(this.buttonConfirm);
        this.buttonConfirm.type = "button";
        this.buttonConfirm.value = "Confirm";
        divBottomExit.appendChild(this.buttonBack);
        this.buttonBack.type = "button";
        this.buttonBack.value = "Back";
    }
    back() {
        // Pressing the phone's back button triggers a click on the back button.
        this.buttonBack.click();
    }
    setPicturesNumber(nNum) {
        this.labelPictureStatus.textContent = `Pictures selected: ${nNum}`;
    }
}
// Self start.
ScreenPictureSelectionWebBoard.getInstance();
