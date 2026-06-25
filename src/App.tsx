import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { LibraryTab } from './components/LibraryTab';
import { PracticeGame } from './components/PracticeGame';
import { GuideTab } from './components/GuideTab';
import type { Vocabulary } from './types';

function App() {
  const [vocabList, setVocabList] = useState<Vocabulary[]>([]);
  const [currentTab, setCurrentTab] = useState<'library' | 'practice' | 'guide'>('library');

  useEffect(() => {
    // Lấy dữ liệu lần đầu
    chrome.storage.local.get(['vocabulary'], (result) => {
      if (result.vocabulary) {
        setVocabList(result.vocabulary as Vocabulary[]);
      }
    });

    // Lắng nghe thay đổi
    const listener = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.vocabulary) {
        setVocabList((changes.vocabulary.newValue as Vocabulary[]) || []);
      }
    };
    chrome.storage.onChanged.addListener(listener);

    return () => {
      chrome.storage.onChanged.removeListener(listener);
    };
  }, []);

  const handleDelete = (id: string) => {
    const newList = vocabList.filter(item => item.id !== id);
    chrome.storage.local.set({ vocabulary: newList });
  };

  const handleBulkDelete = (ids: Set<string>) => {
    const newList = vocabList.filter(item => !ids.has(item.id));
    chrome.storage.local.set({ vocabulary: newList });
  };

  return (
    <div className="w-[380px] h-[550px] bg-gradient-to-br from-slate-50 to-blue-50/50 flex flex-col font-sans overflow-hidden">
      <Header 
        vocabCount={vocabList.length} 
        currentTab={currentTab}
        onTabChange={setCurrentTab}
      />

      <main className="flex-1 p-4 overflow-y-auto custom-scrollbar relative">
        {currentTab === 'library' ? (
          <LibraryTab 
            vocabList={vocabList} 
            onDelete={handleDelete} 
            onBulkDelete={handleBulkDelete} 
          />
        ) : currentTab === 'practice' ? (
          <PracticeGame vocabList={vocabList} />
        ) : (
          <GuideTab />
        )}
      </main>
    </div>
  );
}

export default App;
