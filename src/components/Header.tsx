import { Library, Gamepad2, HelpCircle } from 'lucide-react';

interface HeaderProps {
  vocabCount: number;
  currentTab: 'library' | 'practice' | 'guide';
  onTabChange: (tab: 'library' | 'practice' | 'guide') => void;
}

export const Header = ({ vocabCount, currentTab, onTabChange }: HeaderProps) => {
  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-white shadow-sm flex flex-col sticky top-0 z-10">
      <div className="p-4 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-blue-600 to-indigo-500 text-white p-2 rounded-xl shadow-blue-200 shadow-lg">
            <Library size={20} />
          </div>
          <div>
            <h1 className="font-bold text-[17px] text-slate-800 leading-tight">Từ vựng của tôi</h1>
            <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">{vocabCount} từ đã lưu</p>
          </div>
        </div>
        <button
          onClick={() => onTabChange('guide')}
          className={`p-2 rounded-full transition-colors ${currentTab === 'guide' ? 'bg-blue-100 text-blue-600' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}
          title="Hướng dẫn sử dụng"
        >
          <HelpCircle size={20} />
        </button>
      </div>
      
      <div className="flex border-t border-slate-100">
        <button 
          onClick={() => onTabChange('library')}
          className={`flex-1 py-2.5 text-[13px] font-bold flex items-center justify-center gap-2 transition-colors ${currentTab === 'library' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
        >
          <Library size={16} /> Thư Viện
        </button>
        <button 
          onClick={() => onTabChange('practice')}
          className={`flex-1 py-2.5 text-[13px] font-bold flex items-center justify-center gap-2 transition-colors ${currentTab === 'practice' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
        >
          <Gamepad2 size={16} /> Luyện Tập
        </button>
      </div>
    </header>
  );
};
