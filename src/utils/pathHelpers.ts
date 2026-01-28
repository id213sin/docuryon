export function getParentPath(path: string): string {
  const parts = path.split('/').filter(Boolean);
  parts.pop();
  return parts.join('/');
}

export function getFileName(path: string): string {
  const parts = path.split('/');
  return parts[parts.length - 1] || '';
}

export function joinPath(...parts: string[]): string {
  return parts
    .filter(Boolean)
    .join('/')
    .replace(/\/+/g, '/');
}

export function splitPath(path: string): string[] {
  return path.split('/').filter(Boolean);
}

export function normalizePath(path: string): string {
  return path.replace(/\/+/g, '/').replace(/^\/|\/$/g, '');
}

export function isSubPath(parent: string, child: string): boolean {
  const normalizedParent = normalizePath(parent);
  const normalizedChild = normalizePath(child);

  if (!normalizedParent) return true;

  return normalizedChild.startsWith(normalizedParent + '/') ||
         normalizedChild === normalizedParent;
}
