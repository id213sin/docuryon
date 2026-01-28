import {
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  LayoutGrid,
  List,
  Search,
  SidebarClose,
  SidebarOpen,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { useExplorerStore } from '@/store/useExplorerStore';
import { useGitHubApi } from '@/hooks/useGitHubApi';
import { APP_CONFIG } from '@/config/app.config';

export function Header() {
  const {
    viewMode,
    setViewMode,
    navigateBack,
    navigateForward,
    navigateUp,
    historyIndex,
    pathHistory,
    currentPath,
    isSidebarOpen,
    toggleSidebar,
    setFilter,
    filter
  } = useExplorerStore();

  const { loadDirectory } = useGitHubApi();

  const canGoBack = historyIndex > 0;
  const canGoForward = historyIndex < pathHistory.length - 1;
  const canGoUp = currentPath !== '';

  return (
    <header className="h-14 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center px-4 gap-2">
      {/* Sidebar Toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        title={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        {isSidebarOpen ? <SidebarClose size={20} /> : <SidebarOpen size={20} />}
      </Button>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={navigateBack}
          disabled={!canGoBack}
          title="Go back"
        >
          <ChevronLeft size={20} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={navigateForward}
          disabled={!canGoForward}
          title="Go forward"
        >
          <ChevronRight size={20} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={navigateUp}
          disabled={!canGoUp}
          title="Go up"
        >
          <ChevronUp size={20} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => loadDirectory()}
          title="Refresh"
        >
          <RefreshCw size={18} />
        </Button>
      </div>

      {/* App Title */}
      <h1 className="text-lg font-semibold ml-2 hidden sm:block">
        {APP_CONFIG.appName}
      </h1>

      {/* Search */}
      <div className="flex-1 max-w-md mx-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search files..."
            className="pl-10 h-9"
            value={filter.searchQuery}
            onChange={(e) => setFilter({ searchQuery: e.target.value })}
          />
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center gap-1 border rounded-md p-1">
        <Button
          variant={viewMode === 'grid' ? 'default' : 'ghost'}
          size="icon"
          className="h-7 w-7"
          onClick={() => setViewMode('grid')}
          title="Grid view"
        >
          <LayoutGrid size={16} />
        </Button>
        <Button
          variant={viewMode === 'list' ? 'default' : 'ghost'}
          size="icon"
          className="h-7 w-7"
          onClick={() => setViewMode('list')}
          title="List view"
        >
          <List size={16} />
        </Button>
      </div>

      {/* Theme Toggle */}
      <ThemeToggle />
    </header>
  );
}
