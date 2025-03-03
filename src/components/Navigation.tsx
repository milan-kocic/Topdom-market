'use client';

import {
  ShoppingCart,
  Search,
  Heart,
  Menu,
  ChevronDown,
  Store,
  User,
  LogOut,
  Settings
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth/auth-context';
import Link from 'next/link';
import type { Database } from '@/lib/types/database.types';

type Category = Database['public']['Tables']['kategorije']['Row'];

function NavItem({
  title,
  href,
  isHighlighted = false
}: {
  title: string;
  href: string;
  isHighlighted?: boolean;
}) {
  return (
    <Link href={href} className='relative group'>
      <div
        className={`flex items-center space-x-2 text-base font-medium ${
          isHighlighted ? 'text-red-500' : 'hover:text-yellow-500'
        } transition-colors px-3 py-2 rounded-full hover:bg-gray-50`}
      >
        <span>{title}</span>
      </div>
    </Link>
  );
}

function AllCategoriesDropdown({
  categories,
  isLoading
}: {
  categories: Category[];
  isLoading: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className='relative'
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        className={`flex items-center space-x-2 text-base font-medium transition-all duration-200 px-4 py-2 rounded-lg ${
          isOpen
            ? 'bg-yellow-50 text-yellow-600 shadow-sm'
            : 'hover:bg-gray-50 hover:text-yellow-500'
        }`}
      >
        <span>Kategorije</span>
        <ChevronDown
          className={`h-4 w-4 transform transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      <div
        className={`absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 transition-all duration-200 ${
          isOpen
            ? 'opacity-100 visible translate-y-0'
            : 'opacity-0 invisible -translate-y-2'
        }`}
      >
        {isLoading ? (
          <div className='px-4 py-2 text-gray-500'>Učitavanje...</div>
        ) : categories.length > 0 ? (
          categories.map((category) => (
            <button
              key={category.id}
              className='w-full text-left px-4 py-2 text-gray-700 hover:bg-yellow-50 hover:text-yellow-500 transition-colors'
            >
              {category.naziv_kategorije}
            </button>
          ))
        ) : (
          <div className='px-4 py-2 text-gray-500'>
            Nema dostupnih kategorija
          </div>
        )}
      </div>
    </div>
  );
}

export default function Navigation() {
  const { user, isAdmin, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const { data, error } = await supabase
          .from('kategorije')
          .select('*')
          .order('naziv_kategorije', { ascending: true });

        if (error) throw error;
        setCategories(data || []);
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCategories();
  }, []);

  const menuItems = [
    { id: 'home', title: 'Početna', href: '/' },
    { id: 'products', title: 'Proizvodi', href: '/proizvodi' },
    { id: 'best-sellers', title: 'Top ponuda', href: '/najprodavanije' },
    { id: 'new-products', title: 'Najnovije', href: '/novo' }
  ];

  return (
    <nav className='sticky top-0 bg-white shadow-lg z-50'>
      <div className='container mx-auto px-4'>
        <div className='flex items-center justify-between h-20'>
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className='lg:hidden'
            aria-label='Otvori meni'
            title='Otvori meni'
          >
            <Menu className='h-7 w-7' />
          </button>

          {/* Logo */}
          <Link href='/' className='w-auto'>
            <div className='flex items-center space-x-2'>
              <Store className='h-7 w-7 text-yellow-500' />
              <div>
                <h1 className='text-xl font-bold whitespace-nowrap bg-gradient-to-r from-yellow-500 to-yellow-600 text-transparent bg-clip-text'>
                  TOP DOM
                </h1>
                <span className='text-xs text-gray-600 font-medium'>
                  Market
                </span>
              </div>
            </div>
          </Link>

          {/* Main Navigation - Centered */}
          <div className='hidden lg:flex items-center justify-center space-x-6 flex-1'>
            {/* All Categories */}
            <AllCategoriesDropdown
              categories={categories}
              isLoading={isLoading}
            />

            {/* Menu Items */}
            {menuItems.map((item) => (
              <NavItem key={item.id} title={item.title} href={item.href} />
            ))}

            {/* Admin Link - Only visible to admins */}
            {isAdmin && (
              <NavItem
                title='Administracija'
                href='/admin'
                isHighlighted={true}
              />
            )}
          </div>

          {/* Icons */}
          <div className='flex items-center space-x-4'>
            <button
              className='p-2 hover:bg-gray-100 rounded-full transition-colors'
              aria-label='Pretraga'
              title='Pretraga'
            >
              <Search className='h-5 w-5 hover:text-yellow-500 transition-colors' />
            </button>
            <button
              className='p-2 hover:bg-gray-100 rounded-full transition-colors'
              aria-label='Omiljeno'
              title='Omiljeno'
            >
              <Heart className='h-5 w-5 hover:text-yellow-500 transition-colors' />
            </button>
            <button
              className='p-2 hover:bg-gray-100 rounded-full transition-colors'
              aria-label='Korpa'
              title='Korpa'
            >
              <ShoppingCart className='h-5 w-5 hover:text-yellow-500 transition-colors' />
            </button>

            {/* User Menu */}
            <div className='relative'>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className='p-2 hover:bg-gray-100 rounded-full transition-colors'
                aria-label='Korisnički meni'
                title='Korisnički meni'
              >
                <User className='h-5 w-5 hover:text-yellow-500 transition-colors' />
              </button>

              {/* User Dropdown */}
              {isUserMenuOpen && (
                <div className='absolute right-0 mt-2 w-60 bg-white rounded-lg shadow-lg py-2 z-50'>
                  {user ? (
                    <>
                      <div className='px-4 py-2 border-b border-gray-100'>
                        <p className='text-sm font-medium'>{user.email}</p>
                        <p className='text-xs text-gray-500'>
                          {isAdmin ? 'Administrator' : 'Korisnik'}
                        </p>
                      </div>
                      <Link
                        href='/profil'
                        className='block px-4 py-2 text-sm text-gray-700 hover:bg-yellow-50 hover:text-yellow-500'
                      >
                        <div className='flex items-center space-x-2'>
                          <User className='h-4 w-4' />
                          <span>Moj profil</span>
                        </div>
                      </Link>
                      {isAdmin && (
                        <Link
                          href='/admin'
                          className='block px-4 py-2 text-sm text-gray-700 hover:bg-yellow-50 hover:text-yellow-500'
                        >
                          <div className='flex items-center space-x-2'>
                            <Settings className='h-4 w-4' />
                            <span>Administracija</span>
                          </div>
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          signOut();
                          setIsUserMenuOpen(false);
                        }}
                        className='block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-yellow-50 hover:text-yellow-500'
                      >
                        <div className='flex items-center space-x-2'>
                          <LogOut className='h-4 w-4' />
                          <span>Odjavi se</span>
                        </div>
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href='/login'
                        className='block px-4 py-2 text-sm text-gray-700 hover:bg-yellow-50 hover:text-yellow-500'
                      >
                        Prijavi se
                      </Link>
                      <Link
                        href='/register'
                        className='block px-4 py-2 text-sm text-gray-700 hover:bg-yellow-50 hover:text-yellow-500'
                      >
                        Registruj se
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className='lg:hidden absolute top-full left-0 right-0 bg-white shadow-lg py-4'>
          <div className='container mx-auto px-6'>
            <div className='flex flex-col space-y-4'>
              {menuItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className='flex items-center justify-between py-2 hover:text-yellow-500 transition-colors'
                >
                  <span>{item.title}</span>
                </Link>
              ))}

              {/* Admin Link - Only visible to admins */}
              {isAdmin && (
                <Link
                  href='/admin'
                  className='flex items-center justify-between py-2 text-red-500 hover:text-red-600 transition-colors'
                >
                  <span>Administracija</span>
                </Link>
              )}

              <div className='border-t border-gray-200 pt-4'>
                <div className='font-medium mb-2'>Kategorije:</div>
                {isLoading ? (
                  <div className='pl-4 py-2 text-gray-500'>Učitavanje...</div>
                ) : categories.length > 0 ? (
                  categories.map((category) => (
                    <button
                      key={category.id}
                      className='w-full text-left py-2 hover:text-yellow-500 transition-colors pl-4'
                    >
                      {category.naziv_kategorije}
                    </button>
                  ))
                ) : (
                  <div className='pl-4 py-2 text-gray-500'>
                    Nema dostupnih kategorija
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
