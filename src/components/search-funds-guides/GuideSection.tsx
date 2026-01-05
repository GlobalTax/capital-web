import { LucideIcon } from 'lucide-react';

interface GuideSectionProps {
  id: string;
  icon?: LucideIcon;
  title: string;
  children: React.ReactNode;
}

export const GuideSection = ({ id, icon: Icon, title, children }: GuideSectionProps) => {
  return (
    <section id={id} className="scroll-mt-24 mb-12">
      <div className="flex items-center gap-3 mb-4">
        {Icon && (
          <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        )}
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>
      <div className="prose prose-slate dark:prose-invert max-w-none">
        {children}
      </div>
    </section>
  );
};
