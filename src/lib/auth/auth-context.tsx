'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

// Definicija tipa za profil kupca
export type KupacProfile = {
  id: string;
  ime_kupca: string;
  prezime_kupca: string;
  email: string | null;
  adresa?: string | null;
  mesto?: string | null;
  id_post?: string | null;
  broj_telefona?: string | null;
  status: 'registrovan' | 'neregistrovan' | 'administrator';
  created_at?: string;
  updated_at?: string;
};

// Definicija tipa za kontekst autentifikacije
type AuthContextType = {
  user: User | null;
  userProfile: KupacProfile | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    ime: string,
    prezime: string,
    adresa: string,
    mesto: string,
    postanski_broj: string,
    broj_telefona: string
  ) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<KupacProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  // Funkcija za dohvatanje profila korisnika
  async function fetchUserProfile(userId: string) {
    try {
      console.log('Dohvatanje profila za korisnika:', userId);

      // Prvo proverimo da li profil već postoji
      const { data: exists, error: checkError } = await supabase.rpc(
        'check_user_profile_exists',
        { user_id: userId }
      );

      if (checkError) {
        console.error('Greška pri proveri profila:', checkError);
        return null;
      }

      let kupacProfile;

      // Ako profil postoji, dohvatimo ga
      if (exists) {
        const { data: profile, error: fetchError } = await supabase
          .rpc('get_user_profile', { user_id: userId })
          .single();

        if (fetchError) {
          console.error('Greška pri dohvatanju profila:', fetchError);
          return null;
        }

        kupacProfile = profile;
      } else {
        // Ako profil ne postoji, kreiramo novi
        console.log('Kreiranje novog profila za korisnika:', userId);

        const { data: newProfile, error: createError } = await supabase.rpc(
          'create_user_profile',
          {
            user_id: userId,
            email: user?.email || null
          }
        );

        if (createError) {
          console.error('Greška pri kreiranju profila:', createError);
          return null;
        }

        kupacProfile = newProfile;
      }

      // Eksplicitno kastovanje u KupacProfile tip
      return kupacProfile as KupacProfile;
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

  async function signIn(email: string, password: string): Promise<void> {
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
          return;
        }
        toast.error('Greška pri prijavi: ' + error.message);
        return;
      }

      if (!data?.user) {
        toast.error('Nije moguće dobiti podatke o korisniku');
        return;
      }

      // Dohvatamo profil korisnika
      const profile = await fetchUserProfile(data.user.id);
      setUserProfile(profile);
      setIsAdmin(profile?.status === 'administrator');

      if (!profile) {
        toast.error('Greška pri rukovanju korisničkim profilom');
        return;
      }

      router.push('/');
      toast.success('Uspešno ste se prijavili');
    } catch (error) {
      console.error('Neočekivana greška pri prijavi:', error);
      toast.error('Došlo je do neočekivane greške prilikom prijave');
    } finally {
      setLoading(false);
    }
  }

  async function signUp(
    email: string,
    password: string,
    ime: string,
    prezime: string,
    adresa: string,
    mesto: string,
    postanski_broj: string,
    broj_telefona: string
  ) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });

      if (error) throw error;

      // Ako je korisnik uspešno kreiran, kreiramo i njegov profil
      if (data?.user) {
        const { error: profileError } = await supabase.rpc(
          'create_user_profile',
          {
            user_id: data.user.id,
            email: email,
            ime: ime,
            prezime: prezime,
            adresa: adresa,
            mesto: mesto,
            postanski_broj: postanski_broj,
            broj_telefona: broj_telefona
          }
        );

        if (profileError) {
          console.error('Greška pri kreiranju profila:', profileError);
          toast.error(
            'Registracija uspešna, ali došlo je do greške pri kreiranju profila.'
          );
          return;
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

  async function resetPassword(email: string): Promise<void> {
    try {
      setLoading(true);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        toast.error(
          'Greška pri slanju linka za resetovanje lozinke: ' + error.message
        );
        return;
      }

      toast.success(
        'Link za resetovanje lozinke je poslat na vašu email adresu'
      );
    } catch (error) {
      console.error('Neočekivana greška pri resetovanju lozinke:', error);
      toast.error(
        'Došlo je do neočekivane greške prilikom resetovanja lozinke'
      );
    } finally {
      setLoading(false);
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
        isAdmin,
        resetPassword
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
      if (!user || !allowedRoles.includes(userProfile?.status || '')) {
        router.push('/login');
      }
    }
  }, [user, userProfile, loading, allowedRoles, router]);

  return { loading, user, userProfile };
}
