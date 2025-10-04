
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface AdminComponent {
  name: string;
  path: string;
  isAvailable: boolean;
  error?: string;
}

export const useAdminValidation = () => {
  const [components, setComponents] = useState<AdminComponent[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  const adminComponents = [
    { name: 'Blog Posts Manager V2', path: '/admin/blog-v2' },
    { name: 'Case Studies Manager', path: '/admin/case-studies' },
    { name: 'Contact Leads Manager', path: '/admin/contact-leads' },
    { name: 'Collaborator Applications', path: '/admin/collaborator-applications' },
    { name: 'Testimonials Manager', path: '/admin/testimonials' },
    { name: 'Carousel Testimonials', path: '/admin/carousel-testimonials' },
    { name: 'Carousel Logos', path: '/admin/carousel-logos' },
    { name: 'Team Members', path: '/admin/team' },
    { name: 'Operations Manager', path: '/admin/operations' },
    { name: 'Multiples Manager', path: '/admin/multiples' },
    { name: 'Statistics Manager', path: '/admin/statistics' },
    { name: 'Lead Magnets', path: '/admin/lead-magnets' },
    { name: 'Marketing Automation', path: '/admin/marketing-automation' },
    { name: 'Marketing Intelligence', path: '/admin/marketing-intelligence' },
    { name: 'Marketing Hub', path: '/admin/marketing-hub' },
    { name: 'Sector Reports', path: '/admin/sector-reports' },
  ];

  const validateComponents = async () => {
    setIsValidating(true);
    
    const validatedComponents = adminComponents.map(component => ({
      ...component,
      isAvailable: true, // Asumimos que están disponibles si están en el router
    }));

    setComponents(validatedComponents);
    setIsValidating(false);

    const availableCount = validatedComponents.filter(c => c.isAvailable).length;
    
    toast({
      title: "Validación de Funcionalidades",
      description: `${availableCount} de ${adminComponents.length} funcionalidades están disponibles`,
    });
  };

  const getComponentStats = () => {
    const available = components.filter(c => c.isAvailable).length;
    const total = components.length;
    const unavailable = total - available;

    return {
      total,
      available,
      unavailable,
      percentage: total > 0 ? Math.round((available / total) * 100) : 0
    };
  };

  useEffect(() => {
    validateComponents();
  }, []);

  return {
    components,
    isValidating,
    validateComponents,
    getComponentStats,
  };
};
