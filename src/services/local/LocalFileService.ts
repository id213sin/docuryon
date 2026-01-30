import type { FileNode, FileSystemItem } from '@/types/file';
import { logDebug, logInfo, logError, logWarn } from '@/services/debug';

interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  children?: FileTreeNode[];
}

interface DirectoryWatcher {
  path: string;
  callback: () => void;
  intervalId: ReturnType<typeof setInterval>;
  lastHash: string;
}

export class LocalFileService {
  private basePath: string;
  private cache: Map<string, { data: unknown; timestamp: number; hash: string }>;
  private cacheTTL: number = 5 * 60 * 1000; // 5 minutes
  private fileTree: FileNode[] | null = null;
  private watchers: Map<string, DirectoryWatcher> = new Map();
  private watchInterval: number = 3000; // Check every 3 seconds

  constructor(basePath: string = '/trunk') {
    this.basePath = basePath;
    this.cache = new Map();
    logInfo('LocalFileService', 'Service initialized', { basePath });
  }

  getBasePath(): string {
    return this.basePath;
  }

  /**
   * Get directory contents - only loads immediate children (lazy loading)
   */
  async getDirectoryContents(path: string = ''): Promise<FileSystemItem[]> {
    const cacheKey = `contents:${path}`;

    logDebug('LocalFileService', `getDirectoryContents called`, { path });

    const cached = this.getFromCache<FileSystemItem[]>(cacheKey);
    if (cached) {
      logDebug('LocalFileService', `Cache hit for directory contents`, { path, itemCount: cached.length });
      return cached;
    }

    try {
      // Load file tree if not loaded (but only for finding current directory)
      if (!this.fileTree) {
        await this.loadFileTree();
      }

      // Find items at the specified path - only immediate children
      const items = this.findItemsAtPath(path);

      const result: FileSystemItem[] = await Promise.all(
        items.map(async item => {
          const fileItem: FileSystemItem = {
            name: item.name,
            path: item.path,
            type: item.type,
            size: item.size,
            sha: this.generateHash(item.path),
            url: this.getFileUrl(item.path),
            downloadUrl: item.type === 'file' ? this.getFileUrl(item.path) : undefined,
            isAccessible: true
          };

          // Check accessibility for each item
          try {
            await this.checkAccess(item.path, item.type);
          } catch (error) {
            fileItem.isAccessible = false;
            fileItem.accessError = error instanceof Error ? error.message : 'Access denied';
            logWarn('LocalFileService', `Access denied for ${item.path}`, { error });
          }

          return fileItem;
        })
      );

      const hash = this.generateContentHash(result);
      this.setCache(cacheKey, result, hash);
      logInfo('LocalFileService', `Directory contents loaded`, { path, itemCount: result.length });

      return result;
    } catch (error) {
      logError('LocalFileService', 'Error getting directory contents', { error, path });

      // Return access error for the directory itself
      if (error instanceof Error && error.message.includes('Access denied')) {
        throw error;
      }
      throw error;
    }
  }

  /**
   * Check if a file or directory is accessible
   */
  private async checkAccess(path: string, type: 'file' | 'directory'): Promise<void> {
    const url = this.getFileUrl(path);

    try {
      const response = await fetch(url, { method: 'HEAD' });

      if (response.status === 403) {
        throw new Error('Access denied: Permission denied');
      }
      if (response.status === 401) {
        throw new Error('Access denied: Authentication required');
      }
      if (!response.ok && response.status !== 404) {
        // 404 might be OK for directories, they might not have index
        if (type === 'file') {
          throw new Error(`Access error: HTTP ${response.status}`);
        }
      }
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        // Network error - might be CORS or offline, treat as potentially accessible
        logDebug('LocalFileService', `Network error checking access for ${path}, assuming accessible`);
        return;
      }
      throw error;
    }
  }

  /**
   * Get full tree for sidebar - loads full structure but children marked as not loaded
   */
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

      // For sidebar, return only directory structure (shallow)
      const tree = this.convertToShallowFileNodes(this.fileTree);
      this.setCache(cacheKey, tree, this.generateContentHash(tree));
      logInfo('LocalFileService', 'Full tree loaded and cached', { nodeCount: tree.length });

      return tree;
    } catch (error) {
      logError('LocalFileService', 'Error fetching full tree', { error });
      throw error;
    }
  }

  /**
   * Load children for a specific directory (on-demand loading)
   */
  async loadDirectoryChildren(path: string): Promise<FileNode[]> {
    logDebug('LocalFileService', 'loadDirectoryChildren called', { path });

    try {
      const items = await this.getDirectoryContents(path);
      return items as FileNode[];
    } catch (error) {
      logError('LocalFileService', 'Error loading directory children', { error, path });
      throw error;
    }
  }

  async getFileContent(path: string): Promise<string> {
    const url = this.getFileUrl(path);
    logDebug('LocalFileService', 'Fetching file content', { path, url });

    try {
      const response = await fetch(url);

      if (response.status === 403 || response.status === 401) {
        throw new Error('Access denied: Permission denied');
      }

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

  /**
   * Watch a directory for changes and call callback when detected
   */
  watchDirectory(path: string, callback: () => void): () => void {
    const existingWatcher = this.watchers.get(path);
    if (existingWatcher) {
      // Update callback and return existing cleanup
      existingWatcher.callback = callback;
      return () => this.unwatchDirectory(path);
    }

    logInfo('LocalFileService', 'Starting directory watch', { path, interval: this.watchInterval });

    const checkForChanges = async () => {
      try {
        // Invalidate cache to get fresh data
        const cacheKey = `contents:${path}`;
        const cached = this.cache.get(cacheKey);
        const oldHash = cached?.hash || '';

        // Fetch fresh content
        this.cache.delete(cacheKey);
        const items = await this.getDirectoryContents(path);
        const newHash = this.generateContentHash(items);

        if (oldHash && oldHash !== newHash) {
          logInfo('LocalFileService', 'Directory change detected', { path, oldHash, newHash });
          callback();
        }

        // Update watcher's lastHash
        const watcher = this.watchers.get(path);
        if (watcher) {
          watcher.lastHash = newHash;
        }
      } catch (error) {
        logError('LocalFileService', 'Error checking for directory changes', { error, path });
      }
    };

    const intervalId = setInterval(checkForChanges, this.watchInterval);

    const watcher: DirectoryWatcher = {
      path,
      callback,
      intervalId,
      lastHash: ''
    };

    this.watchers.set(path, watcher);

    return () => this.unwatchDirectory(path);
  }

  /**
   * Stop watching a directory
   */
  unwatchDirectory(path: string): void {
    const watcher = this.watchers.get(path);
    if (watcher) {
      clearInterval(watcher.intervalId);
      this.watchers.delete(path);
      logInfo('LocalFileService', 'Stopped directory watch', { path });
    }
  }

  /**
   * Stop all directory watches
   */
  unwatchAll(): void {
    this.watchers.forEach((watcher, path) => {
      clearInterval(watcher.intervalId);
      logDebug('LocalFileService', 'Stopped watching', { path });
    });
    this.watchers.clear();
  }

  /**
   * Invalidate cache for a specific path and trigger refresh
   */
  invalidateCache(path: string): void {
    const cacheKey = `contents:${path}`;
    this.cache.delete(cacheKey);
    logDebug('LocalFileService', 'Cache invalidated', { path });
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

  /**
   * Convert tree nodes with full children (for internal use)
   */
  private convertToFileNodes(items: FileTreeNode[]): FileNode[] {
    return items.map(item => ({
      name: item.name,
      path: item.path,
      type: item.type,
      size: item.size,
      sha: this.generateHash(item.path),
      url: this.getFileUrl(item.path),
      downloadUrl: item.type === 'file' ? this.getFileUrl(item.path) : undefined,
      children: item.children ? this.convertToFileNodes(item.children) : undefined,
      isAccessible: true,
      childrenLoaded: false
    }));
  }

  /**
   * Convert tree nodes without loading children content (for sidebar lazy display)
   */
  private convertToShallowFileNodes(items: FileNode[]): FileNode[] {
    return items.map(item => ({
      name: item.name,
      path: item.path,
      type: item.type,
      size: item.size,
      sha: item.sha,
      url: item.url,
      downloadUrl: item.downloadUrl,
      isAccessible: true,
      childrenLoaded: false,
      // For directories, include shallow children structure (names only) for sidebar
      children: item.type === 'directory' && item.children
        ? this.convertToShallowFileNodes(item.children)
        : undefined
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

  private generateContentHash(items: unknown[]): string {
    const content = JSON.stringify(items.map(item => {
      if (typeof item === 'object' && item !== null) {
        const { name, path, type, size } = item as FileSystemItem;
        return { name, path, type, size };
      }
      return item;
    }));
    return this.generateHash(content);
  }

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data as T;
    }
    return null;
  }

  private setCache(key: string, data: unknown, hash: string = ''): void {
    this.cache.set(key, { data, timestamp: Date.now(), hash });
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
