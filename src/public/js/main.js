window.onload = () => {
    const rawData = document.getElementById("js-data").getAttribute("data-js");

    if (rawData) {
        const jsData = JSON.parse(rawData);
        loadScripts(jsData);
    }

    initializeTransition();
};

function loadScripts(urls) {
    urls.forEach((entry) => {
        console.log("LOADED SCRIPT:\n", entry);
        let head = document.getElementsByTagName("head")[0];
        let script = document.createElement("script");
        script.type = "text/javascript";
        script.src = entry;
        head.appendChild(script);
    });
}

function initializeTransition() {}
