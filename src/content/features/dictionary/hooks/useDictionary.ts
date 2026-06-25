import { useState, useEffect } from 'react';
import { translateText, generateExample } from '../../../../api/gemini';

export function useDictionary(text: string) {
  const [translation, setTranslation] = useState('');
  const [example, setExample] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isGeneratingExample, setIsGeneratingExample] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (!text) return;
    let isMounted = true;
    
    const fetchTranslation = async () => {
      setIsTranslating(true);
      const result = await translateText(text);
      if (isMounted) {
        setTranslation(result);
        setIsTranslating(false);
      }
    };
    
    fetchTranslation();
    return () => { isMounted = false; };
  }, [text]);

  const handleGenerateExample = async () => {
    if (isGeneratingExample || example) return;
    setIsGeneratingExample(true);
    const result = await generateExample(text);
    setExample(result);
    setIsGeneratingExample(false);
  };

  const handleSave = () => {
    setIsSaved(true);
    /// <reference types="chrome"/>
    chrome.runtime.sendMessage({
      action: 'save_vocabulary',
      word: text,
      meaning: translation
    }, (response: any) => {
      if (!response || !response.success) {
        console.error("Save failed:", response?.error);
        alert("Lưu thất bại. Bạn đã đăng nhập ở Popup chưa?");
        setIsSaved(false);
      }
    });
  };

  const handlePlayAudio = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Trình duyệt của bạn không hỗ trợ phát âm thanh.");
    }
  };

  return {
    translation,
    example,
    isTranslating,
    isGeneratingExample,
    isSaved,
    handleGenerateExample,
    handleSave,
    handlePlayAudio
  };
}
