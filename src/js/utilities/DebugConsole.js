"use strict";
class DebugConsole {
    static log(text) {
        if (DebugConsole.enabled)
            console.log(text);
    }
    static warn(text) {
        if (DebugConsole.enabled)
            console.warn(text);
    }
    static error(text) {
        console.error(text);
    }
}
DebugConsole.enabled = true;
DebugConsole.quickTestMode = false;
;
