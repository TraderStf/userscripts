
// store code received
let data;
// determines whether strict csp injection has already run (JS only)
let cspFallbackAttempted = 0;
// send the url to swift side for fetching applicable code
const url = window.location.href;
// tell swift side if requester is window.top, needed to filter code for @noframes
const isTop = window === window.top;
// unique id per requester to avoid repeat execution
const id = Math.random().toString(36).substr(2, 8);

// returns a sorted object
function sortByWeight(o) {
    let sorted = {};
    Object.keys(o).sort((a, b) => o[b].weight - o[a].weight).forEach(key => sorted[key] = o[key]);
    return sorted;
}

function injectCSS(filename, code) {
    // there's no fallback if blocked by CSP
    // future fix?: https://wicg.github.io/construct-stylesheets/
    console.info(`Injecting ${filename}`);
    const tag = document.createElement("style");
    tag.textContent = code;
    document.head.appendChild(tag);
}

function injectJS(filename, code, scope) {
    console.info(`Injecting ${filename}`);
    code = "(function() {\n" + code + "\n//# sourceURL=" + filename.replace(/\s/g, "-") + "\n})();";
    if (scope != "content") {
        const tag = document.createElement("script");
        tag.textContent = code;
        document.body.appendChild(tag);
    } else {
        eval(code);
    }
}

function processJS(filename, code, scope, timing) {
    // this is about to get ugly
    if (timing === "document-start") {
        if (document.readyState === "loading") {
            document.addEventListener("readystatechange", function() {
                if (document.readyState === "interactive") {
                    injectJS(filename, code, scope);
                }
            });
        } else {
            injectJS(filename, code, scope);
        }
    } else if (timing === "document-end") {
        if (document.readyState !== "loading") {
            injectJS(filename, code, scope);
        } else {
            document.addEventListener("DOMContentLoaded", function() {
                injectJS(filename, code, scope);
            });
        }
    } else if (timing === "document-idle") {
        if (document.readyState === "complete") {
            injectJS(filename, code, scope);
        } else {
            document.addEventListener("readystatechange", function(e) {
                if (document.readyState === "complete") {
                    injectJS(filename, code, scope);
                }
            });
        }
    }
}

function parseCode(data, fallback = false) {
    // get css/js code separately
    for (const type in data) {
        // separate code type object (ie. {"css":{ ... }} {"js": { ... }})
        const codeTypeObject = data[type];
        // will be used for ordered code injection
        let sorted = {};
        if (type === "css") {
            sorted = sortByWeight(codeTypeObject);
            for (const filename in sorted) {
                const code = sorted[filename].code;
                // css is only injected into the page scope after DOMContentLoaded event
                if (document.readyState !== "loading") {
                    injectCSS(filename, code);
                } else {
                    document.addEventListener("DOMContentLoaded", function() {
                        injectCSS(filename, code);
                    });
                }
            }
        } else if (type === "js") {
            // js code can be scoped to the content script, page or auto
            // if auto is set, page scope is attempted, if fails content scope attempted
            for (let scope in codeTypeObject) {
                // get the nested scoped objects, separated by timing
                const scopeObject = codeTypeObject[scope];
                // possible execution timings
                const timings = ["document-start", "document-end", "document-idle"];
                timings.forEach(timing => {
                    // get the nested timing objects, separated by filename, skip if empty
                    const timingObject = scopeObject[timing];
                    if (Object.keys(timingObject).length != 0) {
                        sorted = sortByWeight(timingObject);
                        for (const filename in sorted) {
                            const code = sorted[filename].code;
                            // when block by csp rules, auto scope script will auto retry injection
                            if (fallback) {
                                console.warn(`Attempting fallback injection for ${filename}`);
                                scope = "content";
                            }
                            processJS(filename, code, scope, timing);
                        }
                    }
                });
            }
        }
    }
}

function cspFallback(e) {
    const src = e.sourceFile.toUpperCase();
    const ext = safari.extension.baseURI.toUpperCase();
    // ensure that violation came from the extension
    if ((ext.startsWith(src) || src.startsWith(ext))) {
        // get all "auto" code
        if (Object.keys(data.js.auto).length != 0 && cspFallbackAttempted < 1) {
            let n = {"js": {"auto": {}}};
            n.js.auto = data.js.auto;
            parseCode(n, true);
            cspFallbackAttempted = 1;
        }
    }
}

function getCurrentPageFrames() {
    let frames = [{url: window.location.href, top: true}];
    const iframes = document.querySelectorAll("iframe");
    if (iframes) {
        iframes.forEach(iframe => {
            const src = iframe.src || iframe.getAttribute("data-src");
            src && frames.push({url: src, top: false});
        });
    }
    return frames;
}

function handleMessage(e) {
    // the only message currently sent to the content script
    if (e.name === "RESP_USERSCRIPTS") {
        if (e.message.error) {
            return console.error(e.message.error);
        }
        if (e.message.data.id === id) {
            data = e.message.data.code;
            // check if data is empty, run injection sequence
            if (Object.keys(data).length != 0) {
                parseCode(data);
            }
        }
    } else if (e.name === "REQ_PAGEFRAMES" && isTop) {
        const pageUrls = getCurrentPageFrames();
        safari.extension.dispatchMessage("RESP_PAGEFRAMES", {data: pageUrls});
    }
}

// fallback for pages with strict content security policies and scripts that have @inject-into auto
document.addEventListener("securitypolicyviolation", cspFallback);
// event listener to handle messages
safari.self.addEventListener("message", handleMessage);
// request code for page url
safari.extension.dispatchMessage("REQ_USERSCRIPTS", {id: id, top: isTop, url: url});
