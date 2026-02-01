import React from 'react';
import { cn } from '@/lib/utils';
import { sanitizeRichText } from '@/shared/utils/sanitize';

interface BlogProseContentProps {
  content: string;
  className?: string;
}

// Clases estándar de tipografía para contenido de blog
export const BLOG_PROSE_CLASSES = `
  prose prose-xl dark:prose-invert max-w-none
  prose-headings:scroll-mt-24 prose-headings:text-slate-900 prose-headings:font-medium
  prose-h2:text-3xl prose-h2:mt-14 prose-h2:mb-8 prose-h2:tracking-tight
  prose-h3:text-2xl prose-h3:mt-12 prose-h3:mb-6 prose-h3:tracking-tight
  prose-p:text-slate-700 prose-p:text-lg prose-p:leading-relaxed prose-p:mb-8
  prose-li:text-slate-700 prose-li:text-lg prose-li:leading-relaxed prose-li:mb-2
  prose-strong:text-slate-900 prose-strong:font-semibold
  prose-ul:my-8 prose-ol:my-8
  prose-blockquote:border-l-4 prose-blockquote:border-slate-300 
  prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-slate-600
`;

export const BlogProseContent: React.FC<BlogProseContentProps> = ({ 
  content, 
  className 
}) => {
  return (
    <div 
      className={cn(BLOG_PROSE_CLASSES, className)}
      dangerouslySetInnerHTML={{ __html: sanitizeRichText(content) }}
    />
  );
};
