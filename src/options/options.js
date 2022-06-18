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


// On page begin
window.onload = function () {
    // Add listener to sync button
    document.getElementById('btnSync').addEventListener('click', () => {
        downloadSiteValues()
    })
}

/**
 * Download site values from master repository
 */
function downloadSiteValues() {
    const url = "https://raw.githubusercontent.com/RivMt/ReadWikiLater/master/src/site_values.json"
    const request = new XMLHttpRequest()
    request.open('GET', url, true)
    request.responseType = 'text'
    request.onload = function () {
        // Parse site values JSON
        let json = request.responseText
        json = json.replace(/^[^(]*\(([\S\s]+)\);?$/, '$1');
        json = JSON.parse(json)
        console.log("JSON version: " + json[keyTypeVersion])
        // Get local site values
        getSiteValues().then((local) => {
            // Check json is valid
            if (json !== undefined && !isObjectEmpty(json)) {
                if ((json[keyTypeVersion] * 1) > (local[keyTypeVersion] * 1)) {
                    console.log("Save: " + json)
                    // Make data object
                    const data = {}
                    data[keyOptionSiteValues] = json
                    chrome.storage.sync.set(data)
                } else {
                    console.log("Already updated")
                }
            }
        })

    }
    request.send()
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
    const data = {}
    data[keyOptionSiteValues] = [
        {
            "key": "namu",
            "regex": "namu\.wiki\/w\/"
        },
        {
            "key": "wikipedia",
            "regex": "\[a\-z\]\[a\-z\]\.wikipedia\.org\/wiki\/"
        },
        {
            "key": "libre",
            "regex": "librewiki\.net\/wiki\/"
        },
        {
            "key": "fandom",
            "regex": "\[a\-z\]\{1\,\}\.fandom\.com\/\(\[a\-z\]\{2\}\/\)\?wiki\/"
        },
        {
            "key": "wikihow",
            "regex": "\[a\-z\]\{2\}\.wikihow\.com\/"
        }
    ]
    data[keyTypeVersion] = "0"
    // Get
    const result = await chrome.storage.sync.get(keyOptionSiteValues)
    if (result !== undefined && result[keyOptionSiteValues] !== undefined && result[keyOptionSiteValues][keyTypeData] !== undefined && !isObjectEmpty(result[keyOptionSiteValues][keyTypeData])) {
        return result[keyOptionSiteValues][keyTypeData]
    }
    return data
}