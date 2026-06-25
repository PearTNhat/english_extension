import { BookOpen } from 'lucide-react';

export const EmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center h-48 text-center mt-10">
      <div className="w-16 h-16 bg-blue-50 text-blue-400 rounded-full flex items-center justify-center mb-4 shadow-sm border border-blue-100">
        <BookOpen size={28} />
      </div>
      <h3 className="text-slate-700 font-bold mb-1 text-lg">Chưa có từ vựng nào</h3>
      <p className="text-slate-500 text-sm max-w-[250px] leading-relaxed">
        Hãy bôi đen từ vựng trên web để dịch và lưu vào đây nhé!
      </p>
    </div>
  );
};
