"use strict";
class HoldableButton extends HTMLInputElement {
    constructor(callback) {
        super();
        this.timeoutHoldButton = undefined;
        this.intervalHoldButton = undefined;
        this.type = "button";
        this.callback = callback;
        // Give callbacks access to this object.
        let that = this;
        function onMouseDown(event) {
            document.body.addEventListener(Globals.EVENT_MOUSEUP, onMouseUp);
            that.onMouseDown();
        }
        function onMouseUp(event) {
            document.body.removeEventListener(Globals.EVENT_MOUSEUP, onMouseUp);
            that.onMouseUp();
        }
        this.callbackOnMouseDown = onMouseDown;
        // A click triggers an action and rapid fires if held.
        this.addEventListener(Globals.EVENT_MOUSEDOWN, onMouseDown);
    }
    onMouseDown() {
        this.callback();
        // Give access to this object in callback.
        let that = this;
        // Trigger rapid fire.
        function onTimeout() {
            that.intervalHoldButton = setInterval(onTick, 50);
        }
        // Rapid fire function called every interval tick.
        function onTick() {
            that.callback();
        }
        // Some time after holding, trigger rapid fire.
        this.timeoutHoldButton = setTimeout(onTimeout, 200);
    }
    onMouseUp() {
        // Stop all timeouts, return to base state listening for a click.
        clearTimeout(this.timeoutHoldButton);
        clearInterval(this.intervalHoldButton);
        this.timeoutHoldButton = undefined;
        this.intervalHoldButton = undefined;
    }
    destroy() {
        // Stop any ongoing click and disable click event.
        this.onMouseUp();
        this.removeEventListener(Globals.EVENT_MOUSEDOWN, this.callbackOnMouseDown);
    }
}
customElements.define("input-holdable-button", HoldableButton, { extends: "input" });
