import { useState, useEffect } from 'react';
import { renderMarkdown } from '@/services/renderer';
import { Spinner } from '@/components/common/Spinner';

interface MarkdownPreviewProps {
  content: string;
}

export function MarkdownPreview({ content }: MarkdownPreviewProps) {
  const [html, setHtml] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    try {
      const rendered = renderMarkdown(content);
      setHtml(rendered);
    } catch (error) {
      console.error('Error rendering markdown:', error);
      setHtml('<p class="text-destructive">Error rendering markdown</p>');
    } finally {
      setIsLoading(false);
    }
  }, [content]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner />
      </div>
    );
  }

  return (
    <div
      className="prose prose-sm dark:prose-invert max-w-none p-4"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
