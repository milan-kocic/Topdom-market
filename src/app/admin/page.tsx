'use client';

import { useState, useEffect } from 'react';
import {
  PlusCircle,
  Pencil,
  Trash2,
  Star,
  StarOff,
  Filter,
  User,
  Mail,
  Calendar,
  LogOut,
  Users,
  BarChart2,
  Package,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  ShoppingCart,
  ShoppingBag,
  Menu,
  X,
  Wallet,
  CreditCard
} from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/types/database.types';
import ProductsTab from './tabs/ProductsTab';
import OrdersTab from './tabs/OrdersTab';
import CustomersTab from './tabs/CustomersTab';
import StatisticsTab from './tabs/StatisticsTab';
import ExpensesTab from './tabs/ExpensesTab';
import RevenueTab from './tabs/RevenueTab';

type TabType =
  | 'products'
  | 'orders'
  | 'customers'
  | 'statistics'
  | 'revenue'
  | 'expenses';

interface Statistics {
  totalOrders: number;
  totalCustomers: number;
  totalRevenue: number;
  totalProducts: number;
  recentOrders: any[];
  topProducts: any[];
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('products');
  const [adminInfo, setAdminInfo] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState<Statistics>({
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    totalProducts: 0,
    recentOrders: [],
    topProducts: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminInfo();
    fetchStatistics();
  }, []);

  async function fetchAdminInfo() {
    try {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (user) {
        setAdminInfo({
          email: user.email,
          lastSignIn: user.last_sign_in_at,
          created: user.created_at
        });
      }
    } catch (error) {
      console.error('Error fetching admin info:', error);
    }
  }

  async function fetchStatistics() {
    try {
      // Fetch total orders and calculate revenue
      const { data: orders, error: ordersError } = await supabase
        .from('porudzbine')
        .select('id, cena_ukupno');

      if (ordersError) throw ordersError;

      // Fetch total customers
      const { count: customersCount, error: customersError } = await supabase
        .from('kupci')
        .select('id', { count: 'exact' });

      if (customersError) throw customersError;

      // Fetch total products
      const { count: productsCount, error: productsError } = await supabase
        .from('proizvodi')
        .select('id', { count: 'exact' });

      if (productsError) throw productsError;

      // Calculate total revenue
      const totalRevenue =
        orders?.reduce((sum, order) => sum + (order.cena_ukupno || 0), 0) || 0;

      setStats({
        totalOrders: orders?.length || 0,
        totalCustomers: customersCount || 0,
        totalRevenue,
        totalProducts: productsCount || 0,
        recentOrders: [],
        topProducts: []
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
      toast.error('Greška pri učitavanju statistike');
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      window.location.href = '/login';
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Greška pri odjavljivanju');
    }
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Mobile Menu Button */}
      <div className='lg:hidden fixed top-4 right-4 z-50'>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className='p-2 bg-white rounded-lg shadow-md'
        >
          {isMobileMenuOpen ? (
            <X className='h-6 w-6' />
          ) : (
            <Menu className='h-6 w-6' />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className='lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40'>
          <div className='absolute right-0 top-0 h-full w-64 bg-white shadow-lg p-6'>
            <div className='space-y-6'>
              <button
                onClick={() => {
                  setActiveTab('products');
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center space-x-2 w-full px-4 py-2 rounded-lg ${
                  activeTab === 'products'
                    ? 'bg-yellow-100 text-yellow-600'
                    : 'hover:bg-gray-100'
                }`}
              >
                <Package className='h-5 w-5' />
                <span>Proizvodi</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('orders');
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center space-x-2 w-full px-4 py-2 rounded-lg ${
                  activeTab === 'orders'
                    ? 'bg-yellow-100 text-yellow-600'
                    : 'hover:bg-gray-100'
                }`}
              >
                <ShoppingBag className='h-5 w-5' />
                <span>Porudžbine</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('customers');
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center space-x-2 w-full px-4 py-2 rounded-lg ${
                  activeTab === 'customers'
                    ? 'bg-yellow-100 text-yellow-600'
                    : 'hover:bg-gray-100'
                }`}
              >
                <Users className='h-5 w-5' />
                <span>Kupci</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('revenue');
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center space-x-2 w-full px-4 py-2 rounded-lg ${
                  activeTab === 'revenue'
                    ? 'bg-yellow-100 text-yellow-600'
                    : 'hover:bg-gray-100'
                }`}
              >
                <CreditCard className='h-5 w-5' />
                <span>Prihodi</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('expenses');
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center space-x-2 w-full px-4 py-2 rounded-lg ${
                  activeTab === 'expenses'
                    ? 'bg-yellow-100 text-yellow-600'
                    : 'hover:bg-gray-100'
                }`}
              >
                <Wallet className='h-5 w-5' />
                <span>Troškovi</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('statistics');
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center space-x-2 w-full px-4 py-2 rounded-lg ${
                  activeTab === 'statistics'
                    ? 'bg-yellow-100 text-yellow-600'
                    : 'hover:bg-gray-100'
                }`}
              >
                <BarChart2 className='h-5 w-5' />
                <span>Statistika</span>
              </button>
              <button
                onClick={handleSignOut}
                className='flex items-center space-x-2 w-full px-4 py-2 rounded-lg text-red-600 hover:bg-red-50'
              >
                <LogOut className='h-5 w-5' />
                <span>Odjavi se</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Admin Info Section */}
        <div className='bg-white rounded-xl shadow-lg p-4 md:p-6 mb-8'>
          <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
            <div className='flex items-center space-x-4'>
              <div className='bg-yellow-100 p-3 rounded-full'>
                <User className='h-6 w-6 text-yellow-600' />
              </div>
              <div>
                <h2 className='text-xl font-semibold'>Admin Panel</h2>
                <div className='flex flex-col md:flex-row md:items-center md:space-x-4 text-sm text-gray-600'>
                  <div className='flex items-center space-x-1'>
                    <Mail className='h-4 w-4' />
                    <span>{adminInfo?.email}</span>
                  </div>
                  <div className='flex items-center space-x-1 mt-1 md:mt-0'>
                    <Calendar className='h-4 w-4' />
                    <span>
                      Poslednja prijava:{' '}
                      {adminInfo?.lastSignIn
                        ? new Date(adminInfo.lastSignIn).toLocaleString('sr-RS')
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className='flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors'
            >
              <LogOut className='h-4 w-4' />
              <span>Odjavi se</span>
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
          <QuickStatCard
            title='Ukupna prodaja'
            value={`${stats.totalRevenue.toLocaleString()} RSD`}
            change='+12.5%'
            trend='up'
            icon={DollarSign}
          />
          <QuickStatCard
            title='Aktivni proizvodi'
            value={stats.totalProducts.toString()}
            change='+8'
            trend='up'
            icon={Package}
          />
          <QuickStatCard
            title='Kupci'
            value={stats.totalCustomers.toString()}
            change='+24%'
            trend='up'
            icon={Users}
          />
          <QuickStatCard
            title='Porudžbine'
            value={stats.totalOrders.toString()}
            change='+15%'
            trend='up'
            icon={ShoppingCart}
          />
        </div>

        {/* Navigation Tabs - Desktop */}
        <div className='bg-white rounded-xl shadow-lg overflow-hidden'>
          <div className='border-b border-gray-200'>
            <nav className='flex space-x-8 px-6' aria-label='Tabs'>
              <button
                onClick={() => setActiveTab('products')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'products'
                    ? 'border-yellow-500 text-yellow-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } transition-colors`}
              >
                <div className='flex items-center space-x-2'>
                  <Package className='h-5 w-5' />
                  <span>Proizvodi</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'orders'
                    ? 'border-yellow-500 text-yellow-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } transition-colors`}
              >
                <div className='flex items-center space-x-2'>
                  <ShoppingBag className='h-5 w-5' />
                  <span>Porudžbine</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('customers')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'customers'
                    ? 'border-yellow-500 text-yellow-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } transition-colors`}
              >
                <div className='flex items-center space-x-2'>
                  <Users className='h-5 w-5' />
                  <span>Kupci</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('revenue')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'revenue'
                    ? 'border-yellow-500 text-yellow-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } transition-colors`}
              >
                <div className='flex items-center space-x-2'>
                  <CreditCard className='h-5 w-5' />
                  <span>Prihodi</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('expenses')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'expenses'
                    ? 'border-yellow-500 text-yellow-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } transition-colors`}
              >
                <div className='flex items-center space-x-2'>
                  <Wallet className='h-5 w-5' />
                  <span>Troškovi</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('statistics')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'statistics'
                    ? 'border-yellow-500 text-yellow-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } transition-colors`}
              >
                <div className='flex items-center space-x-2'>
                  <BarChart2 className='h-5 w-5' />
                  <span>Statistika</span>
                </div>
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className='mt-8 px-6 pb-6'>
            {activeTab === 'products' && <ProductsTab />}
            {activeTab === 'orders' && <OrdersTab />}
            {activeTab === 'customers' && <CustomersTab />}
            {activeTab === 'revenue' && <RevenueTab />}
            {activeTab === 'expenses' && <ExpensesTab />}
            {activeTab === 'statistics' && <StatisticsTab />}
          </div>
        </div>
      </div>
    </div>
  );
}

interface QuickStatCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ElementType;
}

function QuickStatCard({
  title,
  value,
  change,
  trend,
  icon: Icon
}: QuickStatCardProps) {
  return (
    <div className='bg-white rounded-xl shadow-lg p-4 md:p-6'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-4'>
          <div
            className={`p-3 rounded-full ${
              trend === 'up'
                ? 'bg-green-100 text-green-600'
                : 'bg-red-100 text-red-600'
            }`}
          >
            <Icon className='h-6 w-6' />
          </div>
          <div>
            <p className='text-sm text-gray-500'>{title}</p>
            <p className='text-lg md:text-2xl font-semibold'>{value}</p>
          </div>
        </div>
        <div
          className={`flex items-center space-x-1 ${
            trend === 'up' ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {trend === 'up' ? (
            <ArrowUpRight className='h-4 w-4' />
          ) : (
            <ArrowDownRight className='h-4 w-4' />
          )}
          <span className='text-sm font-medium'>{change}</span>
        </div>
      </div>
    </div>
  );
}
