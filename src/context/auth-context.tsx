import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/config/supabase-client';
import type { AuthState, Usuario } from '@/types';
import type { Session } from '@supabase/supabase-js';

interface AuthContextType extends AuthState {
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState(prev => ({
        ...prev,
        session,
        user: session?.user
          ? { id: session.user.id, email: session.user.email ?? '', nombre: session.user.user_metadata?.full_name ?? null, creado_at: session.user.created_at }
          : null,
        loading: false,
      }));
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({
        session,
        user: session?.user
          ? { id: session.user.id, email: session.user.email ?? '', nombre: session.user.user_metadata?.full_name ?? null, creado_at: session.user.created_at }
          : null,
        loading: false,
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ ...state, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
