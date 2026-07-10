import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/config/supabase-client';
import type { AuthState } from '@/types';
import type { Session } from '@supabase/supabase-js';

interface AuthContextType extends AuthState {
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function getUserFromSession(session: Session | null) {
  if (!session?.user) return null;

  let puntos = 0;
  let notif_sound: string | null = null;
  let tipo_usuario: 'estudiante' | 'padre' = 'estudiante';
  let grado: string | null = null;
  let edad: number | null = null;
  let rol_confirmado = false;
  let dbAvatarUrl: string | null = null;
  try {
    const { data } = await supabase
      .from('usuarios')
      .select('puntos, notif_sound, tipo_usuario, grado, edad, rol_confirmado, avatar_url')
      .eq('id', session.user.id)
      .single();

    if (data) {
      puntos = data.puntos;
      notif_sound = data.notif_sound;
      tipo_usuario = data.tipo_usuario ?? 'estudiante';
      grado = data.grado;
      edad = data.edad;
      rol_confirmado = data.rol_confirmado;
      dbAvatarUrl = data.avatar_url;
    }
  } catch {}

  return {
    id: session.user.id,
    email: session.user.email ?? '',
    nombre: session.user.user_metadata?.full_name ?? null,
    avatar_url: dbAvatarUrl ?? session.user.user_metadata?.avatar_url ?? null,
    puntos,
    notif_sound,
    tipo_usuario,
    grado,
    edad,
    rol_confirmado,
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
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const user = await getUserFromSession(session);
      setState({ session, user, loading: false });
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: string, session: Session | null) => {
      const user = await getUserFromSession(session);
      setState({ session, user, loading: false });
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
    if (Capacitor.isNativePlatform()) {
      const { Browser } = await import('@capacitor/browser');
      const { data: { url } } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'com.vix.intelligentassistant://callback',
          skipBrowserRedirect: true,
        },
      });
      if (url) await Browser.open({ url, windowName: '_system' });
    } else {
      const { data: { url } } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      });
      if (url) window.location.href = url;
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const refreshUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const user = await getUserFromSession(session);
    setState({ session, user, loading: false });
  };

  return (
    <AuthContext.Provider value={{ ...state, signIn, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
