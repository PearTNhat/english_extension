import React from 'react';
import { Loader2, Save, Check, Volume2, Search, Sparkles } from 'lucide-react';
import { useDictionary } from '../hooks/useDictionary';

interface TranslationPopoverProps {
  text: string;
  setFloatingRef: (node: HTMLElement | null) => void;
  floatingStyles: React.CSSProperties;
  isExtracting?: boolean;
  onClose: () => void;
}

export const TranslationPopover = ({ text, setFloatingRef, floatingStyles, isExtracting, onClose }: TranslationPopoverProps) => {
  const {
    translation,
    example,
    isTranslating,
    isGeneratingExample,
    isSaved,
    handleGenerateExample,
    handleSave,
    handlePlayAudio
  } = useDictionary(text);

  const renderTranslation = (text: string) => {
    if (!text) return null;
    
    // Nếu không có phần chi tiết từ loại (chỉ có chữ bình thường)
    if (!text.includes('📚')) return <div>{text}</div>;
    
    const [mainMeaning, detailsPart] = text.split('\n\n📚');
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ 
          backgroundColor: '#eff6ff', 
          padding: '10px 12px', 
          borderRadius: '6px', 
          borderLeft: '4px solid #3b82f6',
          color: '#1e3a8a',
          fontWeight: 500
        }}>
          {mainMeaning}
        </div>
        
        {detailsPart && (
          <div style={{ padding: '0 4px' }}>
            <div style={{ fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
              📚 {detailsPart.split(':\n')[0]}
            </div>
            <div style={{ color: '#334155', paddingLeft: '8px', lineHeight: '1.7' }}>
              {detailsPart.split(':\n')[1]}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderExample = (text: string) => {
    if (!text) return null;
    
    const lines = text.split('\n');
    return (
      <div style={{ 
        backgroundColor: '#f0fdfa', 
        border: '1px solid #ccfbf1', 
        borderRadius: '8px', 
        padding: '14px',
        marginTop: '16px',
        boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.02)'
      }}>
        <div style={{ fontWeight: 600, color: '#0f766e', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles size={16} /> Phân tích chuyên sâu
        </div>
        
        {lines.map((line, idx) => {
          if (line.startsWith('Ví dụ:')) {
            return (
              <div key={idx} style={{ marginBottom: '8px', lineHeight: '1.6' }}>
                <span style={{ fontWeight: 600, color: '#134e4a' }}>Ví dụ:</span> 
                <span style={{ fontStyle: 'italic', color: '#1e293b', marginLeft: '6px' }}>
                  "{line.replace('Ví dụ:', '').trim()}"
                </span>
              </div>
            );
          }
          if (line.startsWith('Dịch:')) {
            return (
              <div key={idx} style={{ marginBottom: '8px', color: '#334155', lineHeight: '1.6' }}>
                <span style={{ fontWeight: 600 }}>Dịch:</span> 
                <span style={{ marginLeft: '6px' }}>{line.replace('Dịch:', '').trim()}</span>
              </div>
            );
          }
          if (line.startsWith('Word Family:')) {
            return (
              <div key={idx} style={{ 
                marginTop: '12px', 
                paddingTop: '12px', 
                borderTop: '1px dashed #99f6e4', 
                color: '#1e293b',
                lineHeight: '1.6'
              }}>
                <span style={{ fontWeight: 600, color: '#0f766e' }}>Word Family:</span> 
                <span style={{ marginLeft: '6px' }}>{line.replace('Word Family:', '').trim()}</span>
              </div>
            );
          }
          return <div key={idx} style={{ marginBottom: '4px' }}>{line}</div>;
        })}
      </div>
    );
  };

  if (isExtracting) {
    return (
      <div
        ref={setFloatingRef}
        style={{ 
          ...floatingStyles,
          zIndex: 2147483647,
          backgroundColor: 'white',
          padding: '16px',
          borderRadius: '12px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0',
          width: '340px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          pointerEvents: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100px',
          color: '#3b82f6'
        }}
      >
        <Loader2 size={24} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
        <span style={{ marginLeft: '10px', fontWeight: 500, color: '#334155' }}>Đang trích xuất chữ từ ảnh...</span>
      </div>
    );
  }

  return (
    <div
      ref={setFloatingRef}
      style={{ 
        ...floatingStyles,
        zIndex: 2147483647,
        backgroundColor: 'white',
        color: '#1e293b',
        padding: '16px',
        borderRadius: '12px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e2e8f0',
        width: '340px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        pointerEvents: 'auto'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', paddingBottom: '14px', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden', flex: 1 }}>
          <h3 style={{ 
            fontWeight: '700', 
            fontSize: '18px', 
            margin: 0, 
            color: '#0f172a',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '180px'
          }} title={text}>
            {text}
          </h3>
          <button
            onClick={handlePlayAudio}
            style={{
              background: '#f1f5f9',
              border: 'none',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '50%',
              color: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              transition: 'background 0.2s'
            }}
            title="Nghe phát âm"
          >
            <Volume2 size={16} />
          </button>
        </div>
        
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={handleGenerateExample}
            disabled={isTranslating || isGeneratingExample || !!example}
            style={{
              padding: '8px',
              backgroundColor: '#fef08a',
              border: 'none',
              borderRadius: '8px',
              cursor: (isTranslating || isGeneratingExample || !!example) ? 'default' : 'pointer',
              opacity: (isTranslating || isGeneratingExample || !!example) ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            title="Tra cứu chuyên sâu (Ví dụ & Từ loại)"
          >
            <Search size={16} color="#a16207" />
          </button>
          <button 
            onClick={handleSave}
            disabled={isTranslating || isSaved}
            style={{
              padding: '8px',
              backgroundColor: isSaved ? '#dcfce7' : '#f1f5f9',
              border: 'none',
              borderRadius: '8px',
              cursor: (isTranslating || isSaved) ? 'default' : 'pointer',
              opacity: (isTranslating || isSaved) ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            title={isSaved ? "Đã lưu" : "Lưu từ vựng"}
          >
            {isSaved ? <Check size={16} color="#15803d" /> : <Save size={16} color="#475569" />}
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '8px',
              backgroundColor: '#fee2e2',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#b91c1c',
              transition: 'all 0.2s'
            }}
            title="Đóng (Esc)"
          >
            <span style={{ fontSize: '14px', fontWeight: 'bold', lineHeight: 1 }}>✕</span>
          </button>
        </div>
      </div>
      
      {/* Body */}
      <div style={{ minHeight: '60px', fontSize: '15px', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
        {isTranslating ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', height: '80px' }}>
            <Loader2 size={24} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ marginLeft: '10px', fontWeight: 500 }}>Đang dịch...</span>
          </div>
        ) : (
          <div 
            className="custom-scrollbar"
            style={{
            color: '#334155',
            fontSize: '14px',
            maxHeight: '380px',
            overflowY: 'auto',
          }}>
            {renderTranslation(translation)}
            
            {isGeneratingExample && (
              <div style={{ 
                marginTop: '16px', 
                color: '#0f766e', 
                display: 'flex', 
                alignItems: 'center',
                backgroundColor: '#f0fdfa',
                padding: '12px',
                borderRadius: '8px',
                border: '1px dashed #99f6e4'
              }}>
                <Loader2 size={18} className="animate-spin" style={{ marginRight: '8px', animation: 'spin 1s linear infinite' }} />
                <span style={{ fontWeight: 500 }}>Đang phân tích chuyên sâu...</span>
              </div>
            )}
            
            {renderExample(example)}
          </div>
        )}
      </div>
    </div>
  );
};
