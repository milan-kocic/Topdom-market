export type Database = {
  public: {
    Tables: {
      kupci: {
        Row: {
          id: string;
          ime_kupca: string;
          prezime_kupca: string;
          email: string | null;
          adresa: string;
          mesto: string;
          id_post: string;
          kreirano: string;
        };
        Insert: Omit<
          Database['public']['Tables']['kupci']['Row'],
          'id' | 'kreirano'
        >;
        Update: Partial<Database['public']['Tables']['kupci']['Insert']>;
      };
      kategorije: {
        Row: {
          id: string;
          naziv_kategorije: string;
          opis_kategorije: string | null;
          img_url: string | null;
          kreirano: string;
        };
        Insert: Omit<
          Database['public']['Tables']['kategorije']['Row'],
          'id' | 'kreirano'
        >;
        Update: Partial<Database['public']['Tables']['kategorije']['Insert']>;
      };
      proizvodi: {
        Row: {
          id: string;
          sku: string;
          naziv_proizvoda: string;
          opis: string | null;
          cena: number;
          nabavna_cena: number;
          id_kategorije: string;
          kreirano: string;
        };
        Insert: Omit<
          Database['public']['Tables']['proizvodi']['Row'],
          'id' | 'kreirano'
        >;
        Update: Partial<Database['public']['Tables']['proizvodi']['Insert']>;
      };
      proizvod_slike: {
        Row: {
          id: string;
          id_proizvoda: string;
          img_url: string;
          redosled: number;
        };
        Insert: Omit<
          Database['public']['Tables']['proizvod_slike']['Row'],
          'id'
        >;
        Update: Partial<
          Database['public']['Tables']['proizvod_slike']['Insert']
        >;
      };
      porudzbine: {
        Row: {
          id: string;
          id_kupca: string;
          cena_ukupno: number;
          status_porudzbine:
            | 'Obrada'
            | 'Otpremljeno'
            | 'Isporučeno'
            | 'Otkazano';
          kreirano: string;
        };
        Insert: Omit<
          Database['public']['Tables']['porudzbine']['Row'],
          'id' | 'kreirano'
        >;
        Update: Partial<Database['public']['Tables']['porudzbine']['Insert']>;
      };
      stavke_porudzbine: {
        Row: {
          id: string;
          id_porudzbine: string;
          id_proizvoda: string;
          kolicina: number;
          cena: number;
        };
        Insert: Omit<
          Database['public']['Tables']['stavke_porudzbine']['Row'],
          'id'
        >;
        Update: Partial<
          Database['public']['Tables']['stavke_porudzbine']['Insert']
        >;
      };
      prihodi: {
        Row: {
          id: string;
          naziv: string;
          iznos: number;
          datum: string;
        };
        Insert: Omit<Database['public']['Tables']['prihodi']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['prihodi']['Insert']>;
      };
      troskovi: {
        Row: {
          id: string;
          naziv: string;
          iznos: number;
          datum: string;
        };
        Insert: Omit<Database['public']['Tables']['troskovi']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['troskovi']['Insert']>;
      };
    };
    Views: {
      v_proizvodi_detalji: {
        Row: {
          id: string;
          sku: string;
          naziv_proizvoda: string;
          opis: string | null;
          cena: number;
          nabavna_cena: number;
          id_kategorije: string;
          kreirano: string;
          naziv_kategorije: string;
          glavna_slika: string | null;
        };
      };
      v_porudzbine_pregled: {
        Row: {
          id: string;
          kreirano: string;
          status_porudzbine: string;
          cena_ukupno: number;
          kupac: string;
          broj_stavki: number;
          proizvodi: string;
        };
      };
    };
  };
};
