import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    // Only log actual 404s, not admin route redirects
    if (!location.pathname.startsWith('/admin') && 
        !location.pathname.startsWith('/dashboard') && 
        !location.pathname.startsWith('/leads')) {
      console.error(
        "404 Error: User attempted to access non-existent route:",
        location.pathname
      );
    }
  }, [location.pathname]);

  // Check if this is an admin route access attempt
  const isAdminRouteAttempt = location.pathname.startsWith('/admin') || 
                             location.pathname.startsWith('/dashboard') || 
                             location.pathname.startsWith('/leads');

  if (isAdminRouteAttempt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md px-6">
          <h1 className="text-4xl font-bold mb-4 text-foreground">Acceso Admin</h1>
          <p className="text-xl text-muted-foreground mb-6">
            Esta sección está disponible en nuestro panel administrativo
          </p>
          <div className="space-y-3">
            <a 
              href="https://app.capittal.es/admin/" 
              className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Ir al Panel Admin
            </a>
            <br />
            <a href="/" className="text-primary hover:text-primary/80 underline">
              Volver al Inicio
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md px-6">
        <h1 className="text-4xl font-bold mb-4 text-foreground">404</h1>
        <p className="text-xl text-muted-foreground mb-6">
          ¡Ups! No encontramos esta página
        </p>
        <div className="space-y-3">
          <a 
            href="/" 
            className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Volver al Inicio
          </a>
          <br />
          <a href="/contacto" className="text-primary hover:text-primary/80 underline">
            ¿Necesitas ayuda? Contáctanos
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
