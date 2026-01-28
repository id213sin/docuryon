# Docuryon

A self-hosted document management system that functions as a file explorer for browsing, previewing, and managing documents. Deploy on GitHub Pages, any static hosting service, or run locally.

## Features

- **File Explorer Interface**: Browse files and folders like Windows Explorer or macOS Finder
- **Multiple View Modes**: Grid and list views
- **Document Preview**: Preview Markdown, images, PDFs, and code files
- **Theme Support**: Light, dark, and system themes
- **Keyboard Navigation**: Full keyboard support for navigation
- **Search**: Filter files by name
- **Responsive Design**: Works on desktop and mobile devices
- **Static Deployment**: No backend required - works with any static hosting

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

### Document Root Path (Trunk)

Docuryon serves documents from a configurable "trunk" folder. You can configure this path in two ways:

#### Option 1: Environment Variable

Set the `DOCURYON_TRUNK_PATH` environment variable before building:

```bash
# Use custom document path
DOCURYON_TRUNK_PATH=./docs npm run build

# Or with different folder
DOCURYON_TRUNK_PATH=./my-documents npm run build
```

#### Option 2: Default Configuration

Without any environment variable, Docuryon defaults to `./trunk` folder.

### Application Settings

Edit `src/config/app.config.ts` to customize application settings:

```typescript
export const TRUNK_CONFIG = {
  basePath: '/trunk',  // URL path where documents are served
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

Store your documents in the `trunk/` folder (or your configured document root). The explorer will automatically display them while hiding all application files.

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

## How It Works

Docuryon uses a Vite plugin that:

1. **At build time**: Scans your trunk folder and generates a `file-tree.json` manifest
2. **At build time**: Copies all documents from trunk to the build output
3. **At runtime**: Loads the file tree from the manifest and serves documents as static files

This approach means:
- No API calls or backend required
- Works with any static hosting service
- All documents are bundled with the deployment
- Fast file access through direct URLs

## Deployment

### GitHub Pages (Recommended)

This project includes a GitHub Actions workflow for automatic deployment:

1. Push your changes to the `main` branch
2. Go to repository **Settings** > **Pages**
3. Set source to **GitHub Actions**
4. The site will be available at `https://USERNAME.github.io/REPO_NAME/`

### Other Static Hosting Services

```bash
# Build the project
npm run build

# The dist/ folder can be deployed to any static hosting service:
# - Netlify
# - Vercel
# - AWS S3 + CloudFront
# - Google Cloud Storage
# - Azure Static Web Apps
# - Any web server
```

### Local Server

For testing or local use:

```bash
npm run build
npm run preview
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

## Development

```bash
# Run development server
npm run dev

# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Build for production
npm run build
```

## License

MIT
