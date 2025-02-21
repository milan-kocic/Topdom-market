'use client';

import { useProducts } from '@/lib/hooks/use-products';
import NewProductCard from './NewProductCard';

export default function NewProducts() {
  const { products, loading: productsLoading, error: productsError } = useProducts();

  // Filter only new products (novi_proizvod = true)
  const newProducts = products
    ?.filter(product => product.novi_proizvod && product.dostupnost)
    .slice(0, 3) || [];

  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold mb-16 text-center">Novo u ponudi</h2>
        {productsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
                <div className="w-full h-64 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : newProducts.length === 0 ? (
          <div className="text-center text-gray-500">
            Trenutno nema novih proizvoda u ponudi.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {newProducts.map((product) => (
              <NewProductCard
                key={product.id}
                image={product.img_url}
                title={product.naziv_proizvoda}
                description={product.opis}
                price={product.cena.toString()}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}