"use strict";
// RNG that gives numbers from 0 to max in a random order, without repeating the same number.
// The list is reset and randomised again if the last number was picked, or if another max is passed.
class RNGList {
    static getRand(max) {
        max = Math.floor(max);
        if (max < 0) {
            DebugConsole.warn("传递给 getRand 的参数错误");
            return 0;
        }
        if (RNGList.currentMax !== max) {
            RNGList.currentMax = max;
            RNGList.randomiseList(RNGList.currentMax);
        }
        return RNGList.getNextListItem();
    }
    static randomiseList(max) {
        let index;
        RNGList.randomisedList = [];
        for (index = 0; index <= max; ++index) {
            RNGList.randomisedList.push(index);
        }
        for (index = max; index > 0; --index) {
            var randIndex = Math.floor(Math.random() * (index + 1));
            var temp = RNGList.randomisedList[index];
            RNGList.randomisedList[index] = RNGList.randomisedList[randIndex];
            RNGList.randomisedList[randIndex] = temp;
        }
        DebugConsole.log("随机排列: ");
        var logString = "";
        for (index = 0; index <= max; ++index) {
            logString += RNGList.randomisedList[index] + " ";
        }
        DebugConsole.log(logString);
    }
    static getNextListItem() {
        if (RNGList.randomisedList.length === 0) {
            RNGList.randomiseList(RNGList.currentMax);
        }
        return RNGList.randomisedList.shift();
    }
    static insert(num) {
        RNGList.randomisedList.unshift(num);
    }
    static decrement(index) {
        //This allows the previous image queue to work with blacklisted images since previous images are thrust back into the randomised list
        for (let i = 0; i < RNGList.randomisedList.length; ++i) {
            if (RNGList.randomisedList[i] > index) {
                RNGList.randomisedList[i] -= 1;
            }
            else if (RNGList.randomisedList[i] == index) {
                RNGList.randomisedList.splice(i, 1);
                --i;
            }
        }
        RNGList.currentMax -= 1;
    }
}
RNGList.currentMax = 0;
RNGList.randomisedList = [];
;
