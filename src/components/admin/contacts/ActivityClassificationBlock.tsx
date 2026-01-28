import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Save, Loader2, FileText } from 'lucide-react';
import { ActivityDescriptionGenerator } from '@/components/admin/leads/ActivityDescriptionGenerator';
import { SectorTagsBlock } from '@/components/admin/contacts/SectorTagsBlock';
import { useSaveContactClassification, ClassificationData } from '@/hooks/useSaveContactClassification';
import { SectorTagsResult } from '@/hooks/useSectorTagsGenerator';
import { ContactOrigin } from '@/hooks/useUnifiedContacts';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

interface ActivityClassificationBlockProps {
  contactId: string;
  origin: ContactOrigin;
  companyName?: string;
  cif?: string;
  initialDescription?: string;
  initialSectorTags?: {
    ai_sector_pe?: string;
    ai_sector_name?: string;
    ai_tags?: string[];
    ai_business_model_tags?: string[];
    ai_negative_tags?: string[];
    ai_classification_confidence?: number;
  };
  className?: string;
}

export const ActivityClassificationBlock: React.FC<ActivityClassificationBlockProps> = ({
  contactId,
  origin,
  companyName,
  cif,
  initialDescription,
  initialSectorTags,
  className,
}) => {
  const queryClient = useQueryClient();
  const { saveClassification, isSaving } = useSaveContactClassification();
  
  // Track current values (what's displayed)
  const [currentDescription, setCurrentDescription] = useState<string | null>(initialDescription || null);
  const [currentSectorTags, setCurrentSectorTags] = useState<SectorTagsResult | null>(
    initialSectorTags?.ai_sector_pe ? {
      sector_pe: initialSectorTags.ai_sector_pe,
      sector_name_es: initialSectorTags.ai_sector_name || '',
      sector_name_en: '',
      confidence: initialSectorTags.ai_classification_confidence || 0,
      tags: initialSectorTags.ai_tags || [],
      negative_tags: initialSectorTags.ai_negative_tags || [],
      business_model_tags: initialSectorTags.ai_business_model_tags || [],
      reasoning: '',
    } : null
  );
  
  // Track saved values (what's in DB)
  const [savedDescription, setSavedDescription] = useState<string | null>(initialDescription || null);
  const [savedSectorTags, setSavedSectorTags] = useState<SectorTagsResult | null>(currentSectorTags);

  // Update when contact changes
  useEffect(() => {
    setCurrentDescription(initialDescription || null);
    setSavedDescription(initialDescription || null);
    
    const initialTags = initialSectorTags?.ai_sector_pe ? {
      sector_pe: initialSectorTags.ai_sector_pe,
      sector_name_es: initialSectorTags.ai_sector_name || '',
      sector_name_en: '',
      confidence: initialSectorTags.ai_classification_confidence || 0,
      tags: initialSectorTags.ai_tags || [],
      negative_tags: initialSectorTags.ai_negative_tags || [],
      business_model_tags: initialSectorTags.ai_business_model_tags || [],
      reasoning: '',
    } : null;
    
    setCurrentSectorTags(initialTags);
    setSavedSectorTags(initialTags);
  }, [contactId, initialDescription, initialSectorTags]);

  // Check if there are unsaved changes
  const hasChanges = useCallback(() => {
    const descChanged = currentDescription !== savedDescription;
    const tagsChanged = JSON.stringify(currentSectorTags) !== JSON.stringify(savedSectorTags);
    return descChanged || tagsChanged;
  }, [currentDescription, savedDescription, currentSectorTags, savedSectorTags]);

  const handleDescriptionGenerated = useCallback((desc: string) => {
    setCurrentDescription(desc);
  }, []);

  const handleTagsGenerated = useCallback((result: SectorTagsResult) => {
    setCurrentSectorTags(result);
  }, []);

  const handleSave = async () => {
    const data: ClassificationData = {};
    
    // Only include changed fields
    if (currentDescription !== savedDescription) {
      data.description = currentDescription || undefined;
    }
    
    if (JSON.stringify(currentSectorTags) !== JSON.stringify(savedSectorTags)) {
      data.sectorTags = currentSectorTags;
    }

    const success = await saveClassification({
      contactId,
      origin,
      data,
    });

    if (success) {
      // Update saved state
      setSavedDescription(currentDescription);
      setSavedSectorTags(currentSectorTags);
      
      // Invalidate cache to refresh UI
      queryClient.invalidateQueries({ queryKey: ['unified-contacts'] });
    }
  };

  if (!companyName) {
    return null;
  }

  const canSave = hasChanges() && !isSaving;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Activity Description */}
      <ActivityDescriptionGenerator
        initialCompanyName={companyName}
        initialCif={cif}
        compact
        onDescriptionGenerated={handleDescriptionGenerated}
      />
      
      {/* Sector Tags */}
      <SectorTagsBlock
        companyName={companyName}
        description={currentDescription || initialDescription}
        initialResult={currentSectorTags || undefined}
        compact
        onTagsGenerated={handleTagsGenerated}
      />

      {/* Save Button - Always visible when there's content */}
      {(currentDescription || currentSectorTags) && (
        <>
          <Separator className="bg-[hsl(var(--linear-border))]" />
          <Button
            onClick={handleSave}
            disabled={!canSave}
            size="sm"
            className={cn(
              "w-full h-9 text-xs font-medium transition-all",
              hasChanges() 
                ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                : "bg-muted text-muted-foreground"
            )}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5 mr-2" />
                Guardar descripción y etiquetas
              </>
            )}
          </Button>
          
          {hasChanges() && (
            <p className="text-[10px] text-amber-600 text-center">
              Hay cambios sin guardar
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default ActivityClassificationBlock;
