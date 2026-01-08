import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import UnifiedLayout from '@/components/shared/UnifiedLayout';
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <UnifiedLayout variant="home">
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-normal mb-4">404</h1>
          <p className="text-xl text-gray-600 mb-4">Página no encontrada</p>
          <Button asChild variant="outline">
            <Link to="/">Volver al inicio</Link>
          </Button>
        </div>
      </section>
    </UnifiedLayout>
  );
};

export default NotFound;
