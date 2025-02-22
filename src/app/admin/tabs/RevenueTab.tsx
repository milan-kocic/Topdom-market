'use client';

import { useState, useEffect } from 'react';
import { Search, Download, Calendar, TrendingUp, Package } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { exportToCSV } from '@/lib/utils/csv-export';
import type { Database } from '@/lib/types/database.types';

type Revenue = {
  id: string;
  naziv_proizvoda: string;
  sifra_proizvoda: string;
  kolicina: number;
  nabavna_cena: number;
  prodajna_cena: number;
  ukupna_zarada: number;
  datum_prodaje: string;
};

type TroskoviSuma = {
  dostava: number;
  pakovanje: number;
};

export default function RevenueTab() {
  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [troskovi, setTroskovi] = useState<TroskoviSuma>({
    dostava: 0,
    pakovanje: 0
  });
  const [dateFilter, setDateFilter] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30))
      .toISOString()
      .split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchRevenues();
    fetchTroskovi();
  }, [dateFilter]);

  async function fetchTroskovi() {
    try {
      const { data: troskovi, error } = await supabase
        .from('troskovi')
        .select('kategorija, iznos')
        .in('kategorija', ['Dostava', 'Pakovanje'])
        .gte('datum', dateFilter.startDate)
        .lte('datum', dateFilter.endDate + ' 23:59:59');

      if (error) throw error;

      const suma = troskovi?.reduce(
        (acc, curr) => {
          if (curr.kategorija === 'Dostava') acc.dostava += curr.iznos;
          if (curr.kategorija === 'Pakovanje') acc.pakovanje += curr.iznos;
          return acc;
        },
        { dostava: 0, pakovanje: 0 }
      );

      setTroskovi(suma);
    } catch (error) {
      console.error('Greška pri učitavanju troškova:', error);
      toast.error('Greška pri učitavanju troškova dostave i pakovanja');
    }
  }

  async function fetchRevenues() {
    try {
      setLoading(true);
      console.log('Fetching revenues for period:', {
        startDate: dateFilter.startDate,
        endDate: dateFilter.endDate
      });

      // Prvo proveravamo da li ima isporučenih porudžbina
      const { data: porudzbine, error: porudzbineError } = await supabase
        .from('porudzbine')
        .select('*, kupci (ime_kupca, prezime_kupca)')
        .eq('status_porudzbine', 'isporucena');

      if (porudzbineError) {
        console.error('Greška pri dohvatanju porudžbina:', porudzbineError);
        return;
      }

      // Detaljni log za svaku porudžbinu
      porudzbine?.forEach((p) => {
        console.log('Detalji porudžbine:', {
          id: p.id,
          status: p.status_porudzbine,
          ukupna_cena: p.cena_ukupno,
          kupac: p.kupci
            ? `${p.kupci.ime_kupca} ${p.kupci.prezime_kupca}`
            : 'Nepoznat',
          datum: p.kreirano,
          id_kupca: p.id_kupca,
          raw_data: p // Kompletan objekat za debug
        });
      });

      // Direktna provera stavki za prvu porudžbinu
      if (porudzbine && porudzbine.length > 0) {
        const prvaPorudzbina = porudzbine[0];

        // Prvo proveravamo da li postoji porudžbina u bazi
        const { data: porudzbinaDetalji, error: porudzbinaError } =
          await supabase
            .from('porudzbine')
            .select('*')
            .eq('id', prvaPorudzbina.id)
            .single();

        console.log('Detaljna provera porudžbine:', {
          id: prvaPorudzbina.id,
          detalji: porudzbinaDetalji,
          error: porudzbinaError
        });

        // Zatim proveravamo stavke bez JOIN-a
        const { data: direktneStavke, error: direktneStavkeError } =
          await supabase
            .from('stavke_porudzbine')
            .select('*')
            .eq('id_porudzbine', prvaPorudzbina.id);

        console.log('Direktna provera stavki:', {
          id_porudzbine: prvaPorudzbina.id,
          stavke: direktneStavke,
          error: direktneStavkeError
        });

        // Proveravamo i sa JOIN-om na proizvode
        const { data: stavkeSaProizvodima, error: stavkeError } = await supabase
          .from('stavke_porudzbine')
          .select(
            `
            *,
            proizvodi (*)
          `
          )
          .eq('id_porudzbine', prvaPorudzbina.id);

        console.log('Provera stavki sa proizvodima:', {
          id_porudzbine: prvaPorudzbina.id,
          stavke: stavkeSaProizvodima,
          error: stavkeError
        });
      }

      // Prvo dohvatamo stavke porudžbine sa svim detaljima
      const { data: stavke, error: stavkeError } = await supabase
        .from('stavke_porudzbine')
        .select(
          `
          *,
          proizvodi (
            id,
            naziv_proizvoda,
            nabavna_cena,
            cena,
            sifra_proizvoda
          )
        `
        )
        .in('id_porudzbine', porudzbine?.map((p) => p.id) || []);

      if (stavkeError) {
        console.error('Greška pri dohvatanju stavki:', stavkeError);
        return;
      }

      console.log('SQL upit za stavke:', {
        ids: porudzbine?.map((p) => p.id),
        brojPorudzbina: porudzbine?.length,
        brojStavki: stavke?.length,
        detaljiStavki: stavke
      });
      console.log('Pronađene stavke porudžbina:', stavke);

      const { data, error } = await supabase
        .from('porudzbine')
        .select(
          `
          id,
          kreirano,
          status_porudzbine,
          cena_ukupno
        `
        )
        .eq('status_porudzbine', 'isporucena')
        .gte('kreirano', dateFilter.startDate)
        .lte('kreirano', dateFilter.endDate + ' 23:59:59')
        .order('kreirano', { ascending: false });

      if (error) {
        console.error('Supabase error:', {
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        toast.error('Greška pri učitavanju prihoda');
        return;
      }

      console.log('Raw data from Supabase:', data);

      if (data && stavke) {
        const brojStavki = stavke.length;
        console.log('Ukupan broj stavki:', brojStavki);

        const prosecniTroskoviPoStavci = {
          dostava: brojStavki > 0 ? troskovi.dostava / brojStavki : 0,
          pakovanje: brojStavki > 0 ? troskovi.pakovanje / brojStavki : 0
        };

        console.log('Prosečni troškovi po stavci:', prosecniTroskoviPoStavci);

        // Mapiramo stavke sa podacima o porudžbini
        const transformedData: Revenue[] = stavke.map((stavka: any) => {
          const porudzbina = data.find((p) => p.id === stavka.id_porudzbine);

          const prihod = {
            id: stavka.id,
            naziv_proizvoda: stavka.proizvodi.naziv_proizvoda,
            sifra_proizvoda: stavka.proizvodi.sifra_proizvoda || 'N/A',
            kolicina: stavka.kolicina,
            nabavna_cena: stavka.proizvodi.nabavna_cena || 0,
            prodajna_cena: stavka.cena,
            ukupna_zarada:
              (stavka.cena - (stavka.proizvodi.nabavna_cena || 0)) *
                stavka.kolicina -
              (prosecniTroskoviPoStavci.dostava +
                prosecniTroskoviPoStavci.pakovanje) *
                stavka.kolicina,
            datum_prodaje: porudzbina?.kreirano || new Date().toISOString()
          };

          console.log('Transformisana stavka:', {
            ...prihod,
            id_porudzbine: stavka.id_porudzbine,
            troskoviDostaveIPakovanja:
              (prosecniTroskoviPoStavci.dostava +
                prosecniTroskoviPoStavci.pakovanje) *
              stavka.kolicina
          });

          return prihod;
        });

        console.log('Transformed data:', transformedData);
        setRevenues(transformedData);
      }
    } catch (error) {
      console.error('Error fetching revenues:', error);
      toast.error('Greška pri učitavanju prihoda');
    } finally {
      setLoading(false);
    }
  }

  function handleQuickRange(days: number) {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(new Date().setDate(new Date().getDate() - days))
      .toISOString()
      .split('T')[0];
    setDateFilter({ startDate, endDate });
  }

  const filteredRevenues = revenues.filter(
    (revenue) =>
      revenue.naziv_proizvoda
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      revenue.sifra_proizvoda.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalRevenue = filteredRevenues.reduce(
    (sum, revenue) => sum + revenue.ukupna_zarada,
    0
  );

  const totalSales = filteredRevenues.reduce(
    (sum, revenue) => sum + revenue.prodajna_cena * revenue.kolicina,
    0
  );

  const totalCost = filteredRevenues.reduce(
    (sum, revenue) => sum + revenue.nabavna_cena * revenue.kolicina,
    0
  );

  async function handleExportCSV() {
    try {
      const revenuesForExport = revenues.map((revenue) => ({
        ID: revenue.id,
        'Šifra proizvoda': revenue.sifra_proizvoda,
        'Naziv proizvoda': revenue.naziv_proizvoda,
        Količina: revenue.kolicina,
        'Nabavna cena': revenue.nabavna_cena.toLocaleString() + ' RSD',
        'Prodajna cena': revenue.prodajna_cena.toLocaleString() + ' RSD',
        'Ukupna zarada': revenue.ukupna_zarada.toLocaleString() + ' RSD',
        'Datum prodaje': new Date(revenue.datum_prodaje).toLocaleDateString(
          'sr-RS'
        )
      }));

      exportToCSV(revenuesForExport, 'prihodi');
      toast.success('Prihodi uspešno izvezeni');
    } catch (error) {
      console.error('Error exporting revenues:', error);
      toast.error('Greška pri izvozu prihoda');
    }
  }

  return (
    <div>
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8'>
        <div>
          <h1 className='text-3xl font-bold'>Prihodi</h1>
          <p className='text-gray-600 mt-1'>
            Pregled prihoda od isporučenih porudžbina
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className='flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors'
        >
          <Download className='h-5 w-5' />
          <span>Izvezi CSV</span>
        </button>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
        <div className='bg-white rounded-xl p-6 border border-gray-200'>
          <div className='flex items-center space-x-4'>
            <div className='p-3 bg-green-100 rounded-lg'>
              <TrendingUp className='h-6 w-6 text-green-600' />
            </div>
            <div>
              <p className='text-sm text-gray-500'>Stvarni prihod</p>
              <p className='text-2xl font-semibold'>
                {totalRevenue.toLocaleString()} RSD
              </p>
            </div>
          </div>
        </div>

        <div className='bg-white rounded-xl p-6 border border-gray-200'>
          <div className='flex items-center space-x-4'>
            <div className='p-3 bg-blue-100 rounded-lg'>
              <Package className='h-6 w-6 text-blue-600' />
            </div>
            <div>
              <p className='text-sm text-gray-500'>Ukupna prodaja</p>
              <p className='text-2xl font-semibold'>
                {totalSales.toLocaleString()} RSD
              </p>
            </div>
          </div>
        </div>

        <div className='bg-white rounded-xl p-6 border border-gray-200'>
          <div className='flex items-center space-x-4'>
            <div className='p-3 bg-red-100 rounded-lg'>
              <Package className='h-6 w-6 text-red-600' />
            </div>
            <div>
              <p className='text-sm text-gray-500'>Troškovi nabavke</p>
              <p className='text-2xl font-semibold'>
                {totalCost.toLocaleString()} RSD
              </p>
            </div>
          </div>
        </div>

        <div className='bg-white rounded-xl p-6 border border-gray-200'>
          <div className='flex items-center space-x-4'>
            <div className='p-3 bg-yellow-100 rounded-lg'>
              <Package className='h-6 w-6 text-yellow-600' />
            </div>
            <div>
              <p className='text-sm text-gray-500'>
                Troškovi dostave i pakovanja
              </p>
              <p className='text-2xl font-semibold'>
                {(troskovi.dostava + troskovi.pakovanje).toLocaleString()} RSD
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
        <div className='p-4 border-b border-gray-200'>
          <div className='flex flex-col sm:flex-row gap-4'>
            <div className='flex-1'>
              <div className='relative'>
                <input
                  type='text'
                  placeholder='Pretraži po nazivu ili šifri proizvoda...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent'
                  aria-label='Pretraži proizvode'
                />
                <Search className='h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2' />
              </div>
            </div>

            <div className='flex items-center gap-4'>
              <div className='flex items-center space-x-2 bg-white border border-gray-200 rounded-lg p-2'>
                <Calendar className='h-5 w-5 text-gray-500' />
                <input
                  type='date'
                  value={dateFilter.startDate}
                  onChange={(e) =>
                    setDateFilter((prev) => ({
                      ...prev,
                      startDate: e.target.value
                    }))
                  }
                  className='border-0 focus:ring-0 text-sm'
                  title='Početni datum'
                  aria-label='Početni datum'
                />
                <span className='text-gray-500'>do</span>
                <input
                  type='date'
                  value={dateFilter.endDate}
                  onChange={(e) =>
                    setDateFilter((prev) => ({
                      ...prev,
                      endDate: e.target.value
                    }))
                  }
                  className='border-0 focus:ring-0 text-sm'
                  title='Krajnji datum'
                  aria-label='Krajnji datum'
                />
              </div>

              <div className='flex items-center gap-2'>
                <button
                  onClick={() => handleQuickRange(7)}
                  className='px-3 py-1 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50'
                >
                  7 dana
                </button>
                <button
                  onClick={() => handleQuickRange(30)}
                  className='px-3 py-1 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50'
                >
                  30 dana
                </button>
                <button
                  onClick={() => handleQuickRange(90)}
                  className='px-3 py-1 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50'
                >
                  90 dana
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className='divide-y divide-gray-200'>
          {loading ? (
            <div className='p-8 text-center text-gray-500'>
              Učitavanje prihoda...
            </div>
          ) : filteredRevenues.length > 0 ? (
            filteredRevenues.map((revenue) => (
              <div
                key={revenue.id}
                className='p-4 hover:bg-gray-50 transition-colors'
              >
                <div className='flex items-start justify-between'>
                  <div className='space-y-1'>
                    <div className='flex items-center space-x-3'>
                      <span className='font-medium'>
                        {revenue.naziv_proizvoda}
                      </span>
                      <span className='text-sm text-gray-500'>
                        Šifra: {revenue.sifra_proizvoda}
                      </span>
                      <span className='text-sm text-gray-500'>
                        Količina: {revenue.kolicina}
                      </span>
                    </div>
                    <div className='flex items-center space-x-4 text-sm text-gray-500'>
                      <div className='flex items-center space-x-1'>
                        <Calendar className='h-4 w-4' />
                        <span>
                          {new Date(revenue.datum_prodaje).toLocaleDateString(
                            'sr-RS'
                          )}
                        </span>
                      </div>
                      <div className='flex items-center space-x-4'>
                        <span>
                          Nabavna cena: {revenue.nabavna_cena.toLocaleString()}{' '}
                          RSD
                        </span>
                        <span>
                          Prodajna cena:{' '}
                          {revenue.prodajna_cena.toLocaleString()} RSD
                        </span>
                        <span className='font-medium text-green-600'>
                          Stvarni prihod:{' '}
                          {revenue.ukupna_zarada.toLocaleString()} RSD
                        </span>
                      </div>
                    </div>
                    <div className='text-sm text-gray-500'>
                      Ukupni trošak nabavke:{' '}
                      {(
                        revenue.nabavna_cena * revenue.kolicina
                      ).toLocaleString()}{' '}
                      RSD | Ukupna prodaja:{' '}
                      {(
                        revenue.prodajna_cena * revenue.kolicina
                      ).toLocaleString()}{' '}
                      RSD
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className='p-8 text-center text-gray-500'>
              Nema pronađenih prihoda
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
