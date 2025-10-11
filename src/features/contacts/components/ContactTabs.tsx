import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ContactOrigin } from '@/hooks/useUnifiedContacts';

interface ContactTabsProps {
  activeTab: ContactOrigin | 'all';
  stats: Record<string, number>;
  onTabChange: (tab: string) => void;
  children: React.ReactNode;
}

export const ContactTabs: React.FC<ContactTabsProps> = ({
  activeTab,
  stats,
  onTabChange,
  children,
}) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange}>
      <TabsList className="grid w-full grid-cols-7">
        <TabsTrigger value="all">
          Todos ({stats.total || 0})
        </TabsTrigger>
        <TabsTrigger value="contact">
          Comerciales ({stats.contact || 0})
        </TabsTrigger>
        <TabsTrigger value="valuation">
          Valoraciones ({stats.valuation || 0})
        </TabsTrigger>
        <TabsTrigger value="collaborator">
          Colaboradores ({stats.collaborator || 0})
        </TabsTrigger>
        <TabsTrigger value="acquisition">
          Adquisiciones ({stats.acquisition || 0})
        </TabsTrigger>
        <TabsTrigger value="company_acquisition">
          Compra ({stats.company_acquisition || 0})
        </TabsTrigger>
        <TabsTrigger value="general">
          Generales ({stats.general || 0})
        </TabsTrigger>
      </TabsList>

      <TabsContent value={activeTab} className="mt-6">
        {children}
      </TabsContent>
    </Tabs>
  );
};
