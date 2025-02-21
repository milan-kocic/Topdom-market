'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

export default function Newsletter() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Uspešno ste se prijavili na newsletter!');
    setEmail('');
  };

  return (
    <section className="bg-yellow-50 py-20">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold mb-4">30% POPUSTA na vašu prvu porudžbinu!</h2>
        <p className="text-gray-600 mb-8 max-w-2xl mx-auto text-lg">
          Prijavite se na naš newsletter i budite prvi koji će saznati o novim proizvodima i specijalnim ponudama.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row max-w-md mx-auto gap-4">
          <input
            type="email"
            placeholder="Vaša email adresa"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-4 py-3 rounded-lg border-2 border-yellow-200 focus:outline-none focus:border-yellow-300"
            required
          />
          <button 
            type="submit"
            className="bg-yellow-400 text-black px-8 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-all transform hover:scale-105"
          >
            Prijavite se
          </button>
        </form>
      </div>
    </section>
  );
}