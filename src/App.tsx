import { useState, useEffect } from 'react';
import { auth } from './firebase/config';
import { GoogleAuthProvider, signInWithCredential, type User } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase/config';
import { Header } from './components/Header';
import { LibraryTab } from './components/LibraryTab';
import { PracticeGame } from './components/PracticeGame';
import { GuideTab } from './components/GuideTab';
import { ProfileTab } from './components/ProfileTab';
import type { Vocabulary } from './types';

function App() {
  const [vocabList, setVocabList] = useState<Vocabulary[]>([]);
  const [currentTab, setCurrentTab] = useState<'library' | 'practice' | 'guide' | 'profile'>('library');
  const [user, setUser] = useState<User | null>(auth.currentUser);

  useEffect(() => {
    // Auth Listener
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });

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

    // KIỂM TRA PENDING TOKEN TỪ WEB VERCEL TRẢ VỀ
    const checkPendingToken = async () => {
      chrome.storage.local.get(['pendingFirebaseIdToken'], async (result) => {
        if (result.pendingFirebaseIdToken) {
          try {
            // Xóa ngay token để tránh lặp lại
            await chrome.storage.local.remove('pendingFirebaseIdToken');
            const credential = GoogleAuthProvider.credential(result.pendingFirebaseIdToken as string);
            const userCredential = await signInWithCredential(auth, credential);
            
            // Lưu thông tin user vào Firestore
            const loggedInUser = userCredential.user;
            const userDocRef = doc(db, 'users', loggedInUser.uid);
            const userDocSnap = await getDoc(userDocRef);
            
            const userData: any = {
              uid: loggedInUser.uid,
              email: loggedInUser.email,
              displayName: loggedInUser.displayName,
              photoURL: loggedInUser.photoURL,
              lastLoginAt: Date.now()
            };

            // Nếu đây là người dùng mới tinh, gán mặc định quyền 'user'
            if (!userDocSnap.exists()) {
              userData.role = 'user';
            }

            await setDoc(userDocRef, userData, { merge: true });

            setCurrentTab('profile'); // Chuyển sang tab profile cho họ xem
          } catch (error) {
            console.error("Lỗi xác thực bằng token từ web:", error);
          }
        }
      });
    };
    checkPendingToken();

    return () => {
      unsubscribe();
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
        user={user}
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
        ) : currentTab === 'guide' ? (
          <GuideTab />
        ) : (
          <ProfileTab user={user} />
        )}
      </main>
    </div>
  );
}

export default App;
