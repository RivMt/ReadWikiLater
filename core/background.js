/// Common Constants

// Page Keys
const keyPageUnknown = "unknown"
const keyPageNamuWiki = "namu"

// Actions
const actionInsertCSS = "insertCSS"
const actionOpenDocument = "openDoc"

// Data Access Keys
const keyTypeList = "list"
const keyTypePage = "page"
const keyTypeDocument = "doc"

// Regex for check url
const reProtocol = /https{0,1}:\/\//
const reNamuWiki = /namu\.wiki\/w\//

/// End of Common Constants

// Context Menu ID
const menuAddReadLaterId = "contextMenuAddReadLater"

/// Init extension

// Create 'Add document to read later'
chrome.contextMenus.create({
    id: menuAddReadLaterId,
    title: chrome.i18n.getMessage("menuAddReadLater"),
    contexts: [
        'link'
    ],
}, function () { })

// Handle context menu
chrome.contextMenus.onClicked.addListener(function (info, tab) {
    switch (info.menuItemId) {
        // Add read later
        case menuAddReadLaterId:
            addReadLater(info.linkUrl)
            break
    }
})

// Handle message
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Message: " + message.action)
    switch (message.action) {
        // Insert CSS
        case actionInsertCSS:
            // Insert common CSS
            console.log("Insert CSS: " + sender.tab.id.toString())
            chrome.scripting.insertCSS({
                files: [
                    'core/overlay.css'
                ],
                target: {
                    tabId: sender.tab.id
                }
            })
            sendResponse({
                "result": true
            })
            break
        // Open document
        case actionOpenDocument:
            const header = "https://"
            const url = header + message.pageUrl + message.uri
            chrome.tabs.update(sender.tab.id, {"url": url})
            sendResponse({
                "result": true
            })
            break
    }
})

/// END Init

async function addReadLater(url) {
    // Parse url
    const result = parseUrl(url)
    // Get read later list
    const list = await getReadLaterList(result[keyTypePage])
    // Add document to read later list
    list.push(result[keyTypeDocument])
    // Save storage
    const data = {}
    data[result[keyTypePage]] = {}
    data[result[keyTypePage]][keyTypeList] = list
    chrome.storage.local.set(data)
}

function parseUrl(url) {
    // Remove protocol
    let link = url.replace(reProtocol, "")
    const data = {}
    // Check url
    if (reNamuWiki.test(link)) { // is NamuWiki
        data[keyTypeDocument] = link.replace(reNamuWiki, "")
        data[keyTypePage] = keyPageNamuWiki
    }
    // Return value
    return data
}

async function getReadLaterList(keyPage) {
    const result = await chrome.storage.local.get(keyPage)
    if (result != undefined && result[keyPage] != undefined && result[keyPage][keyTypeList] != undefined) {
        return result[keyPage][keyTypeList]
    }
    return []
}