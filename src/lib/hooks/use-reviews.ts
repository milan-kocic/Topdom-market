'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/types/database.types';

type Review = Database['public']['Tables']['reviews']['Row'];

export function useReviews(productId?: string) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchReviews() {
      try {
        let query = supabase
          .from('reviews')
          .select(`
            *,
            profiles (
              full_name,
              avatar_url
            )
          `)
          .order('created_at', { ascending: false });

        if (productId) {
          query = query.eq('product_id', productId);
        }

        const { data, error } = await query;

        if (error) throw error;
        setReviews(data || []);
      } catch (e) {
        setError(e instanceof Error ? e : new Error('An error occurred while fetching reviews'));
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
  }, [productId]);

  return { reviews, loading, error };
}