'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  Package,
  Clock,
  User,
  DollarSign,
  Download
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { exportToCSV } from '@/lib/utils/csv-export';
import type { Database } from '@/lib/types/database.types';

type Order = {
  id: string;
  id_kupca: string;
  status_porudzbine: string;
  cena_ukupno: number;
  kreirano: string;
  kupci?: {
    id: string;
    ime_kupca: string;
    prezime_kupca: string;
    email: string;
  };
};

export default function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      const { data, error } = await supabase
        .from('porudzbine')
        .select(
          `
          *,
          kupci (
            id,
            ime_kupca,
            prezime_kupca,
            email
          )
        `
        )
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

      console.log('Fetched orders:', data);
      setOrders(
        (data || []).map((order) => ({
          ...order,
          status: order.status_porudzbine,
          ukupan_iznos: order.cena_ukupno,
          created_at: order.kreirano,
          kupci: order.kupci
            ? {
                ime: order.kupci.ime_kupca,
                prezime: order.kupci.prezime_kupca,
                email: order.kupci.email
              }
            : undefined
        }))
      );
    } catch (error) {
      const err = error as any;
      console.error('Error fetching orders:', {
        message: err?.message,
        details: err?.details,
        hint: err?.hint
      });
      toast.error('Greška pri učitavanju porudžbina. Molimo pokušajte ponovo.');
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(orderId: string, newStatus: string) {
    try {
      const { error } = await supabase
        .from('porudzbine')
        .update({ status_porudzbine: newStatus })
        .eq('id', orderId);

      if (error) {
        console.error(
          'Supabase error:',
          error.message,
          error.details,
          error.hint
        );
        throw error;
      }

      await fetchOrders();
      toast.success('Status porudžbine uspešno ažuriran');
    } catch (error) {
      const err = error as any;
      console.error('Error updating order status:', {
        message: err?.message,
        details: err?.details,
        hint: err?.hint
      });
      toast.error('Greška pri ažuriranju statusa. Molimo pokušajte ponovo.');
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'nova':
        return 'bg-blue-50 text-blue-700';
      case 'u_obradi':
        return 'bg-yellow-50 text-yellow-700';
      case 'poslata':
        return 'bg-green-50 text-green-700';
      case 'isporucena':
        return 'bg-purple-50 text-purple-700';
      case 'otkazana':
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'nova':
        return 'Nova';
      case 'u_obradi':
        return 'U obradi';
      case 'poslata':
        return 'Poslata';
      case 'isporucena':
        return 'Isporučena';
      case 'otkazana':
        return 'Otkazana';
      default:
        return status;
    }
  };

  const filteredOrders = orders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.kupci as any)?.ime_kupca
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (order.kupci as any)?.prezime_kupca
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  async function handleExportCSV() {
    try {
      const ordersForExport = orders.map((order) => ({
        ID: order.id,
        Kupac: `${(order.kupci as any)?.ime_kupca} ${
          (order.kupci as any)?.prezime_kupca
        }`,
        'Email kupca': (order.kupci as any)?.email,
        Status: getStatusText(order.status_porudzbine || 'nova'),
        'Ukupan iznos': `${order.cena_ukupno} RSD`,
        'Datum kreiranja': new Date(order.kreirano).toLocaleString('sr-RS')
      }));

      exportToCSV(ordersForExport, 'porudzbine');
      toast.success('Porudžbine uspešno izvezene');
    } catch (error) {
      console.error('Error exporting orders:', error);
      toast.error('Greška pri izvozu porudžbina');
    }
  }

  return (
    <div>
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8'>
        <div>
          <h1 className='text-3xl font-bold'>Porudžbine</h1>
          <p className='text-gray-600 mt-1'>
            Upravljajte porudžbinama i njihovim statusima
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
              placeholder='Pretraži porudžbine...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent'
              aria-label='Pretraži porudžbine'
            />
            <Search className='h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2' />
          </div>
        </div>

        <div className='divide-y divide-gray-200'>
          {loading ? (
            <div className='p-8 text-center text-gray-500'>
              Učitavanje porudžbina...
            </div>
          ) : filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <div
                key={order.id}
                className='p-4 hover:bg-gray-50 transition-colors'
              >
                <div className='flex items-start justify-between'>
                  <div className='space-y-3'>
                    <div className='flex items-center space-x-3'>
                      <Package className='h-5 w-5 text-gray-400' />
                      <span className='font-medium'>
                        Porudžbina #{order.id}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          order.status_porudzbine || 'nova'
                        )}`}
                      >
                        {getStatusText(order.status_porudzbine || 'nova')}
                      </span>
                    </div>
                    <div className='flex items-center space-x-3 text-sm text-gray-500'>
                      <User className='h-4 w-4' />
                      <span>
                        {(order.kupci as any)?.ime_kupca}{' '}
                        {(order.kupci as any)?.prezime_kupca}
                      </span>
                    </div>
                    <div className='flex items-center space-x-3 text-sm text-gray-500'>
                      <Clock className='h-4 w-4' />
                      <span>
                        {new Date(order.kreirano).toLocaleString('sr-RS')}
                      </span>
                    </div>
                    <div className='flex items-center space-x-3 text-sm'>
                      <DollarSign className='h-4 w-4 text-gray-400' />
                      <span className='font-medium'>
                        {order.cena_ukupno} RSD
                      </span>
                    </div>
                  </div>

                  <div>
                    <select
                      value={order.status_porudzbine || 'nova'}
                      onChange={(e) =>
                        handleStatusChange(order.id, e.target.value)
                      }
                      className='border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-yellow-400 focus:border-transparent'
                      aria-label='Promeni status porudžbine'
                    >
                      <option value='nova'>Nova</option>
                      <option value='u_obradi'>U obradi</option>
                      <option value='poslata'>Poslata</option>
                      <option value='isporucena'>Isporučena</option>
                      <option value='otkazana'>Otkazana</option>
                    </select>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className='p-8 text-center text-gray-500'>
              Nema pronađenih porudžbina
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
