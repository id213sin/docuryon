# GitHub Document Explorer - Project Plan

## 📋 Project Overview

A self-hosted document management system deployed on GitHub Pages that functions as a file explorer for browsing, previewing, and managing documents stored in a GitHub repository.

**Repository Name Suggestion:** `docs-explorer` or `document-vault`

---

## 🎯 Project Goals

1. Main HTML page accessible via GitHub Pages URL
2. Document storage in a `trunk/` subfolder with unlimited nested subfolders
3. Support for multiple document formats (HTML, Markdown, TXT, PDF, images, Office documents)
4. Automatic file/folder listing like Windows Explorer or macOS Finder
5. Thumbnail previews with hover enlargement (optional feature)
6. Hidden configuration files from the explorer view
7. Reactive UI with keyboard navigation support
8. System/White/Dark theme with aesthetic design

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           GitHub Repository                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────┐    ┌──────────────────────────────────────────────┐ │
│  │   Application      │    │              trunk/ (Documents)              │ │
│  │   (Hidden in UI)   │    │                                              │ │
│  ├────────────────────┤    │  ┌─────────────┐  ┌─────────────┐           │ │
│  │ index.html         │    │  │  project-a/ │  │  project-b/ │           │ │
│  │ assets/            │    │  │  ├─ doc1.md │  │  ├─ spec.pdf│           │ │
│  │  ├─ main.js        │    │  │  ├─ img.png │  │  └─ notes/  │           │ │
│  │  ├─ style.css      │    │  │  └─ sub/    │  │      └─ ... │           │ │
│  │  └─ ...            │    │  └─────────────┘  └─────────────┘           │ │
│  │ .config/           │    │                                              │ │
│  │ vite.config.ts     │    │  ┌─────────────┐                            │ │
│  │ package.json       │    │  │  images/    │                            │ │
│  │ tsconfig.json      │    │  │  └─ ...     │                            │ │
│  │ ...                │    │  └─────────────┘                            │ │
│  └────────────────────┘    └──────────────────────────────────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

                                    │
                                    ▼

┌─────────────────────────────────────────────────────────────────────────────┐
│                          Application Architecture                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                         Presentation Layer                             │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐  │  │
│  │  │   Header    │ │  Sidebar    │ │  Explorer   │ │   Preview       │  │  │
│  │  │  Component  │ │ (Tree View) │ │ (Grid/List) │ │   Panel         │  │  │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                    │                                         │
│                                    ▼                                         │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                          State Management                              │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │                    Zustand Store                                 │  │  │
│  │  │  • currentPath      • fileTree       • selectedItems            │  │  │
│  │  │  • viewMode         • theme          • searchQuery              │  │  │
│  │  │  • sortBy           • sortOrder      • previewFile              │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                    │                                         │
│                                    ▼                                         │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                          Service Layer                                 │  │
│  │  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────────────┐  │  │
│  │  │ GitHubService   │ │ ThumbnailService│ │ DocumentRenderService   │  │  │
│  │  │ (API calls)     │ │ (Preview gen)   │ │ (MD, PDF, etc.)         │  │  │
│  │  └─────────────────┘ └─────────────────┘ └─────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                    │                                         │
│                                    ▼                                         │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                         External APIs                                  │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │              GitHub REST API (Contents / Trees)                  │  │  │
│  │  │              https://api.github.com/repos/{owner}/{repo}/...     │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

### Core Framework & Build
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.x | UI Library |
| **TypeScript** | 5.x | Type Safety |
| **Vite** | 6.x | Build Tool & Dev Server |

### State Management
| Technology | Purpose |
|------------|---------|
| **Zustand** | Lightweight state management |

### UI & Styling
| Technology | Purpose |
|------------|---------|
| **Tailwind CSS** | Utility-first CSS framework |
| **Lucide React** | Icon library |
| **Framer Motion** | Animations |

### Document Processing
| Library | Purpose |
|---------|---------|
| **marked** | Markdown to HTML conversion |
| **highlight.js** | Code syntax highlighting |
| **pdf.js** | PDF rendering & thumbnail generation |
| **mammoth** | DOCX to HTML conversion (optional) |

### Development Tools
| Tool | Purpose |
|------|---------|
| **ESLint** | Code linting |
| **Prettier** | Code formatting |
| **Vitest** | Unit testing |

---

## 📁 Project Structure

```
docs-explorer/
├── .github/
│   └── workflows/
│       └── deploy.yml              # GitHub Actions for deployment
├── public/
│   └── favicon.ico
├── src/
│   ├── assets/
│   │   └── icons/                  # Custom icons if needed
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Icon.tsx
│   │   │   ├── Spinner.tsx
│   │   │   ├── Tooltip.tsx
│   │   │   └── index.ts
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── MainContent.tsx
│   │   │   ├── StatusBar.tsx
│   │   │   └── index.ts
│   │   ├── explorer/
│   │   │   ├── FileExplorer.tsx
│   │   │   ├── FileItem.tsx
│   │   │   ├── FolderItem.tsx
│   │   │   ├── BreadcrumbNav.tsx
│   │   │   ├── GridView.tsx
│   │   │   ├── ListView.tsx
│   │   │   ├── TreeView.tsx
│   │   │   ├── ContextMenu.tsx
│   │   │   └── index.ts
│   │   ├── preview/
│   │   │   ├── PreviewPanel.tsx
│   │   │   ├── MarkdownPreview.tsx
│   │   │   ├── PdfPreview.tsx
│   │   │   ├── ImagePreview.tsx
│   │   │   ├── TextPreview.tsx
│   │   │   ├── ThumbnailGenerator.tsx
│   │   │   └── index.ts
│   │   └── theme/
│   │       ├── ThemeToggle.tsx
│   │       └── index.ts
│   ├── hooks/
│   │   ├── useKeyboardNavigation.ts
│   │   ├── useFileOperations.ts
│   │   ├── useGitHubApi.ts
│   │   ├── useTheme.ts
│   │   ├── useLocalStorage.ts
│   │   └── index.ts
│   ├── services/
│   │   ├── github/
│   │   │   ├── GitHubService.ts
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   ├── thumbnail/
│   │   │   ├── ThumbnailService.ts
│   │   │   ├── PdfThumbnail.ts
│   │   │   ├── ImageThumbnail.ts
│   │   │   └── index.ts
│   │   └── renderer/
│   │       ├── MarkdownRenderer.ts
│   │       ├── CodeHighlighter.ts
│   │       └── index.ts
│   ├── store/
│   │   ├── useExplorerStore.ts
│   │   ├── useThemeStore.ts
│   │   ├── usePreviewStore.ts
│   │   └── index.ts
│   ├── types/
│   │   ├── file.ts
│   │   ├── github.ts
│   │   ├── theme.ts
│   │   └── index.ts
│   ├── utils/
│   │   ├── fileHelpers.ts
│   │   ├── pathHelpers.ts
│   │   ├── formatters.ts
│   │   ├── constants.ts
│   │   └── index.ts
│   ├── config/
│   │   ├── app.config.ts           # Application configuration
│   │   └── hidden-patterns.ts      # Patterns to hide from explorer
│   ├── styles/
│   │   ├── globals.css
│   │   └── themes/
│   │       ├── light.css
│   │       └── dark.css
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── trunk/                          # ← DOCUMENT STORAGE (user content)
│   └── .gitkeep
├── .eslintrc.cjs
├── .prettierrc
├── .gitignore
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

---

## 📐 Detailed Class & Module Specifications

### 1. Types Definition (`src/types/`)

```typescript
// src/types/file.ts
export interface FileSystemItem {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  sha: string;
  url: string;
  downloadUrl?: string;
  lastModified?: string;
}

export interface FileNode extends FileSystemItem {
  children?: FileNode[];
  isExpanded?: boolean;
  isLoading?: boolean;
  thumbnail?: string;
}

export type ViewMode = 'grid' | 'list' | 'details';
export type SortField = 'name' | 'size' | 'type' | 'modified';
export type SortOrder = 'asc' | 'desc';

export interface FileFilter {
  searchQuery: string;
  fileTypes: string[];
  showHidden: boolean;
}

// src/types/github.ts
export interface GitHubConfig {
  owner: string;
  repo: string;
  branch: string;
  basePath: string;  // 'trunk' by default
}

export interface GitHubContentResponse {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string | null;
  type: 'file' | 'dir';
  content?: string;
  encoding?: string;
}

export interface GitHubTreeResponse {
  sha: string;
  url: string;
  tree: GitHubTreeItem[];
  truncated: boolean;
}

export interface GitHubTreeItem {
  path: string;
  mode: string;
  type: 'blob' | 'tree';
  sha: string;
  size?: number;
  url: string;
}

// src/types/theme.ts
export type Theme = 'system' | 'light' | 'dark';

export interface ThemeColors {
  background: string;
  foreground: string;
  primary: string;
  secondary: string;
  accent: string;
  border: string;
  hover: string;
  selected: string;
}
```

### 2. GitHub Service (`src/services/github/`)

```typescript
// src/services/github/GitHubService.ts

import { GitHubConfig, GitHubContentResponse, GitHubTreeResponse, GitHubTreeItem } from '@/types/github';
import { FileNode, FileSystemItem } from '@/types/file';

export class GitHubService {
  private config: GitHubConfig;
  private baseApiUrl: string;
  private cache: Map<string, { data: any; timestamp: number }>;
  private cacheTTL: number = 5 * 60 * 1000; // 5 minutes

  constructor(config: GitHubConfig) {
    this.config = config;
    this.baseApiUrl = `https://api.github.com/repos/${config.owner}/${config.repo}`;
    this.cache = new Map();
  }

  /**
   * Get configuration for the GitHub repository
   */
  getConfig(): GitHubConfig {
    return this.config;
  }

  /**
   * Fetch directory contents using Contents API
   * Best for: Small directories, individual folder access
   * @param path - Relative path within the repository
   * @returns Array of file system items
   */
  async getDirectoryContents(path: string = ''): Promise<FileSystemItem[]> {
    const fullPath = this.buildPath(path);
    const cacheKey = `contents:${fullPath}`;
    
    // Check cache
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const url = `${this.baseApiUrl}/contents/${fullPath}?ref=${this.config.branch}`;
    
    try {
      const response = await fetch(url, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const data: GitHubContentResponse[] = await response.json();
      const items = this.transformContentResponse(data);
      
      // Cache the result
      this.setCache(cacheKey, items);
      
      return items;
    } catch (error) {
      console.error('Error fetching directory contents:', error);
      throw error;
    }
  }

  /**
   * Fetch entire repository tree recursively
   * Best for: Building complete file tree, initial load
   * @returns Complete file tree structure
   */
  async getFullTree(): Promise<FileNode[]> {
    const cacheKey = 'fullTree';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      // First, get the tree SHA for the branch
      const refUrl = `${this.baseApiUrl}/git/ref/heads/${this.config.branch}`;
      const refResponse = await fetch(refUrl, { headers: this.getHeaders() });
      const refData = await refResponse.json();
      const treeSha = refData.object.sha;

      // Then, get the full tree recursively
      const treeUrl = `${this.baseApiUrl}/git/trees/${treeSha}?recursive=1`;
      const treeResponse = await fetch(treeUrl, { headers: this.getHeaders() });
      const treeData: GitHubTreeResponse = await treeResponse.json();

      // Filter to only include items under basePath (trunk/)
      const filteredItems = treeData.tree.filter(item => 
        item.path.startsWith(this.config.basePath + '/')
      );

      const tree = this.buildTreeFromFlatList(filteredItems);
      this.setCache(cacheKey, tree);
      
      return tree;
    } catch (error) {
      console.error('Error fetching full tree:', error);
      throw error;
    }
  }

  /**
   * Get file content (raw text or base64)
   * @param path - File path
   * @returns File content as string
   */
  async getFileContent(path: string): Promise<string> {
    const fullPath = this.buildPath(path);
    const url = `${this.baseApiUrl}/contents/${fullPath}?ref=${this.config.branch}`;

    const response = await fetch(url, {
      headers: {
        ...this.getHeaders(),
        'Accept': 'application/vnd.github.raw+json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.status}`);
    }

    return response.text();
  }

  /**
   * Get raw file URL for direct access
   * @param path - File path
   * @returns Raw content URL
   */
  getRawUrl(path: string): string {
    const fullPath = this.buildPath(path);
    return `https://raw.githubusercontent.com/${this.config.owner}/${this.config.repo}/${this.config.branch}/${fullPath}`;
  }

  // Private helper methods

  private buildPath(path: string): string {
    if (!path) return this.config.basePath;
    return `${this.config.basePath}/${path}`.replace(/\/+/g, '/');
  }

  private getHeaders(): HeadersInit {
    return {
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    };
  }

  private transformContentResponse(data: GitHubContentResponse[]): FileSystemItem[] {
    return data.map(item => ({
      name: item.name,
      path: item.path.replace(`${this.config.basePath}/`, ''),
      type: item.type === 'dir' ? 'directory' : 'file',
      size: item.size,
      sha: item.sha,
      url: item.html_url,
      downloadUrl: item.download_url || undefined
    }));
  }

  private buildTreeFromFlatList(items: GitHubTreeItem[]): FileNode[] {
    const root: FileNode[] = [];
    const map = new Map<string, FileNode>();

    // Sort items to ensure directories come before their children
    items.sort((a, b) => a.path.localeCompare(b.path));

    for (const item of items) {
      // Remove basePath prefix
      const relativePath = item.path.replace(`${this.config.basePath}/`, '');
      const parts = relativePath.split('/');
      const name = parts[parts.length - 1];
      const parentPath = parts.slice(0, -1).join('/');

      const node: FileNode = {
        name,
        path: relativePath,
        type: item.type === 'tree' ? 'directory' : 'file',
        size: item.size,
        sha: item.sha,
        url: item.url,
        children: item.type === 'tree' ? [] : undefined
      };

      map.set(relativePath, node);

      if (parentPath === '') {
        root.push(node);
      } else {
        const parent = map.get(parentPath);
        if (parent && parent.children) {
          parent.children.push(node);
        }
      }
    }

    return root;
  }

  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.cache.clear();
  }
}

// Singleton instance
let instance: GitHubService | null = null;

export function getGitHubService(config?: GitHubConfig): GitHubService {
  if (!instance && config) {
    instance = new GitHubService(config);
  }
  if (!instance) {
    throw new Error('GitHubService not initialized');
  }
  return instance;
}
```

### 3. Thumbnail Service (`src/services/thumbnail/`)

```typescript
// src/services/thumbnail/ThumbnailService.ts

import { FileNode } from '@/types/file';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

export interface ThumbnailOptions {
  width: number;
  height: number;
  quality: number; // 0-1 for JPEG
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

  /**
   * Generate thumbnail for a file based on its type
   * @param file - File node
   * @param rawUrl - Raw URL to fetch the file
   * @returns Base64 data URL of thumbnail or null
   */
  async generateThumbnail(file: FileNode, rawUrl: string): Promise<string | null> {
    // Check cache first
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

  /**
   * Generate PDF thumbnail from first page
   */
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
        viewport: scaledViewport
      }).promise;

      return canvas.toDataURL('image/jpeg', this.options.quality);
    } catch (error) {
      console.error('PDF thumbnail generation failed:', error);
      return null;
    }
  }

  /**
   * Generate image thumbnail by resizing
   */
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

  /**
   * Generate text file preview thumbnail
   */
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

      // Background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Text
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

  /**
   * Get default icon-based thumbnail for unsupported types
   */
  private getDefaultThumbnail(extension: string): string | null {
    // Return SVG data URL based on file type
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

  /**
   * Clear thumbnail cache
   */
  clearCache(): void {
    this.thumbnailCache.clear();
  }
}

// Export singleton
export const thumbnailService = new ThumbnailService();
```

### 4. Store (Zustand) (`src/store/`)

```typescript
// src/store/useExplorerStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FileNode, ViewMode, SortField, SortOrder, FileFilter } from '@/types/file';

interface ExplorerState {
  // Navigation
  currentPath: string;
  pathHistory: string[];
  historyIndex: number;
  
  // File tree
  fileTree: FileNode[];
  currentItems: FileNode[];
  isLoading: boolean;
  error: string | null;
  
  // Selection
  selectedItems: Set<string>;
  focusedItem: string | null;
  
  // View settings
  viewMode: ViewMode;
  sortField: SortField;
  sortOrder: SortOrder;
  filter: FileFilter;
  
  // Preview
  previewFile: FileNode | null;
  isPreviewOpen: boolean;
  
  // Sidebar
  isSidebarOpen: boolean;
  expandedFolders: Set<string>;
  
  // Actions
  setCurrentPath: (path: string) => void;
  navigateBack: () => void;
  navigateForward: () => void;
  navigateUp: () => void;
  
  setFileTree: (tree: FileNode[]) => void;
  setCurrentItems: (items: FileNode[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  selectItem: (path: string, isMulti?: boolean) => void;
  clearSelection: () => void;
  setFocusedItem: (path: string | null) => void;
  
  setViewMode: (mode: ViewMode) => void;
  setSortField: (field: SortField) => void;
  setSortOrder: (order: SortOrder) => void;
  setFilter: (filter: Partial<FileFilter>) => void;
  
  setPreviewFile: (file: FileNode | null) => void;
  togglePreview: () => void;
  
  toggleSidebar: () => void;
  toggleFolderExpand: (path: string) => void;
  
  reset: () => void;
}

const initialState = {
  currentPath: '',
  pathHistory: [''],
  historyIndex: 0,
  fileTree: [],
  currentItems: [],
  isLoading: false,
  error: null,
  selectedItems: new Set<string>(),
  focusedItem: null,
  viewMode: 'grid' as ViewMode,
  sortField: 'name' as SortField,
  sortOrder: 'asc' as SortOrder,
  filter: {
    searchQuery: '',
    fileTypes: [],
    showHidden: false
  },
  previewFile: null,
  isPreviewOpen: false,
  isSidebarOpen: true,
  expandedFolders: new Set<string>()
};

export const useExplorerStore = create<ExplorerState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Navigation actions
      setCurrentPath: (path) => {
        const { pathHistory, historyIndex } = get();
        const newHistory = pathHistory.slice(0, historyIndex + 1);
        newHistory.push(path);
        set({
          currentPath: path,
          pathHistory: newHistory,
          historyIndex: newHistory.length - 1,
          selectedItems: new Set(),
          focusedItem: null
        });
      },

      navigateBack: () => {
        const { historyIndex, pathHistory } = get();
        if (historyIndex > 0) {
          set({
            historyIndex: historyIndex - 1,
            currentPath: pathHistory[historyIndex - 1],
            selectedItems: new Set()
          });
        }
      },

      navigateForward: () => {
        const { historyIndex, pathHistory } = get();
        if (historyIndex < pathHistory.length - 1) {
          set({
            historyIndex: historyIndex + 1,
            currentPath: pathHistory[historyIndex + 1],
            selectedItems: new Set()
          });
        }
      },

      navigateUp: () => {
        const { currentPath, setCurrentPath } = get();
        const parts = currentPath.split('/').filter(Boolean);
        if (parts.length > 0) {
          parts.pop();
          setCurrentPath(parts.join('/'));
        }
      },

      // File tree actions
      setFileTree: (tree) => set({ fileTree: tree }),
      setCurrentItems: (items) => set({ currentItems: items }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      // Selection actions
      selectItem: (path, isMulti = false) => {
        const { selectedItems } = get();
        const newSelection = new Set(isMulti ? selectedItems : []);
        
        if (newSelection.has(path)) {
          newSelection.delete(path);
        } else {
          newSelection.add(path);
        }
        
        set({ selectedItems: newSelection, focusedItem: path });
      },

      clearSelection: () => set({ selectedItems: new Set() }),
      setFocusedItem: (path) => set({ focusedItem: path }),

      // View settings actions
      setViewMode: (mode) => set({ viewMode: mode }),
      setSortField: (field) => set({ sortField: field }),
      setSortOrder: (order) => set({ sortOrder: order }),
      setFilter: (filter) => set(state => ({
        filter: { ...state.filter, ...filter }
      })),

      // Preview actions
      setPreviewFile: (file) => set({ previewFile: file, isPreviewOpen: !!file }),
      togglePreview: () => set(state => ({ isPreviewOpen: !state.isPreviewOpen })),

      // Sidebar actions
      toggleSidebar: () => set(state => ({ isSidebarOpen: !state.isSidebarOpen })),
      toggleFolderExpand: (path) => {
        const { expandedFolders } = get();
        const newExpanded = new Set(expandedFolders);
        if (newExpanded.has(path)) {
          newExpanded.delete(path);
        } else {
          newExpanded.add(path);
        }
        set({ expandedFolders: newExpanded });
      },

      reset: () => set(initialState)
    }),
    {
      name: 'explorer-storage',
      partialize: (state) => ({
        viewMode: state.viewMode,
        sortField: state.sortField,
        sortOrder: state.sortOrder,
        isSidebarOpen: state.isSidebarOpen
      })
    }
  )
);

// src/store/useThemeStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Theme } from '@/types/theme';

interface ThemeState {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'system',
      resolvedTheme: 'light',
      
      setTheme: (theme) => {
        let resolved: 'light' | 'dark' = 'light';
        
        if (theme === 'system') {
          resolved = window.matchMedia('(prefers-color-scheme: dark)').matches 
            ? 'dark' 
            : 'light';
        } else {
          resolved = theme;
        }
        
        // Update document class
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(resolved);
        
        set({ theme, resolvedTheme: resolved });
      }
    }),
    {
      name: 'theme-storage'
    }
  )
);
```

### 5. Custom Hooks (`src/hooks/`)

```typescript
// src/hooks/useKeyboardNavigation.ts

import { useCallback, useEffect } from 'react';
import { useExplorerStore } from '@/store/useExplorerStore';

interface KeyboardNavigationOptions {
  onEnter?: (path: string) => void;
  onDelete?: (paths: string[]) => void;
  onCopy?: (paths: string[]) => void;
  onPaste?: () => void;
}

export function useKeyboardNavigation(options: KeyboardNavigationOptions = {}) {
  const {
    currentItems,
    focusedItem,
    selectedItems,
    setFocusedItem,
    selectItem,
    clearSelection,
    navigateBack,
    navigateForward,
    navigateUp
  } = useExplorerStore();

  const getItemIndex = useCallback(
    (path: string) => currentItems.findIndex(item => item.path === path),
    [currentItems]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const { key, ctrlKey, metaKey, shiftKey } = event;
      const modifier = ctrlKey || metaKey;

      switch (key) {
        case 'ArrowUp':
          event.preventDefault();
          if (focusedItem) {
            const index = getItemIndex(focusedItem);
            if (index > 0) {
              const newPath = currentItems[index - 1].path;
              setFocusedItem(newPath);
              if (!shiftKey) clearSelection();
              selectItem(newPath, shiftKey);
            }
          } else if (currentItems.length > 0) {
            setFocusedItem(currentItems[0].path);
          }
          break;

        case 'ArrowDown':
          event.preventDefault();
          if (focusedItem) {
            const index = getItemIndex(focusedItem);
            if (index < currentItems.length - 1) {
              const newPath = currentItems[index + 1].path;
              setFocusedItem(newPath);
              if (!shiftKey) clearSelection();
              selectItem(newPath, shiftKey);
            }
          } else if (currentItems.length > 0) {
            setFocusedItem(currentItems[0].path);
          }
          break;

        case 'ArrowLeft':
          if (modifier) {
            event.preventDefault();
            navigateBack();
          }
          break;

        case 'ArrowRight':
          if (modifier) {
            event.preventDefault();
            navigateForward();
          }
          break;

        case 'Enter':
          if (focusedItem && options.onEnter) {
            event.preventDefault();
            options.onEnter(focusedItem);
          }
          break;

        case 'Backspace':
          event.preventDefault();
          navigateUp();
          break;

        case 'Delete':
          if (selectedItems.size > 0 && options.onDelete) {
            event.preventDefault();
            options.onDelete(Array.from(selectedItems));
          }
          break;

        case 'a':
          if (modifier) {
            event.preventDefault();
            currentItems.forEach(item => selectItem(item.path, true));
          }
          break;

        case 'c':
          if (modifier && selectedItems.size > 0 && options.onCopy) {
            event.preventDefault();
            options.onCopy(Array.from(selectedItems));
          }
          break;

        case 'v':
          if (modifier && options.onPaste) {
            event.preventDefault();
            options.onPaste();
          }
          break;

        case 'Escape':
          clearSelection();
          setFocusedItem(null);
          break;

        case 'Home':
          if (currentItems.length > 0) {
            event.preventDefault();
            setFocusedItem(currentItems[0].path);
            if (!shiftKey) clearSelection();
            selectItem(currentItems[0].path);
          }
          break;

        case 'End':
          if (currentItems.length > 0) {
            event.preventDefault();
            const lastItem = currentItems[currentItems.length - 1];
            setFocusedItem(lastItem.path);
            if (!shiftKey) clearSelection();
            selectItem(lastItem.path);
          }
          break;
      }
    },
    [
      currentItems,
      focusedItem,
      selectedItems,
      setFocusedItem,
      selectItem,
      clearSelection,
      navigateBack,
      navigateForward,
      navigateUp,
      getItemIndex,
      options
    ]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return { focusedItem, selectedItems };
}

// src/hooks/useGitHubApi.ts

import { useCallback, useEffect } from 'react';
import { useExplorerStore } from '@/store/useExplorerStore';
import { getGitHubService } from '@/services/github/GitHubService';
import { HIDDEN_PATTERNS } from '@/config/hidden-patterns';
import { FileNode } from '@/types/file';

export function useGitHubApi() {
  const {
    currentPath,
    setFileTree,
    setCurrentItems,
    setLoading,
    setError,
    sortField,
    sortOrder,
    filter
  } = useExplorerStore();

  const githubService = getGitHubService();

  const isHidden = useCallback((name: string, path: string): boolean => {
    return HIDDEN_PATTERNS.some(pattern => {
      if (typeof pattern === 'string') {
        return name === pattern || path.startsWith(pattern);
      }
      return pattern.test(name) || pattern.test(path);
    });
  }, []);

  const filterItems = useCallback(
    (items: FileNode[]): FileNode[] => {
      return items.filter(item => {
        // Filter hidden items
        if (!filter.showHidden && isHidden(item.name, item.path)) {
          return false;
        }

        // Filter by search query
        if (filter.searchQuery) {
          const query = filter.searchQuery.toLowerCase();
          if (!item.name.toLowerCase().includes(query)) {
            return false;
          }
        }

        // Filter by file types
        if (filter.fileTypes.length > 0 && item.type === 'file') {
          const ext = item.name.split('.').pop()?.toLowerCase();
          if (!ext || !filter.fileTypes.includes(ext)) {
            return false;
          }
        }

        return true;
      });
    },
    [filter, isHidden]
  );

  const sortItems = useCallback(
    (items: FileNode[]): FileNode[] => {
      const sorted = [...items].sort((a, b) => {
        // Directories always first
        if (a.type !== b.type) {
          return a.type === 'directory' ? -1 : 1;
        }

        let comparison = 0;
        switch (sortField) {
          case 'name':
            comparison = a.name.localeCompare(b.name);
            break;
          case 'size':
            comparison = (a.size || 0) - (b.size || 0);
            break;
          case 'type':
            const extA = a.name.split('.').pop() || '';
            const extB = b.name.split('.').pop() || '';
            comparison = extA.localeCompare(extB);
            break;
          default:
            comparison = a.name.localeCompare(b.name);
        }

        return sortOrder === 'asc' ? comparison : -comparison;
      });

      return sorted;
    },
    [sortField, sortOrder]
  );

  const loadDirectory = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const items = await githubService.getDirectoryContents(currentPath);
      const filteredItems = filterItems(items as FileNode[]);
      const sortedItems = sortItems(filteredItems);
      setCurrentItems(sortedItems);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load directory');
    } finally {
      setLoading(false);
    }
  }, [currentPath, filterItems, sortItems, setCurrentItems, setLoading, setError]);

  const loadFullTree = useCallback(async () => {
    setLoading(true);
    try {
      const tree = await githubService.getFullTree();
      const filteredTree = tree.filter(node => !isHidden(node.name, node.path));
      setFileTree(filteredTree);
    } catch (error) {
      console.error('Failed to load file tree:', error);
    } finally {
      setLoading(false);
    }
  }, [isHidden, setFileTree, setLoading]);

  useEffect(() => {
    loadDirectory();
  }, [loadDirectory]);

  useEffect(() => {
    loadFullTree();
  }, []);

  return {
    loadDirectory,
    loadFullTree,
    getRawUrl: (path: string) => githubService.getRawUrl(path),
    getFileContent: (path: string) => githubService.getFileContent(path)
  };
}

// src/hooks/useTheme.ts

import { useEffect } from 'react';
import { useThemeStore } from '@/store/useThemeStore';

export function useTheme() {
  const { theme, resolvedTheme, setTheme } = useThemeStore();

  useEffect(() => {
    // Initialize theme on mount
    setTheme(theme);

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        setTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, setTheme]);

  return { theme, resolvedTheme, setTheme };
}
```

### 6. Configuration Files

```typescript
// src/config/app.config.ts

import { GitHubConfig } from '@/types/github';

// These values should be set based on your repository
export const GITHUB_CONFIG: GitHubConfig = {
  owner: 'YOUR_GITHUB_USERNAME',  // Replace with your username
  repo: 'docs-explorer',           // Replace with your repo name
  branch: 'main',
  basePath: 'trunk'
};

export const APP_CONFIG = {
  appName: 'Document Explorer',
  defaultViewMode: 'grid' as const,
  thumbnailEnabled: true,
  thumbnailSize: {
    width: 120,
    height: 160
  },
  previewPanelWidth: 400,
  maxFilePreviewSize: 5 * 1024 * 1024, // 5MB
  supportedPreviewTypes: [
    'md', 'txt', 'html', 'css', 'js', 'ts', 'json', 'xml',
    'pdf', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'
  ]
};

// src/config/hidden-patterns.ts

// Patterns for files/folders to hide in the explorer
export const HIDDEN_PATTERNS: (string | RegExp)[] = [
  // Configuration files
  'index.html',
  'vite.config.ts',
  'tsconfig.json',
  'tsconfig.node.json',
  'package.json',
  'package-lock.json',
  'postcss.config.js',
  'tailwind.config.js',
  '.eslintrc.cjs',
  '.prettierrc',
  
  // Directories
  'node_modules',
  'dist',
  'src',
  'public',
  'assets',
  '.github',
  '.git',
  '.vscode',
  
  // Hidden files
  /^\./,  // Any file starting with .
  
  // Build artifacts
  /\.d\.ts$/,
  /\.map$/,
];
```

---

## 🎨 Component Implementation Details

### Main App Component

```typescript
// src/App.tsx

import { useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { MainContent } from '@/components/layout/MainContent';
import { StatusBar } from '@/components/layout/StatusBar';
import { PreviewPanel } from '@/components/preview/PreviewPanel';
import { useTheme } from '@/hooks/useTheme';
import { useExplorerStore } from '@/store/useExplorerStore';
import { getGitHubService } from '@/services/github/GitHubService';
import { GITHUB_CONFIG } from '@/config/app.config';

function App() {
  const { isSidebarOpen, isPreviewOpen, previewFile } = useExplorerStore();
  useTheme(); // Initialize theme

  useEffect(() => {
    // Initialize GitHub service
    getGitHubService(GITHUB_CONFIG);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <Header />
      
      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        {isSidebarOpen && (
          <aside className="w-64 border-r border-border flex-shrink-0">
            <Sidebar />
          </aside>
        )}
        
        {/* Main Content Area */}
        <main className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-auto">
            <MainContent />
          </div>
          
          {/* Preview Panel */}
          {isPreviewOpen && previewFile && (
            <aside className="w-96 border-l border-border flex-shrink-0">
              <PreviewPanel file={previewFile} />
            </aside>
          )}
        </main>
      </div>
      
      {/* Status Bar */}
      <StatusBar />
    </div>
  );
}

export default App;
```

### File Explorer Component

```typescript
// src/components/explorer/FileExplorer.tsx

import { useCallback } from 'react';
import { useExplorerStore } from '@/store/useExplorerStore';
import { useGitHubApi } from '@/hooks/useGitHubApi';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';
import { GridView } from './GridView';
import { ListView } from './ListView';
import { BreadcrumbNav } from './BreadcrumbNav';
import { ContextMenu } from './ContextMenu';
import { Spinner } from '@/components/common/Spinner';
import { FileNode } from '@/types/file';

export function FileExplorer() {
  const {
    currentItems,
    viewMode,
    isLoading,
    error,
    setCurrentPath,
    setPreviewFile
  } = useExplorerStore();

  const { getRawUrl } = useGitHubApi();

  const handleItemClick = useCallback(
    (item: FileNode) => {
      if (item.type === 'directory') {
        setCurrentPath(item.path);
      } else {
        setPreviewFile(item);
      }
    },
    [setCurrentPath, setPreviewFile]
  );

  const handleItemDoubleClick = useCallback(
    (item: FileNode) => {
      if (item.type === 'directory') {
        setCurrentPath(item.path);
      } else {
        // Open file in new tab
        window.open(getRawUrl(item.path), '_blank');
      }
    },
    [setCurrentPath, getRawUrl]
  );

  // Keyboard navigation
  useKeyboardNavigation({
    onEnter: (path) => {
      const item = currentItems.find(i => i.path === path);
      if (item) handleItemDoubleClick(item);
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-destructive">
        <p className="text-lg font-medium">Error loading directory</p>
        <p className="text-sm text-muted-foreground mt-2">{error}</p>
      </div>
    );
  }

  if (currentItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <p className="text-lg">This folder is empty</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <BreadcrumbNav />
      
      <div className="flex-1 overflow-auto p-4">
        {viewMode === 'grid' ? (
          <GridView
            items={currentItems}
            onItemClick={handleItemClick}
            onItemDoubleClick={handleItemDoubleClick}
          />
        ) : (
          <ListView
            items={currentItems}
            onItemClick={handleItemClick}
            onItemDoubleClick={handleItemDoubleClick}
          />
        )}
      </div>

      <ContextMenu />
    </div>
  );
}
```

### File Item Component (with Thumbnail)

```typescript
// src/components/explorer/FileItem.tsx

import { useState, useEffect, memo } from 'react';
import { motion } from 'framer-motion';
import { File, Folder, FileText, Image, FileCode } from 'lucide-react';
import { FileNode } from '@/types/file';
import { useExplorerStore } from '@/store/useExplorerStore';
import { thumbnailService } from '@/services/thumbnail/ThumbnailService';
import { Tooltip } from '@/components/common/Tooltip';
import { cn } from '@/utils/cn';

interface FileItemProps {
  item: FileNode;
  onClick: () => void;
  onDoubleClick: () => void;
  rawUrl?: string;
}

const FILE_ICONS: Record<string, React.ElementType> = {
  md: FileText,
  txt: FileText,
  pdf: File,
  png: Image,
  jpg: Image,
  jpeg: Image,
  gif: Image,
  svg: Image,
  html: FileCode,
  css: FileCode,
  js: FileCode,
  ts: FileCode,
  json: FileCode
};

export const FileItem = memo(function FileItem({
  item,
  onClick,
  onDoubleClick,
  rawUrl
}: FileItemProps) {
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  const { selectedItems, focusedItem } = useExplorerStore();
  const isSelected = selectedItems.has(item.path);
  const isFocused = focusedItem === item.path;

  const extension = item.name.split('.').pop()?.toLowerCase() || '';
  const IconComponent = item.type === 'directory' 
    ? Folder 
    : FILE_ICONS[extension] || File;

  // Generate thumbnail on mount/hover
  useEffect(() => {
    if (!thumbnail && rawUrl && item.type === 'file') {
      thumbnailService.generateThumbnail(item, rawUrl).then(setThumbnail);
    }
  }, [item, rawUrl, thumbnail]);

  return (
    <Tooltip
      content={
        thumbnail && isHovered ? (
          <img 
            src={thumbnail} 
            alt={item.name} 
            className="max-w-[240px] max-h-[320px] rounded shadow-lg"
          />
        ) : null
      }
      enabled={!!thumbnail}
    >
      <motion.div
        className={cn(
          'group flex flex-col items-center p-3 rounded-lg cursor-pointer',
          'transition-colors duration-150',
          isSelected && 'bg-primary/20',
          isFocused && 'ring-2 ring-primary',
          !isSelected && 'hover:bg-muted'
        )}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        tabIndex={0}
        role="button"
        aria-selected={isSelected}
      >
        {/* Thumbnail or Icon */}
        <div className="relative w-20 h-20 flex items-center justify-center mb-2">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={item.name}
              className="w-full h-full object-cover rounded"
            />
          ) : (
            <IconComponent
              className={cn(
                'w-12 h-12',
                item.type === 'directory' ? 'text-amber-500' : 'text-muted-foreground'
              )}
            />
          )}
        </div>

        {/* File Name */}
        <span
          className={cn(
            'text-sm text-center truncate w-full px-1',
            isSelected && 'font-medium'
          )}
          title={item.name}
        >
          {item.name}
        </span>

        {/* File Size (for files only) */}
        {item.type === 'file' && item.size && (
          <span className="text-xs text-muted-foreground mt-1">
            {formatFileSize(item.size)}
          </span>
        )}
      </motion.div>
    </Tooltip>
  );
});

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
```

---

## 📋 Implementation Steps

### Phase 1: Project Setup (Day 1)

1. **Create GitHub Repository**
   ```bash
   mkdir docs-explorer
   cd docs-explorer
   git init
   ```

2. **Initialize Vite + React + TypeScript**
   ```bash
   npm create vite@latest . -- --template react-ts
   npm install
   ```

3. **Install Core Dependencies**
   ```bash
   # State management
   npm install zustand

   # UI & Styling
   npm install tailwindcss postcss autoprefixer
   npm install lucide-react framer-motion
   npm install clsx tailwind-merge

   # Document processing
   npm install marked highlight.js pdfjs-dist

   # Development tools
   npm install -D @types/node prettier eslint-config-prettier
   ```

4. **Configure Tailwind CSS**
   ```bash
   npx tailwindcss init -p
   ```

5. **Set up project structure**
   - Create all directories as outlined above
   - Create initial configuration files

6. **Create trunk/ folder**
   ```bash
   mkdir trunk
   echo "# Documents" > trunk/README.md
   ```

### Phase 2: Core Services (Day 2-3)

1. **Implement GitHubService**
   - Contents API integration
   - Tree API integration
   - Caching mechanism
   - Error handling

2. **Implement ThumbnailService**
   - PDF thumbnail generation
   - Image resizing
   - Text preview generation
   - Caching

3. **Create Zustand stores**
   - Explorer state
   - Theme state
   - Preview state

### Phase 3: UI Components (Day 4-6)

1. **Layout Components**
   - Header with navigation controls
   - Sidebar with tree view
   - Main content area
   - Status bar

2. **Explorer Components**
   - Grid view
   - List view
   - Breadcrumb navigation
   - Context menu

3. **Preview Components**
   - Markdown renderer
   - PDF viewer
   - Image viewer
   - Text viewer

### Phase 4: Features & Polish (Day 7-8)

1. **Keyboard Navigation**
   - Arrow key navigation
   - Enter/Backspace navigation
   - Ctrl+A, Ctrl+C shortcuts
   - Focus management

2. **Theme System**
   - Light theme
   - Dark theme
   - System preference detection
   - Theme toggle

3. **Animations & Transitions**
   - Page transitions
   - Hover effects
   - Loading states

### Phase 5: Build & Deploy (Day 9-10)

1. **Configure Vite for GitHub Pages**
   ```typescript
   // vite.config.ts
   export default defineConfig({
     base: '/docs-explorer/', // Repository name
     plugins: [react()],
     build: {
       outDir: 'dist'
     }
   });
   ```

2. **Create GitHub Actions Workflow**
   ```yaml
   # .github/workflows/deploy.yml
   name: Deploy to GitHub Pages

   on:
     push:
       branches: [main]

   jobs:
     build-and-deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with:
             node-version: '20'
         - run: npm ci
         - run: npm run build
         - uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./dist
   ```

3. **Enable GitHub Pages**
   - Go to repository Settings → Pages
   - Set source to `gh-pages` branch

---

## 🎯 Success Criteria

| Requirement | Implementation | Status |
|-------------|----------------|--------|
| Main HTML page via GitHub URL | Vite build + GitHub Pages | ⬜ |
| Document storage in trunk/ | Configuration + filtering | ⬜ |
| Multiple document formats | Type detection + renderers | ⬜ |
| Automatic file listing | GitHub API integration | ⬜ |
| Thumbnail previews | ThumbnailService | ⬜ |
| Hidden config files | HIDDEN_PATTERNS config | ⬜ |
| Reactive UI | React + Zustand | ⬜ |
| Keyboard navigation | useKeyboardNavigation hook | ⬜ |
| Theme support | Tailwind + useThemeStore | ⬜ |
| Aesthetic design | Tailwind + Framer Motion | ⬜ |

---

## 📚 References

- [GitHub REST API - Contents](https://docs.github.com/en/rest/repos/contents)
- [GitHub REST API - Trees](https://docs.github.com/en/rest/git/trees)
- [Vite Documentation](https://vite.dev/guide/)
- [React Documentation](https://react.dev/)
- [Zustand Documentation](https://docs.pmnd.rs/zustand)
- [Tailwind CSS](https://tailwindcss.com/)
- [PDF.js](https://mozilla.github.io/pdf.js/)
- [Marked.js](https://marked.js.org/)

---

## 🔧 Maintenance Notes

- **Adding Documents**: Simply commit files to the `trunk/` folder
- **Updating Hidden Patterns**: Edit `src/config/hidden-patterns.ts`
- **Changing Theme Colors**: Edit Tailwind configuration and CSS variables
- **API Rate Limits**: GitHub API has 60 req/hour without auth, 5000 with auth
- **Large Repositories**: Consider implementing pagination for 1000+ files

---

*Last Updated: 2026-01-28*
*Version: 1.0.0*
