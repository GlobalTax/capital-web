import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Slide, SlideContent, PresentationProject, PresentationType } from '../types/presentation.types';
import type { Json, Database } from '@/integrations/supabase/types';
import type { SlideOutlineInputs } from '../utils/slideOutlineGenerator';

type DbSlideLayout = Database['public']['Tables']['presentation_slides']['Row']['layout'];

interface CreateVersionInput {
  projectId: string;
  versionNotes?: string;
  preserveApprovedSlides?: boolean;
  slidesToUpdate?: Partial<Slide>[];
}

interface CreateVersionWithRegenInput {
  projectId: string;
  versionNotes?: string;
  regenerateDrafts?: boolean;
  presentationType?: PresentationType;
  inputs?: SlideOutlineInputs;
}

export interface VersionInfo {
  version: number;
  created_at: string;
  notes?: string;
}

/**
 * Hook for managing presentation versions
 * Allows creating new versions while preserving approved/locked slides
 */
export function usePresentationVersioning() {
  const queryClient = useQueryClient();

  /**
   * Create a new version of a presentation
   * - Preserves slides marked as approved/locked
   * - Applies updates only to non-locked slides
   */
  const createVersion = useMutation({
    mutationFn: async ({
      projectId,
      versionNotes,
      preserveApprovedSlides = true,
      slidesToUpdate = []
    }: CreateVersionInput): Promise<PresentationProject> => {
      // 1. Fetch current project and slides
      const { data: currentProject, error: projectError } = await supabase
        .from('presentation_projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (projectError) throw projectError;

      const { data: currentSlides, error: slidesError } = await supabase
        .from('presentation_slides')
        .select('*')
        .eq('project_id', projectId)
        .order('order_index', { ascending: true });

      if (slidesError) throw slidesError;

      // 2. Determine current version number
      const currentVersion = (currentProject.metadata as Record<string, unknown>)?.version as number || 1;
      const newVersion = currentVersion + 1;

      // 3. Store current state as version snapshot in metadata
      const versionHistory = ((currentProject.metadata as Record<string, unknown>)?.version_history as VersionInfo[]) || [];
      versionHistory.push({
        version: currentVersion,
        created_at: new Date().toISOString(),
        notes: versionNotes || `Version ${currentVersion} snapshot`
      });

      // 4. Update project with new version info
      const updatedMetadata = {
        ...(currentProject.metadata as Record<string, unknown>),
        version: newVersion,
        version_history: versionHistory,
        previous_version_at: new Date().toISOString()
      };

      const { data: updatedProject, error: updateError } = await supabase
        .from('presentation_projects')
        .update({
          metadata: updatedMetadata as unknown as Json,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId)
        .select()
        .single();

      if (updateError) throw updateError;

      // 5. Process slides - preserve approved, update others
      const slidesToProcess = slidesToUpdate.length > 0 ? slidesToUpdate : [];
      
      for (const slide of currentSlides || []) {
        const slideContent = slide.content as SlideContent;
        // Cast to access approval_status (may be null if not yet set)
        const slideRecord = slide as Record<string, unknown>;
        const approvalStatus = slideRecord.approval_status as string | null;
        const isApproved = approvalStatus === 'approved' || approvalStatus === 'locked';
        
        // Skip locked/approved slides if preservation is enabled
        if (preserveApprovedSlides && isApproved) {
          continue;
        }

        // Find if there's an update for this slide
        const updateData = slidesToProcess.find(
          (s) => s.order_index === slide.order_index || s.id === slide.id
        );

        if (updateData) {
          const { error: slideUpdateError } = await supabase
            .from('presentation_slides')
            .update({
              headline: updateData.headline ?? slide.headline,
              subline: updateData.subline ?? slide.subline,
              content: (updateData.content ?? slideContent) as Json,
              layout: (updateData.layout ?? slide.layout) as DbSlideLayout,
              updated_at: new Date().toISOString()
            })
            .eq('id', slide.id);

          if (slideUpdateError) {
            console.error('Error updating slide:', slideUpdateError);
          }
        }
      }

      return updatedProject as PresentationProject;
    },
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['presentations', projectId] });
      queryClient.invalidateQueries({ queryKey: ['presentations', projectId, 'slides'] });
      toast.success('Nueva versión creada');
    },
    onError: (error) => {
      toast.error('Error creando versión: ' + error.message);
    }
  });

  /**
   * Lock/approve a specific slide to preserve it in future versions
   */
  const approveSlide = useMutation({
    mutationFn: async ({ slideId, projectId }: { slideId: string; projectId: string }) => {
      const { data, error } = await supabase
        .from('presentation_slides')
        .update({
          approval_status: 'approved' as unknown,
          approved_at: new Date().toISOString(),
          is_locked: true as unknown
        } as Database['public']['Tables']['presentation_slides']['Update'])
        .eq('id', slideId)
        .select()
        .single();

      if (error) throw error;
      return { slide: data, projectId };
    },
    onSuccess: ({ projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['presentations', projectId, 'slides'] });
      toast.success('Slide aprobado y bloqueado');
    },
    onError: (error) => {
      toast.error('Error aprobando slide: ' + error.message);
    }
  });

  /**
   * Unlock a slide to allow modifications
   */
  const unlockSlide = useMutation({
    mutationFn: async ({ slideId, projectId }: { slideId: string; projectId: string }) => {
      const { data, error } = await supabase
        .from('presentation_slides')
        .update({
          approval_status: 'draft' as unknown,
          is_locked: false as unknown
        } as Database['public']['Tables']['presentation_slides']['Update'])
        .eq('id', slideId)
        .select()
        .single();

      if (error) throw error;
      return { slide: data, projectId };
    },
    onSuccess: ({ projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['presentations', projectId, 'slides'] });
      toast.success('Slide desbloqueado');
    },
    onError: (error) => {
      toast.error('Error desbloqueando slide: ' + error.message);
    }
  });

  /**
   * Create a new version with AI regeneration for draft slides
   * - Preserves all approved/locked slides
   * - Regenerates content for draft slides using AI pipeline
   */
  const createVersionWithRegeneration = useMutation({
    mutationFn: async ({
      projectId,
      versionNotes,
      regenerateDrafts = true,
      presentationType,
      inputs
    }: CreateVersionWithRegenInput): Promise<{
      project: PresentationProject;
      preservedCount: number;
      regeneratedCount: number;
    }> => {
      // 1. Fetch current project and slides
      const { data: currentProject, error: projectError } = await supabase
        .from('presentation_projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (projectError) throw projectError;

      const { data: currentSlides, error: slidesError } = await supabase
        .from('presentation_slides')
        .select('*')
        .eq('project_id', projectId)
        .order('order_index', { ascending: true });

      if (slidesError) throw slidesError;

      // 2. Separate slides by approval status
      const approvedSlides: typeof currentSlides = [];
      const draftSlides: typeof currentSlides = [];
      
      for (const slide of currentSlides || []) {
        const slideRecord = slide as Record<string, unknown>;
        const approvalStatus = slideRecord.approval_status as string | null;
        const isApproved = approvalStatus === 'approved' || approvalStatus === 'locked' || slide.is_locked;
        
        if (isApproved) {
          approvedSlides.push(slide);
        } else {
          draftSlides.push(slide);
        }
      }

      // 3. Generate new content for draft slides if regeneration is enabled
      let slidesToUpdate: Partial<Slide>[] = [];
      
      if (regenerateDrafts && draftSlides.length > 0 && presentationType && inputs) {
        try {
          // Call the AI content generation
          const { data: generatedData, error: genError } = await supabase.functions.invoke(
            'generate-presentation-content',
            {
              body: {
                inputs,
                outline: draftSlides.map((s, idx) => ({
                  slide_index: s.order_index,
                  slide_type: s.layout,
                  layout: s.layout,
                  purpose: s.headline
                })),
                presentation_type: presentationType
              }
            }
          );

          if (genError) {
            console.error('AI generation error:', genError);
          } else if (generatedData?.success && generatedData?.slides) {
            // Refine the generated content
            const { data: refinedData } = await supabase.functions.invoke(
              'refine-presentation-content',
              { body: { slides: generatedData.slides } }
            );

            const finalSlides = refinedData?.success ? refinedData.slides : generatedData.slides;

            // Map generated content to slide updates
            slidesToUpdate = finalSlides.map((gen: {
              slide_index: number;
              headline?: string;
              subline?: string;
              bullets?: string[];
              stats?: { label: string; value: string }[];
            }) => {
              const originalSlide = draftSlides.find(s => s.order_index === gen.slide_index);
              if (!originalSlide) return null;

              return {
                id: originalSlide.id,
                order_index: gen.slide_index,
                headline: gen.headline,
                subline: gen.subline,
                content: {
                  bullets: gen.bullets,
                  stats: gen.stats
                }
              };
            }).filter(Boolean) as Partial<Slide>[];
          }
        } catch (err) {
          console.error('AI regeneration failed, proceeding with version creation:', err);
        }
      }

      // 4. Determine version numbers
      const currentVersion = (currentProject.metadata as Record<string, unknown>)?.version as number || 1;
      const newVersion = currentVersion + 1;

      // 5. Store current state as version snapshot
      const versionHistory = ((currentProject.metadata as Record<string, unknown>)?.version_history as VersionInfo[]) || [];
      versionHistory.push({
        version: currentVersion,
        created_at: new Date().toISOString(),
        notes: versionNotes || `Version ${currentVersion} snapshot`
      });

      // 6. Update project with new version info
      const updatedMetadata = {
        ...(currentProject.metadata as Record<string, unknown>),
        version: newVersion,
        version_history: versionHistory,
        previous_version_at: new Date().toISOString()
      };

      const { data: updatedProject, error: updateError } = await supabase
        .from('presentation_projects')
        .update({
          metadata: updatedMetadata as unknown as Json,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId)
        .select()
        .single();

      if (updateError) throw updateError;

      // 7. Apply updates to draft slides only
      let regeneratedCount = 0;
      for (const update of slidesToUpdate) {
        if (!update.id) continue;
        
        const { error: slideUpdateError } = await supabase
          .from('presentation_slides')
          .update({
            headline: update.headline,
            subline: update.subline,
            content: update.content as Json,
            updated_at: new Date().toISOString()
          })
          .eq('id', update.id);

        if (!slideUpdateError) {
          regeneratedCount++;
        }
      }

      return {
        project: updatedProject as PresentationProject,
        preservedCount: approvedSlides.length,
        regeneratedCount
      };
    },
    onSuccess: (result, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['presentations', projectId] });
      queryClient.invalidateQueries({ queryKey: ['presentations', projectId, 'slides'] });
      queryClient.invalidateQueries({ queryKey: ['presentations', projectId, 'versions'] });
      
      const metadata = result.project.metadata as Record<string, unknown>;
      const newVersion = metadata?.version as number || 1;
      
      toast.success(
        `Versión v${newVersion} creada (${result.preservedCount} preservados, ${result.regeneratedCount} regenerados)`
      );
    },
    onError: (error) => {
      toast.error('Error creando versión: ' + error.message);
    }
  });

  /**
   * Get version history for a presentation
   */
  const useVersionHistory = (projectId: string) => {
    return useQuery({
      queryKey: ['presentations', projectId, 'versions'],
      queryFn: async (): Promise<VersionInfo[]> => {
        const { data, error } = await supabase
          .from('presentation_projects')
          .select('metadata')
          .eq('id', projectId)
          .single();

        if (error) throw error;
        
        const metadata = data?.metadata as Record<string, unknown>;
        return (metadata?.version_history as VersionInfo[]) || [];
      },
      enabled: !!projectId
    });
  };

  /**
   * Get current version number for a presentation
   */
  const useCurrentVersion = (projectId: string) => {
    return useQuery({
      queryKey: ['presentations', projectId, 'currentVersion'],
      queryFn: async (): Promise<number> => {
        const { data, error } = await supabase
          .from('presentation_projects')
          .select('metadata')
          .eq('id', projectId)
          .single();

        if (error) throw error;
        
        const metadata = data?.metadata as Record<string, unknown>;
        return (metadata?.version as number) || 1;
      },
      enabled: !!projectId
    });
  };

  return {
    createVersion,
    createVersionWithRegeneration,
    approveSlide,
    unlockSlide,
    useVersionHistory,
    useCurrentVersion
  };
}

export default usePresentationVersioning;
