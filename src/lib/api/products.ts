import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/types/database.types';

type Product = Database['public']['Tables']['proizvodi']['Row'];

export async function getProducts() {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('proizvodi')
    .select('*')
    .order('kreirano', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getProductsByCategory(category: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('proizvodi')
    .select('*')
    .eq('id_kategorija', category)
    .order('kreirano', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getNewProducts(limit = 6) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('proizvodi')
    .select('*')
    .order('kreirano', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function getProductById(id: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('proizvodi')
    .select(`
      *,
      kategorije (
        naziv_kategorije
      )
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}