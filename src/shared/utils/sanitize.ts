// ============= SANITIZATION UTILITIES =============
// Secure utilities for HTML sanitization and text processing

import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content for safe rendering
 * Uses DOMPurify to remove XSS vectors while preserving safe HTML
 */
export const sanitizeHtml = (html: string): string => {
  if (!html) return '';
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'hr',
      'ul', 'ol', 'li',
      'strong', 'b', 'em', 'i', 'u', 's', 'strike',
      'a', 'blockquote', 'code', 'pre',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'img', 'figure', 'figcaption',
      'div', 'span', 'mark', 'sub', 'sup',
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel', 'src', 'alt', 'title',
      'class', 'id', 'style',
      'colspan', 'rowspan', 'width', 'height',
    ],
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ['target'],
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form'],
    FORBID_ATTR: ['onerror', 'onclick', 'onload', 'onmouseover'],
  });
};

/**
 * Sanitize HTML for rich text content (blog posts, articles, reports)
 * More permissive than basic sanitization
 */
export const sanitizeRichText = (html: string): string => {
  if (!html) return '';
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'hr',
      'ul', 'ol', 'li',
      'strong', 'b', 'em', 'i', 'u', 's', 'strike',
      'a', 'blockquote', 'code', 'pre',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'img', 'figure', 'figcaption',
      'div', 'span', 'mark', 'sub', 'sup',
      'video', 'audio', 'source',
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel', 'src', 'alt', 'title',
      'class', 'id', 'style',
      'colspan', 'rowspan', 'width', 'height',
      'controls', 'autoplay', 'loop', 'muted', 'poster',
      'type', 'loading',
    ],
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ['target'],
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form'],
    FORBID_ATTR: ['onerror', 'onclick', 'onload', 'onmouseover'],
  });
};

/**
 * Escape special regex characters to safely use in RegExp
 */
export const escapeRegex = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Highlight search term in text safely (returns HTML string)
 * Uses regex escaping to prevent ReDoS attacks
 */
export const highlightSearchTerm = (text: string, searchTerm: string): string => {
  if (!searchTerm || !text) return text;
  
  // Escape regex special characters to prevent injection
  const escapedTerm = escapeRegex(searchTerm);
  const regex = new RegExp(`(${escapedTerm})`, 'gi');
  
  // Replace matches with highlighted version
  return text.replace(regex, '<mark class="bg-yellow-200 px-0.5 rounded">$1</mark>');
};

/**
 * Simple markdown to HTML converter with sanitization
 * For basic formatting (bold, italic, lists)
 */
export const renderMarkdownSafe = (content: string): string => {
  if (!content) return '';
  
  // First sanitize to remove any existing HTML
  const sanitized = DOMPurify.sanitize(content, { ALLOWED_TAGS: [] });
  
  // Then apply markdown transformations
  const html = sanitized
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^- (.*$)/gim, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
    .split('\n')
    .map(line => line.trim() ? `<p>${line}</p>` : '<br>')
    .join('');
  
  // Final sanitization pass
  return DOMPurify.sanitize(html);
};

/**
 * Escape < character in JSON for safe injection into script tags
 * Prevents </script> injection in JSON-LD
 */
export const escapeJsonForScript = (json: string): string => {
  return json.replace(/</g, '\\u003c');
};

/**
 * Create safe JSON-LD string for script injection
 */
export const safeJsonLd = (data: object): string => {
  return escapeJsonForScript(JSON.stringify(data));
};
