
// On page start
window.onload = function() {
    // Edit version
    document.getElementById("version").innerText = chrome.runtime.getManifest().version
    // Apply translation
    applyTranslation()
}

/**
 * Apply translations to element which has 'translate' class
 */
function applyTranslation() {
    const list = document.body.getElementsByClassName('translate')
    for(var i=0; i < list.length; i++) {
        list[i].innerText = chrome.i18n.getMessage(list[i].getAttribute('key'))
    }
}