import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, ArrowLeft, Home, Clock } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { cn } from '@/lib/utils';
import { BlogPost } from '@/types/blog';
import BlogValuationCTA from './BlogValuationCTA';
import BlogContactSection from './BlogContactSection';

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

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength).trim() + '...';
  };

  return (
    <div className="container max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs de navegación */}
        <nav className="mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/" className="flex items-center gap-1 text-muted-foreground hover:text-primary">
                    <Home className="h-4 w-4" />
                    Inicio
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/recursos/blog" className="text-muted-foreground hover:text-primary">
                    Blog
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-foreground font-medium max-w-[200px] truncate">
                  {truncateText(post.title, 40)}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </nav>

        {/* Botones de navegación rápida */}
        <div className="flex gap-3 mb-8">
          <Link to="/recursos/blog">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver al Blog
            </Button>
          </Link>
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <Home className="h-4 w-4" />
              Página Principal
            </Button>
          </Link>
        </div>

        <h1 className="mb-8 mt-4 max-w-4xl text-3xl font-semibold md:text-5xl">
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

        <Separator className="mb-20 mt-12" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-16">
          <div className="lg:col-span-9">
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

            {/* Formulario de contacto */}
            <BlogContactSection postSlug={post.slug} />

            <div className="mt-8 flex justify-center">
              <Button
                variant="outline"
                onClick={() =>
                  window.scrollTo({
                    top: 0,
                    behavior: 'smooth',
                  })
                }
                className="w-full sm:w-auto"
              >
                <ArrowUp className="h-4 w-4 mr-2" />
                Volver arriba
              </Button>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="sticky top-8 space-y-4 max-w-xs ml-auto">
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
              </>
            )}
            
            {/* CTA Valoración - Sidebar */}
            <div className="mt-6">
              <BlogValuationCTA />
            </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default BlogPostContent;
