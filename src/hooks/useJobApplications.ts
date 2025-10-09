import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { JobApplication, JobApplicationFormData, JobApplicationActivity } from '@/types/jobs';

export const useJobApplications = (jobPostId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: applications, isLoading, error } = useQuery({
    queryKey: ['job-applications', jobPostId],
    queryFn: async (): Promise<JobApplication[]> => {
      let query = supabase
        .from('job_applications')
        .select(`
          *,
          job_post:job_posts(*)
        `)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (jobPostId) {
        query = query.eq('job_post_id', jobPostId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
  });

  const submitApplication = useMutation({
    mutationFn: async ({ 
      jobPostId, 
      formData, 
      cvFile 
    }: { 
      jobPostId: string; 
      formData: JobApplicationFormData;
      cvFile?: File;
    }) => {
      let cvUrl: string | undefined;

      // Upload CV if provided
      if (cvFile) {
        const fileName = `${Date.now()}-${cvFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('job-applications')
          .upload(`cvs/${fileName}`, cvFile);

        if (uploadError) throw uploadError;
        cvUrl = uploadData.path;
      }

      const { data, error } = await supabase
        .from('job_applications')
        .insert({
          job_post_id: jobPostId,
          ...formData,
          cv_url: cvUrl,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-applications'] });
      toast({
        title: "Solicitud enviada",
        description: "Tu solicitud se ha enviado correctamente. Te contactaremos pronto.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al enviar solicitud",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateApplicationStatus = useMutation({
    mutationFn: async ({ 
      id, 
      status, 
      notes 
    }: { 
      id: string; 
      status: string; 
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from('job_applications')
        .update({
          status,
          notes,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-applications'] });
      toast({
        title: "Estado actualizado",
        description: "El estado de la solicitud se ha actualizado correctamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al actualizar estado",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const rateApplication = useMutation({
    mutationFn: async ({ id, rating }: { id: string; rating: number }) => {
      const { data, error } = await supabase
        .from('job_applications')
        .update({ rating })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-applications'] });
      toast({
        title: "Valoración guardada",
        description: "La valoración se ha guardado correctamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al valorar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    applications,
    isLoading,
    error,
    submitApplication: submitApplication.mutate,
    updateApplicationStatus: updateApplicationStatus.mutate,
    rateApplication: rateApplication.mutate,
    isSubmitting: submitApplication.isPending,
    isUpdating: updateApplicationStatus.isPending,
    isRating: rateApplication.isPending,
  };
};

export const useJobApplication = (id: string) => {
  return useQuery({
    queryKey: ['job-application', id],
    queryFn: async (): Promise<JobApplication | null> => {
      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          *,
          job_post:job_posts(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};

export const useApplicationActivities = (applicationId: string) => {
  return useQuery({
    queryKey: ['job-application-activities', applicationId],
    queryFn: async (): Promise<JobApplicationActivity[]> => {
      const { data, error } = await supabase
        .from('job_application_activities')
        .select('*')
        .eq('application_id', applicationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!applicationId,
  });
};
