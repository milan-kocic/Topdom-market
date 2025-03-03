'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Mail,
  Lock,
  AlertCircle,
  User,
  MapPin,
  Phone,
  Home
} from 'lucide-react';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [ime, setIme] = useState('');
  const [prezime, setPrezime] = useState('');
  const [adresa, setAdresa] = useState('');
  const [mesto, setMesto] = useState('');
  const [postanskiBroj, setPostanskiBroj] = useState('');
  const [brojTelefona, setBrojTelefona] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { signUp } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    // Validacija
    if (password !== confirmPassword) {
      setError('Lozinke se ne podudaraju');
      return;
    }

    if (password.length < 6) {
      setError('Lozinka mora imati najmanje 6 karaktera');
      return;
    }

    if (!ime || !prezime) {
      setError('Ime i prezime su obavezna polja');
      return;
    }

    if (!adresa || !mesto || !postanskiBroj) {
      setError('Adresa, mesto i poštanski broj su obavezna polja');
      return;
    }

    if (!brojTelefona) {
      setError('Broj telefona je obavezno polje');
      return;
    }

    setLoading(true);

    try {
      await signUp(
        email,
        password,
        ime,
        prezime,
        adresa,
        mesto,
        postanskiBroj,
        brojTelefona
      );
      setSuccess(true);

      // Redirekcija na login stranicu nakon 3 sekunde
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err) {
      setError('Došlo je do greške pri registraciji');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-md w-full space-y-8 text-center'>
          <div className='bg-white p-8 rounded-xl shadow-md'>
            <div className='text-green-500 mb-4'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-16 w-16 mx-auto'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M5 13l4 4L19 7'
                />
              </svg>
            </div>
            <h2 className='text-2xl font-bold text-gray-900 mb-2'>
              Uspešna registracija!
            </h2>
            <p className='text-gray-600 mb-4'>
              Proverite vaš email za potvrdu registracije. Bićete preusmereni na
              stranicu za prijavu.
            </p>
            <Link
              href='/login'
              className='text-yellow-600 hover:text-yellow-700 font-medium'
            >
              Idi na prijavu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        <div className='text-center'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            Registracija
          </h1>
          <p className='text-gray-600'>
            Kreirajte nalog da biste mogli da kupujete
          </p>
        </div>

        <div className='bg-white p-8 rounded-xl shadow-md'>
          {error && (
            <div className='mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-start'>
              <AlertCircle className='h-5 w-5 mr-2 flex-shrink-0 mt-0.5' />
              <span>{error}</span>
            </div>
          )}

          <form className='space-y-6' onSubmit={handleSubmit}>
            {/* Lični podaci */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label
                  htmlFor='ime'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  Ime
                </label>
                <div className='relative'>
                  <input
                    id='ime'
                    name='ime'
                    type='text'
                    required
                    value={ime}
                    onChange={(e) => setIme(e.target.value)}
                    className='w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent'
                    placeholder='Unesite vaše ime'
                  />
                  <User className='h-5 w-5 text-yellow-400 absolute left-3 top-1/2 transform -translate-y-1/2' />
                </div>
              </div>

              <div>
                <label
                  htmlFor='prezime'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  Prezime
                </label>
                <div className='relative'>
                  <input
                    id='prezime'
                    name='prezime'
                    type='text'
                    required
                    value={prezime}
                    onChange={(e) => setPrezime(e.target.value)}
                    className='w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent'
                    placeholder='Unesite vaše prezime'
                  />
                  <User className='h-5 w-5 text-yellow-400 absolute left-3 top-1/2 transform -translate-y-1/2' />
                </div>
              </div>
            </div>

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
                htmlFor='brojTelefona'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Broj telefona
              </label>
              <div className='relative'>
                <input
                  id='brojTelefona'
                  name='brojTelefona'
                  type='tel'
                  required
                  value={brojTelefona}
                  onChange={(e) => setBrojTelefona(e.target.value)}
                  className='w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent'
                  placeholder='Unesite vaš broj telefona'
                />
                <Phone className='h-5 w-5 text-yellow-400 absolute left-3 top-1/2 transform -translate-y-1/2' />
              </div>
            </div>

            {/* Adresa */}
            <div>
              <label
                htmlFor='adresa'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Adresa
              </label>
              <div className='relative'>
                <input
                  id='adresa'
                  name='adresa'
                  type='text'
                  required
                  value={adresa}
                  onChange={(e) => setAdresa(e.target.value)}
                  className='w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent'
                  placeholder='Unesite vašu adresu'
                />
                <Home className='h-5 w-5 text-yellow-400 absolute left-3 top-1/2 transform -translate-y-1/2' />
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label
                  htmlFor='mesto'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  Mesto
                </label>
                <div className='relative'>
                  <input
                    id='mesto'
                    name='mesto'
                    type='text'
                    required
                    value={mesto}
                    onChange={(e) => setMesto(e.target.value)}
                    className='w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent'
                    placeholder='Unesite mesto'
                  />
                  <MapPin className='h-5 w-5 text-yellow-400 absolute left-3 top-1/2 transform -translate-y-1/2' />
                </div>
              </div>

              <div>
                <label
                  htmlFor='postanskiBroj'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  Poštanski broj
                </label>
                <div className='relative'>
                  <input
                    id='postanskiBroj'
                    name='postanskiBroj'
                    type='text'
                    required
                    value={postanskiBroj}
                    onChange={(e) => setPostanskiBroj(e.target.value)}
                    className='w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent'
                    placeholder='Unesite poštanski broj'
                  />
                  <MapPin className='h-5 w-5 text-yellow-400 absolute left-3 top-1/2 transform -translate-y-1/2' />
                </div>
              </div>
            </div>

            {/* Lozinka */}
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
                  autoComplete='new-password'
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className='w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent'
                  placeholder='Unesite vašu lozinku'
                />
                <Lock className='h-5 w-5 text-yellow-400 absolute left-3 top-1/2 transform -translate-y-1/2' />
              </div>
              <p className='mt-1 text-xs text-gray-500'>
                Lozinka mora imati najmanje 6 karaktera
              </p>
            </div>

            <div>
              <label
                htmlFor='confirmPassword'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Potvrdite lozinku
              </label>
              <div className='relative'>
                <input
                  id='confirmPassword'
                  name='confirmPassword'
                  type='password'
                  autoComplete='new-password'
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className='w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent'
                  placeholder='Potvrdite vašu lozinku'
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
                {loading ? 'Registracija...' : 'Registruj se'}
              </button>
            </div>
          </form>

          <div className='mt-6 text-center'>
            <p className='text-sm text-gray-600'>
              Već imate nalog?{' '}
              <Link
                href='/login'
                className='text-yellow-600 hover:text-yellow-700 font-medium'
              >
                Prijavite se
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
