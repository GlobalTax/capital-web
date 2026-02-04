import React from 'react';
import LinearContactsManager from '@/components/admin/contacts/LinearContactsManager';

const ContactsPage = () => {
  return (
    <div className="h-full flex flex-col min-h-0 overflow-hidden">
      <LinearContactsManager />
    </div>
  );
};

export default ContactsPage;
