// JS for popup.html

import {
    checkPerms,
    debounce,
    grantPerms,
    injectFunction,
    isDark,
    linkClick,
    saveOptions,
    updateManifest,
    updateOptions,
    updatePlatform,
} from './export.js'
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

    // Check Host Permissions
    const hasPerms = await checkPerms()
    if (!hasPerms) {
        console.log('%cHost Permissions Not Granted', 'color: Red')
    }

    // Get Site Info
    // TODO: Create a single function to inject and remove from content-script
    const siteInfo = await injectFunction(getSiteInfo)
    console.debug('siteInfo:', siteInfo)
    if (!siteInfo) {
        document
            .querySelectorAll('.tab-perms')
            .forEach((el) => el.classList.add('d-none'))
        return console.log('%cNo Site Info', 'color: Orange')
    }

    // Process Data
    console.debug('siteInfo.href:', siteInfo.href)
    console.debug('siteInfo.favicon:', siteInfo.favicon)
    hostnameInput.value = siteInfo.href
    hostnameInput.setSelectionRange(0, hostnameInput.value.length)
    await genQrCode(siteInfo.href, siteInfo.favicon)
    // qrCodeEl.querySelector('svg').classList.add('img-fluid')
}

async function inputChange(event) {
    console.debug('inputChange:', event)
    qrCodeEl.innerHTML = ''
    await genQrCode(hostnameInput.value)
}

/**
 * @function genQrCode
 * @param {string} data
 * @param {string} [image]
 * @return {QRCodeStyling}
 */
async function genQrCode(data, image) {
    const { options } = await chrome.storage.sync.get(['options'])
    console.log('genQrCode:', options)
    // const dark = isDark()
    // console.log('isDark:', dark)
    // const dotColor = dark ? '#fdca0f' : '#ec623c'
    // const outCorner = dark ? '#ec623c' : '#fdca0f'
    // const inCorner = dark ? '#fdca0f' : '#ec623c'
    const styleOptions = {
        width: 300,
        height: 300,
        type: 'canvas',
        data: data,
        image: image,
        margin: 0,
        dotsOptions: { color: options.dotsColor, type: 'dots' },
        cornersDotOptions: { color: options.innerCorner, type: 'dot' },
        cornersSquareOptions: {
            color: options.outCorner,
            type: 'extra-rounded',
        },
        backgroundOptions: { color: isDark() ? '#212429' : '#fff' },
        imageOptions: { crossOrigin: 'anonymous', imageSize: 0.2, margin: 1 },
    }
    // styleOptions.qrOptions = {
    //     typeNumber: 0,
    //     mode: 'Byte',
    //     errorCorrectionLevel: 'Q',
    // }
    const qrCode = new QRCodeStyling(styleOptions)
    qrCode.append(qrCodeEl)
    qrCodeEl.onclick = () => {
        qrCode.download({ name: 'qr-code', extension: 'png' })
    }
}

function getSiteInfo() {
    const links = Array.from(document.querySelectorAll('link[rel~="icon"]'))
        .map((link) => {
            const size = link.getAttribute('sizes')
            const sizeValue = size ? parseInt(size.split('x')[0]) : 0
            return { href: link.href, size: sizeValue }
        })
        .sort((a, b) => b.size - a.size)
    let favicon
    if (links.length > 0) {
        favicon = links[0].href
    } else {
        favicon = `${location.origin}/favicon.ico`
    }
    return { ...window.location, favicon }
}
