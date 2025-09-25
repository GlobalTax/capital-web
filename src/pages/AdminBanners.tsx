import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useBannersAdmin } from '@/hooks/useBannersAdmin';
import { BannersDataTable } from '@/components/admin/banners/BannersDataTable';
import { BannerFormModal } from '@/components/admin/banners/BannerFormModal';
import { Banner } from '@/hooks/useBannersAdmin';

const AdminBanners = () => {
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  
  const {
    banners,
    total,
    totalPages,
    isLoading,
    error,
    createBanner,
    updateBanner,
    toggleBanner,
    isCreating,
    isUpdating,
    isToggling
  } = useBannersAdmin(page, 20);

  const handleCreate = () => {
    setEditingBanner(null);
    setIsModalOpen(true);
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setIsModalOpen(true);
  };

  const handleDuplicate = (banner: Banner) => {
    const duplicatedBanner = {
      ...banner,
      name: `${banner.name} (Copy)`,
      slug: `${banner.slug}-copy-${Date.now()}`,
      visible: false,
    };
    setEditingBanner(duplicatedBanner as Banner);
    setIsModalOpen(true);
  };

  const handleSave = async (data: any) => {
    try {
      if (editingBanner?.id) {
        await updateBanner({ id: editingBanner.id, data });
      } else {
        await createBanner(data);
      }
      setIsModalOpen(false);
      setEditingBanner(null);
    } catch (error) {
      console.error('Error saving banner:', error);
    }
  };

  const handleToggleVisible = async (bannerId: string) => {
    try {
      await toggleBanner(bannerId);
    } catch (error) {
      console.error('Error toggling banner visibility:', error);
    }
  };

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-destructive">Error loading banners: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Banner Management</h1>
          <p className="text-muted-foreground">
            Manage site-wide banners and notifications
          </p>
        </div>
        <Button onClick={handleCreate} disabled={isCreating}>
          <Plus className="w-4 h-4 mr-2" />
          New Banner
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-lg border p-4">
          <div className="text-2xl font-bold">{total}</div>
          <p className="text-sm text-muted-foreground">Total Banners</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="text-2xl font-bold">
            {banners.filter(b => b.visible).length}
          </div>
          <p className="text-sm text-muted-foreground">Active Banners</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="text-2xl font-bold">{totalPages}</div>
          <p className="text-sm text-muted-foreground">Total Pages</p>
        </div>
      </div>

      {/* Data Table */}
      <BannersDataTable
        banners={banners}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDuplicate={handleDuplicate}
        onToggleVisible={handleToggleVisible}
        isToggling={isToggling}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      {/* Modal */}
      <BannerFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBanner(null);
        }}
        onSave={handleSave}
        banner={editingBanner}
        isLoading={isCreating || isUpdating}
      />
    </div>
  );
};

export default AdminBanners;