'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { User, Mail, Phone, MapPin } from 'lucide-react';

type ProfileFormData = {
  ime_kupca: string;
  prezime_kupca: string;
  email: string;
  adresa: string;
  mesto: string;
  id_post: string;
  broj_telefona: string;
};

export default function UserProfile() {
  const { user, userProfile } = useAuth();
  const [formData, setFormData] = useState<ProfileFormData>({
    ime_kupca: '',
    prezime_kupca: '',
    email: '',
    adresa: '',
    mesto: '',
    id_post: '',
    broj_telefona: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [purchasedProducts, setPurchasedProducts] = useState<
    {
      id: string;
      kreirano: string;
      cena_ukupno: number;
      status_porudzbine: string;
      stavke: {
        id: string;
        id_proizvoda: string;
        kolicina: number;
        cena: number;
        proizvod: {
          naziv_proizvoda: string;
          cena: number;
        };
      }[];
    }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Učitavamo podatke o profilu kada se komponenta montira
  useEffect(() => {
    if (!user) return;

    const fetchUserData = async () => {
      try {
        console.log('Dohvatanje profila za korisnika:', user.id);

        // Prvo proveravamo da li profil već postoji koristeći funkciju check_user_profile_exists
        const { data: exists, error: checkError } = await supabase.rpc(
          'check_user_profile_exists',
          { user_id: user.id }
        );

        if (checkError) {
          console.error('Greška pri proveri postojanja korisnika:', checkError);
          return;
        }

        console.log('Profil postoji:', exists);

        let profileData;

        // Ako profil postoji, dohvatamo ga koristeći funkciju get_user_profile
        if (exists) {
          const { data: profile, error: fetchError } = await supabase
            .rpc('get_user_profile', { user_id: user.id })
            .single();

          if (fetchError) {
            console.error('Greška pri dohvatanju profila:', fetchError);
            return;
          }

          profileData = profile;
          console.log('Dohvaćen profil:', profileData);
        } else {
          // Ako profil ne postoji, kreiramo novi koristeći funkciju create_user_profile
          console.log('Kreiranje novog profila za korisnika:', user.id);

          const { data: newProfile, error: createError } = await supabase.rpc(
            'create_user_profile',
            {
              user_id: user.id,
              email: user.email || null
            }
          );

          if (createError) {
            console.error('Greška pri kreiranju profila:', createError);
            return;
          }

          profileData = newProfile;
          console.log('Kreiran novi profil:', profileData);
        }

        if (profileData) {
          setFormData({
            ime_kupca: profileData.ime_kupca || '',
            prezime_kupca: profileData.prezime_kupca || '',
            email: profileData.email || '',
            adresa: profileData.adresa || '',
            mesto: profileData.mesto || '',
            id_post: profileData.id_post || '',
            broj_telefona: profileData.broj_telefona || ''
          });
          setIsEditing(!profileData.ime_kupca); // Ako nema imena, prikazujemo formu
        }
      } catch (err) {
        console.error('Greška pri dohvatanju korisničkih podataka:', err);
      }
    };

    const fetchPurchasedProducts = async () => {
      try {
        // Dohvatamo porudžbine korisnika
        const { data, error } = await supabase
          .from('porudzbine')
          .select('id, kreirano, cena_ukupno, status_porudzbine')
          .eq('id_kupca', user.id);

        if (error) {
          console.error('Greška pri dohvatanju porudžbina:', error);
          return;
        }

        if (data && data.length > 0) {
          // Dohvatamo stavke porudžbina i proizvode
          const ordersWithItems = await Promise.all(
            data.map(async (order) => {
              const { data: stavke, error: stavkeError } = await supabase
                .from('stavke_porudzbine')
                .select('id, id_proizvoda, kolicina, cena')
                .eq('id_porudzbine', order.id);

              if (stavkeError) {
                console.error(
                  'Greška pri dohvatanju stavki porudžbine:',
                  stavkeError
                );
                return { ...order, stavke: [] };
              }

              // Dohvatamo proizvode za svaku stavku
              const stavkeWithProducts = await Promise.all(
                stavke.map(async (stavka) => {
                  const { data: proizvod, error: proizvodError } =
                    await supabase
                      .from('proizvodi')
                      .select('naziv_proizvoda, cena')
                      .eq('id', stavka.id_proizvoda)
                      .single();

                  if (proizvodError) {
                    console.error(
                      'Greška pri dohvatanju proizvoda:',
                      proizvodError
                    );
                    return {
                      ...stavka,
                      proizvod: {
                        naziv_proizvoda: 'Nepoznat proizvod',
                        cena: 0
                      }
                    };
                  }

                  return { ...stavka, proizvod };
                })
              );

              return { ...order, stavke: stavkeWithProducts };
            })
          );

          setPurchasedProducts(ordersWithItems);
        } else {
          setPurchasedProducts([]);
        }
      } catch (err) {
        console.error('Greška pri dohvatanju kupljenih proizvoda:', err);
      }
    };

    fetchUserData();
    fetchPurchasedProducts();
  }, [user]);

  // Funkcija za slanje forme
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setIsSubmitting(true);
      console.log('Ažuriranje profila za korisnika:', user.id);
      console.log('Podaci za ažuriranje:', formData);

      // Koristimo RPC funkciju za ažuriranje profila
      const { data, error } = await supabase.rpc('update_user_profile', {
        user_id: user.id,
        p_ime_kupca: formData.ime_kupca,
        p_prezime_kupca: formData.prezime_kupca,
        p_email: formData.email,
        p_adresa: formData.adresa,
        p_mesto: formData.mesto,
        p_id_post: formData.id_post,
        p_broj_telefona: formData.broj_telefona
      });

      if (error) {
        console.error('Greška pri ažuriranju profila:', error);
        toast.error('Došlo je do greške pri ažuriranju profila.');
        return;
      }

      console.log('Profil uspešno ažuriran:', data);
      toast.success('Profil je uspešno ažuriran!');
      setIsEditing(false);
    } catch (err) {
      console.error('Greška:', err);
      toast.error('Došlo je do greške pri ažuriranju profila.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className='p-8'>
        <div className='bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto text-center'>
          <div className='mb-6'>
            <div className='flex flex-col items-center justify-center space-y-4'>
              <div className='bg-yellow-100 p-4 rounded-full'>
                <User className='h-8 w-8 text-yellow-600' />
              </div>
              <div>
                <h2 className='text-xl font-semibold mb-2'>
                  Niste prijavljeni
                </h2>
                <p className='text-gray-600 mb-6'>
                  Prijavite se da biste pristupili svom profilu
                </p>
              </div>
            </div>
            <div className='space-y-4'>
              <a
                href='/login'
                className='inline-block w-full bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition-colors'
              >
                Prijava
              </a>
              <p className='text-gray-600'>
                Nemate nalog?{' '}
                <a
                  href='/register'
                  className='text-yellow-600 hover:text-yellow-700 font-medium'
                >
                  Registrujte se
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='p-8'>
      <h1 className='text-2xl font-bold mb-6'>Moj profil</h1>

      <div className='bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto'>
        <div className='mb-6'>
          <div className='flex items-center space-x-4'>
            <div className='bg-yellow-100 p-3 rounded-full'>
              <User className='h-6 w-6 text-yellow-600' />
            </div>
            <div>
              <h2 className='text-lg font-semibold'>Korisnički podaci</h2>
              <p className='text-gray-600 text-sm'>{user?.email}</p>
              {userProfile && (
                <p className='text-gray-600 text-sm'>
                  Uloga:{' '}
                  {userProfile.status === 'administrator'
                    ? 'Administrator'
                    : 'Korisnik'}
                </p>
              )}
            </div>
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Ime
                </label>
                <input
                  type='text'
                  name='ime_kupca'
                  value={formData.ime_kupca}
                  onChange={(e) =>
                    setFormData({ ...formData, ime_kupca: e.target.value })
                  }
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent'
                  placeholder='Unesite vaše ime'
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Prezime
                </label>
                <input
                  type='text'
                  name='prezime_kupca'
                  value={formData.prezime_kupca}
                  onChange={(e) =>
                    setFormData({ ...formData, prezime_kupca: e.target.value })
                  }
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent'
                  placeholder='Unesite vaše prezime'
                  required
                />
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Email
              </label>
              <input
                type='email'
                name='email'
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent'
                placeholder='Unesite vaš email'
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Broj telefona
              </label>
              <div className='relative'>
                <input
                  type='tel'
                  name='broj_telefona'
                  value={formData.broj_telefona}
                  onChange={(e) =>
                    setFormData({ ...formData, broj_telefona: e.target.value })
                  }
                  className='w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent'
                  placeholder='Unesite vaš broj telefona'
                  required
                />
                <Phone className='h-5 w-5 text-yellow-400 absolute left-3 top-1/2 transform -translate-y-1/2' />
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Adresa
              </label>
              <div className='relative'>
                <input
                  type='text'
                  name='adresa'
                  value={formData.adresa}
                  onChange={(e) =>
                    setFormData({ ...formData, adresa: e.target.value })
                  }
                  className='w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent'
                  placeholder='Unesite vašu adresu'
                  required
                />
                <MapPin className='h-5 w-5 text-yellow-400 absolute left-3 top-1/2 transform -translate-y-1/2' />
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Mesto
              </label>
              <input
                type='text'
                name='mesto'
                value={formData.mesto}
                onChange={(e) =>
                  setFormData({ ...formData, mesto: e.target.value })
                }
                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent'
                placeholder='Unesite vaše mesto'
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Poštanski broj
              </label>
              <input
                type='text'
                name='id_post'
                value={formData.id_post}
                onChange={(e) =>
                  setFormData({ ...formData, id_post: e.target.value })
                }
                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent'
                placeholder='Unesite poštanski broj'
                required
              />
            </div>

            <button
              type='submit'
              disabled={isSubmitting}
              className='w-full bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isSubmitting ? 'Ažuriranje...' : 'Sačuvaj promene'}
            </button>
          </form>
        ) : (
          <div className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <h3 className='text-sm font-medium text-gray-500'>
                  Ime i prezime
                </h3>
                <p className='mt-1 text-lg'>
                  {formData.ime_kupca} {formData.prezime_kupca}
                </p>
              </div>
              <div>
                <h3 className='text-sm font-medium text-gray-500'>Email</h3>
                <p className='mt-1 text-lg'>{formData.email}</p>
              </div>
            </div>

            <div>
              <h3 className='text-sm font-medium text-gray-500'>
                Broj telefona
              </h3>
              <p className='mt-1 text-lg flex items-center'>
                <Phone className='h-5 w-5 text-yellow-400 mr-2' />
                {formData.broj_telefona || 'Nije unet'}
              </p>
            </div>

            <div>
              <h3 className='text-sm font-medium text-gray-500'>Adresa</h3>
              <p className='mt-1 text-lg flex items-center'>
                <MapPin className='h-5 w-5 text-yellow-400 mr-2' />
                {formData.adresa}
              </p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <h3 className='text-sm font-medium text-gray-500'>Mesto</h3>
                <p className='mt-1 text-lg'>{formData.mesto}</p>
              </div>
              <div>
                <h3 className='text-sm font-medium text-gray-500'>
                  Poštanski broj
                </h3>
                <p className='mt-1 text-lg'>{formData.id_post}</p>
              </div>
            </div>

            <button
              onClick={() => setIsEditing(true)}
              className='mt-4 w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors'
            >
              Izmeni podatke
            </button>
          </div>
        )}

        <h2 className='text-2xl font-bold mt-6 mb-4'>Kupljeni proizvodi</h2>
        <ul className='list-disc pl-8'>
          {purchasedProducts.length > 0 ? (
            purchasedProducts.map((order) => (
              <li key={order.id} className='mb-4'>
                <p className='font-semibold'>
                  Datum: {new Date(order.kreirano).toLocaleDateString('sr-RS')}
                </p>
                <p>Status: {order.status_porudzbine}</p>
                <p>Ukupna cena: {order.cena_ukupno} RSD</p>
                <ul className='list-disc pl-8'>
                  {order.stavke &&
                    order.stavke.map((stavka) => (
                      <li key={stavka.id} className='my-1'>
                        {stavka.proizvod?.naziv_proizvoda ||
                          'Nepoznat proizvod'}{' '}
                        - {stavka.cena || stavka.proizvod?.cena || 0} RSD
                        {stavka.kolicina > 1
                          ? ` (Količina: ${stavka.kolicina})`
                          : ''}
                      </li>
                    ))}
                </ul>
              </li>
            ))
          ) : (
            <li>Nemate kupljenih proizvoda</li>
          )}
        </ul>

        <div className='mt-6'>
          <a
            href='/pretraga'
            className='w-full inline-block bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition-colors text-center'
          >
            Pretraži proizvode
          </a>
        </div>

        <div className='mt-4'>
          <button
            onClick={() => window.history.back()}
            className='w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors'
          >
            Natrag
          </button>
        </div>
      </div>
    </div>
  );
}
