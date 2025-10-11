import { useState } from 'react';
import { UseFormSetValue, UseFormWatch } from 'react-hook-form';
import type { JobPostFormData } from '@/types/jobs';

type ListType = 'requirements' | 'responsibilities' | 'benefits' | 'required_languages';

export const useJobListManagement = (
  watch: UseFormWatch<JobPostFormData>,
  setValue: UseFormSetValue<JobPostFormData>
) => {
  const [newRequirement, setNewRequirement] = useState('');
  const [newResponsibility, setNewResponsibility] = useState('');
  const [newBenefit, setNewBenefit] = useState('');
  const [newLanguage, setNewLanguage] = useState('');

  const addItem = (type: 'requirement' | 'responsibility' | 'benefit' | 'language', value: string) => {
    if (!value.trim()) return;

    const fieldMap = {
      requirement: { field: 'requirements' as ListType, setter: setNewRequirement },
      responsibility: { field: 'responsibilities' as ListType, setter: setNewResponsibility },
      benefit: { field: 'benefits' as ListType, setter: setNewBenefit },
      language: { field: 'required_languages' as ListType, setter: setNewLanguage },
    };

    const { field, setter } = fieldMap[type];
    const currentValues = watch(field) as string[];
    setValue(field, [...currentValues, value.trim()] as any);
    setter('');
  };

  const removeItem = (type: ListType, index: number) => {
    const currentValues = watch(type) as string[];
    setValue(type, currentValues.filter((_, i) => i !== index) as any);
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
