import { useState } from 'react';

export const useContactSelection = (contacts: any[]) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const selectContact = (contactId: string) => {
    setSelectedIds(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const selectAll = () => {
    if (selectedIds.length === contacts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(contacts.map(c => c.id));
    }
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  return {
    selectedIds,
    selectContact,
    selectAll,
    clearSelection,
  };
};
