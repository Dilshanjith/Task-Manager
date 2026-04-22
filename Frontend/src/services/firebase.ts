import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCs-g-H09PFlOUfN0MowAZ9Hd3sscdeVNY",
  authDomain: "task-management-app-8904d.firebaseapp.com",
  projectId: "task-management-app-8904d",
  storageBucket: "task-management-app-8904d.firebasestorage.app",
  messagingSenderId: "611586622299",
  appId: "1:611586622299:web:131424b81e5320ad2bd07e"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
