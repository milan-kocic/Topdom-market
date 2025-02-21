'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/types/database.types';
import ProductCard from './ProductCard';

type Product = Database['public']['Tables']['proizvodi']['Row'];

export default function ProductCarousel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data, error } = await supabase
          .from('proizvodi')
          .select('*')
          .order('kreirano', { ascending: false });

        if (error) throw error;
        setProducts(data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProducts();
  }, []);

  // Create an extended array of products for smooth circular rotation
  const extendedProducts = useMemo(() => {
    if (!products.length) return [];
    // Add copies of first 4 products to the end and last 4 products to the beginning
    return [...products.slice(-4), ...products, ...products.slice(0, 4)];
  }, [products]);

  const slideNext = useCallback(() => {
    if (isAnimating || !products.length) return;

    setIsAnimating(true);
    setCurrentIndex((prev) => {
      const next = prev + 1;
      // If we've reached the end of the original products
      if (next >= products.length) {
        // Immediately reset to the start without animation
        setTimeout(() => {
          setIsAnimating(false);
          setCurrentIndex(0);
        }, 300);
        return next;
      }
      setTimeout(() => setIsAnimating(false), 300);
      return next;
    });
  }, [products.length, isAnimating]);

  const slidePrev = useCallback(() => {
    if (isAnimating || !products.length) return;

    setIsAnimating(true);
    setCurrentIndex((prev) => {
      const next = prev - 1;
      // If we've reached the start of the original products
      if (next < 0) {
        // Immediately jump to the end without animation
        setTimeout(() => {
          setIsAnimating(false);
          setCurrentIndex(products.length - 1);
        }, 300);
        return next;
      }
      setTimeout(() => setIsAnimating(false), 300);
      return next;
    });
  }, [products.length, isAnimating]);

  // Auto-slide
  useEffect(() => {
    if (!products.length) return;

    const timer = setInterval(slideNext, 5000);
    return () => clearInterval(timer);
  }, [slideNext, products.length]);

  if (isLoading) {
    return (
      <div className='grid grid-cols-4 gap-8'>
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className='bg-white rounded-xl shadow-lg p-6 animate-pulse'
            title='Previous Slide'
          >
            <div className='w-full aspect-[4/3] bg-gray-200 rounded-lg mb-4'></div>
            <div className='h-6 bg-gray-200 rounded w-3/4 mb-4'></div>
            <div className='h-4 bg-gray-200 rounded w-1/2 mb-4'></div>
            <div className='h-10 bg-gray-200 rounded w-full'></div>
          </div>
        ))}
      </div>
    );
  }

  const translateX = -(currentIndex + 4) * 25; // Add offset for the prepended items

  return (
    <div className='relative'>
      <div className='overflow-hidden'>
        <div
          className='flex transition-transform duration-300 ease-in-out'
          style={{
            transform: `translateX(${translateX}%)`
          }}
        >
          {extendedProducts.map((product, index) => (
            <div
              key={`${product.id}-${index}`}
              className='w-full flex-shrink-0 px-4'
              style={{ width: '25%' }}
            >
              <ProductCard
                image={product.img_url}
                title={product.naziv_proizvoda}
                price={product.cena.toString()}
                oldPrice={(product.cena * 1.2).toFixed(0)}
                description={product.opis}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <div className='absolute left-0 right-0 top-1/2 -translate-y-1/2 flex justify-between z-10 pointer-events-none'>
        <button
          onClick={slidePrev}
          className='pointer-events-auto transform -translate-x-6 bg-white/90 backdrop-blur-sm p-4 rounded-full shadow-lg hover:bg-yellow-50 transition-all duration-300 hover:scale-110 group disabled:opacity-50 disabled:cursor-not-allowed'
          disabled={isAnimating}
          title='Previous'
        >
          <ChevronLeft className='w-6 h-6 text-gray-600 group-hover:text-yellow-500 transition-colors' />
        </button>
        <button
          onClick={slideNext}
          className='pointer-events-auto transform translate-x-6 bg-white/90 backdrop-blur-sm p-4 rounded-full shadow-lg hover:bg-yellow-50 transition-all duration-300 hover:scale-110 group disabled:opacity-50 disabled:cursor-not-allowed'
          disabled={isAnimating}
          title='Next'
        >
          <ChevronRight className='w-6 h-6 text-gray-600 group-hover:text-yellow-500 transition-colors' />
        </button>
      </div>

      {/* Pagination Dots */}
      <div className='flex justify-center mt-8 space-x-2'>
        {products.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              if (!isAnimating) {
                setIsAnimating(true);
                setCurrentIndex(i);
                setTimeout(() => setIsAnimating(false), 300);
              }
            }}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === currentIndex
                ? 'bg-yellow-500 w-6'
                : 'bg-gray-300 hover:bg-yellow-300'
            }`}
            disabled={isAnimating}
          />
        ))}
      </div>
    </div>
  );
}
