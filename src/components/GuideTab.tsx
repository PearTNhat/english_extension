import { BookOpen, MousePointer2, Keyboard, Image as ImageIcon, BookmarkPlus, Gamepad2 } from 'lucide-react';

export const GuideTab = () => {
  return (
    <div className="space-y-4">
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
