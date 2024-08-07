class RangeControl {
    #range;

    constructor(range, buttonMinus, buttonPlus)
    {
        // range must be an input of type range.
        if (range === null || range.tagName !== "INPUT" || range.type !== "range")
        {
            throw new TypeError("错误参数：'范围 '不是范围输入。");
        }

        // buttonMinus must be an input of type button.
        if (buttonMinus === null || buttonMinus.tagName !== "INPUT" || buttonMinus.type !== "button")
        {
            throw new TypeError("错误参数：'buttonMinus '不是按钮输入。");
        }

        // buttonPlus must be an input of type button.
        if (buttonPlus === null || buttonPlus.tagName !== "INPUT" || buttonPlus.type !== "button")
        {
            throw new TypeError("错误参数：'buttonPlus '不是按钮输入。");
        }

        this.#range = range;

        // Give callbacks access to this object.
        let rangeControl = this;

        function onClickButtonMinus()
        {
            rangeControl.#onClickButtonMinus();
        }

        function onClickButtonPlus()
        {
            rangeControl.#onClickButtonPlus();
        }

        new HoldableButton(buttonMinus, onClickButtonMinus);
	    new HoldableButton(buttonPlus, onClickButtonPlus);
    }

    #onClickButtonMinus()
    {
        let dValue = parseFloat(this.#range.value);
        let dMinValue = parseFloat(this.#range.min);
        let dStep = parseFloat(this.#range.step);

        // Can't go below min value.
        if (dValue <= dMinValue)
        {
            return;
        }

        dValue -= dStep;

        // Update the slider value.
        this.#range.value = dValue;

        // Trigger a change event.
        this.#range.dispatchEvent(new Event("input"));
    }

    #onClickButtonPlus()
    {
        let dValue = parseFloat(this.#range.value);
        let dMaxValue = parseFloat(this.#range.max);
        let dStep = parseFloat(this.#range.step);

        // Can't go below min value.
        if (dValue >= dMaxValue)
        {
            return;
        }

        dValue += dStep;

        // Update the slider value.
        this.#range.value = dValue;

        // Trigger a change event.
        this.#range.dispatchEvent(new Event("input"));
    }

    addEventListener(strEvent, fnCallback)
    {
        this.#range.addEventListener(strEvent, fnCallback);
    }
}