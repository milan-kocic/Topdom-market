'use client';

interface PromoBannerProps {
  title: string;
  description: string;
  bgColor: string;
  icon: 'discount' | 'loyalty';
}

export default function PromoBanner({ 
  title, 
  description, 
  bgColor, 
  icon 
}: PromoBannerProps) {
  return (
    <div className={`${bgColor} rounded-xl p-10 transition-all duration-300 hover:scale-[1.02] group`}>
      <h3 className="text-3xl font-bold mb-4">{title}</h3>
      <p className="text-gray-700 text-lg mb-6">{description}</p>
      <button className="bg-black text-white px-8 py-3 rounded-full text-lg font-medium group-hover:bg-gray-800 transition-colors transform hover:scale-105">
        Saznaj više
      </button>
    </div>
  );
}