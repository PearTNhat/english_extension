import { useState, useEffect } from 'react';
import { Loader2, Trophy, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Vocabulary } from '../types';
import { generateQuizBatch, type QuizItem } from '../api/gemini';
import { getPosColor } from '../utils';

interface PracticeGameProps {
  vocabList: Vocabulary[];
}

export const PracticeGame = ({ vocabList }: PracticeGameProps) => {
  const [quizItems, setQuizItems] = useState<QuizItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);

  // Lấy ra câu chính của nghĩa tiếng việt
  const getMainMeaning = (meaning: string) => {
    return meaning.includes('🎯') 
      ? meaning.split('\n')[0].replace('🎯 Nghĩa chính: ', '') 
      : meaning.split('\n')[0];
  };

  const startGame = async () => {
    setIsLoading(true);
    setGameFinished(false);
    setCurrentIndex(0);
    setScore(0);
    setSelectedAnswer(null);

    // Tính điểm ưu tiên (ưu tiên từ sai nhiều, ít từ đúng, cộng thêm chút ngẫu nhiên)
    const prioritized = [...vocabList].sort((a, b) => {
      const scoreA = (a.wrongCount || 0) * 2 - (a.correctCount || 0) + Math.random() * 2;
      const scoreB = (b.wrongCount || 0) * 2 - (b.correctCount || 0) + Math.random() * 2;
      return scoreB - scoreA; // Giảm dần (ưu tiên cao lên đầu)
    });
    
    // Lấy 10 từ có độ ưu tiên cao nhất, sau đó trộn ngẫu nhiên thứ tự của 10 từ này
    const selectedWords = prioritized.slice(0, 10);
    const shuffled = [...selectedWords].sort(() => Math.random() - 0.5);
    
    const inputWords = shuffled.map(v => ({
      id: v.id,
      word: v.word,
      meaning: getMainMeaning(v.meaning)
    }));

    const batchOptions = await generateQuizBatch(inputWords);
    
    const orderedQuiz = shuffled.map(v => {
      const match = batchOptions.find(b => b.wordId === v.id);
      return {
        wordId: v.id,
        options: match ? match.options : [getMainMeaning(v.meaning), "Một loại trái cây", "Hành động chạy nhảy", "Đồ vật trong nhà"].sort(() => Math.random() - 0.5)
      };
    });

    setQuizItems(orderedQuiz);
    setIsLoading(false);
  };

  useEffect(() => {
    if (vocabList.length >= 4) {
      startGame();
    }
  }, []);

  const nextQuestion = (currentIndexAtAnswer: number) => {
    if (currentIndexAtAnswer < quizItems.length - 1) {
      setCurrentIndex(c => c + 1);
      setSelectedAnswer(null);
    } else {
      setGameFinished(true);
    }
  };

  const handleSelectOption = (option: string, correctMeaning: string) => {
    if (selectedAnswer) return; // Không cho chọn lại
    
    setSelectedAnswer(option);
    
    const isCorrect = option === correctMeaning;
    if (isCorrect) {
      setScore(s => s + 1);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    // Cập nhật SRS logic vào storage
    chrome.storage.local.get(['vocabulary'], (result) => {
      const list = (result.vocabulary as Vocabulary[]) || [];
      const updatedList = list.map(v => {
        if (v.id === currentWordObj.id) {
          return {
            ...v,
            correctCount: isCorrect ? (v.correctCount || 0) + 1 : (v.correctCount || 0),
            wrongCount: !isCorrect ? (v.wrongCount || 0) + 1 : (v.wrongCount || 0),
          };
        }
        return v;
      });
      chrome.storage.local.set({ vocabulary: updatedList });
    });

    // Tự động chuyển câu
    setTimeout(() => {
      nextQuestion(currentIndex);
    }, isCorrect ? 1500 : 2000);
  };

  if (vocabList.length < 4) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-4 mt-10">
        <Trophy size={48} className="text-yellow-400 mb-4 opacity-50" />
        <h3 className="text-slate-700 font-bold mb-2">Cần thêm từ vựng</h3>
        <p className="text-slate-500 text-sm leading-relaxed">
          Bạn cần lưu ít nhất 4 từ vựng vào thư viện để bắt đầu chế độ luyện tập nhé!
        </p>
      </div>
    );
  }

  // Màn hình kết thúc
  if (gameFinished) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-4 mt-10">
        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-4 border-4 border-yellow-50 shadow-sm">
          <Trophy size={36} className="text-yellow-500" />
        </div>
        <h2 className="text-2xl font-black text-slate-800 mb-2">Hoàn thành!</h2>
        <p className="text-slate-600 mb-6">Bạn đã ôn tập xong {quizItems.length} câu hỏi.<br/>Số điểm: <span className="font-bold text-indigo-600">{score}/{quizItems.length}</span></p>
        
        <button 
          onClick={startGame}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-md hover:bg-indigo-700 hover:shadow-lg transition-all"
        >
          <RotateCcw size={18} /> Luyện tập tiếp
        </button>
      </div>
    );
  }

  if (isLoading || quizItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full mt-20">
        <Loader2 size={32} className="animate-spin text-indigo-500 mb-4" />
        <p className="text-slate-500 font-medium animate-pulse text-sm">Đang dùng AI tạo 10 câu hỏi...</p>
      </div>
    );
  }

  const currentQuiz = quizItems[currentIndex];
  const currentWordObj = vocabList.find(v => v.id === currentQuiz.wordId)!;
  const correctMeaning = getMainMeaning(currentWordObj.meaning);

  return (
    <div className="flex flex-col h-full overflow-y-auto custom-scrollbar pb-6 px-1">
      {/* Header trạng thái */}
      <div className="flex justify-between items-center mb-4">
        <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg text-xs font-bold border border-indigo-100 shadow-sm">
          Câu {currentIndex + 1}/{quizItems.length}
        </div>
        <div className="flex items-center gap-1.5 text-slate-600 font-bold text-xs bg-white px-3 py-1 rounded-lg shadow-sm border border-slate-100">
          <Trophy size={14} className="text-yellow-500" /> {score}
        </div>
      </div>

      {/* Câu hỏi */}
      {/* Sửa UI: padding-top lớn hơn (pt-10) để chữ không đè lên thanh line top */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 pt-10 mb-4 flex flex-col items-center justify-center relative overflow-hidden flex-shrink-0">
        <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
        <span className="text-slate-400 text-[10px] font-bold mb-1 uppercase tracking-widest absolute top-3">Từ Vựng</span>
        <div className="flex flex-col items-center gap-1.5 mt-2">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight text-center leading-none">{currentWordObj.word}</h2>
          {currentWordObj.pos && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border inline-block ${getPosColor(currentWordObj.pos)}`}>
              {currentWordObj.pos}
            </span>
          )}
        </div>
      </div>

      {/* Các lựa chọn */}
      <div className="space-y-2.5 flex-1 flex flex-col justify-center">
        {currentQuiz.options.map((option, index) => {
          let btnClass = "w-full text-left p-3 rounded-xl border-2 transition-all duration-200 font-medium text-[14px] leading-snug ";
          
          if (!selectedAnswer) {
            btnClass += "border-slate-100 bg-white hover:border-indigo-300 hover:bg-indigo-50 text-slate-700 shadow-sm";
          } else {
            if (option === correctMeaning) {
              btnClass += "border-green-500 bg-green-50 text-green-700 shadow-sm font-bold";
            } else if (option === selectedAnswer) {
              btnClass += "border-red-500 bg-red-50 text-red-700";
            } else {
              btnClass += "border-slate-100 bg-slate-50 text-slate-400 opacity-50";
            }
          }

          return (
            <button 
              key={index}
              onClick={() => handleSelectOption(option, correctMeaning)}
              disabled={!!selectedAnswer}
              className={btnClass}
            >
              {option}
            </button>
          );
        })}
      </div>

      {/* Tự động chuyển câu, không cần nút Next nữa */}
    </div>
  );
};
