import { ShoppingCart, User } from 'lucide-react';
import Link from 'next/link';

export default function Header() {
  return (
    <header className='sticky top-0 z-50 bg-white shadow-md'>
      <nav className='container mx-auto px-4 py-3 flex items-center justify-between'>
        <Link href='/' className='text-xl font-bold'>
          TopDom Market
        </Link>
        <div className='flex items-center gap-4'>
          <Link href='/cart' className='flex items-center gap-2'>
            <ShoppingCart />
            Cart
          </Link>
          <Link href='/account' className='flex items-center gap-2'>
            <User />
            Account
          </Link>
        </div>
      </nav>
    </header>
  );
}
