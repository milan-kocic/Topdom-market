'use client';

import PromoBanner from './PromoBanner';

export default function PromotionalBanners() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <PromoBanner
            title="Akcijska ponuda"
            description="Popust do 50% na određene proizvode"
            bgColor="bg-rose-100"
            icon="discount"
          />
          <PromoBanner
            title="Kupujte pametno"
            description="Sakupljajte poene i ostvarite dodatne popuste"
            bgColor="bg-yellow-100"
            icon="loyalty"
          />
        </div>
      </div>
    </section>
  );
}