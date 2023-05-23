// ==UserScript==
// @name         自动添加空格，在 CJK （中日韩）字符和英文字母之间自动添加空格
// @namespace    pangu-userscript
// @version      1.3.0
// @license      MIT
// @description  在 CJK （中日韩）字符和英文字母之间自动添加空格，考虑了输入框、代码块、DOM 动态更新等情况。
// @match        http*://*/*
// @grant        none
// @require      https://unpkg.com/pangu@4.0.7/dist/browser/pangu.min.js
// ==/UserScript==

;(function () {
  'use strict'

  const ignores = ['SCRIPT', 'STYLE', 'NOSCRIPT', 'PRE', 'CODE', 'INPUT']

  const isIgnore = name => ignores.includes(name)
  const isEditable = el => el.getAttribute('contenteditable')?.toLowerCase() === 'true'

  function acceptNode(node) {
    const isAccept = isIgnore(node.tagName) || isEditable(node)
    return isAccept ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
  }

  function addSpacing() {
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_ELEMENT,
      { acceptNode },
      false
    )

    const elements = []

    while (walker.nextNode()) {
      elements.push(walker.currentNode)
    }

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
      const context = this
      const args = arguments

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
    document.addEventListener('DOMContentLoaded', () => observeDOM(observer))
  } else {
    observeDOM(observer)
  }
})()
