// ==UserScript==
// @name         自动添加空格，在 CJK （中日繁）字符和英文字母之间自动添加空格
// @namespace    pangu-userscript
// @version      1.1.0
// @license      MIT
// @description  在 CJK （中日繁）字符和英文字母之间自动添加空格，考虑了代码块、DOM 动态更新等情况。
// @match        http*://*/*
// @grant        none
// ==/UserScript==

;(function () {
  'use strict'

  function addSpacing() {
    const elements = document.querySelectorAll(
      'body *:not(script):not(style):not(noscript):not(pre):not(code)'
    )
    elements.forEach(element => {
      if (element.childNodes.length === 1 && element.childNodes[0].nodeType === Node.TEXT_NODE) {
        const originalText = element.textContent
        const newText = pangu.spacing(originalText)
        if (originalText !== newText) {
          element.textContent = newText
        }
      }
    })
  }

  function observeDOM(observer) {
    observer.observe(document.body, { childList: true, subtree: true })
  }

  function debounce(func, wait, immediate) {
    let timeout
    return function () {
      const context = this,
        args = arguments
      const later = function () {
        timeout = null
        if (!immediate) func.apply(context, args)
      }
      const callNow = immediate && !timeout
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
      if (callNow) func.apply(context, args)
    }
  }

  const addSpacingDebounced = debounce(addSpacing, 300)

  // Run once when the script is loaded
  addSpacing()

  // Run every time the content of the page is changed
  const observer = new MutationObserver(() => {
    requestAnimationFrame(() => {
      addSpacingDebounced()
    })
  })

  // Start observing when the DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      observeDOM(observer)
    })
  } else {
    observeDOM(observer)
  }
})()
