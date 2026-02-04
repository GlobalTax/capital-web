import React from 'react';
import { ContactsLayout } from '@/components/admin/contacts-v2';

const ContactsPage = () => {
  return (
    <div className="h-full flex flex-col min-h-0 overflow-hidden">
      <ContactsLayout />
    </div>
  );
};

export default ContactsPage;
