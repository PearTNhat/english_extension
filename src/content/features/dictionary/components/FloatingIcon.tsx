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
        backgroundColor: '#2563eb',
        color: 'white',
        borderRadius: '50%',
        width: '36px',
        height: '36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
        cursor: 'pointer',
        pointerEvents: 'auto'
      }}
    >
      <span style={{ fontSize: '18px', lineHeight: 1 }}>🌍</span>
    </div>
  );
};
