'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { supabase } from '@/lib/supabase/client';
import { useCart } from '@/lib/hooks/use-cart'; // Pretpostavljeni hook za korpu
import toast from 'react-hot-toast';

// Tip za podatke o kupcu
type CustomerData = {
  ime_kupca: string;
  prezime_kupca: string;
  email: string;
  adresa: string;
  mesto: string;
  id_post: string;
  telefon: string; // Dodatno polje koje možda želite da dodate
};

export default function CheckoutPage() {
  const { user, userProfile } = useAuth();
  const { cart, clearCart, totalPrice } = useCart();
  const [loading, setLoading] = useState(false);
  const [customerData, setCustomerData] = useState<CustomerData>({
    ime_kupca: userProfile?.ime_kupca || '',
    prezime_kupca: userProfile?.prezime_kupca || '',
    email: userProfile?.email || '',
    adresa: userProfile?.adresa || '',
    mesto: userProfile?.mesto || '',
    id_post: userProfile?.id_post || '',
    telefon: ''
  });

  // Funkcija za ažuriranje podataka o kupcu
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomerData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Funkcija za validaciju forme
  const validateForm = () => {
    const requiredFields = [
      'ime_kupca',
      'prezime_kupca',
      'adresa',
      'mesto',
      'id_post',
      'telefon'
    ];

    for (const field of requiredFields) {
      if (!customerData[field as keyof CustomerData]) {
        toast.error(`Polje ${field.replace('_', ' ')} je obavezno`);
        return false;
      }
    }

    // Validacija email-a ako je unet
    if (
      customerData.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerData.email)
    ) {
      toast.error('Email adresa nije validna');
      return false;
    }

    return true;
  };

  // Funkcija za slanje porudžbine
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;
    if (cart.length === 0) {
      toast.error('Vaša korpa je prazna');
      return;
    }

    setLoading(true);

    try {
      let kupacId;

      // Ako je korisnik prijavljen, koristimo njegov ID
      if (user) {
        kupacId = user.id;

        // Ažuriramo podatke o korisniku ako su se promenili
        if (
          userProfile?.ime_kupca !== customerData.ime_kupca ||
          userProfile?.prezime_kupca !== customerData.prezime_kupca ||
          userProfile?.adresa !== customerData.adresa ||
          userProfile?.mesto !== customerData.mesto ||
          userProfile?.id_post !== customerData.id_post
        ) {
          const { error: updateError } = await supabase
            .from('kupci')
            .update({
              ime_kupca: customerData.ime_kupca,
              prezime_kupca: customerData.prezime_kupca,
              adresa: customerData.adresa,
              mesto: customerData.mesto,
              id_post: customerData.id_post
            })
            .eq('id', user.id);

          if (updateError) {
            console.error(
              'Greška pri ažuriranju podataka o kupcu:',
              updateError
            );
            toast.error('Greška pri ažuriranju podataka o kupcu');
            setLoading(false);
            return;
          }
        }
      } else {
        // Ako korisnik nije prijavljen, proveravamo da li postoji kupac sa datim email-om
        if (customerData.email) {
          const { data: existingCustomer, error: fetchError } =
            await supabase.rpc('dohvati_kupca_po_email', {
              p_email: customerData.email
            });

          if (fetchError) {
            console.error('Greška pri proveri postojećeg kupca:', fetchError);
          } else if (existingCustomer && existingCustomer.length > 0) {
            // Koristimo postojećeg kupca
            kupacId = existingCustomer[0].id;

            // Ažuriramo podatke o kupcu
            const { error: updateError } = await supabase
              .from('kupci')
              .update({
                ime_kupca: customerData.ime_kupca,
                prezime_kupca: customerData.prezime_kupca,
                adresa: customerData.adresa,
                mesto: customerData.mesto,
                id_post: customerData.id_post
              })
              .eq('id', kupacId);

            if (updateError) {
              console.error(
                'Greška pri ažuriranju podataka o kupcu:',
                updateError
              );
            }
          }
        }

        // Ako kupac ne postoji, kreiramo novog
        if (!kupacId) {
          const { data: newCustomer, error: createError } = await supabase.rpc(
            'dodaj_kupca',
            {
              p_ime_kupca: customerData.ime_kupca,
              p_prezime_kupca: customerData.prezime_kupca,
              p_email: customerData.email || null,
              p_adresa: customerData.adresa,
              p_mesto: customerData.mesto,
              p_id_post: customerData.id_post
            }
          );

          if (createError) {
            console.error('Greška pri kreiranju novog kupca:', createError);
            toast.error('Greška pri kreiranju novog kupca');
            setLoading(false);
            return;
          }

          kupacId = newCustomer;
        }
      }

      // Kreiramo porudžbinu
      const { data: order, error: orderError } = await supabase
        .from('porudzbine')
        .insert({
          id_kupca: kupacId,
          cena_ukupno: totalPrice,
          status_porudzbine: 'Obrada'
        })
        .select()
        .single();

      if (orderError) {
        console.error('Greška pri kreiranju porudžbine:', orderError);
        toast.error('Greška pri kreiranju porudžbine');
        setLoading(false);
        return;
      }

      // Dodajemo stavke porudžbine
      const orderItems = cart.map((item) => ({
        id_porudzbine: order.id,
        id_proizvoda: item.id,
        kolicina: item.quantity,
        cena: item.cena
      }));

      const { error: itemsError } = await supabase
        .from('stavke_porudzbine')
        .insert(orderItems);

      if (itemsError) {
        console.error('Greška pri dodavanju stavki porudžbine:', itemsError);
        toast.error('Greška pri dodavanju stavki porudžbine');
        setLoading(false);
        return;
      }

      // Uspešno kreirana porudžbina
      toast.success('Porudžbina je uspešno kreirana!');
      clearCart();

      // Preusmeravamo na stranicu sa potvrdom porudžbine
      window.location.href = `/narudzbine/${order.id}`;
    } catch (error) {
      console.error('Greška pri kreiranju porudžbine:', error);
      toast.error('Došlo je do greške pri kreiranju porudžbine');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='container mx-auto py-8'>
      <h1 className='text-2xl font-bold mb-6'>Završite kupovinu</h1>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
        {/* Forma za podatke o kupcu */}
        <div className='bg-white p-6 rounded-lg shadow'>
          <h2 className='text-xl font-semibold mb-4'>Podaci o kupcu</h2>

          <form onSubmit={handleSubmitOrder}>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Ime*
                </label>
                <input
                  type='text'
                  name='ime_kupca'
                  value={customerData.ime_kupca}
                  onChange={handleInputChange}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md'
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Prezime*
                </label>
                <input
                  type='text'
                  name='prezime_kupca'
                  value={customerData.prezime_kupca}
                  onChange={handleInputChange}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md'
                  required
                />
              </div>
            </div>

            <div className='mb-4'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Email {!user && '(nije obavezno)'}
              </label>
              <input
                type='email'
                name='email'
                value={customerData.email}
                onChange={handleInputChange}
                className='w-full px-3 py-2 border border-gray-300 rounded-md'
                disabled={!!user} // Onemogućeno ako je korisnik prijavljen
              />
              {!user && (
                <p className='text-sm text-gray-500 mt-1'>
                  Ako unesete email, možete pratiti status vaše porudžbine
                </p>
              )}
            </div>

            <div className='mb-4'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Telefon*
              </label>
              <input
                type='tel'
                name='telefon'
                value={customerData.telefon}
                onChange={handleInputChange}
                className='w-full px-3 py-2 border border-gray-300 rounded-md'
                required
              />
            </div>

            <div className='mb-4'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Adresa*
              </label>
              <input
                type='text'
                name='adresa'
                value={customerData.adresa}
                onChange={handleInputChange}
                className='w-full px-3 py-2 border border-gray-300 rounded-md'
                required
              />
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Mesto*
                </label>
                <input
                  type='text'
                  name='mesto'
                  value={customerData.mesto}
                  onChange={handleInputChange}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md'
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Poštanski broj*
                </label>
                <input
                  type='text'
                  name='id_post'
                  value={customerData.id_post}
                  onChange={handleInputChange}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md'
                  required
                />
              </div>
            </div>

            <button
              type='submit'
              className='w-full bg-yellow-500 text-white py-3 px-4 rounded-md font-medium hover:bg-yellow-600 transition-colors'
              disabled={loading}
            >
              {loading ? 'Obrada...' : 'Potvrdite porudžbinu'}
            </button>
          </form>
        </div>

        {/* Pregled korpe */}
        <div className='bg-white p-6 rounded-lg shadow'>
          <h2 className='text-xl font-semibold mb-4'>Vaša korpa</h2>

          {cart.length === 0 ? (
            <p className='text-gray-500'>Vaša korpa je prazna</p>
          ) : (
            <>
              <div className='space-y-4 mb-6'>
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className='flex items-center border-b pb-4'
                  >
                    <div className='w-16 h-16 flex-shrink-0'>
                      <img
                        src={item.glavna_slika}
                        alt={item.naziv_proizvoda}
                        className='w-full h-full object-cover rounded'
                      />
                    </div>
                    <div className='ml-4 flex-grow'>
                      <h3 className='font-medium'>{item.naziv_proizvoda}</h3>
                      <p className='text-gray-500'>
                        {item.quantity} x {item.cena.toLocaleString()} RSD
                      </p>
                    </div>
                    <div className='font-semibold'>
                      {(item.quantity * item.cena).toLocaleString()} RSD
                    </div>
                  </div>
                ))}
              </div>

              <div className='border-t pt-4'>
                <div className='flex justify-between mb-2'>
                  <span>Ukupno proizvodi:</span>
                  <span className='font-semibold'>
                    {totalPrice.toLocaleString()} RSD
                  </span>
                </div>
                <div className='flex justify-between mb-2'>
                  <span>Dostava:</span>
                  <span className='font-semibold'>390 RSD</span>
                </div>
                <div className='flex justify-between text-lg font-bold mt-2 pt-2 border-t'>
                  <span>UKUPNO:</span>
                  <span className='text-yellow-600'>
                    {(totalPrice + 390).toLocaleString()} RSD
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
