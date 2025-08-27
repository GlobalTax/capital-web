import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { HomeLayout } from '@/shared';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <HomeLayout>
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="text-xl text-gray-600 mb-4">Página no encontrada</p>
          <a href="/" className="text-primary hover:text-primary/80 underline">
            Volver al inicio
          </a>
        </div>
      </section>
    </HomeLayout>
  );
};

export default NotFound;
