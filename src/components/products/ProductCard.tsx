import Image from 'next/image';
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: string) => void;
}

export default function ProductCard({
  product,
  onAddToCart
}: ProductCardProps) {
  return (
    <div className='border rounded-lg p-4 shadow-sm hover:shadow-md transition'>
      <div className='relative h-48 mb-4'>
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className='object-cover rounded-md'
        />
      </div>
      <h3 className='text-lg font-semibold'>{product.name}</h3>
      <p className='text-gray-600 mb-2'>{product.description}</p>
      <div className='flex justify-between items-center'>
        <span className='text-xl font-bold'>${product.price}</span>
        <button
          onClick={() => onAddToCart(product.id)}
          className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600'
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
