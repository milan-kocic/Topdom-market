'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/types/database.types';

type Category = Database['public']['Tables']['kategorije']['Row'];

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const { data, error } = await supabase
          .from('kategorije')
          .select('*')
          .order('naziv_kategorije', { ascending: true });

        if (error) throw error;
        setCategories(data || []);
      } catch (e) {
        setError(e instanceof Error ? e : new Error('Greška pri učitavanju kategorija'));
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  return { categories, loading, error };
}