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

### Configuration

Edit `src/config/app.config.ts` to configure your GitHub repository:

```typescript
export const GITHUB_CONFIG: GitHubConfig = {
  owner: 'YOUR_GITHUB_USERNAME',
  repo: 'YOUR_REPO_NAME',
  branch: 'main',
  basePath: 'trunk'
};
```

### Building for Production

```bash
npm run build
```

The build output will be in the `dist/` folder.

## Document Storage

Store your documents in the `trunk/` folder. The explorer will automatically display them, hiding all application files.

```
trunk/
├── projects/
│   └── project-a/
├── images/
├── notes/
└── README.md
```

## Deployment

This project includes a GitHub Actions workflow for automatic deployment to GitHub Pages. Push to the `main` branch to trigger deployment.

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

## License

MIT
