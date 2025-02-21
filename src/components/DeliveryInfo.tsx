'use client';

import { motion } from 'framer-motion';
import { Truck, CreditCard, Clock, Headphones } from 'lucide-react';

const features = [
  {
    icon: Truck,
    title: 'Brza dostava',
    description: 'Isporuka u roku od 24-48h',
    color: 'text-yellow-500',
  },
  {
    icon: CreditCard,
    title: 'Sigurno plaćanje',
    description: 'Više načina plaćanja',
    color: 'text-yellow-500',
  },
  {
    icon: Clock,
    title: 'Besplatna dostava',
    description: 'Za porudžbine preko 10.000 RSD',
    color: 'text-yellow-500',
  },
  {
    icon: Headphones,
    title: 'Korisnička podrška',
    description: 'Dostupni smo 24/7',
    color: 'text-yellow-500',
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

export default function DeliveryInfo() {
  return (
    <section className="py-8 bg-white">
      <div className="container mx-auto px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="flex items-center justify-center space-x-4 p-4 rounded-lg hover:bg-yellow-50 transition-colors duration-300"
              >
                <div className={`p-3 rounded-full bg-yellow-50 ${feature.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{feature.title}</h3>
                  <p className="text-sm text-gray-500">{feature.description}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}