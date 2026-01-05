import { MessageCircle } from 'lucide-react';
import ContactForm from '@/components/ContactForm';

interface BlogContactSectionProps {
  postSlug: string;
}

const BlogContactSection = ({ postSlug }: BlogContactSectionProps) => {
  // Crear un pageOrigin limpio basado en el slug del post
  const pageOrigin = `blog_${postSlug.slice(0, 30).replace(/[^a-z0-9-]/gi, '_')}`;

  return (
    <section className="mt-16 pt-12 border-t">
      <div className="bg-muted/40 rounded-2xl p-6 sm:p-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-full mb-4">
            <MessageCircle className="h-7 w-7 text-primary" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
            ¿Tienes dudas sobre este tema?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Nuestro equipo de expertos en M&A y valoración de empresas 
            está disponible para resolver tus consultas de forma personalizada y confidencial.
          </p>
        </div>
        
        <ContactForm 
          pageOrigin={pageOrigin} 
          showTitle={false} 
          variant="default"
          className="shadow-none border-0 bg-transparent"
        />
      </div>
    </section>
  );
};

export default BlogContactSection;
