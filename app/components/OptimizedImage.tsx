'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useLazyImage } from './PerformanceProvider';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholder?: string;
  className?: string;
  priority?: boolean;
}

export default function OptimizedImage({ 
  src, 
  alt, 
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZWVlIi8+PC9zdmc+',
  className = '',
  priority = false,
  ...props 
}: OptimizedImageProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const { observeImage } = useLazyImage();
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const img = imgRef.current;
    if (!img || priority) return;

    // Set up lazy loading
    img.dataset.src = src;
    if (src !== placeholder) {
      img.src = placeholder;
    }

    observeImage(img);

    return () => {
      // Cleanup is handled by the LazyImageLoader
    };
  }, [src, placeholder, priority, observeImage]);

  useEffect(() => {
    if (priority && imgRef.current) {
      // Load immediately for priority images
      imgRef.current.src = src;
    }
  }, [src, priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(false);
  };

  return (
    <img
      ref={imgRef}
      src={priority ? src : placeholder}
      alt={alt}
      className={`transition-opacity duration-300 ${
        isLoaded ? 'opacity-100' : 'opacity-70'
      } ${hasError ? 'bg-gray-200' : ''} ${className}`}
      onLoad={handleLoad}
      onError={handleError}
      loading={priority ? 'eager' : 'lazy'}
      {...props}
    />
  );
}