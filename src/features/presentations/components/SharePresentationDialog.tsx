import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  useCreateSharingLink, 
  useSharingLinks, 
  useDeleteSharingLink 
} from '../hooks/usePresentations';
import type { SharePermission } from '../types/presentation.types';
import { Copy, Link, Trash2, ExternalLink, Check } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface SharePresentationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectTitle: string;
}

export const SharePresentationDialog: React.FC<SharePresentationDialogProps> = ({
  open,
  onOpenChange,
  projectId,
  projectTitle,
}) => {
  const { data: links, isLoading } = useSharingLinks(projectId);
  const createLink = useCreateSharingLink();
  const deleteLink = useDeleteSharingLink();

  const [permission, setPermission] = useState<SharePermission>('view');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [hasExpiration, setHasExpiration] = useState(false);
  const [expirationDays, setExpirationDays] = useState('7');
  const [hasMaxViews, setHasMaxViews] = useState(false);
  const [maxViews, setMaxViews] = useState('10');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const getShareUrl = (token: string) => {
    return `${window.location.origin}/p/${token}`;
  };

  const handleCreateLink = async () => {
    const expiresAt = hasExpiration 
      ? new Date(Date.now() + parseInt(expirationDays) * 24 * 60 * 60 * 1000).toISOString()
      : undefined;

    await createLink.mutateAsync({
      project_id: projectId,
      permission,
      recipient_email: recipientEmail.trim() || undefined,
      recipient_name: recipientName.trim() || undefined,
      expires_at: expiresAt,
      max_views: hasMaxViews ? parseInt(maxViews) : undefined,
    });

    // Reset form
    setRecipientEmail('');
    setRecipientName('');
  };

  const handleCopyLink = (token: string, id: string) => {
    navigator.clipboard.writeText(getShareUrl(token));
    setCopiedId(id);
    toast.success('Link copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteLink = (id: string) => {
    deleteLink.mutate({ id, projectId });
  };

  const permissionLabels: Record<SharePermission, string> = {
    view: 'View Only',
    download_pdf: 'View + Download PDF',
    edit: 'Full Edit Access',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Share Presentation</DialogTitle>
          <DialogDescription>
            Create secure links to share "{projectTitle}" with external parties.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 py-4">
          {/* Create New Link */}
          <div className="space-y-4 p-4 rounded-lg border bg-muted/30">
            <h4 className="font-medium flex items-center gap-2">
              <Link className="w-4 h-4" />
              Create New Link
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Recipient Name</Label>
                <Input
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="e.g., John Smith"
                />
              </div>
              <div className="space-y-2">
                <Label>Recipient Email</Label>
                <Input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="john@company.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Permission Level</Label>
              <Select value={permission} onValueChange={(v) => setPermission(v as SharePermission)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">View Only</SelectItem>
                  <SelectItem value="download_pdf">View + Download PDF</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={hasExpiration}
                  onCheckedChange={setHasExpiration}
                  id="expiration"
                />
                <Label htmlFor="expiration" className="cursor-pointer">
                  Expires in
                </Label>
                {hasExpiration && (
                  <Select value={expirationDays} onValueChange={setExpirationDays}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 day</SelectItem>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="14">14 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={hasMaxViews}
                  onCheckedChange={setHasMaxViews}
                  id="maxViews"
                />
                <Label htmlFor="maxViews" className="cursor-pointer">
                  Max views
                </Label>
                {hasMaxViews && (
                  <Input
                    type="number"
                    value={maxViews}
                    onChange={(e) => setMaxViews(e.target.value)}
                    className="w-20"
                    min="1"
                  />
                )}
              </div>
            </div>

            <Button 
              onClick={handleCreateLink} 
              disabled={createLink.isPending}
              className="w-full"
            >
              {createLink.isPending ? 'Creating...' : 'Create Share Link'}
            </Button>
          </div>

          <Separator />

          {/* Existing Links */}
          <div className="space-y-3">
            <h4 className="font-medium">Active Links ({links?.filter(l => l.is_active).length || 0})</h4>
            
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : links?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No sharing links yet. Create one above.
              </div>
            ) : (
              <div className="space-y-2">
                {links?.map((link) => (
                  <div 
                    key={link.id} 
                    className={`p-3 rounded-lg border ${link.is_active ? 'bg-background' : 'bg-muted/50 opacity-60'}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {link.recipient_name && (
                            <span className="font-medium">{link.recipient_name}</span>
                          )}
                          {link.recipient_email && (
                            <span className="text-sm text-muted-foreground">
                              ({link.recipient_email})
                            </span>
                          )}
                          {!link.recipient_name && !link.recipient_email && (
                            <span className="text-muted-foreground">Anonymous link</span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            {permissionLabels[link.permission]}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Views: {link.view_count}{link.max_views ? `/${link.max_views}` : ''}
                          </span>
                          {link.expires_at && (
                            <span className="text-xs text-muted-foreground">
                              Expires: {format(new Date(link.expires_at), 'MMM d, yyyy')}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCopyLink(link.token, link.id)}
                          title="Copy link"
                        >
                          {copiedId === link.id ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => window.open(getShareUrl(link.token), '_blank')}
                          title="Open in new tab"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteLink(link.id)}
                          title="Delete link"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SharePresentationDialog;
