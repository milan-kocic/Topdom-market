'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Minus, Plus, ShoppingCart, Heart, Share2, Star, User, Phone, MapPin, Mail } from 'lucide-react';
import type { Database } from '@/lib/types/database.types';
import toast from 'react-hot-toast';

type Product = Database['public']['Tables']['proizvodi']['Row'];

interface OrderForm {
  ime_prezime: string;
  telefon: string;
  adresa: string;
  grad: string;
  postanski_broj: string;
  email?: string; // Optional email field
}

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [orderForm, setOrderForm] = useState<OrderForm>({
    ime_prezime: '',
    telefon: '',
    adresa: '',
    grad: '',
    postanski_broj: '',
    email: '', // Initialize empty email
  });
  const [formErrors, setFormErrors] = useState<Partial<OrderForm>>({});

  useEffect(() => {
    async function fetchProduct() {
      try {
        const { data, error } = await supabase
          .from('proizvodi')
          .select(`
            *,
            kategorije (
              naziv_kategorije
            )
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        setProduct(data);
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Greška pri učitavanju proizvoda');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleQuantityChange = (value: number) => {
    const newQuantity = Math.max(1, Math.min(10, quantity + value));
    setQuantity(newQuantity);
  };

  const validateForm = () => {
    const errors: Partial<OrderForm> = {};
    if (!orderForm.ime_prezime) errors.ime_prezime = 'Obavezno polje';
    if (!orderForm.telefon) errors.telefon = 'Obavezno polje';
    if (!orderForm.adresa) errors.adresa = 'Obavezno polje';
    if (!orderForm.grad) errors.grad = 'Obavezno polje';
    if (!orderForm.postanski_broj) errors.postanski_broj = 'Obavezno polje';
    
    // Validate email format if provided
    if (orderForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(orderForm.email)) {
      errors.email = 'Neispravan format email adrese';
    }
    
    return errors;
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Here you would typically submit the order to your backend
    toast.success('Porudžbina je uspešno kreirana!');
    setOrderForm({
      ime_prezime: '',
      telefon: '',
      adresa: '',
      grad: '',
      postanski_broj: '',
      email: '',
    });
  };

  const calculateTotal = () => {
    if (!product) return 0;
    const subtotal = product.cena * quantity;
    const shipping = 390; // Fixed shipping cost
    return {
      subtotal,
      shipping,
      total: subtotal + shipping
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-xl shadow-lg p-8 animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="h-96 bg-gray-200 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-24 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded w-1/3"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Proizvod nije pronađen</h1>
          <p className="text-gray-600">Proizvod koji tražite ne postoji ili je uklonjen.</p>
        </div>
      </div>
    );
  }

  const { subtotal, shipping, total } = calculateTotal();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Left Column - Product Image and Info */}
            <div className="space-y-8">
              {/* Product Image */}
              <div className="relative h-[400px] rounded-lg overflow-hidden">
                <img
                  src={product.img_url || 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?ixlib=rb-4.0.3'}
                  alt={product.naziv_proizvoda}
                  className="w-full h-full object-cover"
                />
                {product.novi_proizvod && (
                  <div className="absolute top-4 left-4 bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-medium">
                    NOVO
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div>
                <div className="mb-6">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {product.naziv_proizvoda}
                  </h1>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span>Kategorija:</span>
                    <span className="font-medium text-yellow-600">{product.kategorije?.naziv_kategorije}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                  <span className="text-sm text-gray-600">(12 ocena)</span>
                </div>

                <p className="text-gray-600 mb-8">{product.opis}</p>

                <div className="mb-8">
                  <div className="text-3xl font-bold text-yellow-600">
                    {product.cena.toLocaleString()} RSD
                  </div>
                  {product.dostupnost ? (
                    <span className="text-yellow-600 text-sm">Na stanju</span>
                  ) : (
                    <span className="text-red-600 text-sm">Nije dostupno</span>
                  )}
                </div>

                {/* Social Buttons */}
                <div className="flex space-x-4">
                  <button className="p-3 border border-gray-300 rounded-lg hover:bg-yellow-50 hover:border-yellow-400 hover:text-yellow-600 transition-colors">
                    <Heart className="h-6 w-6" />
                  </button>
                  <button className="p-3 border border-gray-300 rounded-lg hover:bg-yellow-50 hover:border-yellow-400 hover:text-yellow-600 transition-colors">
                    <Share2 className="h-6 w-6" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Checkout Form */}
            <div className="bg-yellow-50 rounded-xl p-6">
              {/* Order Summary */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-4">Završite kupovinu</h2>
                <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
                  <div className="flex items-center space-x-4 mb-4">
                    <img
                      src={product.img_url}
                      alt={product.naziv_proizvoda}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium">{product.naziv_proizvoda}</h3>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-gray-700">Količina:</span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleQuantityChange(-1)}
                            className="p-2 rounded-full hover:bg-yellow-100 text-yellow-600"
                            disabled={quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center font-medium">{quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(1)}
                            className="p-2 rounded-full hover:bg-yellow-100 text-yellow-600"
                            disabled={quantity >= 10}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="font-medium text-yellow-600">
                      {product.cena.toLocaleString()} RSD
                    </div>
                  </div>
                  <div className="border-t border-gray-200 pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Cena proizvoda</span>
                      <span className="text-yellow-600">{subtotal.toLocaleString()} RSD</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Poštarina</span>
                      <span className="text-yellow-600">{shipping.toLocaleString()} RSD</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
                      <span>Ukupno</span>
                      <span className="text-yellow-600">{total.toLocaleString()} RSD</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Checkout Form */}
              <form onSubmit={handleSubmitOrder} className="space-y-4">
                <div>
                  <div className="relative">
                    <input
                      type="text"
                      value={orderForm.ime_prezime}
                      onChange={(e) => setOrderForm({ ...orderForm, ime_prezime: e.target.value })}
                      placeholder="IME I PREZIME"
                      className={`w-full px-4 py-3 pl-10 border ${
                        formErrors.ime_prezime ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent bg-white`}
                    />
                    <User className="h-5 w-5 text-yellow-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  </div>
                  {formErrors.ime_prezime && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.ime_prezime}</p>
                  )}
                </div>

                <div>
                  <div className="relative">
                    <input
                      type="tel"
                      value={orderForm.telefon}
                      onChange={(e) => setOrderForm({ ...orderForm, telefon: e.target.value })}
                      placeholder="BROJ TELEFONA"
                      className={`w-full px-4 py-3 pl-10 border ${
                        formErrors.telefon ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent bg-white`}
                    />
                    <Phone className="h-5 w-5 text-yellow-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  </div>
                  {formErrors.telefon && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.telefon}</p>
                  )}
                </div>

                <div>
                  <div className="relative">
                    <input
                      type="text"
                      value={orderForm.adresa}
                      onChange={(e) => setOrderForm({ ...orderForm, adresa: e.target.value })}
                      placeholder="ULICA I BROJ"
                      className={`w-full px-4 py-3 pl-10 border ${
                        formErrors.adresa ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent bg-white`}
                    />
                    <MapPin className="h-5 w-5 text-yellow-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  </div>
                  {formErrors.adresa && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.adresa}</p>
                  )}
                </div>

                <div>
                  <div className="relative">
                    <input
                      type="text"
                      value={orderForm.grad}
                      onChange={(e) => setOrderForm({ ...orderForm, grad: e.target.value })}
                      placeholder="GRAD / SELO"
                      className={`w-full px-4 py-3 pl-10 border ${
                        formErrors.grad ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent bg-white`}
                    />
                    <MapPin className="h-5 w-5 text-yellow-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  </div>
                  {formErrors.grad && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.grad}</p>
                  )}
                </div>

                <div>
                  <div className="relative">
                    <input
                      type="text"
                      value={orderForm.postanski_broj}
                      onChange={(e) => setOrderForm({ ...orderForm, postanski_broj: e.target.value })}
                      placeholder="POŠTANSKI BROJ"
                      className={`w-full px-4 py-3 pl-10 border ${
                        formErrors.postanski_broj ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent bg-white`}
                    />
                    <MapPin className="h-5 w-5 text-yellow-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  </div>
                  {formErrors.postanski_broj && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.postanski_broj}</p>
                  )}
                </div>

                <div>
                  <div className="relative">
                    <input
                      type="email"
                      value={orderForm.email}
                      onChange={(e) => setOrderForm({ ...orderForm, email: e.target.value })}
                      placeholder="EMAIL (NIJE OBAVEZNO)"
                      className={`w-full px-4 py-3 pl-10 border ${
                        formErrors.email ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent bg-white`}
                    />
                    <Mail className="h-5 w-5 text-yellow-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  </div>
                  {formErrors.email && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-yellow-400 text-black px-8 py-4 rounded-lg font-semibold text-lg hover:bg-yellow-500 transition-colors flex items-center justify-center space-x-2"
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span>ZAVRŠITE KUPOVINU - {total.toLocaleString()} RSD</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}