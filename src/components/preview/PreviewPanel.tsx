import { useState, useEffect } from 'react';
import { X, ExternalLink, Download } from 'lucide-react';
import { useExplorerStore } from '@/store/useExplorerStore';
import { useLocalFiles } from '@/hooks/useLocalFiles';
import { Button } from '@/components/common/Button';
import { Spinner } from '@/components/common/Spinner';
import { MarkdownPreview } from './MarkdownPreview';
import { ImagePreview } from './ImagePreview';
import { TextPreview } from './TextPreview';
import { PdfPreview } from './PdfPreview';
import { formatFileSize, getFileExtension, isImageFile, isPdfFile, isTextFile } from '@/utils/fileHelpers';
import type { FileNode } from '@/types/file';

interface PreviewPanelProps {
  file: FileNode;
}

export function PreviewPanel({ file }: PreviewPanelProps) {
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { setPreviewFile } = useExplorerStore();
  const { getRawUrl, getFileContent } = useLocalFiles();

  const rawUrl = getRawUrl(file.path);
  const extension = getFileExtension(file.name);

  useEffect(() => {
    const loadContent = async () => {
      if (isImageFile(file.name) || isPdfFile(file.name)) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const data = await getFileContent(file.path);
        setContent(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load file content');
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, [file.path, file.name, getFileContent]);

  const renderPreview = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <Spinner />
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-full text-destructive">
          <p>{error}</p>
        </div>
      );
    }

    if (isImageFile(file.name)) {
      return <ImagePreview url={rawUrl} alt={file.name} />;
    }

    if (isPdfFile(file.name)) {
      return <PdfPreview url={rawUrl} filename={file.name} />;
    }

    if (extension === 'md') {
      return <MarkdownPreview content={content} />;
    }

    if (isTextFile(file.name)) {
      return <TextPreview content={content} filename={file.name} />;
    }

    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <p>Preview not available for this file type</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => window.open(rawUrl, '_blank')}
        >
          <ExternalLink size={16} className="mr-2" />
          Open file
        </Button>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="min-w-0">
          <h3 className="font-medium truncate" title={file.name}>
            {file.name}
          </h3>
          {file.size !== undefined && (
            <p className="text-xs text-muted-foreground">
              {formatFileSize(file.size)}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => window.open(rawUrl, '_blank')}
            title="Open in new tab"
          >
            <ExternalLink size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              const a = document.createElement('a');
              a.href = rawUrl;
              a.download = file.name;
              a.click();
            }}
            title="Download"
          >
            <Download size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setPreviewFile(null)}
            title="Close preview"
          >
            <X size={16} />
          </Button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-hidden">
        {renderPreview()}
      </div>
    </div>
  );
}
