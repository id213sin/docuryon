import { FileItem } from './FileItem';
import { useGitHubApi } from '@/hooks/useGitHubApi';
import type { FileNode } from '@/types/file';

interface GridViewProps {
  items: FileNode[];
  onItemClick: (item: FileNode) => void;
  onItemDoubleClick: (item: FileNode) => void;
}

export function GridView({ items, onItemClick, onItemDoubleClick }: GridViewProps) {
  const { getRawUrl } = useGitHubApi();

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-2">
      {items.map(item => (
        <FileItem
          key={item.path}
          item={item}
          onClick={() => onItemClick(item)}
          onDoubleClick={() => onItemDoubleClick(item)}
          rawUrl={item.type === 'file' ? getRawUrl(item.path) : undefined}
        />
      ))}
    </div>
  );
}
