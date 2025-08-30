import React from 'react';
import EnhancedBlogEditor from './blog/EnhancedBlogEditor';
import { BlogPost } from '@/types/blog';

interface ModernBlogEditorProps {
  post?: BlogPost | null;
  onClose: () => void;
  onSave: () => void;
}

const ModernBlogEditor: React.FC<ModernBlogEditorProps> = ({ post, onClose, onSave }) => {
  return (
    <EnhancedBlogEditor 
      post={post} 
      onClose={onClose} 
      onSave={onSave} 
    />
  );
};

export default ModernBlogEditor;