'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { supabase } from '@/lib/supabaseClient';
import {
  Package,
  ArrowLeft,
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

interface OrderItem {
  id: string;
  narudzbina_id: string;
  proizvod_id: string;
  naziv_proizvoda: string;
  cena: number;
  kolicina: number;
  created_at: string;
}

export default function OrderDetailsPage({
  params
}: {
  params: { id: string };
}) {
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/');
    } else if (!authLoading) {
      fetchOrderDetails();
    }
  }, [authLoading, isAdmin, router, params.id]);

  async function fetchOrderDetails() {
    try {
      setLoading(true);

      // Dobavljanje podataka o narudžbini
      const { data: orderData, error: orderError } = await supabase
        .from('narudzbine')
        .select('*')
        .eq('id', params.id)
        .single();

      if (orderError) throw orderError;

      setOrder(orderData as Order);

      // Dobavljanje stavki narudžbine
      const { data: itemsData, error: itemsError } = await supabase
        .from('stavke_narudzbine')
        .select('*')
        .eq('narudzbina_id', params.id);

      if (itemsError) throw itemsError;

      setOrderItems(itemsData as OrderItem[]);
    } catch (error) {
      console.error('Greška pri dobijanju detalja narudžbine:', error);
      toast.error('Nije moguće učitati detalje narudžbine');
    } finally {
      setLoading(false);
    }
  }

  async function updateOrderStatus(status: OrderStatus) {
    try {
      const { error } = await supabase
        .from('narudzbine')
        .update({ status })
        .eq('id', params.id);

      if (error) throw error;

      // Osvežavamo podatke o narudžbini
      await fetchOrderDetails();
      toast.success('Status narudžbine je uspešno ažuriran');
    } catch (error) {
      console.error('Greška pri ažuriranju statusa:', error);
      toast.error('Nije moguće ažurirati status narudžbine');
    }
  }

  function getStatusBadge(status: OrderStatus) {
    switch (status) {
      case 'nova':
        return (
          <span className='px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-blue-100 text-blue-800'>
            <AlertTriangle className='h-5 w-5 mr-1' /> Nova
          </span>
        );
      case 'u_obradi':
        return (
          <span className='px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800'>
            <Package className='h-5 w-5 mr-1' /> U obradi
          </span>
        );
      case 'poslata':
        return (
          <span className='px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800'>
            <Truck className='h-5 w-5 mr-1' /> Poslata
          </span>
        );
      case 'isporučena':
        return (
          <span className='px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-green-100 text-green-800'>
            <CheckCircle className='h-5 w-5 mr-1' /> Isporučena
          </span>
        );
      case 'otkazana':
        return (
          <span className='px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-red-100 text-red-800'>
            <XCircle className='h-5 w-5 mr-1' /> Otkazana
          </span>
        );
    }
  }

  if (authLoading || loading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900'></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  if (!order) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='bg-white shadow-md rounded-lg p-6 text-center'>
          <p className='text-gray-500'>Narudžbina nije pronađena.</p>
          <Link
            href='/admin/narudzbine'
            className='mt-4 inline-flex items-center text-indigo-600 hover:text-indigo-900'
          >
            <ArrowLeft className='h-5 w-5 mr-1' /> Nazad na listu narudžbina
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='mb-6'>
        <Link
          href='/admin/narudzbine'
          className='inline-flex items-center text-indigo-600 hover:text-indigo-900'
        >
          <ArrowLeft className='h-5 w-5 mr-1' /> Nazad na listu narudžbina
        </Link>
      </div>

      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center'>
          <Package className='mr-2 h-6 w-6' />
          <h1 className='text-2xl font-bold'>
            Detalji narudžbine #{order.id.substring(0, 8)}
          </h1>
        </div>
        <div>{getStatusBadge(order.status)}</div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
        <div className='bg-white shadow-md rounded-lg p-6'>
          <h2 className='text-lg font-semibold mb-4'>Informacije o kupcu</h2>
          <div className='space-y-3'>
            <div>
              <p className='text-sm text-gray-500'>Ime i prezime</p>
              <p className='font-medium'>
                {order.ime} {order.prezime}
              </p>
            </div>
            <div>
              <p className='text-sm text-gray-500'>Email</p>
              <p className='font-medium'>{order.email}</p>
            </div>
            <div>
              <p className='text-sm text-gray-500'>Telefon</p>
              <p className='font-medium'>{order.telefon}</p>
            </div>
          </div>
        </div>

        <div className='bg-white shadow-md rounded-lg p-6'>
          <h2 className='text-lg font-semibold mb-4'>Adresa za dostavu</h2>
          <div className='space-y-3'>
            <div>
              <p className='text-sm text-gray-500'>Adresa</p>
              <p className='font-medium'>{order.adresa}</p>
            </div>
            <div>
              <p className='text-sm text-gray-500'>Grad</p>
              <p className='font-medium'>{order.grad}</p>
            </div>
            <div>
              <p className='text-sm text-gray-500'>Poštanski broj</p>
              <p className='font-medium'>{order.postanski_broj}</p>
            </div>
          </div>
        </div>
      </div>

      {order.napomena && (
        <div className='bg-white shadow-md rounded-lg p-6 mb-8'>
          <h2 className='text-lg font-semibold mb-2'>Napomena</h2>
          <p className='text-gray-700'>{order.napomena}</p>
        </div>
      )}

      <div className='bg-white shadow-md rounded-lg overflow-hidden mb-8'>
        <h2 className='text-lg font-semibold p-6 border-b'>
          Stavke narudžbine
        </h2>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
              >
                Proizvod
              </th>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
              >
                Cena
              </th>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
              >
                Količina
              </th>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
              >
                Ukupno
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {orderItems.map((item) => (
              <tr key={item.id}>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='text-sm font-medium text-gray-900'>
                    {item.naziv_proizvoda}
                  </div>
                  <div className='text-sm text-gray-500'>
                    ID: {item.proizvod_id}
                  </div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='text-sm text-gray-900'>
                    {item.cena.toLocaleString('sr-RS')} RSD
                  </div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='text-sm text-gray-900'>{item.kolicina}</div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='text-sm font-medium text-gray-900'>
                    {(item.cena * item.kolicina).toLocaleString('sr-RS')} RSD
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className='bg-gray-50'>
            <tr>
              <td colSpan={3} className='px-6 py-4 text-right font-medium'>
                Ukupno proizvodi:
              </td>
              <td className='px-6 py-4 whitespace-nowrap font-medium'>
                {(order.ukupna_cena - order.dostava_cena).toLocaleString(
                  'sr-RS'
                )}{' '}
                RSD
              </td>
            </tr>
            <tr>
              <td colSpan={3} className='px-6 py-4 text-right font-medium'>
                Dostava:
              </td>
              <td className='px-6 py-4 whitespace-nowrap font-medium'>
                {order.dostava_cena.toLocaleString('sr-RS')} RSD
              </td>
            </tr>
            <tr className='bg-gray-100'>
              <td colSpan={3} className='px-6 py-4 text-right font-bold'>
                UKUPNO:
              </td>
              <td className='px-6 py-4 whitespace-nowrap font-bold'>
                {order.ukupna_cena.toLocaleString('sr-RS')} RSD
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className='bg-white shadow-md rounded-lg p-6 mb-8'>
        <h2 className='text-lg font-semibold mb-4'>Ažuriranje statusa</h2>
        <div className='flex flex-wrap gap-2'>
          <button
            onClick={() => updateOrderStatus('nova')}
            className={`px-4 py-2 rounded-md ${
              order.status === 'nova'
                ? 'bg-blue-600 text-white'
                : 'bg-blue-100 text-blue-800'
            }`}
          >
            <AlertTriangle className='h-5 w-5 inline mr-1' /> Nova
          </button>
          <button
            onClick={() => updateOrderStatus('u_obradi')}
            className={`px-4 py-2 rounded-md ${
              order.status === 'u_obradi'
                ? 'bg-yellow-600 text-white'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            <Package className='h-5 w-5 inline mr-1' /> U obradi
          </button>
          <button
            onClick={() => updateOrderStatus('poslata')}
            className={`px-4 py-2 rounded-md ${
              order.status === 'poslata'
                ? 'bg-indigo-600 text-white'
                : 'bg-indigo-100 text-indigo-800'
            }`}
          >
            <Truck className='h-5 w-5 inline mr-1' /> Poslata
          </button>
          <button
            onClick={() => updateOrderStatus('isporučena')}
            className={`px-4 py-2 rounded-md ${
              order.status === 'isporučena'
                ? 'bg-green-600 text-white'
                : 'bg-green-100 text-green-800'
            }`}
          >
            <CheckCircle className='h-5 w-5 inline mr-1' /> Isporučena
          </button>
          <button
            onClick={() => updateOrderStatus('otkazana')}
            className={`px-4 py-2 rounded-md ${
              order.status === 'otkazana'
                ? 'bg-red-600 text-white'
                : 'bg-red-100 text-red-800'
            }`}
          >
            <XCircle className='h-5 w-5 inline mr-1' /> Otkazana
          </button>
        </div>
      </div>

      <div className='bg-white shadow-md rounded-lg p-6'>
        <h2 className='text-lg font-semibold mb-4'>Informacije o narudžbini</h2>
        <div className='space-y-3'>
          <div>
            <p className='text-sm text-gray-500'>ID narudžbine</p>
            <p className='font-medium'>{order.id}</p>
          </div>
          <div>
            <p className='text-sm text-gray-500'>ID korisnika</p>
            <p className='font-medium'>{order.user_id}</p>
          </div>
          <div>
            <p className='text-sm text-gray-500'>Datum kreiranja</p>
            <p className='font-medium'>
              {new Date(order.created_at).toLocaleDateString('sr-RS')}{' '}
              {new Date(order.created_at).toLocaleTimeString('sr-RS')}
            </p>
          </div>
          <div>
            <p className='text-sm text-gray-500'>Poslednje ažuriranje</p>
            <p className='font-medium'>
              {new Date(order.updated_at).toLocaleDateString('sr-RS')}{' '}
              {new Date(order.updated_at).toLocaleTimeString('sr-RS')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
