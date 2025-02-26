import { supabase } from '../supabase';
import { Porudzbina, StavkaPorudzbine, PorudzbinaPregled } from '../../types';

export async function getPorudzbine(): Promise<PorudzbinaPregled[]> {
  const { data, error } = await supabase
    .from('v_porudzbine_pregled')
    .select('*')
    .order('kreirano', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getPorudzbinaById(
  id: string
): Promise<PorudzbinaPregled | null> {
  const { data, error } = await supabase
    .from('v_porudzbine_pregled')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function getStavkePorudzbine(
  porudzbinaId: string
): Promise<StavkaPorudzbine[]> {
  const { data, error } = await supabase
    .from('stavke_porudzbine')
    .select(
      `
      *,
      proizvodi (
        naziv_proizvoda,
        sku
      )
    `
    )
    .eq('id_porudzbine', porudzbinaId);

  if (error) throw error;
  return data || [];
}

export async function createPorudzbina(
  kupacId: string,
  stavke: { id_proizvoda: string; kolicina: number; cena: number }[]
): Promise<Porudzbina> {
  // Izračunaj ukupnu cenu
  const cena_ukupno = stavke.reduce(
    (total, item) => total + item.cena * item.kolicina,
    0
  );

  // Započni transakciju
  const { data: porudzbina, error: porudzbinaError } = await supabase
    .from('porudzbine')
    .insert({
      id_kupca: kupacId,
      cena_ukupno,
      status_porudzbine: 'Obrada'
    })
    .select()
    .single();

  if (porudzbinaError) throw porudzbinaError;

  // Dodaj stavke porudžbine
  const { error: stavkeError } = await supabase
    .from('stavke_porudzbine')
    .insert(
      stavke.map((stavka) => ({
        id_porudzbine: porudzbina.id,
        ...stavka
      }))
    );

  if (stavkeError) throw stavkeError;

  return porudzbina;
}

export async function updateStatusPorudzbine(
  id: string,
  status: Porudzbina['status_porudzbine']
): Promise<void> {
  const { error } = await supabase
    .from('porudzbine')
    .update({ status_porudzbine: status })
    .eq('id', id);

  if (error) throw error;
}
