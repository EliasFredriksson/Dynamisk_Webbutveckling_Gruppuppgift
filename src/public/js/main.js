window.onload = () => {
    const jsData = JSON.parse(
        document.getElementById("js-data").getAttribute("data-js")
    );
    loadScripts(jsData);
};

function loadScripts(urls) {
    urls.forEach((entry) => {
        console.log("LOAD SCRIPT:\n", entry);
        let head = document.getElementsByTagName("head")[0];
        let script = document.createElement("script");
        script.type = "text/javascript";
        script.src = entry;
        head.appendChild(script);
    });
}
