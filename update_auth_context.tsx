'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import React from 'react';

// Novi tip za status korisnika
type UserStatus = 'registrovan' | 'neregistrovan' | 'administrator';

// Novi tip za profil korisnika (kupac)
type UserProfile = {
  id: string;
  ime_kupca: string;
  prezime_kupca: string;
  email: string | null;
  adresa: string | null;
  mesto: string | null;
  id_post: string | null;
  status: UserStatus;
  kreirano: string;
};

type AuthContextType = {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: any }>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  // Funkcija za dohvatanje profila korisnika
  async function fetchUserProfile(userId: string) {
    try {
      console.log('Dohvatanje profila za korisnika:', userId);

      // Dohvatamo profil iz tabele kupci
      const { data: existingProfile, error: fetchError } = await supabase
        .from('kupci')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (fetchError) {
        console.error('Greška pri dohvatanju profila:', fetchError);
        return null;
      }

      // Ako profil ne postoji, kreiramo novi
      if (!existingProfile) {
        console.log('Kreiranje novog profila za korisnika:', userId);

        // Dohvatamo email korisnika iz auth.users
        const { data: userData, error: userError } =
          await supabase.auth.getUser();

        if (userError) {
          console.error('Greška pri dohvatanju korisnika:', userError);
          return null;
        }

        // Kreiramo novi profil
        const { data: newProfile, error: createError } = await supabase
          .from('kupci')
          .insert({
            id: userId,
            ime_kupca: 'Korisnik',
            prezime_kupca: 'Korisnik',
            email: userData.user?.email || '',
            status: 'registrovan'
          })
          .select()
          .single();

        if (createError) {
          console.error('Greška pri kreiranju profila:', createError);
          return null;
        }

        return newProfile;
      }

      return existingProfile;
    } catch (error) {
      console.error('Greška pri rukovanju profilom:', error);
      return null;
    }
  }

  useEffect(() => {
    checkSession();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        const profile = await fetchUserProfile(currentUser.id);
        setUserProfile(profile);
        setIsAdmin(profile?.status === 'administrator');
      } else {
        setUserProfile(null);
        setIsAdmin(false);
      }

      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function checkSession() {
    try {
      const {
        data: { session }
      } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        const profile = await fetchUserProfile(currentUser.id);
        setUserProfile(profile);
        setIsAdmin(profile?.status === 'administrator');
      }
    } catch (error) {
      console.error('Greška pri proveri sesije:', error);
    } finally {
      setLoading(false);
    }
  }

  async function signIn(
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: any }> {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error(
            'Pogrešan email ili lozinka. Proverite podatke ili se registrujte ako nemate nalog.'
          );
          return { success: false, error };
        }
        toast.error('Greška pri prijavi: ' + error.message);
        return { success: false, error };
      }

      if (!data?.user) {
        toast.error('Nije moguće dobiti podatke o korisniku');
        return {
          success: false,
          error: new Error('Nije moguće dobiti podatke o korisniku')
        };
      }

      const profile = await fetchUserProfile(data.user.id);

      if (!profile) {
        toast.error('Greška pri rukovanju korisničkim profilom');
        return {
          success: false,
          error: new Error('Greška pri rukovanju korisničkim profilom')
        };
      }

      setUserProfile(profile);
      setIsAdmin(profile.status === 'administrator');

      router.push('/');
      toast.success('Uspešno ste se prijavili');
      return { success: true };
    } catch (error) {
      console.error('Neočekivana greška pri prijavi:', error);
      toast.error('Došlo je do neočekivane greške prilikom prijave');
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }

  async function signUp(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });

      if (error) throw error;

      // Ako je registracija uspešna, kreiramo profil korisnika
      if (data?.user) {
        // Pozivamo funkciju za registraciju korisnika
        const { error: profileError } = await supabase.rpc(
          'registruj_korisnika',
          {
            p_user_id: data.user.id,
            p_ime_kupca: 'Korisnik',
            p_prezime_kupca: 'Korisnik',
            p_email: email
          }
        );

        if (profileError) {
          console.error('Greška pri kreiranju profila:', profileError);
        }
      }

      toast.success('Uspešno ste se registrovali! Proverite email za potvrdu.');
    } catch (error: any) {
      console.error('Greška pri registraciji:', error);
      toast.error('Greška pri registraciji. Pokušajte ponovo.');
    }
  }

  async function signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setUserProfile(null);
      setIsAdmin(false);
    } catch (error: any) {
      console.error('Greška pri odjavljivanju:', error);
      toast.error('Greška pri odjavljivanju');
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        signIn,
        signUp,
        signOut,
        isAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useProtectedRoute(allowedRoles: string[]) {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/prijava');
      } else if (userProfile && !allowedRoles.includes(userProfile.status)) {
        router.push('/');
      }
    }
  }, [user, userProfile, loading, router, allowedRoles]);

  return { user, userProfile, loading };
}
