'use client';

import TopBar from '@/components/TopBar';
import SearchBar from '@/components/SearchBar';
import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import DeliveryInfo from '@/components/DeliveryInfo';
import ProductCarousel from '@/components/ProductCarousel';
import NewProducts from '@/components/NewProducts';
import PromotionalBanners from '@/components/PromotionalBanners';
import Reviews from '@/components/Reviews';
import ContactForm from '@/components/ContactForm';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <TopBar />
      <SearchBar />
      <Navigation />
      <Hero />
      <DeliveryInfo />
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold mb-16 text-center">Top ponuda</h2>
          <ProductCarousel />
        </div>
      </section>
      <NewProducts />
      <PromotionalBanners />
      <Reviews />
      <ContactForm />
      <Footer />
    </div>
  );
}