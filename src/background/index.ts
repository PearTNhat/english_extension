import { initializeApp } from "firebase/app";

import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

// Initialize Firebase in background script
const firebaseConfig = {
  apiKey: "AIzaSyAK8M1wcEHV6U3lecrzKMSW1WT2zdKHV6U",
  authDomain: "learn-english-c4f49.firebaseapp.com",
  projectId: "learn-english-c4f49",
  storageBucket: "learn-english-c4f49.firebasestorage.app",
  messagingSenderId: "302158908821",
  appId: "1:302158908821:web:0acc28bc8c543f1b0dfa9c",
  measurementId: "G-8DYBWQPBTM"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

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
    // Save to Firestore anonymously
    addDoc(collection(db, 'vocabulary'), {
      userId: 'anonymous',
      word: request.word,
      meaning: request.meaning,
      pos: request.pos || '',
      example: request.example || '',
      createdAt: serverTimestamp()
    })
    .then(() => {
      sendResponse({ success: true });
    })
    .catch((error) => {
      console.error("Error saving to Firestore", error);
      sendResponse({ success: false, error: error.message });
    });

    return true; // Keep message channel open for async response
  }
});
