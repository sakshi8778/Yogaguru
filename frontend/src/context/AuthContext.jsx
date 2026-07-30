import { createContext, useContext, useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';

const AuthContext = createContext(null);

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "dummy-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "yogaguru-auth.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "yogaguru-auth",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "yogaguru-auth.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1234567890:web:abcdef"
};

// Check if we should use Mock authentication
const isMockAuth = !import.meta.env.VITE_FIREBASE_API_KEY || import.meta.env.VITE_FIREBASE_API_KEY === 'your_firebase_key_here';

let firebaseAuth = null;
let googleProvider = null;

if (!isMockAuth) {
  try {
    const app = initializeApp(firebaseConfig);
    firebaseAuth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
  } catch (err) {
    console.error("Firebase initialization failed:", err);
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Restore user session on mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('yogaguru_user');
      const storedToken = localStorage.getItem('yogaguru_token');
      
      if (storedUser && storedToken) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (err) {
          console.error('Failed to parse stored user:', err);
        }
      }
    } catch (err) {
      console.error('Failed to read from localStorage:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loginWithGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      let idToken = 'mock-id-token';
      
      if (!isMockAuth && firebaseAuth && googleProvider) {
        const result = await signInWithPopup(firebaseAuth, googleProvider);
        idToken = await result.user.getIdToken();
      } else {
        // Wait 800ms to simulate network request for premium feel
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      // Send to backend
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Backend authentication failed');
      }

      const data = await res.json();
      
      // Save session
      localStorage.setItem('yogaguru_user', JSON.stringify(data.user));
      localStorage.setItem('yogaguru_token', idToken);
      
      setUser(data.user);
      return data; // contains user and isOnboarded
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Something went wrong during Google Login.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (!isMockAuth && firebaseAuth) {
        await signOut(firebaseAuth);
      }
      localStorage.removeItem('yogaguru_user');
      localStorage.removeItem('yogaguru_token');
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateLocalProfile = (updatedUser) => {
    localStorage.setItem('yogaguru_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, loginWithGoogle, logout, updateLocalProfile, isMockAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
