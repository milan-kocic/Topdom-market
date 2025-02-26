'use client';

import { useState, useEffect } from 'react';
import { Search, Download, Calendar, TrendingUp, Package } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { exportToCSV } from '@/lib/utils/csv-export';
import type { Database } from '@/types/supabase';

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

type Proizvod = Database['public']['Tables']['proizvodi']['Row'];
type StavkaPorudzbine =
  Database['public']['Tables']['stavke_porudzbine']['Row'] & {
    proizvodi: Proizvod;
  };
type Porudzbina = Database['public']['Tables']['porudzbine']['Row'];

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
      console.log('Započinjem dohvatanje prihoda za period:', {
        startDate: dateFilter.startDate,
        endDate: dateFilter.endDate
      });

      // Prvo dohvatamo sve isporučene porudžbine
      const { data: porudzbine, error: porudzbineError } = await supabase
        .from('porudzbine')
        .select('*')
        .eq('status_porudzbine', 'Isporučeno')
        .gte('kreirano', dateFilter.startDate)
        .lte('kreirano', dateFilter.endDate + ' 23:59:59')
        .order('kreirano', { ascending: false });

      console.log('Rezultat upita za porudžbine:', {
        data: porudzbine,
        error: porudzbineError
      });

      if (porudzbineError) {
        console.error('Detalji greške pri dohvatanju porudžbina:', {
          message: porudzbineError.message,
          details: porudzbineError.details,
          hint: porudzbineError.hint,
          code: porudzbineError.code
        });
        toast.error('Greška pri učitavanju porudžbina');
        return;
      }

      if (!porudzbine || porudzbine.length === 0) {
        console.log('Nema pronađenih porudžbina za zadati period');
        setRevenues([]);
        return;
      }

      // Dohvatamo stavke za sve pronađene porudžbine
      const { data: stavke, error: stavkeError } = await supabase
        .from('stavke_porudzbine')
        .select(
          `
          *,
          proizvodi (
            id,
            naziv_proizvoda,
            nabavna_cena,
            sku
          )
        `
        )
        .in(
          'id_porudzbine',
          porudzbine.map((p) => p.id)
        );

      console.log('Rezultat upita za stavke:', {
        brojStavki: stavke?.length,
        brojPorudzbina: porudzbine.length,
        prvaStavka: stavke?.[0]
      });

      if (stavkeError) {
        console.error('Detalji greške pri dohvatanju stavki:', {
          message: stavkeError.message,
          details: stavkeError.details,
          hint: stavkeError.hint,
          code: stavkeError.code
        });
        toast.error('Greška pri učitavanju stavki porudžbina');
        return;
      }

      // Transformacija podataka
      const transformedData: Revenue[] = [];

      for (const stavka of stavke || []) {
        if (!stavka.proizvodi) {
          console.warn('Stavka nema povezani proizvod:', stavka);
          continue;
        }

        const porudzbina = porudzbine.find(
          (p) => p.id === stavka.id_porudzbine
        );
        if (!porudzbina) {
          console.warn('Nije pronađena porudžbina za stavku:', stavka);
          continue;
        }

        transformedData.push({
          id: stavka.id,
          naziv_proizvoda: stavka.proizvodi.naziv_proizvoda,
          sifra_proizvoda: stavka.proizvodi.sku || 'N/A',
          kolicina: stavka.kolicina,
          nabavna_cena: stavka.proizvodi.nabavna_cena,
          prodajna_cena: stavka.cena,
          ukupna_zarada:
            (stavka.cena - stavka.proizvodi.nabavna_cena) * stavka.kolicina,
          datum_prodaje: porudzbina.kreirano
        });
      }

      console.log('Transformisani podaci:', {
        brojTransformisanih: transformedData.length,
        prviPrimer: transformedData[0]
      });

      setRevenues(transformedData);
    } catch (error) {
      console.error('Neočekivana greška pri dohvatanju prihoda:', error);
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

  const totalQuantity = filteredRevenues.reduce(
    (sum, revenue) => sum + revenue.kolicina,
    0
  );

  const averageOrderValue = totalSales / totalQuantity || 0;

  async function handleExportCSV() {
    try {
      const revenuesForExport = revenues.map((revenue) => ({
        ID: revenue.id,
        'Naziv proizvoda': revenue.naziv_proizvoda,
        'Šifra proizvoda': revenue.sifra_proizvoda,
        Količina: revenue.kolicina,
        'Nabavna cena': revenue.nabavna_cena,
        'Prodajna cena': revenue.prodajna_cena,
        'Ukupna zarada': revenue.ukupna_zarada,
        'Datum prodaje': new Date(revenue.datum_prodaje).toLocaleDateString(
          'sr-RS'
        )
      }));

      exportToCSV(revenuesForExport, 'prihodi');
      toast.success('Prihodi uspešno izvezeni');
    } catch (error) {
      console.error('Greška pri izvozu prihoda:', error);
      toast.error('Greška pri izvozu prihoda');
    }
  }

  return (
    <div>
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8'>
        <div>
          <h1 className='text-3xl font-bold'>Prihodi</h1>
          <p className='text-gray-600 mt-1'>
            Pregledajte prihode i analizirajte prodaju
          </p>
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
          <button
            onClick={handleExportCSV}
            className='flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50'
          >
            <Download className='h-5 w-5' />
            <span>Izvezi CSV</span>
          </button>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
        <div className='bg-white p-6 rounded-xl border border-gray-200'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>Ukupan prihod</p>
              <p className='text-2xl font-bold mt-1'>
                {totalRevenue.toLocaleString('sr-RS')} RSD
              </p>
            </div>
            <TrendingUp className='h-8 w-8 text-green-500' />
          </div>
        </div>

        <div className='bg-white p-6 rounded-xl border border-gray-200'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>
                Ukupna prodaja
              </p>
              <p className='text-2xl font-bold mt-1'>
                {totalSales.toLocaleString('sr-RS')} RSD
              </p>
            </div>
            <Package className='h-8 w-8 text-blue-500' />
          </div>
        </div>

        <div className='bg-white p-6 rounded-xl border border-gray-200'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>
                Prosečna vrednost porudžbine
              </p>
              <p className='text-2xl font-bold mt-1'>
                {averageOrderValue.toLocaleString('sr-RS')} RSD
              </p>
            </div>
            <Calendar className='h-8 w-8 text-purple-500' />
          </div>
        </div>

        <div className='bg-white p-6 rounded-xl border border-gray-200'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>Troškovi</p>
              <p className='text-2xl font-bold mt-1'>
                {(troskovi.dostava + troskovi.pakovanje).toLocaleString(
                  'sr-RS'
                )}{' '}
                RSD
              </p>
              <div className='flex gap-2 mt-2 text-xs text-gray-500'>
                <span>Dostava: {troskovi.dostava.toLocaleString('sr-RS')}</span>
                <span>
                  Pakovanje: {troskovi.pakovanje.toLocaleString('sr-RS')}
                </span>
              </div>
            </div>
            <Package className='h-8 w-8 text-yellow-500' />
          </div>
        </div>
      </div>

      <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
        <div className='p-4 border-b border-gray-200'>
          <div className='relative'>
            <input
              type='text'
              placeholder='Pretraži prihode...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent'
              aria-label='Pretraži prihode'
            />
            <Search className='h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2' />
          </div>
        </div>

        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead>
              <tr className='bg-gray-50'>
                <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Proizvod
                </th>
                <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Šifra
                </th>
                <th className='px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Količina
                </th>
                <th className='px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Nabavna cena
                </th>
                <th className='px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Prodajna cena
                </th>
                <th className='px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Ukupna zarada
                </th>
                <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Datum
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200'>
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className='px-4 py-8 text-center text-gray-500'
                  >
                    Učitavanje prihoda...
                  </td>
                </tr>
              ) : filteredRevenues.length > 0 ? (
                filteredRevenues.map((revenue) => (
                  <tr key={revenue.id} className='hover:bg-gray-50'>
                    <td className='px-4 py-3 text-sm text-gray-900'>
                      {revenue.naziv_proizvoda}
                    </td>
                    <td className='px-4 py-3 text-sm text-gray-500'>
                      {revenue.sifra_proizvoda}
                    </td>
                    <td className='px-4 py-3 text-sm text-right text-gray-900'>
                      {revenue.kolicina}
                    </td>
                    <td className='px-4 py-3 text-sm text-right text-gray-900'>
                      {revenue.nabavna_cena.toLocaleString('sr-RS')} RSD
                    </td>
                    <td className='px-4 py-3 text-sm text-right text-gray-900'>
                      {revenue.prodajna_cena.toLocaleString('sr-RS')} RSD
                    </td>
                    <td className='px-4 py-3 text-sm text-right font-medium text-green-600'>
                      {revenue.ukupna_zarada.toLocaleString('sr-RS')} RSD
                    </td>
                    <td className='px-4 py-3 text-sm text-gray-500'>
                      {new Date(revenue.datum_prodaje).toLocaleDateString(
                        'sr-RS'
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className='px-4 py-8 text-center text-gray-500'
                  >
                    Nema pronađenih prihoda
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
