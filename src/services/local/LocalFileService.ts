import type { FileNode, FileSystemItem } from '@/types/file';
import { logDebug, logInfo, logError } from '@/services/debug';

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

type DataSource = 'api' | 'file-tree' | 'unknown';

export class LocalFileService {
  private basePath: string;
  private cache: Map<string, { data: unknown; timestamp: number; hash: string }>;
  private cacheTTL: number = 5 * 60 * 1000; // 5 minutes
  private fileTree: FileNode[] | null = null;
  private watchers: Map<string, DirectoryWatcher> = new Map();
  private watchInterval: number = 3000; // Check every 3 seconds
  private dataSource: DataSource = 'unknown';

  constructor(basePath: string = '/trunk') {
    this.basePath = basePath;
    this.cache = new Map();
    logInfo('LocalFileService', 'Service initialized', { basePath });
  }

  getBasePath(): string {
    return this.basePath;
  }

  getDataSource(): DataSource {
    return this.dataSource;
  }

  /**
   * Get directory contents using API (dynamic) or file-tree.json (static)
   *
   * Note: This method always tries to fallback to file-tree.json if API fails,
   * regardless of dataSource state, to avoid race condition issues.
   */
  async getDirectoryContents(path: string = ''): Promise<FileSystemItem[]> {
    const cacheKey = `contents:${path}`;

    logDebug('LocalFileService', `getDirectoryContents called`, { path });

    const cached = this.getFromCache<FileSystemItem[]>(cacheKey);
    if (cached) {
      logDebug('LocalFileService', `Cache hit for directory contents`, { path, itemCount: cached.length });
      return cached;
    }

    // Try API first if we're not already confirmed to be in static mode
    if (this.dataSource !== 'file-tree') {
      try {
        const result = await this.fetchDirectoryFromApi(path);
        if (this.dataSource === 'unknown') {
          this.dataSource = 'api';
        }
        const hash = this.generateContentHash(result);
        this.setCache(cacheKey, result, hash);
        logInfo('LocalFileService', `Directory loaded from API`, { path, itemCount: result.length });
        return result;
      } catch (apiError) {
        logDebug('LocalFileService', 'Directory API failed, will try file-tree.json', { path, error: apiError });
        // Continue to fallback - don't throw here
      }
    }

    // Fallback to file-tree.json (works for both static mode and API failure)
    try {
      if (!this.fileTree) {
        await this.loadFileTree();
      }

      // If we got here via API failure, update dataSource
      if (this.dataSource === 'unknown') {
        this.dataSource = 'file-tree';
        logInfo('LocalFileService', 'API not available, using file-tree.json (static mode)');
      }

      const items = this.findItemsAtPath(path);
      const result: FileSystemItem[] = items.map(item => ({
        name: item.name,
        path: item.path,
        type: item.type,
        size: item.size,
        sha: this.generateHash(item.path),
        url: this.getFileUrl(item.path),
        downloadUrl: item.type === 'file' ? this.getFileUrl(item.path) : undefined,
        isAccessible: true
      }));

      const hash = this.generateContentHash(result);
      this.setCache(cacheKey, result, hash);
      logInfo('LocalFileService', `Directory loaded from file-tree.json`, { path, itemCount: result.length });

      return result;
    } catch (error) {
      logError('LocalFileService', 'Error getting directory contents', { error, path });
      throw error;
    }
  }

  /**
   * Fetch directory contents from API endpoint (dynamic mode)
   */
  private async fetchDirectoryFromApi(path: string): Promise<FileSystemItem[]> {
    const baseUrl = this.getBaseUrl();
    const apiUrl = `${baseUrl}/api/directory?path=${encodeURIComponent(path)}`;

    logDebug('LocalFileService', 'Fetching from API', { apiUrl });

    const response = await fetch(apiUrl);

    if (response.status === 404) {
      // API not available - likely static mode
      const data = await response.json().catch(() => ({}));
      if (data.mode === 'dynamic') {
        // Directory not found in dynamic mode
        throw new Error(`Directory not found: ${path}`);
      }
      // API endpoint doesn't exist - static mode
      throw new Error('API not available');
    }

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const items: FileTreeNode[] = await response.json();

    if ('error' in items) {
      throw new Error((items as unknown as { error: string }).error);
    }

    return items.map(item => ({
      name: item.name,
      path: item.path,
      type: item.type,
      size: item.size,
      sha: this.generateHash(item.path),
      url: this.getFileUrl(item.path),
      downloadUrl: item.type === 'file' ? this.getFileUrl(item.path) : undefined,
      isAccessible: true
    }));
  }

  /**
   * Get full tree for sidebar
   * In dynamic mode: uses /api/tree
   * In static mode: uses file-tree.json
   *
   * Note: This method always tries to fallback to file-tree.json if API fails,
   * regardless of dataSource state, to avoid race condition issues.
   */
  async getFullTree(): Promise<FileNode[]> {
    const cacheKey = 'fullTree';
    logDebug('LocalFileService', 'getFullTree called');

    const cached = this.getFromCache<FileNode[]>(cacheKey);
    if (cached) {
      logDebug('LocalFileService', `Cache hit for full tree`, { nodeCount: cached.length });
      return cached;
    }

    // Try API first if we're not already confirmed to be in static mode
    if (this.dataSource !== 'file-tree') {
      try {
        const tree = await this.fetchTreeFromApi();
        if (this.dataSource === 'unknown') {
          this.dataSource = 'api';
        }
        this.setCache(cacheKey, tree, this.generateContentHash(tree));
        logInfo('LocalFileService', 'Tree loaded from API', { nodeCount: tree.length });
        return tree;
      } catch (apiError) {
        logDebug('LocalFileService', 'Tree API failed, will try file-tree.json', { error: apiError });
        // Continue to fallback - don't throw here
      }
    }

    // Fallback to file-tree.json (works for both static mode and API failure)
    try {
      if (!this.fileTree) {
        await this.loadFileTree();
      }

      if (!this.fileTree) {
        throw new Error('Failed to load file tree');
      }

      // If we got here via API failure, update dataSource
      if (this.dataSource === 'unknown') {
        this.dataSource = 'file-tree';
      }

      const tree = this.convertToShallowFileNodes(this.fileTree);
      this.setCache(cacheKey, tree, this.generateContentHash(tree));
      logInfo('LocalFileService', 'Tree loaded from file-tree.json', { nodeCount: tree.length });

      return tree;
    } catch (error) {
      logError('LocalFileService', 'Error fetching full tree', { error });
      throw error;
    }
  }

  /**
   * Fetch tree structure from API endpoint (dynamic mode)
   */
  private async fetchTreeFromApi(): Promise<FileNode[]> {
    const baseUrl = this.getBaseUrl();
    const apiUrl = `${baseUrl}/api/tree`;

    logDebug('LocalFileService', 'Fetching tree from API', { apiUrl });

    const response = await fetch(apiUrl);

    if (response.status === 404) {
      throw new Error('Tree API not available');
    }

    if (!response.ok) {
      throw new Error(`Tree API error: ${response.status}`);
    }

    const items: FileTreeNode[] = await response.json();

    if ('error' in items) {
      throw new Error((items as unknown as { error: string }).error);
    }

    return this.convertToFileNodes(items);
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
   * Watch a directory for changes (only works in dynamic mode)
   */
  watchDirectory(path: string, callback: () => void): () => void {
    // Directory watching only works with API (dynamic mode)
    if (this.dataSource === 'file-tree') {
      logDebug('LocalFileService', 'Directory watching disabled in static mode');
      return () => {}; // No-op cleanup
    }

    const existingWatcher = this.watchers.get(path);
    if (existingWatcher) {
      existingWatcher.callback = callback;
      return () => this.unwatchDirectory(path);
    }

    logInfo('LocalFileService', 'Starting directory watch', { path, interval: this.watchInterval });

    const checkForChanges = async () => {
      try {
        const cacheKey = `contents:${path}`;
        const cached = this.cache.get(cacheKey);
        const oldHash = cached?.hash || '';

        this.cache.delete(cacheKey);
        const items = await this.getDirectoryContents(path);
        const newHash = this.generateContentHash(items);

        if (oldHash && oldHash !== newHash) {
          logInfo('LocalFileService', 'Directory change detected', { path, oldHash, newHash });
          callback();
        }

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

  unwatchDirectory(path: string): void {
    const watcher = this.watchers.get(path);
    if (watcher) {
      clearInterval(watcher.intervalId);
      this.watchers.delete(path);
      logInfo('LocalFileService', 'Stopped directory watch', { path });
    }
  }

  unwatchAll(): void {
    this.watchers.forEach((watcher, path) => {
      clearInterval(watcher.intervalId);
      logDebug('LocalFileService', 'Stopped watching', { path });
    });
    this.watchers.clear();
  }

  invalidateCache(path: string): void {
    const cacheKey = `contents:${path}`;
    this.cache.delete(cacheKey);
    logDebug('LocalFileService', 'Cache invalidated', { path });
  }

  private async loadFileTree(): Promise<void> {
    const baseUrl = this.getBaseUrl();
    const treeUrl = `${baseUrl}/file-tree.json`;

    logDebug('LocalFileService', 'Loading file tree from JSON', { treeUrl });

    try {
      const response = await fetch(treeUrl);

      if (!response.ok) {
        throw new Error(`Failed to load file tree: ${response.status}`);
      }

      const data = await response.json();

      // Check if it's an error response (dynamic mode returns 404 with error)
      if (data.error) {
        throw new Error(data.error);
      }

      const tree: FileTreeNode[] = data;
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
      children: item.children ? this.convertToFileNodes(item.children) : undefined,
      isAccessible: true,
      childrenLoaded: false
    }));
  }

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
      children: item.type === 'directory' && item.children
        ? this.convertToShallowFileNodes(item.children)
        : undefined
    }));
  }

  private findItemsAtPath(targetPath: string): FileTreeNode[] {
    if (!this.fileTree) return [];

    if (!targetPath || targetPath === '') {
      return this.fileTreeToRaw(this.fileTree);
    }

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
