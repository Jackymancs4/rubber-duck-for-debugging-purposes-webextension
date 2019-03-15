let browserScope = (typeof browser !== 'undefined') ?
                    browser :
                    (typeof chrome !== 'undefined') ?
                    chrome : null

let biggerHelpElement = document.getElementById("bigger-help")
let whatElement = document.getElementById("what")

if (biggerHelpElement && browserScope) {
    biggerHelpElement.onclick = (e) => {
        browserScope.tabs.create({
            url: browserScope.runtime.getURL("../duck.html")
        })
    }
}

if (whatElement && browserScope) {
    whatElement.onclick = (e) => {
        browserScope.tabs.create({
            url: "https://rubberduckdebugging.com/"
        })
    }
}
