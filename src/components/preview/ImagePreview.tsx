import { useState } from 'react';
import { Spinner } from '@/components/common/Spinner';

interface ImagePreviewProps {
  url: string;
  alt: string;
}

export function ImagePreview({ url, alt }: ImagePreviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <div className="flex items-center justify-center h-full p-4">
      {isLoading && !error && <Spinner />}

      {error ? (
        <div className="text-center text-muted-foreground">
          <p>Failed to load image</p>
        </div>
      ) : (
        <img
          src={url}
          alt={alt}
          className="max-w-full max-h-full object-contain rounded shadow-lg"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setError(true);
          }}
          style={{ display: isLoading ? 'none' : 'block' }}
        />
      )}
    </div>
  );
}
