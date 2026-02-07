import React from 'react';
import { ContactsLayout } from '@/components/admin/contacts-v2';

/**
 * ContactsPage: Full-height layout for the contacts table.
 * Uses negative margins to negate parent padding and claims the full
 * height of the scrollable content area established by AdminLayout.
 * The inner padding is reapplied so content doesn't touch edges.
 */
const ContactsPage = () => {
  return (
    <div
      className="flex flex-col min-h-0 overflow-hidden -m-2 sm:-m-3 md:-m-4 p-2 sm:p-3 md:p-4"
      style={{ height: 'calc(100dvh - 48px)' }}
    >
      <ContactsLayout />
    </div>
  );
};

export default ContactsPage;
