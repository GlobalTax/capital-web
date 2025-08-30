export interface TeamMember {
  id: string;
  name: string;
  position: string | null;
  bio: string | null;
  image_url: string | null;
  display_order: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}