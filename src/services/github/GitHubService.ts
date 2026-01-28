import type { GitHubConfig, GitHubContentResponse, GitHubTreeResponse, GitHubTreeItem } from '@/types/github';
import type { FileNode, FileSystemItem } from '@/types/file';
import { logDebug, logInfo, logError } from '@/services/debug';

// Default GitHub URLs
const DEFAULT_API_URL = 'https://api.github.com';
const DEFAULT_RAW_URL = 'https://raw.githubusercontent.com';

export class GitHubService {
  private config: GitHubConfig;
  private baseApiUrl: string;
  private rawBaseUrl: string;
  private cache: Map<string, { data: unknown; timestamp: number }>;
  private cacheTTL: number = 5 * 60 * 1000; // 5 minutes

  constructor(config: GitHubConfig) {
    this.config = config;
    const apiUrl = config.apiUrl || DEFAULT_API_URL;
    this.baseApiUrl = `${apiUrl}/repos/${config.owner}/${config.repo}`;
    this.rawBaseUrl = config.rawUrl || DEFAULT_RAW_URL;
    this.cache = new Map();
  }

  getConfig(): GitHubConfig {
    return this.config;
  }

  async getDirectoryContents(path: string = ''): Promise<FileSystemItem[]> {
    const fullPath = this.buildPath(path);
    const cacheKey = `contents:${fullPath}`;

    logDebug('GitHubService', `getDirectoryContents called`, { path, fullPath });

    const cached = this.getFromCache<FileSystemItem[]>(cacheKey);
    if (cached) {
      logDebug('GitHubService', `Cache hit for directory contents`, { fullPath, itemCount: cached.length });
      return cached;
    }

    const url = `${this.baseApiUrl}/contents/${fullPath}?ref=${this.config.branch}`;
    logDebug('GitHubService', `Fetching from GitHub API`, { url });

    try {
      const response = await fetch(url, {
        headers: this.getHeaders()
      });

      logDebug('GitHubService', `API response received`, { status: response.status, ok: response.ok });

      if (!response.ok) {
        const errorMsg = `GitHub API error: ${response.status}`;
        logError('GitHubService', errorMsg, { url, status: response.status });
        throw new Error(errorMsg);
      }

      const data: GitHubContentResponse[] = await response.json();
      logDebug('GitHubService', `Parsed ${data.length} items from API response`);

      const items = this.transformContentResponse(data);

      this.setCache(cacheKey, items);
      logInfo('GitHubService', `Directory contents loaded and cached`, { fullPath, itemCount: items.length });

      return items;
    } catch (error) {
      logError('GitHubService', 'Error fetching directory contents', { error, url, fullPath });
      throw error;
    }
  }

  async getFullTree(): Promise<FileNode[]> {
    const cacheKey = 'fullTree';
    logDebug('GitHubService', 'getFullTree called');

    const cached = this.getFromCache<FileNode[]>(cacheKey);
    if (cached) {
      logDebug('GitHubService', `Cache hit for full tree`, { nodeCount: cached.length });
      return cached;
    }

    try {
      const refUrl = `${this.baseApiUrl}/git/ref/heads/${this.config.branch}`;
      logDebug('GitHubService', 'Fetching git ref', { refUrl });

      const refResponse = await fetch(refUrl, { headers: this.getHeaders() });
      const refData = await refResponse.json();
      const treeSha = refData.object.sha;
      logDebug('GitHubService', 'Got tree SHA', { treeSha });

      const treeUrl = `${this.baseApiUrl}/git/trees/${treeSha}?recursive=1`;
      logDebug('GitHubService', 'Fetching full tree', { treeUrl });

      const treeResponse = await fetch(treeUrl, { headers: this.getHeaders() });
      const treeData: GitHubTreeResponse = await treeResponse.json();
      logDebug('GitHubService', `Received ${treeData.tree.length} items in tree`);

      const filteredItems = treeData.tree.filter(item =>
        item.path.startsWith(this.config.basePath + '/')
      );
      logDebug('GitHubService', `Filtered to ${filteredItems.length} items in basePath`);

      const tree = this.buildTreeFromFlatList(filteredItems);
      this.setCache(cacheKey, tree);
      logInfo('GitHubService', 'Full tree loaded and cached', { nodeCount: tree.length });

      return tree;
    } catch (error) {
      logError('GitHubService', 'Error fetching full tree', { error });
      throw error;
    }
  }

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

  getRawUrl(path: string): string {
    const fullPath = this.buildPath(path);
    return `${this.rawBaseUrl}/${this.config.owner}/${this.config.repo}/${this.config.branch}/${fullPath}`;
  }

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

    items.sort((a, b) => a.path.localeCompare(b.path));

    for (const item of items) {
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
  }
}

let instance: GitHubService | null = null;

export function getGitHubService(config?: GitHubConfig): GitHubService {
  if (!instance && config) {
    logDebug('GitHubService', 'Creating new instance with provided config');
    instance = new GitHubService(config);
  }
  if (!instance) {
    const error = new Error('GitHubService not initialized');
    logError('GitHubService', 'Service not initialized when getGitHubService called', { error });
    throw error;
  }
  return instance;
}

export function initGitHubService(config: GitHubConfig): GitHubService {
  logInfo('GitHubService', 'Initializing service', {
    owner: config.owner,
    repo: config.repo,
    branch: config.branch,
    basePath: config.basePath,
    apiUrl: config.apiUrl || DEFAULT_API_URL,
    rawUrl: config.rawUrl || DEFAULT_RAW_URL,
  });
  instance = new GitHubService(config);
  return instance;
}
