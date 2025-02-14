/******/ (() => { // webpackBootstrap
/*!********************************!*\
  !*** ./content/emailEditor.js ***!
  \********************************/
// Content script for Gmail integration
const EMAIL_COMPOSER_SELECTOR = 'div[role="textbox"][aria-label*="Message Body"], div[role="textbox"][aria-label*="Body"], div[aria-label*="Message text"], .Am.Al.editable';
const DEBOUNCE_DELAY = 1000; // 1 second delay for text checking

class EmailEditor {
  constructor() {
    this.suggestions = [];
    this.observer = null;
    this.composerElement = null;
    this.isChecking = false;
    this.errorTimeout = null;
    this.selectedText = '';
    this.actionButtons = null;
    this.initialize();
  }
  initialize() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initializeAfterLoad());
    } else {
      this.initializeAfterLoad();
    }
    window.addEventListener('load', () => this.checkExistingComposers());
    window.addEventListener('hashchange', () => this.checkExistingComposers());
  }
  initializeAfterLoad() {
    this.observeEmailComposer();
    this.setupMessageListener();
    this.createStyleSheet();
    setTimeout(() => this.checkExistingComposers(), 1000);
  }
  checkExistingComposers() {
    const composers = document.querySelectorAll(EMAIL_COMPOSER_SELECTOR);
    composers.forEach(composer => {
      if (!composer.hasAttribute('data-email-assistant')) {
        composer.setAttribute('data-email-assistant', 'true');
        this.attachEditorListeners(composer);
        this.addActionButtons(composer);
      }
    });
  }
  observeEmailComposer() {
    if (this.observer) {
      this.observer.disconnect();
    }
    this.observer = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList' || mutation.type === 'subtree') {
          const composers = document.querySelectorAll(EMAIL_COMPOSER_SELECTOR);
          composers.forEach(composer => {
            if (!composer.hasAttribute('data-email-assistant')) {
              composer.setAttribute('data-email-assistant', 'true');
              this.attachEditorListeners(composer);
              this.addActionButtons(composer);
            }
          });
        }
      }
    });
    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  createStyleSheet() {
    const style = document.createElement('style');
    style.textContent = `
      .email-assistant-buttons {
        position: absolute;
        right: 10px;
        top: 5px;
        display: flex;
        gap: 8px;
        z-index: 999;
      }

      .email-assistant-button {
        background-color: #fff;
        border: 1px solid #dadce0;
        border-radius: 4px;
        color: #5f6368;
        cursor: pointer;
        font-family: 'Google Sans', Roboto, Arial, sans-serif;
        font-size: 13px;
        font-weight: 500;
        height: 32px;
        min-width: 80px;
        padding: 0 16px;
        transition: all 0.2s;
      }

      .email-assistant-button:hover {
        background-color: #f8f9fa;
        border-color: #1a73e8;
        color: #1a73e8;
      }

      .email-assistant-button:active {
        background-color: #f1f3f4;
      }

      .suggestion-overlay {
        position: fixed;
        width: 320px;
        max-height: calc(100vh - 100px);
        overflow-y: auto;
        background: white;
        border: 1px solid #dadce0;
        border-radius: 8px;
        padding: 16px;
        box-shadow: 0 2px 6px rgba(60,64,67,0.15), 0 1px 2px rgba(60,64,67,0.1);
        z-index: 1000;
        font-family: 'Google Sans',Roboto,Arial,sans-serif;
      }

      .suggestion-item {
        margin-bottom: 16px;
        padding: 12px;
        border: 1px solid #e8eaed;
        border-radius: 8px;
        background: #fff;
        transition: all 0.2s;
      }

      .suggestion-item:hover {
        border-color: #dadce0;
        box-shadow: 0 1px 3px rgba(60,64,67,0.1);
      }

      .suggestion-type {
        color: #5f6368;
        font-size: 12px;
        text-transform: uppercase;
        margin-bottom: 8px;
        font-weight: 500;
        letter-spacing: 0.5px;
      }

      .suggestion-message {
        color: #202124;
        margin: 8px 0;
        font-size: 14px;
        line-height: 20px;
      }

      .suggestion-diff {
        background: #f8f9fa;
        padding: 12px;
        border-radius: 4px;
        margin: 12px 0;
        font-family: 'Google Sans Mono', monospace;
        font-size: 13px;
      }

      .original-text {
        color: #d93025;
        text-decoration: line-through;
        margin-bottom: 6px;
      }

      .arrow {
        color: #5f6368;
        margin: 6px 0;
        font-size: 14px;
      }

      .replacement-text {
        color: #188038;
        font-weight: 500;
      }

      .suggestion-button {
        background: white;
        color: #1a73e8;
        border: 1px solid #dadce0;
        padding: 6px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 13px;
        font-weight: 500;
        margin-top: 8px;
        transition: all 0.2s;
      }

      .suggestion-button:hover {
        background: #f4f8fe;
        border-color: #1a73e8;
      }

      .suggestion-button:active {
        background: #e8f0fe;
      }
    `;
    document.head.appendChild(style);
  }
  addActionButtons(composer) {
    var _composer$closest, _composer$closest2;
    // Find Gmail's toolbar
    let toolbar = ((_composer$closest = composer.closest('.editable')) === null || _composer$closest === void 0 || (_composer$closest = _composer$closest.parentElement) === null || _composer$closest === void 0 ? void 0 : _composer$closest.querySelector('.gU.Up')) || ((_composer$closest2 = composer.closest('.Am.Al')) === null || _composer$closest2 === void 0 || (_composer$closest2 = _composer$closest2.parentElement) === null || _composer$closest2 === void 0 ? void 0 : _composer$closest2.querySelector('.gU.Up'));
    if (!toolbar) {
      // Create our own toolbar if Gmail's isn't found
      toolbar = document.createElement('div');
      toolbar.className = 'gU Up';
      toolbar.style.position = 'relative';
      composer.parentElement.insertBefore(toolbar, composer);
    }

    // Remove existing buttons if any
    const existingButtons = toolbar.querySelector('.email-assistant-buttons');
    if (existingButtons) {
      existingButtons.remove();
    }
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'email-assistant-buttons';
    const grammarButton = document.createElement('button');
    grammarButton.className = 'email-assistant-button';
    grammarButton.textContent = 'Grammar Fix';
    grammarButton.onclick = () => this.checkGrammar();
    const reorganizeButton = document.createElement('button');
    reorganizeButton.className = 'email-assistant-button';
    reorganizeButton.textContent = 'Reorganize';
    reorganizeButton.onclick = () => this.reorganizeEmail();
    buttonsContainer.appendChild(grammarButton);
    buttonsContainer.appendChild(reorganizeButton);
    toolbar.appendChild(buttonsContainer);
    this.actionButtons = buttonsContainer;
  }
  attachEditorListeners(editor) {
    editor.addEventListener('focus', e => {
      this.composerElement = e.target;
    });
  }
  async checkGrammar() {
    if (!this.composerElement || this.isChecking) return;
    const text = this.composerElement.value || this.composerElement.innerText;
    if (!text.trim()) return;
    this.isChecking = true;
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'checkText',
        text: text.trim()
      });
      if (response.error) {
        console.error('Email Assistant:', response.error);
        return;
      }
      this.suggestions = response.grammar || [];
      if (this.suggestions.length > 0) {
        this.showSuggestions();
      }
    } catch (error) {
      console.error('Email Assistant Error:', error);
    } finally {
      this.isChecking = false;
    }
  }
  async reorganizeEmail() {
    if (!this.composerElement || this.isChecking) return;
    const text = this.composerElement.value || this.composerElement.innerText;
    if (!text.trim()) return;
    this.isChecking = true;
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'checkText',
        text: text.trim()
      });
      if (response.error) {
        console.error('Email Assistant:', response.error);
        return;
      }
      this.suggestions = response.style || [];
      if (this.suggestions.length > 0) {
        this.showSuggestions();
      }
    } catch (error) {
      console.error('Email Assistant Error:', error);
    } finally {
      this.isChecking = false;
    }
  }
  createSuggestionItem(suggestion) {
    const suggestionDiv = document.createElement('div');
    suggestionDiv.className = 'suggestion-item';
    const typeDiv = document.createElement('div');
    typeDiv.className = 'suggestion-type';
    typeDiv.textContent = suggestion.type.charAt(0).toUpperCase() + suggestion.type.slice(1);
    const messageDiv = document.createElement('div');
    messageDiv.className = 'suggestion-message';
    messageDiv.textContent = suggestion.message;
    const diffDiv = document.createElement('div');
    diffDiv.className = 'suggestion-diff';
    diffDiv.innerHTML = `
      <div class="original-text">${suggestion.original}</div>
      <div class="arrow">→</div>
      <div class="replacement-text">${suggestion.replacement}</div>
    `;
    const button = document.createElement('button');
    button.className = 'suggestion-button';
    button.textContent = 'Apply Fix';
    button.onclick = () => this.applySuggestion(suggestion);
    suggestionDiv.appendChild(typeDiv);
    suggestionDiv.appendChild(messageDiv);
    suggestionDiv.appendChild(diffDiv);
    suggestionDiv.appendChild(button);
    return suggestionDiv;
  }
  showSuggestions() {
    if (!this.composerElement || !this.suggestions.length) {
      return;
    }
    const overlay = document.createElement('div');
    overlay.id = 'email-assistant-overlay';
    overlay.className = 'suggestion-overlay';
    this.suggestions.forEach(suggestion => {
      const suggestionItem = this.createSuggestionItem(suggestion);
      overlay.appendChild(suggestionItem);
    });
    this.positionOverlayNextToComposer(overlay);
  }
  positionOverlayNextToComposer(overlay) {
    this.hideSuggestions();
    if (!this.composerElement) return;

    // Get the composer's dimensions and position
    const composerRect = this.composerElement.getBoundingClientRect();
    const scrollX = window.scrollX || document.documentElement.scrollLeft;
    const scrollY = window.scrollY || document.documentElement.scrollTop;

    // Position the overlay to the right of the composer
    overlay.style.position = 'absolute';
    overlay.style.left = `${composerRect.right + scrollX + 20}px`;
    overlay.style.top = `${composerRect.top + scrollY}px`;
    document.body.appendChild(overlay);

    // Adjust position if overlay goes off screen
    const overlayRect = overlay.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // If overlay goes off the right edge, position it to the left of the composer
    if (overlayRect.right > viewportWidth) {
      overlay.style.left = `${composerRect.left + scrollX - overlayRect.width - 20}px`;
    }

    // If overlay goes off the bottom, align it with the bottom of the viewport
    if (overlayRect.bottom > viewportHeight) {
      overlay.style.top = `${Math.max(0, viewportHeight - overlayRect.height + scrollY - 20)}px`;
    }
  }
  applySuggestion(suggestion) {
    if (!this.composerElement) return;
    const text = this.composerElement.innerText;
    const newText = text.replace(suggestion.original, suggestion.replacement);
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const cursorPosition = range.startOffset;
    this.composerElement.innerText = newText;
    const newRange = document.createRange();
    newRange.setStart(this.composerElement.firstChild, cursorPosition);
    newRange.collapse(true);
    selection.removeAllRanges();
    selection.addRange(newRange);
    this.suggestions = this.suggestions.filter(s => s.original !== suggestion.original || s.message !== suggestion.message);
    if (this.suggestions.length > 0) {
      this.showSuggestions();
    } else {
      this.hideSuggestions();
    }
    const inputEvent = new Event('input', {
      bubbles: true
    });
    this.composerElement.dispatchEvent(inputEvent);
  }
  hideSuggestions() {
    const overlay = document.getElementById('email-assistant-overlay');
    if (overlay) {
      overlay.remove();
    }
  }
  setupMessageListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      switch (message.action) {
        case 'getEmailText':
          if (this.composerElement) {
            sendResponse({
              text: this.composerElement.value || this.composerElement.innerText
            });
          } else {
            sendResponse({
              error: 'No email composer found'
            });
          }
          break;
        case 'showError':
          console.error('Email Assistant:', message.error);
          sendResponse({
            success: true
          });
          break;
      }
      return true;
    });
  }
}
try {
  const initializeExtension = () => {
    if (!window.emailEditor) {
      window.emailEditor = new EmailEditor();
    }
  };
  initializeExtension();
  setTimeout(initializeExtension, 1000);
  const retryTimes = [2000, 4000, 6000];
  retryTimes.forEach(delay => {
    setTimeout(() => {
      if (!document.querySelector(EMAIL_COMPOSER_SELECTOR)) {
        initializeExtension();
      }
    }, delay);
  });
} catch (error) {
  console.error('Email Assistant: Error during initialization:', error);
}
window.addEventListener('message', event => {
  if (event.data.type === 'applySuggestion' && window.emailEditor) {
    window.emailEditor.applySuggestion(event.data.suggestion);
  }
});
/******/ })()
;
//# sourceMappingURL=emailEditor.bundle.js.map