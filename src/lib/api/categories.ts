import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/types/database.types';

type Category = Database['public']['Tables']['kategorije']['Row'];

export async function getCategories() {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('kategorije')
    .select('*')
    .order('naziv_kategorije', { ascending: true })
    .throwOnError();

  if (error) throw error;
  return data || [];
}

export async function getCategoryBySlug(slug: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('kategorije')
    .select('*')
    .eq('slug', slug)
    .single()
    .throwOnError();

  if (error) throw error;
  return data;
}