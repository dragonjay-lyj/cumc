"use strict";
class NotifMessage extends HTMLDivElement {
    static display(strMessage) {
        DebugConsole.log(strMessage);
        new NotifMessage(strMessage, "", "");
    }
    static displayWarning(strMessage) {
        DebugConsole.warn(strMessage);
        new NotifMessage(strMessage, "#cfbf1e", "");
    }
    static displayError(strMessage) {
        DebugConsole.error(strMessage);
        new NotifMessage(strMessage, "#800000", "");
    }
    static displayCharText(strMessage) {
        new NotifMessage('"' + strMessage + '"', "#1D4A66", "italic");
    }
    constructor(strMessage, textColor, fontStyle) {
        super();
        this.timeoutRemove = undefined;
        this.displayTime = 5;
        this.clearAndRemoveBindRef = this.clearAndRemove.bind(this);
        this.display(strMessage, textColor, fontStyle);
    }
    clearAndRemove() {
        clearTimeout(this.timeoutRemove);
        this.timeoutRemove = undefined;
        this.removeEventListener("transitionend", this.clearAndRemoveBindRef, false);
        this.removeEventListener("click", this.clearAndRemoveBindRef);
        this.remove();
    }
    fadeIn() {
        this.style.setProperty("opacity", "1");
    }
    fadeOut() {
        this.style.removeProperty("opacity");
        // Trigger the removal at the end of the fade out.
        this.addEventListener("transitionend", this.clearAndRemoveBindRef, false);
    }
    display(strMessage, color, fontStyle) {
        // Display the message in a self-removing NotifMessage.
        this.classList.add("notification");
        this.textContent = strMessage;
        if (color) {
            this.style.setProperty("color", color);
        }
        if (fontStyle) {
            this.style.setProperty("font-style", fontStyle);
        }
        this.timeoutRemove = setTimeout(this.fadeOut.bind(this), 1000 * this.displayTime);
        this.addEventListener("click", this.clearAndRemoveBindRef);
        // Display the element completely transparent.
        NotifMessage.divNotifContainer.appendChild(this);
        // Trigger the fade in a bit later.
        // Waiting prevents the transition from misbehaving if we display during a fade out.
        setTimeout(this.fadeIn.bind(this), 50);
    }
}
NotifMessage.divNotifContainer = document.createElement("div");
customElements.define("div-notif-message", NotifMessage, { extends: "div" });
// Initialise UI.
NotifMessage.divNotifContainer.classList.add("fullScreen", "notificationContainer");
NotifMessage.divNotifContainer.id = "divNotificationContainer";
