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

/// Script-only Constants

// For dynamic SVG injection
const SVG_NS = 'http://www.w3.org/2000/svg';

// SVG Icon Path
const iconClose = "M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"

// HTML attributes
const htmlReadLaterBarId = "extReadLaterBar"
const htmlReadLaterItemClass = "extReadLaterItem"
const htmlReadLaterItemNameClass = "extReadLaterItemName"
const htmlReadLaterItemCloseClass = "extReadLaterItemClose"
const htmlReadLaterItemCloseIconClass = "extReadLaterItemCloseIcon"

/// End of Script-only Constants

// Global variables
let mKeyPage = keyPageUnknown
let mPageUrl = ""

/// Init page

// On page start
window.onload = function () {
    let active = false
    // Check url
    if (reNamuWiki.test(document.URL)) { // is NamuWiki
        active = true
        mKeyPage = keyPageNamuWiki
        mPageUrl = "namu.wiki/w/"
    }
    // Show read later bar when active
    if (active) {
        createReadLaterBar()
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
        "action": actionInsertCSS
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
 * @param {string} uri URI of document to open
 */
function requestOpenDocument(keyPage, uri) {
    const data = {
        "action": actionOpenDocument,
        "uri": uri,
        "pageUrl": mPageUrl
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
        console.log("Refresh: " + list.length.toString())
        for (var i = 0; i < list.length; i++) {
            const uri = list[i]
            // Item Parent
            const item = document.createElement('div')
            item.setAttribute('class', htmlReadLaterItemClass)
            item.addEventListener('click', () => {
                onItemClicked(uri)
            })
            // Name
            const p = document.createElement('p')
            p.setAttribute('class', htmlReadLaterItemNameClass)
            p.innerText = decodeURI(uri)
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
            item.appendChild(p)
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
 * @param {string} name Name of document
 */
function onItemClicked(name) {
    // Open document
    requestOpenDocument(mKeyPage, name)
    // Remove item
    removeItem(mKeyPage, name)
}

/**
 * Trigger when read later bar's item's close button is clicked
 * @param {string} name Name of document
 */
function onCloseClicked(name) {
    // Remove item
    removeItem(mKeyPage, name)
}

/**
 * Remove item from Google Chrome's storage using its name
 * @param {string} keyPage Key of page
 * @param {string} name Name of document
 */
async function removeItem(keyPage, name) {
    const list = await getReadLaterList(keyPage)
    const index = list.indexOf(name)
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