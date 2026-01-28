import { useState, useEffect, memo } from 'react';
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
  Archive
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

  const { selectedItems, focusedItem } = useExplorerStore();
  const isSelected = selectedItems.has(item.path);
  const isFocused = focusedItem === item.path;

  const extension = getFileExtension(item.name);
  const IconComponent = item.type === 'directory'
    ? Folder
    : FILE_ICONS[extension] || File;

  useEffect(() => {
    if (!thumbnail && rawUrl && item.type === 'file') {
      thumbnailService.generateThumbnail(item, rawUrl).then(setThumbnail);
    }
  }, [item, rawUrl, thumbnail]);

  return (
    <Tooltip
      content={
        thumbnail && isHovered ? (
          <img
            src={thumbnail}
            alt={item.name}
            className="max-w-[240px] max-h-[320px] rounded shadow-lg"
          />
        ) : null
      }
      enabled={!!thumbnail}
    >
      <motion.div
        className={cn(
          'group flex flex-col items-center p-3 rounded-lg cursor-pointer',
          'transition-colors duration-150',
          isSelected && 'bg-primary/20',
          isFocused && 'ring-2 ring-primary',
          !isSelected && 'hover:bg-muted'
        )}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        tabIndex={0}
        role="button"
        aria-selected={isSelected}
      >
        <div className="relative w-20 h-20 flex items-center justify-center mb-2">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={item.name}
              className="w-full h-full object-cover rounded"
            />
          ) : (
            <IconComponent
              className={cn(
                'w-12 h-12',
                item.type === 'directory' ? 'text-amber-500' : 'text-muted-foreground'
              )}
            />
          )}
        </div>

        <span
          className={cn(
            'text-sm text-center truncate w-full px-1',
            isSelected && 'font-medium'
          )}
          title={item.name}
        >
          {item.name}
        </span>

        {item.type === 'file' && item.size !== undefined && (
          <span className="text-xs text-muted-foreground mt-1">
            {formatFileSize(item.size)}
          </span>
        )}
      </motion.div>
    </Tooltip>
  );
});
