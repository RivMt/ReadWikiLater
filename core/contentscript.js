// Page Keys
const keyPageUnknown = "unknown"
const keyPageNamuWiki = "namu"

// Actions
const actionInsertCSS = "insertCSS"

// Data Access Keys
const keyTypeList = "list"
const keyTypePage = "page"
const keyTypeDocument = "doc"

// For dynamic SVG injection
const SVG_NS = 'http://www.w3.org/2000/svg';

// SVG Icon Path
const iconClose = "M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"

// HTML class and id
const htmlReadLaterBarId = "extReadLaterBar"
const htmlReadLaterItemClass = "extReadLaterItem"
const htmlReadLaterItemNameClass = "extReadLaterItemName"
const htmlReadLaterItemCloseClass = "extReadLaterItemClose"
const htmlReadLaterItemCloseIconClass = "extReadLaterItemCloseIcon"

const reNamuWiki = /namu\.wiki\/w\//

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

// Precondition: Bar exists
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
            // Item Parent
            const item = document.createElement('div')
            item.setAttribute('class', htmlReadLaterItemClass)
            item.addEventListener('click', () => {
                onItemClicked(name)
            })
            // Name
            const name = document.createElement('p')
            name.setAttribute('class', htmlReadLaterItemNameClass)
            name.innerText = decodeURI(list[i])
            // Close Button
            const close = document.createElement('div')
            close.setAttribute('class', htmlReadLaterItemCloseClass)
            close.addEventListener('click', () => {
                onCloseClicked(name)
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
            item.appendChild(name)
            item.appendChild(close)
            bar.appendChild(item)
        }

        // Return 'success'
        return true
    }
    return false
}

function onItemClicked(name) {
    // Open document
    const header = "https://"
    const url = header + mPageUrl + name
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        var tab = tabs[0];
        chrome.tabs.update(tab.id, {url: url});
    });
    // Remove item
    removeItem(mKeyPage, name)
}

function onCloseClicked(name) {
    // Remove item
    removeItem(mKeyPage, name)
}

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

async function getReadLaterList(keyPage) {
    const result = await chrome.storage.local.get(keyPage)
    if (result != undefined && result[keyPage] != undefined && result[keyPage][keyTypeList] != undefined) {
        console.log(result[keyPage][keyTypeList])
        return result[keyPage][keyTypeList]
    }
    console.log("empty")
    return []
}