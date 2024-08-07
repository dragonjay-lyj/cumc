"use strict";
class PictureSelectionLocal {
    static getInstance() {
        if (!this.tInstance) {
            this.tInstance = new PictureSelectionLocal();
        }
        return this.tInstance;
    }
    constructor() {
        this.bIsFirstLocalClick = true;
        this.tPictureList = new PictureList();
        this.mapLocalFoldersLoaded = new Map();
        this.nPictures = 0;
        let that = this;
        function onClickButtonBack() {
            that.onClickButtonBack();
        }
        function onClickButtonConfirm() {
            that.onClickButtonConfirm();
        }
        function onClickButtonBrowse() {
            that.onClickButtonBrowse();
        }
        ScreenPictureSelectionLocal.getInstance().buttonBack.addEventListener("click", onClickButtonBack);
        ScreenPictureSelectionLocal.getInstance().buttonConfirm.addEventListener("click", onClickButtonConfirm);
        ScreenPictureSelectionLocal.getInstance().buttonBrowse.addEventListener("click", onClickButtonBrowse);
    }
    onClickButtonBack() {
        // Change screen to Picture Selection.
        ScreenPictureSelectionLocal.getInstance().remove();
        ScreenPictureSelection.getInstance().display();
    }
    onClickButtonConfirm() {
        // Assemble the pictures from folders into one list.
        this.tPictureList = new PictureList();
        for (const tLocalFolderContent of this.mapLocalFoldersLoaded.values()) {
            this.tPictureList.addArray(tLocalFolderContent.arrStrFilePath);
        }
        // Send the Picture List and go back.
        PictureSelection.getInstance().setPictureList(this.tPictureList);
        this.onClickButtonBack();
    }
    onClickButtonBrowse() {
        let bIncludeSubfolders = ScreenPictureSelectionLocal.getInstance().isSubfolderChecked();
        electronApi.showDialog(bIncludeSubfolders).then(this.onElectronFolderSelected.bind(this));
    }
    onCancelFolder(strFolderPath) {
        let tLocalFolderContent = this.mapLocalFoldersLoaded.get(strFolderPath);
        if (typeof tLocalFolderContent === "undefined") {
            return;
        }
        this.mapLocalFoldersLoaded.delete(strFolderPath);
        this.nPictures -= tLocalFolderContent.arrStrFilePath.length;
        // Update total number of pictures.
        ScreenPictureSelectionLocal.getInstance().setPicturesNumber(this.nPictures);
    }
    onElectronFolderSelected(tData) {
        if (!tData) {
            // Clicked "cancel" in dialog, nothing to do.
            return;
        }
        let filelist = tData.filelist;
        if (filelist.length <= 1) {
            NotifMessage.displayError("该文件夹中没有文件。");
            return;
        }
        let strFolderPath = filelist[0];
        if (this.mapLocalFoldersLoaded.has(strFolderPath)) {
            NotifMessage.displayError("已添加文件夹。");
            return;
        }
        let tLocalFolderContent = new LocalFolderContent();
        tLocalFolderContent.bIncludeSubfolders = tData.bIncludeSubfolders;
        tLocalFolderContent.strFolderPath = strFolderPath;
        // Get rid of the folder name.
        filelist.shift();
        for (var indexFile = 0; indexFile < filelist.length; ++indexFile) {
            var fileName = filelist[indexFile];
            // Extract file extension.
            var arrStrFileName = fileName.split(".");
            var strFileExt = arrStrFileName[arrStrFileName.length - 1].toUpperCase();
            // Filter out files that don't match the extension.
            if (strFileExt != "JPG"
                && strFileExt != "JPEG"
                && strFileExt != "PNG"
                && strFileExt != "GIF"
                && strFileExt != "BMP"
                && strFileExt != "WEBP") {
                // Skip files that aren't images.
                continue;
            }
            var strFileFullName = "file:///";
            arrStrFileName = fileName.split("\\");
            strFileFullName += arrStrFileName[0];
            for (var indexNamePart = 1; indexNamePart < arrStrFileName.length; ++indexNamePart) {
                strFileFullName += "\\" + encodeURIComponent(arrStrFileName[indexNamePart]);
            }
            tLocalFolderContent.arrStrFilePath.push(strFileFullName);
        }
        this.mapLocalFoldersLoaded.set(strFolderPath, tLocalFolderContent);
        this.nPictures += tLocalFolderContent.arrStrFilePath.length;
        // Update total number of pictures.
        ScreenPictureSelectionLocal.getInstance().setPicturesNumber(this.nPictures);
        // Save currently loaded folders.
        //localStorage.setItem("mapLastUsedLocalPaths", JSON.stringify(mapLocalFoldersLoaded));
        let that = this;
        function onCancelFolder() {
            that.onCancelFolder(strFolderPath);
        }
        ScreenPictureSelectionLocal.getInstance().addFolder(tLocalFolderContent, onCancelFolder);
    }
}
// Self start.
PictureSelectionLocal.getInstance();
