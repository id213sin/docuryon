import {
  File,
  Folder,
  FileText,
  Image,
  FileCode,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { useExplorerStore } from '@/store/useExplorerStore';
import { cn } from '@/utils/cn';
import { formatFileSize, getFileExtension } from '@/utils/fileHelpers';
import type { FileNode, SortField } from '@/types/file';

interface ListViewProps {
  items: FileNode[];
  onItemClick: (item: FileNode) => void;
  onItemDoubleClick: (item: FileNode) => void;
}

const FILE_ICONS: Record<string, React.ElementType> = {
  md: FileText,
  txt: FileText,
  pdf: FileText,
  png: Image,
  jpg: Image,
  jpeg: Image,
  gif: Image,
  svg: Image,
  html: FileCode,
  css: FileCode,
  js: FileCode,
  ts: FileCode,
  json: FileCode
};

export function ListView({ items, onItemClick, onItemDoubleClick }: ListViewProps) {
  const { selectedItems, focusedItem, sortField, sortOrder, setSortField, setSortOrder } =
    useExplorerStore();

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? (
      <ChevronUp size={14} className="ml-1" />
    ) : (
      <ChevronDown size={14} className="ml-1" />
    );
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center px-4 py-2 border-b border-border text-sm font-medium text-muted-foreground">
        <button
          className="flex items-center flex-1 min-w-0 hover:text-foreground"
          onClick={() => handleSort('name')}
        >
          Name
          <SortIcon field="name" />
        </button>
        <button
          className="flex items-center w-24 justify-end hover:text-foreground"
          onClick={() => handleSort('size')}
        >
          Size
          <SortIcon field="size" />
        </button>
        <button
          className="flex items-center w-24 justify-end hover:text-foreground"
          onClick={() => handleSort('type')}
        >
          Type
          <SortIcon field="type" />
        </button>
      </div>

      {/* Items */}
      <div className="divide-y divide-border">
        {items.map(item => {
          const isSelected = selectedItems.has(item.path);
          const isFocused = focusedItem === item.path;
          const extension = getFileExtension(item.name);
          const IconComponent = item.type === 'directory'
            ? Folder
            : FILE_ICONS[extension] || File;

          return (
            <div
              key={item.path}
              className={cn(
                'flex items-center px-4 py-2 cursor-pointer transition-colors',
                isSelected && 'bg-primary/20',
                isFocused && 'ring-2 ring-inset ring-primary',
                !isSelected && 'hover:bg-muted'
              )}
              onClick={() => onItemClick(item)}
              onDoubleClick={() => onItemDoubleClick(item)}
              tabIndex={0}
              role="button"
              aria-selected={isSelected}
            >
              <div className="flex items-center flex-1 min-w-0 gap-3">
                <IconComponent
                  size={20}
                  className={cn(
                    item.type === 'directory' ? 'text-amber-500' : 'text-muted-foreground'
                  )}
                />
                <span className="truncate">{item.name}</span>
              </div>

              <div className="w-24 text-right text-sm text-muted-foreground">
                {item.type === 'file' && item.size !== undefined
                  ? formatFileSize(item.size)
                  : '--'}
              </div>

              <div className="w-24 text-right text-sm text-muted-foreground uppercase">
                {item.type === 'directory' ? 'Folder' : extension || 'File'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
