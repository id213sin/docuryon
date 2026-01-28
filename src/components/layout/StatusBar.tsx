import { useExplorerStore } from '@/store/useExplorerStore';
import { formatFileSize } from '@/utils/fileHelpers';

export function StatusBar() {
  const { currentItems, selectedItems, isLoading } = useExplorerStore();

  const files = currentItems.filter(i => i.type === 'file');
  const folders = currentItems.filter(i => i.type === 'directory');

  const totalSize = files.reduce((acc, file) => acc + (file.size || 0), 0);

  return (
    <footer className="h-8 border-t border-border bg-muted/50 flex items-center px-4 text-xs text-muted-foreground">
      {isLoading ? (
        <span>Loading...</span>
      ) : (
        <>
          <span>
            {folders.length} folder{folders.length !== 1 ? 's' : ''}, {files.length} file{files.length !== 1 ? 's' : ''}
          </span>

          {totalSize > 0 && (
            <>
              <span className="mx-2">|</span>
              <span>Total: {formatFileSize(totalSize)}</span>
            </>
          )}

          {selectedItems.size > 0 && (
            <>
              <span className="mx-2">|</span>
              <span>{selectedItems.size} selected</span>
            </>
          )}
        </>
      )}
    </footer>
  );
}
