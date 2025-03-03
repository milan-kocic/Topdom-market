'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, UserPlus, LogIn, LogOut, User } from 'lucide-react';
import { useProducts } from '@/lib/hooks/use-products';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { ProizvodDetalji } from '@/types';

export default function SearchBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { products, loading } = useProducts();
  const router = useRouter();
  const { user, signOut, isAdmin } = useAuth();

  // Filter products based on search query
  const filteredProducts = products
    ?.filter((product: ProizvodDetalji) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        product.naziv_proizvoda.toLowerCase().includes(searchLower) ||
        (product.opis && product.opis.toLowerCase().includes(searchLower))
      );
    })
    .slice(0, 5);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowResults(true);
  };

  const handleProductSelect = (product: ProizvodDetalji) => {
    setSearchQuery('');
    setShowResults(false);
    router.push(`/proizvod/${product.id}`);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className='bg-gray-100 py-3 relative'>
      <div className='container mx-auto px-6'>
        <div className='flex justify-between items-center'>
          {/* Left side - Auth buttons */}
          <div className='w-48 flex items-center space-x-4'>
            {!user ? (
              <>
                <Link
                  href='/login'
                  className='flex items-center space-x-1 text-sm hover:text-yellow-500 transition-colors'
                >
                  <LogIn className='h-4 w-4' />
                  <span>Prijava</span>
                </Link>
                <Link
                  href='/register'
                  className='flex items-center space-x-1 text-sm hover:text-yellow-500 transition-colors'
                >
                  <UserPlus className='h-4 w-4' />
                  <span>Registracija</span>
                </Link>
              </>
            ) : (
              <div className='flex items-center space-x-4'>
                {isAdmin && (
                  <Link
                    href='/admin'
                    className='flex items-center space-x-1 text-sm hover:text-yellow-500 transition-colors'
                  >
                    <User className='h-4 w-4' />
                    <span>Admin</span>
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  className='flex items-center space-x-1 text-sm hover:text-yellow-500 transition-colors'
                >
                  <LogOut className='h-4 w-4' />
                  <span>Odjava</span>
                </button>
              </div>
            )}
          </div>

          {/* Center - Search */}
          <div className='flex-1 max-w-xl relative' ref={searchRef}>
            <div className='relative'>
              <input
                type='text'
                placeholder='Pretraži proizvode...'
                className='w-full py-2 pl-10 pr-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent'
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => setShowResults(true)}
              />
              <Search className='absolute left-3 top-2.5 h-5 w-5 text-gray-400' />
            </div>

            {/* Search Results Dropdown */}
            {showResults && searchQuery.length > 0 && (
              <div className='absolute z-20 mt-2 w-full bg-white rounded-lg shadow-lg overflow-hidden'>
                {loading ? (
                  <div className='p-4 text-gray-500'>Učitavanje...</div>
                ) : filteredProducts && filteredProducts.length > 0 ? (
                  <div className='py-2'>
                    {filteredProducts.map((product) => (
                      <button
                        key={product.id}
                        onClick={() =>
                          handleProductSelect(product as ProizvodDetalji)
                        }
                        className='w-full px-4 py-2 text-left hover:bg-yellow-50 flex items-center space-x-3 transition-colors duration-200'
                      >
                        {product.glavna_slika && (
                          <img
                            src={product.glavna_slika}
                            alt={product.naziv_proizvoda}
                            className='w-12 h-12 object-cover rounded'
                          />
                        )}
                        <div>
                          <div className='font-medium'>
                            {product.naziv_proizvoda}
                          </div>
                          <div className='text-sm text-gray-500'>
                            {product.cena} RSD
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className='p-4 text-gray-500'>
                    Nema rezultata za "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right navigation */}
          <div className='w-48 flex items-center justify-end space-x-6 text-sm'>
            <a href='#' className='hover:text-yellow-500 transition-colors'>
              Blog
            </a>
            <a href='#' className='hover:text-yellow-500 transition-colors'>
              Kontakt
            </a>
            <a href='#' className='hover:text-yellow-500 transition-colors'>
              Dostava
            </a>
            <a href='#' className='hover:text-yellow-500 transition-colors'>
              Pomoć
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
