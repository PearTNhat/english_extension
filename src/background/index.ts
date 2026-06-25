

/// <reference types="chrome"/>

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "ocr_translate",
    title: "📷 Khoanh vùng Dịch (OCR)",
    contexts: ["all"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "ocr_translate" && tab?.id) {
    chrome.tabs.sendMessage(tab.id, { action: "START_CROP" });
  }
});

chrome.commands.onCommand.addListener((command) => {
  if (command === "trigger_ocr") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "START_CROP" });
      }
    });
  }
});

chrome.runtime.onMessage.addListener((request: any, _sender: any, sendResponse: any) => {
  if (request.action === 'CAPTURE_SCREEN') {
    chrome.tabs.captureVisibleTab(
      { format: "jpeg", quality: 100 },
      (dataUrl) => {
        sendResponse({ dataUrl });
      }
    );
    return true; // Keep message channel open
  }

  if (request.action === 'save_vocabulary') {
    // Save to chrome.storage.local
    chrome.storage.local.get(['vocabulary'], (result) => {
      const vocabList = (result.vocabulary as any[]) || [];
      
      // Kiểm tra trùng lặp từ vựng (chỉ tính là trùng nếu cùng TỪ và cùng LOẠI TỪ)
      const isDuplicate = vocabList.some(v => 
        v.word.toLowerCase() === request.word.toLowerCase() && 
        v.pos === (request.pos || '')
      );
      if (isDuplicate) {
        sendResponse({ success: true, message: 'already_saved' });
        return;
      }

      const newWord = {
        id: Date.now().toString() + Math.random().toString(36).substring(7),
        word: request.word,
        meaning: request.meaning,
        pos: request.pos || '',
        example: request.example || '',
        createdAt: Date.now(),
        correctCount: 0,
        wrongCount: 0
      };
      
      vocabList.unshift(newWord); // Thêm vào đầu danh sách
      
      chrome.storage.local.set({ vocabulary: vocabList }, () => {
        if (chrome.runtime.lastError) {
          console.error("Error saving to local storage:", chrome.runtime.lastError);
          sendResponse({ success: false, error: chrome.runtime.lastError.message });
        } else {
          sendResponse({ success: true });
        }
      });
    });

    return true; // Keep message channel open for async response
  }
});
