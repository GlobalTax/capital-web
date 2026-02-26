import { useLocation, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import UnifiedLayout from '@/components/shared/UnifiedLayout';
import { SEOHead } from '@/components/seo';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calculator, Building2, Briefcase, BookOpen, Search, ArrowRight } from "lucide-react";

const suggestedLinks = [
  {
    title: "Calculadora de Valoración",
    description: "Descubre el valor de tu empresa en 2 minutos",
    href: "/valoracion-empresas",
    icon: Calculator,
  },
  {
    title: "Servicios M&A",
    description: "Venta, compra y reestructuración de empresas",
    href: "/servicios/venta-empresas",
    icon: Briefcase,
  },
  {
    title: "Sectores",
    description: "Especialización por industria y vertical",
    href: "/sectores",
    icon: Building2,
  },
  {
    title: "Blog",
    description: "Artículos y guías sobre M&A y valoración",
    href: "/blog",
    icon: BookOpen,
  },
];

const NotFound = () => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);

    // Track 404 in GA4 via dataLayer
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: 'page_not_found',
        page_path: location.pathname,
        page_referrer: document.referrer,
      });
    }
  }, [location.pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/blog?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <UnifiedLayout variant="home">
      <SEOHead
        title="Página no encontrada | Capittal"
        description="La página que buscas no existe. Descubre nuestros servicios de valoración de empresas, M&A y asesoramiento financiero."
        noindex
      />
      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-6xl md:text-8xl font-bold text-muted-foreground/20 mb-4">404</p>
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground mb-3">
            Página no encontrada
          </h1>
          <p className="text-muted-foreground mb-10 max-w-lg mx-auto">
            La página <code className="text-sm bg-muted px-1.5 py-0.5 rounded">{location.pathname}</code> no existe o ha sido movida.
          </p>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2 max-w-md mx-auto mb-14">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar en el blog..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button type="submit" variant="default" size="default">
              Buscar
            </Button>
          </form>

          {/* Suggested links grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
            {suggestedLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="group flex items-start gap-4 p-5 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-sm transition-all text-left"
              >
                <div className="flex-shrink-0 p-2.5 rounded-lg bg-primary/5 text-primary group-hover:bg-primary/10 transition-colors">
                  <link.icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                    {link.title}
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5">{link.description}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary mt-1 transition-colors" />
              </Link>
            ))}
          </div>

          <Button asChild variant="outline">
            <Link to="/">Volver al inicio</Link>
          </Button>
        </div>
      </section>
    </UnifiedLayout>
  );
};

export default NotFound;
