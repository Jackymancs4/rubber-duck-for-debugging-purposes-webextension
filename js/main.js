let biggerHelpElement = document.getElementById("bigger-help")

if (biggerHelpElement) {
    biggerHelpElement.onclick = (e) => {
        if(browser) {
            browser.tabs.create({
                url: browser.runtime.getURL("../duck.html")
            })
        } else if(chrome) {
            chrome.tabs.create({
                url: chrome.runtime.getURL("../duck.html")
            })
        }
    }
}
