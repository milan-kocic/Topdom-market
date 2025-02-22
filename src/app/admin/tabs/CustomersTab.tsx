'use client';

import { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Search, Download } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { exportToCSV } from '@/lib/utils/csv-export';

type Customer = {
  id: string;
  ime_kupca: string;
  prezime_kupca: string;
  email: string;
  telefon: string;
  adresa: string;
  mesto: string;
  kreirano: string;
};

export default function CustomersTab() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    try {
      const { data, error } = await supabase
        .from('kupci')
        .select('*')
        .order('kreirano', { ascending: false });

      if (error) {
        console.error(
          'Supabase error:',
          error.message,
          error.details,
          error.hint
        );
        throw error;
      }

      console.log('Fetched customers:', data);
      setCustomers(data || []);
    } catch (error) {
      const err = error as any;
      console.error('Error fetching customers:', {
        message: err?.message,
        details: err?.details,
        hint: err?.hint
      });
      toast.error('Greška pri učitavanju kupaca. Molimo pokušajte ponovo.');
    } finally {
      setLoading(false);
    }
  }

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.ime_kupca.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.prezime_kupca
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  async function handleExportCSV() {
    try {
      const customersForExport = customers.map((customer) => ({
        ID: customer.id,
        Ime: customer.ime_kupca,
        Prezime: customer.prezime_kupca,
        Email: customer.email,
        Telefon: customer.telefon,
        Adresa: customer.adresa,
        Mesto: customer.mesto,
        'Datum registracije': new Date(customer.kreirano).toLocaleDateString(
          'sr-RS'
        )
      }));

      exportToCSV(customersForExport, 'kupci');
      toast.success('Kupci uspešno izvezeni');
    } catch (error) {
      console.error('Error exporting customers:', error);
      toast.error('Greška pri izvozu kupaca');
    }
  }

  return (
    <div>
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8'>
        <div>
          <h1 className='text-3xl font-bold'>Kupci</h1>
          <p className='text-gray-600 mt-1'>
            Upravljajte kupcima i njihovim podacima
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className='flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors'
        >
          <Download className='h-5 w-5' />
          <span>Izvezi CSV</span>
        </button>
      </div>

      <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
        <div className='p-4 border-b border-gray-200'>
          <div className='relative'>
            <input
              type='text'
              placeholder='Pretraži kupce...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent'
              aria-label='Pretraži kupce'
            />
            <Search className='h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2' />
          </div>
        </div>

        <div className='divide-y divide-gray-200'>
          {loading ? (
            <div className='p-8 text-center text-gray-500'>
              Učitavanje kupaca...
            </div>
          ) : filteredCustomers.length > 0 ? (
            filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                className='p-4 hover:bg-gray-50 transition-colors'
              >
                <div className='flex items-start justify-between'>
                  <div>
                    <h3 className='font-medium text-gray-900'>
                      {customer.ime_kupca} {customer.prezime_kupca}
                    </h3>
                    <div className='mt-2 space-y-1 text-sm text-gray-500'>
                      <div className='flex items-center space-x-2'>
                        <Mail className='h-4 w-4' />
                        <span>{customer.email}</span>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <Phone className='h-4 w-4' />
                        <span>{customer.telefon}</span>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <MapPin className='h-4 w-4' />
                        <span>
                          {customer.adresa}, {customer.mesto}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className='text-sm text-gray-500'>
                    Član od:{' '}
                    {new Date(customer.kreirano).toLocaleDateString('sr-RS')}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className='p-8 text-center text-gray-500'>
              Nema pronađenih kupaca
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
