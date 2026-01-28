import type { GitHubConfig } from '@/types/github';

// These values should be set based on your repository
export const GITHUB_CONFIG: GitHubConfig = {
  owner: 'id213sin',
  repo: 'docuryon',
  branch: 'main',
  basePath: 'trunk',

  // GitHub Enterprise configuration (optional)
  // Uncomment and modify for GitHub Enterprise Server:
  // apiUrl: 'https://github.your-company.com/api/v3',
  // rawUrl: 'https://github.your-company.com/raw',
};

export const APP_CONFIG = {
  appName: 'Docuryon',
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
