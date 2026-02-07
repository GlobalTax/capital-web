import React from 'react';
import { ContactsLayout } from '@/components/admin/contacts-v2';

/**
 * ContactsPage: Full-height layout for the contacts table.
 * Negates parent padding to maximize vertical space and
 * uses viewport-based height minus the 48px admin header.
 */
const ContactsPage = () => {
  return (
    <div className="h-[calc(100dvh-48px)] flex flex-col min-h-0 overflow-hidden -m-2 sm:-m-3 md:-m-4 p-2 sm:p-3 md:p-4">
      <ContactsLayout />
    </div>
  );
};

export default ContactsPage;
