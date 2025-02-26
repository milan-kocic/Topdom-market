import { supabase } from '../supabase';
import { Proizvod, ProizvodDetalji } from '../../types';

export async function getProizvodi(): Promise<ProizvodDetalji[]> {
  const { data, error } = await supabase
    .from('v_proizvodi_detalji')
    .select('*');

  if (error) throw error;
  return data || [];
}

export async function getProizvodById(
  id: string
): Promise<ProizvodDetalji | null> {
  const { data, error } = await supabase
    .from('v_proizvodi_detalji')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function getProizvodiByKategorija(
  kategorijaId: string
): Promise<ProizvodDetalji[]> {
  const { data, error } = await supabase
    .from('v_proizvodi_detalji')
    .select('*')
    .eq('id_kategorije', kategorijaId);

  if (error) throw error;
  return data || [];
}

export async function searchProizvodi(
  query: string
): Promise<ProizvodDetalji[]> {
  const { data, error } = await supabase
    .from('v_proizvodi_detalji')
    .select('*')
    .or(`naziv_proizvoda.ilike.%${query}%, opis.ilike.%${query}%`);

  if (error) throw error;
  return data || [];
}

export async function getProizvodSlike(proizvodId: string) {
  const { data, error } = await supabase
    .from('proizvod_slike')
    .select('*')
    .eq('id_proizvoda', proizvodId)
    .order('redosled');

  if (error) throw error;
  return data || [];
}
