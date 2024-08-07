"use strict";
class PictureList {
    constructor(tPictureList) {
        this.arrStrPicture = [];
        if (typeof tPictureList !== "undefined") {
            this.arrStrPicture = Array.from(tPictureList.arrStrPicture);
        }
    }
    getLength() {
        return this.arrStrPicture.length;
    }
    getPicture(nIndex) {
        return this.arrStrPicture[nIndex];
    }
    add(strURL) {
        this.arrStrPicture.push(strURL);
    }
    addArray(arrStrURL) {
        this.arrStrPicture = this.arrStrPicture.concat(arrStrURL);
    }
    has(strURL) {
        for (let nIndex = 0; nIndex < this.arrStrPicture.length; ++nIndex) {
            if (this.arrStrPicture[nIndex] === strURL) {
                return true;
            }
        }
        return false;
    }
}
PictureList.tListBlacklist = new PictureList();
