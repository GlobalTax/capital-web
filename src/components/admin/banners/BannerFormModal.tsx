import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, Eye, Palette } from 'lucide-react';
import { BannerFormSchema, defaultBannerValues, audienceOptions, pageOptions } from '@/schemas/bannerSchema';
import type { BannerFormData } from '@/schemas/bannerSchema';
import { Banner } from '@/hooks/useBannersAdmin';
import { UniversalBanner } from '@/components/ui/universal-banner';
import { ColorPicker } from '@/components/admin/banners/ColorPicker';
import { MultiSelect } from '@/components/admin/banners/MultiSelect';

interface BannerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: BannerFormData) => void;
  banner?: Banner | null;
  isLoading: boolean;
}

export const BannerFormModal: React.FC<BannerFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  banner,
  isLoading,
}) => {
  const [previewVisible, setPreviewVisible] = useState(true);
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<BannerFormData>({
    resolver: zodResolver(BannerFormSchema),
    defaultValues: defaultBannerValues,
  });

  const watchedValues = watch();

  // Reset form when modal opens/closes or banner changes
  useEffect(() => {
    if (isOpen) {
      if (banner) {
        // Edit mode - populate with banner data
        reset({
          name: banner.name,
          slug: banner.slug,
          title: banner.title,
          subtitle: banner.subtitle || '',
          cta_text: banner.cta_text || '',
          cta_href: banner.cta_href || '',
          variant: banner.variant,
          color_primary: banner.color_primary,
          color_secondary: banner.color_secondary || '',
          text_on_primary: banner.text_on_primary || '#ffffff',
          position: banner.position,
          dismissible: banner.dismissible,
          rounded: banner.rounded,
          shadow: banner.shadow,
          align: banner.align,
          max_width: banner.max_width,
          visible: banner.visible,
          audience: banner.audience,
          pages: banner.pages,
          start_at: banner.start_at ? new Date(banner.start_at).toISOString().slice(0, 16) : '',
          end_at: banner.end_at ? new Date(banner.end_at).toISOString().slice(0, 16) : '',
          priority: banner.priority,
        });
      } else {
        // Create mode - use defaults
        reset(defaultBannerValues);
      }
    }
  }, [isOpen, banner, reset]);

  const onSubmit = (data: BannerFormData) => {
    // Convert datetime-local strings to ISO strings
    const formattedData = {
      ...data,
      start_at: data.start_at ? new Date(data.start_at).toISOString() : null,
      end_at: data.end_at ? new Date(data.end_at).toISOString() : null,
    };
    
    onSave(formattedData);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setValue('name', name);
    
    // Auto-generate slug if creating new banner
    if (!banner) {
      setValue('slug', generateSlug(name));
    }
  };

  // Transform form data for preview
  const previewData = {
    id: banner?.id || 'preview',
    title: watchedValues.title,
    subtitle: watchedValues.subtitle,
    ctaText: watchedValues.cta_text,
    ctaHref: watchedValues.cta_href,
    variant: watchedValues.variant,
    colorScheme: {
      primary: watchedValues.color_primary,
      secondary: watchedValues.color_secondary,
      textOnPrimary: watchedValues.text_on_primary,
    },
    position: watchedValues.position,
    dismissible: watchedValues.dismissible,
    rounded: watchedValues.rounded as "none" | "md" | "xl" | "2xl",
    shadow: watchedValues.shadow,
    align: watchedValues.align,
    maxWidth: watchedValues.max_width as "none" | "7xl",
    show: previewVisible,
    version: '1',
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {banner ? 'Edit Banner' : 'Create New Banner'}
          </DialogTitle>
          <DialogDescription>
            Configure your banner settings and see a live preview
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form */}
          <div className="space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic">Basic</TabsTrigger>
                  <TabsTrigger value="design">Design</TabsTrigger>
                  <TabsTrigger value="targeting">Targeting</TabsTrigger>
                  <TabsTrigger value="schedule">Schedule</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        {...register('name')}
                        onChange={handleNameChange}
                        placeholder="Marketing Banner"
                      />
                      {errors.name && (
                        <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="slug">Slug *</Label>
                      <Input
                        id="slug"
                        {...register('slug')}
                        placeholder="marketing-banner"
                      />
                      {errors.slug && (
                        <p className="text-sm text-destructive mt-1">{errors.slug.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      {...register('title')}
                      placeholder="🎉 Special Offer!"
                    />
                    {errors.title && (
                      <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="subtitle">Subtitle</Label>
                    <Textarea
                      id="subtitle"
                      {...register('subtitle')}
                      placeholder="Get 20% off on all services this month"
                      rows={2}
                    />
                    {errors.subtitle && (
                      <p className="text-sm text-destructive mt-1">{errors.subtitle.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cta_text">CTA Text</Label>
                      <Input
                        id="cta_text"
                        {...register('cta_text')}
                        placeholder="Learn More"
                      />
                      {errors.cta_text && (
                        <p className="text-sm text-destructive mt-1">{errors.cta_text.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="cta_href">CTA URL</Label>
                      <Input
                        id="cta_href"
                        {...register('cta_href')}
                        placeholder="https://example.com"
                        type="url"
                      />
                      {errors.cta_href && (
                        <p className="text-sm text-destructive mt-1">{errors.cta_href.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Input
                      id="priority"
                      {...register('priority', { valueAsNumber: true })}
                      type="number"
                      min="0"
                      max="100"
                      placeholder="0"
                    />
                    {errors.priority && (
                      <p className="text-sm text-destructive mt-1">{errors.priority.message}</p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="design" className="space-y-4">
                  <div>
                    <Label htmlFor="variant">Variant</Label>
                    <Select
                      value={watchedValues.variant}
                      onValueChange={(value) => setValue('variant', value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="solid">Solid</SelectItem>
                        <SelectItem value="gradient">Gradient</SelectItem>
                        <SelectItem value="soft">Soft</SelectItem>
                        <SelectItem value="outline">Outline</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Primary Color</Label>
                      <ColorPicker
                        value={watchedValues.color_primary}
                        onChange={(color) => setValue('color_primary', color)}
                      />
                      {errors.color_primary && (
                        <p className="text-sm text-destructive mt-1">{errors.color_primary.message}</p>
                      )}
                    </div>
                    
                    {watchedValues.variant === 'gradient' && (
                      <div>
                        <Label>Secondary Color</Label>
                        <ColorPicker
                          value={watchedValues.color_secondary || '#6366f1'}
                          onChange={(color) => setValue('color_secondary', color)}
                        />
                        {errors.color_secondary && (
                          <p className="text-sm text-destructive mt-1">{errors.color_secondary.message}</p>
                        )}
                      </div>
                    )}
                    
                    <div>
                      <Label>Text Color</Label>
                      <ColorPicker
                        value={watchedValues.text_on_primary}
                        onChange={(color) => setValue('text_on_primary', color)}
                      />
                      {errors.text_on_primary && (
                        <p className="text-sm text-destructive mt-1">{errors.text_on_primary.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="position">Position</Label>
                      <Select
                        value={watchedValues.position}
                        onValueChange={(value) => setValue('position', value as any)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="top">Top</SelectItem>
                          <SelectItem value="bottom">Bottom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="align">Alignment</Label>
                      <Select
                        value={watchedValues.align}
                        onValueChange={(value) => setValue('align', value as any)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="left">Left</SelectItem>
                          <SelectItem value="center">Center</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="shadow"
                        checked={watchedValues.shadow}
                        onCheckedChange={(checked) => setValue('shadow', checked)}
                      />
                      <Label htmlFor="shadow">Shadow</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="dismissible"
                        checked={watchedValues.dismissible}
                        onCheckedChange={(checked) => setValue('dismissible', checked)}
                      />
                      <Label htmlFor="dismissible">Dismissible</Label>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="targeting" className="space-y-4">
                  <div>
                    <Label>Audience</Label>
                    <MultiSelect
                      options={audienceOptions}
                      value={watchedValues.audience}
                      onChange={(values) => setValue('audience', values)}
                      placeholder="Select audiences..."
                    />
                    {errors.audience && (
                      <p className="text-sm text-destructive mt-1">{errors.audience.message}</p>
                    )}
                  </div>

                  <div>
                    <Label>Pages</Label>
                    <MultiSelect
                      options={pageOptions}
                      value={watchedValues.pages}
                      onChange={(values) => setValue('pages', values)}
                      placeholder="Select pages..."
                    />
                    {errors.pages && (
                      <p className="text-sm text-destructive mt-1">{errors.pages.message}</p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="visible"
                      checked={watchedValues.visible}
                      onCheckedChange={(checked) => setValue('visible', checked)}
                    />
                    <Label htmlFor="visible">Visible</Label>
                  </div>
                </TabsContent>

                <TabsContent value="schedule" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start_at">Start Date & Time</Label>
                      <Input
                        id="start_at"
                        {...register('start_at')}
                        type="datetime-local"
                      />
                      {errors.start_at && (
                        <p className="text-sm text-destructive mt-1">{errors.start_at.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="end_at">End Date & Time</Label>
                      <Input
                        id="end_at"
                        {...register('end_at')}
                        type="datetime-local"
                      />
                      {errors.end_at && (
                        <p className="text-sm text-destructive mt-1">{errors.end_at.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong>Note:</strong> Leave dates empty for the banner to be always active.
                      The banner will only show during the specified time window if dates are set.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : (banner ? 'Update Banner' : 'Create Banner')}
                </Button>
              </div>
            </form>
          </div>

          {/* Preview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Live Preview
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPreviewVisible(!previewVisible)}
              >
                {previewVisible ? 'Hide' : 'Show'} Preview
              </Button>
            </div>
            
            <div className="border rounded-lg p-4 bg-background">
              {previewVisible && watchedValues.title && (
                <UniversalBanner
                  {...previewData}
                  onDismiss={() => setPreviewVisible(false)}
                />
              )}
              
              {!watchedValues.title && (
                <div className="text-center py-8 text-muted-foreground">
                  <Palette className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Enter a title to see the preview</p>
                </div>
              )}
            </div>
            
            <div className="text-xs text-muted-foreground">
              <p><strong>Tip:</strong> The preview updates in real-time as you modify the form fields.</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};