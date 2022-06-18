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
const keyTypeCSS = "css"

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
                    // Create page-specific CSS
                    checkPageSpecificCSS(json[keyOptionSiteValues])
                } else {
                    console.log("Already updated")
                }
            }
        })

    }
    request.send()
}

/**
 * Create page-specific CSS file if does not exist
 * @param {Array} siteValueList Array of siteValues
 */
function checkPageSpecificCSS(siteValueList) {
    for(var i=0; i < siteValueList.length; i++) {
        const key = siteValueList[i][keySiteKey]
        // Check page-specific css exists
        chrome.runtime.getPackageDirectoryEntry((entry) => {
            entry.getFile(
                'src/styles/' + key + '.css',
                { create: false },
                () => {
                    saveCSSExistence(key, true)
                },
                () => { // CSS does not exist
                    saveCSSExistence(key, false)
                }
            )
        })
    }
}

/**
 * Save page-specific CSS file existence
 * @param {string} key Key of page
 * @param {bool} value Existence of CSS file
 */
async function saveCSSExistence(key, value) {
    const data = {}
    data[key] = {}
    data[key][keyTypeList] = await getReadLaterList(key)
    data[key][keyTypeCSS] = value
    chrome.storage.local.set(data)
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
 * Get local storage using key
 * @param {string} key Key
 * @returns {object} Requested data object
 */
async function getLocalStorage(key) {
    const result = await chrome.storage.local.get(key)
    if (result != undefined && result[key] != undefined) {
        return result
    }
    const data = {}
    data[key] = {}
    return data
}

/**
 * Get list of read later items for target page
 * @description If it does not exists, return empty list
 * @param {string} keyPage Key of page
 * @returns {Array} Return list of read later items for target page
 */
async function getReadLaterList(keyPage) {
    const result = await getLocalStorage(keyPage)
    if (result[keyPage] !== undefined && result[keyPage][keyTypeList] !== undefined) {
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
    if (result !== undefined && result[keyOptionSiteValues] !== undefined && !isObjectEmpty(result[keyOptionSiteValues])) {
        console.log("Use local")
        return result[keyOptionSiteValues]
    }
    console.log("Use in-code")
    return data
}