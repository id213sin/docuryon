import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { MainContent } from '@/components/layout/MainContent';
import { StatusBar } from '@/components/layout/StatusBar';
import { PreviewPanel } from '@/components/preview/PreviewPanel';
import { ErrorBoundary, DebugPanel } from '@/components/common';
import { useTheme } from '@/hooks/useTheme';
import { useExplorerStore } from '@/store/useExplorerStore';
import { initLocalFileService } from '@/services/local';
import { logInfo, logDebug } from '@/services/debug';
import { TRUNK_CONFIG } from '@/config/app.config';

// Log app initialization
logInfo('App', 'Docuryon initializing', {
  userAgent: navigator.userAgent,
  url: window.location.href,
  timestamp: new Date().toISOString(),
});

// Initialize local file service at module level (before any component renders)
logDebug('App', 'Initializing local file service', { config: TRUNK_CONFIG });
initLocalFileService(TRUNK_CONFIG.basePath);
logInfo('App', 'Local file service initialized');

function AppContent() {
  const { isSidebarOpen, isPreviewOpen, previewFile } = useExplorerStore();
  useTheme();

  logDebug('App', 'AppContent rendering', { isSidebarOpen, isPreviewOpen, hasPreviewFile: !!previewFile });

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      <Header />

      <div className="flex-1 flex overflow-hidden">
        {isSidebarOpen && (
          <aside className="w-64 border-r border-border flex-shrink-0 overflow-hidden">
            <Sidebar />
          </aside>
        )}

        <main className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <MainContent />
          </div>

          {isPreviewOpen && previewFile && (
            <aside className="w-96 border-l border-border flex-shrink-0 overflow-hidden">
              <PreviewPanel file={previewFile} />
            </aside>
          )}
        </main>
      </div>

      <StatusBar />
    </div>
  );
}

function App() {
  return (
    <>
      {/* Debug Panel rendered outside ErrorBoundary via portal - always accessible */}
      <DebugPanel defaultOpen={false} position="bottom-right" />

      <ErrorBoundary>
        <AppContent />
      </ErrorBoundary>
    </>
  );
}

export default App;
