import { useState, useEffect } from 'react';
import { signOut, type User } from 'firebase/auth';
import { getDoc, doc, getDocs, collection } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { LogOut, Users } from 'lucide-react';

interface ProfileTabProps {
  user: User | null;
}

export const ProfileTab = ({ user }: ProfileTabProps) => {
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkRole = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists() && userDoc.data().role === 'admin') {
            setIsAdmin(true);
            fetchUsers();
          } else {
            setIsAdmin(false);
          }
        } catch (error) {
          console.error("Lỗi kiểm tra quyền:", error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };
    checkRole();
  }, [user]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const users: any[] = [];
      querySnapshot.forEach((doc) => {
        users.push(doc.data());
      });
      // Sắp xếp theo đăng nhập gần nhất
      users.sort((a, b) => b.lastLoginAt - a.lastLoginAt);
      setUsersList(users);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách user:", error);
      // Đặt thành mảng rỗng để thoát khỏi chữ "Đang tải" nếu lỗi quyền
      setUsersList([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    // Thay vì gọi localhost, chúng ta mở thẳng trang web thật của bạn
    const authUrl = `https://checkin-out-gamma.vercel.app/ext-auth?extId=${chrome.runtime.id}`;
    window.open(authUrl, '_blank', 'width=500,height=600');
    // Set timeout để tắt vòng quay loading nếu họ vô tình đóng popup
    setTimeout(() => setLoading(false), 3000);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Lỗi đăng xuất:", error);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 max-w-sm w-full space-y-4">
          <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2 text-indigo-500">
            <Users size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Đăng nhập tài khoản</h2>
          <p className="text-[13px] text-slate-500">
            Đăng nhập để tham gia cộng đồng sử dụng extension.
          </p>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-medium transition-all shadow-md shadow-indigo-200 flex items-center gap-2"
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" className="w-5 h-5 bg-white rounded-full p-0.5" />
          )}
          Đăng nhập bằng Google
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={user.photoURL || 'https://via.placeholder.com/40'}
            alt="Avatar"
            className="w-10 h-10 rounded-full border border-slate-200"
          />
          <div>
            <h3 className="font-bold text-slate-800 leading-tight">{user.displayName || 'Người dùng'}</h3>
            <p className="text-[11px] text-slate-500">{user.email}</p>
            {isAdmin && <span className="inline-block mt-1 px-2 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-bold rounded-md">ADMIN</span>}
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
          title="Đăng xuất"
        >
          <LogOut size={20} />
        </button>
      </div>

      {isAdmin && (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-4 text-indigo-600">
            <Users size={18} />
            <h3 className="font-bold">Danh sách người dùng ({usersList.length})</h3>
          </div>
          
          <div className="space-y-1">
            {loadingUsers ? (
              <p className="text-[13px] text-slate-500 text-center py-2">Đang tải...</p>
            ) : usersList.length === 0 ? (
              <p className="text-[13px] text-slate-500 text-center py-2">Chưa có người dùng nào, hoặc bạn chưa cấp quyền Firestore.</p>
            ) : (
              usersList.map((u, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors">
                  <img
                    src={u.photoURL || 'https://via.placeholder.com/32'}
                    alt={u.displayName}
                    className="w-8 h-8 rounded-full border border-slate-200"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[13px] text-slate-800 truncate">{u.displayName || 'Người dùng ẩn danh'}</p>
                    <p className="text-[11px] text-slate-500 truncate">{u.email}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
