"use strict";
function onReady() {
    // Check if we are running on Electron (Desktop).
    if (typeof electronApi !== "undefined") {
        // When using Electron, open links in the native browser instead of the app.
        function onElectronLinkClick(event) {
            var imgPageUrl = event.target.href;
            window.open(imgPageUrl, "_blank");
            // Prevent the page from changing.
            return false;
        }
    }
    // Remove the loading screen.
    while (document.body.lastChild) {
        document.body.removeChild(document.body.lastChild);
    }
    // Initialise UI.
    document.body.appendChild(GameScreen.divScreenContainer);
    document.body.appendChild(Popup.divPopupContainer);
    document.body.appendChild(NotifMessage.divNotifContainer);
    function onAssestLoaded() {
        // Display first screen.
        ScreenMainMenu.getInstance().display();
    }
    // Load assets.
    new AssetsLoader(onAssestLoaded);
}
// Start the initialization once the page is ready.
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onReady);
}
else {
    onReady();
}
