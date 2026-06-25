import React, { useState, useEffect } from 'react';

interface Props {
  onCapture: (rect: { x: number, y: number, width: number, height: number }) => void;
  onCancel: () => void;
}

export const CropOverlay = ({ onCapture, onCancel }: Props) => {
  const [startPos, setStartPos] = useState<{ x: number, y: number } | null>(null);
  const [currentPos, setCurrentPos] = useState<{ x: number, y: number } | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setStartPos({ x: e.clientX, y: e.clientY });
    setCurrentPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (startPos) {
      setCurrentPos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    if (startPos && currentPos) {
      const x = Math.min(startPos.x, currentPos.x);
      const y = Math.min(startPos.y, currentPos.y);
      const width = Math.abs(currentPos.x - startPos.x);
      const height = Math.abs(currentPos.y - startPos.y);

      // Require a minimum size to avoid accidental clicks
      if (width > 10 && height > 10) {
        onCapture({ x, y, width, height });
      } else {
        onCancel();
      }
    } else {
      onCancel();
    }
  };

  const getRectStyles = () => {
    if (!startPos || !currentPos) return {};
    const left = Math.min(startPos.x, currentPos.x);
    const top = Math.min(startPos.y, currentPos.y);
    const width = Math.abs(currentPos.x - startPos.x);
    const height = Math.abs(currentPos.y - startPos.y);
    return { left, top, width, height };
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
        cursor: 'crosshair',
        zIndex: 2147483647,
        pointerEvents: 'auto'
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'black',
        color: 'white',
        padding: '8px 16px',
        borderRadius: '20px',
        fontSize: '14px',
        pointerEvents: 'none'
      }}>
        Kéo chuột để khoanh vùng chữ cần dịch (Nhấn ESC để hủy)
      </div>

      {startPos && currentPos && (
        <div
          style={{
            position: 'absolute',
            border: '2px dashed white',
            backgroundColor: 'rgba(255,255,255,0.1)',
            pointerEvents: 'none',
            ...getRectStyles()
          }}
        />
      )}
    </div>
  );
};
