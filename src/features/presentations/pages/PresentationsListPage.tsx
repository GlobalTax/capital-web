import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePresentations, useDeletePresentation } from '../hooks/usePresentations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { CreatePresentationDialog } from '../components/CreatePresentationDialog';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit, 
  Eye, 
  Trash2, 
  Share2, 
  FileDown,
  Presentation,
  Clock,
  Lock
} from 'lucide-react';
import { format } from 'date-fns';
import { PRESENTATION_TYPE_LABELS, STATUS_LABELS, type PresentationStatus } from '../types/presentation.types';

const STATUS_COLORS: Record<PresentationStatus, string> = {
  draft: 'bg-gray-100 text-gray-700',
  review: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  published: 'bg-blue-100 text-blue-700',
  archived: 'bg-slate-100 text-slate-500',
};

export const PresentationsListPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: presentations, isLoading } = usePresentations();
  const deletePresentation = useDeletePresentation();

  const [searchQuery, setSearchQuery] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPresentationId, setSelectedPresentationId] = useState<string | null>(null);

  const filteredPresentations = presentations?.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.project_code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id: string) => {
    setSelectedPresentationId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedPresentationId) {
      deletePresentation.mutate(selectedPresentationId);
    }
    setDeleteDialogOpen(false);
    setSelectedPresentationId(null);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold flex items-center gap-2">
                <Presentation className="w-6 h-6" />
                Presentations
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Create and manage M&A teasers, decks, and client presentations
              </p>
            </div>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Presentation
            </Button>
          </div>

          {/* Search */}
          <div className="mt-4 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search presentations..."
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-6 py-8">
        {isLoading ? (
          <div className="text-center py-16 text-muted-foreground">
            Loading presentations...
          </div>
        ) : filteredPresentations?.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <Presentation className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No presentations yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first presentation to get started
              </p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Presentation
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredPresentations?.map((presentation) => (
              <Card 
                key={presentation.id} 
                className="group hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/admin/presentations/${presentation.id}/edit`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate flex items-center gap-2">
                        {presentation.is_confidential && (
                          <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        )}
                        {presentation.title}
                      </CardTitle>
                      {(presentation.client_name || presentation.project_code) && (
                        <CardDescription className="truncate">
                          {presentation.client_name}
                          {presentation.client_name && presentation.project_code && ' • '}
                          {presentation.project_code}
                        </CardDescription>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/admin/presentations/${presentation.id}/edit`);
                        }}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/admin/presentations/${presentation.id}/view`);
                        }}>
                          <Eye className="w-4 h-4 mr-2" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          // Open share dialog - handled by parent
                        }}>
                          <Share2 className="w-4 h-4 mr-2" />
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(presentation.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="text-xs">
                      {PRESENTATION_TYPE_LABELS[presentation.type]}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${STATUS_COLORS[presentation.status]}`}
                    >
                      {STATUS_LABELS[presentation.status]}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    Updated {format(new Date(presentation.updated_at), 'MMM d, yyyy')}
                  </div>
                  
                  {presentation.slides && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {presentation.slides.length} slides
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Create Dialog */}
      <CreatePresentationDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Presentation?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The presentation and all its slides will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PresentationsListPage;
