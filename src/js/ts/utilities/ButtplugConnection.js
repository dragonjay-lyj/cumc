"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class ButtplugConnection {
    //#region static functions
    static setLastPower(dPower) {
        ButtplugConnection.dLastPower = dPower;
    }
    static setMaxVibratePower(dPower) {
        if (isNaN(dPower)) {
            DebugConsole.error("setMaxVibratePower() 中的参数错误.");
            return;
        }
        // Safety cap the power.
        if (dPower < 0.0) {
            dPower = 0.0;
        }
        if (dPower > 1.0) {
            dPower = 1.0;
        }
        ButtplugConnection.dMaxVibratePower = dPower;
    }
    static setMaxOscillatePower(dPower) {
        if (isNaN(dPower)) {
            DebugConsole.error("setMaxOscillatePower() 中的参数错误.");
            return;
        }
        // Safety cap the power.
        if (dPower < 0.0) {
            dPower = 0.0;
        }
        if (dPower > 1.0) {
            dPower = 1.0;
        }
        ButtplugConnection.dMaxOscillatePower = dPower;
    }
    static setMaxRotatePower(dPower) {
        if (isNaN(dPower)) {
            DebugConsole.error("setMaxRotatePower() 中的参数错误.");
            return;
        }
        // Safety cap the power.
        if (dPower < 0.0) {
            dPower = 0.0;
        }
        if (dPower > 1.0) {
            dPower = 1.0;
        }
        ButtplugConnection.dMaxRotatePower = dPower;
    }
    static setConstrictEnabled(bConstrict) {
        ButtplugConnection.bConstrict = bConstrict;
    }
    static setMoveBpsRange(dMinBps, dMaxBps) {
        if (dMinBps > dMaxBps) {
            DebugConsole.error("dMinBps 不能高于 dMaxBps。");
            return;
        }
        ButtplugConnection.dMinMoveBps = dMinBps;
        ButtplugConnection.dMaxMoveBps = dMaxBps;
    }
    static setMaxMoveLength(dLength) {
        if (isNaN(dLength)) {
            DebugConsole.error("setMaxMoveLength() 中的参数错误.");
            return;
        }
        // Safety cap the length.
        if (dLength < 0.2) {
            dLength = 0.2;
        }
        if (dLength > 1.0) {
            dLength = 1.0;
        }
        ButtplugConnection.dMaxMoveLength = dLength;
    }
    /**
    * Makes all devices from all active connections activate.
    * They vibrate rotate and oscillate depending on features.
    * @param {number} dPower
    * The action intensity, between 0.0 and 1.0.
    */
    static activateAllConnected(dPower) {
        ButtplugConnection.bPaused = false;
        ButtplugConnection.dLastPower = dPower;
        ButtplugConnection.arrConnection.forEach((buttplugConnection) => {
            buttplugConnection.vibrateAll(dPower);
            buttplugConnection.oscillateAll(dPower);
            buttplugConnection.rotateAll(dPower);
            buttplugConnection.constrictAll(dPower);
            buttplugConnection.moveAll(dPower);
        });
    }
    /**
    * Stops all devices from all active connections.
    */
    static pauseAll() {
        ButtplugConnection.bPaused = true;
        ButtplugConnection.arrConnection.forEach((buttplugConnection) => buttplugConnection.stopAllDevices());
    }
    /**
    * Makes all devices from all active connections resume their initial action,
    * using the last used intensity.
    */
    static unpauseAll() {
        // Calling activateAllConnected() will unset the pause flag.
        ButtplugConnection.activateAllConnected(ButtplugConnection.dLastPower);
    }
    /**
    * Stops any vibration from all devices from all active connections.
    * Unpausing will also not trigger vibrations either.
    */
    static stopAllDevicesConnected() {
        ButtplugConnection.dLastPower = 0.0;
        ButtplugConnection.arrConnection.forEach((buttplugConnection) => buttplugConnection.stopAllDevices());
    }
    //#endregion static functions
    constructor(strUrl) {
        this.client = new buttplug.ButtplugClient("Heat Control " + Globals.VERSION);
        this.connector = null;
        this.callbackDisconnect = null;
        this.arrCallbackMove = [];
        // Prepare connection to the requested URL.
        this.connector = new buttplug.ButtplugBrowserWebsocketClientConnector(strUrl);
        // Make this object instance available to callbacks.
        let connection = this;
        function onDeviceAdded(device) {
            connection.onDeviceAdded(device);
        }
        function onDeviceRemoved(device) {
            connection.onDeviceRemoved(device);
        }
        function onDisconnect() {
            connection.onDisconnect();
        }
        // Add event handlers.
        this.client.addListener("deviceadded", onDeviceAdded);
        this.client.addListener("deviceremoved", onDeviceRemoved);
        this.client.addListener("disconnect", onDisconnect);
    }
    //#region private
    onDeviceAdded(device) {
        // We just list available devices in the console.
        DebugConsole.log(`已连接的设备: ${device.name}`);
        DebugConsole.log("客户端目前知道这些设备:");
        DebugConsole.log(this.client.devices);
        this.client.devices.forEach((device) => DebugConsole.log(`- ${device.name}`));
    }
    onDeviceRemoved(device) {
        DebugConsole.log(`设备已移除: ${device.name}`);
    }
    onDisconnect() {
        // The connection was interrupted by the server or connectivity was lost.
        // Perform cleanup.
        this.disconnect();
    }
    vibrate(device, dPower) {
        return __awaiter(this, void 0, void 0, function* () {
            if (device.vibrateAttributes.length == 0) {
                // This device can't vibrate.
                return;
            }
            // Safety cap the power.
            if (dPower < 0.0) {
                dPower = 0.0;
            }
            if (dPower > 1.0) {
                dPower = 1.0;
            }
            // Reduce power by provided setting.
            dPower *= ButtplugConnection.dMaxVibratePower;
            DebugConsole.log(`Vibrating device ${device.name} at power ${dPower}`);
            try {
                yield device.vibrate(dPower);
            }
            catch (e) {
                if (e instanceof buttplug.ButtplugClientConnectorException) {
                    DebugConsole.warn("尝试运行时连接丢失 device.vibrate()");
                }
                else {
                    // Other error.
                    DebugConsole.error(e.toString());
                }
            }
        });
    }
    oscillate(device, dPower) {
        return __awaiter(this, void 0, void 0, function* () {
            if (device.oscillateAttributes.length == 0) {
                // This device can't oscillate.
                return;
            }
            // Safety cap the power.
            if (dPower < 0.0) {
                dPower = 0.0;
            }
            if (dPower > 1.0) {
                dPower = 1.0;
            }
            // Reduce power by provided setting.
            dPower *= ButtplugConnection.dMaxOscillatePower;
            DebugConsole.log(`Oscillating device ${device.name} at power ${dPower}`);
            try {
                yield device.oscillate(dPower);
            }
            catch (e) {
                if (e instanceof buttplug.ButtplugClientConnectorException) {
                    DebugConsole.warn("尝试运行时连接丢失 device.oscillate()");
                }
                else {
                    // Other error.
                    DebugConsole.error(e.toString());
                }
            }
        });
    }
    rotate(device, dPower) {
        return __awaiter(this, void 0, void 0, function* () {
            if (device.rotateAttributes.length == 0) {
                // This device can't rotate.
                return;
            }
            // Safety cap the power.
            if (dPower < 0.0) {
                dPower = 0.0;
            }
            if (dPower > 1.0) {
                dPower = 1.0;
            }
            // Reduce power by provided setting.
            dPower *= ButtplugConnection.dMaxRotatePower;
            DebugConsole.log(`Rotating device ${device.name} at power ${dPower}`);
            try {
                yield device.rotate(dPower);
            }
            catch (e) {
                if (e instanceof buttplug.ButtplugClientConnectorException) {
                    DebugConsole.warn("尝试运行时连接丢失 device.rotate()");
                }
                else {
                    // Other error.
                    DebugConsole.error(e.toString());
                }
            }
        });
    }
    constrict(device, dPower) {
        return __awaiter(this, void 0, void 0, function* () {
            // Do not constrict if option is disabled.
            if (!ButtplugConnection.bConstrict) {
                return;
            }
            // Safety cap the power.
            if (dPower < 0.0) {
                dPower = 0.0;
            }
            if (dPower > 1.0) {
                dPower = 1.0;
            }
            // A device has a constrict feature if we find a ScalarCmd with Constrict actuator.
            let availableMessages = device._deviceInfo.DeviceMessages;
            if (typeof availableMessages.ScalarCmd === "undefined") {
                return;
            }
            DebugConsole.log(`Constricting device ${device.name} at power ${dPower}`);
            for (let i = 0; i < availableMessages.ScalarCmd.length; ++i) {
                let cmd = availableMessages.ScalarCmd[i];
                if (cmd.ActuatorType === buttplug.ActuatorType.Constrict) {
                    let constrictSubcommand = new buttplug.ScalarSubcommand(cmd.Index, dPower, buttplug.ActuatorType.Constrict);
                    try {
                        yield device.scalar(constrictSubcommand);
                    }
                    catch (e) {
                        if (e instanceof buttplug.ButtplugClientConnectorException) {
                            DebugConsole.warn("尝试运行时连接丢失 device.scalar()");
                        }
                        else {
                            // Other error.
                            DebugConsole.error(e.toString());
                        }
                    }
                }
            }
        });
    }
    move(device, dPower) {
        return __awaiter(this, void 0, void 0, function* () {
            if (device.linearAttributes.length == 0 && typeof device.messageAttributes["LinearCmd"] === "undefined") {
                // This device can't move.
                return;
            }
            // When performing a new move command, cancel the timeout loop associated to this device.
            if (this.arrCallbackMove[device.index]) {
                clearTimeout(this.arrCallbackMove[device.index]);
            }
            // Safety cap the power.
            if (dPower < 0.0) {
                dPower = 0.0;
            }
            if (dPower > 1.0) {
                dPower = 1.0;
            }
            // The min BPS value is for power level 1, default 1BPS.
            // The max BPS value is for power level 5, default 5BPS.
            // With these custom speeds, get the step to go from one power level to the next.
            let dBpsStep = (ButtplugConnection.dMaxMoveBps - ButtplugConnection.dMinMoveBps) / 4.0;
            // We get the theoretical BPS for a power level of 0.
            let dZeroPowerBps = ButtplugConnection.dMinMoveBps - dBpsStep;
            // From the power level 0 (min) and power level 5 (max) values,
            // we can just scale our dPower which is from 0 to 1.
            // This becomes a BPS between 0 and 5.
            dPower = (ButtplugConnection.dMaxMoveBps - dZeroPowerBps) * dPower + dZeroPowerBps;
            // Finally, translate the BPS value back to a 0 to 1 power scale.
            dPower /= 5.0;
            DebugConsole.log(`Moving device ${device.name} at power ${dPower}`);
            // The length factor goes from p=0.4 -> l=1 to p=1 -> l=0.2 proportionally.
            // Under 0.4, it maxes out. In other words go full length for low powers.
            let dLengthFactor = ((1 - dPower) * 4.0) / 3.0 + 0.2;
            // Cap the used length according to settings.
            if (dLengthFactor > ButtplugConnection.dMaxMoveLength) {
                dLengthFactor = ButtplugConnection.dMaxMoveLength;
                DebugConsole.log(`长度系数上限为: ${dLengthFactor}`);
            }
            if (dLengthFactor < 0.2) {
                dLengthFactor = 0.2;
                DebugConsole.log(`计算功率 > 1，长度系数上限为 0.2`);
            }
            DebugConsole.log(`使用长度 ${dLengthFactor}`);
            // Time needed to go one full length is proportional to power.
            // p=0.2 -> 500ms
            // p=1.0 -> 100ms
            let nTimeToReachTarget = Math.floor(100.0 / dPower);
            DebugConsole.log(`移动时间: ${nTimeToReachTarget} ms`);
            // The time to travel should however never be below 80ms,
            // Messages to Intiface get too fast at this rate.
            if (nTimeToReachTarget < 80) {
                DebugConsole.error(`太快，上限为 80ms.`);
                nTimeToReachTarget = 80;
            }
            // By reducing the length factor,
            // we bring the start position and end position closer together.
            // 1 uses all the length, 0.2 uses the 20% at the middle.
            let dPositionStart = 0.5 - (dLengthFactor / 2.0);
            let dPositionEnd = 0.5 + (dLengthFactor / 2.0);
            // Count the time spent to trigger the safety stop if loop is too fast.
            let nTimeStart = performance.now();
            // Allow callbacks to access this.
            let thisDevice = this;
            // When reaching the start position, go to the end position.
            function onReachStart() {
                let nTimeSpent = performance.now() - nTimeStart;
                nTimeStart = performance.now();
                if (nTimeSpent < 10.0) {
                    // Safety precaution if promises are fulfilled too fast.
                    DebugConsole.error(`移动循环速度过快，终止。所用时间: ${nTimeSpent}`);
                    return;
                }
                // Stop moving if we're paused or stopped.
                if (ButtplugConnection.bPaused || ButtplugConnection.dLastPower == 0) {
                    return;
                }
                device.linear(dPositionEnd, nTimeToReachTarget);
                thisDevice.arrCallbackMove[device.index] = setTimeout(onReachEnd, nTimeToReachTarget);
            }
            // When reaching the end position, go to the start position.
            function onReachEnd() {
                // Stop moving if we're paused.
                if (ButtplugConnection.bPaused || ButtplugConnection.dLastPower == 0) {
                    return;
                }
                device.linear(dPositionStart, nTimeToReachTarget);
                thisDevice.arrCallbackMove[device.index] = setTimeout(onReachStart, nTimeToReachTarget);
            }
            // Start the movement chain.
            device.linear(dPositionEnd, nTimeToReachTarget);
            this.arrCallbackMove[device.index] = setTimeout(onReachEnd, nTimeToReachTarget);
        });
    }
    //#endregion private
    /**
    * Sets a function to be called when the connection gets disconnected.
    */
    setHandlerDisconnect(callback) {
        this.callbackDisconnect = callback;
    }
    /**
     * After creating the object, call this function to try connecting to the server.
     * @returns The URL of the server.
     * @throws {Error}
     * If the connection to the server fails.
     */
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.client.connected) {
                DebugConsole.warn("客户已连接。");
                return "";
            }
            yield this.client.connect(this.connector);
            // Add the successful connection to the list of active connections.
            ButtplugConnection.arrConnection.push(this);
            return this.connector._url;
        });
    }
    /**
     * After creating the object, call this function to try connecting to the server.
     * @throws {Error}
     * If somehow the connection disconnected
     * between the connect check and the attempt at disconnecting.
     */
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            // Remove the connection from the list of active connections.
            const iConnection = ButtplugConnection.arrConnection.indexOf(this);
            if (iConnection != -1) {
                ButtplugConnection.arrConnection.splice(iConnection, 1);
            }
            // Run the callback when disconnecting.
            if (this.callbackDisconnect) {
                this.callbackDisconnect();
                this.callbackDisconnect = null;
            }
            if (!this.client.connected) {
                DebugConsole.log("客户已连接。");
                return;
            }
            yield this.client.disconnect();
            DebugConsole.log("客户断开连接。");
        });
    }
    /**
     * Attempts to make all connected devices vibrate.
     * @param {number} dVibrationPower
     * Number between 0.0 and 1.0.
     * The higher the number, the harder the vibration.
     */
    vibrateAll(dVibrationPower) {
        if (!this.client.connected) {
            NotifMessage.displayWarning("无法振动：客户端断开连接。");
            return;
        }
        if (isNaN(dVibrationPower)) {
            DebugConsole.error("vibrateAll()中的参数错误.");
            return;
        }
        // Try to make any device that can vibrate, vibrate.
        this.client.devices.forEach((device) => this.vibrate(device, dVibrationPower));
    }
    /**
     * Attempts to make all connected devices oscillate.
     * @param {number} dOscillationPower
     * Number between 0.0 and 1.0.
     * The higher the number, the harder the movement.
     */
    oscillateAll(dOscillationPower) {
        if (!this.client.connected) {
            NotifMessage.displayWarning("无法振荡：客户端断开连接。");
            return;
        }
        if (isNaN(dOscillationPower)) {
            DebugConsole.error("oscillateAll() 中的参数错误.");
            return;
        }
        // Try to make any device that can oscillate, oscillate.
        this.client.devices.forEach((device) => this.oscillate(device, dOscillationPower));
    }
    /**
     * Attempts to make all connected devices rotate.
     * @param {number} dRotationPower
     * Number between 0.0 and 1.0.
     * The higher the number, the harder the rotation.
     */
    rotateAll(dRotationPower) {
        if (!this.client.connected) {
            NotifMessage.displayWarning("无法旋转：客户端断开连接。");
            return;
        }
        if (isNaN(dRotationPower)) {
            DebugConsole.error("rotateAll()中的参数错误.");
            return;
        }
        // Try to make any device that can rotate, rotate.
        this.client.devices.forEach((device) => this.rotate(device, dRotationPower));
    }
    /**
     * Attempts to make all connected devices constrict.
     * @param {number} dConstrictPower
     * Number between 0.0 and 1.0.
     * The higher the number, the harder the constriction.
     */
    constrictAll(dConstrictPower) {
        if (!this.client.connected) {
            NotifMessage.displayWarning("无法收缩：客户端断开。");
            return;
        }
        if (isNaN(dConstrictPower)) {
            DebugConsole.error("constrictAll()中的参数错误.");
            return;
        }
        // Try to make any device that can constrict, constrict.
        this.client.devices.forEach((device) => this.constrict(device, dConstrictPower));
    }
    /**
     * Attempts to make all connected devices move.
     * @param {number} dRotationPower
     * Number between 0.0 and 1.0.
     * The higher the number, the more intense the move.
     */
    moveAll(dMovePower) {
        if (!this.client.connected) {
            NotifMessage.displayWarning("无法移动：客户端断开连接。");
            return;
        }
        if (isNaN(dMovePower)) {
            DebugConsole.error("moveAll()中的参数错误.");
            return;
        }
        // Try to make any device that can move, move.
        this.client.devices.forEach((device) => this.move(device, dMovePower));
    }
    /**
     * Stop all connected devices.
     */
    stopAllDevices() {
        if (!this.client.connected) {
            NotifMessage.displayWarning("无法停止：客户端断开。");
            return;
        }
        DebugConsole.log("停止所有设备。");
        this.client.stopAllDevices();
    }
}
// This will hold active connections.
ButtplugConnection.arrConnection = [];
ButtplugConnection.dMaxVibratePower = 1.0;
ButtplugConnection.dMaxOscillatePower = 1.0;
ButtplugConnection.dMaxRotatePower = 1.0;
ButtplugConnection.bConstrict = true;
ButtplugConnection.dMinMoveBps = 1.0;
ButtplugConnection.dMaxMoveBps = 5.0;
ButtplugConnection.dMaxMoveLength = 1.0;
ButtplugConnection.dLastPower = 0.0;
ButtplugConnection.bPaused = false;
