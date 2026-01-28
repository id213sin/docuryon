import { ChevronRight, Home } from 'lucide-react';
import { useExplorerStore } from '@/store/useExplorerStore';
import { cn } from '@/utils/cn';

export function BreadcrumbNav() {
  const { currentPath, setCurrentPath } = useExplorerStore();

  const parts = currentPath ? currentPath.split('/').filter(Boolean) : [];

  return (
    <nav className="flex items-center px-4 py-2 border-b border-border text-sm overflow-x-auto">
      <button
        className={cn(
          'flex items-center gap-1 px-2 py-1 rounded hover:bg-muted transition-colors',
          !currentPath && 'bg-muted font-medium'
        )}
        onClick={() => setCurrentPath('')}
      >
        <Home size={16} />
        <span>Root</span>
      </button>

      {parts.map((part, index) => {
        const path = parts.slice(0, index + 1).join('/');
        const isLast = index === parts.length - 1;

        return (
          <div key={path} className="flex items-center">
            <ChevronRight size={16} className="mx-1 text-muted-foreground" />
            <button
              className={cn(
                'px-2 py-1 rounded hover:bg-muted transition-colors truncate max-w-[150px]',
                isLast && 'bg-muted font-medium'
              )}
              onClick={() => setCurrentPath(path)}
              title={part}
            >
              {part}
            </button>
          </div>
        );
      })}
    </nav>
  );
}
