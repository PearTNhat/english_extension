import { useState, useEffect } from 'react';
import { translateText, generateExample } from '../../../../api/gemini';

export function useDictionary(text: string) {
  const [translation, setTranslation] = useState('');
  const [pos, setPos] = useState('');
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
        setTranslation(result.text);
        setPos(result.pos || '');
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
    try {
      chrome.runtime.sendMessage({
        action: 'save_vocabulary',
        word: text,
        meaning: translation,
        pos: pos
      }, (response: any) => {
        if (chrome.runtime.lastError) {
          console.error("Lỗi:", chrome.runtime.lastError);
          alert("Extension vừa được cập nhật. Vui lòng tải lại trang web này (F5) để tiếp tục lưu từ vựng!");
          setIsSaved(false);
          return;
        }
        if (!response || !response.success) {
          console.error("Save failed:", response?.error);
          alert("Lưu thất bại. Vui lòng thử lại.");
          setIsSaved(false);
        }
      });
    } catch (error) {
      console.error("Context Error:", error);
      alert("Extension vừa được cập nhật. Vui lòng tải lại trang web này (F5) để kết nối lại!");
      setIsSaved(false);
    }
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
