// Database Types
export interface Kupac {
  id: string;
  ime_kupca: string;
  prezime_kupca: string;
  email: string | null;
  adresa: string;
  mesto: string;
  id_post: string;
  kreirano: Date;
}

export interface Kategorija {
  id: string;
  naziv_kategorije: string;
  opis_kategorije: string | null;
  img_url: string | null;
  kreirano: Date;
}

export interface Proizvod {
  id: string;
  sku: string;
  naziv_proizvoda: string;
  opis: string | null;
  cena: number;
  nabavna_cena: number;
  id_kategorije: string;
  kreirano: Date;
}

export interface ProizvodSlika {
  id: string;
  id_proizvoda: string;
  img_url: string;
  redosled: number;
}

export interface Porudzbina {
  id: string;
  id_kupca: string;
  cena_ukupno: number;
  status_porudzbine: 'Obrada' | 'Otpremljeno' | 'Isporučeno' | 'Otkazano';
  kreirano: Date;
}

export interface StavkaPorudzbine {
  id: string;
  id_porudzbine: string;
  id_proizvoda: string;
  kolicina: number;
  cena: number;
}

export interface Prihod {
  id: string;
  id_porudzbine: string;
  bruto_prihod: number;
  troskovi_pakovanje: number;
  troskovi_dostave: number;
  neto_prihod: number;
  datum: Date;
}

export interface Trosak {
  id: string;
  naziv: string;
  iznos: number;
  kategorija: 'Pakovanje' | 'Dostava' | 'Marketing' | 'Ostalo';
  datum: Date;
}

// View Types
export interface ProizvodDetalji extends Proizvod {
  naziv_kategorije: string;
  glavna_slika: string | null;
}

export interface PorudzbinaPregled {
  id: string;
  kreirano: Date;
  status_porudzbine: Porudzbina['status_porudzbine'];
  cena_ukupno: number;
  kupac: string;
  broj_stavki: number;
  proizvodi: string;
}

// Application State Types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AppError {
  message: string;
  code?: string;
}

// Cart Types
export interface CartItem extends Proizvod {
  quantity: number;
}
