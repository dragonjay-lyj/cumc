"use strict";
class PictureShuffle {
    constructor(tPictureList) {
        this.arrIndex = [];
        this.arrShuffledIndex = [];
        this.arrIndexHistory = [];
        this.tPictureList = tPictureList;
        let nLength = this.tPictureList.getLength();
        // Fill the source index array with indexes from 0 to length - 1.
        for (let i = 0; i < nLength; ++i) {
            this.arrIndex.push(i);
        }
        this.shuffle();
    }
    shuffle() {
        // Copy the source array.
        this.arrShuffledIndex = Array.from(this.arrIndex);
        let nLength = this.arrShuffledIndex.length;
        // Swap a random slot with the last slot until we reach the first slot.
        for (let nIndex = nLength - 1; nIndex > 0; --nIndex) {
            let randIndex = Math.floor(Math.random() * (nIndex + 1));
            let temp = this.arrShuffledIndex[nIndex];
            this.arrShuffledIndex[nIndex] = this.arrShuffledIndex[randIndex];
            this.arrShuffledIndex[randIndex] = temp;
        }
    }
    getNext() {
        // If the shuffled array is empty, we need to reshuffle.
        if (!this.arrShuffledIndex.length) {
            this.shuffle();
        }
        // Return a random index, or undefined if no picture is available.
        let nIndex = this.arrShuffledIndex.shift();
        if (typeof nIndex !== "undefined") {
            // Add to the history.
            this.arrIndexHistory.push(nIndex);
            return nIndex;
        }
        return -1;
    }
}
