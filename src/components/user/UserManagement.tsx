'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { User, UserRole } from '@/types/user';
import { AlertCircle, CheckCircle, Edit, Trash, UserCog } from 'lucide-react';
import { toast } from 'react-hot-toast';

type UserWithProfile = User & {
  kupac: {
    status: 'registrovan' | 'neregistrovan' | 'administrator';
    id: string;
    ime_kupca?: string;
    prezime_kupca?: string;
  } | null;
};

export default function UserManagement() {
  const [users, setUsers] = useState<UserWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<
    'registrovan' | 'administrator'
  >('registrovan');

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);

      // Koristimo Supabase Admin API za dobijanje svih korisnika
      const { data: usersData, error: usersError } =
        await supabase.auth.admin.listUsers();

      if (usersError) throw usersError;

      // Dobijamo podatke o kupcima
      const { data: kupciData, error: kupciError } = await supabase
        .from('kupci')
        .select('id, status, ime_kupca, prezime_kupca');

      if (kupciError) throw kupciError;

      // Kombinujemo podatke o korisnicima i njihovim profilima
      const usersWithProfiles = usersData.users.map((user: any) => {
        const kupac = kupciData.find((k: any) => k.id === user.id);
        return {
          ...user,
          kupac: kupac
            ? {
                status: kupac.status,
                id: kupac.id,
                ime_kupca: kupac.ime_kupca,
                prezime_kupca: kupac.prezime_kupca
              }
            : null
        };
      });

      setUsers(usersWithProfiles);
    } catch (error) {
      console.error('Greška pri dobijanju korisnika:', error);
      toast.error('Nije moguće učitati korisnike');
    } finally {
      setLoading(false);
    }
  }

  async function updateUserStatus(
    userId: string,
    status: 'registrovan' | 'administrator'
  ) {
    try {
      const userKupac = users.find((u) => u.id === userId)?.kupac;

      if (userKupac) {
        // Ažuriramo postojećeg kupca
        const { error } = await supabase
          .from('kupci')
          .update({ status })
          .eq('id', userId);

        if (error) throw error;
      } else {
        // Kreiramo novog kupca ako ne postoji
        const { error } = await supabase.from('kupci').insert({
          id: userId,
          status,
          ime_kupca: 'Korisnik',
          prezime_kupca: 'Korisnik',
          email: users.find((u) => u.id === userId)?.email || ''
        });

        if (error) throw error;
      }

      // Osvežavamo listu korisnika
      await fetchUsers();
      setEditingUser(null);
      toast.success('Status korisnika je uspešno ažuriran');
    } catch (error) {
      console.error('Greška pri ažuriranju statusa:', error);
      toast.error('Nije moguće ažurirati status korisnika');
    }
  }

  async function deleteUser(userId: string) {
    if (!confirm('Da li ste sigurni da želite da obrišete ovog korisnika?')) {
      return;
    }

    try {
      // Brišemo korisnika koristeći Supabase Admin API
      const { error } = await supabase.auth.admin.deleteUser(userId);

      if (error) throw error;

      // Osvežavamo listu korisnika
      await fetchUsers();
      toast.success('Korisnik je uspešno obrisan');
    } catch (error) {
      console.error('Greška pri brisanju korisnika:', error);
      toast.error('Nije moguće obrisati korisnika');
    }
  }

  if (loading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900'></div>
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='flex items-center mb-6'>
        <UserCog className='mr-2 h-6 w-6' />
        <h1 className='text-2xl font-bold'>Upravljanje korisnicima</h1>
      </div>

      <div className='bg-white shadow-md rounded-lg overflow-hidden'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
              >
                Email
              </th>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
              >
                Status verifikacije
              </th>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
              >
                Status korisnika
              </th>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
              >
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
                  {user.confirmed_at ? (
                    <span className='px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800'>
                      <CheckCircle className='h-4 w-4 mr-1' /> Potvrđen
                    </span>
                  ) : (
                    <span className='px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800'>
                      <AlertCircle className='h-4 w-4 mr-1' /> Nepotvrđen
                    </span>
                  )}
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  {editingUser === user.id ? (
                    <div className='flex items-center'>
                      <select
                        value={selectedStatus}
                        onChange={(e) =>
                          setSelectedStatus(
                            e.target.value as 'registrovan' | 'administrator'
                          )
                        }
                        className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6'
                        aria-label='Izaberite status korisnika'
                        title='Status korisnika'
                      >
                        <option value='administrator'>Administrator</option>
                        <option value='registrovan'>
                          Registrovan korisnik
                        </option>
                      </select>
                      <button
                        onClick={() =>
                          updateUserStatus(user.id, selectedStatus)
                        }
                        className='ml-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                      >
                        Sačuvaj
                      </button>
                      <button
                        onClick={() => setEditingUser(null)}
                        className='ml-2 inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                      >
                        Otkaži
                      </button>
                    </div>
                  ) : (
                    <div className='text-sm text-gray-900'>
                      {user.kupac?.status === 'administrator'
                        ? 'Administrator'
                        : user.kupac?.status === 'registrovan'
                        ? 'Registrovan korisnik'
                        : 'Neregistrovan'}
                    </div>
                  )}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                  {editingUser !== user.id && (
                    <>
                      <button
                        onClick={() => {
                          setEditingUser(user.id);
                          setSelectedStatus(
                            user.kupac?.status === 'administrator'
                              ? 'administrator'
                              : 'registrovan'
                          );
                        }}
                        className='text-indigo-600 hover:text-indigo-900 mr-4'
                        aria-label='Izmeni status korisnika'
                        title='Izmeni status'
                      >
                        <Edit className='h-5 w-5' />
                      </button>
                      <button
                        onClick={() => deleteUser(user.id)}
                        className='text-red-600 hover:text-red-900'
                        aria-label='Obriši korisnika'
                        title='Obriši korisnika'
                      >
                        <Trash className='h-5 w-5' />
                      </button>
                    </>
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
