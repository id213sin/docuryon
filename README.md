# Docuryon

A self-hosted document management system deployed on GitHub Pages that functions as a file explorer for browsing, previewing, and managing documents stored in a GitHub repository.

## Features

- **File Explorer Interface**: Browse files and folders like Windows Explorer or macOS Finder
- **Multiple View Modes**: Grid and list views
- **Document Preview**: Preview Markdown, images, PDFs, and code files
- **Theme Support**: Light, dark, and system themes
- **Keyboard Navigation**: Full keyboard support for navigation
- **Search**: Filter files by name
- **Responsive Design**: Works on desktop and mobile devices

## Supported File Types

- **Documents**: Markdown (.md), Text (.txt), HTML
- **Images**: PNG, JPG, JPEG, GIF, SVG, WebP
- **PDFs**: PDF documents with preview
- **Code**: JavaScript, TypeScript, Python, JSON, CSS, and more

## Getting Started

### Prerequisites

- Node.js 20 or later
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/id213sin/docuryon.git
cd docuryon

# Install dependencies
npm install

# Start development server
npm run dev
```

### Building for Production

```bash
npm run build
```

The build output will be in the `dist/` folder.

## Configuration

### GitHub Repository Settings

Edit `src/config/app.config.ts` to configure your GitHub repository:

```typescript
import type { GitHubConfig } from '@/types/github';

export const GITHUB_CONFIG: GitHubConfig = {
  owner: 'YOUR_GITHUB_USERNAME',  // GitHub username or organization
  repo: 'YOUR_REPO_NAME',         // Repository name
  branch: 'main',                  // Branch to read files from
  basePath: 'trunk'                // Folder containing your documents
};

export const APP_CONFIG = {
  appName: 'Docuryon',             // Application title shown in header
  defaultViewMode: 'grid',         // Default view: 'grid' or 'list'
  thumbnailEnabled: true,          // Enable thumbnail generation
  thumbnailSize: {
    width: 120,
    height: 160
  },
  previewPanelWidth: 400,          // Preview panel width in pixels
  maxFilePreviewSize: 5 * 1024 * 1024,  // Max file size for preview (5MB)
  supportedPreviewTypes: [
    'md', 'txt', 'html', 'css', 'js', 'ts', 'json', 'xml',
    'pdf', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'
  ]
};
```

### Example Configurations

#### Personal Documentation Site

```typescript
export const GITHUB_CONFIG: GitHubConfig = {
  owner: 'johndoe',
  repo: 'my-docs',
  branch: 'main',
  basePath: 'documents'
};
```

#### Organization Knowledge Base

```typescript
export const GITHUB_CONFIG: GitHubConfig = {
  owner: 'my-company',
  repo: 'knowledge-base',
  branch: 'main',
  basePath: 'docs'
};
```

#### Project Documentation with Multiple Branches

```typescript
export const GITHUB_CONFIG: GitHubConfig = {
  owner: 'my-org',
  repo: 'project-docs',
  branch: 'docs',  // Separate documentation branch
  basePath: 'content'
};
```

### Hidden Files Configuration

Edit `src/config/hidden-patterns.ts` to customize which files are hidden from the explorer:

```typescript
export const HIDDEN_PATTERNS: (string | RegExp)[] = [
  // Hide specific files
  'package.json',
  'tsconfig.json',

  // Hide directories
  'node_modules',
  'dist',
  '.git',

  // Hide files starting with dot
  /^\./,

  // Hide TypeScript declaration files
  /\.d\.ts$/,
];
```

## Document Storage

Store your documents in the `trunk/` folder (or whatever `basePath` you configured). The explorer will automatically display them while hiding all application files.

### Recommended Folder Structure

```
trunk/
├── projects/           # Project documentation
│   ├── project-a/
│   │   ├── README.md
│   │   ├── specs/
│   │   └── diagrams/
│   └── project-b/
├── images/             # Image assets
│   ├── screenshots/
│   └── diagrams/
├── notes/              # Personal notes
│   └── meeting-notes/
├── templates/          # Document templates
└── README.md           # Root documentation
```

### Sample Content

The `trunk/` folder includes sample content to demonstrate the explorer:

- `trunk/README.md` - Welcome document with feature overview
- `trunk/notes/welcome.md` - Sample Markdown file showing preview features
- `trunk/projects/sample-config.json` - Sample JSON file to demonstrate code preview

These files are for demonstration purposes and can be replaced with your own content.

## Deployment

### GitHub Pages (Recommended)

This project includes a GitHub Actions workflow for automatic deployment:

1. Push your changes to the `main` branch
2. Go to repository **Settings** > **Pages**
3. Set source to **GitHub Actions**
4. The site will be available at `https://USERNAME.github.io/REPO_NAME/`

### Manual Deployment

```bash
# Build the project
npm run build

# The dist/ folder can be deployed to any static hosting service
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Arrow Up/Down` | Navigate between items |
| `Enter` | Open file/folder |
| `Backspace` | Go to parent folder |
| `Ctrl/Cmd + Left` | Navigate back |
| `Ctrl/Cmd + Right` | Navigate forward |
| `Ctrl/Cmd + A` | Select all items |
| `Escape` | Clear selection |
| `Home` | Jump to first item |
| `End` | Jump to last item |

## Technology Stack

- **React 19** - UI Library
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **Tailwind CSS** - Styling
- **Zustand** - State Management
- **Lucide React** - Icons
- **Framer Motion** - Animations
- **Marked** - Markdown Rendering
- **Highlight.js** - Code Highlighting
- **PDF.js** - PDF Preview

## API Rate Limits

Docuryon uses the GitHub REST API to fetch files. Be aware of rate limits:

- **Without authentication**: 60 requests/hour
- **With authentication**: 5,000 requests/hour

For high-traffic sites, consider implementing GitHub token authentication.

## License

MIT
