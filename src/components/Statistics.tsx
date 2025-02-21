'use client';

import { motion, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

interface CountUpAnimationProps {
  target: number;
  label: string;
}

function CountUpAnimation({ target, label }: CountUpAnimationProps) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref);

  useEffect(() => {
    if (isInView) {
      let startTime: number;
      const duration = 2000;

      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime;
        const progress = (currentTime - startTime) / duration;

        if (progress < 1) {
          setCount(Math.floor(target * progress));
          requestAnimationFrame(animate);
        } else {
          setCount(target);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [isInView, target]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      <div className="text-3xl font-bold text-yellow-500 mb-1">
        {count}
        {target === 99 ? '%' : target >= 1000 ? 'k+' : '+'}
      </div>
      <div className="text-gray-600 text-sm font-medium">{label}</div>
    </motion.div>
  );
}

export default function Statistics() {
  return (
    <section className="py-12 border-b border-gray-100">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <CountUpAnimation target={15} label="Godina iskustva" />
          <CountUpAnimation target={10000} label="Proizvoda u ponudi" />
          <CountUpAnimation target={50000} label="Zadovoljnih kupaca" />
          <CountUpAnimation target={99} label="Pozitivnih recenzija" />
        </div>
      </div>
    </section>
  );
}