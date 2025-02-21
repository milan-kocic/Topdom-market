'use client';

import { useImageLoader } from '@/lib/hooks/use-image-loader';

interface ProductCardProps {
  image?: string;
  title: string;
  price: string;
  oldPrice: string;
  description?: string;
}

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1585771724684-38269d6639fd?ixlib=rb-4.0.3";

export default function ProductCard({ 
  image = DEFAULT_IMAGE,
  title, 
  price, 
  oldPrice, 
  description 
}: ProductCardProps) {
  const imageLoaded = useImageLoader(image || DEFAULT_IMAGE);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300">
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        {/* Loading Skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}
        
        {/* Image */}
        <img 
          src={image || DEFAULT_IMAGE}
          alt={title}
          className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-110 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ transform: 'translate3d(0, 0, 0)' }}
        />
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
      </div>

      {/* Content Container */}
      <div className="p-6">
        {/* Title */}
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 min-h-[3.5rem]">{title}</h3>
        
        {/* Description */}
        {description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{description}</p>
        )}

        {/* Price */}
        <div className="flex items-baseline space-x-2 mb-4">
          <span className="text-2xl font-bold text-yellow-500">{price} RSD</span>
          <span className="text-sm text-gray-400 line-through">{oldPrice} RSD</span>
        </div>

        {/* Button */}
        <button className="w-full bg-yellow-400 text-black py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-colors transform hover:scale-105">
          Dodaj u korpu
        </button>
      </div>
    </div>
  );
}