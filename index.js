// ==UserScript==
// @name         自动添加空格，在 CJK （中日繁）字符和英文字母之间自动添加空格
// @namespace    pangu-userscript
// @version      1.0.3
// @license      MIT
// @description  在 CJK （中日繁）字符和英文字母之间自动添加空格，考虑了代码块、动态追加内容、动态更新 DOM 等情况。
// @match        http*://*/*
// @grant        none
// ==/UserScript==
;(() => {
  window.addEventListener('load', () => {
    const panguCdnLink = 'https://unpkg.com/pangu@4.0.7/dist/browser/pangu.min.js'

    function loadScript(url) {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script')
        script.src = url
        script.onload = () => resolve()
        script.onerror = () => reject(new Error(`Failed to load script ${url}`))
        document.body.appendChild(script)
      })
    }

    async function init() {
      try {
        await loadScript(panguCdnLink)

        // 处理当前 DOM 树中的节点
        processTextNodes(document.body)

        // 创建 MutationObserver 对象，监视 DOM 树的变化
        const observer = new MutationObserver(mutationsList => {
          // 遍历 MutationRecord 列表，查找新增的 DOM 节点
          for (const mutation of mutationsList) {
            for (const addedNode of mutation.addedNodes) {
              // 如果新增的节点是元素节点，则处理它的子节点
              if (addedNode.nodeType === Node.ELEMENT_NODE) {
                processTextNodes(addedNode)
              }
            }
          }
        })

        // 配置 MutationObserver，监视子树中的节点添加、删除、属性变化等情况
        const config = { childList: true, subtree: true, attributes: true, attributeOldValue: true }
        observer.observe(document.body, config)
      } catch (err) {
        console.error(err)
      }
    }

    if (/[^\u0000-\u00ff]/.test(document.body.innerText)) {
      init()
    }

    function processTextNodes(rootNode) {
      const walker = document.createTreeWalker(rootNode, NodeFilter.SHOW_TEXT, {
        acceptNode: node =>
          /[^\s]/.test(node.textContent) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
      })

      let node
      while ((node = walker.nextNode())) {
        if (shouldSkipNode(node)) {
          continue
        }

        const preBlank = /^\s*/.exec(node.textContent)[0]
        const subBlank = /\s*$/.exec(node.textContent)[0]

        const text = node.textContent.trim()

        if (/[^\u0000-\u00ff]/.test(text)) {
          node.textContent = preBlank + pangu.spacing(text) + subBlank
        }
      }
    }

    function shouldSkipNode(node) {
      const parentTagName = node.parentNode.tagName
      if (parentTagName === 'CODE' || parentTagName === 'PRE') {
        return true
      }

      if (parentTagName === 'A') {
        const href = node.parentNode.getAttribute('href')
        if (href && href.startsWith('javascript:')) {
          return true
        }
      }

      return false
    }
  })
})()
