import { Component, type ReactNode } from 'react';
import { debugLogger, logError } from '@/services/debug';
import { AlertTriangle, RefreshCw, Bug, Download, ExternalLink } from 'lucide-react';
import { GITHUB_CONFIG } from '@/config/app.config';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  showLogs: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showLogs: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    logError('ErrorBoundary', `React error: ${error.message}`, {
      error,
      componentStack: errorInfo.componentStack,
    });

    this.setState({ errorInfo });
  }

  handleReload = (): void => {
    window.location.reload();
  };

  handleClearAndReload = (): void => {
    debugLogger.clearLogs();
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  toggleLogs = (): void => {
    this.setState((prev) => ({ showLogs: !prev.showLogs }));
  };

  downloadLogs = (): void => {
    const logs = debugLogger.exportLogs();
    const blob = new Blob([logs], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `docuryon-crash-logs-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  openGitHubIssue = (): void => {
    const errorMessage = this.state.error?.message || 'Unknown error';
    const url = debugLogger.getGitHubIssueUrl(
      GITHUB_CONFIG.owner,
      GITHUB_CONFIG.repo,
      errorMessage
    );
    window.open(url, '_blank');
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const recentLogs = debugLogger.getRecentLogs(30);

      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-red-500 text-white p-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-8 h-8" />
                <div>
                  <h1 className="text-xl font-bold">Application Crashed</h1>
                  <p className="text-red-100 text-sm mt-1">
                    An unexpected error occurred
                  </p>
                </div>
              </div>
            </div>

            {/* Error Details */}
            <div className="p-6 space-y-4">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <h2 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                  Error Message
                </h2>
                <pre className="text-sm text-red-700 dark:text-red-300 whitespace-pre-wrap break-words font-mono">
                  {this.state.error?.message || 'Unknown error'}
                </pre>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={this.handleReload}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reload Page
                </button>

                <button
                  onClick={this.handleClearAndReload}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Clear Data & Reload
                </button>

                <button
                  onClick={this.openGitHubIssue}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <Bug className="w-4 h-4" />
                  Report Issue
                  <ExternalLink className="w-3 h-3" />
                </button>

                <button
                  onClick={this.downloadLogs}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download Logs
                </button>
              </div>

              {/* Debug Logs Toggle */}
              <button
                onClick={this.toggleLogs}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                {this.state.showLogs ? 'Hide Debug Logs' : 'Show Debug Logs'}
              </button>

              {/* Debug Logs */}
              {this.state.showLogs && (
                <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 max-h-64 overflow-auto">
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Recent Logs ({recentLogs.length})
                  </h3>
                  <div className="space-y-1 font-mono text-xs">
                    {recentLogs.map((log) => (
                      <div
                        key={log.id}
                        className={`p-1 rounded ${
                          log.level === 'error'
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                            : log.level === 'warn'
                            ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
                            : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <span className="opacity-60">
                          [{log.timestamp.toLocaleTimeString()}]
                        </span>{' '}
                        <span className="font-semibold">[{log.category}]</span>{' '}
                        {log.message}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stack Trace */}
              {this.state.error?.stack && (
                <details className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4">
                  <summary className="cursor-pointer font-semibold text-gray-700 dark:text-gray-300">
                    Stack Trace
                  </summary>
                  <pre className="mt-2 text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap overflow-auto max-h-48">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}

              {/* Component Stack */}
              {this.state.errorInfo?.componentStack && (
                <details className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4">
                  <summary className="cursor-pointer font-semibold text-gray-700 dark:text-gray-300">
                    Component Stack
                  </summary>
                  <pre className="mt-2 text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap overflow-auto max-h-48">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
