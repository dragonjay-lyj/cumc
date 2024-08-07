"use strict";
class ScreenMainMenu extends GameScreen {
    static getInstance() {
        if (!this.tInstance) {
            this.tInstance = new ScreenMainMenu();
        }
        return this.tInstance;
    }
    constructor() {
        super();
        this.buttonStory = document.createElement("input");
        this.buttonQuick = document.createElement("input");
        this.buttonOptions = document.createElement("input");
        this.divScreen.classList.add("columnScreen");
        // Version label.
        let divVersion = document.createElement("div");
        divVersion.id = "divVersion";
        divVersion.textContent = `v${Globals.VERSION}`;
        this.divScreen.appendChild(divVersion);
        // Two parts screen.
        let divTop = document.createElement("div");
        let divBottom = document.createElement("div");
        divTop.classList.add("halfScreen", "columnScreen");
        divBottom.classList.add("halfScreen", "columnScreen");
        // Title image.
        let imgTitle = document.createElement("img");
        imgTitle.src = "src/assets/logo.avif";
        divTop.appendChild(imgTitle);
        // Menu items.
        divBottom.style.setProperty("justify-content", "center");
        let divStory = document.createElement("div");
        this.buttonStory.type = "button";
        this.buttonStory.classList.add("menuItem");
        this.buttonStory.value = "Story mode";
        divStory.appendChild(this.buttonStory);
        let divQuick = document.createElement("div");
        this.buttonQuick.type = "button";
        this.buttonQuick.classList.add("menuItem");
        this.buttonQuick.value = "Quick play";
        divQuick.appendChild(this.buttonQuick);
        let divOptions = document.createElement("div");
        this.buttonOptions.type = "button";
        this.buttonOptions.classList.add("menuItem");
        this.buttonOptions.value = "Options";
        divOptions.appendChild(this.buttonOptions);
        divBottom.appendChild(divStory);
        divBottom.appendChild(divQuick);
        divBottom.appendChild(divOptions);
        this.divScreen.appendChild(divTop);
        this.divScreen.appendChild(divBottom);
    }
}
// Self start.
ScreenMainMenu.getInstance();
