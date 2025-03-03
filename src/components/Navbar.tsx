'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import {
  ShoppingCart,
  User,
  Package,
  Menu,
  X,
  LogOut,
  LogIn
} from 'lucide-react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, isAdmin, signOut } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    closeMenu();
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className='bg-white shadow-md'>
      <div className='container mx-auto px-4'>
        <div className='flex justify-between items-center h-16'>
          {/* Logo */}
          <div className='flex-shrink-0'>
            <Link href='/' className='text-xl font-bold text-gray-800'>
              TopDom Market
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className='hidden md:flex items-center space-x-8'>
            <Link
              href='/'
              className={`text-gray-600 hover:text-indigo-600 ${
                isActive('/') ? 'text-indigo-600 font-medium' : ''
              }`}
            >
              Početna
            </Link>
            <Link
              href='/proizvodi'
              className={`text-gray-600 hover:text-indigo-600 ${
                isActive('/proizvodi') ? 'text-indigo-600 font-medium' : ''
              }`}
            >
              Proizvodi
            </Link>
            <Link
              href='/o-nama'
              className={`text-gray-600 hover:text-indigo-600 ${
                isActive('/o-nama') ? 'text-indigo-600 font-medium' : ''
              }`}
            >
              O nama
            </Link>
            <Link
              href='/kontakt'
              className={`text-gray-600 hover:text-indigo-600 ${
                isActive('/kontakt') ? 'text-indigo-600 font-medium' : ''
              }`}
            >
              Kontakt
            </Link>
          </div>

          {/* User Actions */}
          <div className='hidden md:flex items-center space-x-4'>
            {user ? (
              <>
                <Link
                  href='/narudzbine'
                  className='text-gray-600 hover:text-indigo-600'
                  title='Moje narudžbine'
                >
                  <Package className='h-6 w-6' />
                </Link>
                {isAdmin && (
                  <Link
                    href='/admin/narudzbine'
                    className='text-gray-600 hover:text-indigo-600'
                    title='Administracija narudžbina'
                  >
                    <span className='text-sm font-medium'>Admin</span>
                  </Link>
                )}
                <Link
                  href='/profil'
                  className='text-gray-600 hover:text-indigo-600'
                  title='Moj profil'
                >
                  <User className='h-6 w-6' />
                </Link>
                <button
                  onClick={handleSignOut}
                  className='text-gray-600 hover:text-indigo-600'
                  title='Odjavi se'
                >
                  <LogOut className='h-6 w-6' />
                </button>
              </>
            ) : (
              <Link
                href='/prijava'
                className='text-gray-600 hover:text-indigo-600'
                title='Prijavi se'
              >
                <LogIn className='h-6 w-6' />
              </Link>
            )}
            <Link
              href='/korpa'
              className='text-gray-600 hover:text-indigo-600 relative'
              title='Korpa'
            >
              <ShoppingCart className='h-6 w-6' />
              <span className='absolute -top-2 -right-2 bg-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center'>
                0
              </span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className='md:hidden flex items-center'>
            <button
              onClick={toggleMenu}
              className='text-gray-600 hover:text-indigo-600 focus:outline-none'
              aria-label={isMenuOpen ? 'Zatvori meni' : 'Otvori meni'}
            >
              {isMenuOpen ? (
                <X className='h-6 w-6' />
              ) : (
                <Menu className='h-6 w-6' />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className='md:hidden bg-white border-t'>
          <div className='container mx-auto px-4 py-2'>
            <div className='flex flex-col space-y-2'>
              <Link
                href='/'
                className={`py-2 ${
                  isActive('/')
                    ? 'text-indigo-600 font-medium'
                    : 'text-gray-600'
                }`}
                onClick={closeMenu}
              >
                Početna
              </Link>
              <Link
                href='/proizvodi'
                className={`py-2 ${
                  isActive('/proizvodi')
                    ? 'text-indigo-600 font-medium'
                    : 'text-gray-600'
                }`}
                onClick={closeMenu}
              >
                Proizvodi
              </Link>
              <Link
                href='/o-nama'
                className={`py-2 ${
                  isActive('/o-nama')
                    ? 'text-indigo-600 font-medium'
                    : 'text-gray-600'
                }`}
                onClick={closeMenu}
              >
                O nama
              </Link>
              <Link
                href='/kontakt'
                className={`py-2 ${
                  isActive('/kontakt')
                    ? 'text-indigo-600 font-medium'
                    : 'text-gray-600'
                }`}
                onClick={closeMenu}
              >
                Kontakt
              </Link>

              <div className='border-t border-gray-200 my-2'></div>

              {user ? (
                <>
                  <Link
                    href='/narudzbine'
                    className='py-2 flex items-center text-gray-600'
                    onClick={closeMenu}
                  >
                    <Package className='h-5 w-5 mr-2' /> Moje narudžbine
                  </Link>
                  {isAdmin && (
                    <Link
                      href='/admin/narudzbine'
                      className='py-2 flex items-center text-gray-600'
                      onClick={closeMenu}
                    >
                      <Package className='h-5 w-5 mr-2' /> Admin narudžbine
                    </Link>
                  )}
                  <Link
                    href='/profil'
                    className='py-2 flex items-center text-gray-600'
                    onClick={closeMenu}
                  >
                    <User className='h-5 w-5 mr-2' /> Moj profil
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className='py-2 flex items-center text-gray-600 w-full text-left'
                  >
                    <LogOut className='h-5 w-5 mr-2' /> Odjavi se
                  </button>
                </>
              ) : (
                <Link
                  href='/prijava'
                  className='py-2 flex items-center text-gray-600'
                  onClick={closeMenu}
                >
                  <LogIn className='h-5 w-5 mr-2' /> Prijavi se
                </Link>
              )}
              <Link
                href='/korpa'
                className='py-2 flex items-center text-gray-600'
                onClick={closeMenu}
              >
                <ShoppingCart className='h-5 w-5 mr-2' /> Korpa (0)
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
