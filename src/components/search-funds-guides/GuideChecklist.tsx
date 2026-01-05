import { Check } from 'lucide-react';

interface GuideChecklistProps {
  title?: string;
  items: string[];
}

export const GuideChecklist = ({ title, items }: GuideChecklistProps) => {
  return (
    <div className="my-6 p-6 rounded-xl bg-muted/50 border">
      {title && <h4 className="font-semibold mb-4">{title}</h4>}
      <ul className="space-y-3">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-3">
            <div className="flex-shrink-0 h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
              <Check className="h-3 w-3 text-primary" />
            </div>
            <span className="text-sm">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
