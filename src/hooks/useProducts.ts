import { useCallback } from 'react';
import { useApp } from '@/lib/context/AppContext';
import { Proizvod, ProizvodDetalji } from '@/types';
import * as proizvodiService from '@/lib/services/proizvodi.service';

interface UseProductsReturn {
  products: ProizvodDetalji[];
  cart: any[];
  loading: Record<string, string>;
  error: any;
  fetchProducts: () => Promise<void>;
  fetchNewProducts: () => Promise<ProizvodDetalji[]>;
  fetchBestSellers: () => Promise<ProizvodDetalji[]>;
  fetchSurprises: () => Promise<ProizvodDetalji[]>;
  getProductById: (id: string) => Promise<ProizvodDetalji | null>;
  searchProducts: (query: string) => Promise<ProizvodDetalji[]>;
  addToCart: (product: Proizvod, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
}

export function useProducts(): UseProductsReturn {
  const { state, dispatch } = useApp();

  const fetchProducts = useCallback(async () => {
    try {
      dispatch({
        type: 'SET_LOADING',
        payload: { key: 'products', state: 'loading' }
      });

      const products = await proizvodiService.getProizvodi();

      dispatch({ type: 'SET_PRODUCTS', payload: products });
      dispatch({
        type: 'SET_LOADING',
        payload: { key: 'products', state: 'success' }
      });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: {
          message: 'Greška pri učitavanju proizvoda. Molimo pokušajte ponovo.',
          code: 'PRODUCTS_FETCH_ERROR'
        }
      });
      dispatch({
        type: 'SET_LOADING',
        payload: { key: 'products', state: 'error' }
      });
    }
  }, [dispatch]);

  const fetchNewProducts = useCallback(async () => {
    try {
      console.log('fetchNewProducts: Započinjem dohvatanje novih proizvoda...');
      dispatch({
        type: 'SET_LOADING',
        payload: { key: 'new-products', state: 'loading' }
      });

      const products = await proizvodiService.getNoviProizvodi();
      console.log('fetchNewProducts: Dohvaćeni novi proizvodi:', products);

      dispatch({
        type: 'SET_LOADING',
        payload: { key: 'new-products', state: 'success' }
      });
      return products;
    } catch (error) {
      console.error('fetchNewProducts: Greška:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: {
          message: 'Greška pri učitavanju novih proizvoda.',
          code: 'NEW_PRODUCTS_FETCH_ERROR'
        }
      });
      dispatch({
        type: 'SET_LOADING',
        payload: { key: 'new-products', state: 'error' }
      });
      return [];
    }
  }, [dispatch]);

  const fetchBestSellers = useCallback(async () => {
    try {
      dispatch({
        type: 'SET_LOADING',
        payload: { key: 'best-sellers', state: 'loading' }
      });

      const products = await proizvodiService.getNajprodavanijiProizvodi();

      dispatch({
        type: 'SET_LOADING',
        payload: { key: 'best-sellers', state: 'success' }
      });
      return products;
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: {
          message: 'Greška pri učitavanju najprodavanijih proizvoda.',
          code: 'BEST_SELLERS_FETCH_ERROR'
        }
      });
      dispatch({
        type: 'SET_LOADING',
        payload: { key: 'best-sellers', state: 'error' }
      });
      return [];
    }
  }, [dispatch]);

  const fetchSurprises = useCallback(async () => {
    try {
      console.log('fetchSurprises: Započinjem dohvatanje iznenađenja...');
      dispatch({
        type: 'SET_LOADING',
        payload: { key: 'surprises', state: 'loading' }
      });

      const products = await proizvodiService.getIznenadjenja();
      console.log('fetchSurprises: Dohvaćena iznenađenja:', products);

      dispatch({
        type: 'SET_LOADING',
        payload: { key: 'surprises', state: 'success' }
      });
      return products;
    } catch (error) {
      console.error('fetchSurprises: Greška:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: {
          message: 'Greška pri učitavanju iznenađenja.',
          code: 'SURPRISES_FETCH_ERROR'
        }
      });
      dispatch({
        type: 'SET_LOADING',
        payload: { key: 'surprises', state: 'error' }
      });
      return [];
    }
  }, [dispatch]);

  const getProductById = useCallback(
    async (id: string) => {
      try {
        dispatch({
          type: 'SET_LOADING',
          payload: { key: `product-${id}`, state: 'loading' }
        });

        const product = await proizvodiService.getProizvodById(id);

        dispatch({
          type: 'SET_LOADING',
          payload: { key: `product-${id}`, state: 'success' }
        });
        return product;
      } catch (error) {
        dispatch({
          type: 'SET_ERROR',
          payload: {
            message:
              'Greška pri učitavanju proizvoda. Molimo pokušajte ponovo.',
            code: 'PRODUCT_FETCH_ERROR'
          }
        });
        dispatch({
          type: 'SET_LOADING',
          payload: { key: `product-${id}`, state: 'error' }
        });
        return null;
      }
    },
    [dispatch]
  );

  const searchProducts = useCallback(
    async (query: string) => {
      try {
        dispatch({
          type: 'SET_LOADING',
          payload: { key: 'search', state: 'loading' }
        });

        const products = await proizvodiService.searchProizvodi(query);

        dispatch({
          type: 'SET_LOADING',
          payload: { key: 'search', state: 'success' }
        });
        return products;
      } catch (error) {
        dispatch({
          type: 'SET_ERROR',
          payload: {
            message:
              'Greška pri pretraživanju proizvoda. Molimo pokušajte ponovo.',
            code: 'SEARCH_ERROR'
          }
        });
        dispatch({
          type: 'SET_LOADING',
          payload: { key: 'search', state: 'error' }
        });
        return [];
      }
    },
    [dispatch]
  );

  const addToCart = useCallback(
    (product: Proizvod, quantity: number = 1) => {
      const cartItem: ProizvodDetalji & { quantity: number } = {
        id: product.id,
        sku: product.sku,
        naziv_proizvoda: product.naziv_proizvoda,
        opis: product.opis,
        cena: product.cena,
        nabavna_cena: product.nabavna_cena,
        id_kategorije: product.id_kategorija,
        kreirano: product.kreirano,
        novi_proizvod: product.novi_proizvod,
        najprodavaniji_proizvod: product.najprodavaniji_proizvod,
        status_dostupnosti: product.status_dostupnosti,
        naziv_kategorije: '',
        glavna_slika: product.img_url,
        quantity
      };

      dispatch({
        type: 'ADD_TO_CART',
        payload: cartItem
      });
    },
    [dispatch]
  );

  const removeFromCart = useCallback(
    (productId: string) => {
      dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
    },
    [dispatch]
  );

  const updateCartQuantity = useCallback(
    (productId: string, quantity: number) => {
      dispatch({
        type: 'UPDATE_CART_QUANTITY',
        payload: { id: productId, quantity }
      });
    },
    [dispatch]
  );

  return {
    products: state.products,
    cart: state.cart,
    loading: state.loading,
    error: state.error,
    fetchProducts,
    fetchNewProducts,
    fetchBestSellers,
    fetchSurprises,
    getProductById,
    searchProducts,
    addToCart,
    removeFromCart,
    updateCartQuantity
  };
}
