import { useState } from 'react';
import { UseFormSetValue, UseFormWatch } from 'react-hook-form';
import type { JobPostFormData } from '@/types/jobs';

type ListType = 'requirements' | 'responsibilities' | 'benefits' | 'required_languages';
type ListAddType = 'requirement' | 'responsibility' | 'benefit' | 'language';

export const useJobListManagement = (
  watch: UseFormWatch<JobPostFormData>,
  setValue: UseFormSetValue<JobPostFormData>
) => {
  const [newRequirement, setNewRequirement] = useState('');
  const [newResponsibility, setNewResponsibility] = useState('');
  const [newBenefit, setNewBenefit] = useState('');
  const [newLanguage, setNewLanguage] = useState('');

  const addItem = (type: ListAddType, value: string) => {
    if (!value.trim()) return;

    const fieldMap: Record<ListAddType, { field: ListType; setter: (value: string) => void }> = {
      requirement: { field: 'requirements', setter: setNewRequirement },
      responsibility: { field: 'responsibilities', setter: setNewResponsibility },
      benefit: { field: 'benefits', setter: setNewBenefit },
      language: { field: 'required_languages', setter: setNewLanguage },
    };

    const { field, setter } = fieldMap[type];
    const currentValues = watch(field) || [];
    setValue(field, [...currentValues, value.trim()]);
    setter('');
  };

  const removeItem = (type: ListType, index: number) => {
    const currentValues = watch(type) || [];
    setValue(type, currentValues.filter((_, i) => i !== index));
  };

  return {
    newRequirement,
    newResponsibility,
    newBenefit,
    newLanguage,
    setNewRequirement,
    setNewResponsibility,
    setNewBenefit,
    setNewLanguage,
    addItem,
    removeItem,
  };
};
