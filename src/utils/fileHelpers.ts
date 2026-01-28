export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

export function getFileIcon(filename: string): string {
  const ext = getFileExtension(filename);
  const iconMap: Record<string, string> = {
    // Documents
    pdf: 'file-text',
    doc: 'file-text',
    docx: 'file-text',
    txt: 'file-text',
    md: 'file-text',
    rtf: 'file-text',

    // Spreadsheets
    xls: 'file-spreadsheet',
    xlsx: 'file-spreadsheet',
    csv: 'file-spreadsheet',

    // Presentations
    ppt: 'file-presentation',
    pptx: 'file-presentation',

    // Images
    png: 'image',
    jpg: 'image',
    jpeg: 'image',
    gif: 'image',
    svg: 'image',
    webp: 'image',
    ico: 'image',

    // Code
    html: 'file-code',
    css: 'file-code',
    js: 'file-code',
    ts: 'file-code',
    jsx: 'file-code',
    tsx: 'file-code',
    json: 'file-code',
    xml: 'file-code',
    yml: 'file-code',
    yaml: 'file-code',

    // Archives
    zip: 'file-archive',
    rar: 'file-archive',
    '7z': 'file-archive',
    tar: 'file-archive',
    gz: 'file-archive',

    // Video
    mp4: 'file-video',
    avi: 'file-video',
    mov: 'file-video',
    mkv: 'file-video',
    webm: 'file-video',

    // Audio
    mp3: 'file-audio',
    wav: 'file-audio',
    ogg: 'file-audio',
    flac: 'file-audio'
  };

  return iconMap[ext] || 'file';
}

export function isPreviewable(filename: string): boolean {
  const previewableExtensions = [
    'md', 'txt', 'html', 'css', 'js', 'ts', 'jsx', 'tsx',
    'json', 'xml', 'yml', 'yaml',
    'pdf',
    'png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'
  ];
  const ext = getFileExtension(filename);
  return previewableExtensions.includes(ext);
}

export function isImageFile(filename: string): boolean {
  const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico', 'bmp'];
  return imageExtensions.includes(getFileExtension(filename));
}

export function isPdfFile(filename: string): boolean {
  return getFileExtension(filename) === 'pdf';
}

export function isTextFile(filename: string): boolean {
  const textExtensions = [
    'md', 'txt', 'html', 'css', 'js', 'ts', 'jsx', 'tsx',
    'json', 'xml', 'yml', 'yaml', 'sh', 'bash', 'py', 'rb',
    'java', 'c', 'cpp', 'h', 'hpp', 'go', 'rs', 'php'
  ];
  return textExtensions.includes(getFileExtension(filename));
}
