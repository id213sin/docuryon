// Patterns for files/folders to hide in the explorer
export const HIDDEN_PATTERNS: (string | RegExp)[] = [
  // Configuration files
  'index.html',
  'vite.config.ts',
  'tsconfig.json',
  'tsconfig.app.json',
  'tsconfig.node.json',
  'package.json',
  'package-lock.json',
  'postcss.config.js',
  'tailwind.config.js',
  'eslint.config.js',
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
  /^\./, // Any file starting with .

  // Build artifacts
  /\.d\.ts$/,
  /\.map$/,

  // Project specific
  'README.md',
  'LICENSE',
  'github-docs-explorer-plan.md'
];
