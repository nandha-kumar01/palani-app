import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AppState, User, Walk } from '../types';
import { tokenStorage } from '../services/tokenStorage';

interface AppContextType extends AppState {
  setUser: (user: User | null) => void;
  setAuthenticated: (isAuth: boolean) => void;
  setCurrentWalk: (walk: Walk | null) => void;
  setLanguage: (lang: 'tamil' | 'english') => void;
  setTheme: (theme: 'light' | 'dark') => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

type Action = 
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'SET_CURRENT_WALK'; payload: Walk | null }
  | { type: 'SET_LANGUAGE'; payload: 'tamil' | 'english' }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'LOGOUT' };

const initialState: AppState = {
  user: null,
  isAuthenticated: false,
  currentWalk: null,
  language: 'english',
  theme: 'light',
};

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_AUTHENTICATED':
      return { ...state, isAuthenticated: action.payload };
    case 'SET_CURRENT_WALK':
      return { ...state, currentWalk: action.payload };
    case 'SET_LANGUAGE':
      return { ...state, language: action.payload };
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'LOGOUT':
      return { ...initialState };
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Initialize app with stored user data if available
  useEffect(() => {
    const initializeApp = async () => {
      try {
        const isLoggedIn = await tokenStorage.isLoggedIn();
        if (isLoggedIn) {
          const userData = await tokenStorage.getUserData();
          if (userData) {
            // Convert stored user data to our User type
            const user: User = {
              id: userData._id,
              name: userData.name,
              email: userData.email,
              phone: userData.phone,
              createdAt: new Date(), // Use current date since we don't store it
            };
            dispatch({ type: 'SET_USER', payload: user });
            dispatch({ type: 'SET_AUTHENTICATED', payload: true });
            console.log('App initialized with user:', user.name);
          }
        }
      } catch (error) {
        console.error('Error initializing app with user data:', error);
      }
    };

    initializeApp();
  }, []);

  const setUser = (user: User | null) => {
    dispatch({ type: 'SET_USER', payload: user });
  };

  const setAuthenticated = (isAuth: boolean) => {
    dispatch({ type: 'SET_AUTHENTICATED', payload: isAuth });
  };

  const setCurrentWalk = (walk: Walk | null) => {
    dispatch({ type: 'SET_CURRENT_WALK', payload: walk });
  };

  const setLanguage = (lang: 'tamil' | 'english') => {
    dispatch({ type: 'SET_LANGUAGE', payload: lang });
  };

  const setTheme = (theme: 'light' | 'dark') => {
    dispatch({ type: 'SET_THEME', payload: theme });
  };

  const logout = async () => {
    try {
      // Clear all stored tokens and user data
      await tokenStorage.clearAllData();
      console.log('✅ Tokens and user data cleared');
      
      // Reset app state
      dispatch({ type: 'LOGOUT' });
      console.log('✅ App state reset');
    } catch (error) {
      console.error('❌ Error during logout:', error);
    }
  };

  return (
    <AppContext.Provider value={{
      ...state,
      setUser,
      setAuthenticated,
      setCurrentWalk,
      setLanguage,
      setTheme,
      logout,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}