import type { FileNode, FileSystemItem } from '@/types/file';
import { logDebug, logInfo, logError } from '@/services/debug';

interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  children?: FileTreeNode[];
}

export class LocalFileService {
  private basePath: string;
  private cache: Map<string, { data: unknown; timestamp: number }>;
  private cacheTTL: number = 5 * 60 * 1000; // 5 minutes
  private fileTree: FileNode[] | null = null;

  constructor(basePath: string = '/trunk') {
    this.basePath = basePath;
    this.cache = new Map();
    logInfo('LocalFileService', 'Service initialized', { basePath });
  }

  getBasePath(): string {
    return this.basePath;
  }

  async getDirectoryContents(path: string = ''): Promise<FileSystemItem[]> {
    const cacheKey = `contents:${path}`;

    logDebug('LocalFileService', `getDirectoryContents called`, { path });

    const cached = this.getFromCache<FileSystemItem[]>(cacheKey);
    if (cached) {
      logDebug('LocalFileService', `Cache hit for directory contents`, { path, itemCount: cached.length });
      return cached;
    }

    try {
      // Load full tree first if not loaded
      if (!this.fileTree) {
        await this.loadFileTree();
      }

      // Find items at the specified path
      const items = this.findItemsAtPath(path);

      const result: FileSystemItem[] = items.map(item => ({
        name: item.name,
        path: item.path,
        type: item.type,
        size: item.size,
        sha: this.generateHash(item.path),
        url: this.getFileUrl(item.path),
        downloadUrl: item.type === 'file' ? this.getFileUrl(item.path) : undefined
      }));

      this.setCache(cacheKey, result);
      logInfo('LocalFileService', `Directory contents loaded`, { path, itemCount: result.length });

      return result;
    } catch (error) {
      logError('LocalFileService', 'Error getting directory contents', { error, path });
      throw error;
    }
  }

  async getFullTree(): Promise<FileNode[]> {
    const cacheKey = 'fullTree';
    logDebug('LocalFileService', 'getFullTree called');

    const cached = this.getFromCache<FileNode[]>(cacheKey);
    if (cached) {
      logDebug('LocalFileService', `Cache hit for full tree`, { nodeCount: cached.length });
      return cached;
    }

    try {
      await this.loadFileTree();

      if (!this.fileTree) {
        throw new Error('Failed to load file tree');
      }

      const tree = this.convertToFileNodes(this.fileTree);
      this.setCache(cacheKey, tree);
      logInfo('LocalFileService', 'Full tree loaded and cached', { nodeCount: tree.length });

      return tree;
    } catch (error) {
      logError('LocalFileService', 'Error fetching full tree', { error });
      throw error;
    }
  }

  async getFileContent(path: string): Promise<string> {
    const url = this.getFileUrl(path);
    logDebug('LocalFileService', 'Fetching file content', { path, url });

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.status}`);
      }

      return response.text();
    } catch (error) {
      logError('LocalFileService', 'Error fetching file content', { error, path });
      throw error;
    }
  }

  getRawUrl(path: string): string {
    return this.getFileUrl(path);
  }

  private async loadFileTree(): Promise<void> {
    const baseUrl = this.getBaseUrl();
    const treeUrl = `${baseUrl}/file-tree.json`;

    logDebug('LocalFileService', 'Loading file tree', { treeUrl });

    try {
      const response = await fetch(treeUrl);

      if (!response.ok) {
        throw new Error(`Failed to load file tree: ${response.status}`);
      }

      const tree: FileTreeNode[] = await response.json();
      this.fileTree = this.convertToFileNodes(tree);

      logInfo('LocalFileService', 'File tree loaded successfully', { nodeCount: this.fileTree.length });
    } catch (error) {
      logError('LocalFileService', 'Error loading file tree', { error, treeUrl });
      throw error;
    }
  }

  private convertToFileNodes(items: FileTreeNode[]): FileNode[] {
    return items.map(item => ({
      name: item.name,
      path: item.path,
      type: item.type,
      size: item.size,
      sha: this.generateHash(item.path),
      url: this.getFileUrl(item.path),
      downloadUrl: item.type === 'file' ? this.getFileUrl(item.path) : undefined,
      children: item.children ? this.convertToFileNodes(item.children) : undefined
    }));
  }

  private findItemsAtPath(targetPath: string): FileTreeNode[] {
    if (!this.fileTree) return [];

    // Root level
    if (!targetPath || targetPath === '') {
      return this.fileTreeToRaw(this.fileTree);
    }

    // Find the directory at the path
    const parts = targetPath.split('/').filter(p => p);
    let current: FileTreeNode[] = this.fileTreeToRaw(this.fileTree);

    for (const part of parts) {
      const found = current.find(item => item.name === part && item.type === 'directory');
      if (!found || !found.children) {
        return [];
      }
      current = found.children;
    }

    return current;
  }

  private fileTreeToRaw(nodes: FileNode[]): FileTreeNode[] {
    return nodes.map(node => ({
      name: node.name,
      path: node.path,
      type: node.type,
      size: node.size,
      children: node.children ? this.fileTreeToRaw(node.children) : undefined
    }));
  }

  private getBaseUrl(): string {
    // Get the base URL from import.meta.env or window location
    if (typeof window !== 'undefined') {
      const base = import.meta.env.BASE_URL || '/';
      return window.location.origin + base.replace(/\/$/, '');
    }
    return '';
  }

  private getFileUrl(path: string): string {
    const baseUrl = this.getBaseUrl();
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${baseUrl}${this.basePath}/${cleanPath}`;
  }

  private generateHash(path: string): string {
    // Simple hash for compatibility with existing code
    let hash = 0;
    for (let i = 0; i < path.length; i++) {
      const char = path.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  }

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data as T;
    }
    return null;
  }

  private setCache(key: string, data: unknown): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  clearCache(): void {
    this.cache.clear();
    this.fileTree = null;
  }
}

let instance: LocalFileService | null = null;

export function getLocalFileService(): LocalFileService {
  if (!instance) {
    const error = new Error('LocalFileService not initialized');
    logError('LocalFileService', 'Service not initialized when getLocalFileService called', { error });
    throw error;
  }
  return instance;
}

export function initLocalFileService(basePath: string = '/trunk'): LocalFileService {
  logInfo('LocalFileService', 'Initializing service', { basePath });
  instance = new LocalFileService(basePath);
  return instance;
}
