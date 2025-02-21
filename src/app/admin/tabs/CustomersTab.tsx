'use client';

import { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Search, Download } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { exportToCSV } from '@/lib/utils/csv-export';
import toast from 'react-hot-toast';
import type { Database } from '@/lib/types/database.types';

type Customer = Database['public']['Tables']['kupci']['Row'];

export default function CustomersTab() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('kupci')
        .select('*')
        .order('kreirano', { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Greška pri učitavanju kupaca');
    } finally {
      setLoading(false);
    }
  }

  async function handleExportCSV() {
    try {
      const formattedData = customers.map(customer => ({
        ID: customer.id,
        Ime: customer.ime_kupca,
        Prezime: customer.prezime_kupca,
        Email: customer.email,
        Telefon: customer.telefon,
        Adresa: customer.adresa,
        Mesto: customer.mesto,
        'Poštanski broj': customer.id_post,
        'Datum registracije': new Date(customer.kreirano).toLocaleString('sr-RS')
      }));

      exportToCSV(formattedData, `kupci-${new Date().toISOString().split('T')[0]}.csv`);
      toast.success('CSV fajl je uspešno kreiran');
    } catch (error) {
      console.error('Error exporting customers:', error);
      toast.error('Greška pri kreiranju CSV fajla');
    }
  }

  const filteredCustomers = customers.filter(customer => {
    const searchStr = searchQuery.toLowerCase();
    return (
      customer.ime_kupca.toLowerCase().includes(searchStr) ||
      customer.prezime_kupca.toLowerCase().includes(searchStr) ||
      customer.email.toLowerCase().includes(searchStr) ||
      customer.mesto.toLowerCase().includes(searchStr)
    );
  });

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-12 bg-gray-200 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Kupci</h1>
          <p className="text-gray-600 mt-1">Ukupno kupaca: {customers.length}</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-600 transition-colors"
        >
          <Download className="h-5 w-5" />
          <span>Izvezi CSV</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pretraži kupce..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-8">
              Nema pronađenih kupaca
            </div>
          ) : (
            filteredCustomers.map((customer) => (
              <div key={customer.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold">
                    {customer.ime_kupca} {customer.prezime_kupca}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {new Date(customer.kreirano).toLocaleDateString('sr-RS')}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    <span className="text-sm">{customer.email}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    <span className="text-sm">{customer.telefon}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span className="text-sm">
                      {customer.adresa}, {customer.mesto} {customer.id_post}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}