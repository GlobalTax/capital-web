import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUnifiedContacts } from './useUnifiedContacts';

export const useContactNavigation = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { allContacts } = useUnifiedContacts();
  const [currentIndex, setCurrentIndex] = useState(-1);

  useEffect(() => {
    if (id && allContacts.length > 0) {
      const index = allContacts.findIndex(contact => contact.id === id);
      setCurrentIndex(index);
    }
  }, [id, allContacts]);

  const goToPrevious = () => {
    if (currentIndex > 0) {
      const prevContact = allContacts[currentIndex - 1];
      navigate(`/admin/contacts/${prevContact.id}`);
    }
  };

  const goToNext = () => {
    if (currentIndex < allContacts.length - 1) {
      const nextContact = allContacts[currentIndex + 1];
      navigate(`/admin/contacts/${nextContact.id}`);
    }
  };

  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < allContacts.length - 1;
  const currentContact = currentIndex >= 0 ? allContacts[currentIndex] : null;

  return {
    currentContact,
    currentIndex,
    totalContacts: allContacts.length,
    hasPrevious,
    hasNext,
    goToPrevious,
    goToNext
  };
};