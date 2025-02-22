export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      kupci: {
        Row: {
          id: string;
          ime: string;
          prezime: string;
          email: string;
          telefon: string;
          adresa: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          ime: string;
          prezime: string;
          email: string;
          telefon: string;
          adresa: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          ime?: string;
          prezime?: string;
          email?: string;
          telefon?: string;
          adresa?: string;
          created_at?: string;
        };
      };
      proizvodi: {
        Row: {
          id: string;
          naziv_proizvoda: string;
          opis: string;
          cena: number;
          img_url: string;
          dostupnost: boolean;
          novi_proizvod: boolean;
          najprodavaniji_proizvod: boolean;
          id_kategorija: string;
          created_at: string;
          kategorije?: {
            naziv_kategorije: string;
          };
        };
        Insert: {
          id?: string;
          naziv_proizvoda: string;
          opis: string;
          cena: number;
          img_url?: string;
          dostupnost?: boolean;
          novi_proizvod?: boolean;
          najprodavaniji_proizvod?: boolean;
          id_kategorija: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          naziv_proizvoda?: string;
          opis?: string;
          cena?: number;
          img_url?: string;
          dostupnost?: boolean;
          novi_proizvod?: boolean;
          najprodavaniji_proizvod?: boolean;
          id_kategorija?: string;
          created_at?: string;
        };
      };
      kategorije: {
        Row: {
          id: string;
          naziv_kategorije: string;
          opis_kategorije: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          naziv_kategorije: string;
          opis_kategorije?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          naziv_kategorije?: string;
          opis_kategorije?: string;
          created_at?: string;
        };
      };
      porudzbine: {
        Row: {
          id: string;
          id_kupca: string;
          status_porudzbine:
            | 'nova'
            | 'u_obradi'
            | 'poslata'
            | 'isporucena'
            | 'otkazana';
          cena_ukupno: number;
          kreirano: string;
          kupci?: {
            ime_kupca: string;
            prezime_kupca: string;
            email: string;
          };
        };
        Insert: {
          id?: string;
          id_kupca: string;
          status_porudzbine:
            | 'nova'
            | 'u_obradi'
            | 'poslata'
            | 'isporucena'
            | 'otkazana';
          cena_ukupno: number;
          kreirano?: string;
        };
        Update: {
          id?: string;
          id_kupca?: string;
          status_porudzbine?:
            | 'nova'
            | 'u_obradi'
            | 'poslata'
            | 'isporucena'
            | 'otkazana';
          cena_ukupno?: number;
          kreirano?: string;
        };
      };
      stavke_porudzbine: {
        Row: {
          id: string;
          id_porudzbine: string;
          id_proizvoda: string;
          kolicina: number;
          cena: number;
        };
        Insert: {
          id?: string;
          id_porudzbine: string;
          id_proizvoda: string;
          kolicina: number;
          cena: number;
        };
        Update: {
          id?: string;
          id_porudzbine?: string;
          id_proizvoda?: string;
          kolicina?: number;
          cena?: number;
        };
      };
      popusti: {
        Row: {
          id: string;
          id_proizvoda: string;
          pocetni_datum: string;
          zavrsni_datum: string;
          tip_popusta: string;
          vrednost: number;
        };
        Insert: {
          id?: string;
          id_proizvoda: string;
          pocetni_datum: string;
          zavrsni_datum: string;
          tip_popusta: string;
          vrednost: number;
        };
        Update: {
          id?: string;
          id_proizvoda?: string;
          pocetni_datum?: string;
          zavrsni_datum?: string;
          tip_popusta?: string;
          vrednost?: number;
        };
      };
      proizvodi_iznenadnjenja: {
        Row: {
          id: string;
          id_proizvoda: string;
          opis: string;
        };
        Insert: {
          id?: string;
          id_proizvoda: string;
          opis: string;
        };
        Update: {
          id?: string;
          id_proizvoda?: string;
          opis?: string;
        };
      };
      troskovi: {
        Row: {
          id: string;
          naziv: string;
          opis: string | null;
          iznos: number;
          datum: string;
          kategorija: string;
          kreirano: string;
          azurirano: string;
        };
        Insert: {
          id?: string;
          naziv: string;
          opis?: string | null;
          iznos: number;
          datum: string;
          kategorija: string;
          kreirano?: string;
          azurirano?: string;
        };
        Update: {
          id?: string;
          naziv?: string;
          opis?: string | null;
          iznos?: number;
          datum?: string;
          kategorija?: string;
          kreirano?: string;
          azurirano?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
