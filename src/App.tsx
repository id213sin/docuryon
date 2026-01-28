import { useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { MainContent } from '@/components/layout/MainContent';
import { StatusBar } from '@/components/layout/StatusBar';
import { PreviewPanel } from '@/components/preview/PreviewPanel';
import { useTheme } from '@/hooks/useTheme';
import { useExplorerStore } from '@/store/useExplorerStore';
import { initGitHubService } from '@/services/github';
import { GITHUB_CONFIG } from '@/config/app.config';

function App() {
  const { isSidebarOpen, isPreviewOpen, previewFile } = useExplorerStore();
  useTheme();

  useEffect(() => {
    initGitHubService(GITHUB_CONFIG);
  }, []);

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

export default App;
