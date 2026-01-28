import { useState, useEffect, useRef } from 'react';
import { debugLogger, type LogEntry, type LogLevel } from '@/services/debug';
import {
  Bug,
  X,
  Trash2,
  Download,
  ChevronDown,
  ChevronUp,
  Filter,
  AlertCircle,
  AlertTriangle,
  Info,
  Terminal,
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface DebugPanelProps {
  defaultOpen?: boolean;
  position?: 'bottom-right' | 'bottom-left';
}

export function DebugPanel({
  defaultOpen = false,
  position = 'bottom-right',
}: DebugPanelProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isMinimized, setIsMinimized] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<LogLevel | 'all'>('all');
  const [autoScroll, setAutoScroll] = useState(true);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load initial logs
    setLogs(debugLogger.getRecentLogs(100));

    // Subscribe to new logs
    const unsubscribe = debugLogger.subscribe((entry) => {
      setLogs((prev) => [...prev.slice(-99), entry]);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const handleClear = () => {
    debugLogger.clearLogs();
    setLogs([]);
  };

  const handleDownload = () => {
    const exportData = debugLogger.exportLogs();
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `docuryon-logs-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredLogs =
    filter === 'all' ? logs : logs.filter((log) => log.level === filter);

  const getLogIcon = (level: LogLevel) => {
    switch (level) {
      case 'error':
        return <AlertCircle className="w-3 h-3 text-red-500" />;
      case 'warn':
        return <AlertTriangle className="w-3 h-3 text-yellow-500" />;
      case 'info':
        return <Info className="w-3 h-3 text-blue-500" />;
      default:
        return <Terminal className="w-3 h-3 text-gray-500" />;
    }
  };

  const getLogClass = (level: LogLevel) => {
    switch (level) {
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-l-2 border-red-500';
      case 'warn':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-l-2 border-yellow-500';
      case 'info':
        return 'bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-500';
      default:
        return 'bg-gray-50 dark:bg-gray-800 border-l-2 border-gray-300 dark:border-gray-600';
    }
  };

  const errorCount = logs.filter((l) => l.level === 'error').length;
  const warnCount = logs.filter((l) => l.level === 'warn').length;

  // Toggle button when panel is closed
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed z-50 p-3 bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-700 transition-all',
          position === 'bottom-right' ? 'bottom-4 right-4' : 'bottom-4 left-4',
          errorCount > 0 && 'animate-pulse bg-red-600 hover:bg-red-700'
        )}
        title="Open Debug Panel"
      >
        <Bug className="w-5 h-5" />
        {(errorCount > 0 || warnCount > 0) && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {errorCount || warnCount}
          </span>
        )}
      </button>
    );
  }

  return (
    <div
      className={cn(
        'fixed z-50 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl transition-all',
        position === 'bottom-right' ? 'bottom-4 right-4' : 'bottom-4 left-4',
        isMinimized ? 'w-64' : 'w-96 max-w-[calc(100vw-2rem)]'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-t-lg border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Bug className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <span className="font-semibold text-sm text-gray-700 dark:text-gray-300">
            Debug Logs
          </span>
          {errorCount > 0 && (
            <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs rounded">
              {errorCount} errors
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            {isMinimized ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Toolbar */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <Filter className="w-3 h-3 text-gray-500" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as LogLevel | 'all')}
                className="text-xs bg-transparent border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
              >
                <option value="all">All</option>
                <option value="error">Errors</option>
                <option value="warn">Warnings</option>
                <option value="info">Info</option>
                <option value="debug">Debug</option>
              </select>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleDownload}
                className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                title="Download Logs"
              >
                <Download className="w-3 h-3" />
              </button>
              <button
                onClick={handleClear}
                className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-red-500"
                title="Clear Logs"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Logs */}
          <div className="h-64 overflow-auto">
            {filteredLogs.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                No logs yet
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className={cn('px-3 py-2 text-xs', getLogClass(log.level))}
                  >
                    <div className="flex items-start gap-2">
                      {getLogIcon(log.level)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-700 dark:text-gray-300">
                            [{log.category}]
                          </span>
                          <span className="text-gray-400 text-[10px]">
                            {log.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 break-words mt-0.5">
                          {log.message}
                        </p>
                        {log.data !== undefined && log.data !== null && (
                          <details className="mt-1">
                            <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
                              Data
                            </summary>
                            <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded text-[10px] overflow-auto max-h-24">
                              {JSON.stringify(log.data, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700 text-[10px] text-gray-500 flex items-center justify-between">
            <span>{filteredLogs.length} entries</span>
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={autoScroll}
                onChange={(e) => setAutoScroll(e.target.checked)}
                className="w-3 h-3"
              />
              Auto-scroll
            </label>
          </div>
        </>
      )}
    </div>
  );
}
