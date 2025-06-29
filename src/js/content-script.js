// JS Content Script

console.log('%cQR Code Extension: content-script.js', 'color: Khaki')

if (!chrome.storage.onChanged.hasListener(onChanged)) {
    console.debug('Adding storage.onChanged Listener')
    chrome.storage.onChanged.addListener(onChanged)
}

;(async () => {
    const { options } = await chrome.storage.sync.get(['options'])
    console.log('options:', options)
    console.log('window.location.hostname:', window.location.hostname)
})()

/**
 * On Changed Callback
 * @function onChanged
 * @param {Object} changes
 * @param {String} namespace
 */
async function onChanged(changes, namespace) {
    console.debug('onChanged:', changes, namespace)
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
        if (namespace === 'sync' && key === 'options') {
            console.debug('sync.options', oldValue, newValue)
        }
    }
}

// eslint-disable-next-line no-unused-vars
function getLargestFaviconUrl() {
    const links = Array.from(document.querySelectorAll('link[rel~="icon"]'))
        .map((link) => {
            const size = link.getAttribute('sizes')
            const sizeValue = size ? parseInt(size.split('x')[0]) : 0
            return { href: link.href, size: sizeValue }
        })
        .sort((a, b) => b.size - a.size)

    if (links.length > 0) return links[0].href

    return `${location.origin}/favicon.ico`
}
