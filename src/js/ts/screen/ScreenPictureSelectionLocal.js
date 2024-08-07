"use strict";
class ScreenPictureSelectionLocal extends GameScreen {
    static getInstance() {
        if (!this.tInstance) {
            this.tInstance = new ScreenPictureSelectionLocal();
        }
        return this.tInstance;
    }
    constructor() {
        super();
        this.divTop = document.createElement("div");
        this.labelPictureStatus = document.createElement("label");
        this.checkSubfolder = document.createElement("input");
        this.buttonBrowse = document.createElement("input");
        this.buttonConfirm = document.createElement("input");
        this.buttonBack = document.createElement("input");
        this.divScreen.classList.add("columnScreen");
        // Top part is the list of selected folders.
        this.divScreen.appendChild(this.divTop);
        this.divTop.classList.add("columnScreen");
        this.divTop.style.setProperty("flex-grow", "1");
        // Bottom part is the browse, confirm and back buttons.
        // Browse.
        let divBottomBrowse = document.createElement("div");
        this.divScreen.appendChild(divBottomBrowse);
        divBottomBrowse.style.setProperty("padding-top", "50px");
        divBottomBrowse.appendChild(this.buttonBrowse);
        this.buttonBrowse.type = "button";
        this.buttonBrowse.value = "Select folder...";
        divBottomBrowse.appendChild(this.labelPictureStatus);
        this.labelPictureStatus.textContent = "Pictures selected: 0";
        this.labelPictureStatus.style.setProperty("margin-left", "50px");
        // Subfolder option.
        let divBottomSubfolder = document.createElement("div");
        this.divScreen.appendChild(divBottomSubfolder);
        divBottomSubfolder.style.setProperty("padding-top", "10px");
        divBottomSubfolder.appendChild(this.checkSubfolder);
        this.checkSubfolder.id = "checkPictureSelectionLocalSubfolder";
        this.checkSubfolder.name = "checkPictureSelectionLocalSubfolder";
        this.checkSubfolder.type = "checkbox";
        let labelSubfolder = document.createElement("label");
        divBottomSubfolder.appendChild(labelSubfolder);
        labelSubfolder.htmlFor = "checkPictureSelectionLocalSubfolder";
        labelSubfolder.textContent = "Include subfolders";
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
    isSubfolderChecked() {
        return this.checkSubfolder.checked;
    }
    addFolder(tLocalFolderContent, callbackOnCancel) {
        let strDisplayedFolderName = tLocalFolderContent.strFolderPath;
        // Only keep the last part of the path if it's long.
        if (strDisplayedFolderName.length > 33) {
            strDisplayedFolderName = "..." + strDisplayedFolderName.slice(strDisplayedFolderName.length - 30);
        }
        // Generate the UI.
        let divFolder = document.createElement("div");
        this.divTop.appendChild(divFolder);
        let labelFolder = document.createElement("label");
        divFolder.appendChild(labelFolder);
        let divFolderInfo = document.createElement("div");
        divFolder.appendChild(divFolderInfo);
        let strIconPath = "src/assets/iconFolder.avif";
        if (tLocalFolderContent.bIncludeSubfolders) {
            strIconPath = "src/assets/iconFolderSub.avif";
        }
        let imgFolder = document.createElement("img");
        divFolderInfo.appendChild(imgFolder);
        imgFolder.setAttribute("src", strIconPath);
        imgFolder.style.setProperty("vertical-align", "middle");
        imgFolder.style.setProperty("width", "20px");
        imgFolder.style.setProperty("height", "20px");
        let labelFolderInfoText = document.createElement("label");
        divFolderInfo.appendChild(labelFolderInfoText);
        labelFolderInfoText.textContent = `${strDisplayedFolderName} - Pics: ${tLocalFolderContent.arrStrFilePath.length}`;
        labelFolderInfoText.style.setProperty("margin-left", "10px");
        labelFolderInfoText.style.setProperty("margin-right", "10px");
        let buttonCancel = document.createElement("input");
        divFolderInfo.appendChild(buttonCancel);
        buttonCancel.setAttribute("type", "image");
        buttonCancel.setAttribute("src", "files/img/iconCancel.png");
        buttonCancel.style.setProperty("vertical-align", "middle");
        buttonCancel.style.setProperty("margin-top", "0px");
        buttonCancel.style.setProperty("width", "20px");
        buttonCancel.style.setProperty("height", "20px");
        function onLocalFolderCancelClick() {
            // This event handler only takes care of removing the UI.
            divFolder.remove();
        }
        buttonCancel.addEventListener("click", onLocalFolderCancelClick);
        buttonCancel.addEventListener("click", callbackOnCancel);
    }
    setPicturesNumber(nNum) {
        this.labelPictureStatus.textContent = `Pictures selected: ${nNum}`;
    }
}
// Self start.
ScreenPictureSelectionLocal.getInstance();
