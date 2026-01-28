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
