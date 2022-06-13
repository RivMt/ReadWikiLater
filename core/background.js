/// Common Constants

// Site value
const siteValues = [
    {
        "key": "namu",
        "regex": /namu\.wiki\/w\//,
        "url": "namu.wiki/w/"
    },
    {
        "key": "wikipedia",
        "regex": /[a-z][a-z]\.wikipedia\.org\/wiki\//,
        "url": "%l.wikipedia.org/wiki/",
        "exLang": /\.wikipedia\.org\/wiki\/.+/
    },
    {
        "key": "libre",
        "regex": /librewiki\.net\/wiki\//,
        "url": "librewiki.net/wiki/"
    },
    {
        "key": "fandom",
        "regex": /[a-z]{1,}\.fandom\.com\/wiki\//,
        "url": "%l.fandom.com/wiki/",
        "exLang": /\.fandom\.com\/wiki\/.+/
    },
]

// Page Keys
const keyPageUnknown = "unknown"

// Data Access Keys
const keyTypeList = "list"
const keyTypePage = "page"
const keyTypeDocument = "doc"

// Site value keys
const keySiteKey = "key"
const keySiteRegex = "regex"
const keySiteUrl = "url"

// Actions
const actionInsertCSS = "insertCSS"
const actionOpenDocument = "openDoc"

// Regex for check url
const reProtocol = /https{0,1}:\/\//
const reLang = /\%l/

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
            chrome.scripting.insertCSS({
                files: [
                    'core/overlay.css',
                    'core/styles/' + message.key + '.css'
                ],
                target: {
                    tabId: sender.tab.id
                }
            })
            // Send response
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

/**
 * Add document to read later list
 * @param {string} url Full path of document to add
 */
async function addReadLater(url) {
    // Parse url
    const result = parseUrl(url)
    if (!isObjectEmpty(result)) {
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
}

/**
 * Parse url to analyze document type and document name if url is valid. Otherwise, return empty
 * @param {string} url Full path of document
 * @returns {object} Include document type and name when url is valid
 */
function parseUrl(url) {
    // Remove protocol
    let link = url.replace(reProtocol, "")
    const data = {}
    // Check url
    for(var i=0; i < siteValues.length; i++) {
        const regex = siteValues[i][keySiteRegex]
        if (regex.test(url)) { // URL is supported site
            data[keyTypeDocument] = link.replace(regex, "")
            data[keyTypePage] = siteValues[i][keySiteKey]
            break
        }
    }
    // Return value
    return data
}

/// Utility method below

/**
 * Check object is empty or not
 * @param {object} obejct Any object
 * @returns {bool} Return true when object is empty
 */
function isObjectEmpty(obejct) {
    return Object.keys(obejct).length === 0 && obejct.constructor === Object
}

/**
 * Get list of read later items for target page
 * @description If it does not exists, return empty list
 * @param {string} keyPage Key of page
 * @returns {Array} Return list of read later items for target page
 */
async function getReadLaterList(keyPage) {
    const result = await chrome.storage.local.get(keyPage)
    if (result != undefined && result[keyPage] != undefined && result[keyPage][keyTypeList] != undefined) {
        return result[keyPage][keyTypeList]
    }
    return []
}