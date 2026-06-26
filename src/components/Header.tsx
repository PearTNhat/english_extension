import { Library, Gamepad2, HelpCircle, User as UserIcon } from 'lucide-react';
import type { User } from 'firebase/auth';

interface HeaderProps {
  vocabCount: number;
  currentTab: 'library' | 'practice' | 'guide' | 'profile';
  onTabChange: (tab: 'library' | 'practice' | 'guide' | 'profile') => void;
  user: User | null;
}

export const Header = ({ vocabCount, currentTab, onTabChange, user }: HeaderProps) => {
  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-white shadow-sm flex flex-col sticky top-0 z-10">
      <div className="p-4 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="font-black text-[24px] bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent leading-none tracking-tight pb-0.5">Sun</h1>
            <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider mt-0.5">{vocabCount} từ đã lưu</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onTabChange('profile')}
            className={`p-1.5 rounded-full transition-colors ${currentTab === 'profile' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}
            title="Tài khoản"
          >
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Avatar" className="w-6 h-6 rounded-full" />
            ) : (
              <UserIcon size={20} className="m-0.5" />
            )}
          </button>
          <button
            onClick={() => onTabChange('guide')}
            className={`p-2 rounded-full transition-colors ${currentTab === 'guide' ? 'bg-blue-100 text-blue-600' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}
            title="Hướng dẫn sử dụng"
          >
            <HelpCircle size={20} />
          </button>
        </div>
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
