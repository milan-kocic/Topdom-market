'use client';

import { useState, useEffect, useMemo } from 'react';

// Get the Image constructor from the global scope
const ImageConstructor = typeof window !== 'undefined' ? window.Image : null;

const imageCache = new Map<string, boolean>();

export function useImageLoader(src: string) {
  const [isLoaded, setIsLoaded] = useState(() => imageCache.get(src) || false);

  const image = useMemo(() => {
    if (!ImageConstructor) return null;
    const img = new ImageConstructor();
    img.src = src;
    return img;
  }, [src]);

  useEffect(() => {
    if (!image) return;
    
    if (imageCache.get(src)) {
      setIsLoaded(true);
      return;
    }

    const handleLoad = () => {
      imageCache.set(src, true);
      setIsLoaded(true);
    };

    if (image.complete) {
      handleLoad();
    } else {
      image.addEventListener('load', handleLoad);
    }

    return () => {
      image.removeEventListener('load', handleLoad);
    };
  }, [src, image]);

  return isLoaded;
}