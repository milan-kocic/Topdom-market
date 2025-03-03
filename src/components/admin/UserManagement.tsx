'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth/auth-context';
import toast from 'react-hot-toast';

type UserWithProfile = {
  id: string;
  email: string;
  status: 'registrovan' | 'neregistrovan' | 'administrator';
  created_at: string;
};

export default function UserManagement() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<UserWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) return;

    async function fetchUsers() {
      try {
        setLoading(true);

        // Dohvatamo korisnike iz auth.users tabele
        const { data: authUsers, error: authError } =
          await supabase.auth.admin.listUsers();

        if (authError) throw authError;

        // Dohvatamo podatke o kupcima
        const { data: kupci, error: kupciError } = await supabase
          .from('kupci')
          .select('*');

        if (kupciError) throw kupciError;

        // Kombinujemo podatke
        const combinedUsers = authUsers.users.map((user) => {
          const kupac = kupci.find((k) => k.id === user.id);
          return {
            id: user.id,
            email: user.email || 'Nepoznat email',
            status: kupac?.status || 'neregistrovan',
            created_at: user.created_at
          };
        });

        setUsers(combinedUsers);
      } catch (error) {
        console.error('Greška pri dohvatanju korisnika:', error);
        toast.error('Greška pri dohvatanju korisnika');
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, [isAdmin]);

  async function updateUserStatus(
    userId: string,
    newStatus: 'registrovan' | 'administrator'
  ) {
    try {
      // Proveravamo da li korisnik već postoji u tabeli kupci
      const { data: existingKupac, error: checkError } = await supabase
        .from('kupci')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingKupac) {
        // Ažuriramo postojećeg kupca
        const { error } = await supabase
          .from('kupci')
          .update({ status: newStatus })
          .eq('id', userId);

        if (error) throw error;
      } else {
        // Kreiramo novog kupca
        const user = users.find((u) => u.id === userId);
        const { error } = await supabase.from('kupci').insert({
          id: userId,
          email: user?.email || '',
          ime_kupca: 'Korisnik',
          prezime_kupca: 'Korisnik',
          status: newStatus
        });

        if (error) throw error;
      }

      // Ažuriramo lokalnu listu korisnika
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, status: newStatus } : user
        )
      );

      toast.success(`Status korisnika je promenjen na ${newStatus}`);
    } catch (error) {
      console.error('Greška pri ažuriranju statusa:', error);
      toast.error('Greška pri ažuriranju statusa korisnika');
    }
  }

  if (!isAdmin) {
    return (
      <div className='p-8 text-center'>
        <h1 className='text-2xl font-bold text-red-600 mb-4'>
          Pristup zabranjen
        </h1>
        <p className='text-gray-600'>
          Nemate dozvolu za pristup ovoj stranici.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className='p-8'>
        <h1 className='text-2xl font-bold mb-6'>Upravljanje korisnicima</h1>
        <div className='animate-pulse space-y-4'>
          {[...Array(5)].map((_, i) => (
            <div key={i} className='bg-gray-200 h-16 rounded-lg'></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className='p-8'>
      <h1 className='text-2xl font-bold mb-6'>Upravljanje korisnicima</h1>

      <div className='bg-white rounded-xl shadow-lg overflow-hidden'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Email
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Status
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Datum registracije
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Akcije
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {users.map((user) => (
              <tr key={user.id}>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='text-sm font-medium text-gray-900'>
                    {user.email}
                  </div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.status === 'administrator'
                        ? 'bg-yellow-100 text-yellow-800'
                        : user.status === 'registrovan'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {user.status === 'administrator'
                      ? 'Administrator'
                      : user.status === 'registrovan'
                      ? 'Registrovan'
                      : 'Neregistrovan'}
                  </span>
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                  {new Date(user.created_at).toLocaleDateString('sr-RS')}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                  {user.status === 'administrator' ? (
                    <button
                      onClick={() => updateUserStatus(user.id, 'registrovan')}
                      className='text-yellow-600 hover:text-yellow-900'
                    >
                      Postavi kao registrovanog korisnika
                    </button>
                  ) : (
                    <button
                      onClick={() => updateUserStatus(user.id, 'administrator')}
                      className='text-yellow-600 hover:text-yellow-900'
                    >
                      Postavi kao administratora
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
