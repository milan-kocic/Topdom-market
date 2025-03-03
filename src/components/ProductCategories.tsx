import React, { useEffect, useState } from 'react';
import { useProducts } from '../hooks/useProducts';
import { ProizvodDetalji } from '../types';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { Star, Sparkles, Gift } from 'lucide-react';

export function ProductCategories() {
  const { fetchNewProducts, fetchBestSellers, fetchSurprises } = useProducts();
  const [newProducts, setNewProducts] = useState<ProizvodDetalji[]>([]);
  const [bestSellers, setBestSellers] = useState<ProizvodDetalji[]>([]);
  const [surprises, setSurprises] = useState<ProizvodDetalji[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      console.log('Započinjem dohvatanje proizvoda...');
      const [newProds, bestSells, surps] = await Promise.all([
        fetchNewProducts(),
        fetchBestSellers(),
        fetchSurprises()
      ]);
      console.log('Dohvaćeni podaci:', {
        newProds,
        bestSells,
        surps
      });
      setNewProducts(newProds);
      setBestSellers(bestSells);
      setSurprises(surps);
      setLoading(false);
    }
    fetchData();
  }, [fetchNewProducts, fetchBestSellers, fetchSurprises]);

  if (loading) {
    return <LoadingSpinner size='large' className='my-8' />;
  }

  return (
    <div className='py-12'>
      {/* Novi proizvodi */}
      {newProducts.length > 0 && (
        <section className='mb-12'>
          <div className='flex items-center gap-2 mb-6'>
            <Sparkles className='h-6 w-6 text-yellow-500' />
            <h2 className='text-2xl font-bold'>Novo u prodaji</h2>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            {newProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Najprodavaniji proizvodi */}
      {bestSellers.length > 0 && (
        <section className='mb-12'>
          <div className='flex items-center gap-2 mb-6'>
            <Star className='h-6 w-6 text-yellow-500' />
            <h2 className='text-2xl font-bold'>Najprodavaniji proizvodi</h2>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Iznenađenja */}
      {surprises.length > 0 && (
        <section className='mb-12'>
          <div className='flex items-center gap-2 mb-6'>
            <Gift className='h-6 w-6 text-yellow-500' />
            <h2 className='text-2xl font-bold'>Iznenađenja</h2>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            {surprises.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

interface ProductCardProps {
  product: ProizvodDetalji;
}

function ProductCard({ product }: ProductCardProps) {
  return (
    <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow'>
      {product.glavna_slika && (
        <img
          src={product.glavna_slika}
          alt={product.naziv_proizvoda}
          className='w-full h-48 object-cover'
        />
      )}
      <div className='p-4'>
        <h3 className='font-medium text-gray-900 mb-1'>
          {product.naziv_proizvoda}
        </h3>
        <p className='text-sm text-gray-500 mb-2'>{product.naziv_kategorije}</p>
        <div className='flex items-center justify-between'>
          <span className='text-lg font-bold'>
            {product.cena.toLocaleString('sr-RS')} RSD
          </span>
          <button className='px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors'>
            Dodaj u korpu
          </button>
        </div>
      </div>
    </div>
  );
}
