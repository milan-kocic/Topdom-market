'use client';

import { useState } from 'react';
import { Save, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase/client';

interface Settings {
  site_name: string;
  contact_email: string;
  phone: string;
  address: string;
  working_hours: string;
  about_text: string;
}

export default function SettingsTab() {
  const [settings, setSettings] = useState<Settings>({
    site_name: 'TopDom Market',
    contact_email: '',
    phone: '',
    address: '',
    working_hours: '',
    about_text: ''
  });

  const [loading, setLoading] = useState(false);

  async function saveSettings() {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('settings')
        .upsert([settings], { onConflict: 'site_name' });

      if (error) throw error;

      toast.success('Podešavanja su uspešno sačuvana');
    } catch (error) {
      console.error('Greška pri čuvanju podešavanja:', error);
      toast.error('Greška pri čuvanju podešavanja');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='space-y-6'>
      <div className='bg-white shadow-sm rounded-lg'>
        <div className='px-4 py-5 sm:p-6'>
          <h3 className='text-lg font-medium leading-6 text-gray-900 mb-4'>
            Osnovna podešavanja
          </h3>
          <div className='grid grid-cols-1 gap-6'>
            <div>
              <label
                htmlFor='site_name'
                className='block text-sm font-medium text-gray-700'
              >
                Naziv sajta
              </label>
              <input
                type='text'
                name='site_name'
                id='site_name'
                value={settings.site_name}
                onChange={(e) =>
                  setSettings({ ...settings, site_name: e.target.value })
                }
                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500'
              />
            </div>

            <div>
              <label
                htmlFor='contact_email'
                className='block text-sm font-medium text-gray-700'
              >
                Kontakt email
              </label>
              <input
                type='email'
                name='contact_email'
                id='contact_email'
                value={settings.contact_email}
                onChange={(e) =>
                  setSettings({ ...settings, contact_email: e.target.value })
                }
                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500'
              />
            </div>

            <div>
              <label
                htmlFor='phone'
                className='block text-sm font-medium text-gray-700'
              >
                Telefon
              </label>
              <input
                type='tel'
                name='phone'
                id='phone'
                value={settings.phone}
                onChange={(e) =>
                  setSettings({ ...settings, phone: e.target.value })
                }
                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500'
              />
            </div>

            <div>
              <label
                htmlFor='address'
                className='block text-sm font-medium text-gray-700'
              >
                Adresa
              </label>
              <input
                type='text'
                name='address'
                id='address'
                value={settings.address}
                onChange={(e) =>
                  setSettings({ ...settings, address: e.target.value })
                }
                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500'
              />
            </div>

            <div>
              <label
                htmlFor='working_hours'
                className='block text-sm font-medium text-gray-700'
              >
                Radno vreme
              </label>
              <input
                type='text'
                name='working_hours'
                id='working_hours'
                value={settings.working_hours}
                onChange={(e) =>
                  setSettings({ ...settings, working_hours: e.target.value })
                }
                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500'
                placeholder='npr. Pon-Pet: 09-17h, Sub: 09-14h'
              />
            </div>

            <div>
              <label
                htmlFor='about_text'
                className='block text-sm font-medium text-gray-700'
              >
                O nama
              </label>
              <textarea
                name='about_text'
                id='about_text'
                rows={4}
                value={settings.about_text}
                onChange={(e) =>
                  setSettings({ ...settings, about_text: e.target.value })
                }
                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500'
              />
            </div>
          </div>
        </div>
        <div className='px-4 py-3 bg-gray-50 text-right sm:px-6'>
          <button
            onClick={saveSettings}
            disabled={loading}
            className='inline-flex justify-center items-center rounded-md border border-transparent bg-yellow-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {loading ? (
              <>
                <RefreshCw className='animate-spin -ml-1 mr-2 h-4 w-4' />
                Čuvanje...
              </>
            ) : (
              <>
                <Save className='-ml-1 mr-2 h-4 w-4' />
                Sačuvaj promene
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
