"use strict";
class CountdownTimer {
    constructor(callbackUpdate, callbackFinish, nTimeTarget) {
        this.callbackUpdate = callbackUpdate;
        this.callbackFinish = callbackFinish;
        this.nTimeTarget = nTimeTarget;
        this.nTimeLeft = nTimeTarget;
        this.nLastUpdateTime = Math.floor(performance.now());
        this.timeoutTick = setInterval(this.update.bind(this), 25);
    }
    update() {
        // Update time left.
        let nPreviousUpdateTime = this.nLastUpdateTime;
        this.nLastUpdateTime = Math.floor(performance.now());
        this.nTimeLeft -= this.nLastUpdateTime - nPreviousUpdateTime;
        // Check if time's up.
        if (this.nTimeLeft <= 0) {
            clearInterval(this.timeoutTick);
            this.callbackFinish();
            return;
        }
        // Still some time left, trigger the update
        this.callbackUpdate();
    }
    stop() {
        clearInterval(this.timeoutTick);
    }
    pause() {
        clearInterval(this.timeoutTick);
    }
    resume() {
        this.nLastUpdateTime = Math.floor(performance.now());
        this.timeoutTick = setInterval(this.update.bind(this), 25);
    }
    getTimeTarget() {
        return this.nTimeTarget;
    }
    getTimeLeft() {
        return this.nTimeLeft;
    }
}
;
