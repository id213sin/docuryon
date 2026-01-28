import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/common/Button';

interface PdfPreviewProps {
  url: string;
  filename: string;
}

export function PdfPreview({ url, filename }: PdfPreviewProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 relative">
        <iframe
          src={`${url}#view=FitH`}
          className="absolute inset-0 w-full h-full border-0"
          title={filename}
        />
      </div>
      <div className="p-2 border-t border-border flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(url, '_blank')}
        >
          <ExternalLink size={16} className="mr-2" />
          Open in new tab
        </Button>
      </div>
    </div>
  );
}
