"use strict";
class Popup extends HTMLDivElement {
    constructor(strMessage) {
        super();
        // Make the object accessible to the callback.
        let that = this;
        this.callbackOnClick = (ev) => {
            that.close();
        };
        // Dark overlay.
        this.classList.add("modalPopup");
        // The main popup.
        this.divPopup = document.createElement("div");
        this.appendChild(this.divPopup);
        this.divPopup.classList.add("popup");
        this.divPopup.innerText = strMessage;
        // Add zone in the popup for buttons.
        this.divOptionContainer = document.createElement("div");
        this.divOptionContainer.classList.add("popupOptionContainer");
        this.divPopup.appendChild(this.divOptionContainer);
        // Clicking on the popup or its background closes it.
        this.addEventListener("click", this.callbackOnClick);
        this.style.cursor = "pointer";
        this.divPopup.addEventListener("click", this.callbackOnClick);
        this.divPopup.style.cursor = "pointer";
        // Display the popup.
        Popup.divPopupContainer.appendChild(this);
    }
    close() {
        this.remove();
    }
    addOption(strOption, fnCallback) {
        // If adding a button, don't close the popup by clicking anywhere.
        this.divPopup.removeEventListener("click", this.callbackOnClick);
        this.divPopup.style.removeProperty("cursor");
        this.removeEventListener("click", this.callbackOnClick);
        this.style.removeProperty("cursor");
        let divOption = document.createElement("div");
        divOption.classList.add("popupOption");
        divOption.textContent = strOption;
        this.divOptionContainer.appendChild(divOption);
        if (fnCallback) {
            // Perform a custom action on click.
            divOption.addEventListener("click", fnCallback);
        }
        // Close the popup after performing the action.
        divOption.addEventListener("click", this.callbackOnClick);
        return divOption;
    }
}
Popup.divPopupContainer = document.createElement("div");
customElements.define("div-popup", Popup, { extends: "div" });
// Initialise UI.
Popup.divPopupContainer.classList.add("fullScreen", "popupContainer");
Popup.divPopupContainer.id = "divPopupContainer";
