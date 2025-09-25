import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Edit2, 
  Copy, 
  Eye, 
  EyeOff, 
  ChevronLeft, 
  ChevronRight,
  Search,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';
import { Banner } from '@/hooks/useBannersAdmin';

interface BannersDataTableProps {
  banners: Banner[];
  isLoading: boolean;
  onEdit: (banner: Banner) => void;
  onDuplicate: (banner: Banner) => void;
  onToggleVisible: (bannerId: string) => void;
  isToggling: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const BannersDataTable: React.FC<BannersDataTableProps> = ({
  banners,
  isLoading,
  onEdit,
  onDuplicate,
  onToggleVisible,
  isToggling,
  page,
  totalPages,
  onPageChange,
}) => {
  const [filters, setFilters] = useState({
    search: '',
    visible: 'all',
    audience: 'all',
    pages: 'all',
  });

  const filteredBanners = banners.filter(banner => {
    // Search filter
    if (filters.search && !banner.name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    
    // Visible filter
    if (filters.visible !== 'all' && banner.visible.toString() !== filters.visible) {
      return false;
    }
    
    // Audience filter
    if (filters.audience !== 'all' && !banner.audience.includes(filters.audience)) {
      return false;
    }
    
    // Pages filter
    if (filters.pages !== 'all' && !banner.pages.includes(filters.pages)) {
      return false;
    }
    
    return true;
  });

  const getVariantBadge = (variant: string) => {
    const variantColors = {
      solid: 'bg-blue-500',
      gradient: 'bg-purple-500',
      soft: 'bg-green-500',
      outline: 'bg-gray-500',
    };
    
    return (
      <Badge 
        variant="secondary" 
        className={`text-white ${variantColors[variant as keyof typeof variantColors]}`}
      >
        {variant}
      </Badge>
    );
  };

  const formatTimeWindow = (startAt: string | null, endAt: string | null) => {
    if (!startAt && !endAt) return 'Always active';
    if (startAt && !endAt) return `From ${format(new Date(startAt), 'MMM dd, yyyy')}`;
    if (!startAt && endAt) return `Until ${format(new Date(endAt), 'MMM dd, yyyy')}`;
    return `${format(new Date(startAt!), 'MMM dd')} - ${format(new Date(endAt!), 'MMM dd')}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="bg-card rounded-lg border p-6">
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-card rounded-lg border p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search banners..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="pl-9"
            />
          </div>
          
          <Select
            value={filters.visible}
            onValueChange={(value) => setFilters(prev => ({ ...prev, visible: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Visibility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="true">Visible</SelectItem>
              <SelectItem value="false">Hidden</SelectItem>
            </SelectContent>
          </Select>
          
          <Select
            value={filters.audience}
            onValueChange={(value) => setFilters(prev => ({ ...prev, audience: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Audience" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Audiences</SelectItem>
              <SelectItem value="anon">Anonymous</SelectItem>
              <SelectItem value="auth">Authenticated</SelectItem>
              <SelectItem value="role:admin">Admins</SelectItem>
              <SelectItem value="role:manager">Managers</SelectItem>
            </SelectContent>
          </Select>
          
          <Select
            value={filters.pages}
            onValueChange={(value) => setFilters(prev => ({ ...prev, pages: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Pages</SelectItem>
              <SelectItem value="/">Home</SelectItem>
              <SelectItem value="/servicios">Services</SelectItem>
              <SelectItem value="landing:">Landing Pages</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Visible</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Pages</TableHead>
              <TableHead>Audience</TableHead>
              <TableHead>Variant</TableHead>
              <TableHead className="w-20">Priority</TableHead>
              <TableHead>Time Window</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="w-32">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBanners.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  {banners.length === 0 ? 'No banners found' : 'No banners match the current filters'}
                </TableCell>
              </TableRow>
            ) : (
              filteredBanners.map((banner) => (
                <TableRow key={banner.id}>
                  <TableCell>
                    <Switch
                      checked={banner.visible}
                      onCheckedChange={() => onToggleVisible(banner.id)}
                      disabled={isToggling}
                      className="data-[state=checked]:bg-green-500"
                    />
                  </TableCell>
                  
                  <TableCell>
                    <div>
                      <div className="font-medium">{banner.name}</div>
                      <div className="text-sm text-muted-foreground">{banner.slug}</div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {banner.pages.slice(0, 3).map((page, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {page === 'all' ? 'All' : page}
                        </Badge>
                      ))}
                      {banner.pages.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{banner.pages.length - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {banner.audience.slice(0, 2).map((aud, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {aud === 'all' ? 'All' : aud.replace('role:', '')}
                        </Badge>
                      ))}
                      {banner.audience.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{banner.audience.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    {getVariantBadge(banner.variant)}
                  </TableCell>
                  
                  <TableCell>
                    <Badge variant="outline">{banner.priority}</Badge>
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-sm">
                      {formatTimeWindow(banner.start_at, banner.end_at)}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(banner.updated_at), 'MMM dd, yyyy')}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(banner)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDuplicate(banner)}
                        className="h-8 w-8 p-0"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannersDataTable;