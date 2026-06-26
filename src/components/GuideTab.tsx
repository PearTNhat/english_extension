import { useState, useEffect } from 'react';
import { BookOpen, MousePointer2, Keyboard, Image as ImageIcon, BookmarkPlus, Gamepad2, Settings } from 'lucide-react';

export const GuideTab = () => {
  const [useShift, setUseShift] = useState(true);

  useEffect(() => {
    chrome.storage.local.get(['useShiftToTranslate'], (result) => {
      if (result.useShiftToTranslate !== undefined) {
        setUseShift(result.useShiftToTranslate as boolean);
      }
    });
  }, []);

  const toggleShift = () => {
    const newValue = !useShift;
    setUseShift(newValue);
    chrome.storage.local.set({ useShiftToTranslate: newValue });
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <h2 className="text-[17px] font-bold text-slate-800 mb-3 flex items-center gap-2">
          <Settings size={18} className="text-slate-500" />
          Cài đặt
        </h2>
        
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[15px] font-semibold text-slate-700">Dịch nhanh bằng phím Shift</h3>
            <p className="text-[13px] text-slate-500 mt-0.5">Bôi đen và nhấn Shift để dịch ngay lập tức.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer ml-4">
            <input type="checkbox" className="sr-only peer" checked={useShift} onChange={toggleShift} />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <h2 className="text-[17px] font-bold text-slate-800 mb-3 flex items-center gap-2">
          <BookOpen size={18} className="text-blue-500" />
          Hướng dẫn sử dụng
        </h2>
        
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="mt-0.5">
              <MousePointer2 size={16} className="text-indigo-500" />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-slate-700">Dịch văn bản thông thường</h3>
              <p className="text-[14px] text-slate-500 mt-1">
                Bôi đen đoạn văn bản cần dịch. Một biểu tượng sẽ hiện ra, click vào đó để xem bản dịch.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="mt-0.5">
              <Keyboard size={16} className="text-emerald-500" />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-slate-700">Dịch nhanh bằng phím tắt</h3>
              <p className="text-[14px] text-slate-500 mt-1">
                Bôi đen đoạn văn bản và nhấn phím <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded-md text-[13px] font-mono text-slate-700">Shift</kbd> để dịch ngay lập tức (không cần click chuột).
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="mt-0.5">
              <ImageIcon size={16} className="text-purple-500" />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-slate-700">Dịch chữ trong ảnh (OCR)</h3>
              <p className="text-[14px] text-slate-500 mt-1">
                Nhấn tổ hợp phím <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded-md text-[13px] font-mono text-slate-700">Alt + V</kbd> hoặc click chuột phải vào trang web, chọn <strong>"📷 Khoanh vùng Dịch (OCR)"</strong>. Sau đó kéo thả chuột để chọn vùng hình ảnh chứa chữ cần dịch.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="mt-0.5">
              <BookmarkPlus size={16} className="text-amber-500" />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-slate-700">Lưu từ vựng</h3>
              <p className="text-[14px] text-slate-500 mt-1">
                Trong khung bản dịch, nhấn vào nút lưu để thêm từ vào Thư viện. Bạn có thể xem lại tại tab <strong>Thư Viện</strong>.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="mt-0.5">
              <Gamepad2 size={16} className="text-rose-500" />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-slate-700">Luyện tập</h3>
              <p className="text-[14px] text-slate-500 mt-1">
                Chuyển sang tab <strong>Luyện Tập</strong> để ôn lại các từ vựng đã lưu qua các bài tập trắc nghiệm.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-center pb-2">
        <p className="text-[13px] text-slate-400">
          Cảm ơn bạn đã sử dụng tiện ích!
        </p>
      </div>
    </div>
  );
};
