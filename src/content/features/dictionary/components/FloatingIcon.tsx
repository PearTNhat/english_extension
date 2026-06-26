import React from 'react';

interface FloatingIconProps {
  setFloatingRef: (node: HTMLElement | null) => void;
  floatingStyles: React.CSSProperties;
  onClick: () => void;
}

export const FloatingIcon = ({ setFloatingRef, floatingStyles, onClick }: FloatingIconProps) => {
  return (
    <div
      ref={setFloatingRef}
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      style={{ 
        ...floatingStyles,
        zIndex: 2147483647, 
        backgroundColor: 'transparent',
        borderRadius: '8px',
        width: '26px',
        height: '26px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        cursor: 'pointer',
        pointerEvents: 'auto',
        overflow: 'hidden'
      }}
    >
      <img 
        src={chrome.runtime.getURL('logo.png')} 
        alt="Translate" 
        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
      />
    </div>
  );
};
