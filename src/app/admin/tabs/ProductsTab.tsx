'use client';

import { useState, useEffect } from 'react';
import { 
  PlusCircle, Pencil, Trash2, Star, StarOff, Filter, Search, Download, FolderPlus,
  ChevronDown, ChevronUp, MoreVertical, X
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

function ProductModal({ product, categories, onClose, onSave }: ProductModalProps) {
  const [formData, setFormData] = useState({
    naziv_proizvoda: product?.naziv_proizvoda || '',
    opis: product?.opis || '',
    cena: product?.cena || 0,
    img_url: product?.img_url || '',
    dostupnost: product?.dostupnost ?? true,
    novi_proizvod: product?.novi_proizvod ?? false,
    najprodavaniji_proizvod: product?.najprodavaniji_proizvod ?? false,
    id_kategorija: product?.id_kategorija || categories[0]?.id,
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
        const { error } = await supabase
          .from('proizvodi')
          .insert([formData]);

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {product?.id ? 'Izmeni proizvod' : 'Novi proizvod'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Naziv proizvoda
            </label>
            <input
              type="text"
              value={formData.naziv_proizvoda}
              onChange={(e) => setFormData({ ...formData, naziv_proizvoda: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kategorija
            </label>
            <select
              value={formData.id_kategorija}
              onChange={(e) => setFormData({ ...formData, id_kategorija: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              required
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.naziv_kategorije}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Opis
            </label>
            <textarea
              value={formData.opis}
              onChange={(e) => setFormData({ ...formData, opis: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cena (RSD)
            </label>
            <input
              type="number"
              value={formData.cena}
              onChange={(e) => setFormData({ ...formData, cena: parseFloat(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              required
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL slike
            </label>
            <input
              type="url"
              value={formData.img_url}
              onChange={(e) => setFormData({ ...formData, img_url: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="dostupnost"
                checked={formData.dostupnost}
                onChange={(e) => setFormData({ ...formData, dostupnost: e.target.checked })}
                className="h-4 w-4 text-yellow-400 focus:ring-yellow-400 border-gray-300 rounded"
              />
              <label htmlFor="dostupnost" className="ml-2 block text-sm text-gray-700">
                Proizvod je dostupan
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="novi_proizvod"
                checked={formData.novi_proizvod}
                onChange={(e) => setFormData({ ...formData, novi_proizvod: e.target.checked })}
                className="h-4 w-4 text-yellow-400 focus:ring-yellow-400 border-gray-300 rounded"
              />
              <label htmlFor="novi_proizvod" className="ml-2 block text-sm text-gray-700">
                Novi proizvod
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="najprodavaniji_proizvod"
                checked={formData.najprodavaniji_proizvod}
                onChange={(e) => setFormData({ ...formData, najprodavaniji_proizvod: e.target.checked })}
                className="h-4 w-4 text-yellow-400 focus:ring-yellow-400 border-gray-300 rounded"
              />
              <label htmlFor="najprodavaniji_proizvod" className="ml-2 block text-sm text-gray-700">
                Najprodavaniji proizvod
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Otkaži
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-300 transition-colors"
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
    opis_kategorije: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const { error } = await supabase
        .from('kategorije')
        .insert([formData]);

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Nova kategorija</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Naziv kategorije
            </label>
            <input
              type="text"
              value={formData.naziv_kategorije}
              onChange={(e) => setFormData({ ...formData, naziv_kategorije: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Opis kategorije
            </label>
            <textarea
              value={formData.opis_kategorije}
              onChange={(e) => setFormData({ ...formData, opis_kategorije: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            />
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Otkaži
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-300 transition-colors"
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
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('name_asc');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);
  const [showActionsMenu, setShowActionsMenu] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  async function fetchProducts() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('proizvodi')
        .select(`
          *,
          kategorije (
            naziv_kategorije
          )
        `)
        .order('kreirano', { ascending: false });

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
        .order('naziv_kategorije', { ascending: true });

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
      
      toast.success('Proizvod uspešno ažuriran');
      fetchProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Greška pri ažuriranju proizvoda');
    }
  }

  async function handleDeleteProduct(id: string) {
    if (!confirm('Da li ste sigurni da želite da obrišete ovaj proizvod?')) return;

    try {
      const { error } = await supabase
        .from('proizvodi')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Proizvod uspešno obrisan');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Greška pri brisanju proizvoda');
    }
  }

  async function handleExportCSV() {
    try {
      const { data, error } = await supabase
        .from('proizvodi')
        .select(`
          *,
          kategorije (
            naziv_kategorije
          )
        `);

      if (error) throw error;

      const formattedData = data.map(product => ({
        ID: product.id,
        Naziv: product.naziv_proizvoda,
        Opis: product.opis,
        Cena: product.cena,
        Kategorija: product.kategorije?.naziv_kategorije,
        Dostupnost: product.dostupnost ? 'Da' : 'Ne',
        'Novi proizvod': product.novi_proizvod ? 'Da' : 'Ne',
        'Najprodavaniji': product.najprodavaniji_proizvod ? 'Da' : 'Ne',
        'Datum kreiranja': new Date(product.kreirano).toLocaleString('sr-RS'),
        'Poslednje ažuriranje': new Date(product.azurirano).toLocaleString('sr-RS')
      }));

      exportToCSV(formattedData, `proizvodi-${new Date().toISOString().split('T')[0]}.csv`);
      toast.success('CSV fajl je uspešno kreiran');
    } catch (error) {
      console.error('Error exporting products:', error);
      toast.error('Greška pri kreiranju CSV fajla');
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.naziv_proizvoda.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.opis.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !selectedCategory || product.id_kategorija === selectedCategory;
    
    const matchesAvailability = !availabilityFilter || 
      (availabilityFilter === 'available' ? product.dostupnost : !product.dostupnost);
    
    const matchesStatus = !statusFilter ||
      (statusFilter === 'new' ? product.novi_proizvod : 
       statusFilter === 'bestseller' ? product.najprodavaniji_proizvod : true);

    return matchesSearch && matchesCategory && matchesAvailability && matchesStatus;
  }).sort((a, b) => {
    switch (sortOrder) {
      case 'name_asc':
        return a.naziv_proizvoda.localeCompare(b.naziv_proizvoda);
      case 'name_desc':
        return b.naziv_proizvoda.localeCompare(a.naziv_proizvoda);
      case 'price_asc':
        return a.cena - b.cena;
      case 'price_desc':
        return b.cena - a.cena;
      case 'date_asc':
        return new Date(a.kreirano).getTime() - new Date(b.kreirano).getTime();
      case 'date_desc':
        return new Date(b.kreirano).getTime() - new Date(a.kreirano).getTime();
      default:
        return 0;
    }
  });

  const toggleProductDetails = (productId: string) => {
    setExpandedProductId(expandedProductId === productId ? null : productId);
  };

  const toggleActionsMenu = (productId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setShowActionsMenu(showActionsMenu === productId ? null : productId);
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-12 bg-gray-200 rounded"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Proizvodi</h1>
          <p className="text-gray-600 mt-1">Ukupno proizvoda: {products.length}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExportCSV}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-600 transition-colors text-sm"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Izvezi CSV</span>
          </button>
          <button
            onClick={() => setShowCategoryModal(true)}
            className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-600 transition-colors text-sm"
          >
            <FolderPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Nova kategorija</span>
          </button>
          <button
            onClick={() => setEditingProduct({ id: '', naziv_proizvoda: '', opis: '', cena: 0 } as Product)}
            className="bg-yellow-400 text-black px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-yellow-300 transition-colors text-sm"
          >
            <PlusCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Novi proizvod</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Pretraži proizvode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-lg border ${
              showFilters ? 'bg-yellow-50 border-yellow-400 text-yellow-600' : 'border-gray-300'
            }`}
          >
            <Filter className="h-5 w-5" />
            <span>Filteri</span>
            {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategorija</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">Sve kategorije</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.naziv_kategorije}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dostupnost</label>
              <select
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">Svi proizvodi</option>
                <option value="available">Dostupni</option>
                <option value="unavailable">Nedostupni</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">Svi statusi</option>
                <option value="new">Novi proizvodi</option>
                <option value="bestseller">Najprodavaniji</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sortiranje</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="name_asc">Naziv (A-Z)</option>
                <option value="name_desc">Naziv (Z-A)</option>
                <option value="price_asc">Cena (najniža)</option>
                <option value="price_desc">Cena (najviša)</option>
                <option value="date_asc">Datum (najstariji)</option>
                <option value="date_desc">Datum (najnoviji)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="hidden md:block">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Naziv
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kategorija
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cena
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Akcije
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {product.img_url && (
                        <img
                          src={product.img_url}
                          alt={product.naziv_proizvoda}
                          className="h-10 w-10 rounded object-cover mr-3"
                        />
                      )}
                      <div className="text-sm font-medium text-gray-900">{product.naziv_proizvoda}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{product.kategorije?.naziv_kategorije}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{product.cena.toLocaleString('sr-RS')} RSD</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        product.dostupnost ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {product.dostupnost ? 'Dostupno' : 'Nedostupno'}
                      </span>
                      {product.novi_proizvod && (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          Novo
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => handleToggleBestseller(product)}
                        className="text-gray-400 hover:text-yellow-500"
                      >
                        {product.najprodavaniji_proizvod ? (
                          <Star className="h-5 w-5 fill-yellow-400" />
                        ) : (
                          <StarOff className="h-5 w-5" />
                        )}
                      </button>
                      <button
                        onClick={() => setEditingProduct(product)}
                        className="text-gray-400 hover:text-blue-500"
                      >
                        <Pencil className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="md:hidden">
          <div className="divide-y divide-gray-200">
            {filteredProducts.map((product) => (
              <div key={product.id} className="p-4">
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleProductDetails(product.id)}
                >
                  <div className="flex items-center space-x-3">
                    {product.img_url && (
                      <img
                        src={product.img_url}
                        alt={product.naziv_proizvoda}
                        className="h-12 w-12 rounded object-cover"
                      />
                    )}
                    <div>
                      <div className="font-medium">{product.naziv_proizvoda}</div>
                      <div className="text-sm text-gray-500">{product.cena.toLocaleString('sr-RS')} RSD</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <button
                      onClick={(e) => toggleActionsMenu(product.id, e)}
                      className="p-2 hover:bg-gray-100 rounded-full"
                    >
                      <MoreVertical className="h-5 w-5 text-gray-500" />
                    </button>
                    {showActionsMenu === product.id && (
                      <div className="absolute right-4 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10">
                        <button
                          onClick={() => handleToggleBestseller(product)}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                        >
                          