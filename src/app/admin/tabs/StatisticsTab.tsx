'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, Package, ShoppingBag, CreditCard, ArrowUpRight, ArrowDownRight, 
  DollarSign, Users, ShoppingCart, Download 
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { exportToCSV } from '@/lib/utils/csv-export';
import toast from 'react-hot-toast';

type TimeRange = 'week' | 'month' | 'year';

interface Stats {
  salesByCategory: Record<string, number>;
  monthlyRevenue: Array<{ month: string; amount: number }>;
  totalSales: number;
}

export default function StatisticsTab() {
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [stats, setStats] = useState<Stats>({
    salesByCategory: {},
    monthlyRevenue: [],
    totalSales: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, [timeRange]);

  async function fetchStatistics() {
    try {
      setLoading(true);

      // Get date range
      const now = new Date();
      let startDate = new Date();
      
      switch (timeRange) {
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      // Fetch orders within date range
      const { data: orders, error: ordersError } = await supabase
        .from('porudzbine')
        .select('*')
        .gte('kreirano', startDate.toISOString())
        .lte('kreirano', now.toISOString());

      if (ordersError) throw ordersError;

      // Calculate total sales
      const totalSales = orders?.reduce((sum, order) => sum + order.cena_ukupno, 0) || 0;

      // Calculate sales by category
      const salesByCategory: Record<string, number> = {};
      const { data: categories } = await supabase.from('kategorije').select('*');
      
      if (categories) {
        categories.forEach(category => {
          salesByCategory[category.naziv_kategorije] = 0;
        });
      }

      // Calculate monthly revenue
      const monthlyRevenue = [];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Avg', 'Sep', 'Okt', 'Nov', 'Dec'];
      
      for (let i = 0; i < (timeRange === 'year' ? 12 : 1); i++) {
        const month = months[i];
        const amount = orders?.reduce((sum, order) => {
          const orderDate = new Date(order.kreirano);
          return orderDate.getMonth() === i ? sum + order.cena_ukupno : sum;
        }, 0) || 0;
        
        monthlyRevenue.push({ month, amount });
      }

      setStats({
        salesByCategory,
        monthlyRevenue,
        totalSales
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
      toast.error('Greška pri učitavanju statistike');
    } finally {
      setLoading(false);
    }
  }

  async function handleExportSalesCSV() {
    try {
      const formattedData = stats.monthlyRevenue.map(month => ({
        Mesec: month.month,
        Prihod: month.amount,
      }));

      exportToCSV(formattedData, `mesecni-prihodi-${new Date().toISOString().split('T')[0]}.csv`);
      toast.success('CSV fajl je uspešno kreiran');
    } catch (error) {
      console.error('Error exporting sales:', error);
      toast.error('Greška pri kreiranju CSV fajla');
    }
  }

  async function handleExportCategoryCSV() {
    try {
      const formattedData = Object.entries(stats.salesByCategory).map(([category, amount]) => ({
        Kategorija: category,
        Prihod: amount,
        'Procenat učešća': ((amount / stats.totalSales) * 100).toFixed(2) + '%'
      }));

      exportToCSV(formattedData, `prodaja-po-kategorijama-${new Date().toISOString().split('T')[0]}.csv`);
      toast.success('CSV fajl je uspešno kreiran');
    } catch (error) {
      console.error('Error exporting category sales:', error);
      toast.error('Greška pri kreiranju CSV fajla');
    }
  }

  return (
    <div className="space-y-8">
      {/* Time Range Selector */}
      <div className="flex space-x-4">
        <button
          onClick={() => setTimeRange('week')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            timeRange === 'week'
              ? 'bg-yellow-400 text-black'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Nedelja
        </button>
        <button
          onClick={() => setTimeRange('month')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            timeRange === 'month'
              ? 'bg-yellow-400 text-black'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Mesec
        </button>
        <button
          onClick={() => setTimeRange('year')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            timeRange === 'year'
              ? 'bg-yellow-400 text-black'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Godina
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Sales by Category */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Prodaja po kategorijama</h2>
              <button
                onClick={handleExportCategoryCSV}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-600 transition-colors text-sm"
              >
                <Download className="h-4 w-4" />
                <span>Izvezi CSV</span>
              </button>
            </div>
            <div className="space-y-4">
              {Object.entries(stats.salesByCategory).map(([category, amount]) => (
                <div key={category}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{category}</span>
                    <span className="font-medium">{amount.toLocaleString()} RSD</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{ 
                        width: `${stats.totalSales ? (amount / stats.totalSales) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Revenue */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Mesečni prihodi</h2>
              <button
                onClick={handleExportSalesCSV}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-600 transition-colors text-sm"
              >
                <Download className="h-4 w-4" />
                <span>Izvezi CSV</span>
              </button>
            </div>
            <div className="h-64 flex items-end space-x-8">
              {stats.monthlyRevenue.map((month, index) => {
                const maxAmount = Math.max(...stats.monthlyRevenue.map(m => m.amount));
                const height = maxAmount ? (month.amount / maxAmount) * 100 : 0;
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-yellow-400 rounded-t-lg transition-all duration-300 hover:bg-yellow-500"
                      style={{ height: `${height}%` }}
                    ></div>
                    <div className="text-sm text-gray-600 mt-2">{month.month}</div>
                    <div className="text-sm font-medium mt-1">
                      {month.amount.toLocaleString()} RSD
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}