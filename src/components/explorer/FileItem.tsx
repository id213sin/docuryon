import { useState, useEffect, memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  File,
  Folder,
  FileText,
  Image,
  FileCode,
  FileSpreadsheet,
  FileVideo,
  FileAudio,
  Archive,
  Lock,
  ShieldOff
} from 'lucide-react';
import type { FileNode } from '@/types/file';
import { useExplorerStore } from '@/store/useExplorerStore';
import { thumbnailService } from '@/services/thumbnail';
import { Tooltip } from '@/components/common/Tooltip';
import { cn } from '@/utils/cn';
import { formatFileSize, getFileExtension } from '@/utils/fileHelpers';

interface FileItemProps {
  item: FileNode;
  onClick: () => void;
  onDoubleClick: () => void;
  rawUrl?: string;
}

const FILE_ICONS: Record<string, React.ElementType> = {
  md: FileText,
  txt: FileText,
  pdf: FileText,
  doc: FileText,
  docx: FileText,
  png: Image,
  jpg: Image,
  jpeg: Image,
  gif: Image,
  svg: Image,
  webp: Image,
  html: FileCode,
  css: FileCode,
  js: FileCode,
  ts: FileCode,
  tsx: FileCode,
  jsx: FileCode,
  json: FileCode,
  xml: FileCode,
  xls: FileSpreadsheet,
  xlsx: FileSpreadsheet,
  csv: FileSpreadsheet,
  mp4: FileVideo,
  avi: FileVideo,
  mov: FileVideo,
  mp3: FileAudio,
  wav: FileAudio,
  ogg: FileAudio,
  zip: Archive,
  rar: Archive,
  '7z': Archive,
  tar: Archive
};

export const FileItem = memo(function FileItem({
  item,
  onClick,
  onDoubleClick,
  rawUrl
}: FileItemProps) {
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [showAccessDenied, setShowAccessDenied] = useState(false);

  const { selectedItems, focusedItem } = useExplorerStore();
  const isSelected = selectedItems.has(item.path);
  const isFocused = focusedItem === item.path;
  const isAccessible = item.isAccessible !== false;

  const extension = getFileExtension(item.name);
  const IconComponent = item.type === 'directory'
    ? Folder
    : FILE_ICONS[extension] || File;

  useEffect(() => {
    if (!thumbnail && rawUrl && item.type === 'file' && isAccessible) {
      thumbnailService.generateThumbnail(item, rawUrl).then(setThumbnail);
    }
  }, [item, rawUrl, thumbnail, isAccessible]);

  const handleClick = useCallback(() => {
    if (!isAccessible) {
      setShowAccessDenied(true);
      setTimeout(() => setShowAccessDenied(false), 2000);
      return;
    }
    onClick();
  }, [isAccessible, onClick]);

  const handleDoubleClick = useCallback(() => {
    if (!isAccessible) {
      setShowAccessDenied(true);
      setTimeout(() => setShowAccessDenied(false), 2000);
      return;
    }
    onDoubleClick();
  }, [isAccessible, onDoubleClick]);

  return (
    <Tooltip
      content={
        showAccessDenied ? (
          <div className="flex items-center gap-2 text-destructive">
            <ShieldOff size={16} />
            <span>{item.accessError || 'Access denied'}</span>
          </div>
        ) : thumbnail && isHovered ? (
          <img
            src={thumbnail}
            alt={item.name}
            className="max-w-[240px] max-h-[320px] rounded shadow-lg"
          />
        ) : null
      }
      enabled={!!thumbnail || showAccessDenied}
    >
      <motion.div
        className={cn(
          'group flex flex-col items-center p-3 rounded-lg cursor-pointer',
          'transition-colors duration-150',
          'w-[120px] flex-shrink-0',  // Fixed width for grid items
          isSelected && 'bg-primary/20',
          isFocused && 'ring-2 ring-primary',
          !isSelected && !isAccessible && 'hover:bg-destructive/10',
          !isSelected && isAccessible && 'hover:bg-muted',
          !isAccessible && 'opacity-70'
        )}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ scale: isAccessible ? 1.02 : 1 }}
        whileTap={{ scale: isAccessible ? 0.98 : 1 }}
        tabIndex={0}
        role="button"
        aria-selected={isSelected}
        aria-disabled={!isAccessible}
      >
        <div className="relative w-16 h-16 flex items-center justify-center mb-2">
          {thumbnail && isAccessible ? (
            <img
              src={thumbnail}
              alt={item.name}
              className="w-full h-full object-cover rounded"
            />
          ) : (
            <IconComponent
              className={cn(
                'w-10 h-10',
                item.type === 'directory' ? 'text-amber-500' : 'text-muted-foreground',
                !isAccessible && 'text-muted-foreground/50'
              )}
            />
          )}

          {/* Access denied overlay icon */}
          {!isAccessible && (
            <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5 shadow-sm border border-border">
              <Lock
                size={14}
                className="text-destructive"
              />
            </div>
          )}
        </div>

        {/* File name with 2-line clamp and ellipsis */}
        <span
          className={cn(
            'text-xs text-center w-full px-1 leading-tight',
            'line-clamp-2 break-words',  // 2-line clamp with word break
            isSelected && 'font-medium',
            !isAccessible && 'text-muted-foreground'
          )}
          title={item.name}
        >
          {item.name}
        </span>

        {item.type === 'file' && item.size !== undefined && (
          <span className={cn(
            'text-[10px] mt-1',
            isAccessible ? 'text-muted-foreground' : 'text-muted-foreground/50'
          )}>
            {formatFileSize(item.size)}
          </span>
        )}

        {/* Show access denied indicator when clicked */}
        {showAccessDenied && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-destructive/20 rounded-lg"
          >
            <div className="flex items-center gap-1 text-destructive text-xs font-medium">
              <ShieldOff size={12} />
              <span>Access Denied</span>
            </div>
          </motion.div>
        )}
      </motion.div>
    </Tooltip>
  );
});
