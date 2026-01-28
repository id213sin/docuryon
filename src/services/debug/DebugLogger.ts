export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  category: string;
  message: string;
  data?: unknown;
  stack?: string;
}

export type LogListener = (entry: LogEntry) => void;

const MAX_LOGS = 500;
const LOG_STORAGE_KEY = 'docuryon_debug_logs';

class DebugLoggerService {
  private logs: LogEntry[] = [];
  private listeners: Set<LogListener> = new Set();
  private enabled: boolean = true;
  private persistToStorage: boolean = true;

  constructor() {
    this.loadFromStorage();
    this.setupGlobalErrorHandlers();
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(LOG_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.logs = parsed.map((entry: LogEntry) => ({
          ...entry,
          timestamp: new Date(entry.timestamp),
        }));
      }
    } catch {
      // Ignore storage errors
    }
  }

  private saveToStorage(): void {
    if (!this.persistToStorage) return;
    try {
      const toStore = this.logs.slice(-100); // Only store last 100 logs
      localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(toStore));
    } catch {
      // Ignore storage errors
    }
  }

  private setupGlobalErrorHandlers(): void {
    // Catch unhandled errors
    window.addEventListener('error', (event) => {
      this.error('GlobalError', event.message, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
      });
    });

    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.error('UnhandledRejection', String(event.reason), {
        reason: event.reason,
      });
    });

    // Log performance issues
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'longtask') {
              this.warn('Performance', `Long task detected: ${entry.duration.toFixed(2)}ms`, {
                duration: entry.duration,
                startTime: entry.startTime,
              });
            }
          }
        });
        observer.observe({ entryTypes: ['longtask'] });
      } catch {
        // PerformanceObserver not fully supported
      }
    }
  }

  private addLog(level: LogLevel, category: string, message: string, data?: unknown): LogEntry {
    const entry: LogEntry = {
      id: this.generateId(),
      timestamp: new Date(),
      level,
      category,
      message,
      data,
    };

    if (level === 'error' && data instanceof Error) {
      entry.stack = data.stack;
    }

    this.logs.push(entry);

    // Trim logs if exceeding max
    if (this.logs.length > MAX_LOGS) {
      this.logs = this.logs.slice(-MAX_LOGS);
    }

    // Notify listeners
    this.listeners.forEach((listener) => {
      try {
        listener(entry);
      } catch {
        // Ignore listener errors
      }
    });

    // Save to storage
    this.saveToStorage();

    // Also log to console in development
    if (this.enabled) {
      const consoleMethod = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
      console[consoleMethod](`[${category}]`, message, data || '');
    }

    return entry;
  }

  debug(category: string, message: string, data?: unknown): LogEntry {
    return this.addLog('debug', category, message, data);
  }

  info(category: string, message: string, data?: unknown): LogEntry {
    return this.addLog('info', category, message, data);
  }

  warn(category: string, message: string, data?: unknown): LogEntry {
    return this.addLog('warn', category, message, data);
  }

  error(category: string, message: string, data?: unknown): LogEntry {
    return this.addLog('error', category, message, data);
  }

  getLogs(filter?: { level?: LogLevel; category?: string; limit?: number }): LogEntry[] {
    let result = [...this.logs];

    if (filter?.level) {
      result = result.filter((log) => log.level === filter.level);
    }

    if (filter?.category) {
      result = result.filter((log) => log.category === filter.category);
    }

    if (filter?.limit) {
      result = result.slice(-filter.limit);
    }

    return result;
  }

  getRecentLogs(count: number = 50): LogEntry[] {
    return this.logs.slice(-count);
  }

  clearLogs(): void {
    this.logs = [];
    this.saveToStorage();
  }

  subscribe(listener: LogListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  setPersistToStorage(persist: boolean): void {
    this.persistToStorage = persist;
  }

  // Export logs for debugging
  exportLogs(): string {
    const exportData = {
      exported: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      logs: this.logs,
    };
    return JSON.stringify(exportData, null, 2);
  }

  // Create GitHub issue body from logs
  createGitHubIssueBody(errorMessage: string): string {
    const recentErrors = this.logs
      .filter((log) => log.level === 'error')
      .slice(-10);

    const recentLogs = this.logs.slice(-20);

    return `## Error Report

**Error Message:** ${errorMessage}

**User Agent:** ${navigator.userAgent}

**URL:** ${window.location.href}

**Timestamp:** ${new Date().toISOString()}

### Recent Errors
\`\`\`
${recentErrors.map((log) => `[${log.timestamp.toISOString()}] ${log.category}: ${log.message}`).join('\n') || 'No recent errors'}
\`\`\`

### Recent Logs
\`\`\`
${recentLogs.map((log) => `[${log.timestamp.toISOString()}] [${log.level.toUpperCase()}] ${log.category}: ${log.message}`).join('\n')}
\`\`\`

### Stack Trace
\`\`\`
${recentErrors.find((e) => e.stack)?.stack || 'No stack trace available'}
\`\`\`
`;
  }

  // Generate GitHub issue URL
  getGitHubIssueUrl(owner: string, repo: string, errorMessage: string): string {
    const title = encodeURIComponent(`[Crash Report] ${errorMessage.slice(0, 100)}`);
    const body = encodeURIComponent(this.createGitHubIssueBody(errorMessage));
    return `https://github.com/${owner}/${repo}/issues/new?title=${title}&body=${body}&labels=bug,crash`;
  }
}

export const debugLogger = new DebugLoggerService();

// Convenience exports for quick logging
export const logDebug = debugLogger.debug.bind(debugLogger);
export const logInfo = debugLogger.info.bind(debugLogger);
export const logWarn = debugLogger.warn.bind(debugLogger);
export const logError = debugLogger.error.bind(debugLogger);
