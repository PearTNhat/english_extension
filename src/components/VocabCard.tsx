import { Trash2 } from 'lucide-react';
import type { Vocabulary } from '../types';
import { getPosColor } from '../utils';

interface VocabCardProps {
  item: Vocabulary;
  onDelete: (id: string) => void;
  isSelectMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
}

export const VocabCard = ({ item, onDelete, isSelectMode, isSelected, onToggleSelect }: VocabCardProps) => {
  // Extract the main meaning nicely
  const mainMeaning = item.meaning.includes('🎯') 
    ? item.meaning.split('\n')[0].replace('🎯 Nghĩa chính: ', '') 
    : item.meaning.split('\n')[0];

  // Extract example sentence nicely if it exists
  let engExample = '';
  let vieExample = '';
  if (item.example) {
    const lines = item.example.split('\n');
    const exLine = lines.find(l => l.startsWith('Ví dụ:'));
    const transLine = lines.find(l => l.startsWith('Dịch:'));
    if (exLine) engExample = exLine.replace('Ví dụ:', '').trim();
    if (transLine) vieExample = transLine.replace('Dịch:', '').trim();
  }

  return (
    <div 
      className={`group bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow-sm border hover:shadow-lg transition-all duration-300 relative overflow-hidden ${
        isSelectMode 
          ? 'cursor-pointer hover:border-indigo-300 ' + (isSelected ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200')
          : 'border-slate-100 hover:border-indigo-200 hover:-translate-y-0.5'
      }`}
      onClick={() => isSelectMode && onToggleSelect && onToggleSelect(item.id)}
    >
      {!isSelectMode && <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>}
      <div className="flex justify-between items-start mb-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-extrabold text-[16px] text-slate-800 tracking-tight">{item.word}</h3>
          {item.pos && (
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border ${getPosColor(item.pos)}`}>
              {item.pos}
            </span>
          )}
        </div>
        {isSelectMode ? (
          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors mt-0.5 ${isSelected ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300'}`}>
            {isSelected && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
          </div>
        ) : (
          <button 
            onClick={() => onDelete(item.id)}
            className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-1 rounded-md transition-colors opacity-0 group-hover:opacity-100"
            title="Xóa từ này"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
      
      <div className="text-[14px] text-slate-600 font-medium mb-2 leading-snug">
        {mainMeaning}
      </div>
      
      {engExample && (
        <div className="bg-slate-50/80 p-2.5 rounded-lg border border-slate-100 text-sm">
          <p className="text-slate-700 font-semibold italic mb-0.5">"{engExample}"</p>
          {vieExample && (
            <p className="text-slate-500 text-[12px]">{vieExample}</p>
          )}
        </div>
      )}
    </div>
  );
};
