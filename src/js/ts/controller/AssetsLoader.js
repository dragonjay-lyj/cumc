"use strict";
class AssetsLoader {
    constructor(callback) {
        this.nLoadedIndex = 0;
        this.callback = callback;
        ScreenAssetsLoader.getInstance().display();
        this.load();
    }
    load() {
        ScreenAssetsLoader.getInstance().setProgress(Math.floor(this.nLoadedIndex * 100 / AssetsLoader.arrPaths.length));
        if (this.nLoadedIndex >= AssetsLoader.arrPaths.length) {
            // Done loading.
            DebugConsole.log(`${this.nLoadedIndex} 已加载数据。`);
            ScreenAssetsLoader.getInstance().remove();
            this.callback();
            return;
        }
        let that = this;
        function onLoaded(ev) {
            DebugConsole.log(`加载数据 ${AssetsLoader.arrPaths[that.nLoadedIndex]}`);
            ++that.nLoadedIndex;
            that.load();
        }
        function onError(ev) {
            DebugConsole.log(`加载数据出错 ${AssetsLoader.arrPaths[that.nLoadedIndex]}`);
            ++that.nLoadedIndex;
            that.load();
        }
        let imgAsset = document.createElement("img");
        imgAsset.addEventListener("load", onLoaded);
        imgAsset.addEventListener("error", onError);
        imgAsset.src = AssetsLoader.arrPaths[this.nLoadedIndex];
    }
}
AssetsLoader.arrPaths = [];
