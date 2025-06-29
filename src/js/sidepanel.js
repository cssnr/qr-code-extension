// JS for sidepanel.html

import { linkClick, openPopup, updateManifest } from './export.js'

chrome.tabs.onActivated.addListener(onActivated)
document.addEventListener('DOMContentLoaded', domContentLoaded)
document
    .querySelectorAll('a[href]')
    .forEach((el) => el.addEventListener('click', linkClick))
document
    .querySelectorAll('.open-popup')
    .forEach((el) => el.addEventListener('click', openPopup))
document
    .querySelectorAll('.close-panel')
    .forEach((el) => el.addEventListener('click', closePanel))

const hostnameEl = document.getElementById('hostname')

/**
 * DOMContentLoaded
 * @function domContentLoaded
 */
async function domContentLoaded() {
    console.debug('domContentLoaded')
    // noinspection ES6MissingAwait
    updateManifest()
    // noinspection ES6MissingAwait
    tabChange()

    // const { options } = await chrome.storage.sync.get(['options'])
    // console.debug('options:', options)
}

/**
 * Close Side Panel Click Callback
 * @function closePanel
 * @param {Event} [event]
 */
async function closePanel(event) {
    console.debug('closePanel:', event)
    event?.preventDefault()
    // noinspection JSUnresolvedReference
    if (typeof browser !== 'undefined') {
        // noinspection JSUnresolvedReference
        await browser.sidebarAction.close()
    } else {
        window.close()
    }
}

/**
 * Tab Change Callback
 * @function onActivated
 * @param {chrome.tabs.TabActiveInfo} activeInfo
 */
async function onActivated(activeInfo) {
    console.debug('onActivated:', activeInfo)
    const window = await chrome.windows.getCurrent()
    // console.debug('window:', window)
    if (window.id !== activeInfo.windowId) {
        return console.debug('Tab Change - Different Window.')
    }
    console.debug('%c Tab Change - Update Tab Data.', 'color: Lime')
    // noinspection ES6MissingAwait
    tabChange()
}

/**
 * Process Tab Changes
 * @function tabChange
 */
async function tabChange() {
    const [tab] = await chrome.tabs.query({
        currentWindow: true,
        active: true,
    })
    console.debug('tab:', tab)
    console.debug('tab.url:', tab.url)
    if (tab.url) {
        hostnameEl.textContent = tab.url
    } else {
        hostnameEl.textContent = 'No URL for Tab'
    }
}
