"use strict";
class ScreenPictureSelection extends GameScreen {
    static getInstance() {
        if (!this.tInstance) {
            this.tInstance = new ScreenPictureSelection();
        }
        return this.tInstance;
    }
    constructor() {
        super();
        this.labelPictureStatus = document.createElement("label");
        this.buttonList = document.createElement("input");
        this.buttonLocal = document.createElement("input");
        this.buttonSearch = document.createElement("input");
        this.buttonClear = document.createElement("input");
        this.buttonStart = document.createElement("input");
        this.buttonBack = document.createElement("input");
        this.divScreen.classList.add("columnScreen");
        // Top part is the picture list selector.
        let divTop = document.createElement("div");
        this.divScreen.appendChild(divTop);
        divTop.classList.add("columnScreen");
        divTop.style.setProperty("flex-grow", "1");
        // Add buttons to select pictures in different ways.
        divTop.appendChild(this.buttonList);
        this.buttonList.type = "button";
        this.buttonList.value = "Use created lists";
        divTop.appendChild(this.buttonLocal);
        this.buttonLocal.type = "button";
        this.buttonLocal.value = "Use local pictures";
        // Disable Local pictures if not using Electron.
        if (typeof electronApi === "undefined") {
            this.buttonLocal.classList.add("disabled");
        }
        divTop.appendChild(this.buttonSearch);
        this.buttonSearch.type = "button";
        this.buttonSearch.value = "Use websearch";
        // Display status of selected pictures.
        let divPictureStatus = document.createElement("div");
        divTop.appendChild(divPictureStatus);
        divPictureStatus.classList.add("rowScreen");
        divPictureStatus.appendChild(this.labelPictureStatus);
        this.labelPictureStatus.textContent = "Pictures selected: 0";
        divPictureStatus.appendChild(this.buttonClear);
        this.buttonClear.type = "button";
        this.buttonClear.value = "Clear selection";
        this.buttonClear.style.setProperty("margin-left", "50px");
        // Bottom part is the start and back buttons.
        let divBottom = document.createElement("div");
        this.divScreen.appendChild(divBottom);
        divBottom.classList.add("rowScreen");
        divBottom.style.setProperty("padding", "50px 0px");
        divBottom.appendChild(this.buttonStart);
        this.buttonStart.type = "button";
        this.buttonStart.value = "Start";
        divBottom.appendChild(this.buttonBack);
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
ScreenPictureSelection.getInstance();
