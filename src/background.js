/// Common Constants

// Page Keys
const keyPageUnknown = "unknown"

// Data Access Keys
const keyTypeList = "list"
const keyTypePage = "page"
const keyTypeDocument = "doc"
const keyTypeData = "data"
const keyTypeVersion = "version"
const keyTypeDate = "date"

// Site value keys
const keySiteKey = "key"
const keySiteRegex = "regex"

// Options keys
const keyOptionSiteValues = "siteValues"

// Actions
const actionInsertCSS = "insertCSS"
const actionOpenDocument = "openDoc"

// Regex for check url
const reProtocol = /https{0,1}:\/\//

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
            // Insert CSS
            insertCSS(sender.tab.id, message.key)
            // Send response
            sendResponse({
                "result": true
            })
            break
        // Open document
        case actionOpenDocument:
            const header = "https://"
            const url = header + message.url
            chrome.tabs.update(sender.tab.id, {"url": url})
            sendResponse({
                "result": true
            })
            break
    }
})

/// END Init

/**
 * Insert proper CSS following its page to tab
 * @param {number} tabId ID of tab to insert CSS
 * @param {string} key Key of tab's url
 */
function insertCSS(tabId, key) {
    // CSS List
    const css = [
        'src/overlay.css',
        'src/styles/' + key + '.css'
    ]
    // Insert common CSS
    chrome.scripting.insertCSS({
        files: css,
        target: {
            tabId: tabId
        }
    })
}

/**
 * Add document to read later list
 * @param {string} url Full path of document to add
 */
async function addReadLater(url) {
    // Parse url
    const result = await parseUrl(url)
    if (!isObjectEmpty(result)) {
        // Get read later list
        const list = await getReadLaterList(result[keyTypePage])
        const document = result[keyTypeDocument]
        // Check same url
        if (list.indexOf(document) === -1) {
            // Add document to read later list
            list.push(document)
            // Save storage
            const data = {}
            data[result[keyTypePage]] = {}
            data[result[keyTypePage]][keyTypeList] = list
            chrome.storage.local.set(data)
        }
    }
}

/**
 * Parse url to analyze document type and document name if url is valid. Otherwise, return empty
 * @param {string} url Full path of document
 * @returns {object} Include document type and name when url is valid
 */
async function parseUrl(url) {
    // Remove protocol
    let link = url.replace(reProtocol, "")
    const data = {}
    // Check url
    const siteValues = await getSiteValues()
    for(var i=0; i < siteValues.length; i++) {
        const regex = new RegExp(siteValues[i][keySiteRegex])
        if (regex.test(url)) { // URL is supported site
            data[keyTypeDocument] = link
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

/**
 * Get siteValues object from sync storage
 * @returns {object} Return legacy siteValues if storage does not have object
 */
async function getSiteValues() {
    // Site value (Legacy)
    const data = [
        {
            "key": "namu",
            "regex": "/namu\\.wiki\/w\//"
        },
        {
            "key": "wikipedia",
            "regex": "/[a-z][a-z]\\.wikipedia\\.org\/wiki\//"
        },
        {
            "key": "libre",
            "regex": "/librewiki\\.net\/wiki\//"
        },
        {
            "key": "fandom",
            "regex": "/[a-z]{1,}\\.fandom\\.com\/([a-z]{2}\/)?wiki\//"
        },
        {
            "key": "wikihow",
            "regex": "/[a-z]{2}\\.wikihow\\.com\//"
        }
    ]
    // Get
    const result = await chrome.storage.sync.get(keyOptionSiteValues)
    if (result !== undefined && result[keyOptionSiteValues] !== undefined && result[keyOptionSiteValues][keyTypeData] !== undefined && !isObjectEmpty(result[keyOptionSiteValues][keyTypeData])) {
        return result[keyOptionSiteValues][keyTypeData]
    }
    return data
}