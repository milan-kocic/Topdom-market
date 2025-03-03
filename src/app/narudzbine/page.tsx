'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { supabase } from '@/lib/supabaseClient';
import {
  Package,
  Eye,
  Truck,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

type OrderStatus = 'nova' | 'u_obradi' | 'poslata' | 'isporučena' | 'otkazana';

interface Order {
  id: string;
  user_id: string;
  status: OrderStatus;
  ukupna_cena: number;
  dostava_cena: number;
  ime: string;
  prezime: string;
  email: string;
  telefon: string;
  adresa: string;
  grad: string;
  postanski_broj: string;
  napomena: string | null;
  created_at: string;
  updated_at: string;
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/prijava');
    } else if (!authLoading && user) {
      fetchOrders();
    }
  }, [authLoading, user, router]);

  async function fetchOrders() {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('narudzbine')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setOrders(data as Order[]);
    } catch (error) {
      console.error('Greška pri dobijanju narudžbina:', error);
      toast.error('Nije moguće učitati narudžbine');
    } finally {
      setLoading(false);
    }
  }

  function getStatusBadge(status: OrderStatus) {
    switch (status) {
      case 'nova':
        return (
          <span className='px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800'>
            <AlertTriangle className='h-4 w-4 mr-1' /> Nova
          </span>
        );
      case 'u_obradi':
        return (
          <span className='px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800'>
            <Package className='h-4 w-4 mr-1' /> U obradi
          </span>
        );
      case 'poslata':
        return (
          <span className='px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800'>
            <Truck className='h-4 w-4 mr-1' /> Poslata
          </span>
        );
      case 'isporučena':
        return (
          <span className='px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800'>
            <CheckCircle className='h-4 w-4 mr-1' /> Isporučena
          </span>
        );
      case 'otkazana':
        return (
          <span className='px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800'>
            <XCircle className='h-4 w-4 mr-1' /> Otkazana
          </span>
        );
    }
  }

  if (authLoading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900'></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='flex items-center mb-6'>
        <Package className='mr-2 h-6 w-6' />
        <h1 className='text-2xl font-bold'>Moje narudžbine</h1>
      </div>

      {loading ? (
        <div className='flex justify-center items-center h-64'>
          <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900'></div>
        </div>
      ) : orders.length === 0 ? (
        <div className='bg-white shadow-md rounded-lg p-6 text-center'>
          <p className='text-gray-500'>Nemate nijednu narudžbinu.</p>
          <Link
            href='/proizvodi'
            className='mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700'
          >
            Pogledajte proizvode
          </Link>
        </div>
      ) : (
        <div className='bg-white shadow-md rounded-lg overflow-hidden'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                >
                  Broj narudžbine
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                >
                  Datum
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                >
                  Ukupno
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                >
                  Status
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
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='text-sm font-medium text-gray-900'>
                      #{order.id.substring(0, 8)}
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='text-sm text-gray-900'>
                      {new Date(order.created_at).toLocaleDateString('sr-RS')}
                    </div>
                    <div className='text-sm text-gray-500'>
                      {new Date(order.created_at).toLocaleTimeString('sr-RS')}
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='text-sm font-medium text-gray-900'>
                      {order.ukupna_cena.toLocaleString('sr-RS')} RSD
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    {getStatusBadge(order.status)}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                    <Link
                      href={`/narudzbine/${order.id}`}
                      className='text-indigo-600 hover:text-indigo-900'
                      aria-label='Pregledaj detalje narudžbine'
                      title='Pregledaj detalje'
                    >
                      <Eye className='h-5 w-5' />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
