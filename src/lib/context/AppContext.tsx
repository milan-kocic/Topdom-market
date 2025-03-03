'use client';

import React, { createContext, useContext, useReducer } from 'react';
import { ProizvodDetalji } from '@/types';

interface AppState {
  products: ProizvodDetalji[];
  cart: any[];
  loading: Record<string, string>;
  error: any;
}

type Action =
  | { type: 'SET_PRODUCTS'; payload: ProizvodDetalji[] }
  | { type: 'SET_LOADING'; payload: { key: string; state: string } }
  | { type: 'SET_ERROR'; payload: { message: string; code: string } }
  | { type: 'ADD_TO_CART'; payload: ProizvodDetalji & { quantity: number } }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_CART_QUANTITY'; payload: { id: string; quantity: number } };

const initialState: AppState = {
  products: [],
  cart: [],
  loading: {},
  error: null
};

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload };
    case 'SET_LOADING':
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.key]: action.payload.state
        }
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'ADD_TO_CART':
      const existingItemIndex = state.cart.findIndex(
        (item) => item.id === action.payload.id
      );
      if (existingItemIndex > -1) {
        const newCart = [...state.cart];
        newCart[existingItemIndex].quantity += action.payload.quantity;
        return { ...state, cart: newCart };
      }
      return { ...state, cart: [...state.cart, action.payload] };
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        cart: state.cart.filter((item) => item.id !== action.payload)
      };
    case 'UPDATE_CART_QUANTITY':
      return {
        ...state,
        cart: state.cart.map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
}>({
  state: initialState,
  dispatch: () => null
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
