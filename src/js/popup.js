// JS for popup.html

import {
    debounce,
    genQrCode,
    linkClick,
    saveOptions,
    updateManifest,
    updateOptions,
    updatePlatform,
} from './export.js'

document.addEventListener('DOMContentLoaded', initPopup)
// noinspection JSCheckFunctionSignatures
document
    .querySelectorAll('a[href]')
    .forEach((el) => el.addEventListener('click', (e) => linkClick(e, true)))
document
    .querySelectorAll('.options input')
    .forEach((el) => el.addEventListener('change', saveOptions))
document
    .querySelectorAll('form.options')
    .forEach((el) => el.addEventListener('submit', (e) => e.preventDefault()))
document
    .querySelectorAll('[data-bs-toggle="tooltip"]')
    .forEach((el) => new bootstrap.Tooltip(el))

const qrCodeEl = document.getElementById('qr-code')
const hostnameInput = document.getElementById('hostname')

hostnameInput.addEventListener('input', debounce(inputChange, 500))

/**
 * Initialize Popup
 * @function initPopup
 */
async function initPopup() {
    console.debug('initPopup')
    requestAnimationFrame(() => {
        hostnameInput.focus()
    })
    // noinspection ES6MissingAwait
    updateManifest()
    // noinspection ES6MissingAwait
    updatePlatform()
    chrome.storage.sync.get(['options', 'sites']).then((items) => {
        updateOptions(items.options)
    })

    // // Check Permissions
    // const hasPerms = await checkPerms()
    // if (!hasPerms) {
    //     console.log('%c Permissions Not Granted', 'color: Orange')
    // }

    const [tab] = await chrome.tabs.query({
        currentWindow: true,
        active: true,
    })
    console.debug('url:', tab.url)
    console.debug('favIconUrl:', tab.favIconUrl)

    if (!tab.url) {
        return console.debug('%c initPopup - No: tab.url', 'color: Red')
    }

    // TODO: Use favicon Permission for Chrome...
    const image = tab.favIconUrl?.startsWith('data:image')
        ? tab.favIconUrl
        : null
    console.debug('image:', image)

    hostnameInput.value = tab.url
    hostnameInput.setSelectionRange(0, hostnameInput.value.length)
    await genQrCode(qrCodeEl, tab.url, { image })
}

async function inputChange(event) {
    console.debug('inputChange:', event)
    await genQrCode(qrCodeEl, hostnameInput.value)
}
