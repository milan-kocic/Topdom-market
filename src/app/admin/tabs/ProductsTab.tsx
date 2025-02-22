'use client';

import { useState, useEffect } from 'react';
import {
  PlusCircle,
  Pencil,
  Trash2,
  Star,
  StarOff,
  Filter,
  Search,
  Download,
  FolderPlus,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  X
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { exportToCSV } from '@/lib/utils/csv-export';
import type { Database } from '@/lib/types/database.types';

type Product = Database['public']['Tables']['proizvodi']['Row'];
type Category = Database['public']['Tables']['kategorije']['Row'];

interface ProductModalProps {
  product: Product | null;
  categories: Category[];
  onClose: () => void;
  onSave: () => void;
}

function ProductModal({
  product,
  categories,
  onClose,
  onSave
}: ProductModalProps) {
  const [formData, setFormData] = useState({
    naziv_proizvoda: product?.naziv_proizvoda || '',
    opis: product?.opis || '',
    cena: product?.cena || 0,
    img_url: product?.img_url || '',
    dostupnost: product?.dostupnost ?? true,
    novi_proizvod: product?.novi_proizvod ?? false,
    najprodavaniji_proizvod: product?.najprodavaniji_proizvod ?? false,
    id_kategorija: product?.id_kategorija || categories[0]?.id
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      if (product?.id) {
        // Update existing product
        const { error } = await supabase
          .from('proizvodi')
          .update(formData)
          .eq('id', product.id);

        if (error) throw error;
        toast.success('Proizvod uspešno ažuriran');
      } else {
        // Create new product
        const { error } = await supabase.from('proizvodi').insert([formData]);

        if (error) throw error;
        toast.success('Proizvod uspešno kreiran');
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Greška pri čuvanju proizvoda');
    }
  }

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
      <div className='bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto'>
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-2xl font-bold'>
            {product?.id ? 'Izmeni proizvod' : 'Novi proizvod'}
          </h2>
          <button
            onClick={onClose}
            className='p-2 hover:bg-gray-100 rounded-full'
            title='Zatvori'
            aria-label='Zatvori'
          >
            <X className='h-5 w-5' />
          </button>
        </div>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Naziv proizvoda
            </label>
            <input
              type='text'
              value={formData.naziv_proizvoda}
              onChange={(e) =>
                setFormData({ ...formData, naziv_proizvoda: e.target.value })
              }
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent'
              required
              aria-label='Naziv proizvoda'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Kategorija
            </label>
            <select
              value={formData.id_kategorija}
              onChange={(e) =>
                setFormData({ ...formData, id_kategorija: e.target.value })
              }
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent'
              required
              aria-label='Izaberi kategoriju'
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.naziv_kategorije}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Opis
            </label>
            <textarea
              value={formData.opis}
              onChange={(e) =>
                setFormData({ ...formData, opis: e.target.value })
              }
              rows={3}
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent'
              required
              aria-label='Opis proizvoda'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Cena (RSD)
            </label>
            <input
              type='number'
              value={formData.cena}
              onChange={(e) =>
                setFormData({ ...formData, cena: parseFloat(e.target.value) })
              }
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent'
              required
              min='0'
              step='0.01'
              aria-label='Cena proizvoda'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              URL slike
            </label>
            <input
              type='url'
              value={formData.img_url}
              onChange={(e) =>
                setFormData({ ...formData, img_url: e.target.value })
              }
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent'
              aria-label='URL slike proizvoda'
            />
          </div>

          <div className='flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6'>
            <div className='flex items-center'>
              <input
                type='checkbox'
                id='dostupnost'
                checked={formData.dostupnost}
                onChange={(e) =>
                  setFormData({ ...formData, dostupnost: e.target.checked })
                }
                className='h-4 w-4 text-yellow-400 focus:ring-yellow-400 border-gray-300 rounded'
              />
              <label
                htmlFor='dostupnost'
                className='ml-2 block text-sm text-gray-700'
              >
                Proizvod je dostupan
              </label>
            </div>

            <div className='flex items-center'>
              <input
                type='checkbox'
                id='novi_proizvod'
                checked={formData.novi_proizvod}
                onChange={(e) =>
                  setFormData({ ...formData, novi_proizvod: e.target.checked })
                }
                className='h-4 w-4 text-yellow-400 focus:ring-yellow-400 border-gray-300 rounded'
              />
              <label
                htmlFor='novi_proizvod'
                className='ml-2 block text-sm text-gray-700'
              >
                Novi proizvod
              </label>
            </div>

            <div className='flex items-center'>
              <input
                type='checkbox'
                id='najprodavaniji_proizvod'
                checked={formData.najprodavaniji_proizvod}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    najprodavaniji_proizvod: e.target.checked
                  })
                }
                className='h-4 w-4 text-yellow-400 focus:ring-yellow-400 border-gray-300 rounded'
              />
              <label
                htmlFor='najprodavaniji_proizvod'
                className='ml-2 block text-sm text-gray-700'
              >
                Najprodavaniji proizvod
              </label>
            </div>
          </div>

          <div className='flex justify-end space-x-4 mt-6'>
            <button
              type='button'
              onClick={onClose}
              className='px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors'
            >
              Otkaži
            </button>
            <button
              type='submit'
              className='px-6 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-300 transition-colors'
            >
              Sačuvaj
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface CategoryModalProps {
  onClose: () => void;
  onSave: () => void;
}

function CategoryModal({ onClose, onSave }: CategoryModalProps) {
  const [formData, setFormData] = useState({
    naziv_kategorije: '',
    opis_kategorije: ''
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const { error } = await supabase.from('kategorije').insert([formData]);

      if (error) throw error;
      toast.success('Kategorija uspešno kreirana');
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Greška pri čuvanju kategorije');
    }
  }

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
      <div className='bg-white rounded-xl max-w-md w-full p-6'>
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-2xl font-bold'>Nova kategorija</h2>
          <button
            onClick={onClose}
            className='p-2 hover:bg-gray-100 rounded-full'
            title='Zatvori'
            aria-label='Zatvori'
          >
            <X className='h-5 w-5' />
          </button>
        </div>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Naziv kategorije
            </label>
            <input
              type='text'
              value={formData.naziv_kategorije}
              onChange={(e) =>
                setFormData({ ...formData, naziv_kategorije: e.target.value })
              }
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent'
              required
              aria-label='Naziv kategorije'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Opis kategorije
            </label>
            <textarea
              value={formData.opis_kategorije}
              onChange={(e) =>
                setFormData({ ...formData, opis_kategorije: e.target.value })
              }
              rows={3}
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent'
              aria-label='Opis kategorije'
            />
          </div>

          <div className='flex justify-end space-x-4 mt-6'>
            <button
              type='button'
              onClick={onClose}
              className='px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors'
            >
              Otkaži
            </button>
            <button
              type='submit'
              className='px-6 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-300 transition-colors'
            >
              Sačuvaj
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProductsTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(
    new Set()
  );
  const [openActionsMenu, setOpenActionsMenu] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAvailable, setFilterAvailable] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  async function fetchProducts() {
    try {
      const { data, error } = await supabase
        .from('proizvodi')
        .select('*, kategorije(naziv_kategorije)');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Greška pri učitavanju proizvoda');
    } finally {
      setLoading(false);
    }
  }

  async function fetchCategories() {
    try {
      const { data, error } = await supabase
        .from('kategorije')
        .select('*')
        .order('naziv_kategorije');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Greška pri učitavanju kategorija');
    }
  }

  async function handleToggleBestseller(product: Product) {
    try {
      const { error } = await supabase
        .from('proizvodi')
        .update({ najprodavaniji_proizvod: !product.najprodavaniji_proizvod })
        .eq('id', product.id);

      if (error) throw error;
      await fetchProducts();
      toast.success(
        `Proizvod ${
          !product.najprodavaniji_proizvod ? 'dodat u' : 'uklonjen iz'
        } najprodavanije`
      );
    } catch (error) {
      console.error('Error toggling bestseller status:', error);
      toast.error('Greška pri promeni statusa najprodavanijeg proizvoda');
    }
  }

  async function handleDeleteProduct(id: string) {
    try {
      const { error } = await supabase.from('proizvodi').delete().eq('id', id);

      if (error) throw error;
      await fetchProducts();
      toast.success('Proizvod uspešno obrisan');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Greška pri brisanju proizvoda');
    }
  }

  async function handleExportCSV() {
    try {
      const productsForExport = products.map((product) => ({
        ID: product.id,
        Naziv: product.naziv_proizvoda,
        Opis: product.opis,
        Cena: product.cena,
        Kategorija: (product.kategorije as any)?.naziv_kategorije || '',
        Dostupnost: product.dostupnost ? 'Da' : 'Ne',
        'Novi proizvod': product.novi_proizvod ? 'Da' : 'Ne',
        Najprodavaniji: product.najprodavaniji_proizvod ? 'Da' : 'Ne'
      }));

      exportToCSV(productsForExport, 'proizvodi');
      toast.success('Proizvodi uspešno izvezeni');
    } catch (error) {
      console.error('Error exporting products:', error);
      toast.error('Greška pri izvozu proizvoda');
    }
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.naziv_proizvoda
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      product.opis.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = !filterAvailable || product.dostupnost;
    return matchesSearch && matchesFilter;
  });

  const toggleProductDetails = (productId: string) => {
    setExpandedProducts((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  const toggleActionsMenu = (productId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setOpenActionsMenu(openActionsMenu === productId ? null : productId);
  };

  return (
    <div>
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8'>
        <div>
          <h1 className='text-3xl font-bold'>Proizvodi</h1>
          <p className='text-gray-600 mt-1'>
            Upravljajte proizvodima i kategorijama
          </p>
        </div>
        <div className='flex flex-col sm:flex-row gap-4'>
          <button
            onClick={() => setShowCategoryModal(true)}
            className='flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors'
          >
            <FolderPlus className='h-5 w-5' />
            <span>Nova kategorija</span>
          </button>
          <button
            onClick={() => {
              setSelectedProduct(null);
              setShowProductModal(true);
            }}
            className='flex items-center justify-center space-x-2 px-4 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-300 transition-colors'
          >
            <PlusCircle className='h-5 w-5' />
            <span>Novi proizvod</span>
          </button>
        </div>
      </div>

      <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
        <div className='p-4 border-b border-gray-200'>
          <div className='flex flex-col sm:flex-row gap-4'>
            <div className='flex-1'>
              <div className='relative'>
                <input
                  type='text'
                  placeholder='Pretraži proizvode...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent'
                />
                <Search className='h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2' />
              </div>
            </div>
            <div className='flex items-center space-x-4'>
              <button
                onClick={() => setFilterAvailable(!filterAvailable)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${
                  filterAvailable
                    ? 'bg-yellow-50 border-yellow-200 text-yellow-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                } transition-colors`}
              >
                <Filter className='h-4 w-4' />
                <span>Samo dostupni</span>
              </button>
              <button
                onClick={handleExportCSV}
                className='flex items-center space-x-2 px-4 py-2 text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors'
              >
                <Download className='h-4 w-4' />
                <span>Izvezi CSV</span>
              </button>
            </div>
          </div>
        </div>

        <div className='divide-y divide-gray-200'>
          {loading ? (
            <div className='p-8 text-center text-gray-500'>
              Učitavanje proizvoda...
            </div>
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div
                key={product.id}
                className='group hover:bg-gray-50 transition-colors cursor-pointer'
                onClick={() => toggleProductDetails(product.id)}
              >
                <div className='p-4'>
                  <div className='flex items-start justify-between'>
                    <div className='flex items-start space-x-4'>
                      {product.img_url && (
                        <img
                          src={product.img_url}
                          alt={product.naziv_proizvoda}
                          className='w-16 h-16 object-cover rounded-lg'
                        />
                      )}
                      <div>
                        <h3 className='font-medium text-gray-900'>
                          {product.naziv_proizvoda}
                        </h3>
                        <p className='text-sm text-gray-500 mt-1'>
                          {(product.kategorije as any)?.naziv_kategorije}
                        </p>
                        <div className='flex items-center space-x-2 mt-2'>
                          <span className='text-lg font-semibold'>
                            {product.cena} RSD
                          </span>
                          {product.dostupnost ? (
                            <span className='px-2 py-1 text-xs font-medium text-green-700 bg-green-50 rounded-full'>
                              Dostupno
                            </span>
                          ) : (
                            <span className='px-2 py-1 text-xs font-medium text-red-700 bg-red-50 rounded-full'>
                              Nije dostupno
                            </span>
                          )}
                          {product.novi_proizvod && (
                            <span className='px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded-full'>
                              Novo
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className='flex items-center space-x-2'>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleBestseller(product);
                        }}
                        className={`p-2 rounded-lg transition-colors ${
                          product.najprodavaniji_proizvod
                            ? 'text-yellow-500 hover:bg-yellow-50'
                            : 'text-gray-400 hover:bg-gray-100'
                        }`}
                      >
                        {product.najprodavaniji_proizvod ? (
                          <Star className='h-5 w-5' />
                        ) : (
                          <StarOff className='h-5 w-5' />
                        )}
                      </button>

                      <div className='relative'>
                        <button
                          onClick={(e) => toggleActionsMenu(product.id, e)}
                          className='p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg transition-colors'
                          title='Otvori meni'
                          aria-label='Otvori meni sa akcijama'
                        >
                          <MoreVertical className='h-5 w-5' />
                        </button>

                        {openActionsMenu === product.id && (
                          <div className='absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10'>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedProduct(product);
                                setShowProductModal(true);
                                setOpenActionsMenu(null);
                              }}
                              className='flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left'
                            >
                              <Pencil className='h-4 w-4' />
                              <span>Izmeni</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (
                                  window.confirm(
                                    'Da li ste sigurni da želite da obrišete ovaj proizvod?'
                                  )
                                ) {
                                  handleDeleteProduct(product.id);
                                }
                                setOpenActionsMenu(null);
                              }}
                              className='flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left'
                            >
                              <Trash2 className='h-4 w-4' />
                              <span>Obriši</span>
                            </button>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleProductDetails(product.id);
                        }}
                        className='p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg transition-colors'
                      >
                        {expandedProducts.has(product.id) ? (
                          <ChevronUp className='h-5 w-5' />
                        ) : (
                          <ChevronDown className='h-5 w-5' />
                        )}
                      </button>
                    </div>
                  </div>

                  {expandedProducts.has(product.id) && (
                    <div className='mt-4 text-sm text-gray-500'>
                      <p>{product.opis}</p>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className='p-8 text-center text-gray-500'>
              Nema pronađenih proizvoda
            </div>
          )}
        </div>
      </div>

      {showProductModal && (
        <ProductModal
          product={selectedProduct}
          categories={categories}
          onClose={() => {
            setShowProductModal(false);
            setSelectedProduct(null);
          }}
          onSave={fetchProducts}
        />
      )}

      {showCategoryModal && (
        <CategoryModal
          onClose={() => setShowCategoryModal(false)}
          onSave={fetchCategories}
        />
      )}
    </div>
  );
}
