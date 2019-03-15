let browserScope = (typeof browser !== 'undefined') ? browser : chrome

let biggerHelpElement = document.getElementById("bigger-help")
let whatElement = document.getElementById("what")

if (biggerHelpElement && typeof chrome !== 'undefined') {
    biggerHelpElement.onclick = (e) => {
        browserScope.tabs.create({
            url: browserScope.runtime.getURL("../duck.html")
        })
    }
}

if (whatElement && typeof chrome !== 'undefined') {
    whatElement.onclick = (e) => {
        browserScope.tabs.create({
            url: "https://rubberduckdebugging.com/"
        })
    }
}
