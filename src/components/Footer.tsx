'use client';

import { Facebook, Instagram, Youtube, Phone, Mail, Clock, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-6">
        {/* Main Footer */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-semibold mb-6">O nama</h3>
            <p className="text-gray-400 mb-6">
              TOP DOM je vaš pouzdani partner za opremanje doma već više od 10 godina. Nudimo vrhunske proizvode po najpovoljnijim cenama.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-6 w-6" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-6 w-6" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Youtube className="h-6 w-6" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Brzi linkovi</h3>
            <ul className="space-y-4">
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">O nama</Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">Proizvodi</Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">Akcije</Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">Blog</Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">Kontakt</Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Kontakt</h3>
            <ul className="space-y-4">
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-yellow-400" />
                <span className="text-gray-400">+381 11 123 4567</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-yellow-400" />
                <span className="text-gray-400">info@topdom.rs</span>
              </li>
              <li className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-yellow-400" />
                <span className="text-gray-400">Pon - Pet: 09:00 - 20:00</span>
              </li>
              <li className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-yellow-400" />
                <span className="text-gray-400">Bulevar Oslobođenja 123, Beograd</span>
              </li>
            </ul>
          </div>

          {/* Payment Methods */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Načini plaćanja</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white text-black px-4 py-2 rounded text-sm font-medium text-center">
                VISA
              </div>
              <div className="bg-white text-black px-4 py-2 rounded text-sm font-medium text-center">
                MASTERCARD
              </div>
              <div className="bg-white text-black px-4 py-2 rounded text-sm font-medium text-center">
                PAYPAL
              </div>
              <div className="bg-white text-black px-4 py-2 rounded text-sm font-medium text-center">
                POUZEĆEM
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-800 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} TOP DOM. Sva prava zadržana.
            </p>
            <div className="flex space-x-6">
              <Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                Uslovi korišćenja
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                Politika privatnosti
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                Reklamacije
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}