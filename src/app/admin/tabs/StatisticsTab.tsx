'use client';

import { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Users,
  TrendingUp,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Calendar
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { exportToCSV } from '@/lib/utils/csv-export';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface StatCard {
  title: string;
  value: number | string;
  change: number;
  icon: React.ReactNode;
  positive?: boolean;
}

interface DateRange {
  startDate: string;
  endDate: string;
}

interface Statistics {
  totalOrders: number;
  totalCustomers: number;
  totalRevenue: number;
  totalProducts: number;
  recentOrders: any[];
  topProducts: any[];
  dailyRevenue: Array<{
    date: string;
    revenue: number;
  }>;
  dateRange: DateRange;
}

export default function StatisticsTab() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Statistics>({
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    totalProducts: 0,
    recentOrders: [],
    topProducts: [],
    dailyRevenue: [],
    dateRange: {
      startDate: new Date(new Date().setDate(new Date().getDate() - 7))
        .toISOString()
        .split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    }
  });

  useEffect(() => {
    fetchStatistics();
  }, [stats.dateRange]);

  async function fetchStatistics() {
    try {
      // Fetch total orders and calculate revenue for selected period
      const { data: orders, error: ordersError } = await supabase
        .from('porudzbine')
        .select('id, cena_ukupno, kreirano')
        .gte('kreirano', stats.dateRange.startDate)
        .lte('kreirano', stats.dateRange.endDate + ' 23:59:59');

      if (ordersError) {
        console.error(
          'Supabase orders error:',
          ordersError.message,
          ordersError.details
        );
        throw ordersError;
      }

      // Fetch total customers for selected period
      const { data: customers, error: customersError } = await supabase
        .from('kupci')
        .select('id, kreirano')
        .gte('kreirano', stats.dateRange.startDate)
        .lte('kreirano', stats.dateRange.endDate + ' 23:59:59');

      if (customersError) throw customersError;

      // Fetch total products (ovo ostaje isto jer želimo ukupan broj proizvoda)
      const { count: productsCount, error: productsError } = await supabase
        .from('proizvodi')
        .select('id', { count: 'exact' });

      if (productsError) throw productsError;

      // Calculate total revenue for period
      const totalRevenue =
        orders?.reduce((sum, order) => sum + (order.cena_ukupno || 0), 0) || 0;

      // Process orders for chart data
      const days = getDaysArray(
        new Date(stats.dateRange.startDate),
        new Date(stats.dateRange.endDate)
      );

      const dailyRevenue = days.map((date) => {
        const dayOrders =
          orders?.filter(
            (order) =>
              order.kreirano.split('T')[0] === date.toISOString().split('T')[0]
          ) || [];
        return {
          date: date.toISOString().split('T')[0],
          revenue: dayOrders.reduce(
            (sum, order) => sum + (order.cena_ukupno || 0),
            0
          )
        };
      });

      // Fetch recent orders
      const { data: recentOrders, error: recentOrdersError } = await supabase
        .from('porudzbine')
        .select(
          `
          id,
          cena_ukupno,
          status_porudzbine,
          kreirano,
          kupci (
            ime_kupca,
            prezime_kupca
          )
        `
        )
        .gte('kreirano', stats.dateRange.startDate)
        .lte('kreirano', stats.dateRange.endDate + ' 23:59:59')
        .order('kreirano', { ascending: false })
        .limit(5);

      if (recentOrdersError) throw recentOrdersError;

      setStats((prev) => ({
        ...prev,
        totalOrders: orders?.length || 0,
        totalCustomers: customers?.length || 0,
        totalRevenue,
        totalProducts: productsCount || 0,
        recentOrders: recentOrders || [],
        dailyRevenue
      }));
    } catch (error) {
      console.error('Error fetching statistics:', error);
      toast.error('Greška pri učitavanju statistike');
    } finally {
      setLoading(false);
    }
  }

  // Helper funkcija za generisanje niza datuma
  function getDaysArray(start: Date, end: Date) {
    const arr = [];
    const dt = new Date(start);
    while (dt <= end) {
      arr.push(new Date(dt));
      dt.setDate(dt.getDate() + 1);
    }
    return arr;
  }

  // Funkcija za promenu perioda
  function handleDateRangeChange(startDate: string, endDate: string) {
    setStats((prev) => ({
      ...prev,
      dateRange: { startDate, endDate }
    }));
  }

  // Funkcija za brzi izbor perioda
  function handleQuickRange(days: number) {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(new Date().setDate(new Date().getDate() - days))
      .toISOString()
      .split('T')[0];
    handleDateRangeChange(startDate, endDate);
  }

  const chartData = {
    labels:
      stats.dailyRevenue?.map((day) =>
        new Date(day.date).toLocaleDateString('sr-RS', { weekday: 'short' })
      ) || [],
    datasets: [
      {
        label: 'Dnevni prihod (RSD)',
        data: stats.dailyRevenue?.map((day) => day.revenue) || [],
        borderColor: 'rgb(234 179 8)',
        backgroundColor: 'rgba(234, 179, 8, 0.5)',
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Prihodi u poslednjih 7 dana'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) => `${value.toLocaleString()} RSD`
        }
      }
    }
  };

  const statCards: StatCard[] = [
    {
      title: 'Ukupno porudžbina',
      value: stats.totalOrders,
      change: 12,
      icon: <ShoppingBag className='h-6 w-6' />,
      positive: true
    },
    {
      title: 'Ukupno kupaca',
      value: stats.totalCustomers,
      change: 8,
      icon: <Users className='h-6 w-6' />,
      positive: true
    },
    {
      title: 'Ukupan prihod',
      value: `${stats.totalRevenue.toLocaleString()} RSD`,
      change: 15,
      icon: <TrendingUp className='h-6 w-6' />,
      positive: true
    },
    {
      title: 'Ukupno proizvoda',
      value: stats.totalProducts,
      change: 3,
      icon: <Package className='h-6 w-6' />,
      positive: false
    }
  ];

  async function handleExportCSV() {
    try {
      const statisticsData = {
        ukupna_statistika: [
          {
            kategorija: 'Porudžbine',
            vrednost: stats.totalOrders,
            promena: '12%'
          },
          {
            kategorija: 'Kupci',
            vrednost: stats.totalCustomers,
            promena: '8%'
          },
          {
            kategorija: 'Prihod',
            vrednost: `${stats.totalRevenue} RSD`,
            promena: '15%'
          },
          {
            kategorija: 'Proizvodi',
            vrednost: stats.totalProducts,
            promena: '3%'
          }
        ],
        dnevni_prihodi: stats.dailyRevenue.map((day) => ({
          datum: new Date(day.date).toLocaleDateString('sr-RS'),
          prihod: `${day.revenue} RSD`
        })),
        nedavne_porudzbine: stats.recentOrders.map((order) => ({
          id: order.id,
          kupac: `${order.kupci.ime_kupca} ${order.kupci.prezime_kupca}`,
          iznos: `${order.cena_ukupno} RSD`,
          status: order.status_porudzbine,
          datum: new Date(order.kreirano).toLocaleDateString('sr-RS')
        }))
      };

      exportToCSV(statisticsData.ukupna_statistika, 'statistika_ukupno');
      exportToCSV(statisticsData.dnevni_prihodi, 'statistika_dnevni_prihodi');
      exportToCSV(statisticsData.nedavne_porudzbine, 'statistika_porudzbine');

      toast.success('Statistika uspešno izvezena');
    } catch (error) {
      console.error('Error exporting statistics:', error);
      toast.error('Greška pri izvozu statistike');
    }
  }

  if (loading) {
    return (
      <div className='p-8 text-center text-gray-500'>
        Učitavanje statistike...
      </div>
    );
  }

  return (
    <div>
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8'>
        <div>
          <h1 className='text-3xl font-bold'>Statistika</h1>
          <p className='text-gray-600 mt-1'>Pregled poslovanja i analitika</p>
        </div>
        <div className='flex items-center gap-4'>
          {/* Period filter */}
          <div className='flex items-center gap-2'>
            <div className='flex items-center space-x-2 bg-white border border-gray-200 rounded-lg p-2'>
              <Calendar className='h-5 w-5 text-gray-500' />
              <input
                type='date'
                value={stats.dateRange.startDate}
                onChange={(e) =>
                  handleDateRangeChange(e.target.value, stats.dateRange.endDate)
                }
                className='border-0 focus:ring-0 text-sm'
                title='Početni datum'
                aria-label='Početni datum'
              />
              <span className='text-gray-500'>do</span>
              <input
                type='date'
                value={stats.dateRange.endDate}
                onChange={(e) =>
                  handleDateRangeChange(
                    stats.dateRange.startDate,
                    e.target.value
                  )
                }
                className='border-0 focus:ring-0 text-sm'
                title='Krajnji datum'
                aria-label='Krajnji datum'
              />
            </div>
          </div>
          {/* Brzi filteri */}
          <div className='flex items-center gap-2'>
            <button
              onClick={() => handleQuickRange(7)}
              className='px-3 py-1 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50'
            >
              7 dana
            </button>
            <button
              onClick={() => handleQuickRange(30)}
              className='px-3 py-1 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50'
            >
              30 dana
            </button>
            <button
              onClick={() => handleQuickRange(90)}
              className='px-3 py-1 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50'
            >
              90 dana
            </button>
          </div>
          {/* Export dugme */}
          <button
            onClick={handleExportCSV}
            className='flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors'
          >
            <Download className='h-5 w-5' />
            <span>Izvezi CSV</span>
          </button>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
        {statCards.map((card, index) => (
          <div
            key={index}
            className='bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow'
          >
            <div className='flex items-center justify-between mb-4'>
              <div className='p-2 bg-gray-50 rounded-lg'>{card.icon}</div>
              <div
                className={`flex items-center space-x-1 text-sm ${
                  card.positive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                <span>{card.change}%</span>
                {card.positive ? (
                  <ArrowUpRight className='h-4 w-4' />
                ) : (
                  <ArrowDownRight className='h-4 w-4' />
                )}
              </div>
            </div>
            <h3 className='text-gray-500 text-sm font-medium'>{card.title}</h3>
            <p className='text-2xl font-semibold mt-1'>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className='bg-white rounded-xl border border-gray-200 p-6 mb-8'>
        <Line data={chartData} options={chartOptions} />
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <div className='bg-white rounded-xl border border-gray-200 p-6'>
          <h2 className='text-lg font-semibold mb-4'>Nedavne porudžbine</h2>
          <div className='space-y-4'>
            {stats.recentOrders.map((order) => (
              <div
                key={order.id}
                className='flex items-center justify-between border-b border-gray-100 pb-4'
              >
                <div>
                  <p className='font-medium'>Porudžbina #{order.id}</p>
                  <p className='text-sm text-gray-500'>
                    {order.kupci.ime_kupca} {order.kupci.prezime_kupca}
                  </p>
                  <p className='text-sm text-gray-500'>
                    {new Date(order.kreirano).toLocaleDateString('sr-RS')}
                  </p>
                </div>
                <div className='text-right'>
                  <p className='font-medium'>
                    {order.cena_ukupno.toLocaleString()} RSD
                  </p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      order.status_porudzbine === 'isporucena'
                        ? 'bg-green-50 text-green-700'
                        : order.status_porudzbine === 'otkazana'
                        ? 'bg-red-50 text-red-700'
                        : 'bg-yellow-50 text-yellow-700'
                    }`}
                  >
                    {order.status_porudzbine}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className='bg-white rounded-xl border border-gray-200 p-6'>
          <h2 className='text-lg font-semibold mb-4'>
            Najprodavaniji proizvodi
          </h2>
          <p className='text-gray-500 text-sm'>Uskoro...</p>
        </div>
      </div>
    </div>
  );
}
