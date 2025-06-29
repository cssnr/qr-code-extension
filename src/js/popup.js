// JS for popup.html

import {
    checkPerms,
    grantPerms,
    injectFunction,
    linkClick,
    saveOptions,
    updateManifest,
    updateOptions,
    updatePlatform,
} from './export.js'
import { debounce } from './main.js'
import QRCodeStyling from '../dist/qr-code-styling/qr-code-styling.js'

document.addEventListener('DOMContentLoaded', initPopup)
// noinspection JSCheckFunctionSignatures
document
    .querySelectorAll('.grant-permissions')
    .forEach((el) => el.addEventListener('click', (e) => grantPerms(e, true)))
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
hostnameInput.addEventListener('input', debounce(inputChange, 600))

function inputChange(event) {
    console.debug('inputChange:', event)
    qrCodeEl.innerHTML = ''
    const code = genQrCode(hostnameInput.value)
    code.append(qrCodeEl)
}

/**
 * Initialize Popup
 * @function initPopup
 */
async function initPopup() {
    console.debug('initPopup')
    // noinspection ES6MissingAwait
    updateManifest()
    // noinspection ES6MissingAwait
    updatePlatform()

    // Update Options
    chrome.storage.sync.get(['options']).then((items) => {
        console.debug('options:', items.options)
        updateOptions(items.options)
    })

    // Check Host Permissions
    const hasPerms = await checkPerms()
    if (!hasPerms) {
        console.log('%cHost Permissions Not Granted', 'color: Red')
    }

    // Get Tab Info
    // TODO: Create a single function to inject and remove from content-script
    const siteInfo = await injectFunction(() => {
        return { ...window.location, favicon: getLargestFaviconUrl() }
    })
    console.debug('siteInfo:', siteInfo)

    // Check if Current Tab is Accessible
    if (!siteInfo?.href) {
        document
            .querySelectorAll('.tab-perms')
            .forEach((el) => el.classList.add('d-none'))
        return console.log('%cNo Tab Permissions', 'color: Orange')
    }

    console.debug('siteInfo.href:', siteInfo.href)
    console.debug('siteInfo.favicon:', siteInfo.favicon)

    hostnameInput.value = siteInfo.href
    hostnameInput.focus()
    hostnameInput.setSelectionRange(0, hostnameInput.value.length)

    const code = genQrCode(siteInfo.href, siteInfo.favicon)
    code.append(qrCodeEl)
    // qrCodeEl.querySelector('svg').classList.add('img-fluid')

    // // Update Site Data
    // try {
    //     // noinspection JSUnresolvedReference
    //     hostnameInput.textContent = siteInfo.hostname
    //     // noinspection JSUnresolvedReference
    //     console.debug('%c hostname:', 'color: Lime', siteInfo.hostname)
    //     document.getElementById('toggle-site').disabled = false
    // } catch (e) {
    //     console.warn(e)
    //     showToast(e.message, 'danger')
    // }

    // const [tab] = await chrome.tabs.query({ currentWindow: true, active: true })
    // console.debug('tab:', tab)

    // const tabs = await chrome.tabs.query({ highlighted: true })
    // console.log('tabs:', tabs)

    // const views = chrome.extension.getViews()
    // console.log('views:', views)

    // const platform = await chrome.runtime.getPlatformInfo()
    // console.debug('platform:', platform)
}

/**
 * @function genQrCode
 * @param {string} data
 * @param {string} [image]
 * @return {QRCodeStyling}
 */
function genQrCode(data, image) {
    const dark = isDark()
    console.log('isDark:', dark)
    // TODO: Add Color Options
    const dotColor = dark ? '#ec623c' : '#fdca0f'
    const inCorner = dark ? '#ec623c' : '#fdca0f'
    const outCorner = dark ? '#fdca0f' : '#ec623c'
    const options = {
        width: 300,
        height: 300,
        type: 'canvas',
        data: data,
        image: image,
        margin: 0,
        dotsOptions: { color: dotColor, type: 'dots' },
        cornersDotOptions: { color: inCorner, type: 'dot' },
        cornersSquareOptions: { color: outCorner, type: 'extra-rounded' },
        backgroundOptions: { color: 'transparent' },
        imageOptions: { crossOrigin: 'anonymous', imageSize: 0.2, margin: 1 },
    }
    // options.qrOptions = {
    //     typeNumber: 0,
    //     mode: 'Byte',
    //     errorCorrectionLevel: 'Q',
    // }
    return new QRCodeStyling(options)
}

function isDark() {
    let theme = localStorage.getItem('theme')
    if (theme !== 'dark' && theme !== 'light') {
        theme = window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light'
    }
    console.log('theme:', theme)
    return theme === 'dark'
}
