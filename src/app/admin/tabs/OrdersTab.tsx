'use client';

import { useState, useEffect } from 'react';
import { Search, Package, Truck, CheckCircle, XCircle, Download } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { exportToCSV } from '@/lib/utils/csv-export';
import toast from 'react-hot-toast';
import type { Database } from '@/lib/types/database.types';

type Order = Database['public']['Tables']['porudzbine']['Row'];

export default function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('porudzbine')
        .select('*')
        .order('kreirano', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Greška pri učitavanju porudžbina');
    } finally {
      setLoading(false);
    }
  }

  async function handleExportCSV() {
    try {
      const formattedData = orders.map(order => ({
        ID: order.id,
        'Ime kupca': order.kupac_ime,
        'Prezime kupca': order.kupac_prezime,
        Telefon: order.kupac_telefon,
        Adresa: order.kupac_adresa,
        Mesto: order.kupac_mesto,
        'Ukupna cena': order.cena_ukupno,
        Status: order.status_porudzbine,
        'Datum kreiranja': new Date(order.kreirano).toLocaleString('sr-RS'),
        'Poslednje ažuriranje': new Date(order.azurirano).toLocaleString('sr-RS')
      }));

      exportToCSV(formattedData, `porudzbine-${new Date().toISOString().split('T')[0]}.csv`);
      toast.success('CSV fajl je uspešno kreiran');
    } catch (error) {
      console.error('Error exporting orders:', error);
      toast.error('Greška pri kreiranju CSV fajla');
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.kupac_ime.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.kupac_prezime.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status_porudzbine === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'nova':
        return <Package className="h-5 w-5 text-blue-500" />;
      case 'u_obradi':
        return <Truck className="h-5 w-5 text-yellow-500" />;
      case 'zavrsena':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'otkazana':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'nova':
        return 'Nova';
      case 'u_obradi':
        return 'U obradi';
      case 'zavrsena':
        return 'Završena';
      case 'otkazana':
        return 'Otkazana';
      default:
        return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'nova':
        return 'bg-blue-100 text-blue-800';
      case 'u_obradi':
        return 'bg-yellow-100 text-yellow-800';
      case 'zavrsena':
        return 'bg-green-100 text-green-800';
      case 'otkazana':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
          <h1 className="text-3xl font-bold">Porudžbine</h1>
          <p className="text-gray-600 mt-1">Ukupno porudžbina: {orders.length}</p>
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
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pretraži porudžbine..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="w-full md:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Svi statusi</option>
              <option value="nova">Nove</option>
              <option value="u_obradi">U obradi</option>
              <option value="zavrsena">Završene</option>
              <option value="otkazana">Otkazane</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-8">
              Nema pronađenih porudžbina
            </div>
          ) : (
            filteredOrders.map(order => (
              <div key={order.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold">{order.kupac_ime} {order.kupac_prezime}</h3>
                    <p className="text-sm text-gray-600">{order.kupac_telefon}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(order.status_porudzbine)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      getStatusClass(order.status_porudzbine)
                    }`}>
                      {getStatusText(order.status_porudzbine)}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-600 mb-4">
                  <p>{order.kupac_adresa}</p>
                  <p>{order.kupac_mesto}</p>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-500">
                    ID: {order.id.slice(0, 8)}
                  </div>
                  <div className="font-semibold text-yellow-600">
                    {order.cena_ukupno.toLocaleString()} RSD
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