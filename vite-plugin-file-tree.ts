import type { Plugin, ResolvedConfig } from 'vite';
import * as fs from 'fs';
import * as path from 'path';

interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  children?: FileTreeNode[];
}

interface FileTreePluginOptions {
  trunkPath?: string;
}

function getDefaultTrunkPath(): string {
  // Priority: DOCURYON_TRUNK_PATH env var > default './trunk'
  return process.env.DOCURYON_TRUNK_PATH || './trunk';
}

function scanDirectory(dirPath: string, basePath: string = ''): FileTreeNode[] {
  const items: FileTreeNode[] = [];

  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      // Skip hidden files/folders (starting with .)
      if (entry.name.startsWith('.')) continue;

      const relativePath = basePath ? `${basePath}/${entry.name}` : entry.name;
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        const children = scanDirectory(fullPath, relativePath);
        items.push({
          name: entry.name,
          path: relativePath,
          type: 'directory',
          children
        });
      } else if (entry.isFile()) {
        const stats = fs.statSync(fullPath);
        items.push({
          name: entry.name,
          path: relativePath,
          type: 'file',
          size: stats.size
        });
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not read directory ${dirPath}:`, error);
  }

  // Sort: directories first, then alphabetically
  return items.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === 'directory' ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });
}

function copyDirectorySync(src: string, dest: string): void {
  if (!fs.existsSync(src)) {
    console.warn(`Warning: Source directory does not exist: ${src}`);
    return;
  }

  fs.mkdirSync(dest, { recursive: true });

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirectorySync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

export function fileTreePlugin(options: FileTreePluginOptions = {}): Plugin {
  let config: ResolvedConfig;
  const trunkPath = options.trunkPath || getDefaultTrunkPath();

  return {
    name: 'vite-plugin-file-tree',

    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },

    // Serve file-tree.json during development
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === `${config.base}file-tree.json` || req.url === '/file-tree.json') {
          const absoluteTrunkPath = path.resolve(trunkPath);

          if (!fs.existsSync(absoluteTrunkPath)) {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: `Trunk directory not found: ${absoluteTrunkPath}` }));
            return;
          }

          const tree = scanDirectory(absoluteTrunkPath);
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(tree, null, 2));
          return;
        }
        next();
      });

      // Serve trunk files during development
      server.middlewares.use((req, res, next) => {
        const trunkPrefix = `${config.base}trunk/`;
        const trunkPrefixAlt = '/trunk/';

        if (req.url?.startsWith(trunkPrefix) || req.url?.startsWith(trunkPrefixAlt)) {
          const relativePath = req.url.startsWith(trunkPrefix)
            ? req.url.slice(trunkPrefix.length)
            : req.url.slice(trunkPrefixAlt.length);
          const absoluteTrunkPath = path.resolve(trunkPath);
          const filePath = path.join(absoluteTrunkPath, decodeURIComponent(relativePath));

          // Security check: ensure path is within trunk directory
          if (!filePath.startsWith(absoluteTrunkPath)) {
            res.statusCode = 403;
            res.end('Forbidden');
            return;
          }

          if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            const ext = path.extname(filePath).toLowerCase();
            const mimeTypes: Record<string, string> = {
              '.html': 'text/html',
              '.css': 'text/css',
              '.js': 'application/javascript',
              '.json': 'application/json',
              '.md': 'text/markdown',
              '.txt': 'text/plain',
              '.pdf': 'application/pdf',
              '.png': 'image/png',
              '.jpg': 'image/jpeg',
              '.jpeg': 'image/jpeg',
              '.gif': 'image/gif',
              '.webp': 'image/webp',
              '.svg': 'image/svg+xml',
              '.xml': 'application/xml',
              '.ts': 'text/typescript',
              '.tsx': 'text/typescript',
            };

            res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
            res.end(fs.readFileSync(filePath));
            return;
          }
        }
        next();
      });
    },

    // Generate file-tree.json and copy trunk during build
    writeBundle() {
      const absoluteTrunkPath = path.resolve(trunkPath);
      const outDir = config.build.outDir;

      console.log(`\n📁 File Tree Plugin:`);
      console.log(`   Trunk path: ${absoluteTrunkPath}`);
      console.log(`   Output dir: ${outDir}`);

      if (!fs.existsSync(absoluteTrunkPath)) {
        console.warn(`   ⚠️  Warning: Trunk directory not found: ${absoluteTrunkPath}`);
        console.warn(`   Creating empty file-tree.json`);
        fs.writeFileSync(path.join(outDir, 'file-tree.json'), '[]');
        return;
      }

      // Generate file-tree.json
      const tree = scanDirectory(absoluteTrunkPath);
      fs.writeFileSync(
        path.join(outDir, 'file-tree.json'),
        JSON.stringify(tree, null, 2)
      );
      console.log(`   ✅ Generated file-tree.json`);

      // Copy trunk directory to output
      const destTrunkPath = path.join(outDir, 'trunk');
      copyDirectorySync(absoluteTrunkPath, destTrunkPath);
      console.log(`   ✅ Copied trunk directory to ${destTrunkPath}`);
    }
  };
}

export default fileTreePlugin;
