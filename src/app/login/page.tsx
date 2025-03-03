'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { success, error } = await signIn(email, password);

      if (success) {
        router.push('/');
      } else if (error) {
        setError('Pogrešan email ili lozinka');
      }
    } catch (err) {
      setError('Došlo je do greške pri prijavljivanju');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        <div className='text-center'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>Prijava</h1>
          <p className='text-gray-600'>
            Prijavite se na vaš nalog da biste nastavili
          </p>
        </div>

        <div className='bg-white p-8 rounded-xl shadow-md'>
          {error && (
            <div className='mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm'>
              {error}
            </div>
          )}

          <form className='space-y-6' onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor='email'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Email adresa
              </label>
              <div className='relative'>
                <input
                  id='email'
                  name='email'
                  type='email'
                  autoComplete='email'
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className='w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent'
                  placeholder='Unesite vašu email adresu'
                />
                <Mail className='h-5 w-5 text-yellow-400 absolute left-3 top-1/2 transform -translate-y-1/2' />
              </div>
            </div>

            <div>
              <label
                htmlFor='password'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Lozinka
              </label>
              <div className='relative'>
                <input
                  id='password'
                  name='password'
                  type='password'
                  autoComplete='current-password'
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className='w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent'
                  placeholder='Unesite vašu lozinku'
                />
                <Lock className='h-5 w-5 text-yellow-400 absolute left-3 top-1/2 transform -translate-y-1/2' />
              </div>
            </div>

            <div>
              <button
                type='submit'
                disabled={loading}
                className='w-full bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {loading ? 'Prijavljivanje...' : 'Prijavi se'}
              </button>
            </div>
          </form>

          <div className='mt-6 text-center'>
            <p className='text-sm text-gray-600'>
              Nemate nalog?{' '}
              <Link
                href='/register'
                className='text-yellow-600 hover:text-yellow-700 font-medium'
              >
                Registrujte se
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
