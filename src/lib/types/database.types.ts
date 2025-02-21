export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      kupci: {
        Row: {
          id: string
          ime_kupca: string
          prezime_kupca: string
          telefon: string
          email: string
          adresa: string
          mesto: string
          id_post: string
          kreirano: string
        }
        Insert: {
          id?: string
          ime_kupca: string
          prezime_kupca: string
          telefon: string
          email: string
          adresa: string
          mesto: string
          id_post: string
          kreirano?: string
        }
        Update: {
          id?: string
          ime_kupca?: string
          prezime_kupca?: string
          telefon?: string
          email?: string
          adresa?: string
          mesto?: string
          id_post?: string
          kreirano?: string
        }
      }
      proizvodi: {
        Row: {
          id: string
          naziv_proizvoda: string
          opis: string
          cena: number
          dostupnost: boolean
          najprodavaniji_proizvod: boolean
          novi_proizvod: boolean
          id_kategorija: string
          img_url: string
          kreirano: string
          azurirano: string
          kategorije?: {
            naziv_kategorije: string
          } | null
        }
        Insert: {
          id?: string
          naziv_proizvoda: string
          opis: string
          cena: number
          dostupnost?: boolean
          najprodavaniji_proizvod?: boolean
          novi_proizvod?: boolean
          id_kategorija: string
          img_url?: string
          kreirano?: string
          azurirano?: string
        }
        Update: {
          id?: string
          naziv_proizvoda?: string
          opis?: string
          cena?: number
          dostupnost?: boolean
          najprodavaniji_proizvod?: boolean
          novi_proizvod?: boolean
          id_kategorija?: string
          img_url?: string
          kreirano?: string
          azurirano?: string
        }
      }
      kategorije: {
        Row: {
          id: string
          naziv_kategorije: string
          opis_kategorije: string
          kreirano: string
          azurirano: string
        }
        Insert: {
          id?: string
          naziv_kategorije: string
          opis_kategorije?: string
          kreirano?: string
          azurirano?: string
        }
        Update: {
          id?: string
          naziv_kategorije?: string
          opis_kategorije?: string
          kreirano?: string
          azurirano?: string
        }
      }
      porudzbine: {
        Row: {
          id: string
          id_kupca: string
          kupac_ime: string
          kupac_prezime: string
          kupac_telefon: string
          kupac_adresa: string
          kupac_mesto: string
          cena_ukupno: number
          status_porudzbine: string
          kreirano: string
          azurirano: string
        }
        Insert: {
          id?: string
          id_kupca: string
          kupac_ime: string
          kupac_prezime: string
          kupac_telefon: string
          kupac_adresa: string
          kupac_mesto: string
          cena_ukupno: number
          status_porudzbine: string
          kreirano?: string
          azurirano?: string
        }
        Update: {
          id?: string
          id_kupca?: string
          kupac_ime?: string
          kupac_prezime?: string
          kupac_telefon?: string
          kupac_adresa?: string
          kupac_mesto?: string
          cena_ukupno?: number
          status_porudzbine?: string
          kreirano?: string
          azurirano?: string
        }
      }
      stavke_porudzbine: {
        Row: {
          id: string
          id_porudzbine: string
          id_proizvoda: string
          kolicina: number
          cena: number
        }
        Insert: {
          id?: string
          id_porudzbine: string
          id_proizvoda: string
          kolicina: number
          cena: number
        }
        Update: {
          id?: string
          id_porudzbine?: string
          id_proizvoda?: string
          kolicina?: number
          cena?: number
        }
      }
      popusti: {
        Row: {
          id: string
          id_proizvoda: string
          pocetni_datum: string
          zavrsni_datum: string
          tip_popusta: string
          vrednost: number
        }
        Insert: {
          id?: string
          id_proizvoda: string
          pocetni_datum: string
          zavrsni_datum: string
          tip_popusta: string
          vrednost: number
        }
        Update: {
          id?: string
          id_proizvoda?: string
          pocetni_datum?: string
          zavrsni_datum?: string
          tip_popusta?: string
          vrednost?: number
        }
      }
      proizvodi_iznenadnjenja: {
        Row: {
          id: string
          id_proizvoda: string
          opis: string
        }
        Insert: {
          id?: string
          id_proizvoda: string
          opis: string
        }
        Update: {
          id?: string
          id_proizvoda?: string
          opis?: string
        }
      }
    }
  }
}