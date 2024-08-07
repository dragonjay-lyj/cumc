"use strict";
class ScreenAssetsLoader extends GameScreen {
    static getInstance() {
        if (!this.tInstance) {
            this.tInstance = new ScreenAssetsLoader();
        }
        return this.tInstance;
    }
    constructor() {
        super();
        this.divPercent = document.createElement("div");
        this.divGauge = document.createElement("div");
        this.divScreen.classList.add("columnScreen");
        // Two parts screen.
        let divTop = document.createElement("div");
        let divBottom = document.createElement("div");
        divTop.classList.add("halfScreen", "columnScreen");
        divBottom.classList.add("halfScreen", "columnScreen");
        // Loading text.
        let divLoadingText = document.createElement("div");
        divLoadingText.textContent = "Loading assets, please wait...";
        divTop.appendChild(divLoadingText);
        // Percent and progress bar.
        divBottom.style.setProperty("width", "100%");
        divBottom.style.setProperty("justify-content", "center");
        let divProgressBar = document.createElement("div");
        divProgressBar.classList.add("progressBar");
        // Set gauge in bar.
        this.divGauge.classList.add("progressBarGauge");
        // Gauge looks.
        this.divGauge.style.setProperty("background-image", `linear-gradient(to right,
            rgb(57, 26, 89),
            rgb(129, 22, 168))`);
        // Gloss effect.
        let divGaugeGloss = document.createElement("div");
        divGaugeGloss.classList.add("progressBarGloss");
        // Moving swirls on top of gauge.
        let divGaugeSwirls = document.createElement("div");
        divGaugeSwirls.classList.add("progressBarSwirl");
        divGaugeGloss.appendChild(divGaugeSwirls);
        this.divGauge.appendChild(divGaugeGloss);
        divProgressBar.appendChild(this.divGauge);
        // Space the percent from the bar a little.
        this.divPercent.style.setProperty("padding", "10px");
        divBottom.appendChild(this.divPercent);
        divBottom.appendChild(divProgressBar);
        this.divScreen.appendChild(divTop);
        this.divScreen.appendChild(divBottom);
    }
    setProgress(nPercent) {
        if (nPercent < 0) {
            nPercent = 0;
        }
        if (nPercent > 100) {
            nPercent = 100;
        }
        this.divPercent.textContent = `${nPercent}%`;
        this.divGauge.style.setProperty("width", `${nPercent}%`);
    }
}
// Self start.
ScreenAssetsLoader.getInstance();
