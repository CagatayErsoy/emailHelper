/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./utils/grammarCheck.js":
/*!*******************************!*\
  !*** ./utils/grammarCheck.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   checkGrammar: () => (/* binding */ checkGrammar)
/* harmony export */ });
/* harmony import */ var _openaiService__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./openaiService */ "./utils/openaiService.js");

async function checkGrammar(text) {
  const suggestions = await (0,_openaiService__WEBPACK_IMPORTED_MODULE_0__.checkEmailWithGPT)(text);
  return suggestions.filter(suggestion => suggestion.type === 'grammar');
}

/***/ }),

/***/ "./utils/openaiService.js":
/*!********************************!*\
  !*** ./utils/openaiService.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   checkEmailWithGPT: () => (/* binding */ checkEmailWithGPT),
/* harmony export */   initializeApiKey: () => (/* binding */ initializeApiKey),
/* harmony export */   setApiKey: () => (/* binding */ setApiKey)
/* harmony export */ });
let openaiApiKey = null;
async function initializeApiKey() {
  try {
    const result = await chrome.storage.sync.get('openaiApiKey');
    openaiApiKey = result.openaiApiKey;
    return !!openaiApiKey;
  } catch (error) {
    console.error('Error initializing OpenAI API key:', error);
    return false;
  }
}
async function setApiKey(key) {
  try {
    await chrome.storage.sync.set({
      openaiApiKey: key
    });
    openaiApiKey = key;
    return true;
  } catch (error) {
    console.error('Error saving OpenAI API key:', error);
    return false;
  }
}
async function checkEmailWithGPT(text) {
  if (!openaiApiKey) {
    const hasKey = await initializeApiKey();
    if (!hasKey) {
      throw new Error('OpenAI API key not configured');
    }
  }
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{
          role: "system",
          content: `You are a professional email writing assistant. Analyze the email text for:
1. Grammar issues
2. Style improvements
3. Tone and politeness
4. Professional language

Provide suggestions in the following JSON format:
{
  "suggestions": [
    {
      "type": "grammar"|"style"|"tone",
      "message": "description of the issue",
      "original": "original text",
      "replacement": "suggested replacement"
    }
  ]
}`
        }, {
          role: "user",
          content: text
        }],
        temperature: 0.7,
        max_tokens: 1000
      })
    });
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }
    const data = await response.json();
    try {
      const suggestionText = data.choices[0].message.content;
      const suggestions = JSON.parse(suggestionText);
      return suggestions.suggestions;
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      return [];
    }
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw new Error('Failed to check email: ' + error.message);
  }
}

/***/ }),

/***/ "./utils/styleImprover.js":
/*!********************************!*\
  !*** ./utils/styleImprover.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   improveStyle: () => (/* binding */ improveStyle)
/* harmony export */ });
/* harmony import */ var _openaiService__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./openaiService */ "./utils/openaiService.js");

async function improveStyle(text) {
  const suggestions = await (0,_openaiService__WEBPACK_IMPORTED_MODULE_0__.checkEmailWithGPT)(text);
  return suggestions.filter(suggestion => suggestion.type === 'style' || suggestion.type === 'tone');
}

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!*************************************!*\
  !*** ./background/serviceWorker.js ***!
  \*************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _utils_grammarCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/grammarCheck */ "./utils/grammarCheck.js");
/* harmony import */ var _utils_styleImprover__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/styleImprover */ "./utils/styleImprover.js");
/* harmony import */ var _utils_openaiService__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/openaiService */ "./utils/openaiService.js");



let hasApiKey = false;

// Initialize context menu
chrome.runtime.onInstalled.addListener(async () => {
  console.log('Email Assistant: Extension installed');

  // Check if API key is configured
  hasApiKey = await (0,_utils_openaiService__WEBPACK_IMPORTED_MODULE_2__.initializeApiKey)();

  // Create context menu items
  chrome.contextMenus.create({
    id: 'emailAssistant',
    title: 'Email Assistant',
    contexts: ['selection']
  });
  chrome.contextMenus.create({
    id: 'checkGrammar',
    parentId: 'emailAssistant',
    title: 'Check Grammar',
    contexts: ['selection']
  });
  chrome.contextMenus.create({
    id: 'improveStyle',
    parentId: 'emailAssistant',
    title: 'Improve Writing Style',
    contexts: ['selection']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!hasApiKey) {
    chrome.tabs.sendMessage(tab.id, {
      action: 'showError',
      error: 'Please configure your OpenAI API key in the extension settings'
    });
    return;
  }
  if (!info.selectionText) {
    chrome.tabs.sendMessage(tab.id, {
      action: 'showError',
      error: 'Please select some text to check'
    });
    return;
  }
  switch (info.menuItemId) {
    case 'checkGrammar':
      processSelectedText(tab.id, info.selectionText, 'grammar');
      break;
    case 'improveStyle':
      processSelectedText(tab.id, info.selectionText, 'style');
      break;
  }
});
async function processSelectedText(tabId, text, type) {
  try {
    console.log(`Email Assistant: Processing ${type} check for selected text`);
    const suggestions = type === 'grammar' ? await (0,_utils_grammarCheck__WEBPACK_IMPORTED_MODULE_0__.checkGrammar)(text) : await (0,_utils_styleImprover__WEBPACK_IMPORTED_MODULE_1__.improveStyle)(text);
    chrome.tabs.sendMessage(tabId, {
      action: 'showSuggestions',
      suggestions
    });
  } catch (error) {
    console.error('Email Assistant Error:', error);
    chrome.tabs.sendMessage(tabId, {
      action: 'showError',
      error: `Failed to check text: ${error.message}`
    });
  }
}

// Handle messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'checkText') {
    if (!hasApiKey) {
      console.log('Email Assistant: No API key configured');
      sendResponse({
        grammar: [],
        style: [],
        error: 'OpenAI API key not configured. Please check your settings.'
      });
      return;
    }
    const text = message.text.trim();
    if (!text) {
      console.log('Email Assistant: No text provided for checking');
      sendResponse({
        grammar: [],
        style: [],
        error: 'No text provided for checking'
      });
      return;
    }
    console.log('Email Assistant: Processing text check request');
    // Process text in background
    Promise.all([(0,_utils_grammarCheck__WEBPACK_IMPORTED_MODULE_0__.checkGrammar)(text), (0,_utils_styleImprover__WEBPACK_IMPORTED_MODULE_1__.improveStyle)(text)]).then(([grammar, style]) => {
      console.log('Email Assistant: Got suggestions:', {
        grammarCount: (grammar === null || grammar === void 0 ? void 0 : grammar.length) || 0,
        styleCount: (style === null || style === void 0 ? void 0 : style.length) || 0
      });
      sendResponse({
        grammar: grammar || [],
        style: style || [],
        error: null
      });

      // Send suggestions to popup if it's open
      chrome.runtime.sendMessage({
        action: 'updateSuggestions',
        suggestions: [...(grammar || []), ...(style || [])]
      }).catch(() => {
        // Ignore error if popup is not open
      });
    }).catch(error => {
      console.error('Email Assistant Error:', error);
      let errorMessage = 'Failed to process text. ';
      if (error.message.includes('API key')) {
        errorMessage += 'Please check your OpenAI API key in the settings.';
        hasApiKey = false;
      } else if (error.message.includes('429')) {
        errorMessage += 'Too many requests. Please try again later.';
      } else if (error.message.includes('500')) {
        errorMessage += 'OpenAI service is temporarily unavailable.';
      } else {
        errorMessage += 'Please try again later.';
      }
      sendResponse({
        grammar: [],
        style: [],
        error: errorMessage
      });
    });
    return true; // Will respond asynchronously
  }
});

// Listen for API key changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes.openaiApiKey) {
    hasApiKey = !!changes.openaiApiKey.newValue;
    console.log('Email Assistant: API key', hasApiKey ? 'configured' : 'removed');
  }
});
})();

/******/ })()
;
//# sourceMappingURL=serviceWorker.bundle.js.map