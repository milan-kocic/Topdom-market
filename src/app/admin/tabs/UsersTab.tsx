'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import {
  User,
  Pencil,
  Trash2,
  Check,
  X,
  UserPlus,
  Download,
  Phone,
  MapPin,
  Mail,
  Shield
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/lib/auth/auth-context';

interface UserData {
  id: string;
  status: string;
  email?: string;
  ime_kupca?: string;
  prezime_kupca?: string;
  adresa?: string;
  mesto?: string;
  id_post?: string;
  created_at?: string;
}

export default function UsersTab() {
  const { user: currentUser, isAdmin } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<UserData>>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserData, setNewUserData] = useState({
    ime_kupca: '',
    prezime_kupca: '',
    adresa: '',
    mesto: '',
    id_post: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      // Dohvatamo registrovane korisnike iz tabele kupci
      const { data: kupci, error: kupciError } = await supabase
        .from('kupci')
        .select('*')
        .in('status', ['registrovan', 'administrator']);

      if (kupciError) throw kupciError;

      // Mapiramo podatke u format koji očekuje komponenta
      const mappedUsers = kupci.map((kupac) => ({
        id: kupac.id,
        status: kupac.status,
        email: kupac.email,
        ime_kupca: kupac.ime_kupca,
        prezime_kupca: kupac.prezime_kupca,
        adresa: kupac.adresa,
        mesto: kupac.mesto,
        id_post: kupac.id_post,
        created_at: kupac.kreirano || kupac.created_at
      }));

      setUsers(mappedUsers);
    } catch (error) {
      console.error('Greška pri učitavanju korisnika:', error);
      toast.error('Greška pri učitavanju korisnika');
    } finally {
      setLoading(false);
    }
  }

  async function updateUser(userId: string, newData: Partial<UserData>) {
    try {
      // Ažuriramo podatke u kupci tabeli
      const kupciData = {
        ime_kupca: newData.ime_kupca,
        prezime_kupca: newData.prezime_kupca,
        adresa: newData.adresa,
        mesto: newData.mesto,
        id_post: newData.id_post
      };

      const { error: kupciError } = await supabase
        .from('kupci')
        .update(kupciData)
        .eq('id', userId);

      if (kupciError) throw kupciError;

      toast.success('Podaci o korisniku su uspešno ažurirani');
      fetchUsers();
    } catch (error) {
      console.error('Greška pri ažuriranju korisnika:', error);
      toast.error('Greška pri ažuriranju korisnika');
    }
    setEditingUser(null);
  }

  async function deleteUser(userId: string) {
    if (!confirm('Da li ste sigurni da želite da obrišete ovog korisnika?')) {
      return;
    }

    try {
      // Brišemo iz kupci tabele
      const { error: kupciError } = await supabase
        .from('kupci')
        .delete()
        .eq('id', userId);

      if (kupciError) {
        console.error('Greška pri brisanju iz kupci tabele:', kupciError);
        throw kupciError;
      }

      // Na kraju brišemo korisnika iz auth sistema
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);

      if (authError) {
        console.error(
          'Greška pri brisanju korisnika iz auth sistema:',
          authError
        );
        throw authError;
      }

      toast.success('Korisnik je uspešno obrisan');
      fetchUsers(); // Osvežavamo listu korisnika
    } catch (error) {
      console.error('Greška pri brisanju korisnika:', error);
      toast.error('Greška pri brisanju korisnika. Pokušajte ponovo.');
    }
  }

  async function addNewUser() {
    try {
      // Validacija email adrese
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
      if (!emailRegex.test(newUserEmail)) {
        toast.error('Unesite validnu email adresu');
        return;
      }

      // Validacija obaveznih polja
      if (!newUserPassword || newUserPassword.length < 6) {
        toast.error('Lozinka mora imati najmanje 6 karaktera');
        return;
      }

      if (!newUserData.ime_kupca || !newUserData.prezime_kupca) {
        toast.error('Ime i prezime su obavezna polja');
        return;
      }

      // Kreiramo korisnika u auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUserEmail.trim(),
        password: newUserPassword,
        options: {
          data: {
            full_name: `${newUserData.ime_kupca} ${newUserData.prezime_kupca}`
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Kreiramo podatke o kupcu
        const { error: kupciError } = await supabase.from('kupci').insert([
          {
            id: authData.user.id,
            email: newUserEmail,
            ...newUserData,
            status: 'registrovan'
          }
        ]);

        if (kupciError) throw kupciError;

        toast.success('Korisnik je uspešno dodat');
        setShowAddModal(false);
        setNewUserEmail('');
        setNewUserPassword('');
        setNewUserData({
          ime_kupca: '',
          prezime_kupca: '',
          adresa: '',
          mesto: '',
          id_post: ''
        });
        fetchUsers();
      }
    } catch (error) {
      console.error('Greška pri dodavanju korisnika:', error);
      toast.error('Greška pri dodavanju korisnika');
    }
  }

  function exportToCSV() {
    try {
      const headers = [
        'ID',
        'Email',
        'Ime',
        'Prezime',
        'Adresa',
        'Mesto',
        'Poštanski broj',
        'Status',
        'Datum registracije'
      ];
      const csvContent = [
        headers.join(','),
        ...users.map((user) =>
          [
            user.id,
            user.email || '',
            user.ime_kupca || '',
            user.prezime_kupca || '',
            user.adresa || '',
            user.mesto || '',
            user.id_post || '',
            user.status,
            new Date(user.created_at || '').toLocaleDateString('sr-RS')
          ].join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'korisnici.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Greška pri izvozu:', error);
      toast.error('Greška pri izvozu u CSV');
    }
  }

  const handleModalClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setShowAddModal(false);
    }
  };

  async function setUserAsAdmin(userId: string) {
    try {
      if (!currentUser) {
        toast.error('Morate biti prijavljeni da biste izvršili ovu akciju');
        return;
      }

      // Koristimo funkciju za ažuriranje statusa korisnika
      const { error } = await supabase.rpc('azuriraj_status_korisnika', {
        p_user_id: userId,
        p_status: 'administrator'
      });

      if (error) throw error;

      toast.success('Korisnik je uspešno postavljen kao administrator');
      fetchUsers();
    } catch (error: any) {
      console.error('Greška pri postavljanju administratora:', error);
      toast.error(error.message || 'Greška pri postavljanju administratora');
    }
  }

  if (loading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-600'></div>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='flex justify-end items-center mb-4'>
        <div className='flex space-x-2'>
          <button
            onClick={exportToCSV}
            className='inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500'
          >
            <Download className='h-5 w-5 mr-2' />
            Izvezi u CSV
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className='inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500'
          >
            <UserPlus className='h-5 w-5 mr-2' />
            Dodaj Korisnika
          </button>
        </div>
      </div>

      {showAddModal && (
        <div
          className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'
          onClick={handleModalClick}
        >
          <div className='bg-white rounded-lg shadow-xl w-full max-w-md mx-4'>
            <div className='px-6 py-4 border-b border-gray-200'>
              <h3 className='text-lg font-medium text-gray-900'>
                Dodaj Novog Korisnika
              </h3>
            </div>
            <div className='p-6 space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Email
                </label>
                <input
                  type='email'
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500'
                  placeholder='Unesite email adresu'
                  title='Email adresa korisnika'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Lozinka
                </label>
                <input
                  type='password'
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500'
                  placeholder='Unesite lozinku'
                  title='Lozinka korisnika'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Ime
                </label>
                <input
                  type='text'
                  value={newUserData.ime_kupca}
                  onChange={(e) =>
                    setNewUserData({
                      ...newUserData,
                      ime_kupca: e.target.value
                    })
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500'
                  placeholder='Unesite ime'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Prezime
                </label>
                <input
                  type='text'
                  value={newUserData.prezime_kupca}
                  onChange={(e) =>
                    setNewUserData({
                      ...newUserData,
                      prezime_kupca: e.target.value
                    })
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500'
                  placeholder='Unesite prezime'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Adresa
                </label>
                <input
                  type='text'
                  value={newUserData.adresa}
                  onChange={(e) =>
                    setNewUserData({ ...newUserData, adresa: e.target.value })
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500'
                  placeholder='Unesite adresu'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Mesto
                </label>
                <input
                  type='text'
                  value={newUserData.mesto}
                  onChange={(e) =>
                    setNewUserData({ ...newUserData, mesto: e.target.value })
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500'
                  placeholder='Unesite mesto'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Poštanski broj
                </label>
                <input
                  type='text'
                  value={newUserData.id_post}
                  onChange={(e) =>
                    setNewUserData({ ...newUserData, id_post: e.target.value })
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500'
                  placeholder='Unesite poštanski broj'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Status
                </label>
                <input
                  type='text'
                  value='Registrovan'
                  disabled
                  className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500'
                  title='Svi novi korisnici su automatski registrovani'
                />
                <p className='mt-1 text-sm text-gray-500'>
                  Svi novi korisnici su automatski registrovani. Administrator
                  status se može dodeliti samo kroz admin panel.
                </p>
              </div>
            </div>
            <div className='px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-2'>
              <button
                onClick={() => setShowAddModal(false)}
                className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500'
              >
                Otkaži
              </button>
              <button
                onClick={addNewUser}
                className='px-4 py-2 text-sm font-medium text-white bg-yellow-600 border border-transparent rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500'
              >
                Dodaj
              </button>
            </div>
          </div>
        </div>
      )}

      <div className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Korisnik
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Kontakt
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Status
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
                  <div className='flex items-center'>
                    <div className='flex-shrink-0 h-10 w-10'>
                      <User className='h-10 w-10 text-gray-400' />
                    </div>
                    <div className='ml-4'>
                      <div className='text-sm font-medium text-gray-900'>
                        {editingUser === user.id ? (
                          <div className='space-y-2 min-w-[200px]'>
                            <div>
                              <label className='block text-xs text-gray-500 mb-1'>
                                Ime
                              </label>
                              <input
                                type='text'
                                value={
                                  editData.ime_kupca || user.ime_kupca || ''
                                }
                                onChange={(e) =>
                                  setEditData({
                                    ...editData,
                                    ime_kupca: e.target.value
                                  })
                                }
                                className='w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500'
                                placeholder='Ime'
                              />
                            </div>
                            <div>
                              <label className='block text-xs text-gray-500 mb-1'>
                                Prezime
                              </label>
                              <input
                                type='text'
                                value={
                                  editData.prezime_kupca ||
                                  user.prezime_kupca ||
                                  ''
                                }
                                onChange={(e) =>
                                  setEditData({
                                    ...editData,
                                    prezime_kupca: e.target.value
                                  })
                                }
                                className='w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500'
                                placeholder='Prezime'
                              />
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className='font-medium'>
                              {user.ime_kupca} {user.prezime_kupca}
                            </div>
                            <div className='text-sm text-gray-500'>
                              {user.email}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  {editingUser === user.id ? (
                    <div className='space-y-2 min-w-[250px]'>
                      <div>
                        <label className='block text-xs text-gray-500 mb-1'>
                          Adresa
                        </label>
                        <div className='flex items-center'>
                          <MapPin className='h-4 w-4 text-gray-400 mr-2 flex-shrink-0' />
                          <input
                            type='text'
                            value={editData.adresa || user.adresa || ''}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                adresa: e.target.value
                              })
                            }
                            className='w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500'
                            placeholder='Adresa'
                          />
                        </div>
                      </div>
                      <div>
                        <label className='block text-xs text-gray-500 mb-1'>
                          Mesto
                        </label>
                        <div className='flex items-center ml-6'>
                          <input
                            type='text'
                            value={editData.mesto || user.mesto || ''}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                mesto: e.target.value
                              })
                            }
                            className='w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500'
                            placeholder='Mesto'
                          />
                        </div>
                      </div>
                      <div>
                        <label className='block text-xs text-gray-500 mb-1'>
                          Poštanski broj
                        </label>
                        <div className='flex items-center ml-6'>
                          <input
                            type='text'
                            value={editData.id_post || user.id_post || ''}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                id_post: e.target.value
                              })
                            }
                            className='w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500'
                            placeholder='Poštanski broj'
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className='space-y-1'>
                      {user.adresa && (
                        <div className='flex items-center text-sm text-gray-500'>
                          <MapPin className='h-4 w-4 text-gray-400 mr-2' />
                          {user.adresa}
                        </div>
                      )}
                      {user.mesto && (
                        <div className='flex items-center text-sm text-gray-500 ml-6'>
                          {user.mesto}
                          {user.id_post && `, ${user.id_post}`}
                        </div>
                      )}
                    </div>
                  )}
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  {editingUser === user.id ? (
                    <div className='flex flex-col space-y-2'>
                      <div>
                        <label className='block text-xs text-gray-500 mb-1'>
                          Status
                        </label>
                        <select
                          value={editData.status || user.status}
                          onChange={(e) =>
                            setEditData({ ...editData, status: e.target.value })
                          }
                          disabled
                          className='w-full px-2 py-1 text-sm rounded-md border-gray-300 shadow-sm bg-gray-50 text-gray-500'
                          title='Status se može menjati samo kroz admin panel'
                        >
                          <option value='registrovan'>Registrovan</option>
                          <option value='administrator'>Administrator</option>
                        </select>
                        <p className='text-xs text-gray-500 mt-1'>
                          Status se može menjati samo kroz admin panel
                        </p>
                      </div>
                      <div className='flex items-center justify-end space-x-2 mt-4'>
                        <button
                          onClick={() => updateUser(user.id, editData)}
                          className='inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                          title='Sačuvaj promene'
                        >
                          <Check className='h-4 w-4 mr-1' />
                          Sačuvaj
                        </button>
                        <button
                          onClick={() => {
                            setEditingUser(null);
                            setEditData({});
                          }}
                          className='inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                          title='Otkaži izmene'
                        >
                          <X className='h-4 w-4 mr-1' />
                          Otkaži
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className='flex items-center space-x-2'>
                      <span className='px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800'>
                        {user.status}
                      </span>
                      <button
                        onClick={() => {
                          setEditingUser(user.id);
                          setEditData({
                            status: user.status,
                            ime_kupca: user.ime_kupca,
                            prezime_kupca: user.prezime_kupca,
                            adresa: user.adresa,
                            mesto: user.mesto,
                            id_post: user.id_post
                          });
                        }}
                        className='text-yellow-600 hover:text-yellow-900'
                        title='Izmeni podatke'
                      >
                        <Pencil className='h-5 w-5' />
                      </button>
                      {isAdmin && user.status !== 'administrator' && (
                        <button
                          onClick={() => setUserAsAdmin(user.id)}
                          className='text-blue-600 hover:text-blue-900'
                          title='Postavi kao administratora'
                        >
                          <Shield className='h-5 w-5' />
                        </button>
                      )}
                    </div>
                  )}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                  <button
                    onClick={() => deleteUser(user.id)}
                    className='text-red-600 hover:text-red-900'
                    title='Obriši korisnika'
                  >
                    <Trash2 className='h-5 w-5' />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
