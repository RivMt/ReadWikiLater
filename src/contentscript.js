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

/// Script-only Constants

// For dynamic SVG injection
const SVG_NS = 'http://www.w3.org/2000/svg';

// SVG Icon Path
const iconClose = "M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"

// HTML attributes
const htmlReadLaterBarId = "extReadLaterBar"
const htmlReadLaterItemClass = "extReadLaterItem"
const htmlReadLaterItemBoxClass = "extReadLaterItemBox"
const htmlReadLaterItemNameClass = "extReadLaterItemName"
const htmlReadLaterItemCloseClass = "extReadLaterItemClose"
const htmlReadLaterItemCloseIconClass = "extReadLaterItemCloseIcon"

/// End of Script-only Constants

// Global variables
let mKeyPage = keyPageUnknown
let mRegex = /XXXXXXXXXXXXXX/

/// Init page

// On page start
window.onload = async function () {
    let active = false
    // Check url
    const siteValues = await getSiteValues()
    for(var i=0; i < siteValues.length; i++) {
        const regex = new RegExp(siteValues[i][keySiteRegex])
        if (regex.test(document.URL)) { // URL is supported site
            active = true
            mKeyPage = siteValues[i][keySiteKey]
            mRegex = siteValues[i][keySiteRegex]
            break
        }
    }

    // Create read later bar
    createReadLaterBar()

    // Show read later bar when active
    if (active) {
        createReadLaterItems()
        requestInsertCSS(mKeyPage)
    }

    // Refresh read later bar items
    chrome.storage.onChanged.addListener((changes, areaName) => {
        createReadLaterItems()
    })
}

/// END Init

/**
 * Request background.js to insert css file to current tab
 * @param {string} keyPage Key of Page
 */
function requestInsertCSS(keyPage) {
    const data = {
        "action": actionInsertCSS,
        "key": keyPage
    }
    data[keyTypePage] = keyPage
    chrome.runtime.sendMessage(
        data,
        function (response) {}
    )
}

/**
 * Request background.js to open document to current tab
 * @param {string} keyPage Key of page
 * @param {string} url Url of document to open
 */
function requestOpenDocument(keyPage, url) {
    const data = {
        "action": actionOpenDocument,
        "url": url,
    }
    data[keyTypePage] = keyPage
    chrome.runtime.sendMessage(
        data,
        function (response) {}
    )
}

/**
 * Create read later bar
 * @returns {bool} Return true when bar has been created
 */
function createReadLaterBar() {
    const bar = document.getElementById(htmlReadLaterBarId)
    if (bar == null) {
        // Bar
        const readLaterBar = document.createElement('div')
        readLaterBar.setAttribute('id', htmlReadLaterBarId)
        document.body.appendChild(readLaterBar)
        // Return true because bar has been created
        return true
    }
    // Return false because bar already exits
    return false
}

/**
 * Create items into read later bar
 * @returns {bool} Return true items have been created
 */
async function createReadLaterItems() {
    // Find bar
    const bar = document.getElementById(htmlReadLaterBarId)
    if (bar != null) {
        // Reset bar
        bar.innerHTML = ""
        // Add items
        const list = await getReadLaterList(mKeyPage)
        for (var i = 0; i < list.length; i++) {
            const uri = list[i]
            // Item Parent
            const item = document.createElement('div')
            item.setAttribute('class', htmlReadLaterItemClass)
            // Item Click Box
            const box = document.createElement('div')
            box.setAttribute('class', htmlReadLaterItemBoxClass)
            box.addEventListener('click', () => {
                onItemClicked(uri)
            })
            // Name
            const p = document.createElement('p')
            p.setAttribute('class', htmlReadLaterItemNameClass)
            p.innerText = decodeURI(uri.replace(mRegex, ""))
            // Close Button
            const close = document.createElement('div')
            close.setAttribute('class', htmlReadLaterItemCloseClass)
            close.addEventListener('click', () => {
                onCloseClicked(uri)
            })
            // SVG
            const svg = document.createElementNS(SVG_NS, 'svg')
            svg.setAttribute('class', htmlReadLaterItemCloseIconClass)
            svg.setAttribute('viewBox', '0 0 24 24')
            // Path
            const path = document.createElementNS(SVG_NS, 'path')
            path.setAttribute('d', iconClose)
            path.setAttribute('fill', 'currentColor')

            // Construct tree
            svg.appendChild(path)
            close.appendChild(svg)
            box.appendChild(p)
            item.appendChild(box)
            item.appendChild(close)
            bar.appendChild(item)
        }

        // Return 'success'
        return true
    }
    return false
}

/**
 * Trigger when read later bar's item is clicked
 * @param {string} url Url of document
 */
function onItemClicked(url) {
    // Open document
    requestOpenDocument(mKeyPage, url)
    // Remove item
    removeItem(mKeyPage, url)
}

/**
 * Trigger when read later bar's item's close button is clicked
 * @param {string} url Url of document
 */
function onCloseClicked(url) {
    // Remove item
    removeItem(mKeyPage, url)
}

/**
 * Remove item from Google Chrome's storage using its url
 * @param {string} keyPage Key of page
 * @param {string} url Url of document
 */
async function removeItem(keyPage, url) {
    const list = await getReadLaterList(keyPage)
    const index = list.indexOf(url)
    if (index > -1) {
        // Remove item
        list.splice(index, 1)
        // Apply changes
        const data = {}
        data[keyPage] = {}
        data[keyPage][keyTypeList] = list
        chrome.storage.local.set(data)
    }
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
    if (result !== undefined && result[keyOptionSiteValues] !== undefined && !isObjectEmpty(result[keyOptionSiteValues])) {
        return result[keyOptionSiteValues]
    }
    return data
}