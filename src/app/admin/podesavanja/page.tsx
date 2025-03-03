'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { Save } from 'lucide-react';

interface Settings {
  site_name: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  delivery_fee: number;
  min_order_free_delivery: number;
}

export default function AdminSettingsPage() {
  const { isAdmin, loading } = useAuth();
  const router = useRouter();
  const [settings, setSettings] = useState<Settings>({
    site_name: 'TOP DOM Market',
    contact_email: 'info@topdom.rs',
    contact_phone: '+381 11 123 4567',
    address: 'Beograd, Srbija',
    delivery_fee: 300,
    min_order_free_delivery: 3000
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/');
    } else if (isAdmin) {
      fetchSettings();
    }
  }, [isAdmin, loading, router]);

  async function fetchSettings() {
    try {
      const { data, error } = await supabase
        .from('podesavanja')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Greška pri učitavanju podešavanja:', error);
      toast.error('Greška pri učitavanju podešavanja');
    }
  }

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);

    try {
      const { data, error } = await supabase
        .from('podesavanja')
        .upsert(settings, { onConflict: 'id' })
        .select()
        .single();

      if (error) throw error;

      toast.success('Podešavanja su uspešno sačuvana');
      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Greška pri čuvanju podešavanja:', error);
      toast.error('Greška pri čuvanju podešavanja');
    } finally {
      setIsSaving(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'number' ? parseFloat(value) : value
    });
  }

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 p-8'>
        <div className='animate-pulse space-y-4'>
          <div className='h-8 bg-gray-200 rounded w-1/4'></div>
          <div className='h-64 bg-gray-200 rounded'></div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Redirekcija će se desiti u useEffect-u
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-4xl mx-auto'>
        <div className='bg-white rounded-xl shadow-lg overflow-hidden'>
          <div className='p-6'>
            <h1 className='text-2xl font-bold mb-6'>Podešavanja sistema</h1>

            <form onSubmit={saveSettings} className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Naziv sajta
                  </label>
                  <input
                    type='text'
                    name='site_name'
                    value={settings.site_name}
                    onChange={handleChange}
                    className='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
                    required
                    title='Naziv sajta'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Kontakt email
                  </label>
                  <input
                    type='email'
                    name='contact_email'
                    value={settings.contact_email}
                    onChange={handleChange}
                    className='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
                    required
                    title='Kontakt email'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Kontakt telefon
                  </label>
                  <input
                    type='text'
                    name='contact_phone'
                    value={settings.contact_phone}
                    onChange={handleChange}
                    className='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
                    required
                    title='Kontakt telefon'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Adresa
                  </label>
                  <input
                    type='text'
                    name='address'
                    value={settings.address}
                    onChange={handleChange}
                    className='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
                    required
                    title='Adresa'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Cena dostave (RSD)
                  </label>
                  <input
                    type='number'
                    name='delivery_fee'
                    value={settings.delivery_fee}
                    onChange={handleChange}
                    className='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
                    min='0'
                    step='10'
                    required
                    title='Cena dostave'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Minimalna porudžbina za besplatnu dostavu (RSD)
                  </label>
                  <input
                    type='number'
                    name='min_order_free_delivery'
                    value={settings.min_order_free_delivery}
                    onChange={handleChange}
                    className='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
                    min='0'
                    step='100'
                    required
                    title='Minimalna porudžbina za besplatnu dostavu'
                  />
                </div>
              </div>

              <div className='flex justify-end'>
                <button
                  type='submit'
                  disabled={isSaving}
                  className='flex items-center space-x-2 px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50'
                >
                  <Save className='h-5 w-5' />
                  <span>{isSaving ? 'Čuvanje...' : 'Sačuvaj podešavanja'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
