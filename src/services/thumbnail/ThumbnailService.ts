import type { FileNode } from '@/types/file';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.mjs';

export interface ThumbnailOptions {
  width: number;
  height: number;
  quality: number;
}

const DEFAULT_OPTIONS: ThumbnailOptions = {
  width: 120,
  height: 160,
  quality: 0.8
};

export class ThumbnailService {
  private thumbnailCache: Map<string, string>;
  private options: ThumbnailOptions;

  constructor(options: Partial<ThumbnailOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.thumbnailCache = new Map();
  }

  async generateThumbnail(file: FileNode, rawUrl: string): Promise<string | null> {
    const cached = this.thumbnailCache.get(file.sha);
    if (cached) return cached;

    const extension = this.getFileExtension(file.name);
    let thumbnail: string | null = null;

    try {
      switch (extension) {
        case 'pdf':
          thumbnail = await this.generatePdfThumbnail(rawUrl);
          break;
        case 'png':
        case 'jpg':
        case 'jpeg':
        case 'gif':
        case 'webp':
        case 'svg':
          thumbnail = await this.generateImageThumbnail(rawUrl);
          break;
        case 'md':
        case 'txt':
          thumbnail = await this.generateTextThumbnail(rawUrl);
          break;
        default:
          thumbnail = this.getDefaultThumbnail(extension);
      }

      if (thumbnail) {
        this.thumbnailCache.set(file.sha, thumbnail);
      }
    } catch (error) {
      console.error(`Error generating thumbnail for ${file.name}:`, error);
    }

    return thumbnail;
  }

  private async generatePdfThumbnail(url: string): Promise<string | null> {
    try {
      const pdf = await pdfjsLib.getDocument(url).promise;
      const page = await pdf.getPage(1);

      const viewport = page.getViewport({ scale: 1 });
      const scale = Math.min(
        this.options.width / viewport.width,
        this.options.height / viewport.height
      );
      const scaledViewport = page.getViewport({ scale });

      const canvas = document.createElement('canvas');
      canvas.width = scaledViewport.width;
      canvas.height = scaledViewport.height;

      const context = canvas.getContext('2d');
      if (!context) return null;

      await page.render({
        canvasContext: context,
        viewport: scaledViewport,
        canvas
      }).promise;

      return canvas.toDataURL('image/jpeg', this.options.quality);
    } catch (error) {
      console.error('PDF thumbnail generation failed:', error);
      return null;
    }
  }

  private async generateImageThumbnail(url: string): Promise<string | null> {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = Math.min(
          this.options.width / img.width,
          this.options.height / img.height
        );

        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', this.options.quality));
      };

      img.onerror = () => resolve(null);
      img.src = url;
    });
  }

  private async generateTextThumbnail(url: string): Promise<string | null> {
    try {
      const response = await fetch(url);
      const text = await response.text();
      const preview = text.slice(0, 500);

      const canvas = document.createElement('canvas');
      canvas.width = this.options.width;
      canvas.height = this.options.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#333333';
      ctx.font = '8px monospace';

      const lines = preview.split('\n').slice(0, 20);
      lines.forEach((line, i) => {
        ctx.fillText(line.slice(0, 30), 4, 12 + i * 8);
      });

      return canvas.toDataURL('image/jpeg', this.options.quality);
    } catch {
      return null;
    }
  }

  private getDefaultThumbnail(extension: string): string | null {
    const iconColor = this.getFileTypeColor(extension);
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="120" height="160" viewBox="0 0 120 160">
        <rect width="120" height="160" fill="#f5f5f5"/>
        <rect x="20" y="20" width="80" height="100" fill="white" stroke="#ddd"/>
        <text x="60" y="140" text-anchor="middle" fill="${iconColor}" font-size="14" font-weight="bold">
          .${extension.toUpperCase()}
        </text>
      </svg>
    `;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  private getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  }

  private getFileTypeColor(extension: string): string {
    const colors: Record<string, string> = {
      pdf: '#e74c3c',
      doc: '#2980b9',
      docx: '#2980b9',
      xls: '#27ae60',
      xlsx: '#27ae60',
      ppt: '#e67e22',
      pptx: '#e67e22',
      md: '#7f8c8d',
      txt: '#95a5a6',
      html: '#e44d26',
      css: '#264de4',
      js: '#f7df1e',
      ts: '#3178c6',
      json: '#000000'
    };
    return colors[extension] || '#7f8c8d';
  }

  clearCache(): void {
    this.thumbnailCache.clear();
  }
}

export const thumbnailService = new ThumbnailService();
