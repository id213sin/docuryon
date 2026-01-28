import { highlightCode } from '@/services/renderer';
import { getFileExtension } from '@/utils/fileHelpers';

interface TextPreviewProps {
  content: string;
  filename: string;
}

const LANGUAGE_MAP: Record<string, string> = {
  js: 'javascript',
  jsx: 'javascript',
  ts: 'typescript',
  tsx: 'typescript',
  py: 'python',
  rb: 'ruby',
  go: 'go',
  rs: 'rust',
  java: 'java',
  c: 'c',
  cpp: 'cpp',
  cs: 'csharp',
  php: 'php',
  html: 'html',
  css: 'css',
  scss: 'scss',
  json: 'json',
  xml: 'xml',
  yaml: 'yaml',
  yml: 'yaml',
  md: 'markdown',
  sh: 'bash',
  bash: 'bash',
  sql: 'sql'
};

export function TextPreview({ content, filename }: TextPreviewProps) {
  const extension = getFileExtension(filename);
  const language = LANGUAGE_MAP[extension] || 'plaintext';

  const highlightedCode = highlightCode(content, language);

  return (
    <div className="h-full overflow-auto">
      <pre className="p-4 text-sm font-mono leading-relaxed">
        <code
          className={`hljs language-${language}`}
          dangerouslySetInnerHTML={{ __html: highlightedCode }}
        />
      </pre>
    </div>
  );
}
