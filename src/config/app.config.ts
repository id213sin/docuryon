// Trunk (document root) configuration
// Can be overridden by DOCURYON_TRUNK_PATH environment variable at build time
export const TRUNK_CONFIG = {
  // Base path where documents are served from (relative to site root)
  basePath: '/trunk',
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
