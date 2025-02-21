'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/types/database.types';

type Product = Database['public']['Tables']['proizvodi']['Row'];

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        console.log('Fetching products...');
        
        const { data, error } = await supabase
          .from('proizvodi')
          .select('*')
          .order('kreirano', { ascending: false });

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }

        console.log('Fetched products:', data);
        setProducts(data || []);
      } catch (e) {
        console.error('Error fetching products:', e);
        setError(e instanceof Error ? e : new Error('Greška pri učitavanju proizvoda'));
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  return { products, loading, error };
}