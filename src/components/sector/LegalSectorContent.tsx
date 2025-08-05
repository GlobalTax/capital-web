import React from 'react';

interface ContentSection {
  title: string;
  content: string;
  subsections?: {
    title: string;
    content: string;
  }[];
}

interface LegalSectorContentProps {
  sections: ContentSection[];
}

const LegalSectorContent = ({ sections }: LegalSectorContentProps) => {
  return (
    <section className="py-16 bg-background">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <div className="space-y-16">
          {sections.map((section, index) => (
            <div key={index} className="prose prose-lg max-w-none">
              <h2 className="text-2xl font-light text-foreground mb-6 tracking-tight">
                {section.title}
              </h2>
              
              <p className="text-muted-foreground leading-relaxed mb-8 font-light">
                {section.content}
              </p>

              {section.subsections && (
                <div className="space-y-8 ml-6 border-l border-border pl-8">
                  {section.subsections.map((subsection, subIndex) => (
                    <div key={subIndex}>
                      <h3 className="text-lg font-medium text-foreground mb-3">
                        {subsection.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed font-light">
                        {subsection.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LegalSectorContent;