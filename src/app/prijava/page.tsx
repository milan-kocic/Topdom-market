'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signIn } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Molimo unesite email i lozinku');
      return;
    }

    try {
      setLoading(true);
      const { success, error } = await signIn(email, password);

      if (error) {
        throw error;
      }

      toast.success('Uspešno ste se prijavili');
      router.push('/');
    } catch (error: any) {
      console.error('Greška pri prijavi:', error);
      toast.error(
        error.message || 'Greška pri prijavi. Proverite vaše podatke.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='container mx-auto px-4 py-12'>
      <div className='max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden'>
        <div className='px-6 py-8'>
          <div className='flex justify-center mb-6'>
            <LogIn className='h-12 w-12 text-indigo-600' />
          </div>

          <h2 className='text-2xl font-bold text-center text-gray-800 mb-8'>
            Prijava na nalog
          </h2>

          <form onSubmit={handleSubmit}>
            <div className='mb-6'>
              <label
                htmlFor='email'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Email adresa
              </label>
              <input
                id='email'
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
                placeholder='vasa.adresa@email.com'
                required
              />
            </div>

            <div className='mb-6'>
              <label
                htmlFor='password'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Lozinka
              </label>
              <input
                id='password'
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
                placeholder='••••••••'
                required
              />
            </div>

            <div className='mb-6'>
              <button
                type='submit'
                disabled={loading}
                className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {loading ? (
                  <span className='flex items-center'>
                    <svg
                      className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                    >
                      <circle
                        className='opacity-25'
                        cx='12'
                        cy='12'
                        r='10'
                        stroke='currentColor'
                        strokeWidth='4'
                      ></circle>
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                      ></path>
                    </svg>
                    Prijavljivanje...
                  </span>
                ) : (
                  'Prijavi se'
                )}
              </button>
            </div>
          </form>

          <div className='mt-4 text-center'>
            <p className='text-sm text-gray-600'>
              Nemate nalog?{' '}
              <Link
                href='/registracija'
                className='font-medium text-indigo-600 hover:text-indigo-500'
              >
                Registrujte se
              </Link>
            </p>
          </div>

          <div className='mt-4 text-center'>
            <Link
              href='/zaboravljena-lozinka'
              className='text-sm font-medium text-indigo-600 hover:text-indigo-500'
            >
              Zaboravili ste lozinku?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
