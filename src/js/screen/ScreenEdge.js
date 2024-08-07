"use strict";
class ScreenEdge extends GameScreen {
    static getInstance() {
        if (!this.tInstance) {
            this.tInstance = new ScreenEdge();
        }
        return this.tInstance;
    }
    constructor() {
        super();
        this.divGauge = document.createElement("div");
        this.imgImageDisplayed = document.createElement("img");
        this.divPauseMenuOverlay = document.createElement("div");
        this.buttonPause = document.createElement("input");
        this.buttonResume = document.createElement("input");
        this.buttonBack = document.createElement("input");
        this.divScreen.classList.add("columnScreen");
        // Progress bar at the top.
        let divProgressBar = document.createElement("div");
        divProgressBar.classList.add("progressBar");
        // Set gauge in bar.
        this.divGauge.classList.add("progressBarGauge");
        // Gauge looks.
        this.divGauge.style.setProperty("background-image", `linear-gradient(to right,
            rgb(57, 26, 89),
            rgb(129, 22, 168))`);
        // No smooth moving, we update this manually very quickly.
        this.divGauge.style.setProperty("transition", "none");
        // Bar sticks to the right side.
        this.divGauge.style.setProperty("float", "right");
        // Gloss effect.
        let divGaugeGloss = document.createElement("div");
        divGaugeGloss.classList.add("progressBarGloss");
        // Swirls on top of gauge.
        let divGaugeSwirls = document.createElement("div");
        divGaugeSwirls.classList.add("progressBarSwirl");
        // Don't move the swirls.
        divGaugeSwirls.style.setProperty("animation", "none");
        // Stick the swirls to the right.
        divGaugeSwirls.style.setProperty("background-position-x", "right");
        divGaugeGloss.appendChild(divGaugeSwirls);
        this.divGauge.appendChild(divGaugeGloss);
        divProgressBar.appendChild(this.divGauge);
        this.divScreen.appendChild(divProgressBar);
        // Image display taking the rest of the screen.
        let divImageContainer = document.createElement("div");
        divImageContainer.id = "divImageContainer";
        divImageContainer.classList.add("halfScreen");
        this.imgImageDisplayed.id = "imgImageDisplayed";
        this.imgImageDisplayed.classList.add("fullScreenImage");
        divImageContainer.appendChild(this.imgImageDisplayed);
        this.divScreen.appendChild(divImageContainer);
        // Pause button.
        this.buttonPause.type = "image";
        this.buttonPause.src = "src/assets/iconBurgerMenu.avif";
        this.buttonPause.classList.add("buttonBurgerMenu");
        this.buttonPause.style.setProperty("position", "absolute");
        this.buttonPause.style.setProperty("top", "0px");
        this.buttonPause.style.setProperty("right", "0px");
        this.divScreen.appendChild(this.buttonPause);
        // Pause menu.
        this.divPauseMenuOverlay = document.createElement("div");
        this.divPauseMenuOverlay.id = "divPauseMenuOverlay";
        // Dark overlay.
        this.divPauseMenuOverlay.classList.add("fullScreen");
        this.divPauseMenuOverlay.style.setProperty("background", "#000000c0");
        // Hidden until the pause button is clicked.
        this.divPauseMenuOverlay.style.setProperty("visibility", "hidden");
        // The menu.
        let divPauseMenu = document.createElement("div");
        divPauseMenu.id = "divPauseMenu";
        divPauseMenu.classList.add("popup", "columnScreen");
        // Resume button.
        this.buttonResume.type = "button";
        this.buttonResume.value = "Resume";
        this.buttonResume.classList.add("pauseMenuButton");
        divPauseMenu.appendChild(this.buttonResume);
        // Exit button.
        this.buttonBack.type = "button";
        this.buttonBack.value = "Quit game";
        this.buttonBack.classList.add("pauseMenuButton");
        divPauseMenu.appendChild(this.buttonBack);
        this.divPauseMenuOverlay.appendChild(divPauseMenu);
        this.divScreen.appendChild(this.divPauseMenuOverlay);
    }
    back() {
        // Pressing the phone's back button triggers a click on the back button.
        this.buttonBack.click();
    }
    remove() {
        // Cleanup the screen before closing.
        this.hidePauseMenu();
        this.setBarPercent(100);
        super.remove();
    }
    showPauseMenu() {
        this.divPauseMenuOverlay.style.setProperty("visibility", "visible");
    }
    hidePauseMenu() {
        this.divPauseMenuOverlay.style.setProperty("visibility", "hidden");
    }
    setImage(strUrl) {
        this.imgImageDisplayed.src = strUrl;
    }
    setBarPercent(dPercent) {
        if (dPercent < 0) {
            dPercent = 0;
            DebugConsole.warn(`无效百分比: ${dPercent}`);
        }
        if (dPercent > 100) {
            dPercent = 100;
            DebugConsole.warn(`无效百分比: ${dPercent}`);
        }
        this.divGauge.style.setProperty("width", `${dPercent}%`);
    }
}
// Self start.
ScreenEdge.getInstance();
