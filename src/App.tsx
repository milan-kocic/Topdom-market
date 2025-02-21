import React from 'react';
import { ShoppingCart, Search, Heart, Menu, ChevronDown, Facebook, Instagram, Youtube } from 'lucide-react';
import { useState } from 'react';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Top Bar */}
      <div className="bg-black text-white text-sm py-2 px-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <span className="text-red-500 font-semibold">Rasporadaja se završava: 00:00:00</span>
            <span className="bg-red-500 px-3 py-1 rounded-full text-xs">Specijalna ponuda</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 bg-white shadow-md z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-8">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden">
                <Menu className="h-6 w-6" />
              </button>
              <h1 className="text-2xl font-bold">TOP DOM</h1>
              <div className="hidden lg:flex space-x-6">
                <NavItem title="Kućni aparati" />
                <NavItem title="Kuhinja i posuđe" />
                <NavItem title="Dekoracija" />
                <NavItem title="Organizacija" />
                <NavItem title="Održavanje" />
                <NavItem title="Lifestyle" />
                <NavItem title="Akcije" isHighlighted />
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <Search className="h-5 w-5" />
              <Heart className="h-5 w-5" />
              <ShoppingCart className="h-5 w-5" />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-[600px]">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3"
            alt="Happy family in modern kitchen"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        </div>
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl text-white">
            <h2 className="text-5xl font-bold mb-6">Sve za vaš dom - na klik do vas!</h2>
            <p className="text-xl mb-8">Otkrijte našu premium kolekciju proizvoda za moderan i udoban dom.</p>
            <button className="bg-yellow-400 text-black px-8 py-4 rounded-full font-semibold hover:bg-yellow-300 transition-colors">
              Istražite ponudu
            </button>
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Najprodavaniji proizvodi</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <ProductCard
              image="https://images.unsplash.com/photo-1585771724684-38269d6639fd?ixlib=rb-4.0.3"
              title="Smart Blender Pro"
              price="12999"
              oldPrice="15999"
            />
            <ProductCard
              image="https://images.unsplash.com/photo-1621972750749-0fbb1abb7736?ixlib=rb-4.0.3"
              title="Eco Posuđe Set"
              price="8999"
              oldPrice="11999"
            />
            <ProductCard
              image="https://images.unsplash.com/photo-1597072689227-8882273e8f6a?ixlib=rb-4.0.3"
              title="Organizator Plus"
              price="4999"
              oldPrice="6999"
            />
            <ProductCard
              image="https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?ixlib=rb-4.0.3"
              title="Aroma Difuzor"
              price="3999"
              oldPrice="5999"
            />
          </div>
        </div>
      </section>

      {/* Promotional Banners */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <PromoBanner
              title="Akcijska ponuda"
              description="Popust do 50% na određene proizvode"
              bgColor="bg-rose-100"
            />
            <PromoBanner
              title="Kupujte pametno"
              description="Sakupljajte poene i ostvarite dodatne popuste"
              bgColor="bg-yellow-100"
            />
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-yellow-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">30% POPUSTA na vašu prvu porudžbinu!</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Prijavite se na naš newsletter i budite prvi koji će saznati o novim proizvodima i specijalnim ponudama.
          </p>
          <div className="flex max-w-md mx-auto">
            <input
              type="email"
              placeholder="Vaša email adresa"
              className="flex-1 px-4 py-3 rounded-l-lg border-2 border-r-0 border-yellow-200 focus:outline-none focus:border-yellow-300"
            />
            <button className="bg-yellow-400 text-black px-6 py-3 rounded-r-lg font-semibold hover:bg-yellow-300 transition-colors">
              Prijavite se
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <h3 className="text-lg font-semibold mb-4">O nama</h3>
              <p className="text-gray-400">
                TOP DOM je vaš pouzdani partner za opremanje doma već više od 10 godina.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Korisni linkovi</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Česta pitanja</li>
                <li>Uslovi kupovine</li>
                <li>Dostava i plaćanje</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Pratite nas</h3>
              <div className="flex space-x-4">
                <Facebook className="h-6 w-6" />
                <Instagram className="h-6 w-6" />
                <Youtube className="h-6 w-6" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Plaćanje</h3>
              <div className="flex space-x-4">
                <span className="bg-white text-black px-3 py-1 rounded text-sm">VISA</span>
                <span className="bg-white text-black px-3 py-1 rounded text-sm">MASTER</span>
                <span className="bg-white text-black px-3 py-1 rounded text-sm">PayPal</span>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 TOP DOM. Sva prava zadržana.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function NavItem({ title, isHighlighted = false }) {
  return (
    <div className="relative group">
      <button className={`flex items-center space-x-1 ${isHighlighted ? 'text-red-500' : ''}`}>
        <span>{title}</span>
        <ChevronDown className="h-4 w-4" />
      </button>
    </div>
  );
}

function ProductCard({ image, title, price, oldPrice }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden group">
      <div className="relative">
        <img src={image} alt={title} className="w-full h-64 object-cover" />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2">{title}</h3>
        <div className="flex items-center space-x-2">
          <span className="text-xl font-bold">{price} RSD</span>
          <span className="text-gray-400 line-through text-sm">{oldPrice} RSD</span>
        </div>
        <button className="w-full mt-4 bg-yellow-400 text-black py-2 rounded font-semibold hover:bg-yellow-300 transition-colors">
          Dodaj u korpu
        </button>
      </div>
    </div>
  );
}

function PromoBanner({ title, description, bgColor }) {
  return (
    <div className={`${bgColor} rounded-lg p-8 transition-transform hover:scale-[1.02]`}>
      <h3 className="text-2xl font-bold mb-2">{title}</h3>
      <p className="text-gray-700">{description}</p>
      <button className="mt-4 bg-black text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors">
        Saznaj više
      </button>
    </div>
  );
}

export default App;