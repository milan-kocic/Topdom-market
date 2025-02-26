'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  Package,
  Clock,
  User,
  DollarSign,
  Download,
  ChevronDown,
  ChevronUp,
  History
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { exportToCSV } from '@/lib/utils/csv-export';
import type { Database } from '@/types/supabase';

type Order = {
  id: string;
  kreirano: string;
  status_porudzbine: string;
  cena_ukupno: number;
  kupac: string;
  broj_stavki: number;
  proizvodi: string;
};

type StavkaPorudzbine = {
  id: string;
  proizvodi?: {
    naziv_proizvoda?: string;
  };
};

type PorudzbinaResponse = {
  id: string;
  kreirano: string;
  status_porudzbine: string;
  cena_ukupno: number;
  kupci?: {
    ime_kupca: string;
    prezime_kupca: string;
  };
  stavke_porudzbine?: StavkaPorudzbine[];
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
      setLoading(true);
      console.log('Započinjem dohvatanje porudžbina...');

      const { data: porudzbine, error: porudzbineError } = await supabase
        .from('porudzbine')
        .select(
          `
          id,
          kreirano,
          status_porudzbine,
          cena_ukupno,
          kupci (
            ime_kupca,
            prezime_kupca
          ),
          stavke_porudzbine (
            id,
            proizvodi (
              naziv_proizvoda
            )
          )
        `
        )
        .order('kreirano', { ascending: false });

      if (porudzbineError) {
        console.error('Greška pri dohvatanju porudžbina:', porudzbineError);
        toast.error('Greška pri učitavanju porudžbina');
        return;
      }

      if (!porudzbine || porudzbine.length === 0) {
        console.log('Nema pronađenih porudžbina');
        setOrders([]);
        return;
      }

      // Transformišemo podatke u format koji očekuje komponenta
      const transformedOrders: Order[] = porudzbine.map(
        (p: PorudzbinaResponse) => ({
          id: p.id,
          kreirano: p.kreirano,
          status_porudzbine: p.status_porudzbine,
          cena_ukupno: p.cena_ukupno,
          kupac: p.kupci
            ? `${p.kupci.ime_kupca} ${p.kupci.prezime_kupca}`
            : 'Nepoznat kupac',
          broj_stavki: p.stavke_porudzbine?.length || 0,
          proizvodi:
            p.stavke_porudzbine
              ?.map((s) => s.proizvodi?.naziv_proizvoda)
              .filter(Boolean)
              .join(', ') || ''
        })
      );

      console.log('Uspešno dohvaćene porudžbine:', {
        brojPorudzbina: transformedOrders.length,
        prvaPorudzbina: transformedOrders[0]
      });

      setOrders(transformedOrders);
    } catch (error) {
      console.error('Neočekivana greška:', error);
      toast.error('Greška pri učitavanju porudžbina');
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
        console.error('Greška pri ažuriranju statusa:', error);
        toast.error('Greška pri ažuriranju statusa porudžbine');
        return;
      }

      await fetchOrders();
      toast.success('Status porudžbine uspešno ažuriran');
    } catch (error) {
      console.error('Neočekivana greška pri ažuriranju statusa:', error);
      toast.error('Greška pri ažuriranju statusa');
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Obrada':
        return 'bg-yellow-50 text-yellow-700';
      case 'Otpremljeno':
        return 'bg-blue-50 text-blue-700';
      case 'Isporučeno':
        return 'bg-green-50 text-green-700';
      case 'Otkazano':
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  const filteredOrders = orders.filter(
    (order) =>
      order.kupac.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8'>
        <div>
          <h1 className='text-3xl font-bold'>Porudžbine</h1>
          <p className='text-gray-600 mt-1'>
            Upravljajte porudžbinama i njihovim statusima
          </p>
        </div>
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
                          order.status_porudzbine
                        )}`}
                      >
                        {order.status_porudzbine}
                      </span>
                    </div>
                    <div className='flex items-center space-x-3 text-sm text-gray-500'>
                      <User className='h-4 w-4' />
                      <span>{order.kupac}</span>
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
                        {order.cena_ukupno.toLocaleString('sr-RS')} RSD
                      </span>
                    </div>
                    <div className='text-sm text-gray-500'>
                      <span className='font-medium'>Proizvodi: </span>
                      {order.proizvodi}
                    </div>
                  </div>
                  <div>
                    <select
                      value={order.status_porudzbine}
                      onChange={(e) =>
                        handleStatusChange(order.id, e.target.value)
                      }
                      className='border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-yellow-400 focus:border-transparent'
                      aria-label='Status porudžbine'
                    >
                      <option value='Obrada'>Obrada</option>
                      <option value='Otpremljeno'>Otpremljeno</option>
                      <option value='Isporučeno'>Isporučeno</option>
                      <option value='Otkazano'>Otkazano</option>
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
