import React from 'react';
import { Layout } from './components/layout/Layout';
import { AppProvider } from './context/AppContext';
import { Hero } from './components/Hero';
import { BestSellers } from './components/BestSellers';
import { PromotionalBanners } from './components/PromotionalBanners';
import { Newsletter } from './components/Newsletter';

function App() {
  return (
    <AppProvider>
      <Layout>
        <Hero />
        <BestSellers />
        <PromotionalBanners />
        <Newsletter />
      </Layout>
    </AppProvider>
  );
}

export default App;
