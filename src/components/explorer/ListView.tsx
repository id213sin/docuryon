import { useState, useCallback } from 'react';
import {
  File,
  Folder,
  FileText,
  Image,
  FileCode,
  ChevronUp,
  ChevronDown,
  Lock,
  ShieldOff
} from 'lucide-react';
import { useExplorerStore } from '@/store/useExplorerStore';
import { Tooltip } from '@/components/common/Tooltip';
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

function ListItem({
  item,
  onItemClick,
  onItemDoubleClick
}: {
  item: FileNode;
  onItemClick: (item: FileNode) => void;
  onItemDoubleClick: (item: FileNode) => void;
}) {
  const { selectedItems, focusedItem } = useExplorerStore();
  const [showAccessDenied, setShowAccessDenied] = useState(false);

  const isSelected = selectedItems.has(item.path);
  const isFocused = focusedItem === item.path;
  const isAccessible = item.isAccessible !== false;
  const extension = getFileExtension(item.name);
  const IconComponent = item.type === 'directory'
    ? Folder
    : FILE_ICONS[extension] || File;

  const handleClick = useCallback(() => {
    if (!isAccessible) {
      setShowAccessDenied(true);
      setTimeout(() => setShowAccessDenied(false), 2000);
      return;
    }
    onItemClick(item);
  }, [isAccessible, item, onItemClick]);

  const handleDoubleClick = useCallback(() => {
    if (!isAccessible) {
      setShowAccessDenied(true);
      setTimeout(() => setShowAccessDenied(false), 2000);
      return;
    }
    onItemDoubleClick(item);
  }, [isAccessible, item, onItemDoubleClick]);

  return (
    <Tooltip
      content={
        showAccessDenied ? (
          <div className="flex items-center gap-2 text-destructive">
            <ShieldOff size={16} />
            <span>{item.accessError || 'Access denied'}</span>
          </div>
        ) : null
      }
      enabled={showAccessDenied}
    >
      <div
        className={cn(
          'flex items-center px-4 py-2 cursor-pointer transition-colors relative',
          isSelected && 'bg-primary/20',
          isFocused && 'ring-2 ring-inset ring-primary',
          !isSelected && isAccessible && 'hover:bg-muted',
          !isSelected && !isAccessible && 'hover:bg-destructive/10',
          !isAccessible && 'opacity-70'
        )}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        tabIndex={0}
        role="button"
        aria-selected={isSelected}
        aria-disabled={!isAccessible}
      >
        <div className="flex items-center flex-1 min-w-0 gap-3">
          <div className="relative">
            <IconComponent
              size={20}
              className={cn(
                item.type === 'directory' ? 'text-amber-500' : 'text-muted-foreground',
                !isAccessible && 'text-muted-foreground/50'
              )}
            />
            {!isAccessible && (
              <div className="absolute -bottom-1 -right-1 bg-background rounded-full">
                <Lock size={10} className="text-destructive" />
              </div>
            )}
          </div>
          <span className={cn(
            'truncate',
            !isAccessible && 'text-muted-foreground'
          )}>
            {item.name}
          </span>
        </div>

        <div className={cn(
          'w-24 text-right text-sm',
          isAccessible ? 'text-muted-foreground' : 'text-muted-foreground/50'
        )}>
          {item.type === 'file' && item.size !== undefined
            ? formatFileSize(item.size)
            : '--'}
        </div>

        <div className={cn(
          'w-24 text-right text-sm uppercase',
          isAccessible ? 'text-muted-foreground' : 'text-muted-foreground/50'
        )}>
          {item.type === 'directory' ? 'Folder' : extension || 'File'}
        </div>

        {/* Access denied indicator */}
        {showAccessDenied && (
          <div className="absolute inset-0 flex items-center justify-center bg-destructive/20">
            <div className="flex items-center gap-1 text-destructive text-xs font-medium">
              <ShieldOff size={12} />
              <span>Access Denied</span>
            </div>
          </div>
        )}
      </div>
    </Tooltip>
  );
}

export function ListView({ items, onItemClick, onItemDoubleClick }: ListViewProps) {
  const { sortField, sortOrder, setSortField, setSortOrder } = useExplorerStore();

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
        {items.map(item => (
          <ListItem
            key={item.path}
            item={item}
            onItemClick={onItemClick}
            onItemDoubleClick={onItemDoubleClick}
          />
        ))}
      </div>
    </div>
  );
}
