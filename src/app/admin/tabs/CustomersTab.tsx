'use client';

import { useState, useEffect } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Search,
  Download,
  Pencil,
  Check,
  X
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { exportToCSV } from '@/lib/utils/csv-export';
import type { Database } from '@/types/supabase';

type Customer = Database['public']['Tables']['kupci']['Row'];

export default function CustomersTab() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCustomer, setEditingCustomer] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Customer>>({});

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

  async function updateCustomer(
    customerId: string,
    newData: Partial<Customer>
  ) {
    try {
      const { error } = await supabase
        .from('kupci')
        .update({
          ime_kupca: newData.ime_kupca,
          prezime_kupca: newData.prezime_kupca,
          email: newData.email,
          adresa: newData.adresa,
          mesto: newData.mesto,
          id_post: newData.id_post,
          broj_telefona: newData.broj_telefona
        })
        .eq('id', customerId);

      if (error) throw error;

      toast.success('Podaci o kupcu su uspešno ažurirani');
      fetchCustomers();
      setEditingCustomer(null);
      setEditData({});
    } catch (error) {
      console.error('Greška pri ažuriranju kupca:', error);
      toast.error('Greška pri ažuriranju kupca');
    }
  }

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.ime_kupca?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.prezime_kupca
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (customer.email?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  async function handleExportCSV() {
    try {
      const customersForExport = customers.map((customer) => ({
        ID: customer.id,
        Ime: customer.ime_kupca,
        Prezime: customer.prezime_kupca,
        Email: customer.email || '',
        'Broj telefona': customer.broj_telefona || '',
        Adresa: customer.adresa,
        Mesto: customer.mesto,
        'Poštanski broj': customer.id_post,
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
                  <div className='space-y-2 flex-grow'>
                    {editingCustomer === customer.id ? (
                      <div className='space-y-4'>
                        <div className='grid grid-cols-2 gap-4'>
                          <div>
                            <label className='block text-xs text-gray-500 mb-1'>
                              Ime
                            </label>
                            <input
                              type='text'
                              value={
                                editData.ime_kupca || customer.ime_kupca || ''
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
                                customer.prezime_kupca ||
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

                        <div>
                          <label className='block text-xs text-gray-500 mb-1'>
                            Email
                          </label>
                          <input
                            type='email'
                            value={editData.email || customer.email || ''}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                email: e.target.value
                              })
                            }
                            className='w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500'
                            placeholder='Email'
                          />
                        </div>

                        <div>
                          <label className='block text-xs text-gray-500 mb-1'>
                            Broj telefona
                          </label>
                          <input
                            type='tel'
                            value={
                              editData.broj_telefona ||
                              customer.broj_telefona ||
                              ''
                            }
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                broj_telefona: e.target.value
                              })
                            }
                            className='w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500'
                            placeholder='Broj telefona'
                          />
                        </div>

                        <div>
                          <label className='block text-xs text-gray-500 mb-1'>
                            Adresa
                          </label>
                          <input
                            type='text'
                            value={editData.adresa || customer.adresa || ''}
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

                        <div className='grid grid-cols-2 gap-4'>
                          <div>
                            <label className='block text-xs text-gray-500 mb-1'>
                              Mesto
                            </label>
                            <input
                              type='text'
                              value={editData.mesto || customer.mesto || ''}
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
                          <div>
                            <label className='block text-xs text-gray-500 mb-1'>
                              Poštanski broj
                            </label>
                            <input
                              type='text'
                              value={editData.id_post || customer.id_post || ''}
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

                        <div className='flex justify-end space-x-2 mt-4'>
                          <button
                            onClick={() =>
                              updateCustomer(customer.id, editData)
                            }
                            className='inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                          >
                            <Check className='h-4 w-4 mr-1.5' />
                            Sačuvaj
                          </button>
                          <button
                            onClick={() => {
                              setEditingCustomer(null);
                              setEditData({});
                            }}
                            className='inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                          >
                            <X className='h-4 w-4 mr-1.5' />
                            Otkaži
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className='flex items-center justify-between'>
                          <h3 className='font-medium text-gray-900'>
                            {customer.ime_kupca} {customer.prezime_kupca}
                          </h3>
                          <button
                            onClick={() => {
                              setEditingCustomer(customer.id);
                              setEditData({
                                ime_kupca: customer.ime_kupca,
                                prezime_kupca: customer.prezime_kupca,
                                email: customer.email,
                                broj_telefona: customer.broj_telefona,
                                adresa: customer.adresa,
                                mesto: customer.mesto,
                                id_post: customer.id_post
                              });
                            }}
                            className='text-yellow-600 hover:text-yellow-900'
                            title='Izmeni podatke'
                          >
                            <Pencil className='h-5 w-5' />
                          </button>
                        </div>
                        <div className='space-y-1 text-sm text-gray-500'>
                          {customer.email && (
                            <div className='flex items-center space-x-2'>
                              <Mail className='h-4 w-4' />
                              <span>{customer.email}</span>
                            </div>
                          )}
                          {customer.broj_telefona && (
                            <div className='flex items-center space-x-2'>
                              <Phone className='h-4 w-4' />
                              <span>{customer.broj_telefona}</span>
                            </div>
                          )}
                          {customer.adresa && (
                            <div className='flex items-center space-x-2'>
                              <MapPin className='h-4 w-4' />
                              <span>
                                {customer.adresa}, {customer.mesto}{' '}
                                {customer.id_post}
                              </span>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                  <div className='text-sm text-gray-500 ml-4'>
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
