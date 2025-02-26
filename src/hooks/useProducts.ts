import { useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { Proizvod, ProizvodDetalji } from '../types';
import * as proizvodiService from '../lib/services/proizvodi.service';

export function useProducts() {
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
      dispatch({
        type: 'ADD_TO_CART',
        payload: { ...product, quantity }
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
    isLoading: state.loading.products === 'loading',
    error: state.error,
    fetchProducts,
    getProductById,
    searchProducts,
    addToCart,
    removeFromCart,
    updateCartQuantity
  };
}
