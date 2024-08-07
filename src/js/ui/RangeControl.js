"use strict";
class RangeControl extends HTMLSpanElement {
    constructor(dMin, dMax, dStep) {
        super();
        this.classList.add("sliderControls");
        this.range = document.createElement("input");
        this.range.type = "range";
        this.range.min = dMin.toString();
        this.range.max = dMax.toString();
        this.range.step = dStep.toString();
        // Give callbacks access to this object.
        let that = this;
        function onClickButtonMinus() {
            that.onClickButtonMinus();
        }
        function onClickButtonPlus() {
            that.onClickButtonPlus();
        }
        this.buttonMinus = new HoldableButton(onClickButtonMinus);
        this.buttonMinus.value = "-";
        this.buttonMinus.classList.add("buttonIncrement");
        this.buttonPlus = new HoldableButton(onClickButtonPlus);
        this.buttonPlus.value = "+";
        this.buttonPlus.classList.add("buttonIncrement");
        this.appendChild(this.buttonMinus);
        this.appendChild(this.range);
        this.appendChild(this.buttonPlus);
    }
    onClickButtonMinus() {
        let dValue = parseFloat(this.range.value);
        let dMinValue = parseFloat(this.range.min);
        let dStep = parseFloat(this.range.step);
        // Can't go below min value.
        if (dValue <= dMinValue) {
            return;
        }
        dValue -= dStep;
        // Update the slider value.
        this.range.value = dValue.toString();
        // Trigger a change event.
        this.range.dispatchEvent(new Event("input"));
    }
    onClickButtonPlus() {
        let dValue = parseFloat(this.range.value);
        let dMaxValue = parseFloat(this.range.max);
        let dStep = parseFloat(this.range.step);
        // Can't go below min value.
        if (dValue >= dMaxValue) {
            return;
        }
        dValue += dStep;
        // Update the slider value.
        this.range.value = dValue.toString();
        // Trigger a change event.
        this.range.dispatchEvent(new Event("input"));
    }
    addRangeEventListener(type, listener) {
        this.range.addEventListener(type, listener);
    }
}
customElements.define("span-range-control", RangeControl, { extends: "span" });
