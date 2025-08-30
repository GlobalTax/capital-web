import React, { useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Label } from '@/components/ui/label';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  className?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Escribe tu contenido aquí...",
  label,
  error,
  className = ""
}) => {
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['blockquote', 'code-block'],
        ['link', 'image'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'align': [] }],
        ['clean']
      ],
    },
    clipboard: {
      matchVisual: false,
    }
  }), []);

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'blockquote', 'code-block',
    'link', 'image',
    'color', 'background',
    'align',
  ];

  return (
    <div className={className}>
      {label && (
        <Label className="text-sm font-medium mb-2 block">{label}</Label>
      )}
      <div className={`rich-text-editor ${error ? 'border-destructive' : ''}`}>
        <ReactQuill
          theme="snow"
          value={value}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          style={{
            backgroundColor: 'hsl(var(--background))',
            border: error ? '1px solid hsl(var(--destructive))' : '1px solid hsl(var(--border))',
            borderRadius: 'calc(var(--radius) - 2px)',
          }}
        />
      </div>
      {error && (
        <p className="text-sm text-destructive mt-1">{error}</p>
      )}
      
      <style>{`
        .rich-text-editor .ql-editor {
          min-height: 400px !important;
          font-size: 14px;
          line-height: 1.6;
        }
        
        .rich-text-editor .ql-toolbar {
          border-bottom: none !important;
          background: hsl(var(--muted)) !important;
        }
        
        .rich-text-editor .ql-container {
          border-top: none !important;
        }
        
        .rich-text-editor .ql-editor.ql-blank::before {
          color: hsl(var(--muted-foreground)) !important;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;