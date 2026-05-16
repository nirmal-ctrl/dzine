/// <reference types="chrome" />

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'IMAGE_SELECTED') {
    chrome.storage.local.set({ 
      pending_crop: {
        dataUrl: message.src,
        timestamp: Date.now()
      }
    });
  }
});
