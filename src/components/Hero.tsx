'use client';

import { useImageLoader } from '@/lib/hooks/use-image-loader';

const HERO_IMAGE = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3";

export default function Hero() {
  const imageLoaded = useImageLoader(HERO_IMAGE);

  return (
    <section className="relative h-[700px]">
      <div className="absolute inset-0">
        {/* Loading Skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}
        
        {/* Hero Image */}
        <div 
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-500 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ 
            backgroundImage: `url(${HERO_IMAGE})`,
            transform: 'translate3d(0, 0, 0)',
            willChange: 'transform'
          }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      </div>
      <div className="relative container mx-auto px-6 h-full flex items-center">
        <div className="max-w-3xl text-white">
          <div className="inline-block mb-6">
            <span className="bg-yellow-400 text-black px-6 py-2 rounded-full text-lg font-semibold uppercase tracking-wider">
              30% Popusta na prvu kupovinu
            </span>
          </div>
          <h2 className="text-6xl font-bold mb-6 leading-tight">Sve za vaš dom - na klik do vas!</h2>
          <p className="text-2xl mb-10 text-gray-100">Otkrijte našu premium kolekciju proizvoda za moderan i udoban dom po najpovoljnijim cenama.</p>
          <div className="flex space-x-6">
            <button className="border-2 border-white text-white px-10 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-black transition-all transform hover:scale-105">
              Istražite ponudu
            </button>
            <button className="bg-yellow-400 text-black px-10 py-4 rounded-full text-lg font-semibold hover:bg-yellow-300 transition-all transform hover:scale-105">
              Kupite odmah
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}