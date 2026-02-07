import React from 'react';
import { ContactsLayout } from '@/components/admin/contacts-v2';

const ContactsPage = () => {
  return (
    <div className="h-[calc(100dvh-48px-1rem)] sm:h-[calc(100dvh-48px-1.5rem)] md:h-[calc(100dvh-48px-2rem)] flex flex-col min-h-0 overflow-hidden">
      <ContactsLayout />
    </div>
  );
};

export default ContactsPage;
