import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Thay thế bằng thông tin cấu hình Firebase thực tế của bạn
const firebaseConfig = {
  apiKey: "AIzaSyAK8M1wcEHV6U3lecrzKMSW1WT2zdKHV6U",
  authDomain: "learn-english-c4f49.firebaseapp.com",
  projectId: "learn-english-c4f49",
  storageBucket: "learn-english-c4f49.firebasestorage.app",
  messagingSenderId: "302158908821",
  appId: "1:302158908821:web:0acc28bc8c543f1b0dfa9c",
  measurementId: "G-8DYBWQPBTM"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
