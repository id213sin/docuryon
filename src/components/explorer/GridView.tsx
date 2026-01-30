import { FileItem } from './FileItem';
import { useLocalFiles } from '@/hooks/useLocalFiles';
import type { FileNode } from '@/types/file';

interface GridViewProps {
  items: FileNode[];
  onItemClick: (item: FileNode) => void;
  onItemDoubleClick: (item: FileNode) => void;
}

export function GridView({ items, onItemClick, onItemDoubleClick }: GridViewProps) {
  const { getRawUrl } = useLocalFiles();

  return (
    <div className="grid grid-cols-[repeat(auto-fill,120px)] gap-2 justify-start">
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
