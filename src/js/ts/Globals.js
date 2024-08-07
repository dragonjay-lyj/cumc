"use strict";
class Globals {
}
Globals.VERSION = "BETA.2.0.0";
Globals.USER_AGENT = `Heat Control/${Globals.VERSION} (by howling-strawberries on e621)`;
Globals.E621_URL = "https://e621.net/";
Globals.E621_IMAGES_URL = "https://static1.e621.net/";
Globals.EVENT_MOUSEDOWN = "ontouchstart" in window ? "touchstart" : "mousedown";
Globals.EVENT_MOUSEUP = "ontouchstart" in window ? "touchend" : "mouseup";
var strCharName = "Lucia";
var isPageLoaded = false;
var pass = 0;
var baseMultiplier = 1.0;
var pauseMultiplier = 1.0;
var cumFactor = 0;
var targetDuration = 0;
var startTime;
var buttplugConnection = null;
// Fast swipe easter egg
var flagFastSwipeTriggered = false;
var countFastSwipes = 0;
var timeoutResetConsecutiveFastSwipes = null;
var lucarioEasterEggQueries = {
    Lucas: `${Globals.E621_URL}posts.json?_client=${Globals.USER_AGENT}&tags=-webm+-swf+-rating:s+score:>500+order:random+limit:1+lucario+solo+male&callback=?`,
    Lucia: `${Globals.E621_URL}posts.json?_client=${Globals.USER_AGENT}&tags=-webm+-swf+-rating:s+score:>500+order:random+limit:1+lucario+solo+female&callback=?`
};
// This is retrieved with a query to e621 when needed.
var lucarioEasterEggPic = {
    Lucas: "",
    Lucia: ""
};
var favImages = [];
var arrLocalPictures = [];
var nTotalLocalPictures = 0;
var mapLocalFoldersLoaded = {};
var gameListPictures = { lists: {} };
var arrImgIdByUrl = {};
var blacklistedPictures = {};
function getRandInInterval(dMin, dMax) {
    return Math.random() * (dMax - dMin) + dMin;
}
function getRandInteger(nMin, nMax) {
    return Math.floor(getRandInInterval(nMin, nMax + 1));
}
