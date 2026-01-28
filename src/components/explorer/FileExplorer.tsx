import { useCallback } from 'react';
import { useExplorerStore } from '@/store/useExplorerStore';
import { useGitHubApi } from '@/hooks/useGitHubApi';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';
import { GridView } from './GridView';
import { ListView } from './ListView';
import { BreadcrumbNav } from './BreadcrumbNav';
import { Spinner } from '@/components/common/Spinner';
import { FolderOpen } from 'lucide-react';
import type { FileNode } from '@/types/file';

export function FileExplorer() {
  const {
    currentItems,
    viewMode,
    isLoading,
    error,
    setCurrentPath,
    setPreviewFile
  } = useExplorerStore();

  const { getRawUrl } = useGitHubApi();

  const handleItemClick = useCallback(
    (item: FileNode) => {
      if (item.type === 'directory') {
        setCurrentPath(item.path);
      } else {
        setPreviewFile(item);
      }
    },
    [setCurrentPath, setPreviewFile]
  );

  const handleItemDoubleClick = useCallback(
    (item: FileNode) => {
      if (item.type === 'directory') {
        setCurrentPath(item.path);
      } else {
        window.open(getRawUrl(item.path), '_blank');
      }
    },
    [setCurrentPath, getRawUrl]
  );

  useKeyboardNavigation({
    onEnter: (path) => {
      const item = currentItems.find(i => i.path === path);
      if (item) handleItemDoubleClick(item);
    }
  });

  if (isLoading) {
    return (
      <div className="h-full flex flex-col">
        <BreadcrumbNav />
        <div className="flex-1 flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col">
        <BreadcrumbNav />
        <div className="flex-1 flex flex-col items-center justify-center text-destructive">
          <p className="text-lg font-medium">Error loading directory</p>
          <p className="text-sm text-muted-foreground mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (currentItems.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <BreadcrumbNav />
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
          <FolderOpen size={64} className="mb-4 opacity-50" />
          <p className="text-lg">This folder is empty</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <BreadcrumbNav />

      <div className="flex-1 overflow-auto p-4">
        {viewMode === 'grid' ? (
          <GridView
            items={currentItems}
            onItemClick={handleItemClick}
            onItemDoubleClick={handleItemDoubleClick}
          />
        ) : (
          <ListView
            items={currentItems}
            onItemClick={handleItemClick}
            onItemDoubleClick={handleItemDoubleClick}
          />
        )}
      </div>
    </div>
  );
}
