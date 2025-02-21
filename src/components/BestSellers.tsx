'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import ProductCard from './ProductCard';
import type { Database } from '@/lib/types/database.types';

type Product = Database['public']['Tables']['proizvodi']['Row'];

export default function BestSellers() {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

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

  const paginate = useCallback((newDirection: number) => {
    if (!products?.length) return;
    
    setDirection(newDirection);
    setCurrentIndex((prev) => {
      const nextIndex = prev + newDirection;
      if (nextIndex >= products.length) {
        return 0;
      }
      if (nextIndex < 0) {
        return products.length - 1;
      }
      return nextIndex;
    });
  }, [products?.length]);

  // Auto-scroll
  useEffect(() => {
    if (!products?.length) return;
    
    const timer = setInterval(() => {
      paginate(1);
    }, 5000);

    return () => clearInterval(timer);
  }, [paginate, products?.length]);

  const getVisibleProducts = () => {
    if (!products?.length) return [];
    const visibleProducts = [];
    for (let i = 0; i < 4; i++) {
      const index = (currentIndex + i) % products.length;
      visibleProducts.push(products[index]);
    }
    return visibleProducts;
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0
    })
  };

  return (
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold mb-16 text-center">Top ponuda</h2>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
                <div className="w-full aspect-[4/3] bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : !products?.length ? (
          <div className="text-center text-gray-500">
            Trenutno nema proizvoda.
          </div>
        ) : (
          <div className="relative">
            <div className="relative overflow-hidden">
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={currentIndex}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 }
                  }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
                >
                  {getVisibleProducts().map((product, index) => (
                    <div key={`${product.id}-${index}`}>
                      <ProductCard
                        image={product.img_url}
                        title={product.naziv_proizvoda}
                        price={product.cena.toString()}
                        oldPrice={(product.cena * 1.2).toFixed(0)}
                        description={product.opis}
                      />
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation Arrows */}
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 flex justify-between z-10">
              <button
                className="transform -translate-x-6 bg-white/90 backdrop-blur-sm p-4 rounded-full shadow-lg hover:bg-yellow-50 transition-all duration-300 hover:scale-110 group"
                onClick={() => paginate(-1)}
              >
                <ChevronLeft className="w-6 h-6 text-gray-600 group-hover:text-yellow-500 transition-colors" />
              </button>
              <button
                className="transform translate-x-6 bg-white/90 backdrop-blur-sm p-4 rounded-full shadow-lg hover:bg-yellow-50 transition-all duration-300 hover:scale-110 group"
                onClick={() => paginate(1)}
              >
                <ChevronRight className="w-6 h-6 text-gray-600 group-hover:text-yellow-500 transition-colors" />
              </button>
            </div>

            {/* Pagination Dots */}
            <div className="flex justify-center mt-8 space-x-2">
              {products.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setDirection(i > currentIndex ? 1 : -1);
                    setCurrentIndex(i);
                  }}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i >= currentIndex && i < currentIndex + 4
                      ? 'bg-yellow-500 w-6' 
                      : 'bg-gray-300 hover:bg-yellow-300'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}