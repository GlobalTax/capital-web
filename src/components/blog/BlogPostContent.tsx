
import React, { useEffect, useRef, useState } from 'react';
import { ArrowUp, Calendar, Clock, Facebook, Home, Instagram, Lightbulb, Linkedin, Twitter } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { cn } from '@/lib/utils';
import { BlogPost } from '@/types/blog';

interface BlogPostContentProps {
  post: BlogPost;
}

const BlogPostContent = ({ post }: BlogPostContentProps) => {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const sectionRefs = useRef<Record<string, HTMLElement>>({});

  useEffect(() => {
    const sections = Object.keys(sectionRefs.current);

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    let observer: IntersectionObserver | null = new IntersectionObserver(
      observerCallback,
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.1,
      }
    );

    sections.forEach((sectionId) => {
      const element = sectionRefs.current[sectionId];
      if (element) {
        observer?.observe(element);
      }
    });

    return () => {
      observer?.disconnect();
      observer = null;
    };
  }, []);

  const addSectionRef = (id: string, ref: HTMLElement | null) => {
    if (ref) {
      sectionRefs.current[id] = ref;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Simple markdown parser para contenido básico
  const parseMarkdown = (content: string) => {
    return content
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/\n\n/gim, '</p><p>')
      .replace(/\n/gim, '<br>')
      .replace(/^(.*)$/gim, '<p>$1</p>');
  };

  // Extraer secciones para el índice
  const extractSections = (content: string) => {
    const sections = [];
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith('## ')) {
        const title = line.replace('## ', '');
        const id = title.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-');
        sections.push({ id, title });
      }
    }
    
    return sections;
  };

  const sections = extractSections(post.content);

  const currentUrl = window.location.href;

  return (
    <section className="py-32">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">
                <Home className="h-4 w-4" />
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/recursos/blog">Blog</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{post.category}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <h1 className="mb-6 mt-7 max-w-4xl text-3xl font-semibold md:text-5xl">
          {post.title}
        </h1>

        {post.excerpt && (
          <p className="text-xl text-gray-600 max-w-3xl mb-8 leading-relaxed">
            {post.excerpt}
          </p>
        )}

        <div className="flex items-center gap-3 text-sm mb-8">
          <Avatar className="h-8 w-8 border">
            {post.author_avatar_url ? (
              <AvatarImage src={post.author_avatar_url} alt={post.author_name} />
            ) : (
              <AvatarFallback>
                {post.author_name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
          <span>
            <span className="font-medium">{post.author_name}</span>
            <span className="text-muted-foreground ml-1">
              el {formatDate(post.published_at || post.created_at)}
            </span>
          </span>

          <span className="text-muted-foreground flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {post.reading_time} min. lectura
          </span>

          <span className="px-3 py-1 bg-gray-100 rounded-lg font-medium text-sm">
            {post.category}
          </span>
        </div>

        {post.featured_image_url && (
          <div className="mb-8">
            <img
              src={post.featured_image_url}
              alt={post.title}
              className="w-full max-h-96 object-cover rounded-lg"
            />
          </div>
        )}

        <Separator className="mb-16 mt-8" />

        <div className="relative grid grid-cols-12 gap-6 lg:grid">
          <div className="col-span-12 lg:col-span-8">
            <div className="prose dark:prose-invert max-w-none">
              <div 
                dangerouslySetInnerHTML={{ 
                  __html: parseMarkdown(post.content) 
                }}
              />
            </div>

            {post.tags && post.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t">
                <h4 className="text-sm font-medium text-gray-500 mb-3">Etiquetas:</h4>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="sticky top-8 col-span-3 col-start-10 hidden h-fit lg:block">
            {sections.length > 0 && (
              <>
                <span className="text-lg font-medium">En esta página</span>
                <nav className="mt-4 text-sm">
                  <ul className="space-y-1">
                    {sections.map((section) => (
                      <li key={section.id}>
                        <a
                          href={`#${section.id}`}
                          className={cn(
                            'block py-1 transition-colors duration-200',
                            activeSection === section.id
                              ? 'text-primary'
                              : 'text-muted-foreground hover:text-primary'
                          )}
                        >
                          {section.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
                <Separator className="my-6" />
              </>
            )}
            
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Compartir artículo</p>
              <ul className="flex gap-2">
                <li>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:bg-muted inline-flex rounded-full border p-2 transition-colors"
                  >
                    <Facebook className="h-4 w-4" />
                  </a>
                </li>
                <li>
                  <a
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(post.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:bg-muted inline-flex rounded-full border p-2 transition-colors"
                  >
                    <Twitter className="h-4 w-4" />
                  </a>
                </li>
                <li>
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:bg-muted inline-flex rounded-full border p-2 transition-colors"
                  >
                    <Linkedin className="h-4 w-4" />
                  </a>
                </li>
              </ul>
            </div>
            
            <div className="mt-6">
              <Button
                variant="outline"
                onClick={() =>
                  window.scrollTo({
                    top: 0,
                    behavior: 'smooth',
                  })
                }
              >
                <ArrowUp className="h-4 w-4" />
                Volver arriba
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlogPostContent;
