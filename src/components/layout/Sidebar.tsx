import { ChevronRight, ChevronDown, Folder, FolderOpen } from 'lucide-react';
import { useExplorerStore } from '@/store/useExplorerStore';
import { cn } from '@/utils/cn';
import type { FileNode } from '@/types/file';

export function Sidebar() {
  const { fileTree } = useExplorerStore();

  return (
    <div className="h-full overflow-auto p-2">
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-2">
        Folders
      </div>
      <TreeNode nodes={fileTree} level={0} />
    </div>
  );
}

interface TreeNodeProps {
  nodes: FileNode[];
  level: number;
}

function TreeNode({ nodes, level }: TreeNodeProps) {
  const { expandedFolders, toggleFolderExpand, setCurrentPath, currentPath } = useExplorerStore();

  const folders = nodes.filter(node => node.type === 'directory');

  if (folders.length === 0) {
    return null;
  }

  return (
    <ul className="space-y-0.5">
      {folders.map(folder => {
        const isExpanded = expandedFolders.has(folder.path);
        const isActive = currentPath === folder.path;
        const hasChildren = folder.children && folder.children.some(c => c.type === 'directory');

        return (
          <li key={folder.path}>
            <div
              className={cn(
                'flex items-center gap-1 px-2 py-1.5 rounded-md cursor-pointer transition-colors',
                'hover:bg-muted',
                isActive && 'bg-primary/10 text-primary'
              )}
              style={{ paddingLeft: `${level * 12 + 8}px` }}
              onClick={() => setCurrentPath(folder.path)}
            >
              <button
                className="p-0.5 hover:bg-muted-foreground/10 rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFolderExpand(folder.path);
                }}
              >
                {hasChildren ? (
                  isExpanded ? (
                    <ChevronDown size={14} className="text-muted-foreground" />
                  ) : (
                    <ChevronRight size={14} className="text-muted-foreground" />
                  )
                ) : (
                  <span className="w-3.5" />
                )}
              </button>

              {isExpanded ? (
                <FolderOpen size={16} className="text-amber-500 flex-shrink-0" />
              ) : (
                <Folder size={16} className="text-amber-500 flex-shrink-0" />
              )}

              <span className="truncate text-sm">{folder.name}</span>
            </div>

            {isExpanded && folder.children && (
              <TreeNode nodes={folder.children} level={level + 1} />
            )}
          </li>
        );
      })}
    </ul>
  );
}
