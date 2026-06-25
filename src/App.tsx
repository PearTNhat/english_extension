import { useState, useEffect } from 'react';
import { BookMarked, Settings } from 'lucide-react';
import { auth, db } from './firebase/config';
import { signOut } from 'firebase/auth';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';


function App() {
  const [vocabList, setVocabList] = useState<any[]>([]);

  useEffect(() => {
    // Listen to anonymous user's saved vocabulary
    const q = query(
      collection(db, 'vocabulary'), 
      where('userId', '==', 'anonymous'),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribeDb = onSnapshot(q, (snapshot) => {
      const words: any[] = [];
      snapshot.forEach((doc) => {
        words.push({ id: doc.id, ...doc.data() });
      });
      setVocabList(words);
    });

    return () => unsubscribeDb();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <div className="w-[350px] min-h-[400px] bg-slate-50 flex flex-col font-sans">
      <header className="bg-primary text-primary-foreground p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookMarked size={20} />
          <h1 className="font-semibold text-lg">Từ vựng của tôi</h1>
        </div>
        <button onClick={handleLogout} className="p-1.5 hover:bg-white/20 rounded-md transition-colors" title="Đăng xuất">
          <Settings size={18} />
        </button>
      </header>

      <main className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-3">
          {vocabList.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              Chưa có từ vựng nào được lưu.<br/>Hãy bôi đen từ vựng trên web để dịch và lưu nhé!
            </div>
          ) : (
            vocabList.map((item) => (
              <div key={item.id} className="bg-white p-3 rounded-lg shadow-sm border border-slate-100">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-primary">{item.word}</h3>
                  {item.pos && <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full uppercase tracking-wider">{item.pos}</span>}
                </div>
                <p className="text-sm text-slate-700">{item.meaning}</p>
                {item.example && (
                  <p className="text-xs text-slate-500 mt-2 italic border-l-2 border-slate-200 pl-2">
                    "{item.example}"
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
