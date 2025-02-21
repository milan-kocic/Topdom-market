'use client';

import { ShoppingCart, Search, Heart, Menu, ChevronDown, Store } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/types/database.types';

type Category = Database['public']['Tables']['kategorije']['Row'];

function NavItem({ title, isHighlighted = false }: { title: string; isHighlighted?: boolean }) {
  return (
    <div className="relative group">
      <button className={`flex items-center space-x-2 text-base font-medium ${isHighlighted ? 'text-red-500' : 'hover:text-yellow-500'} transition-colors px-3 py-2 rounded-full hover:bg-gray-50`}>
        <span>{title}</span>
      </button>
    </div>
  );
}

function AllCategoriesDropdown({ categories, isLoading }: { categories: Category[]; isLoading: boolean }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      className="relative"
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
        <ChevronDown className={`h-4 w-4 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
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
          <div className="px-4 py-2 text-gray-500">Učitavanje...</div>
        ) : categories.length > 0 ? (
          categories.map((category) => (
            <button
              key={category.id}
              className="w-full text-left px-4 py-2 text-gray-700 hover:bg-yellow-50 hover:text-yellow-500 transition-colors"
            >
              {category.naziv_kategorije}
            </button>
          ))
        ) : (
          <div className="px-4 py-2 text-gray-500">Nema dostupnih kategorija</div>
        )}
      </div>
    </div>
  );
}

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
    { id: 'home', title: 'Početna' },
    { id: 'products', title: 'Proizvodi' },
    { id: 'best-sellers', title: 'Top ponuda' },
    { id: 'new-products', title: 'Najnovije' },
  ];

  return (
    <nav className="sticky top-0 bg-white shadow-lg z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Mobile Menu Button */}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden">
            <Menu className="h-7 w-7" />
          </button>

          {/* Logo */}
          <div className="w-auto">
            <div className="flex items-center space-x-2">
              <Store className="h-7 w-7 text-yellow-500" />
              <div>
                <h1 className="text-xl font-bold whitespace-nowrap bg-gradient-to-r from-yellow-500 to-yellow-600 text-transparent bg-clip-text">
                  TOP DOM
                </h1>
                <span className="text-xs text-gray-600 font-medium">Market</span>
              </div>
            </div>
          </div>

          {/* Main Navigation - Centered */}
          <div className="hidden lg:flex items-center justify-center space-x-6 flex-1">
            {/* All Categories */}
            <AllCategoriesDropdown categories={categories} isLoading={isLoading} />
            
            {/* Menu Items */}
            {menuItems.map((item) => (
              <NavItem 
                key={item.id} 
                title={item.title} 
              />
            ))}
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Search className="h-5 w-5 hover:text-yellow-500 transition-colors" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Heart className="h-5 w-5 hover:text-yellow-500 transition-colors" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ShoppingCart className="h-5 w-5 hover:text-yellow-500 transition-colors" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white shadow-lg py-4">
          <div className="container mx-auto px-6">
            <div className="flex flex-col space-y-4">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  className="flex items-center justify-between py-2 hover:text-yellow-500 transition-colors"
                >
                  <span>{item.title}</span>
                </button>
              ))}
              <div className="border-t border-gray-200 pt-4">
                <div className="font-medium mb-2">Kategorije:</div>
                {isLoading ? (
                  <div className="pl-4 py-2 text-gray-500">Učitavanje...</div>
                ) : categories.length > 0 ? (
                  categories.map((category) => (
                    <button
                      key={category.id}
                      className="w-full text-left py-2 hover:text-yellow-500 transition-colors pl-4"
                    >
                      {category.naziv_kategorije}
                    </button>
                  ))
                ) : (
                  <div className="pl-4 py-2 text-gray-500">Nema dostupnih kategorija</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}