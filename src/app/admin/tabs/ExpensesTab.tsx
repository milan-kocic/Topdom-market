'use client';

import { useState, useEffect } from 'react';
import {
  PlusCircle,
  Search,
  Download,
  Pencil,
  Trash2,
  X,
  Calendar
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { exportToCSV } from '@/lib/utils/csv-export';
import type { Database } from '@/lib/types/database.types';

type Expense = Database['public']['Tables']['troskovi']['Row'];

interface ExpenseModalProps {
  expense: Expense | null;
  onClose: () => void;
  onSave: () => void;
}

function ExpenseModal({ expense, onClose, onSave }: ExpenseModalProps) {
  const [formData, setFormData] = useState({
    naziv: expense?.naziv || '',
    opis: expense?.opis || '',
    iznos: expense?.iznos || 0,
    datum: expense?.datum || new Date().toISOString().split('T')[0],
    kategorija: expense?.kategorija || 'Marketing'
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      if (expense?.id) {
        // Update existing expense
        const { error } = await supabase
          .from('troskovi')
          .update(formData)
          .eq('id', expense.id);

        if (error) throw error;
        toast.success('Trošak uspešno ažuriran');
      } else {
        // Create new expense
        const { error } = await supabase.from('troskovi').insert([formData]);

        if (error) throw error;
        toast.success('Trošak uspešno kreiran');
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving expense:', error);
      toast.error('Greška pri čuvanju troška');
    }
  }

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
      <div className='bg-white rounded-xl max-w-md w-full p-6'>
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-2xl font-bold'>
            {expense?.id ? 'Izmeni trošak' : 'Novi trošak'}
          </h2>
          <button
            onClick={onClose}
            className='p-2 hover:bg-gray-100 rounded-full'
            title='Zatvori'
            aria-label='Zatvori'
          >
            <X className='h-5 w-5' />
          </button>
        </div>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Naziv troška
            </label>
            <input
              type='text'
              value={formData.naziv}
              onChange={(e) =>
                setFormData({ ...formData, naziv: e.target.value })
              }
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent'
              required
              aria-label='Naziv troška'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Kategorija
            </label>
            <select
              value={formData.kategorija}
              onChange={(e) =>
                setFormData({ ...formData, kategorija: e.target.value })
              }
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent'
              required
              aria-label='Kategorija troška'
            >
              <option value='Marketing'>Marketing</option>
              <option value='Plate'>Plate</option>
              <option value='Održavanje'>Održavanje</option>
              <option value='Komunalije'>Komunalije</option>
              <option value='Dostava'>Dostava</option>
              <option value='Pakovanje'>Pakovanje</option>
              <option value='Ostalo'>Ostalo</option>
            </select>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Opis
            </label>
            <textarea
              value={formData.opis || ''}
              onChange={(e) =>
                setFormData({ ...formData, opis: e.target.value })
              }
              rows={3}
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent'
              aria-label='Opis troška'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Iznos (RSD)
            </label>
            <input
              type='number'
              value={formData.iznos}
              onChange={(e) =>
                setFormData({ ...formData, iznos: parseFloat(e.target.value) })
              }
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent'
              required
              min='0'
              step='0.01'
              aria-label='Iznos troška'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Datum
            </label>
            <input
              type='date'
              value={formData.datum}
              onChange={(e) =>
                setFormData({ ...formData, datum: e.target.value })
              }
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent'
              required
              aria-label='Datum troška'
            />
          </div>

          <div className='flex justify-end space-x-4 mt-6'>
            <button
              type='button'
              onClick={onClose}
              className='px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors'
            >
              Otkaži
            </button>
            <button
              type='submit'
              className='px-6 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-300 transition-colors'
            >
              Sačuvaj
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ExpensesTab() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30))
      .toISOString()
      .split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    checkAuthAndFetchExpenses();
  }, [dateFilter]);

  async function checkAuthAndFetchExpenses() {
    try {
      const {
        data: { session },
        error: authError
      } = await supabase.auth.getSession();

      if (authError) {
        console.error('Auth error:', authError);
        toast.error('Greška pri proveri autentifikacije');
        return;
      }

      if (!session) {
        toast.error('Molimo prijavite se da biste pristupili troškovima');
        return;
      }

      await fetchExpenses();
    } catch (error) {
      console.error('Error checking auth:', error);
      toast.error('Greška pri proveri autentifikacije');
    }
  }

  async function fetchExpenses() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('troskovi')
        .select('*')
        .order('datum', { ascending: false });

      if (error) {
        console.error('Supabase error:', {
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        toast.error('Greška pri učitavanju troškova');
        return;
      }

      if (data) {
        setExpenses(data);
        console.log('Troškovi uspešno učitani:', data.length);
      }
    } catch (error) {
      console.error('Error fetching expenses:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      toast.error('Greška pri učitavanju troškova');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteExpense(id: string) {
    try {
      const { error } = await supabase.from('troskovi').delete().eq('id', id);

      if (error) throw error;
      await fetchExpenses();
      toast.success('Trošak uspešno obrisan');
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error('Greška pri brisanju troška');
    }
  }

  async function handleExportCSV() {
    try {
      const expensesForExport = expenses.map((expense) => ({
        ID: expense.id,
        Naziv: expense.naziv,
        Kategorija: expense.kategorija,
        Opis: expense.opis || '',
        'Iznos (RSD)': expense.iznos,
        Datum: new Date(expense.datum).toLocaleDateString('sr-RS'),
        'Datum kreiranja': new Date(expense.kreirano).toLocaleDateString(
          'sr-RS'
        )
      }));

      exportToCSV(expensesForExport, 'troskovi');
      toast.success('Troškovi uspešno izvezeni');
    } catch (error) {
      console.error('Error exporting expenses:', error);
      toast.error('Greška pri izvozu troškova');
    }
  }

  function handleQuickRange(days: number) {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(new Date().setDate(new Date().getDate() - days))
      .toISOString()
      .split('T')[0];
    setDateFilter({ startDate, endDate });
  }

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch =
      expense.naziv.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.kategorija.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (expense.opis || '').toLowerCase().includes(searchQuery.toLowerCase());

    const expenseDate = new Date(expense.datum);
    const startDate = new Date(dateFilter.startDate);
    const endDate = new Date(dateFilter.endDate);
    endDate.setHours(23, 59, 59);

    const matchesDate = expenseDate >= startDate && expenseDate <= endDate;

    return matchesSearch && matchesDate;
  });

  const totalExpenses = filteredExpenses.reduce(
    (sum, expense) => sum + expense.iznos,
    0
  );

  return (
    <div>
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8'>
        <div>
          <h1 className='text-3xl font-bold'>Troškovi</h1>
          <p className='text-gray-600 mt-1'>
            Upravljajte troškovima poslovanja
          </p>
        </div>
        <div className='flex flex-col sm:flex-row gap-4'>
          <button
            onClick={handleExportCSV}
            className='flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors'
          >
            <Download className='h-5 w-5' />
            <span>Izvezi CSV</span>
          </button>
          <button
            onClick={() => {
              setSelectedExpense(null);
              setShowExpenseModal(true);
            }}
            className='flex items-center space-x-2 px-4 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-300 transition-colors'
          >
            <PlusCircle className='h-5 w-5' />
            <span>Novi trošak</span>
          </button>
        </div>
      </div>

      <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
        <div className='p-4 border-b border-gray-200'>
          <div className='flex flex-col sm:flex-row gap-4'>
            <div className='flex-1'>
              <div className='relative'>
                <input
                  type='text'
                  placeholder='Pretraži troškove...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent'
                  aria-label='Pretraži troškove'
                />
                <Search className='h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2' />
              </div>
            </div>

            <div className='flex items-center gap-4'>
              <div className='flex items-center space-x-2 bg-white border border-gray-200 rounded-lg p-2'>
                <Calendar className='h-5 w-5 text-gray-500' />
                <input
                  type='date'
                  value={dateFilter.startDate}
                  onChange={(e) =>
                    setDateFilter((prev) => ({
                      ...prev,
                      startDate: e.target.value
                    }))
                  }
                  className='border-0 focus:ring-0 text-sm'
                  title='Početni datum'
                  aria-label='Početni datum'
                />
                <span className='text-gray-500'>do</span>
                <input
                  type='date'
                  value={dateFilter.endDate}
                  onChange={(e) =>
                    setDateFilter((prev) => ({
                      ...prev,
                      endDate: e.target.value
                    }))
                  }
                  className='border-0 focus:ring-0 text-sm'
                  title='Krajnji datum'
                  aria-label='Krajnji datum'
                />
              </div>

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
            </div>

            <div className='text-right'>
              <p className='text-sm text-gray-500'>Ukupno troškova:</p>
              <p className='text-lg font-semibold'>
                {totalExpenses.toLocaleString()} RSD
              </p>
            </div>
          </div>
        </div>

        <div className='divide-y divide-gray-200'>
          {loading ? (
            <div className='p-8 text-center text-gray-500'>
              Učitavanje troškova...
            </div>
          ) : filteredExpenses.length > 0 ? (
            filteredExpenses.map((expense) => (
              <div
                key={expense.id}
                className='p-4 hover:bg-gray-50 transition-colors'
              >
                <div className='flex items-start justify-between'>
                  <div className='space-y-1'>
                    <div className='flex items-center space-x-3'>
                      <span className='font-medium'>{expense.naziv}</span>
                      <span className='px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full'>
                        {expense.kategorija}
                      </span>
                    </div>
                    {expense.opis && (
                      <p className='text-sm text-gray-500'>{expense.opis}</p>
                    )}
                    <div className='flex items-center space-x-4 text-sm text-gray-500'>
                      <div className='flex items-center space-x-1'>
                        <Calendar className='h-4 w-4' />
                        <span>
                          {new Date(expense.datum).toLocaleDateString('sr-RS')}
                        </span>
                      </div>
                      <div className='flex items-center space-x-1 font-medium text-gray-900'>
                        <span>{expense.iznos.toLocaleString()} RSD</span>
                      </div>
                    </div>
                  </div>

                  <div className='flex items-center space-x-2'>
                    <button
                      onClick={() => {
                        setSelectedExpense(expense);
                        setShowExpenseModal(true);
                      }}
                      className='p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg transition-colors'
                      title='Izmeni'
                      aria-label='Izmeni trošak'
                    >
                      <Pencil className='h-5 w-5' />
                    </button>
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            'Da li ste sigurni da želite da obrišete ovaj trošak?'
                          )
                        ) {
                          handleDeleteExpense(expense.id);
                        }
                      }}
                      className='p-2 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors'
                      title='Obriši'
                      aria-label='Obriši trošak'
                    >
                      <Trash2 className='h-5 w-5' />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className='p-8 text-center text-gray-500'>
              Nema pronađenih troškova
            </div>
          )}
        </div>
      </div>

      {showExpenseModal && (
        <ExpenseModal
          expense={selectedExpense}
          onClose={() => {
            setShowExpenseModal(false);
            setSelectedExpense(null);
          }}
          onSave={fetchExpenses}
        />
      )}
    </div>
  );
}
