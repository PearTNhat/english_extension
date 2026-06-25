import { useState, useMemo } from 'react';
import { Search, Filter, CheckSquare, Trash2, X } from 'lucide-react';
import { VocabCard } from './VocabCard';
import { EmptyState } from './EmptyState';
import type { Vocabulary } from '../types';

interface LibraryTabProps {
  vocabList: Vocabulary[];
  onDelete: (id: string) => void;
  onBulkDelete: (ids: Set<string>) => void;
}

export const LibraryTab = ({ vocabList, onDelete, onBulkDelete }: LibraryTabProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<'newest' | 'az' | 'hardest'>('newest');
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    setSelectedIds(new Set());
  };

  const handleToggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    if (confirm(`Bạn có chắc muốn xóa ${selectedIds.size} từ vựng này không?`)) {
      onBulkDelete(selectedIds);
      setIsSelectMode(false);
      setSelectedIds(new Set());
    }
  };

  const handleGenerateExample = async (id: string, word: string) => {
    try {
      const { generateExample } = await import('../api/gemini');
      const example = await generateExample(word);
      if (example && !example.startsWith("Đã xảy ra lỗi")) {
        const newList = vocabList.map(item => item.id === id ? { ...item, example } : item);
        chrome.storage.local.set({ vocabulary: newList });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredList = useMemo(() => {
    let list = vocabList.filter(item => 
      item.word.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.meaning.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sortMode === 'az') {
      list.sort((a, b) => a.word.localeCompare(b.word));
    } else if (sortMode === 'newest') {
      list.sort((a, b) => b.createdAt - a.createdAt);
    } else if (sortMode === 'hardest') {
      list.sort((a, b) => (b.wrongCount || 0) - (a.wrongCount || 0));
    }
    return list;
  }, [vocabList, searchQuery, sortMode]);

  const groupedVocab = useMemo(() => {
    if (sortMode !== 'az') return { 'All': filteredList };
    
    return filteredList.reduce((acc, item) => {
      const letter = item.word.charAt(0).toUpperCase();
      const groupKey = /[A-Z]/.test(letter) ? letter : '#';
      if (!acc[groupKey]) acc[groupKey] = [];
      acc[groupKey].push(item);
      return acc;
    }, {} as Record<string, Vocabulary[]>);
  }, [filteredList, sortMode]);

  return (
    <>
      <div className="space-y-4 pb-4">
        {vocabList.length > 0 && (
          <div className="sticky top-0 z-10 bg-gradient-to-br from-slate-50 to-blue-50/50 pb-2 pt-1 flex gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Tìm kiếm..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 shadow-sm transition-all"
              />
            </div>
            <div className="relative">
              <select 
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as any)}
                className="appearance-none pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-sm cursor-pointer outline-none"
              >
                <option value="newest">Mới nhất</option>
                <option value="hardest">Hay sai</option>
                <option value="az">A - Z</option>
              </select>
              <Filter size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            <button
              onClick={toggleSelectMode}
              className={`p-2 rounded-lg border transition-colors flex items-center justify-center ${isSelectMode ? 'bg-indigo-100 border-indigo-200 text-indigo-600' : 'bg-white border-slate-200 text-slate-400 hover:text-indigo-500 hover:border-indigo-200'} shadow-sm`}
              title="Chọn nhiều để xóa"
            >
              <CheckSquare size={16} />
            </button>
          </div>
        )}
        
        {filteredList.length === 0 ? (
          searchQuery ? (
            <div className="text-center text-slate-500 mt-10">Không tìm thấy từ nào phù hợp.</div>
          ) : (
            <EmptyState />
          )
        ) : (
          <div className="space-y-3 pb-2">
            {Object.entries(groupedVocab).map(([letter, items]) => (
              <div key={letter} className="space-y-2">
                {sortMode === 'az' && (
                  <div className="flex items-center gap-2 py-1">
                    <div className="w-6 h-6 rounded bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-sm">
                      {letter}
                    </div>
                    <div className="h-[1px] flex-1 bg-slate-200"></div>
                  </div>
                )}
                
                {items.map((item) => (
                  <VocabCard 
                    key={item.id} 
                    item={item} 
                    onDelete={onDelete} 
                    isSelectMode={isSelectMode}
                    isSelected={selectedIds.has(item.id)}
                    onToggleSelect={handleToggleSelect}
                    onGenerateExample={handleGenerateExample}
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {isSelectMode && (
        <div className="sticky bottom-0 -mx-4 -mb-4 mt-4 p-3 bg-white border-t border-slate-100 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] flex justify-between items-center z-20 transition-all duration-300">
          <span className="text-[13px] font-semibold text-slate-600 ml-1">Đã chọn: <span className="text-indigo-600">{selectedIds.size}</span></span>
          <div className="flex gap-2">
            <button
              onClick={toggleSelectMode}
              className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors flex items-center gap-1.5"
            >
              <X size={14} /> Hủy
            </button>
            <button
              onClick={handleDeleteSelected}
              disabled={selectedIds.size === 0}
              className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm font-bold hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <Trash2 size={14} /> Xóa
            </button>
          </div>
        </div>
      )}
    </>
  );
};
