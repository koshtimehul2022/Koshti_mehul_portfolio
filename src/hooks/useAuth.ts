import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMainAdmin, setIsMainAdmin] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const initializedRef = useRef(false);

  const checkRoles = async (u: User) => {
    try {
      const [adminRes, mainRes] = await Promise.all([
        supabase.rpc('is_admin', { _user_id: u.id }),
        supabase.rpc('is_main_admin', { _user_id: u.id }),
      ]);
      setIsAdmin(adminRes.data === true);
      setIsMainAdmin(mainRes.data === true);
    } catch {
      setIsAdmin(false);
      setIsMainAdmin(false);
    }
  };

  const signOut = useCallback(async () => {
    clearTimeout(timerRef.current);
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
    setIsMainAdmin(false);
  }, []);

  // Inactivity auto-logout
  useEffect(() => {
    if (!user) return;

    const resetTimer = () => {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        signOut();
        window.location.href = '/admin/login';
      }, INACTIVITY_TIMEOUT);
    };

    const events = ['mousemove', 'scroll', 'click', 'keydown', 'touchstart'];
    events.forEach(e => window.addEventListener(e, resetTimer, { passive: true }));
    resetTimer();

    return () => {
      clearTimeout(timerRef.current);
      events.forEach(e => window.removeEventListener(e, resetTimer));
    };
  }, [user, signOut]);

  useEffect(() => {
    // Get initial session first
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) await checkRoles(u);
      setLoading(false);
      initializedRef.current = true;
    });

    // Then listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      // Skip if this fires before getSession resolves (avoid double-loading)
      if (!initializedRef.current) return;
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        await checkRoles(u);
      } else {
        setIsAdmin(false);
        setIsMainAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: window.location.origin }
    });
    return { data, error };
  };

  return { user, loading, isAdmin, isMainAdmin, signIn, signOut, signUp };
};
