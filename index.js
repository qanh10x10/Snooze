// Function to connect to Ethereum RPC
function connectRPC(rpcUrl,address) {
    if (typeof ethers === 'undefined') {
        console.error("Ethers.js is not available");
        return;
    }

    // Create a new provider
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

    provider.getNetwork().then(function (network) {
        //console.log("Connected to network:", network);
        // Notify Unity about successful connection
        window.unityInstance.SendMessage('JavaScriptHook', 'OnRPCConnected', network.name);
        if (address) {
            provider.getBalance(address).then(function (balance) {
                window.unityInstance.SendMessage('JavaScriptHook', 'OnBalanceFetched', ethers.utils.formatEther(balance));
            }).catch(function (error) {
                console.error("Failed to fetch balance:", error);
                // Notify Unity about the error
                window.unityInstance.SendMessage('JavaScriptHook', 'OnBalanceFetchError', error.message);
            });
        }
    }).catch(function (error) {
        console.error("Failed to connect to RPC:", error);
        // Notify Unity about the error
        window.unityInstance.SendMessage('JavaScriptHook', 'OnRPCError', error.message);
    });
}
// Unity script setup
window.addEventListener("load", function () {
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("ServiceWorker.js");
    }
});
var unityInstanceRef;
var unsubscribe;
var container = document.querySelector("#unity-container");
var canvas = document.querySelector("#unity-canvas");
var loadingBar = document.querySelector("#unity-loading-bar");
var progressBarFull = document.querySelector("#unity-progress-bar-full");
var warningBanner = document.querySelector("#unity-warning");
// Shows a temporary message banner/ribbon for a few seconds, or
// a permanent error message on top of the canvas if type=='error'.
// If type=='warning', a yellow highlight color is used.
// Modify or remove this function to customize the visually presented
// way that non-critical warnings and error messages are presented to the
// user.
function unityShowBanner(msg, type) {
    function updateBannerVisibility() {
        warningBanner.style.display = warningBanner.children.length ? 'block' : 'none';
    }
    var div = document.createElement('div');
    div.innerHTML = msg;
    warningBanner.appendChild(div);
    if (type == 'error') div.style = 'background: red; padding: 10px;';
    else {
        if (type == 'warning') div.style = 'background: yellow; padding: 10px;';
        setTimeout(function () {
            warningBanner.removeChild(div);
            updateBannerVisibility();
        }, 5000);
    }
    updateBannerVisibility();
}

var buildUrl = "Build";
var loaderUrl = buildUrl + "/Snooze.loader.js";
var config = {
    dataUrl: buildUrl + "/Snooze.data",
    frameworkUrl: buildUrl + "/Snooze.framework.js",
    codeUrl: buildUrl + "/Snooze.wasm",
    streamingAssetsUrl: "StreamingAssets",
    companyName: "ADNX",
    productName: "Snooze",
    productVersion: "0.6",
    showBanner: unityShowBanner,
};

// By default Unity keeps WebGL canvas render target size matched with
// the DOM size of the canvas element (scaled by window.devicePixelRatio)
// Set this to false if you want to decouple this synchronization from
// happening inside the engine, and you would instead like to size up
// the canvas DOM size and WebGL render target sizes yourself.
// config.matchWebGLToCanvasSize = false;

if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
    // Mobile device style: fill the whole browser client area with the game canvas:
    var meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width, height=device-height, initial-scale=1.0, user-scalable=no, shrink-to-fit=yes';
    document.getElementsByTagName('head')[0].appendChild(meta);
}

loadingBar.style.display = "block";

var script = document.createElement("script");
script.src = loaderUrl;
script.onload = () => {
    createUnityInstance(canvas, config, (progress) => {
        progressBarFull.style.width = 100 * progress + "%";
    }).then((unityInstance) => {
        window.unityInstance = unityInstance;

        // if(unityInstance){
        //     unityInstance.SendMessage('JavaScriptHook', 'ConnectToRPC', 'https://bsc-testnet-rpc.publicnode.com');
        // }

        try {
            if(!window.Telegram || !window.Telegram.WebApp){
                alert("Cannot get Telegram Data, please reload Bot");
            }
            if (window.Telegram && window.Telegram.WebApp) {
                window.Telegram.WebApp.ready();
                window.Telegram.WebApp.expand();
                window.Telegram.WebApp.enableClosingConfirmation();
                window.Telegram.WebApp.disableVerticalSwipes();
                //window.unityInstance.SendMessage('JSConnectManager', 'POST_LoginTelegram', window.Telegram.WebApp.initData);
            }
        } catch (error) {
            alert("Cannot get Telegram Data, please reload Bot");
        }
        
        unityInstanceRef = unityInstance;
        loadingBar.style.display = "none";
    }).catch((message) => {
        alert(message);
    });
};
document.body.appendChild(script);
