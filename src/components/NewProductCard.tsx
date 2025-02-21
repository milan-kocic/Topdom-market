'use client';

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1585771724684-38269d6639fd?ixlib=rb-4.0.3";

interface NewProductCardProps {
  image?: string;
  title: string;
  description: string;
  price: string;
}

export default function NewProductCard({ 
  image = DEFAULT_IMAGE,
  title, 
  description, 
  price 
}: NewProductCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden group transform transition-all duration-300 hover:scale-105">
      <div className="relative h-64">
        <img 
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
        <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
          NOVO
        </div>
      </div>
      <div className="p-6">
        <h3 className="font-semibold text-xl mb-2">{title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{description}</p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-yellow-500">{price} RSD</span>
          <button className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors">
            Detaljnije
          </button>
        </div>
      </div>
    </div>
  );
}