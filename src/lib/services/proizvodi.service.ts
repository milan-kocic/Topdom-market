import { supabase } from '../supabase/client';
import { Proizvod, ProizvodDetalji } from '@/types';

export async function getProizvodi(): Promise<ProizvodDetalji[]> {
  const { data, error } = await supabase
    .from('v_proizvodi_detalji')
    .select('*');

  if (error) throw error;
  return data || [];
}

export async function getNoviProizvodi(): Promise<ProizvodDetalji[]> {
  console.log('getNoviProizvodi: Započinjem dohvatanje...');

  const { data, error } = await supabase
    .from('v_proizvodi_detalji')
    .select('*')
    .eq('novi_proizvod', true);

  console.log('getNoviProizvodi: Supabase odgovor:', { data, error });

  if (error) {
    console.error('getNoviProizvodi: Greška:', error);
    throw error;
  }

  console.log('getNoviProizvodi: Uspešno dohvaćeni proizvodi:', data);
  return data || [];
}

export async function getNajprodavanijiProizvodi(): Promise<ProizvodDetalji[]> {
  const { data, error } = await supabase
    .from('v_proizvodi_detalji')
    .select('*')
    .eq('najprodavaniji_proizvod', true);

  if (error) throw error;
  return data || [];
}

export async function getIznenadjenja(): Promise<ProizvodDetalji[]> {
  console.log('getIznenadjenja: Započinjem dohvatanje...');

  const { data, error } = await supabase
    .from('v_proizvodi_detalji')
    .select('*')
    .eq('iznenadjenje', true)
    .limit(4);

  if (error) {
    console.error('getIznenadjenja: Greška:', error);
    throw error;
  }

  console.log('getIznenadjenja: Uspešno dohvaćeni proizvodi:', data);
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
