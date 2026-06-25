import { useState, useEffect } from 'react';
import { useFloating, offset, flip, shift, autoUpdate } from '@floating-ui/react';
import { FloatingIcon } from './features/dictionary/components/FloatingIcon';
import { TranslationPopover } from './features/dictionary/components/TranslationPopover';
import { CropOverlay } from './features/dictionary/components/CropOverlay';
import { extractTextFromImage } from '../api/gemini';

export const ContentApp = () => {
  const [selectedText, setSelectedText] = useState('');
  const [selectedRange, setSelectedRange] = useState<Range | null>(null);
  const [anchorPos, setAnchorPos] = useState<{ x: number, y: number } | null>(null);
  const [showIcon, setShowIcon] = useState(false);
  const [showPopover, setShowPopover] = useState(false);
  const [isCropping, setIsCropping] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);

  // Floating UI configuration for Icon
  const { refs: iconRefs, floatingStyles: iconStyles } = useFloating({
    strategy: 'fixed',
    placement: 'bottom-end',
    whileElementsMounted: autoUpdate,
    middleware: [offset(5), flip(), shift({ padding: 12 })]
  });

  // Floating UI configuration for Popover
  const { refs: popoverRefs, floatingStyles: popoverStyles } = useFloating({
    strategy: 'fixed',
    placement: 'bottom-start',
    whileElementsMounted: autoUpdate,
    middleware: [offset(10), flip(), shift({ padding: 12 })]
  });

  // Attach Virtual Element (text selection or anchor) to Floating UI
  useEffect(() => {
    if (selectedRange) {
      const virtualEl = {
        getBoundingClientRect: () => selectedRange.getBoundingClientRect(),
        getClientRects: () => selectedRange.getClientRects()
      };
      if (showIcon) iconRefs.setReference(virtualEl);
      if (showPopover) popoverRefs.setReference(virtualEl);
    } else if (anchorPos) {
      const virtualEl = {
        getBoundingClientRect: () => ({
          x: anchorPos.x,
          y: anchorPos.y,
          width: 0,
          height: 0,
          top: anchorPos.y,
          right: anchorPos.x,
          bottom: anchorPos.y,
          left: anchorPos.x,
        } as DOMRect),
        getClientRects: () => [] as unknown as DOMRectList
      };
      if (showPopover) popoverRefs.setReference(virtualEl);
    }
  }, [selectedRange, anchorPos, showIcon, showPopover, iconRefs, popoverRefs]);

  // Listen for START_CROP message from background
  useEffect(() => {
    const messageListener = (msg: any) => {
      if (msg.action === 'START_CROP') {
        setIsCropping(true);
        setShowPopover(false);
        setShowIcon(false);
        setSelectedRange(null);
      }
    };
    chrome.runtime.onMessage.addListener(messageListener);
    return () => chrome.runtime.onMessage.removeListener(messageListener);
  }, []);

  useEffect(() => {
    const handleMouseUp = (e: MouseEvent) => {
      // Don't hide if clicking inside our own components
      if (
        iconRefs.floating.current?.contains(e.target as Node) || 
        popoverRefs.floating.current?.contains(e.target as Node)
      ) {
        return;
      }

      // Hide popover if clicking outside
      if (showPopover) {
        setShowPopover(false);
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
      }

      // Small delay to let double-click selections settle
      setTimeout(() => {
        const selection = window.getSelection();
        const text = selection?.toString().trim();
        
        if (text && text.length > 0 && selection?.rangeCount) {
          const range = selection.getRangeAt(0);
          setSelectedRange(range);
          setAnchorPos(null);
          setSelectedText(text);
          setShowIcon(true);
          setShowPopover(false);
        } else {
          setShowIcon(false);
          // Only clear range if not showing popover to prevent jump
          if (!showPopover) {
            setSelectedRange(null);
            setAnchorPos(null);
          }
        }
      }, 10);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Shortcut cho OCR: Alt + V
      if (e.altKey && e.key.toLowerCase() === 'v') {
        setIsCropping(true);
        setShowPopover(false);
        setShowIcon(false);
        setSelectedRange(null);
        return;
      }

      // Shortcut cho dịch nhanh: Shift
      if (e.key === 'Shift') {
        const selection = window.getSelection();
        const text = selection?.toString().trim();
        
        if (text && text.length > 0 && selection?.rangeCount) {
          const range = selection.getRangeAt(0);
          setSelectedRange(range);
          setAnchorPos(null);
          setSelectedText(text);
          setShowIcon(false);
          setShowPopover(true);
        }
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showPopover, iconRefs, popoverRefs]);

  const handleIconClick = () => {
    setShowIcon(false);
    setShowPopover(true);
  };

  const handleCapture = (rect: { x: number, y: number, width: number, height: number }) => {
    setIsCropping(false);
    
    // Wait for overlay to disappear
    setTimeout(() => {
      chrome.runtime.sendMessage({ action: 'CAPTURE_SCREEN' }, async (response) => {
        if (response && response.dataUrl) {
          try {
            const img = new Image();
            img.onload = async () => {
              const canvas = document.createElement('canvas');
              canvas.width = rect.width;
              canvas.height = rect.height;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                const scale = window.devicePixelRatio || 1;
                ctx.drawImage(
                  img,
                  rect.x * scale, rect.y * scale, rect.width * scale, rect.height * scale,
                  0, 0, rect.width, rect.height
                );
                const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.9);
                
                // Show popover exactly where user drew the box
                setAnchorPos({ x: rect.x + rect.width / 2, y: rect.y + rect.height });
                setSelectedText("");
                setIsExtracting(true);
                setShowPopover(true);
                
                // Call Gemini API
                const text = await extractTextFromImage(croppedDataUrl);
                setIsExtracting(false);
                if (text) {
                  setSelectedText(text);
                } else {
                  setSelectedText("Không nhận diện được chữ nào trong ảnh.");
                }
              }
            };
            img.src = response.dataUrl;
          } catch (e) {
            console.error("Crop error", e);
          }
        }
      });
    }, 150);
  };

  return (
    <div style={{ pointerEvents: 'none' }}>
      {isCropping && (
        <CropOverlay 
          onCapture={handleCapture}
          onCancel={() => setIsCropping(false)}
        />
      )}

      {showIcon && (
        <FloatingIcon 
          setFloatingRef={iconRefs.setFloating}
          floatingStyles={iconStyles}
          onClick={handleIconClick}
        />
      )}

      {showPopover && (
        <>
          {/* Backdrop for PDF viewer where mousedown on embed doesn't bubble to document */}
          {(document.contentType === 'application/pdf' || document.querySelector('embed[type="application/pdf"]')) && (
            <div 
              style={{ position: 'fixed', inset: 0, zIndex: 2147483646, pointerEvents: 'auto' }} 
              onMouseDown={() => {
                setShowPopover(false);
                if ('speechSynthesis' in window) window.speechSynthesis.cancel();
              }}
            />
          )}
          <TranslationPopover 
            text={selectedText}
            setFloatingRef={popoverRefs.setFloating}
            floatingStyles={popoverStyles}
            isExtracting={isExtracting}
            onClose={() => setShowPopover(false)}
          />
        </>
      )}
    </div>
  );
};
