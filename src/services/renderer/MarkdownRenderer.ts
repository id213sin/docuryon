import { marked } from 'marked';
import hljs from 'highlight.js';

// Configure marked to use highlight.js for code blocks
marked.setOptions({
  gfm: true,
  breaks: true,
});

// Custom renderer for code highlighting
const renderer = new marked.Renderer();

renderer.code = function ({ text, lang }: { text: string; lang?: string }) {
  const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext';
  const highlighted = hljs.highlight(text, { language }).value;
  return `<pre><code class="hljs language-${language}">${highlighted}</code></pre>`;
};

marked.use({ renderer });

export function renderMarkdown(content: string): string {
  return marked.parse(content) as string;
}

export function highlightCode(code: string, language?: string): string {
  if (language && hljs.getLanguage(language)) {
    return hljs.highlight(code, { language }).value;
  }
  return hljs.highlightAuto(code).value;
}
