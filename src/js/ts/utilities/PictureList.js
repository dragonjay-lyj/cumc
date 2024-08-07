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
}
