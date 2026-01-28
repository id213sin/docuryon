import { describe, it, expect } from 'vitest';
import { renderMarkdown, highlightCode } from '@/services/renderer/MarkdownRenderer';

describe('MarkdownRenderer', () => {
  describe('renderMarkdown', () => {
    it('should render basic markdown text', () => {
      const markdown = 'Hello World';
      const html = renderMarkdown(markdown);

      expect(html).toContain('Hello World');
      expect(html).toContain('<p>');
    });

    it('should render headings', () => {
      const markdown = '# Heading 1\n## Heading 2\n### Heading 3';
      const html = renderMarkdown(markdown);

      expect(html).toContain('<h1');
      expect(html).toContain('Heading 1');
      expect(html).toContain('<h2');
      expect(html).toContain('Heading 2');
      expect(html).toContain('<h3');
      expect(html).toContain('Heading 3');
    });

    it('should render bold and italic text', () => {
      const markdown = '**bold** and *italic*';
      const html = renderMarkdown(markdown);

      expect(html).toContain('<strong>bold</strong>');
      expect(html).toContain('<em>italic</em>');
    });

    it('should render links', () => {
      const markdown = '[GitHub](https://github.com)';
      const html = renderMarkdown(markdown);

      expect(html).toContain('<a');
      expect(html).toContain('href="https://github.com"');
      expect(html).toContain('GitHub');
    });

    it('should render unordered lists', () => {
      const markdown = '- Item 1\n- Item 2\n- Item 3';
      const html = renderMarkdown(markdown);

      expect(html).toContain('<ul>');
      expect(html).toContain('<li>');
      expect(html).toContain('Item 1');
      expect(html).toContain('Item 2');
      expect(html).toContain('Item 3');
    });

    it('should render ordered lists', () => {
      const markdown = '1. First\n2. Second\n3. Third';
      const html = renderMarkdown(markdown);

      expect(html).toContain('<ol>');
      expect(html).toContain('<li>');
    });

    it('should render inline code', () => {
      const markdown = 'Use `const` for constants';
      const html = renderMarkdown(markdown);

      expect(html).toContain('<code>const</code>');
    });

    it('should render code blocks with syntax highlighting', () => {
      const markdown = '```javascript\nconst x = 1;\n```';
      const html = renderMarkdown(markdown);

      expect(html).toContain('<pre>');
      expect(html).toContain('<code');
      expect(html).toContain('hljs');
      expect(html).toContain('language-javascript');
    });

    it('should render blockquotes', () => {
      const markdown = '> This is a quote';
      const html = renderMarkdown(markdown);

      expect(html).toContain('<blockquote>');
      expect(html).toContain('This is a quote');
    });

    it('should render images', () => {
      const markdown = '![Alt text](https://example.com/image.png)';
      const html = renderMarkdown(markdown);

      expect(html).toContain('<img');
      expect(html).toContain('src="https://example.com/image.png"');
      expect(html).toContain('alt="Alt text"');
    });

    it('should render horizontal rules', () => {
      const markdown = 'Before\n\n---\n\nAfter';
      const html = renderMarkdown(markdown);

      expect(html).toContain('<hr');
    });

    it('should render tables (GFM)', () => {
      const markdown = '| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1 | Cell 2 |';
      const html = renderMarkdown(markdown);

      expect(html).toContain('<table>');
      expect(html).toContain('<th>');
      expect(html).toContain('<td>');
      expect(html).toContain('Header 1');
      expect(html).toContain('Cell 1');
    });

    it('should handle line breaks (GFM)', () => {
      const markdown = 'Line 1\nLine 2';
      const html = renderMarkdown(markdown);

      expect(html).toContain('<br');
    });

    it('should handle empty content', () => {
      const html = renderMarkdown('');
      expect(html).toBe('');
    });

    it('should handle complex markdown document', () => {
      const markdown = `# Document Title

This is a paragraph with **bold** and *italic* text.

## Code Example

\`\`\`typescript
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}
\`\`\`

### Features

- Feature 1
- Feature 2
- Feature 3

> Important note here

[Learn more](https://example.com)
`;

      const html = renderMarkdown(markdown);

      expect(html).toContain('<h1');
      expect(html).toContain('Document Title');
      expect(html).toContain('<strong>bold</strong>');
      expect(html).toContain('<h2');
      expect(html).toContain('language-typescript');
      expect(html).toContain('<ul>');
      expect(html).toContain('<blockquote>');
      expect(html).toContain('href="https://example.com"');
    });
  });

  describe('highlightCode', () => {
    it('should highlight JavaScript code', () => {
      const code = 'const x = 1;';
      const highlighted = highlightCode(code, 'javascript');

      expect(highlighted).toContain('hljs-');
      expect(highlighted).toContain('const');
    });

    it('should highlight TypeScript code', () => {
      const code = 'const x: number = 1;';
      const highlighted = highlightCode(code, 'typescript');

      expect(highlighted).toContain('hljs-');
    });

    it('should highlight Python code', () => {
      const code = 'def hello():\n    print("Hello")';
      const highlighted = highlightCode(code, 'python');

      expect(highlighted).toContain('hljs-');
      expect(highlighted).toContain('def');
    });

    it('should auto-detect language when not specified', () => {
      const code = 'function hello() { return "world"; }';
      const highlighted = highlightCode(code);

      expect(highlighted).toContain('hljs-');
    });

    it('should handle unknown language gracefully', () => {
      const code = 'some random text';
      const highlighted = highlightCode(code, 'nonexistent-language');

      // Should still return something
      expect(highlighted).toBeDefined();
      expect(typeof highlighted).toBe('string');
    });

    it('should preserve code structure', () => {
      const code = 'const a = 1;\nconst b = 2;';
      const highlighted = highlightCode(code, 'javascript');

      expect(highlighted).toContain('const');
      expect(highlighted).toContain('\n');
    });

    it('should highlight HTML code', () => {
      const code = '<div class="container"><p>Hello</p></div>';
      const highlighted = highlightCode(code, 'html');

      expect(highlighted).toContain('hljs-');
    });

    it('should highlight CSS code', () => {
      const code = '.container { color: red; }';
      const highlighted = highlightCode(code, 'css');

      expect(highlighted).toContain('hljs-');
    });

    it('should highlight JSON code', () => {
      const code = '{ "name": "test", "value": 123 }';
      const highlighted = highlightCode(code, 'json');

      expect(highlighted).toContain('hljs-');
    });
  });
});
