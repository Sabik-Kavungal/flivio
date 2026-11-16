import React, { useEffect, useRef, useState } from 'react';
import { Shirt } from 'lucide-react';
import { getCachedResolvedImage, resolveImageKey } from '../../db/imageDb';

interface ResolvedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt: string;
  fallbackLabel?: string;
  containerClassName?: string;
  priority?: boolean;
}

export const ResolvedImage: React.FC<ResolvedImageProps> = ({
  src,
  alt,
  fallbackLabel,
  className = 'w-full h-full object-cover',
  containerClassName = 'w-full h-full',
  loading = 'lazy',
  priority = false,
  ...rest
}) => {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [resolvedSrc, setResolvedSrc] = useState<string>(() => {
    if (!src) return '';
    return getCachedResolvedImage(src) ?? (src.startsWith('idb://') ? '' : src);
  });
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    setHasError(false);

    if (!src) {
      setResolvedSrc('');
      setIsLoaded(false);
      return;
    }

    if (!src.startsWith('idb://')) {
      setResolvedSrc(src);
      return;
    }

    const cached = getCachedResolvedImage(src);
    if (cached) {
      setResolvedSrc(cached);
      return;
    }

    setIsLoaded(false);
    resolveImageKey(src).then((url) => {
      if (active) {
        setResolvedSrc(url);
        if (!url) setHasError(true);
      }
    });

    return () => {
      active = false;
    };
  }, [src]);

  // If browser already cached the image synchronously, show immediately with zero fade delay
  useEffect(() => {
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setIsLoaded(true);
    }
  }, [resolvedSrc]);

  if (!src || hasError || (!resolvedSrc && !src.startsWith('idb://'))) {
    return (
      <div
        className={`${containerClassName} bg-[#F7F6F2] flex flex-col items-center justify-center text-[#86888E] p-4 text-center select-none`}
        aria-label={alt}
      >
        <Shirt className="w-7 h-7 stroke-[1.25] mb-2 opacity-60" />
        <span className="text-[11px] tracking-wide uppercase font-medium line-clamp-2 max-w-[140px]">
          {fallbackLabel || alt || 'FLIVIO'}
        </span>
      </div>
    );
  }

  if (!resolvedSrc) {
    return <div className={`${containerClassName} skeleton-shimmer`} />;
  }

  return (
    <img
      ref={imgRef}
      src={resolvedSrc}
      alt={alt}
      loading={priority ? 'eager' : loading}
      decoding={priority ? 'sync' : 'async'}
      fetchPriority={priority ? 'high' : 'auto'}
      referrerPolicy="no-referrer"
      onLoad={() => setIsLoaded(true)}
      onError={() => setHasError(true)}
      className={`${className} transition-opacity duration-200 ${
        isLoaded || priority ? 'opacity-100' : 'opacity-90'
      }`}
      {...rest}
    />
  );
};
