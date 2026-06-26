import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/config/supabase-client';
import type { AuthState } from '@/types';
import type { Session } from '@supabase/supabase-js';

interface AuthContextType extends AuthState {
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getUserFromSession(session: Session | null) {
  if (!session?.user) return null;
  return {
    id: session.user.id,
    email: session.user.email ?? '',
    nombre: session.user.user_metadata?.full_name ?? null,
    creado_at: session.user.created_at,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState({
        session,
        user: getUserFromSession(session),
        loading: false,
      });
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
      setState({
        session,
        user: getUserFromSession(session),
        loading: false,
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    import('@capacitor/app').then(({ App }) => {
      App.addListener('appUrlOpen', async (data) => {
        const url = new URL(data.url);
        if (url.hash) {
          const params = new URLSearchParams(url.hash.replace('#', '?'));
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');
          if (accessToken) {
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            });
          }
        }
      }).then((h) => { unsubscribe = h.remove; });
    });

    return () => unsubscribe?.();
  }, []);

  const signIn = async () => {
    const { Capacitor } = await import('@capacitor/core');
    const isCapacitor = Capacitor.isNativePlatform();
    if (isCapacitor) {
      const { Browser } = await import('@capacitor/browser');
      const { data: { url } } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'com.vix.intelligentassistant://callback',
          skipBrowserRedirect: true,
        },
      });
      if (url) await Browser.open({ url, windowName: '_blank' });
    } else {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      });
    }
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
