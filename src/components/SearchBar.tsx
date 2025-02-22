'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, UserPlus, LogIn, LogOut, User } from 'lucide-react';
import { useProducts } from '@/lib/hooks/use-products';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import type { Database } from '@/lib/types/database.types';

type Product = Database['public']['Tables']['proizvodi']['Row'];

export default function SearchBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { products, loading } = useProducts();
  const router = useRouter();
  const { user, signOut, isAdmin } = useAuth();

  // Filter products based on search query
  const filteredProducts = products
    ?.filter((product) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        product.naziv_proizvoda.toLowerCase().includes(searchLower) ||
        product.opis.toLowerCase().includes(searchLower)
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

  const handleProductSelect = (product: Product) => {
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
                  href='/register'
                  className='flex items-center space-x-2 text-sm hover:text-yellow-500 transition-all duration-200 px-3 py-2 rounded-lg hover:bg-white'
                >
                  <UserPlus className='h-5 w-5' />
                  <span>Registracija</span>
                </Link>
                <Link
                  href='/login'
                  className='flex items-center space-x-2 text-sm hover:text-yellow-500 transition-all duration-200 px-3 py-2 rounded-lg hover:bg-white'
                >
                  <LogIn className='h-5 w-5' />
                  <span>Prijava</span>
                </Link>
              </>
            ) : (
              <>
                {isAdmin && (
                  <Link
                    href='/admin'
                    className='flex items-center space-x-2 text-sm hover:text-yellow-500 transition-all duration-200 px-3 py-2 rounded-lg hover:bg-white'
                  >
                    <User className='h-5 w-5' />
                    <span>Admin Panel</span>
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  className='flex items-center space-x-2 text-sm hover:text-yellow-500 transition-all duration-200 px-3 py-2 rounded-lg hover:bg-white'
                >
                  <LogOut className='h-5 w-5' />
                  <span>Odjavi se</span>
                </button>
              </>
            )}
          </div>

          {/* Centered search */}
          <div className='flex-1 max-w-md mx-auto' ref={searchRef}>
            <div className='relative group'>
              <input
                type='search'
                placeholder='Pretraga proizvoda...'
                value={searchQuery}
                onChange={handleSearchChange}
                className='w-full px-4 py-2 pl-10 bg-white rounded-full text-sm border border-gray-200 shadow-sm 
                  focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent
                  group-hover:shadow-md transition-all duration-200'
              />
              <Search
                className='h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 
                group-hover:text-yellow-500 transition-colors duration-200'
              />
            </div>

            {showResults && searchQuery && (
              <div
                className='absolute mt-2 w-full bg-white rounded-lg shadow-lg z-[100] max-h-96 overflow-y-auto 
                border border-gray-100 transform transition-all duration-200 scale-100 origin-top'
              >
                {loading ? (
                  <div className='p-4 text-gray-500'>Pretraživanje...</div>
                ) : filteredProducts && filteredProducts.length > 0 ? (
                  <div className='py-2'>
                    {filteredProducts.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => handleProductSelect(product)}
                        className='w-full px-4 py-2 text-left hover:bg-yellow-50 flex items-center space-x-3 transition-colors duration-200'
                      >
                        {product.img_url && (
                          <img
                            src={product.img_url}
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
