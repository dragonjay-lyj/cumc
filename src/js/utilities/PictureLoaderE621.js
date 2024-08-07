"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class PictureLoaderE621 {
    constructor() { }
    static triggerCallback(tPictureList) {
        if (typeof PictureLoaderE621.callbackOnLoad === "undefined") {
            return;
        }
        // Only call this once, then unset the variable to avoid calling again.
        PictureLoaderE621.callbackOnLoad(tPictureList);
        PictureLoaderE621.callbackOnLoad = undefined;
    }
    static sendRequest() {
        // URL to get request results.
        let strRequest = `${PictureLoaderE621.strWebsiteURL}posts.json`;
        // Tell the website the request comes from this game.
        strRequest += `?_client=${Globals.USER_AGENT}`;
        // Get the maximum amount of picture info in one request.
        strRequest += `&limit=${PictureLoaderE621.nMaxPerRequest}`;
        // When requesting a lot of images, we divide into several requests.
        strRequest += `&page=${PictureLoaderE621.nPage}`;
        // The search query.
        // Filtering out of videos, flash, and safe rated pictures are hardcoded here
        // to avoid unnecessary filtering later.
        strRequest += `&tags=-webm+-swf+-rating:s+${PictureLoaderE621.strSearchQuery}`;
        // E621 doc said to add this at the end.
        strRequest += `&callback=?`;
        fetch(strRequest).then(PictureLoaderE621.getPicsFromRequest, PictureLoaderE621.onError);
    }
    ;
    static onError() {
        NotifMessage.displayError("网络错误，请检查网络连接。");
        PictureLoaderE621.triggerCallback(new PictureList());
    }
    static getPicsFromRequest(tResponse) {
        return __awaiter(this, void 0, void 0, function* () {
            // Handle error responses.
            if (tResponse.status < 200 || tResponse.status > 299) {
                if (tResponse.status === 403) {
                    NotifMessage.displayError("搜索查询失败。请尝试其他搜索。");
                }
                else {
                    NotifMessage.displayError("向 e621 发送请求时出错，网站可能已关闭，请稍后再试。");
                }
                PictureLoaderE621.triggerCallback(new PictureList());
                return;
            }
            let tResponseJson = yield tResponse.json();
            let tPosts = tResponseJson.posts;
            for (var nIndexPic = 0; nIndexPic < tPosts.length; ++nIndexPic) {
                let tPicture = tPosts[nIndexPic];
                // Skip if file isn't an image.
                if (tPicture.file.ext !== "png"
                    && tPicture.file.ext !== "jpg"
                    && tPicture.file.ext !== "gif") {
                    continue;
                }
                let strPictureUrl = tPicture.file.url;
                if (strPictureUrl === null) {
                    // Fallback for globally blacklisted pictures.
                    var strMd5 = tPicture.file.md5;
                    strPictureUrl = PictureLoaderE621.strImagesURL + "data/";
                    strPictureUrl += strMd5.substr(0, 2) + "/";
                    strPictureUrl += strMd5.substr(2, 2) + "/";
                    strPictureUrl += strMd5 + "." + tPicture.file.ext;
                }
                // Skip if the image was already added.
                if (PictureLoaderE621.tPictureList.has(strPictureUrl)) {
                    continue;
                }
                // Filter out blacklisted pictures.
                if (PictureList.tListBlacklist.has(strPictureUrl)) {
                    continue;
                }
                PictureLoaderE621.tPictureList.add(strPictureUrl);
                // Set picture info.
                //arrImgIdByUrl[strPictureUrl] = tPicture.id;
                --PictureLoaderE621.nPicturesToGet;
                // Stop now if we reached the picture number goal.
                if (PictureLoaderE621.nPicturesToGet <= 0) {
                    break;
                }
            }
            if (tPosts.length == 0 || PictureLoaderE621.nPicturesToGet <= 0 || PictureLoaderE621.nPage >= 750) {
                // All done.
                if (!PictureLoaderE621.tPictureList.getLength()) {
                    NotifMessage.displayError("未找到结果。检查标签拼写、黑名单标签和评分阈值。");
                }
                PictureLoaderE621.triggerCallback(PictureLoaderE621.tPictureList);
                return;
            }
            // Still some pics left to get, recurse.
            ++PictureLoaderE621.nPage;
            // Wait for 1 second before sending next request, to respect the server.
            setTimeout(PictureLoaderE621.sendRequest, 1000);
        });
    }
    static getPictures(arrStrTags, nPicturesToGet, callback) {
        if (typeof PictureLoaderE621.callbackOnLoad !== "undefined") {
            NotifMessage.displayError("无法发送请求，另一个请求仍在处理中。");
            return;
        }
        // Set variables for the request process.
        PictureLoaderE621.tPictureList = new PictureList();
        PictureLoaderE621.callbackOnLoad = callback;
        PictureLoaderE621.nPicturesToGet = nPicturesToGet;
        PictureLoaderE621.nPage = 1;
        PictureLoaderE621.strSearchQuery = arrStrTags.join("+");
        PictureLoaderE621.sendRequest();
    }
}
PictureLoaderE621.strWebsiteURL = "https://e621.net/";
PictureLoaderE621.strImagesURL = "https://static1.e621.net/";
PictureLoaderE621.nMaxImageNumber = 6400;
PictureLoaderE621.nMaxPerRequest = 320;
PictureLoaderE621.callbackOnLoad = undefined;
PictureLoaderE621.tPictureList = new PictureList();
PictureLoaderE621.nPage = 1;
PictureLoaderE621.nPicturesToGet = 0;
PictureLoaderE621.strSearchQuery = "";
