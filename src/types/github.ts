export interface GitHubConfig {
  owner: string;
  repo: string;
  branch: string;
  basePath: string;
  /** GitHub API base URL (optional, defaults to https://api.github.com) */
  apiUrl?: string;
  /** GitHub raw content URL (optional, defaults to https://raw.githubusercontent.com) */
  rawUrl?: string;
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
