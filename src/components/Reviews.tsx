'use client';

import { Star } from 'lucide-react';

const reviews = [
  {
    id: 1,
    name: 'Marija Petrović',
    rating: 5,
    comment: 'Odličan kvalitet proizvoda, brza dostava. Prezadovoljna sam!',
    date: '15.02.2024.',
  },
  {
    id: 2,
    name: 'Stefan Marković',
    rating: 5,
    comment: 'Sve preporuke za TOP DOM. Profesionalna usluga i sjajni proizvodi.',
    date: '14.02.2024.',
  },
  {
    id: 3,
    name: 'Ana Kovačević',
    rating: 4,
    comment: 'Veoma sam zadovoljna kupovinom. Definitivno ću opet kupovati.',
    date: '13.02.2024.',
  },
];

export default function Reviews() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold mb-16 text-center">Šta kažu naši kupci</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-xl shadow-lg p-8 transform transition-all duration-300 hover:scale-105"
            >
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
                {[...Array(5 - review.rating)].map((_, i) => (
                  <Star key={i + review.rating} className="h-5 w-5 text-gray-300" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic">&quot;{review.comment}&quot;</p>
              <div className="flex justify-between items-center">
                <span className="font-semibold">{review.name}</span>
                <span className="text-sm text-gray-500">{review.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}